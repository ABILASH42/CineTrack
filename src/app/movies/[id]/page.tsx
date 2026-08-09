import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getMovieDetails, getTMDBBackdropUrl, getTMDBImageUrl } from '@/lib/tmdb/client'
import { getUserMovieStatus, getUserCollections } from '@/lib/services/movie-service'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/navbar'
import MovieActions from '@/components/movie-actions'
import { Star, Calendar, Clock, Film, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function MovieDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const tmdbId = parseInt(resolvedParams.id, 10)
  if (isNaN(tmdbId)) notFound()

  const movie = await getMovieDetails(tmdbId)
  if (!movie) notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let userStatus = null
  let collections: Array<{ id: string; name: string }> = []

  if (user) {
    userStatus = await getUserMovieStatus(user.id, tmdbId)
    const rawCollections = await getUserCollections(user.id)
    collections = rawCollections.map(c => ({ id: c.id, name: c.name }))
  }

  const backdropUrl = getTMDBBackdropUrl(movie.backdrop_path)
  const posterUrl = getTMDBImageUrl(movie.poster_path, 'w500')
  const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      <Navbar userEmail={user?.email} />

      {/* Backdrop Header */}
      <div className="relative w-full h-[40vh] min-h-[300px] overflow-hidden bg-zinc-900">
        {movie.backdrop_path && (
          <Image
            src={backdropUrl}
            alt={movie.title}
            fill
            priority
            className="object-cover opacity-30 blur-sm"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />

        <div className="container mx-auto px-4 sm:px-6 relative h-full flex items-end pb-8">
          <Link href="/search" className="absolute top-6 left-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-zinc-800 backdrop-blur-md transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Search
          </Link>
        </div>
      </div>

      {/* Content Container */}
      <main className="container mx-auto px-4 sm:px-6 -mt-24 relative z-10 pb-20 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left Column: Poster & Actions */}
          <div className="flex flex-col gap-6">
            <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 shadow-2xl">
              {movie.poster_path ? (
                <Image
                  src={posterUrl}
                  alt={movie.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 33vw"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-zinc-600 font-semibold">
                  No Poster Available
                </div>
              )}
            </div>

            <MovieActions
              tmdbId={tmdbId}
              userId={user?.id}
              initialStatus={userStatus?.status}
              initialRating={userStatus?.personalRating}
              userCollections={collections}
            />
          </div>

          {/* Right Column: Details & Overview */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {movie.genres?.map((g) => (
                  <span key={g.id} className="text-xs font-semibold px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300">
                    {g.name}
                  </span>
                ))}
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-2">
                {movie.title}
              </h1>

              {movie.tagline && (
                <p className="text-base italic text-amber-400/90 mb-4 font-medium">
                  &ldquo;{movie.tagline}&rdquo;
                </p>
              )}

              <div className="flex flex-wrap items-center gap-6 text-sm text-zinc-400 font-medium py-3 border-y border-zinc-900">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold text-base">
                  <Star className="h-5 w-5 fill-amber-400" />
                  <span>{movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}</span>
                  <span className="text-xs text-zinc-500 font-normal">({movie.vote_count} votes)</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-zinc-500" />
                  <span>{releaseYear}</span>
                </div>

                {movie.runtime && (
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-zinc-500" />
                    <span>{movie.runtime} minutes</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="text-lg font-bold text-zinc-200">Overview</h2>
              <p className="text-zinc-300 leading-relaxed text-base font-normal">
                {movie.overview || 'No overview available for this movie.'}
              </p>
            </div>

            {userStatus?.review && (
              <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-2">
                <h3 className="text-sm font-bold text-rose-400 uppercase tracking-wider">Your Recorded Review</h3>
                <p className="text-sm text-zinc-300 italic">&ldquo;{userStatus.review}&rdquo;</p>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  )
}
