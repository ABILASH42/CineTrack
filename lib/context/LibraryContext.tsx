'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserMovieLog, Collection, WatchStatus, Movie } from '@/types/movie';
import { supabase } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

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

      if (movies) setUserMovies(movies);

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
      const m = localStorage.getItem(LOCAL_STORAGE_MOVIES);
      const c = localStorage.getItem(LOCAL_STORAGE_COLLECTIONS);
      if (m) setUserMovies(JSON.parse(m));
      else setUserMovies([]);
      if (c) setCollections(JSON.parse(c));
      else setCollections([]);
    } catch (e) {
      console.error('LocalStorage parse error', e);
    }
  };

  const addOrUpdateMovieStatus = async (movie: Movie, status: WatchStatus, rating?: number, review?: string) => {
    const existing = userMovies.find((m) => m.tmdb_id === movie.id);
    const now = new Date().toISOString();

    const payload = {
      tmdb_id: movie.id,
      title: movie.title,
      poster_path: movie.poster_path,
      release_date: movie.release_date,
      runtime: movie.runtime || 120,
      status,
      rating: rating !== undefined ? rating : (existing?.rating ?? null),
      review: review !== undefined ? review : (existing?.review ?? null),
      updated_at: now
    };

    if (user) {
      const { data, error } = await supabase
        .from('user_movies')
        .upsert({ ...payload, user_id: user.id }, { onConflict: 'user_id,tmdb_id' })
        .select()
        .single();

      if (error) {
        console.error('Error updating watchlist in Supabase:', error);
      }
      
      const newLog: UserMovieLog = data || {
        id: existing?.id || `db-${Date.now()}`,
        user_id: user.id,
        ...payload,
        created_at: existing?.created_at || now,
      };

      const filtered = userMovies.filter((m) => m.tmdb_id !== movie.id);
      setUserMovies([newLog, ...filtered]);
    } else {
      // Guest mode
      const updatedLog: UserMovieLog = {
        id: `guest-${Date.now()}`,
        user_id: 'guest',
        ...payload,
        created_at: existing?.created_at || now,
      };
      const filtered = userMovies.filter((m) => m.tmdb_id !== movie.id);
      const nextList = [updatedLog, ...filtered];
      setUserMovies(nextList);
      localStorage.setItem(LOCAL_STORAGE_MOVIES, JSON.stringify(nextList));
    }
  };

  const removeMovieLog = async (tmdb_id: number) => {
    if (user) {
      await supabase.from('user_movies').delete().eq('user_id', user.id).eq('tmdb_id', tmdb_id);
    }
    const filtered = userMovies.filter((m) => m.tmdb_id !== tmdb_id);
    setUserMovies(filtered);
    if (!user) localStorage.setItem(LOCAL_STORAGE_MOVIES, JSON.stringify(filtered));
  };

  const getMovieLog = (tmdb_id: number) => {
    return userMovies.find((m) => m.tmdb_id === tmdb_id);
  };

  const createCollection = async (name: string, description?: string): Promise<Collection | null> => {
    const now = new Date().toISOString();

    if (user) {
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
    } else {
      const newCol: Collection = {
        id: `guest-col-${Date.now()}`,
        user_id: 'guest',
        name,
        description: description || null,
        is_public: true,
        posters: [],
        created_at: now,
        updated_at: now
      };
      const updated = [newCol, ...collections];
      setCollections(updated);
      localStorage.setItem(LOCAL_STORAGE_COLLECTIONS, JSON.stringify(updated));
      return newCol;
    }
    return null;
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
