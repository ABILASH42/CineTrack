'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Movie } from '@/types/movie';
import { fetchTrendingMovies, fetchPopularMovies } from '@/lib/tmdb';
import { MovieCard } from '@/components/movies/MovieCard';
import { MovieModal } from '@/components/movies/MovieModal';
import { Sparkles, Flame, Trophy, Play, Star, Plus, Film, Trash2, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { getTMDBImageUrl } from '@/lib/tmdb';
import { useLibrary } from '@/lib/context/LibraryContext';

export default function HomePage() {
  const [trending, setTrending] = useState<Movie[]>([]);
  const [popular, setPopular] = useState<Movie[]>([]);
  const [heroIndex, setHeroIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const { addOrUpdateMovieStatus, removeMovieLog, getMovieLog } = useLibrary();

  useEffect(() => {
    async function loadData() {
      const [trendData, popData] = await Promise.all([
        fetchTrendingMovies(),
        fetchPopularMovies(),
      ]);
      setTrending(trendData);
      setPopular(popData);
      setLoading(false);
    }
    loadData();
  }, []);

  const topHeroMovies = trending.slice(0, 5);
  const heroMovie = topHeroMovies[heroIndex] || (trending[0] ?? null);

  useEffect(() => {
    if (topHeroMovies.length <= 1 || isPaused) return;
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % topHeroMovies.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [topHeroMovies.length, isPaused]);

  const handlePrevSlide = () => {
    if (topHeroMovies.length === 0) return;
    setHeroIndex((prev) => (prev === 0 ? topHeroMovies.length - 1 : prev - 1));
  };

  const handleNextSlide = () => {
    if (topHeroMovies.length === 0) return;
    setHeroIndex((prev) => (prev + 1) % topHeroMovies.length);
  };

  const heroLog = heroMovie ? getMovieLog(heroMovie.id) : undefined;

  const handleHeroWatchlistToggle = () => {
    if (!heroMovie) return;
    if (heroLog?.status) {
      removeMovieLog(heroMovie.id);
    } else {
      addOrUpdateMovieStatus(heroMovie, 'plan_to_watch');
    }
  };

  return (
    <div className="min-h-screen pb-28 sm:pb-20">
      {/* Hero Showcase Carousel */}
      {heroMovie && (
        <section
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="relative w-full min-h-[440px] sm:min-h-[520px] lg:h-[82vh] flex items-end overflow-hidden bg-slate-950 group/hero"
        >
          {/* Backdrop Image with Key Fade Transition */}
          <Image
            key={heroMovie.id}
            src={getTMDBImageUrl(heroMovie.backdrop_path || heroMovie.poster_path, 'original')}
            alt={heroMovie.title}
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-75 sm:opacity-85 scale-105 filter brightness-100 transition-opacity duration-700 animate-fadeIn"
          />

          {/* Vignette Gradients for Legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent md:w-3/4 lg:w-2/3" />

          {/* Hero Content Overlay */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:pb-16 w-full flex items-end justify-between gap-8">
            <div key={heroMovie.id} className="max-w-2xl space-y-3 sm:space-y-4 animate-fadeIn">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 text-[10px] sm:text-xs font-bold tracking-wider uppercase backdrop-blur-md shadow-md">
                <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-rose-400" /> Featured Spotlight #{heroIndex + 1}
              </div>

              <h1 className="text-2xl xs:text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight sm:leading-none drop-shadow-xl">
                {heroMovie.title}
              </h1>

              <div className="flex items-center gap-3 text-xs font-bold text-slate-300">
                <span className="flex items-center gap-1 text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-md border border-amber-400/20 backdrop-blur-md">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  {heroMovie.vote_average?.toFixed(1)} / 10
                </span>
                <span>{heroMovie.release_date ? heroMovie.release_date.split('-')[0] : ''}</span>
              </div>

              <p className="text-xs sm:text-base text-slate-300 line-clamp-2 sm:line-clamp-3 leading-relaxed drop-shadow-md max-w-xl">
                {heroMovie.overview}
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <button
                  onClick={() => setSelectedMovieId(heroMovie.id)}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-rose-600/30 active:scale-95 transition-all shrink-0"
                >
                  <Play className="w-4 h-4 fill-white" /> View Details & Trailer
                </button>

                <button
                  onClick={handleHeroWatchlistToggle}
                  className={`group/watchbtn w-[160px] sm:w-[170px] py-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 backdrop-blur-md active:scale-95 transition-all shrink-0 ${
                    heroLog?.status
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-rose-600 hover:text-white hover:border-rose-500 shadow-md'
                      : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
                  }`}
                >
                  {heroLog?.status ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400 group-hover/watchbtn:hidden" />
                      <Trash2 className="w-4 h-4 text-white hidden group-hover/watchbtn:inline-block" />
                      <span className="group-hover/watchbtn:hidden">In Watchlist</span>
                      <span className="hidden group-hover/watchbtn:inline">Remove</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 text-rose-400" />
                      <span>Add to Watchlist</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Crunchyroll-style Bottom Slider Navigation Bar */}
          {topHeroMovies.length > 1 && (
            <div className="absolute bottom-3 right-4 sm:bottom-6 sm:right-6 z-20 flex items-center gap-1.5 sm:gap-2 bg-black/60 backdrop-blur-xl p-1.5 sm:p-2 rounded-2xl border border-white/10 shadow-2xl">
              <button
                onClick={handlePrevSlide}
                className="p-1.5 rounded-xl hover:bg-white/20 text-white transition-colors active:scale-95"
                title="Previous Featured Movie"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              <div className="flex items-center gap-1 sm:gap-1.5 px-1">
                {topHeroMovies.map((movie, idx) => (
                  <button
                    key={movie.id}
                    onClick={() => setHeroIndex(idx)}
                    className={`transition-all flex items-center justify-center rounded-xl w-7 h-7 sm:w-8 sm:h-8 text-[10px] sm:text-xs font-bold active:scale-95 ${
                      idx === heroIndex
                        ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/40 ring-1 ring-white/30'
                        : 'bg-white/10 hover:bg-white/20 text-slate-300'
                    }`}
                    title={movie.title}
                  >
                    0{idx + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={handleNextSlide}
                className="p-1.5 rounded-xl hover:bg-white/20 text-white transition-colors active:scale-95"
                title="Next Featured Movie"
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          )}
        </section>
      )}

      {/* Main Content Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 sm:mt-12 space-y-10 sm:space-y-14">
        
        {/* Section 1: Trending Now Grid */}
        <section className="space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-3 sm:pb-4">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="p-2 sm:p-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500">
                <Flame className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h2 className="text-lg sm:text-2xl font-extrabold text-white tracking-tight">
                  Trending This Week
                </h2>
                <p className="text-[11px] sm:text-xs text-slate-400">Most talked about movies right now</p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="aspect-[2/3] rounded-2xl bg-slate-900 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-6">
              {trending.slice(0, 10).map((movie) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  onSelect={(m) => setSelectedMovieId(m.id)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Section 2: Top Rated Classics & Popular */}
        <section className="space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-3 sm:pb-4">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="p-2 sm:p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
                <Trophy className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h2 className="text-lg sm:text-2xl font-extrabold text-white tracking-tight">
                  All-Time Fan Favorites
                </h2>
                <p className="text-[11px] sm:text-xs text-slate-400">Highest rated blockbusters & cult classics</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-6">
            {popular.slice(0, 10).map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onSelect={(m) => setSelectedMovieId(m.id)}
              />
            ))}
          </div>
        </section>
      </main>

      {/* Interactive Detail Modal */}
      <MovieModal
        movieId={selectedMovieId}
        onClose={() => setSelectedMovieId(null)}
      />
    </div>
  );
}
