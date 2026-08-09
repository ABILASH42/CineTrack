'use client'

import { useState } from 'react'
import Navbar from '@/components/navbar'
import MovieCard from '@/components/movie-card'
import { Button } from '@/components/ui/button'
import { Library, LayoutGrid, List as ListIcon, Filter } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { getTMDBImageUrl } from '@/lib/tmdb/client'

interface LibraryClientProps {
  userEmail?: string | null
  userMovies: Array<{
    id: string
    status: string
    personalRating: number | null
    review: string | null
    movie: {
      id: string
      tmdbId: number
      title: string
      posterPath: string | null
      releaseDate: Date | null
      runtime: number | null
      tmdbRating: number | null
    }
  }>
}

export default function LibraryClient({ userEmail, userMovies }: LibraryClientProps) {
  const [activeTab, setActiveTab] = useState<string>('ALL')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const filteredMovies = activeTab === 'ALL'
    ? userMovies
    : userMovies.filter(um => um.status === activeTab)

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      <Navbar userEmail={userEmail} />

      <main className="container mx-auto px-4 sm:px-6 py-10 flex-1">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              My Personal Library
            </h1>
            <p className="text-sm text-zinc-400 mt-1">
              Organize and view all tracked movies in your collection ({userMovies.length} total)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode('grid')}
              className={`h-9 px-3 ${viewMode === 'grid' ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-zinc-900 border-zinc-800 text-zinc-400'}`}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode('list')}
              className={`h-9 px-3 ${viewMode === 'list' ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-zinc-900 border-zinc-800 text-zinc-400'}`}
            >
              <ListIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-2 border-b border-zinc-800 pb-4 mb-8 overflow-x-auto">
          {[
            { id: 'ALL', label: 'All Movies' },
            { id: 'PLAN_TO_WATCH', label: 'Plan to Watch' },
            { id: 'WATCHING', label: 'Watching' },
            { id: 'WATCHED', label: 'Watched' },
            { id: 'DROPPED', label: 'Dropped' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-amber-500 to-rose-600 text-white shadow-md'
                  : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:bg-zinc-800 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Library Content */}
        {filteredMovies.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
              {filteredMovies.map((um) => (
                <MovieCard
                  key={um.id}
                  movie={{
                    id: um.movie.tmdbId,
                    title: um.movie.title,
                    poster_path: um.movie.posterPath,
                    backdrop_path: null,
                    release_date: um.movie.releaseDate ? new Date(um.movie.releaseDate).toISOString() : '',
                    vote_average: um.movie.tmdbRating || 0,
                    vote_count: 0,
                    popularity: 0,
                    overview: '',
                    runtime: um.movie.runtime || undefined
                  }}
                  personalRating={um.personalRating}
                  statusBadge={um.status}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredMovies.map((um) => (
                <Link
                  key={um.id}
                  href={`/movies/${um.movie.tmdbId}`}
                  className="flex items-center justify-between p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800/80 hover:border-amber-500/50 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative h-16 w-12 rounded-lg overflow-hidden bg-zinc-950 shrink-0">
                      {um.movie.posterPath && (
                        <Image
                          src={getTMDBImageUrl(um.movie.posterPath, 'w92')}
                          alt={um.movie.title}
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-zinc-100">{um.movie.title}</h4>
                      <p className="text-xs text-zinc-400 mt-1">
                        Status: <span className="text-amber-400 font-semibold">{um.status.replace(/_/g, ' ')}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-bold text-amber-400">
                      {um.personalRating ? `${um.personalRating} / 10` : 'Not Rated'}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )
        ) : (
          <div className="text-center py-20 bg-zinc-900/30 border border-zinc-900 rounded-3xl">
            <Library className="h-12 w-12 text-zinc-700 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-zinc-300 mb-1">No movies in this list</h3>
            <p className="text-sm text-zinc-500 mb-6">Discover movies and add them to your tracking library.</p>
            <Link href="/search">
              <Button className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl">
                Discover Movies
              </Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
