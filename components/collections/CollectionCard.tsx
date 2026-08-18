'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Collection } from '@/types/movie';
import { getTMDBImageUrl } from '@/lib/tmdb';
import { Film, Layers } from 'lucide-react';

interface CollectionCardProps {
  collection: Collection;
}

export function CollectionCard({ collection }: CollectionCardProps) {
  const posters = collection.posters || [];

  return (
    <Link
      href={`/collections/${collection.id}`}
      className="group relative flex flex-col rounded-3xl overflow-hidden bg-slate-900/80 border border-white/10 hover:border-rose-500/50 active:scale-[0.98] transition-all duration-300 hover:shadow-2xl hover:shadow-rose-950/40 p-3 sm:p-4"
    >
      {/* Visual Collage Header */}
      <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-slate-950 grid grid-cols-3 gap-1 p-1">
        {posters.length > 0 ? (
          posters.slice(0, 3).map((path, idx) => (
            <div key={idx} className="relative h-full w-full overflow-hidden rounded-lg">
              <Image
                src={getTMDBImageUrl(path, 'w300')}
                alt={collection.name}
                fill
                sizes="(max-width: 640px) 30vw, 20vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          ))
        ) : (
          <div className="col-span-3 flex flex-col items-center justify-center text-slate-600 gap-1.5 h-full">
            <Film className="w-6 h-6 sm:w-8 sm:h-8" />
            <span className="text-[11px] sm:text-xs font-semibold">Empty Collection</span>
          </div>
        )}
      </div>

      {/* Collection Title & Meta */}
      <div className="mt-3 sm:mt-4 flex flex-col flex-1 justify-between">
        <div>
          <h3 className="font-extrabold text-base sm:text-lg text-slate-100 group-hover:text-rose-400 transition-colors line-clamp-1">
            {collection.name}
          </h3>
          <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
            {collection.description || 'No description added yet.'}
          </p>
        </div>

        <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-white/5 flex items-center justify-between text-xs font-semibold text-slate-500">
          <span className="flex items-center gap-1.5 text-slate-400 text-xs">
            <Layers className="w-3.5 h-3.5 text-rose-500" /> {posters.length} Titles
          </span>
          <span className="text-rose-400 text-xs group-hover:underline">Explore List →</span>
        </div>
      </div>
    </Link>
  );
}
