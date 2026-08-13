'use client';

import React, { useState } from 'react';
import { useLibrary } from '@/lib/context/LibraryContext';
import { MovieCard } from '@/components/movies/MovieCard';
import { MovieModal } from '@/components/movies/MovieModal';
import { WatchStatus } from '@/types/movie';
import { BookmarkCheck, Eye, Check, Clock, Star, Flame, Sparkles, Trophy } from 'lucide-react';
import { formatMinutesToHours } from '@/lib/utils';

export default function LibraryPage() {
  const { userMovies, getWatchStats } = useLibrary();
  const [activeTab, setActiveTab] = useState<WatchStatus | 'all'>('completed');
  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);

  const stats = getWatchStats();

  const filteredMovies = activeTab === 'all'
    ? userMovies
    : userMovies.filter((m) => m.status === activeTab);

  return (
    <div className="min-h-screen py-6 sm:py-10 pb-28 sm:pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-10">
      
      {/* Profile Header & Watch Stats Overview */}
      <div className="relative p-5 sm:p-10 rounded-3xl bg-slate-900/80 border border-white/10 overflow-hidden shadow-2xl backdrop-blur-xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-48 sm:w-64 h-48 sm:h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1.5 sm:mb-2">
                <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Watchlist Dashboard
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                My Movie Library
              </h1>
            </div>
          </div>

          {/* Stats Bar Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 pt-1 sm:pt-2">
            <div className="p-3 sm:p-4 rounded-2xl bg-slate-950/60 border border-white/5 space-y-0.5 sm:space-y-1">
              <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 sm:gap-1.5">
                <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400 shrink-0" /> Watched
              </span>
              <p className="text-xl sm:text-2xl font-black text-white">{stats.totalWatched}</p>
            </div>

            <div className="p-3 sm:p-4 rounded-2xl bg-slate-950/60 border border-white/5 space-y-0.5 sm:space-y-1">
              <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 sm:gap-1.5">
                <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-sky-400 shrink-0" /> Watch Time
              </span>
              <p className="text-xl sm:text-2xl font-black text-white">{formatMinutesToHours(stats.totalMinutes)}</p>
            </div>

            <div className="p-3 sm:p-4 rounded-2xl bg-slate-950/60 border border-white/5 space-y-0.5 sm:space-y-1">
              <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 sm:gap-1.5">
                <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400 shrink-0" /> Mean Rating
              </span>
              <p className="text-xl sm:text-2xl font-black text-amber-400">{stats.averageRating > 0 ? `${stats.averageRating}/10` : 'N/A'}</p>
            </div>

            <div className="p-3 sm:p-4 rounded-2xl bg-slate-950/60 border border-white/5 space-y-0.5 sm:space-y-1">
              <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 sm:gap-1.5">
                <BookmarkCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-rose-400 shrink-0" /> Plan to Watch
              </span>
              <p className="text-xl sm:text-2xl font-black text-white">{stats.planToWatchCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Watch Status Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3 sm:pb-4">
        <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-900 p-1 sm:p-1.5 rounded-2xl border border-white/10 overflow-x-auto no-scrollbar w-full sm:w-auto">
          {[
            { id: 'completed', label: 'Watched', icon: Check },
            { id: 'plan_to_watch', label: 'Plan to Watch', icon: BookmarkCheck },
            { id: 'watching', label: 'Watching', icon: Eye },
            { id: 'all', label: 'All Saved', icon: Flame },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all active:scale-95 ${
                  isActive
                    ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="whitespace-nowrap">{tab.label}</span>
              </button>
            );
          })}
        </div>

        <span className="text-[11px] sm:text-xs font-semibold text-slate-400 shrink-0 self-end sm:self-auto">
          Showing {filteredMovies.length} movies
        </span>
      </div>

      {/* Grid of Saved Movies */}
      {filteredMovies.length > 0 ? (
        <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-6">
          {filteredMovies.map((log) => (
            <MovieCard
              key={log.id}
              movie={{
                id: log.tmdb_id,
                title: log.title,
                overview: log.review || '',
                poster_path: log.poster_path,
                backdrop_path: null,
                release_date: log.release_date,
                vote_average: log.vote_average ?? 0,
                runtime: log.runtime,
              }}
              onSelect={(m) => setSelectedMovieId(m.id)}
            />
          ))}
        </div>
      ) : (
        <div className="py-16 sm:py-20 flex flex-col items-center justify-center text-center space-y-3">
          <BookmarkCheck className="w-10 h-10 sm:w-12 sm:h-12 text-slate-700" />
          <p className="text-base sm:text-lg font-bold text-slate-300">No movies found in this list</p>
          <p className="text-xs text-slate-500">Go to Discover or Search to add movies to your watchlist!</p>
        </div>
      )}

      {/* Detail Modal */}
      <MovieModal
        movieId={selectedMovieId}
        onClose={() => setSelectedMovieId(null)}
      />
    </div>
  );
}
