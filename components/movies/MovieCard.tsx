'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Star, Plus, Check, Bookmark, Eye, Play, Sparkles } from 'lucide-react';
import { Movie, WatchStatus } from '@/types/movie';
import { getTMDBImageUrl } from '@/lib/tmdb';
import { useLibrary } from '@/lib/context/LibraryContext';

interface MovieCardProps {
  movie: Movie;
  onSelect?: (movie: Movie) => void;
}

export function MovieCard({ movie, onSelect }: MovieCardProps) {
  const { getMovieLog, addOrUpdateMovieStatus } = useLibrary();
  const [isHovered, setIsHovered] = useState(false);
  const log = getMovieLog(movie.id);

  const getStatusBadge = (status?: WatchStatus) => {
    switch (status) {
      case 'completed':
        return <span className="bg-emerald-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm backdrop-blur-md"><Check className="w-3 h-3" /> Watched</span>;
      case 'watching':
        return <span className="bg-amber-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm backdrop-blur-md"><Eye className="w-3 h-3" /> Watching</span>;
      case 'plan_to_watch':
        return <span className="bg-sky-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm backdrop-blur-md"><Bookmark className="w-3 h-3" /> Plan</span>;
      default:
        return null;
    }
  };

  const handleQuickAdd = (e: React.MouseEvent, status: WatchStatus) => {
    e.stopPropagation();
    addOrUpdateMovieStatus(movie, status);
  };

  return (
    <div
      onClick={() => onSelect && onSelect(movie)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative cursor-pointer flex flex-col rounded-2xl overflow-hidden bg-slate-900/60 border border-white/10 hover:border-rose-500/40 transition-all duration-300 hover:shadow-2xl hover:shadow-rose-950/50 hover:-translate-y-1.5"
    >
      {/* Poster Media */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-slate-950">
        <Image
          src={getTMDBImageUrl(movie.poster_path, 'w500')}
          alt={movie.title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Top Badges Overlay */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none z-10">
          <div className="flex items-center gap-1 bg-black/70 backdrop-blur-md text-amber-400 text-xs font-bold px-2.5 py-1 rounded-full border border-white/10 shadow-lg">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}</span>
          </div>

          {log?.status && getStatusBadge(log.status)}
        </div>

        {/* Hover Action Overlay */}
        <div
          className={`absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent p-4 flex flex-col justify-end transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <p className="text-xs text-slate-300 line-clamp-3 mb-3 leading-relaxed">
            {movie.overview || 'No synopsis available.'}
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={(e) => handleQuickAdd(e, 'plan_to_watch')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-md ${
                log?.status === 'plan_to_watch'
                  ? 'bg-sky-500 text-white'
                  : 'bg-white/15 text-white hover:bg-rose-600 hover:shadow-rose-600/30'
              }`}
            >
              {log?.status === 'plan_to_watch' ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              {log?.status === 'plan_to_watch' ? 'In Watchlist' : 'Add Watchlist'}
            </button>

            <button
              onClick={() => onSelect && onSelect(movie)}
              className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white backdrop-blur-md transition-colors"
              title="View Details"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Card Info Details */}
      <div className="p-3.5 flex flex-col justify-between flex-1 bg-slate-900/80 backdrop-blur-sm">
        <div>
          <h3 className="font-bold text-sm text-slate-100 group-hover:text-rose-400 transition-colors line-clamp-1">
            {movie.title}
          </h3>
          <p className="text-xs font-medium text-slate-400 mt-1 flex items-center justify-between">
            <span>{movie.release_date ? movie.release_date.split('-')[0] : 'TBA'}</span>
            {log?.rating && (
              <span className="text-rose-400 font-semibold flex items-center gap-0.5">
                ★ {log.rating}/10
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
