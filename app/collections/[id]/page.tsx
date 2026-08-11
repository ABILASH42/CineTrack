'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useLibrary } from '@/lib/context/LibraryContext';
import { MovieCard } from '@/components/movies/MovieCard';
import { MovieModal } from '@/components/movies/MovieModal';
import { Layers, Globe, Lock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CollectionDetailPage() {
  const params = useParams();
  const { collections } = useLibrary();
  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);

  const collection = collections.find((c) => c.id === params.id);

  if (!collection) {
    return (
      <div className="min-h-screen py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Collection Not Found</h2>
        <Link href="/collections" className="text-rose-500 font-semibold hover:underline">
          ← Back to Collections
        </Link>
      </div>
    );
  }

  const posters = collection.posters || [];

  return (
    <div className="min-h-screen py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      
      {/* Header Banner */}
      <div className="space-y-4">
        <Link href="/collections" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Collections
        </Link>

        <div className="p-8 rounded-3xl bg-slate-900/80 border border-white/10 space-y-3 backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <span className="bg-rose-500/20 text-rose-300 text-xs font-bold px-3 py-1 rounded-full border border-rose-500/30 flex items-center gap-1">
              {collection.is_public ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
              {collection.is_public ? 'Public Collection' : 'Private Collection'}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            {collection.name}
          </h1>

          <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
            {collection.description || 'Custom curated movie collection.'}
          </p>
        </div>
      </div>

      {/* Movies in Collection Grid */}
      {posters.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {posters.map((poster, index) => (
            <MovieCard
              key={index}
              movie={{
                id: 550 + index,
                title: `Collection Film ${index + 1}`,
                overview: 'Curated item inside collection.',
                poster_path: poster,
                backdrop_path: null,
                release_date: '2023',
                vote_average: 8.5
              }}
              onSelect={(m) => setSelectedMovieId(m.id)}
            />
          ))}
        </div>
      ) : (
        <div className="py-20 flex flex-col items-center justify-center text-center space-y-3">
          <Layers className="w-12 h-12 text-slate-700" />
          <p className="text-lg font-bold text-slate-300">No movies added to this collection yet</p>
          <p className="text-xs text-slate-500">Open any movie details modal and click "Add to Collection" to add titles!</p>
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
