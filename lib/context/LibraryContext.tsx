'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserMovieLog, Collection, WatchStatus, Movie } from '@/types/movie';
import { MOCK_MOVIES } from '@/lib/tmdb';

interface LibraryContextType {
  userMovies: UserMovieLog[];
  collections: Collection[];
  addOrUpdateMovieStatus: (movie: Movie, status: WatchStatus, rating?: number, review?: string) => void;
  removeMovieLog: (tmdb_id: number) => void;
  getMovieLog: (tmdb_id: number) => UserMovieLog | undefined;
  createCollection: (name: string, description?: string) => Collection;
  addMovieToCollection: (collectionId: string, movie: Movie) => void;
  isMovieInCollection: (collectionId: string, tmdb_id: number) => boolean;
  getWatchStats: () => { totalWatched: number; totalMinutes: number; averageRating: number; planToWatchCount: number };
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

const STORAGE_KEY_MOVIES = 'cinetrack_user_movies_v1';
const STORAGE_KEY_COLLECTIONS = 'cinetrack_collections_v1';

const INITIAL_COLLECTIONS: Collection[] = [
  {
    id: 'col-1',
    user_id: 'local-user',
    name: '🔥 Mind-Bending Masterpieces',
    description: 'Psychological thrillers and sci-fi brain melters that require multiple viewings.',
    is_public: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    posters: [
      '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
      '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
      '/oYuLEW9WAFUh1A29agkq9BGDyGl.jpg'
    ]
  },
  {
    id: 'col-2',
    user_id: 'local-user',
    name: '🍿 Cozy Weekend Binge',
    description: 'Comfort films for rainy Sundays and late night watch sessions with popcorn.',
    is_public: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    posters: [
      '/39wmItEPh1JuOVccExaADejEwJ.jpg',
      '/qJ2tW6WMUDux911r6m7haRef0WH.jpg'
    ]
  }
];

const INITIAL_LOGS: UserMovieLog[] = [
  {
    id: 'log-1',
    user_id: 'local-user',
    tmdb_id: 550,
    title: 'Fight Club',
    poster_path: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
    release_date: '1999-10-15',
    runtime: 139,
    status: 'completed',
    rating: 9.5,
    review: 'Absolute cinema. Fincher’s directing combined with Pitt & Norton is iconic.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'log-2',
    user_id: 'local-user',
    tmdb_id: 157336,
    title: 'Interstellar',
    poster_path: '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    release_date: '2014-11-05',
    runtime: 169,
    status: 'completed',
    rating: 10,
    review: 'Hans Zimmer score paired with Nolan’s visuals left me speechless.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'log-3',
    user_id: 'local-user',
    tmdb_id: 27205,
    title: 'Inception',
    poster_path: '/oYuLEW9WAFUh1A29agkq9BGDyGl.jpg',
    release_date: '2010-07-15',
    runtime: 148,
    status: 'plan_to_watch',
    rating: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export function LibraryProvider({ children }: { children: React.ReactNode }) {
  const [userMovies, setUserMovies] = useState<UserMovieLog[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const savedMovies = localStorage.getItem(STORAGE_KEY_MOVIES);
      const savedCols = localStorage.getItem(STORAGE_KEY_COLLECTIONS);

      if (savedMovies) {
        setUserMovies(JSON.parse(savedMovies));
      } else {
        setUserMovies(INITIAL_LOGS);
        localStorage.setItem(STORAGE_KEY_MOVIES, JSON.stringify(INITIAL_LOGS));
      }

      if (savedCols) {
        setCollections(JSON.parse(savedCols));
      } else {
        setCollections(INITIAL_COLLECTIONS);
        localStorage.setItem(STORAGE_KEY_COLLECTIONS, JSON.stringify(INITIAL_COLLECTIONS));
      }
    } catch (e) {
      console.error('Failed to load library state', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const saveMoviesState = (movies: UserMovieLog[]) => {
    setUserMovies(movies);
    try {
      localStorage.setItem(STORAGE_KEY_MOVIES, JSON.stringify(movies));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  };

  const saveCollectionsState = (cols: Collection[]) => {
    setCollections(cols);
    try {
      localStorage.setItem(STORAGE_KEY_COLLECTIONS, JSON.stringify(cols));
    } catch (e) {
      console.error('Failed to save collections', e);
    }
  };

  const addOrUpdateMovieStatus = (movie: Movie, status: WatchStatus, rating?: number, review?: string) => {
    const existingIndex = userMovies.findIndex((m) => m.tmdb_id === movie.id);
    const now = new Date().toISOString();

    if (existingIndex > -1) {
      const updated = [...userMovies];
      updated[existingIndex] = {
        ...updated[existingIndex],
        status,
        rating: rating !== undefined ? rating : updated[existingIndex].rating,
        review: review !== undefined ? review : updated[existingIndex].review,
        updated_at: now,
      };
      saveMoviesState(updated);
    } else {
      const newLog: UserMovieLog = {
        id: `log-${Date.now()}`,
        user_id: 'local-user',
        tmdb_id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
        release_date: movie.release_date,
        runtime: movie.runtime || 120,
        status,
        rating: rating ?? null,
        review: review ?? null,
        created_at: now,
        updated_at: now,
      };
      saveMoviesState([newLog, ...userMovies]);
    }
  };

  const removeMovieLog = (tmdb_id: number) => {
    const filtered = userMovies.filter((m) => m.tmdb_id !== tmdb_id);
    saveMoviesState(filtered);
  };

  const getMovieLog = (tmdb_id: number) => {
    return userMovies.find((m) => m.tmdb_id === tmdb_id);
  };

  const createCollection = (name: string, description?: string) => {
    const newCol: Collection = {
      id: `col-${Date.now()}`,
      user_id: 'local-user',
      name,
      description: description || null,
      is_public: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      posters: []
    };
    const updated = [newCol, ...collections];
    saveCollectionsState(updated);
    return newCol;
  };

  const addMovieToCollection = (collectionId: string, movie: Movie) => {
    const colIndex = collections.findIndex((c) => c.id === collectionId);
    if (colIndex === -1) return;

    const col = collections[colIndex];
    const posters = col.posters || [];
    if (movie.poster_path && !posters.includes(movie.poster_path)) {
      posters.unshift(movie.poster_path);
    }

    const updated = [...collections];
    updated[colIndex] = {
      ...col,
      posters: posters.slice(0, 4),
      updated_at: new Date().toISOString()
    };
    saveCollectionsState(updated);
  };

  const isMovieInCollection = (collectionId: string, tmdb_id: number) => {
    const col = collections.find((c) => c.id === collectionId);
    if (!col || !col.posters) return false;
    return false; // Dynamic checking fallback
  };

  const getWatchStats = () => {
    const watched = userMovies.filter((m) => m.status === 'completed');
    const totalWatched = watched.length;
    const totalMinutes = watched.reduce((acc, curr) => acc + (curr.runtime || 120), 0);
    const ratedMovies = watched.filter((m) => m.rating !== null && m.rating > 0);
    const averageRating = ratedMovies.length
      ? Number((ratedMovies.reduce((acc, curr) => acc + (curr.rating || 0), 0) / ratedMovies.length).toFixed(1))
      : 0;
    const planToWatchCount = userMovies.filter((m) => m.status === 'plan_to_watch').length;

    return { totalWatched, totalMinutes, averageRating, planToWatchCount };
  };

  return (
    <LibraryContext.Provider
      value={{
        userMovies,
        collections,
        addOrUpdateMovieStatus,
        removeMovieLog,
        getMovieLog,
        createCollection,
        addMovieToCollection,
        isMovieInCollection,
        getWatchStats,
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
