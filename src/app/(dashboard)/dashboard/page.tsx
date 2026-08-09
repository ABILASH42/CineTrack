import Navbar from '@/components/navbar'
import MovieCard from '@/components/movie-card'
import { createClient } from '@/lib/supabase/server'
import { getUserLibrary } from '@/lib/services/movie-service'
import { getPopularMovies } from '@/lib/tmdb/client'
import { redirect } from 'next/navigation'
import { Film, Clock, Star, Library, Flame } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const userMovies = await getUserLibrary(user.id)
  const popular = await getPopularMovies()

  const watchedCount = userMovies.filter(m => m.status === 'WATCHED').length

  const ratedMovies = userMovies.filter(m => m.personalRating !== null && m.personalRating !== undefined)
  const avgRating = ratedMovies.length > 0
    ? (ratedMovies.reduce((acc, m) => acc + (m.personalRating || 0), 0) / ratedMovies.length).toFixed(1)
    : 'N/A'

  const totalRuntimeMinutes = userMovies
    .filter(m => m.status === 'WATCHED')
    .reduce((acc, m) => acc + (m.movie.runtime || 120), 0)
  const totalHours = Math.round(totalRuntimeMinutes / 60)

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      <Navbar userEmail={user.email} />

      <main className="container mx-auto px-4 sm:px-6 py-10 flex-1 space-y-10">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
            Welcome back, {user.email?.split('@')[0]}!
          </h1>
          <p className="text-sm text-zinc-400 mt-1">Here is a summary of your personal movie management metrics</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Library className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-zinc-400 font-semibold uppercase">Total Tracked</p>
              <h3 className="text-2xl font-extrabold text-white mt-0.5">{userMovies.length}</h3>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Film className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-zinc-400 font-semibold uppercase">Watched</p>
              <h3 className="text-2xl font-extrabold text-white mt-0.5">{watchedCount}</h3>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Star className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-zinc-400 font-semibold uppercase">Avg Rating</p>
              <h3 className="text-2xl font-extrabold text-white mt-0.5">{avgRating}</h3>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-zinc-400 font-semibold uppercase">Time Spent</p>
              <h3 className="text-2xl font-extrabold text-white mt-0.5">{totalHours} hrs</h3>
            </div>
          </div>
        </div>

        {/* Recently Added Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
              <Library className="h-5 w-5 text-purple-400" />
              Recently Added to Library
            </h2>
            <Link href="/library" className="text-xs font-semibold text-rose-400 hover:text-rose-300">
              View All Library →
            </Link>
          </div>

          {userMovies.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
              {userMovies.slice(0, 6).map((um) => (
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
            <div className="p-8 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 text-center">
              <p className="text-sm text-zinc-400 mb-4">You haven&apos;t added any movies to your library yet.</p>
              <Link href="/search" className="inline-block px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700">
                Discover Movies Now
              </Link>
            </div>
          )}
        </div>

        {/* Discover Popular Movies Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
              <Flame className="h-5 w-5 text-amber-400" />
              Popular Recommendations
            </h2>
            <Link href="/search" className="text-xs font-semibold text-rose-400 hover:text-rose-300">
              Search More →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
            {popular.results.slice(0, 6).map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
