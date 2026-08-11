'use client';

import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, Filter, Film, Sparkles, Loader2 } from 'lucide-react';
import { Movie } from '@/types/movie';
import { searchMovies, fetchPopularMovies } from '@/lib/tmdb';
import { MovieCard } from '@/components/movies/MovieCard';
import { MovieModal } from '@/components/movies/MovieModal';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      fetchPopularMovies().then(setResults);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      const res = await searchMovies(query);
      setResults(res);
      setLoading(false);
    }, 350);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="min-h-screen py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      
      {/* Header Banner */}
      <div className="space-y-4 text-center max-w-2xl mx-auto">
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Explore & Search <span className="text-rose-500">Movies</span>
        </h1>
        <p className="text-sm text-slate-400">
          Find any film across thousands of titles. Add them directly to your collections or watchlists.
        </p>
      </div>

      {/* Search Input Bar */}
      <div className="max-w-3xl mx-auto relative">
        <div className="relative flex items-center">
          <SearchIcon className="absolute left-5 w-6 h-6 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, director, or genre (e.g. Interstellar, Nolan, Sci-Fi)..."
            className="w-full pl-14 pr-12 py-4 rounded-3xl bg-slate-900/90 border-2 border-white/10 text-slate-100 placeholder:text-slate-500 text-base font-medium shadow-2xl focus:outline-none focus:border-rose-500/80 transition-all backdrop-blur-xl"
          />
          {loading && (
            <Loader2 className="absolute right-5 w-5 h-5 text-rose-500 animate-spin" />
          )}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Film className="w-4 h-4 text-rose-500" />
          {query.trim() ? `Search Results for "${query}"` : 'Popular Recommendations'}
        </h2>
        <span className="text-xs font-semibold text-slate-500">
          {results.length} Titles Found
        </span>
      </div>

      {/* Results Grid */}
      {results.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {results.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              onSelect={(m) => setSelectedMovieId(m.id)}
            />
          ))}
        </div>
      ) : (
        <div className="py-20 flex flex-col items-center justify-center text-center space-y-3">
          <Film className="w-12 h-12 text-slate-700" />
          <p className="text-lg font-bold text-slate-300">No movies found matching "{query}"</p>
          <p className="text-xs text-slate-500">Try searching for keywords like "Batman", "Inception", or "Fight Club".</p>
        </div>
      )}

      {/* Interactive Detail Modal */}
      <MovieModal
        movieId={selectedMovieId}
        onClose={() => setSelectedMovieId(null)}
      />
    </div>
  );
}
