import Link from 'next/link'
import Image from 'next/image'
import { Star, Calendar, Clock } from 'lucide-react'
import { getTMDBImageUrl, type TMDBMovie } from '@/lib/tmdb/client'

interface MovieCardProps {
  movie: TMDBMovie
  personalRating?: number | null
  statusBadge?: string
}

export default function MovieCard({ movie, personalRating, statusBadge }: MovieCardProps) {
  const posterUrl = getTMDBImageUrl(movie.poster_path, 'w500')
  const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'

  return (
    <Link href={`/movies/${movie.id}`} className="group relative block flex flex-col rounded-2xl overflow-hidden bg-zinc-900/80 border border-zinc-800/80 hover:border-amber-500/50 hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-300">
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-zinc-950">
        {movie.poster_path ? (
          <Image
            src={posterUrl}
            alt={movie.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-zinc-900 text-zinc-600 p-4 text-center text-sm font-semibold">
            No Poster Available
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

        {/* Rating Badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-zinc-950/85 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-amber-400 border border-amber-500/20">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          <span>{movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}</span>
        </div>

        {/* Personal Status Badge */}
        {statusBadge && (
          <div className="absolute top-3 left-3 bg-rose-600/90 text-white text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md backdrop-blur-md shadow-sm">
            {statusBadge.replace(/_/g, ' ')}
          </div>
        )}

        {personalRating !== undefined && personalRating !== null && (
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between bg-zinc-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-zinc-700/50">
            <span className="text-[11px] font-semibold text-zinc-400">My Rating</span>
            <div className="flex items-center gap-1 text-xs font-extrabold text-amber-400">
              <Star className="h-3 w-3 fill-amber-400" />
              <span>{personalRating}/10</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1 justify-between">
        <div>
          <h3 className="font-bold text-base text-zinc-100 group-hover:text-amber-400 line-clamp-1 transition-colors">
            {movie.title}
          </h3>
          <div className="flex items-center gap-3 text-xs text-zinc-400 mt-1.5 font-medium">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3 text-zinc-500" />
              {releaseYear}
            </span>
            {movie.runtime && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-zinc-500" />
                {movie.runtime}m
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
