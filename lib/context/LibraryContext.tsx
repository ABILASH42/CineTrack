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
        .single();
      if (data) setProfile(data);
    } catch (e) {
      console.error('Failed to fetch profile', e);
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

        // Background revalidation: fetch live details from TMDB to keep ratings fresh & updated
        if (initialEnriched.length > 0) {
          Promise.all(
            initialEnriched.map(async (m) => {
              try {
                const details = await fetchMovieDetails(m.tmdb_id);
                if (details) {
                  const latestVote = details.vote_average || m.vote_average || null;
                  const latestOverview = m.overview || details.overview || null;
                  if (latestVote !== m.vote_average || latestOverview !== m.overview) {
                    if (userId) {
                      await supabase
                        .from('user_movies')
                        .update({ vote_average: latestVote, overview: latestOverview })
                        .eq('user_id', userId)
                        .eq('tmdb_id', m.tmdb_id);
                    }
                    return { ...m, vote_average: latestVote, overview: latestOverview };
                  }
                }
              } catch (e) {
                // ignore error
              }
              return m;
            })
          ).then((revalidated) => {
            const map = new Map(revalidated.map((x) => [x.tmdb_id, x]));
            setUserMovies((prev) =>
              prev.map((item) => {
                const updated = map.get(item.tmdb_id);
                return updated ? { ...item, ...updated } : item;
              })
            );
          });
        }
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
    setUserMovies([]);
    setCollections([]);
    try {
      localStorage.removeItem(LOCAL_STORAGE_MOVIES);
      localStorage.removeItem(LOCAL_STORAGE_COLLECTIONS);
    } catch (e) {
      console.error('Failed to clear guest storage', e);
    }
  };

  const addOrUpdateMovieStatus = async (movie: Movie, status: WatchStatus, rating?: number, review?: string) => {
    if (!user) {
      window.location.href = `/login?message=${encodeURIComponent('Please sign in to add movies to your watchlist, rate films, or leave reviews.')}`;
      return;
    }

    const existing = userMovies.find((m) => m.tmdb_id === movie.id);
    const now = new Date().toISOString();
    const mockMatch = MOCK_MOVIES.find((m) => m.id === movie.id);

    let voteAvg = (typeof movie.vote_average === 'number' && movie.vote_average > 0)
      ? movie.vote_average
      : (existing?.vote_average || mockMatch?.vote_average || null);

    if (!voteAvg) {
      try {
        const details = await fetchMovieDetails(movie.id);
        if (details?.vote_average) {
          voteAvg = details.vote_average;
        }
      } catch (e) {
        // ignore
      }
    }

    const payload = {
      tmdb_id: movie.id,
      title: movie.title,
      overview: movie.overview || existing?.overview || null,
      poster_path: movie.poster_path,
      release_date: movie.release_date,
      runtime: movie.runtime || 120,
      vote_average: voteAvg,
      status,
      rating: rating !== undefined ? rating : (existing?.rating ?? null),
      review: review !== undefined ? review : (existing?.review ?? null),
      updated_at: now
    };

    let { data, error } = await supabase
      .from('user_movies')
      .upsert({ ...payload, user_id: user.id }, { onConflict: 'user_id,tmdb_id' })
      .select()
      .single();

    if (error) {
      // Fallback for Supabase tables missing newly added overview / vote_average columns
      const { tmdb_id, title, poster_path, release_date, runtime, status, rating, review, updated_at, overview } = payload;
      const fallbackPayload = { tmdb_id, title, poster_path, release_date, runtime, status, rating, review, updated_at, user_id: user.id };
      const res = await supabase
        .from('user_movies')
        .upsert({ ...fallbackPayload, vote_average: voteAvg, overview }, { onConflict: 'user_id,tmdb_id' })
        .select()
        .single();

      if (res.data) {
        data = res.data;
        error = null;
      } else if (res.error) {
        console.error('Error updating watchlist in Supabase:', res.error.message || res.error);
      }
    }

    const newLog: UserMovieLog = {
      id: data?.id || existing?.id || `db-${Date.now()}`,
      user_id: user.id,
      ...payload,
      ...(data || {}),
      created_at: existing?.created_at || now,
    };

    const filtered = userMovies.filter((m) => m.tmdb_id !== movie.id);
    setUserMovies([newLog, ...filtered]);
  };

  const removeMovieLog = async (tmdb_id: number) => {
    if (!user) {
      window.location.href = `/login?message=${encodeURIComponent('Please sign in to manage your watchlist.')}`;
      return;
    }
    await supabase.from('user_movies').delete().eq('user_id', user.id).eq('tmdb_id', tmdb_id);
    const filtered = userMovies.filter((m) => m.tmdb_id !== tmdb_id);
    setUserMovies(filtered);
  };

  const getMovieLog = (tmdb_id: number) => {
    return userMovies.find((m) => m.tmdb_id === tmdb_id);
  };

  const createCollection = async (name: string, description?: string): Promise<Collection | null> => {
    if (!user) {
      window.location.href = `/login?message=${encodeURIComponent('Please sign in to create custom collections.')}`;
      return null;
    }

    const { data, error } = await supabase
      .from('collections')
      .insert({
        user_id: user.id,
        name,
        description: description || null,
        is_public: true,
        posters: []
      })
      .select()
      .single();

    if (!error && data) {
      setCollections([data, ...collections]);
      return data;
    }
    return null;
  };

  const addMovieToCollection = async (collectionId: string, movie: Movie) => {
    if (!user) {
      window.location.href = `/login?message=${encodeURIComponent('Please sign in to add movies to collections.')}`;
      return;
    }

    const colIndex = collections.findIndex((c) => c.id === collectionId);
    if (colIndex === -1) return;

    const col = collections[colIndex];
    const posters = col.posters || [];
    if (movie.poster_path && !posters.includes(movie.poster_path)) {
      posters.unshift(movie.poster_path);
    }

    const nextPosters = posters.slice(0, 4);

    if (user && !collectionId.startsWith('guest')) {
      await supabase
        .from('collections')
        .update({ posters: nextPosters, updated_at: new Date().toISOString() })
        .eq('id', collectionId);
    }

    const updated = [...collections];
    updated[colIndex] = { ...col, posters: nextPosters, updated_at: new Date().toISOString() };
    setCollections(updated);
    if (!user) localStorage.setItem(LOCAL_STORAGE_COLLECTIONS, JSON.stringify(updated));
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
