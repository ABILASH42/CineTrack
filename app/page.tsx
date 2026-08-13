'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Movie } from '@/types/movie';
import { fetchTrendingMovies, fetchPopularMovies, fetchMoviesByGenre } from '@/lib/tmdb';
import { MovieCard } from '@/components/movies/MovieCard';
import { MovieModal } from '@/components/movies/MovieModal';
import { Sparkles, Flame, Trophy, Play, Star, Plus, Film, Trash2, Check, ChevronLeft, ChevronRight, Laugh, Heart, ShieldAlert, Rocket, Compass, ArrowRight } from 'lucide-react';
import { getTMDBImageUrl } from '@/lib/tmdb';
import { useLibrary } from '@/lib/context/LibraryContext';

export default function HomePage() {
  const [trending, setTrending] = useState<Movie[]>([]);
  const [popular, setPopular] = useState<Movie[]>([]);
  const [comedy, setComedy] = useState<Movie[]>([]);
  const [romance, setRomance] = useState<Movie[]>([]);
  const [action, setAction] = useState<Movie[]>([]);
  const [sciFi, setSciFi] = useState<Movie[]>([]);
  
  const [heroIndex, setHeroIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const { addOrUpdateMovieStatus, removeMovieLog, getMovieLog } = useLibrary();

  useEffect(() => {
    async function loadData() {
      const [trendData, popData, comedyData, romanceData, actionData, sciFiData] = await Promise.all([
        fetchTrendingMovies(),
        fetchPopularMovies(),
        fetchMoviesByGenre(35),    // Comedy
        fetchMoviesByGenre(10749), // Romance
        fetchMoviesByGenre(28),    // Action
        fetchMoviesByGenre(878),   // Sci-Fi
      ]);

      setTrending(trendData);
      setPopular(popData);
      setComedy(comedyData);
      setRomance(romanceData);
      setAction(actionData);
      setSciFi(sciFiData);
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

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen pb-28 sm:pb-20">
      {/* Hero Showcase Carousel */}
      {heroMovie && (
        <section
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="relative w-full min-h-[560px] sm:min-h-[600px] lg:h-[82vh] pt-20 sm:pt-24 pb-16 sm:pb-20 flex items-end overflow-hidden bg-slate-950 group/hero"
        >
          {/* Vibrant Backdrop Image with Top Subject Framing */}
          <Image
            key={heroMovie.id}
            src={getTMDBImageUrl(heroMovie.backdrop_path || heroMovie.poster_path, 'original')}
            alt={heroMovie.title}
            fill
            priority
            sizes="100vw"
            className="object-cover object-top sm:object-[center_20%] opacity-90 sm:opacity-95 filter brightness-105 contrast-105 transition-opacity duration-700 animate-fadeIn"
          />

          {/* Clean, Non-Muddy Gradient Vignettes */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/20 to-transparent max-w-2xl" />

          {/* Hero Content Overlay */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex items-end justify-between gap-8 pb-2 sm:pb-4">
            <div key={heroMovie.id} className="max-w-2xl space-y-3 sm:space-y-4 animate-fadeIn">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 text-[10px] sm:text-xs font-bold tracking-wider uppercase backdrop-blur-md shadow-md">
                <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-rose-400" /> Featured Spotlight #{heroIndex + 1}
              </div>

              <h1 className="text-2xl xs:text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
                {heroMovie.title}
              </h1>

              <div className="flex items-center gap-3 text-xs font-bold text-slate-200">
                <span className="flex items-center gap-1 text-amber-400 bg-black/60 px-2.5 py-1 rounded-md border border-amber-400/30 backdrop-blur-md shadow-md">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  {heroMovie.vote_average?.toFixed(1)} / 10
                </span>
                <span className="bg-black/40 px-2 py-0.5 rounded border border-white/10">{heroMovie.release_date ? heroMovie.release_date.split('-')[0] : ''}</span>
              </div>

              <p className="text-xs sm:text-base text-slate-200 line-clamp-2 sm:line-clamp-3 leading-relaxed max-w-xl drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
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
                  className={`group/watchbtn w-full sm:w-[170px] py-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 backdrop-blur-md active:scale-95 transition-all shrink-0 ${
                    heroLog?.status
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-rose-600 hover:text-white hover:border-rose-500 shadow-md'
                      : 'bg-black/40 hover:bg-white/20 text-white border-white/20'
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
            <div className="absolute bottom-3 right-4 sm:bottom-6 sm:right-6 z-20 flex items-center gap-1.5 sm:gap-2 bg-black/75 backdrop-blur-xl p-1.5 sm:p-2 rounded-2xl border border-white/15 shadow-2xl">
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 sm:mt-10 space-y-10 sm:space-y-14">
        
        {/* Category Quick Navigation Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar border-b border-white/10">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 shrink-0 flex items-center gap-1 mr-1">
            <Compass className="w-3.5 h-3.5 text-rose-500" /> Categories:
          </span>
          {[
            { id: 'trending', label: 'Trending', icon: Flame },
            { id: 'popular', label: 'Fan Favorites', icon: Trophy },
            { id: 'comedy', label: 'Comedy', icon: Laugh },
            { id: 'romance', label: 'Romance', icon: Heart },
            { id: 'action', label: 'Action & Thrillers', icon: ShieldAlert },
            { id: 'scifi', label: 'Sci-Fi & Cyberpunk', icon: Rocket },
          ].map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => scrollToSection(cat.id)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/5 hover:bg-rose-600/20 text-slate-300 hover:text-rose-300 border border-white/10 transition-all shrink-0 flex items-center gap-1.5 active:scale-95"
              >
                <Icon className="w-3.5 h-3.5 text-rose-400" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Section 1: Trending Now Grid */}
        <section id="trending" className="space-y-4 sm:space-y-6 scroll-mt-24">
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

            <Link
              href="/genre/trending"
              className="flex items-center gap-1 sm:gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-rose-600/20 text-xs sm:text-sm font-semibold text-rose-400 hover:text-rose-300 border border-white/10 transition-all shrink-0 active:scale-95"
            >
              <span>View More</span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Link>
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
        <section id="popular" className="space-y-4 sm:space-y-6 scroll-mt-24">
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

            <Link
              href="/genre/popular"
              className="flex items-center gap-1 sm:gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-rose-600/20 text-xs sm:text-sm font-semibold text-rose-400 hover:text-rose-300 border border-white/10 transition-all shrink-0 active:scale-95"
            >
              <span>View More</span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Link>
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

        {/* Section 3: Comedy Hits */}
        <section id="comedy" className="space-y-4 sm:space-y-6 scroll-mt-24">
          <div className="flex items-center justify-between border-b border-white/10 pb-3 sm:pb-4">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="p-2 sm:p-2.5 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400">
                <Laugh className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h2 className="text-lg sm:text-2xl font-extrabold text-white tracking-tight">
                  Comedy & Laughs
                </h2>
                <p className="text-[11px] sm:text-xs text-slate-400">Hilarious comedies and feel-good movies</p>
              </div>
            </div>

            <Link
              href="/genre/35"
              className="flex items-center gap-1 sm:gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-rose-600/20 text-xs sm:text-sm font-semibold text-rose-400 hover:text-rose-300 border border-white/10 transition-all shrink-0 active:scale-95"
            >
              <span>View More</span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-6">
            {comedy.slice(0, 10).map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onSelect={(m) => setSelectedMovieId(m.id)}
              />
            ))}
          </div>
        </section>

        {/* Section 4: Romance & Drama */}
        <section id="romance" className="space-y-4 sm:space-y-6 scroll-mt-24">
          <div className="flex items-center justify-between border-b border-white/10 pb-3 sm:pb-4">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="p-2 sm:p-2.5 rounded-2xl bg-pink-500/10 border border-pink-500/20 text-pink-400">
                <Heart className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h2 className="text-lg sm:text-2xl font-extrabold text-white tracking-tight">
                  Romance & Heartfelt Drama
                </h2>
                <p className="text-[11px] sm:text-xs text-slate-400">Captivating romantic stories and emotional journeys</p>
              </div>
            </div>

            <Link
              href="/genre/10749"
              className="flex items-center gap-1 sm:gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-rose-600/20 text-xs sm:text-sm font-semibold text-rose-400 hover:text-rose-300 border border-white/10 transition-all shrink-0 active:scale-95"
            >
              <span>View More</span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-6">
            {romance.slice(0, 10).map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onSelect={(m) => setSelectedMovieId(m.id)}
              />
            ))}
          </div>
        </section>

        {/* Section 5: Action & Thrillers */}
        <section id="action" className="space-y-4 sm:space-y-6 scroll-mt-24">
          <div className="flex items-center justify-between border-b border-white/10 pb-3 sm:pb-4">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="p-2 sm:p-2.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500">
                <ShieldAlert className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h2 className="text-lg sm:text-2xl font-extrabold text-white tracking-tight">
                  Action & Thrillers
                </h2>
                <p className="text-[11px] sm:text-xs text-slate-400">High-octane blockbusters and suspenseful thrillers</p>
              </div>
            </div>

            <Link
              href="/genre/28"
              className="flex items-center gap-1 sm:gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-rose-600/20 text-xs sm:text-sm font-semibold text-rose-400 hover:text-rose-300 border border-white/10 transition-all shrink-0 active:scale-95"
            >
              <span>View More</span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-6">
            {action.slice(0, 10).map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onSelect={(m) => setSelectedMovieId(m.id)}
              />
            ))}
          </div>
        </section>

        {/* Section 6: Sci-Fi & Cyberpunk */}
        <section id="scifi" className="space-y-4 sm:space-y-6 scroll-mt-24">
          <div className="flex items-center justify-between border-b border-white/10 pb-3 sm:pb-4">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="p-2 sm:p-2.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <Rocket className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h2 className="text-lg sm:text-2xl font-extrabold text-white tracking-tight">
                  Sci-Fi & Cyberpunk
                </h2>
                <p className="text-[11px] sm:text-xs text-slate-400">Futuristic adventures and space exploration</p>
              </div>
            </div>

            <Link
              href="/genre/878"
              className="flex items-center gap-1 sm:gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-rose-600/20 text-xs sm:text-sm font-semibold text-rose-400 hover:text-rose-300 border border-white/10 transition-all shrink-0 active:scale-95"
            >
              <span>View More</span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-6">
            {sciFi.slice(0, 10).map((movie) => (
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
