'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateMovieLibraryStatus, addMovieToCollection } from '@/lib/services/movie-service'
import { Button } from '@/components/ui/button'
import { Star, Plus, Check } from 'lucide-react'

interface MovieActionsProps {
  tmdbId: number
  userId?: string
  initialStatus?: string | null
  initialRating?: number | null
  userCollections?: Array<{ id: string; name: string }>
}

export default function MovieActions({
  tmdbId,
  userId,
  initialStatus = null,
  initialRating = null,
  userCollections = []
}: MovieActionsProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [status, setStatus] = useState<string | null>(initialStatus)
  const [rating, setRating] = useState<number | null>(initialRating)
  const [selectedCollection, setSelectedCollection] = useState<string>('')
  const [addedCollectionSuccess, setAddedCollectionSuccess] = useState(false)

  if (!userId) {
    return (
      <div className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 text-center">
        <p className="text-sm text-zinc-400 mb-3">Sign in to add this movie to your library and custom collections.</p>
        <Button onClick={() => router.push('/login')} className="w-full bg-rose-600 hover:bg-rose-700">
          Sign In
        </Button>
      </div>
    )
  }

  const handleStatusChange = async (newStatus: 'PLAN_TO_WATCH' | 'WATCHING' | 'WATCHED' | 'DROPPED') => {
    setStatus(newStatus)
    startTransition(async () => {
      await updateMovieLibraryStatus(userId, tmdbId, newStatus, rating)
      router.refresh()
    })
  }

  const handleRatingChange = async (newRating: number) => {
    setRating(newRating)
    if (!status) setStatus('WATCHED')
    startTransition(async () => {
      await updateMovieLibraryStatus(userId, tmdbId, (status as 'PLAN_TO_WATCH' | 'WATCHING' | 'WATCHED' | 'DROPPED') || 'WATCHED', newRating)
      router.refresh()
    })
  }

  const handleAddToCollection = async () => {
    if (!selectedCollection) return
    startTransition(async () => {
      await addMovieToCollection(userId, selectedCollection, tmdbId)
      setAddedCollectionSuccess(true)
      setTimeout(() => setAddedCollectionSuccess(false), 3000)
    })
  }

  return (
    <div className="flex flex-col gap-6 p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-xl backdrop-blur-md">
      {/* Watch Status Selector */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">
          Library Status
        </label>
        <div className="grid grid-cols-2 gap-2">
          {(['PLAN_TO_WATCH', 'WATCHING', 'WATCHED', 'DROPPED'] as const).map((st) => (
            <Button
              key={st}
              variant={status === st ? 'default' : 'outline'}
              disabled={isPending}
              onClick={() => handleStatusChange(st)}
              className={`text-xs font-bold h-10 ${
                status === st
                  ? 'bg-gradient-to-r from-amber-500 to-rose-600 text-white border-none shadow-md'
                  : 'bg-zinc-950/60 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white'
              }`}
            >
              {st.replace(/_/g, ' ')}
            </Button>
          ))}
        </div>
      </div>

      {/* Personal Rating */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Personal Rating
          </label>
          <span className="text-xs font-bold text-amber-400">
            {rating ? `${rating} / 10` : 'Not Rated'}
          </span>
        </div>
        <div className="flex items-center gap-1 bg-zinc-950/60 p-2 rounded-xl border border-zinc-800 justify-between">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
            <button
              key={star}
              disabled={isPending}
              onClick={() => handleRatingChange(star)}
              className="p-1 hover:scale-125 transition-transform"
            >
              <Star
                className={`h-4 w-4 ${
                  rating && star <= rating
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-zinc-700 hover:text-amber-300'
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Collections Dropdown */}
      {userCollections.length > 0 && (
        <div className="border-t border-zinc-800/80 pt-5">
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
            Add to Custom Collection
          </label>
          <div className="flex gap-2">
            <select
              value={selectedCollection}
              onChange={(e) => setSelectedCollection(e.target.value)}
              className="flex-1 bg-zinc-950/60 border border-zinc-800 text-zinc-200 text-xs rounded-xl px-3 py-2.5 outline-none focus:border-rose-500"
            >
              <option value="">Select a collection...</option>
              {userCollections.map((col) => (
                <option key={col.id} value={col.id}>
                  {col.name}
                </option>
              ))}
            </select>
            <Button
              onClick={handleAddToCollection}
              disabled={!selectedCollection || isPending}
              size="sm"
              className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl"
            >
              {addedCollectionSuccess ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            </Button>
          </div>
          {addedCollectionSuccess && (
            <p className="text-xs text-emerald-400 font-semibold mt-2">Added to collection!</p>
          )}
        </div>
      )}
    </div>
  )
}
