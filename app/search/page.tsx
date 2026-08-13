'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search as SearchIcon, Film, Loader2 } from 'lucide-react';
import { Movie } from '@/types/movie';
import { searchMoviesPaginated, fetchCategoryMoviesPaginated } from '@/lib/tmdb';
import { MovieCard } from '@/components/movies/MovieCard';
import { MovieModal } from '@/components/movies/MovieModal';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Movie[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);

  const observerTarget = useRef<HTMLDivElement>(null);

  // Search or Popular Recommendations initial fetch (page 1)
  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      setPage(1);

      if (!query.trim()) {
        const res = await fetchCategoryMoviesPaginated('popular', 1);
        setResults(res.results);
        setTotalPages(res.total_pages);
      } else {
        const res = await searchMoviesPaginated(query, 1);
        setResults(res.results);
        setTotalPages(res.total_pages);
      }

      setLoading(false);
    }, query.trim() ? 350 : 0);

    return () => clearTimeout(timer);
  }, [query]);

  // Load Next Page for Infinite Scroll
  const loadNextPage = useCallback(async () => {
    if (loadingMore || page >= totalPages) return;
    setLoadingMore(true);
    const nextPage = page + 1;

    let res: { results: Movie[]; total_pages: number };
    if (!query.trim()) {
      res = await fetchCategoryMoviesPaginated('popular', nextPage);
    } else {
      res = await searchMoviesPaginated(query, nextPage);
    }

    setResults((prev) => {
      const existingIds = new Set(prev.map((m) => m.id));
      const newItems = res.results.filter((m) => !existingIds.has(m.id));
      return [...prev, ...newItems];
    });

    setPage(nextPage);
    setTotalPages(res.total_pages);
    setLoadingMore(false);
  }, [query, page, totalPages, loadingMore]);

  // IntersectionObserver for Infinite Scroll
  useEffect(() => {
    const target = observerTarget.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && !loadingMore && page < totalPages) {
          loadNextPage();
        }
      },
      { threshold: 0.2, rootMargin: '200px' }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [loadNextPage, loading, loadingMore, page, totalPages]);

  return (
    <div className="min-h-screen py-6 sm:py-10 pb-28 sm:pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
      
      {/* Header Banner */}
      <div className="space-y-2 sm:space-y-4 text-center max-w-2xl mx-auto">
        <h1 className="text-2xl xs:text-3xl sm:text-5xl font-black text-white tracking-tight">
          Explore & Search <span className="text-rose-500">Movies</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Find any film across thousands of titles. Add them directly to your collections or watchlists.
        </p>
      </div>

      {/* Search Input Bar */}
      <div className="max-w-3xl mx-auto relative">
        <div className="relative flex items-center">
          <SearchIcon className="absolute left-4 sm:left-5 w-5 h-5 sm:w-6 sm:h-6 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search title, director, genre (e.g. Interstellar)..."
            className="w-full pl-11 sm:pl-14 pr-10 sm:pr-12 py-3.5 sm:py-4 rounded-2xl sm:rounded-3xl bg-slate-900/90 border-2 border-white/10 text-slate-100 placeholder:text-slate-500 text-sm sm:text-base font-medium shadow-2xl focus:outline-none focus:border-rose-500/80 transition-all backdrop-blur-xl"
          />
          {loading && (
            <Loader2 className="absolute right-4 sm:right-5 w-4 h-4 sm:w-5 sm:h-5 text-rose-500 animate-spin" />
          )}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3 sm:pb-4 gap-2">
        <h2 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-2 truncate">
          <Film className="w-4 h-4 text-rose-500 shrink-0" />
          <span className="truncate">{query.trim() ? `Results for "${query}"` : 'Popular Recommendations'}</span>
        </h2>
        <span className="text-[11px] sm:text-xs font-semibold text-slate-500 shrink-0">
          {results.length} Titles Loaded (Page {page} of {totalPages})
        </span>
      </div>

      {/* Results Grid */}
      {loading ? (
        <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-6">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="aspect-[2/3] rounded-2xl bg-slate-900 animate-pulse border border-white/5" />
          ))}
        </div>
      ) : results.length > 0 ? (
        <>
          <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-6">
            {results.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onSelect={(m) => setSelectedMovieId(m.id)}
              />
            ))}
          </div>

          {/* Infinite Scroll Sentinel / Trigger Element */}
          <div ref={observerTarget} className="py-8 flex flex-col items-center justify-center gap-3">
            {loadingMore ? (
              <div className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-900 border border-white/10 text-rose-400 text-xs font-bold shadow-lg">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Loading page {page + 1}...</span>
              </div>
            ) : page < totalPages ? (
              <button
                onClick={loadNextPage}
                className="px-6 py-2.5 rounded-2xl bg-white/10 hover:bg-rose-600 text-slate-200 hover:text-white border border-white/15 text-xs font-bold transition-all shadow-md active:scale-95"
              >
                Load More Movies
              </button>
            ) : (
              <p className="text-xs font-semibold text-slate-500">You've reached the end of results.</p>
            )}
          </div>
        </>
      ) : (
        <div className="py-16 sm:py-20 flex flex-col items-center justify-center text-center space-y-3">
          <Film className="w-10 h-10 sm:w-12 sm:h-12 text-slate-700" />
          <p className="text-base sm:text-lg font-bold text-slate-300">No movies found matching "{query}"</p>
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
