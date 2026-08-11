'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, Star, Calendar, Clock, Film, Check, Bookmark, Eye, Heart, Plus, Play, Sparkles, MessageSquare } from 'lucide-react';
import { Movie, WatchStatus } from '@/types/movie';
import { fetchMovieDetails, getTMDBImageUrl } from '@/lib/tmdb';
import { formatMinutesToHours, formatDate } from '@/lib/utils';
import { useLibrary } from '@/lib/context/LibraryContext';
import confetti from 'canvas-confetti';

interface MovieModalProps {
  movieId: number | null;
  onClose: () => void;
}

export function MovieModal({ movieId, onClose }: MovieModalProps) {
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(false);
  const [userRating, setUserRating] = useState<number>(0);
  const [userReview, setUserReview] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'overview' | 'trailer' | 'log'>('overview');
  const [showCollectionPicker, setShowCollectionPicker] = useState(false);
  const [selectedCollectionId, setSelectedCollectionId] = useState('');

  const { getMovieLog, addOrUpdateMovieStatus, collections, addMovieToCollection } = useLibrary();

  useEffect(() => {
    if (!movieId) return;
    setLoading(true);
    fetchMovieDetails(movieId).then((data) => {
      setMovie(data);
      setLoading(false);

      const existingLog = getMovieLog(movieId);
      if (existingLog) {
        setUserRating(existingLog.rating || 0);
        setUserReview(existingLog.review || '');
      } else {
        setUserRating(0);
        setUserReview('');
      }
    });
  }, [movieId]);

  if (!movieId) return null;

  const existingLog = movie ? getMovieLog(movie.id) : undefined;
  const trailerKey = movie?.videos?.results?.find((v) => v.type === 'Trailer' || v.site === 'YouTube')?.key;

  const handleStatusChange = (status: WatchStatus) => {
    if (!movie) return;
    addOrUpdateMovieStatus(movie, status, userRating || undefined, userReview || undefined);

    if (status === 'completed') {
      setActiveTab('log'); // Automatically open rating & review tab for user prompt
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 }
      });
    }
  };

  const handleSaveReview = () => {
    if (!movie) return;
    const targetStatus = existingLog?.status || 'completed';
    addOrUpdateMovieStatus(movie, targetStatus, userRating, userReview);
  };

  const handleAddToCollection = (colId: string) => {
    if (!movie) return;
    addMovieToCollection(colId, movie);
    setShowCollectionPicker(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-xl animate-fadeIn">
      {/* Container Card */}
      <div className="relative w-full max-w-4xl bg-slate-900 border border-white/15 rounded-3xl overflow-hidden shadow-2xl text-slate-100 max-h-[90vh] flex flex-col my-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 p-2.5 rounded-full bg-black/60 hover:bg-rose-600 text-white backdrop-blur-md transition-all shadow-lg border border-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        {loading ? (
          <div className="h-96 flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-medium text-slate-400">Fetching movie metadata & trailers...</p>
          </div>
        ) : movie ? (
          <div className="overflow-y-auto flex-1 custom-scrollbar">
            {/* Hero Backdrop Header */}
            <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-slate-950">
              <Image
                src={getTMDBImageUrl(movie.backdrop_path || movie.poster_path, 'w1280')}
                alt={movie.title}
                fill
                className="object-cover opacity-40 scale-105 filter blur-[2px]"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />

              {/* Title & Quick Info Banner */}
              <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
                <div className="flex gap-4 items-end">
                  {/* Poster Thumbnail */}
                  <div className="relative w-24 h-36 sm:w-32 sm:h-48 rounded-xl overflow-hidden shadow-2xl border-2 border-white/20 shrink-0 hidden xs:block">
                    <Image
                      src={getTMDBImageUrl(movie.poster_path, 'w300')}
                      alt={movie.title}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div>
                    {movie.tagline && (
                      <p className="text-xs uppercase tracking-widest font-bold text-rose-400 mb-1">
                        "{movie.tagline}"
                      </p>
                    )}
                    <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight drop-shadow-md">
                      {movie.title}
                    </h2>
                    
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs font-semibold text-slate-300">
                      <span className="flex items-center gap-1 text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-md border border-amber-400/20">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        {movie.vote_average?.toFixed(1)} / 10
                      </span>
                      {movie.release_date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {formatDate(movie.release_date)}
                        </span>
                      )}
                      {movie.runtime ? (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {formatMinutesToHours(movie.runtime)}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>

                {/* Quick Add Collection Button */}
                <div className="relative">
                  <button
                    onClick={() => setShowCollectionPicker(!showCollectionPicker)}
                    className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-bold text-white flex items-center gap-2 backdrop-blur-md transition-all shadow-md"
                  >
                    <Plus className="w-4 h-4 text-rose-400" />
                    <span>Add to Collection</span>
                  </button>

                  {/* Dropdown Menu */}
                  {showCollectionPicker && (
                    <div className="absolute right-0 bottom-12 w-64 bg-slate-900 border border-white/15 rounded-2xl shadow-2xl p-2 z-50">
                      <p className="text-[11px] uppercase font-bold text-slate-400 px-3 py-1.5">Select Collection</p>
                      {collections.map((col) => (
                        <button
                          key={col.id}
                          onClick={() => handleAddToCollection(col.id)}
                          className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium hover:bg-rose-600/20 hover:text-rose-300 transition-colors flex items-center justify-between"
                        >
                          <span className="truncate">{col.name}</span>
                          <Plus className="w-3 h-3 text-slate-400" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Watch Status Selector Strip */}
            <div className="px-6 py-4 bg-slate-950/60 border-y border-white/10 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-rose-500" /> Watch Status
              </span>

              <div className="flex items-center gap-2">
                {[
                  { status: 'plan_to_watch', label: 'Plan to Watch', icon: Bookmark, color: 'hover:bg-sky-600 active:bg-sky-600' },
                  { status: 'watching', label: 'Watching', icon: Eye, color: 'hover:bg-amber-600 active:bg-amber-600' },
                  { status: 'completed', label: 'Completed', icon: Check, color: 'hover:bg-emerald-600 active:bg-emerald-600' }
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = existingLog?.status === item.status;
                  return (
                    <button
                      key={item.status}
                      onClick={() => handleStatusChange(item.status as WatchStatus)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md ${
                        isActive
                          ? 'bg-rose-600 text-white shadow-rose-600/30'
                          : 'bg-white/5 border border-white/10 text-slate-300 hover:border-white/30'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tabs Navigation */}
            <div className="px-6 border-b border-white/10 flex gap-6 text-sm font-semibold text-slate-400">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-3.5 border-b-2 transition-colors ${
                  activeTab === 'overview' ? 'border-rose-500 text-rose-400' : 'border-transparent hover:text-white'
                }`}
              >
                Overview
              </button>
              {trailerKey && (
                <button
                  onClick={() => setActiveTab('trailer')}
                  className={`py-3.5 border-b-2 flex items-center gap-1.5 transition-colors ${
                    activeTab === 'trailer' ? 'border-rose-500 text-rose-400' : 'border-transparent hover:text-white'
                  }`}
                >
                  <Play className="w-3.5 h-3.5 fill-current" /> Official Trailer
                </button>
              )}
              <button
                onClick={() => setActiveTab('log')}
                className={`py-3.5 border-b-2 flex items-center gap-1.5 transition-colors ${
                  activeTab === 'log' ? 'border-rose-500 text-rose-400' : 'border-transparent hover:text-white'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" /> My Rating & Review
              </button>
            </div>

            {/* Tab Contents */}
            <div className="p-6 space-y-6">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Synopsis</h4>
                    <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                      {movie.overview || 'No synopsis provided for this title.'}
                    </p>
                  </div>

                  {/* Genres List */}
                  {movie.genres && movie.genres.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">Genres</h4>
                      <div className="flex flex-wrap gap-2">
                        {movie.genres.map((g) => (
                          <span
                            key={g.id}
                            className="px-3 py-1 rounded-full text-xs font-medium bg-slate-800 border border-slate-700 text-slate-300"
                          >
                            {g.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Cast Highlights */}
                  {movie.credits?.cast && movie.credits.cast.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Top Cast</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {movie.credits.cast.slice(0, 4).map((person) => (
                          <div key={person.id} className="p-2.5 rounded-xl bg-slate-950/50 border border-white/5 flex items-center gap-2.5">
                            <div className="w-10 h-10 rounded-full overflow-hidden relative bg-slate-800 shrink-0">
                              {person.profile_path ? (
                                <Image
                                  src={getTMDBImageUrl(person.profile_path, 'w300')}
                                  alt={person.name}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <Film className="w-5 h-5 text-slate-500 m-auto mt-2.5" />
                              )}
                            </div>
                            <div className="truncate">
                              <p className="text-xs font-bold text-slate-200 truncate">{person.name}</p>
                              <p className="text-[11px] text-slate-400 truncate">{person.character}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'trailer' && trailerKey && (
                <div className="aspect-video w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black">
                  <iframe
                    src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1`}
                    title={`${movie.title} Trailer`}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}

              {activeTab === 'log' && (
                <div className="space-y-6 max-w-xl">
                  {/* Rating Selector */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                      Your Rating (Out of 10)
                    </label>
                    <div className="flex items-center gap-1 sm:gap-2">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                        <button
                          key={star}
                          onClick={() => setUserRating(star)}
                          className={`p-1.5 rounded-lg transition-all ${
                            star <= userRating
                              ? 'text-amber-400 scale-110'
                              : 'text-slate-700 hover:text-slate-500'
                          }`}
                        >
                          <Star className="w-5 h-5 fill-current" />
                        </button>
                      ))}
                      <span className="ml-3 font-extrabold text-lg text-amber-400">
                        {userRating ? `${userRating}/10` : 'Unrated'}
                      </span>
                    </div>
                  </div>

                  {/* Personal Notes / Review */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Personal Notes / Review
                    </label>
                    <textarea
                      rows={4}
                      value={userReview}
                      onChange={(e) => setUserReview(e.target.value)}
                      placeholder="What did you think of the plot, acting, or directing? Add your thoughts..."
                      className="w-full p-4 rounded-xl bg-slate-950 border border-white/10 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-rose-500 transition-colors"
                    />
                  </div>

                  <button
                    onClick={handleSaveReview}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-rose-600/30 hover:opacity-90 transition-opacity"
                  >
                    Save Log & Rating
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
