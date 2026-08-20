'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserMovieLog, Collection, WatchStatus, Movie } from '@/types/movie';
import { supabase } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { MOCK_MOVIES, fetchMovieDetails } from '@/lib/tmdb';

export interface UserProfile {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
}

interface LibraryContextType {
  user: User | null;
  profile: UserProfile | null;
  loadingAuth: boolean;
  userMovies: UserMovieLog[];
  collections: Collection[];
  addOrUpdateMovieStatus: (movie: Movie, status: WatchStatus, rating?: number, review?: string) => Promise<void>;
  removeMovieLog: (tmdb_id: number) => Promise<void>;
  getMovieLog: (tmdb_id: number) => UserMovieLog | undefined;
  createCollection: (name: string, description?: string) => Promise<Collection | null>;
  addMovieToCollection: (collectionId: string, movie: Movie) => Promise<void>;
  getWatchStats: () => { totalWatched: number; totalMinutes: number; averageRating: number; planToWatchCount: number };
  signOut: () => Promise<void>;
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

const LOCAL_STORAGE_MOVIES = 'cinetrack_user_movies_guest';
const LOCAL_STORAGE_COLLECTIONS = 'cinetrack_collections_guest';

export function LibraryProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [userMovies, setUserMovies] = useState<UserMovieLog[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);

  // 1. Monitor Supabase Auth state changes
  useEffect(() => {
    async function getInitialSession() {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchUserProfile(session.user.id);
        await fetchUserDataFromSupabase(session.user.id);
      } else {
        loadGuestDataFromLocalStorage();
      }
      setLoadingAuth(false);
    }

    getInitialSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchUserProfile(session.user.id);
        await fetchUserDataFromSupabase(session.user.id);
      } else {
        setProfile(null);
        loadGuestDataFromLocalStorage();
      }
      setLoadingAuth(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      if (data) setProfile(data);
    } catch (e) {
      console.error('Failed to fetch profile', e);
    }
  };

  const ensureUserProfile = async (userId: string, email?: string) => {
    try {
      const { data } = await supabase.from('profiles').select('id').eq('id', userId).maybeSingle();
      if (!data) {
        const username = email ? email.split('@')[0] : `user_${Date.now()}`;
        const { data: newProf } = await supabase
          .from('profiles')
          .upsert({ id: userId, username, full_name: username }, { onConflict: 'id' })
          .select()
          .single();
        if (newProf) setProfile(newProf);
      }
    } catch (e) {
      console.error('Ensure profile failed:', e);
    }
  };

  const fetchUserDataFromSupabase = async (userId: string) => {
    try {
      // Fetch User Watchlist Movies
      const { data: movies } = await supabase
        .from('user_movies')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (movies) {
        const initialEnriched = movies.map((m) => {
          if (!m.vote_average) {
            const mock = MOCK_MOVIES.find((x) => x.id === m.tmdb_id);
            if (mock?.vote_average) {
              return { ...m, vote_average: mock.vote_average };
            }
          }
          return m;
        });
        setUserMovies(initialEnriched);
      }

      // Fetch User Collections (only own collections or public ones for current user)
      const { data: cols } = await supabase
        .from('collections')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (cols) setCollections(cols);
    } catch (e) {
      console.error('Failed to fetch data from Supabase', e);
    }
  };

  const loadGuestDataFromLocalStorage = () => {
    try {
      const savedMovies = localStorage.getItem(LOCAL_STORAGE_MOVIES);
      const savedCols = localStorage.getItem(LOCAL_STORAGE_COLLECTIONS);
      if (savedMovies) setUserMovies(JSON.parse(savedMovies));
      else setUserMovies([]);
      if (savedCols) setCollections(JSON.parse(savedCols));
      else setCollections([]);
    } catch (e) {
      console.error('Failed to load guest storage', e);
    }
  };

  const addOrUpdateMovieStatus = async (movie: Movie, status: WatchStatus, rating?: number, review?: string) => {
    const existing = userMovies.find((m) => m.tmdb_id === movie.id);
    const now = new Date().toISOString();
    const mockMatch = MOCK_MOVIES.find((m) => m.id === movie.id);

    const voteAvg = (typeof movie.vote_average === 'number' && movie.vote_average > 0)
      ? movie.vote_average
      : (existing?.vote_average || mockMatch?.vote_average || null);

    const payload = {
      tmdb_id: movie.id,
      title: movie.title,
      overview: movie.overview || existing?.overview || null,
      poster_path: movie.poster_path,
      release_date: movie.release_date || '',
      runtime: movie.runtime || 120,
      vote_average: voteAvg,
      status,
      rating: rating !== undefined ? rating : (existing?.rating ?? null),
      review: review !== undefined ? review : (existing?.review ?? null),
      updated_at: now
    };

    const optimisticLog: UserMovieLog = {
      id: existing?.id || `temp-${Date.now()}`,
      user_id: user?.id || 'guest',
      ...payload,
      created_at: existing?.created_at || now,
    };

    // 1. Optimistic Instant UI Update (0ms delay)
    setUserMovies((prev) => {
      const filtered = prev.filter((m) => m.tmdb_id !== movie.id);
      return [optimisticLog, ...filtered];
    });

    if (!user) {
      try {
        setUserMovies((latest) => {
          localStorage.setItem(LOCAL_STORAGE_MOVIES, JSON.stringify(latest));
          return latest;
        });
      } catch (e) {
        console.error('Failed to save to localStorage', e);
      }
      return;
    }

    // 2. Background DB Sync
    try {
      await ensureUserProfile(user.id, user.email);

      const dbPayload = {
        tmdb_id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
        release_date: movie.release_date || '',
        runtime: movie.runtime || 120,
        status,
        rating: rating !== undefined ? rating : (existing?.rating ?? null),
        review: review !== undefined ? review : (existing?.review ?? null),
        updated_at: now
      };

      const { data: existingRow } = await supabase
        .from('user_movies')
        .select('id')
        .eq('user_id', user.id)
        .eq('tmdb_id', movie.id)
        .maybeSingle();

      if (existingRow) {
        const { data, error } = await supabase
          .from('user_movies')
          .update(dbPayload)
          .eq('id', existingRow.id)
          .select()
          .single();

        if (error) {
          console.error('Supabase update user_movies error:', error.message || error.details || JSON.stringify(error));
        } else if (data) {
          setUserMovies((prev) =>
            prev.map((m) => (m.tmdb_id === movie.id ? { ...m, ...data, vote_average: voteAvg, overview: payload.overview } : m))
          );
        }
      } else {
        const { data, error } = await supabase
          .from('user_movies')
          .insert({ ...dbPayload, user_id: user.id })
          .select()
          .single();

        if (error) {
          console.error('Supabase insert user_movies error:', error.message || error.details || JSON.stringify(error));
        } else if (data) {
          setUserMovies((prev) =>
            prev.map((m) => (m.tmdb_id === movie.id ? { ...m, ...data, vote_average: voteAvg, overview: payload.overview } : m))
          );
        }
      }
    } catch (err) {
      console.error('Failed to sync movie status with Supabase:', err);
    }
  };

  const removeMovieLog = async (tmdb_id: number) => {
    // 1. Optimistic Instant UI Update
    setUserMovies((prev) => prev.filter((m) => m.tmdb_id !== tmdb_id));

    if (!user) {
      try {
        setUserMovies((latest) => {
          localStorage.setItem(LOCAL_STORAGE_MOVIES, JSON.stringify(latest));
          return latest;
        });
      } catch (e) {
        console.error('Failed to save to localStorage', e);
      }
      return;
    }

    // 2. Background DB Sync
    try {
      await supabase.from('user_movies').delete().eq('user_id', user.id).eq('tmdb_id', tmdb_id);
    } catch (e) {
      console.error('Failed to delete movie log in Supabase', e);
    }
  };

  const getMovieLog = (tmdb_id: number) => {
    return userMovies.find((m) => m.tmdb_id === tmdb_id);
  };

  const createCollection = async (name: string, description?: string): Promise<Collection | null> => {
    const tempCol: Collection = {
      id: `col-${Date.now()}`,
      user_id: user?.id || 'guest',
      name,
      description: description || null,
      is_public: false,
      posters: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // 1. Optimistic Instant UI Update
    setCollections((prev) => [tempCol, ...prev]);

    if (!user) {
      try {
        setCollections((latest) => {
          localStorage.setItem(LOCAL_STORAGE_COLLECTIONS, JSON.stringify(latest));
          return latest;
        });
      } catch (e) {}
      return tempCol;
    }

    // 2. Background DB Sync
    try {
      await ensureUserProfile(user.id, user.email);

      const { data, error } = await supabase
        .from('collections')
        .insert({
          user_id: user.id,
          name,
          description: description || null,
          is_public: false,
          posters: []
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase insert collections error:', error);
      } else if (data) {
        setCollections((prev) => prev.map((c) => (c.id === tempCol.id ? data : c)));
        return data;
      }
    } catch (e) {
      console.error('Error creating collection in Supabase:', e);
    }
    return tempCol;
  };

  const addMovieToCollection = async (collectionId: string, movie: Movie) => {
    const colIndex = collections.findIndex((c) => c.id === collectionId);
    if (colIndex === -1) return;

    const col = collections[colIndex];
    const posters = col.posters || [];
    if (movie.poster_path && !posters.includes(movie.poster_path)) {
      posters.unshift(movie.poster_path);
    }

    const nextPosters = posters.slice(0, 4);

    // 1. Optimistic Instant UI Update
    setCollections((prev) =>
      prev.map((c) => (c.id === collectionId ? { ...c, posters: nextPosters, updated_at: new Date().toISOString() } : c))
    );

    if (!user) {
      try {
        setCollections((latest) => {
          localStorage.setItem(LOCAL_STORAGE_COLLECTIONS, JSON.stringify(latest));
          return latest;
        });
      } catch (e) {}
      return;
    }

    // 2. Background DB Sync
    if (!collectionId.startsWith('col-')) {
      try {
        const { error } = await supabase
          .from('collections')
          .update({ posters: nextPosters, updated_at: new Date().toISOString() })
          .eq('id', collectionId);
        if (error) {
          console.error('Supabase update collection error:', error);
        }
      } catch (e) {
        console.error('Failed to update collection in Supabase', e);
      }
    }
  };

  const getWatchStats = () => {
    const watched = userMovies.filter((m) => m.status === 'completed');
    const totalWatched = watched.length;
    const totalMinutes = watched.reduce((acc, curr) => acc + (curr.runtime || 120), 0);
    const ratedMovies = watched.filter((m) => m.rating !== null && (m.rating || 0) > 0);
    const averageRating = ratedMovies.length
      ? Number((ratedMovies.reduce((acc, curr) => acc + (curr.rating || 0), 0) / ratedMovies.length).toFixed(1))
      : 0;
    const planToWatchCount = userMovies.filter((m) => m.status === 'plan_to_watch').length;

    return { totalWatched, totalMinutes, averageRating, planToWatchCount };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    loadGuestDataFromLocalStorage();
  };

  return (
    <LibraryContext.Provider
      value={{
        user,
        profile,
        loadingAuth,
        userMovies,
        collections,
        addOrUpdateMovieStatus,
        removeMovieLog,
        getMovieLog,
        createCollection,
        addMovieToCollection,
        getWatchStats,
        signOut,
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
}

export function useLibrary() {
  const context = useContext(LibraryContext);
  if (!context) {
    throw new Error('useLibrary must be used within a LibraryProvider');
  }
  return context;
}
