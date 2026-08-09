'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/navbar'
import { createCollection } from '@/lib/services/movie-service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FolderHeart, Plus, Film, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { getTMDBImageUrl } from '@/lib/tmdb/client'

interface CollectionsClientProps {
  userEmail?: string | null
  userId: string
  collections: Array<{
    id: string
    name: string
    description: string | null
    updatedAt: Date
    movies: Array<{
      movie: {
        id: string
        tmdbId: number
        title: string
        posterPath: string | null
      }
    }>
  }>
}

export default function CollectionsClient({ userEmail, userId, collections }: CollectionsClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showModal, setShowModal] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    startTransition(async () => {
      await createCollection(userId, name, description)
      setName('')
      setDescription('')
      setShowModal(false)
      router.refresh()
    })
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      <Navbar userEmail={userEmail} />

      <main className="container mx-auto px-4 sm:px-6 py-10 flex-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              Custom Collections
            </h1>
            <p className="text-sm text-zinc-400 mt-1">
              Curate thematic lists such as Malayalam Favorites, Best Horror, or Nolan Films
            </p>
          </div>

          <Button
            onClick={() => setShowModal(true)}
            className="bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-white font-bold rounded-xl shadow-md"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Collection
          </Button>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-4">
              <h3 className="text-xl font-bold text-zinc-100">Create New Collection</h3>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Name</label>
                  <Input
                    type="text"
                    placeholder="e.g. Malayalam Masterpieces"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="bg-zinc-950 border-zinc-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Description</label>
                  <Input
                    type="text"
                    placeholder="Brief note on what this list is about"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="bg-zinc-950 border-zinc-800"
                  />
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isPending}
                    className="bg-rose-600 hover:bg-rose-700 text-white"
                  >
                    Save
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Collections List */}
        {collections.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.map((col) => (
              <div key={col.id} className="flex flex-col p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 hover:border-zinc-700 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-lg text-zinc-100">{col.name}</h3>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-zinc-800 text-amber-400">
                    {col.movies.length} {col.movies.length === 1 ? 'movie' : 'movies'}
                  </span>
                </div>
                {col.description && (
                  <p className="text-xs text-zinc-400 mb-4 line-clamp-2">{col.description}</p>
                )}

                {/* Movie Preview Row */}
                <div className="flex items-center gap-2 my-4 overflow-hidden h-20 bg-zinc-950/60 p-2 rounded-xl border border-zinc-800/50">
                  {col.movies.length > 0 ? (
                    col.movies.slice(0, 4).map((cm) => (
                      <div key={cm.movie.id} className="relative h-16 w-12 rounded-md overflow-hidden bg-zinc-900 shrink-0">
                        {cm.movie.posterPath && (
                          <Image
                            src={getTMDBImageUrl(cm.movie.posterPath, 'w92')}
                            alt={cm.movie.title}
                            fill
                            className="object-cover"
                          />
                        )}
                      </div>
                    ))
                  ) : (
                    <span className="text-xs text-zinc-600 italic px-2">No movies added yet</span>
                  )}
                </div>

                <div className="mt-auto pt-2 flex justify-end">
                  <Link href={`/search`} className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1">
                    Add More Movies <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-zinc-900/30 border border-zinc-900 rounded-3xl">
            <FolderHeart className="h-12 w-12 text-zinc-700 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-zinc-300 mb-1">No collections created</h3>
            <p className="text-sm text-zinc-500 mb-6">Create your first custom movie collection to organize list recommendations.</p>
            <Button
              onClick={() => setShowModal(true)}
              className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl"
            >
              Create Collection
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}
