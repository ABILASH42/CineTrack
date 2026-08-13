'use client';

import React, { useState, useEffect, useRef, useCallback, use } from 'react';
import Link from 'next/link';
import { Movie } from '@/types/movie';
import { fetchCategoryMoviesPaginated } from '@/lib/tmdb';
import { MovieCard } from '@/components/movies/MovieCard';
import { MovieModal } from '@/components/movies/MovieModal';
import { ArrowLeft, Flame, Trophy, Laugh, Heart, ShieldAlert, Rocket, Sparkles, Loader2 } from 'lucide-react';

const GENRE_MAP: Record<string, { title: string; subtitle: string; icon: React.ElementType; color: string }> = {
  trending: {
    title: 'Trending This Week',
    subtitle: 'Top trending movies around the world right now',
    icon: Flame,
    color: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
  },
  popular: {
    title: 'All-Time Fan Favorites',
    subtitle: 'Highest rated blockbusters and cult classics',
    icon: Trophy,
    color: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  },
  '35': {
    title: 'Comedy & Laughs',
    subtitle: 'Hilarious comedies and feel-good films',
    icon: Laugh,
    color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  },
  '10749': {
    title: 'Romance & Heartfelt Drama',
    subtitle: 'Captivating romantic stories and emotional journeys',
    icon: Heart,
    color: 'text-pink-400 bg-pink-400/10 border-pink-400/20',
  },
  '28': {
    title: 'Action & Thrillers',
    subtitle: 'High-octane blockbusters and suspenseful thrillers',
    icon: ShieldAlert,
    color: 'text-red-500 bg-red-500/10 border-red-500/20',
  },
  '878': {
    title: 'Sci-Fi & Cyberpunk',
    subtitle: 'Futuristic adventures, space, and tech thrillers',
    icon: Rocket,
    color: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20',
  },
};

export default function GenrePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const genreInfo = GENRE_MAP[id] || {
    title: 'Explore Movies',
    subtitle: 'Discover movies by category and genre',
    icon: Sparkles,
    color: 'text-rose-400 bg-rose-400/10 border-rose-400/20',
  };

  const Icon = genreInfo.icon;

  const [movies, setMovies] = useState<Movie[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalResults, setTotalResults] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);

  const observerTarget = useRef<HTMLDivElement>(null);

  // Initial Fetch Page 1
  useEffect(() => {
    async function loadFirstPage() {
      setLoading(true);
      const res = await fetchCategoryMoviesPaginated(id, 1);
      setMovies(res.results);
      setTotalPages(res.total_pages);
      setTotalResults(res.total_results || 0);
      setPage(1);
      setLoading(false);
    }
    loadFirstPage();
  }, [id]);

  // Load Next Page
  const loadNextPage = useCallback(async () => {
    if (loadingMore || page >= totalPages) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    const res = await fetchCategoryMoviesPaginated(id, nextPage);

    setMovies((prev) => {
      // Filter out duplicate movies
      const existingIds = new Set(prev.map((m) => m.id));
      const newItems = res.results.filter((m) => !existingIds.has(m.id));
      return [...prev, ...newItems];
    });

    setPage(nextPage);
    setTotalPages(res.total_pages);
    setLoadingMore(false);
  }, [id, page, totalPages, loadingMore]);

  // IntersectionObserver Infinite Scroll Hook
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
    <div className="min-h-screen pt-20 sm:pt-28 pb-28 sm:pb-20 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Top Header Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            href="/"
            className="p-2 sm:p-2.5 rounded-2xl bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white border border-white/10 transition-all active:scale-95 shrink-0"
            title="Back to Discover"
          >
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </Link>

          <div className="flex items-center gap-3">
            <div className={`p-2.5 sm:p-3 rounded-2xl border ${genreInfo.color}`}>
              <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div>
              <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
                {genreInfo.title}
              </h1>
              <p className="text-xs sm:text-sm font-medium text-slate-400 mt-0.5">{genreInfo.subtitle}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-900 border border-white/10 px-3.5 py-1.5 rounded-full text-xs font-bold text-slate-300">
          <span className="text-rose-400">{totalResults.toLocaleString()}</span> Movies
        </div>
      </div>

      {/* Movies Responsive Grid */}
      {loading ? (
        <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-6">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="aspect-[2/3] rounded-2xl bg-slate-900 animate-pulse border border-white/5" />
          ))}
        </div>
      ) : movies.length > 0 ? (
        <>
          <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-6">
            {movies.map((movie) => (
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
              <p className="text-xs font-semibold text-slate-500">You've reached the end of this list.</p>
            )}
          </div>
        </>
      ) : (
        <div className="py-20 text-center space-y-3">
          <p className="text-base font-bold text-slate-400">No movies found in this category.</p>
        </div>
      )}

      {/* Movie Modal */}
      <MovieModal
        movieId={selectedMovieId}
        onClose={() => setSelectedMovieId(null)}
      />
    </div>
  );
}
