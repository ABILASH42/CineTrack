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
    <div className="min-h-screen py-6 sm:py-10 pb-28 sm:pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-10">
      
      {/* Header Banner */}
      <div className="space-y-3 sm:space-y-4">
        <Link href="/collections" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Collections
        </Link>

        <div className="p-5 sm:p-8 rounded-3xl bg-slate-900/80 border border-white/10 space-y-2.5 sm:space-y-3 backdrop-blur-xl">
          <h1 className="text-2xl xs:text-3xl sm:text-5xl font-black text-white tracking-tight">
            {collection.name}
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            {collection.description || 'Custom curated movie collection.'}
          </p>
        </div>
      </div>

      {/* Movies in Collection Grid */}
      {posters.length > 0 ? (
        <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-6">
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
        <div className="py-16 sm:py-20 flex flex-col items-center justify-center text-center space-y-3">
          <Layers className="w-10 h-10 sm:w-12 sm:h-12 text-slate-700" />
          <p className="text-base sm:text-lg font-bold text-slate-300">No movies added to this collection yet</p>
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
