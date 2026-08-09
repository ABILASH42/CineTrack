'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/navbar'
import MovieCard from '@/components/movie-card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search as SearchIcon, Loader2, Film } from 'lucide-react'
import { type TMDBMovie } from '@/lib/tmdb/client'

interface SearchPageClientProps {
  userEmail?: string | null
  initialMovies: TMDBMovie[]
  initialQuery: string
  genres: Array<{ id: number; name: string }>
}

export default function SearchPageClient({
  userEmail,
  initialMovies,
  initialQuery,
  genres
}: SearchPageClientProps) {
  const router = useRouter()
  const [query, setQuery] = useState(initialQuery)
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(() => {
      router.push(`/search?q=${encodeURIComponent(query)}`)
    })
  }

  const filteredMovies = selectedGenre
    ? initialMovies.filter((m) => m.genre_ids?.includes(selectedGenre))
    : initialMovies

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      <Navbar userEmail={userEmail} />

      <main className="container mx-auto px-4 sm:px-6 py-10 flex-1">
        <div className="max-w-3xl mx-auto text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4 bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            Discover Movies & Build Your Library
          </h1>
          <p className="text-zinc-400 text-sm sm:text-base mb-6">
            Search millions of movies on TMDB, view details, rate, and track progress.
          </p>

          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
              <Input
                type="text"
                placeholder="Search by movie title..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-12 h-12 bg-zinc-900/90 border-zinc-800 text-zinc-100 rounded-xl text-base focus:border-rose-500"
              />
            </div>
            <Button
              type="submit"
              disabled={isPending}
              className="h-12 px-6 bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-white font-bold rounded-xl"
            >
              {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Search'}
            </Button>
          </form>
        </div>

        {/* Genre Pill Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          <button
            onClick={() => setSelectedGenre(null)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              selectedGenre === null
                ? 'bg-rose-600 text-white shadow-md'
                : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:bg-zinc-800 hover:text-white'
            }`}
          >
            All Genres
          </button>
          {genres.map((g) => (
            <button
              key={g.id}
              onClick={() => setSelectedGenre(g.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                selectedGenre === g.id
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:bg-zinc-800 hover:text-white'
              }`}
            >
              {g.name}
            </button>
          ))}
        </div>

        {/* Results Grid */}
        {filteredMovies.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
            {filteredMovies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-zinc-900/30 border border-zinc-900 rounded-3xl">
            <Film className="h-12 w-12 text-zinc-700 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-zinc-300 mb-1">No movies found</h3>
            <p className="text-sm text-zinc-500">Try searching for a different title or clearing your genre filter.</p>
          </div>
        )}
      </main>
    </div>
  )
}
