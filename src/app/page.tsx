import Link from 'next/link'
import { getTrendingMovies, getPopularMovies } from '@/lib/tmdb/client'
import Navbar from '@/components/navbar'
import MovieCard from '@/components/movie-card'
import { Button } from '@/components/ui/button'
import { Film, Search, Sparkles, Library, CheckCircle2, BookmarkPlus, BarChart3 } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const trending = await getTrendingMovies()
  const popular = await getPopularMovies()

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-100 selection:bg-rose-500 selection:text-white">
      <Navbar userEmail={user?.email} />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(244,63,94,0.25),rgba(255,255,255,0))]" />
        <div className="container relative mx-auto px-4 sm:px-6 text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/90 border border-zinc-800 text-xs font-semibold text-amber-400 mb-6 shadow-xl backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Powered by TMDB API & Supabase</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight bg-gradient-to-b from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent leading-[1.1] mb-6">
            Track, Organize & Master Your <span className="bg-gradient-to-r from-amber-400 via-rose-500 to-purple-500 bg-clip-text text-transparent">Movie Library</span>
          </h1>

          <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            Build your personal cinematic collection, log viewing history, write custom reviews, create themed lists, and uncover your watching statistics.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href={user ? "/search" : "/register"}>
              <Button size="lg" className="h-12 px-8 text-base font-bold bg-gradient-to-r from-amber-500 via-rose-600 to-purple-600 hover:opacity-90 text-white shadow-xl shadow-rose-600/25 rounded-xl">
                <Search className="h-5 w-5 mr-2" />
                Explore & Add Movies
              </Button>
            </Link>
            <Link href={user ? "/dashboard" : "/login"}>
              <Button size="lg" variant="outline" className="h-12 px-8 text-base font-semibold border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800 hover:text-white rounded-xl">
                {user ? "Go to Dashboard" : "Sign In to Your Account"}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Badges */}
      <section className="py-10 border-y border-zinc-900 bg-zinc-950/50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/40">
              <BookmarkPlus className="h-6 w-6 text-amber-400" />
              <span className="font-bold text-sm">4 Watch Statuses</span>
              <span className="text-xs text-zinc-500">Plan, Watching, Watched, Dropped</span>
            </div>
            <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/40">
              <Library className="h-6 w-6 text-rose-500" />
              <span className="font-bold text-sm">Custom Collections</span>
              <span className="text-xs text-zinc-500">Group by genres, directors, themes</span>
            </div>
            <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/40">
              <CheckCircle2 className="h-6 w-6 text-purple-500" />
              <span className="font-bold text-sm">Ratings & Reviews</span>
              <span className="text-xs text-zinc-500">Log ratings 0-10 & personal notes</span>
            </div>
            <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/40">
              <BarChart3 className="h-6 w-6 text-emerald-400" />
              <span className="font-bold text-sm">Watch Analytics</span>
              <span className="text-xs text-zinc-500">Runtime, genres, rating distributions</span>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Movies Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Trending Movies</h2>
              <p className="text-sm text-zinc-400 mt-1">Popular movies trending worldwide today</p>
            </div>
            <Link href="/search" className="text-sm font-semibold text-rose-400 hover:text-rose-300">
              View All →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
            {trending.slice(0, 6).map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-zinc-900 py-8 text-center text-xs text-zinc-500">
        <div className="container mx-auto px-4">
          <p>© {new Date().getFullYear()} CineTrack. All movie metadata provided by TMDB.</p>
        </div>
      </footer>
    </div>
  )
}
