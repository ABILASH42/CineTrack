'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search as SearchIcon, Film, Loader2 } from 'lucide-react';
import { Movie } from '@/types/movie';
import { searchMoviesPaginated, fetchCategoryMoviesPaginated } from '@/lib/tmdb';
import { MovieCard } from '@/components/movies/MovieCard';
import { MovieModal } from '@/components/movies/MovieModal';
import { CustomSelect } from '@/components/ui/CustomSelect';

const GENRES = [
  { id: 'all', name: 'All Genres' },
  { id: '28', name: 'Action' },
  { id: '35', name: 'Comedy' },
  { id: '10749', name: 'Romance' },
  { id: '878', name: 'Sci-Fi' },
  { id: '27', name: 'Horror' },
  { id: '18', name: 'Drama' },
  { id: '16', name: 'Animation' },
];

const SORT_OPTIONS = [
  { value: 'popularity', label: 'Sort: Most Popular' },
  { value: 'rating', label: 'Sort: Highest Rated' },
  { value: 'release', label: 'Sort: Newest Release' },
];

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [sortBy, setSortBy] = useState<'popularity' | 'rating' | 'release'>('popularity');
  
  const [results, setResults] = useState<Movie[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalResults, setTotalResults] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);

  const observerTarget = useRef<HTMLDivElement>(null);

  // Search or Popular / Genre Recommendations initial fetch (page 1)
  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      setPage(1);

      if (!query.trim()) {
        const categoryTarget = selectedGenre === 'all' ? 'popular' : selectedGenre;
        const res = await fetchCategoryMoviesPaginated(categoryTarget, 1);
        setResults(res.results);
        setTotalPages(res.total_pages);
        setTotalResults(res.total_results || 0);
      } else {
        const res = await searchMoviesPaginated(query, 1);
        let items = res.results;
        // Filter by genre if selected
        if (selectedGenre !== 'all') {
          const gId = parseInt(selectedGenre, 10);
          items = items.filter((m) => m.genre_ids?.includes(gId) || m.genres?.some((g) => g.id === gId));
        }
        setResults(items);
        setTotalPages(res.total_pages);
        setTotalResults(res.total_results || 0);
      }

      setLoading(false);
    }, query.trim() ? 350 : 0);

    return () => clearTimeout(timer);
  }, [query, selectedGenre]);

  // Load Next Page for Infinite Scroll
  const loadNextPage = useCallback(async () => {
    if (loadingMore || page >= totalPages) return;
    setLoadingMore(true);
    const nextPage = page + 1;

    let res: { results: Movie[]; total_pages: number; total_results: number };
    if (!query.trim()) {
      const categoryTarget = selectedGenre === 'all' ? 'popular' : selectedGenre;
      res = await fetchCategoryMoviesPaginated(categoryTarget, nextPage);
    } else {
      res = await searchMoviesPaginated(query, nextPage);
    }

    setResults((prev) => {
      const existingIds = new Set(prev.map((m) => m.id));
      let newItems = res.results.filter((m) => !existingIds.has(m.id));
      if (query.trim() && selectedGenre !== 'all') {
        const gId = parseInt(selectedGenre, 10);
        newItems = newItems.filter((m) => m.genre_ids?.includes(gId) || m.genres?.some((g) => g.id === gId));
      }
      return [...prev, ...newItems];
    });

    setPage(nextPage);
    setTotalPages(res.total_pages);
    setLoadingMore(false);
  }, [query, selectedGenre, page, totalPages, loadingMore]);

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

  // Apply Sort
  const sortedResults = [...results].sort((a, b) => {
    if (sortBy === 'rating') {
      return (b.vote_average || 0) - (a.vote_average || 0);
    } else if (sortBy === 'release') {
      return (b.release_date || '').localeCompare(a.release_date || '');
    }
    return (b.popularity || 0) - (a.popularity || 0);
  });

  return (
    <div className="min-h-screen py-6 sm:py-10 pb-28 sm:pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
      
      {/* Header Banner */}
      <div className="space-y-2 sm:space-y-4 text-center max-w-2xl mx-auto">
        <h1 className="text-2xl xs:text-3xl sm:text-5xl font-black text-white tracking-tight">
          Explore & Search <span className="text-rose-500">Movies</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Find any film across thousands of titles. Filter by genre, ratings, or popularity.
        </p>
      </div>

      {/* Search Input Bar */}
      <div className="max-w-3xl mx-auto space-y-3">
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

        {/* Filter Pills Bar & Custom Sort Selection */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
          {/* Genre Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar min-w-0 flex-1 w-full sm:w-auto">
            {GENRES.map((g) => (
              <button
                key={g.id}
                onClick={() => setSelectedGenre(g.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all active:scale-95 border ${
                  selectedGenre === g.id
                    ? 'bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-600/30'
                    : 'bg-slate-900/80 text-slate-300 border-white/10 hover:bg-white/10 hover:text-white'
                }`}
              >
                {g.name}
              </button>
            ))}
          </div>

          {/* Custom Sort Dropdown Selector */}
          <div className="shrink-0 self-end sm:self-auto">
            <CustomSelect
              value={sortBy}
              onChange={(val) => setSortBy(val as any)}
              options={SORT_OPTIONS}
            />
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3 sm:pb-4 gap-2">
        <h2 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-2 truncate">
          <Film className="w-4 h-4 text-rose-500 shrink-0" />
          <span className="truncate">
            {query.trim() ? `Results for "${query}"` : `${GENRES.find((g) => g.id === selectedGenre)?.name} Recommendations`}
          </span>
        </h2>
        <span className="text-[11px] sm:text-xs font-semibold text-slate-500 shrink-0">
          {totalResults.toLocaleString()} Titles
        </span>
      </div>

      {/* Results Grid */}
      {loading ? (
        <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-6">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="aspect-[2/3] rounded-2xl bg-slate-900 animate-pulse border border-white/5" />
          ))}
        </div>
      ) : sortedResults.length > 0 ? (
        <>
          <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-6">
            {sortedResults.map((movie) => (
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
