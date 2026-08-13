'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Star, Plus, Check, Bookmark, Eye, Trash2 } from 'lucide-react';
import { Movie, WatchStatus } from '@/types/movie';
import { getTMDBImageUrl } from '@/lib/tmdb';
import { useLibrary } from '@/lib/context/LibraryContext';

interface MovieCardProps {
  movie: Movie;
  onSelect?: (movie: Movie) => void;
}

export function MovieCard({ movie, onSelect }: MovieCardProps) {
  const { getMovieLog, addOrUpdateMovieStatus, removeMovieLog } = useLibrary();
  const [isHovered, setIsHovered] = useState(false);
  const log = getMovieLog(movie.id);

  const getStatusBadge = (status?: WatchStatus) => {
    switch (status) {
      case 'completed':
        return <span className="bg-emerald-500/90 text-white text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full flex items-center gap-0.5 sm:gap-1 shadow-sm backdrop-blur-md shrink-0"><Check className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> <span className="hidden xs:inline">Watched</span></span>;
      case 'watching':
        return <span className="bg-amber-500/90 text-white text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full flex items-center gap-0.5 sm:gap-1 shadow-sm backdrop-blur-md shrink-0"><Eye className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> <span className="hidden xs:inline">Watching</span></span>;
      case 'plan_to_watch':
        return <span className="bg-sky-500/90 text-white text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full flex items-center gap-0.5 sm:gap-1 shadow-sm backdrop-blur-md shrink-0"><Bookmark className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> <span className="hidden xs:inline">Plan</span></span>;
      default:
        return null;
    }
  };

  const handleQuickAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (log?.status) {
      removeMovieLog(movie.id);
    } else {
      addOrUpdateMovieStatus(movie, 'plan_to_watch');
    }
  };

  return (
    <div
      onClick={() => onSelect && onSelect(movie)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative cursor-pointer flex flex-col rounded-2xl overflow-hidden bg-slate-900/60 border border-white/10 hover:border-rose-500/40 active:scale-[0.98] transition-all duration-300 hover:shadow-2xl hover:shadow-rose-950/50 sm:hover:-translate-y-1.5"
    >
      {/* Poster Media */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-slate-950">
        <Image
          src={getTMDBImageUrl(movie.poster_path, 'w500')}
          alt={movie.title}
          fill
          sizes="(max-width: 640px) 48vw, (max-width: 1024px) 25vw, 20vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Top Badges Overlay */}
        <div className="absolute top-1.5 sm:top-2.5 left-1.5 sm:left-2.5 right-1.5 sm:right-2.5 flex items-center justify-between pointer-events-none z-10 gap-1">
          <div className="flex items-center gap-1 bg-black/80 backdrop-blur-md text-amber-400 text-[10px] sm:text-xs font-bold px-2 py-0.5 sm:py-1 rounded-full border border-white/10 shadow-lg" title="TMDB Rating">
            <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-amber-400 text-amber-400 shrink-0" />
            <span>{movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}</span>
          </div>

          {log?.status && getStatusBadge(log.status)}
        </div>

        {/* Hover / Touch Action Overlay */}
        <div
          className={`absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent p-3 sm:p-4 flex flex-col justify-end transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none sm:group-hover:opacity-100 sm:group-hover:pointer-events-auto'
          }`}
        >
          <p className="text-[11px] sm:text-xs text-slate-300 line-clamp-3 mb-2.5 leading-relaxed hidden sm:block">
            {movie.overview || 'No synopsis available.'}
          </p>

          <div className="w-full">
            <button
              onClick={handleQuickAction}
              className={`w-full py-1.5 sm:py-2 px-2 sm:px-3 rounded-xl text-[10px] sm:text-xs font-semibold flex items-center justify-center gap-1 transition-all shadow-md active:scale-95 ${
                log?.status
                  ? 'bg-rose-500/30 text-rose-200 hover:bg-rose-600 hover:text-white border border-rose-500/40 backdrop-blur-md'
                  : 'bg-white/20 text-white hover:bg-rose-600 hover:shadow-rose-600/30 backdrop-blur-md'
              }`}
              title={log?.status ? 'Remove from Watchlist & Library' : 'Add to Watchlist'}
            >
              {log?.status ? (
                <>
                  <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-rose-400" />
                  <span className="truncate">Remove</span>
                </>
              ) : (
                <>
                  <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span className="truncate">Watchlist</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Card Info Details */}
      <div className="p-2.5 sm:p-3.5 flex flex-col justify-between flex-1 bg-slate-900/80 backdrop-blur-sm">
        <div>
          <h3 className="font-bold text-xs sm:text-sm text-slate-100 group-hover:text-rose-400 transition-colors line-clamp-1">
            {movie.title}
          </h3>
          <div className="text-[11px] sm:text-xs font-medium text-slate-400 mt-0.5 sm:mt-1 flex items-center justify-between gap-1">
            <span>{movie.release_date ? movie.release_date.split('-')[0] : 'TBA'}</span>
            {log?.rating ? (
              <span className="text-rose-400 font-bold flex items-center gap-0.5 bg-rose-500/10 px-1.5 py-0.5 rounded-md border border-rose-500/20 text-[10px] sm:text-xs shrink-0" title="Your Rating">
                ★ {log.rating}/10
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
