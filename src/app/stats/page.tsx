import Navbar from '@/components/navbar'
import { createClient } from '@/lib/supabase/server'
import { getUserLibrary } from '@/lib/services/movie-service'
import { redirect } from 'next/navigation'
import { BarChart3, Clock, Star, Film, Flame, Award } from 'lucide-react'

export default async function StatsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const userMovies = await getUserLibrary(user.id)

  const watchedMovies = userMovies.filter(m => m.status === 'WATCHED')
  const totalRuntimeMinutes = watchedMovies.reduce((acc, m) => acc + (m.movie.runtime || 120), 0)
  const totalHours = (totalRuntimeMinutes / 60).toFixed(1)

  // Calculate Rating Distribution 1-10
  const ratingCounts: Record<number, number> = {}
  for (let i = 1; i <= 10; i++) ratingCounts[i] = 0
  userMovies.forEach((m) => {
    if (m.personalRating) {
      ratingCounts[m.personalRating] = (ratingCounts[m.personalRating] || 0) + 1
    }
  })

  const maxRatingCount = Math.max(...Object.values(ratingCounts), 1)

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      <Navbar userEmail={user.email} />

      <main className="container mx-auto px-4 sm:px-6 py-10 flex-1 space-y-10">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
            Viewing Analytics & Stats
          </h1>
          <p className="text-sm text-zinc-400 mt-1">Deep dive into your viewing progress and rating patterns</p>
        </div>

        {/* Highlight Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Total Movies Watched</p>
              <h3 className="text-3xl font-extrabold text-white mt-1">{watchedMovies.length}</h3>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Film className="h-6 w-6" />
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Total Watch Time</p>
              <h3 className="text-3xl font-extrabold text-white mt-1">{totalHours} <span className="text-base text-zinc-400 font-normal">hrs</span></h3>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <Clock className="h-6 w-6" />
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Library Size</p>
              <h3 className="text-3xl font-extrabold text-white mt-1">{userMovies.length}</h3>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Award className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Rating Breakdown Chart */}
        <div className="p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-400" />
              Personal Rating Distribution (1–10)
            </h3>
          </div>

          <div className="grid grid-cols-10 gap-2 items-end h-48 pt-6 border-b border-zinc-800 pb-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => {
              const count = ratingCounts[star]
              const heightPercent = (count / maxRatingCount) * 100

              return (
                <div key={star} className="flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-xs font-bold text-zinc-400 group-hover:text-amber-400 transition-colors">
                    {count}
                  </span>
                  <div className="w-full bg-zinc-950 rounded-t-lg overflow-hidden flex items-end h-full">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full bg-gradient-to-t from-amber-500 to-rose-500 rounded-t-lg transition-all duration-500"
                    />
                  </div>
                  <span className="text-xs font-semibold text-zinc-500">{star}★</span>
                </div>
              )
            })}
          </div>
        </div>
      </main>
    </div>
  )
}
