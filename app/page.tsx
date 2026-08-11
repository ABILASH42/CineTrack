'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Movie } from '@/types/movie';
import { fetchTrendingMovies, fetchPopularMovies } from '@/lib/tmdb';
import { MovieCard } from '@/components/movies/MovieCard';
import { MovieModal } from '@/components/movies/MovieModal';
import { Sparkles, Flame, Trophy, Play, Star, Plus, Film } from 'lucide-react';
import { getTMDBImageUrl } from '@/lib/tmdb';
import { useLibrary } from '@/lib/context/LibraryContext';

export default function HomePage() {
  const [trending, setTrending] = useState<Movie[]>([]);
  const [popular, setPopular] = useState<Movie[]>([]);
  const [heroMovie, setHeroMovie] = useState<Movie | null>(null);
  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const { addOrUpdateMovieStatus, getMovieLog } = useLibrary();

  useEffect(() => {
    async function loadData() {
      const [trendData, popData] = await Promise.all([
        fetchTrendingMovies(),
        fetchPopularMovies(),
      ]);
      setTrending(trendData);
      setPopular(popData);
      if (trendData.length > 0) {
        setHeroMovie(trendData[0]);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  const heroLog = heroMovie ? getMovieLog(heroMovie.id) : undefined;

  return (
    <div className="min-h-screen pb-24">
      {/* Hero Showcase Section */}
      {heroMovie && (
        <section className="relative w-full h-[70vh] sm:h-[80vh] min-h-[500px] flex items-end overflow-hidden bg-slate-950">
          <Image
            src={getTMDBImageUrl(heroMovie.backdrop_path || heroMovie.poster_path, 'original')}
            alt={heroMovie.title}
            fill
            priority
            className="object-cover opacity-50 scale-105 filter brightness-90 animate-fadeIn"
          />

          {/* Vignette Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/60 to-transparent" />

          {/* Hero Content Overlay */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16 w-full">
            <div className="max-w-2xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-bold tracking-wider uppercase backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5" /> Featured Spotlight
              </div>

              <h1 className="text-3xl sm:text-6xl font-black text-white tracking-tight leading-none drop-shadow-lg">
                {heroMovie.title}
              </h1>

              <div className="flex items-center gap-4 text-xs font-bold text-slate-300">
                <span className="flex items-center gap-1 text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-md border border-amber-400/20">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  {heroMovie.vote_average?.toFixed(1)} / 10
                </span>
                <span>{heroMovie.release_date ? heroMovie.release_date.split('-')[0] : ''}</span>
              </div>

              <p className="text-sm sm:text-base text-slate-300 line-clamp-3 leading-relaxed drop-shadow">
                {heroMovie.overview}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => setSelectedMovieId(heroMovie.id)}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 shadow-xl shadow-rose-600/30 hover:scale-105 transition-all"
                >
                  <Play className="w-4 h-4 fill-white" /> View Details & Trailer
                </button>

                <button
                  onClick={() => addOrUpdateMovieStatus(heroMovie, 'plan_to_watch')}
                  className={`px-5 py-3 rounded-2xl border text-xs font-bold flex items-center gap-2 backdrop-blur-md transition-all ${
                    heroLog?.status === 'plan_to_watch'
                      ? 'bg-sky-500 text-white border-sky-400'
                      : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
                  }`}
                >
                  <Plus className="w-4 h-4 text-rose-400" />
                  {heroLog?.status === 'plan_to_watch' ? 'In Watchlist' : 'Add to Watchlist'}
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Main Content Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 space-y-14">
        
        {/* Section 1: Trending Now Carousel Grid */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500">
                <Flame className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  Trending This Week
                </h2>
                <p className="text-xs text-slate-400">Most talked about movies right now</p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="aspect-[2/3] rounded-2xl bg-slate-900 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
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
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  All-Time Fan Favorites
                </h2>
                <p className="text-xs text-slate-400">Highest rated blockbusters & cult classics</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
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
