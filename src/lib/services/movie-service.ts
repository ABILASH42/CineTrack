'use server'

import prisma from '@/lib/db/client'
import { getMovieDetails } from '@/lib/tmdb/client'
import { revalidatePath } from 'next/cache'

export async function syncTMDBMovieToDB(tmdbId: number) {
  let movie = await prisma.movie.findUnique({
    where: { tmdbId }
  })

  if (movie) return movie

  const details = await getMovieDetails(tmdbId)
  if (!details) throw new Error('Movie not found on TMDB')

  movie = await prisma.movie.create({
    data: {
      tmdbId: details.id,
      imdbId: details.imdb_id || null,
      title: details.title,
      originalTitle: details.original_title || details.title,
      originalLanguage: details.original_language || 'en',
      overview: details.overview || '',
      tagline: details.tagline || null,
      posterPath: details.poster_path || null,
      backdropPath: details.backdrop_path || null,
      releaseDate: details.release_date ? new Date(details.release_date) : null,
      runtime: details.runtime || null,
      tmdbRating: details.vote_average || 0,
      tmdbVoteCount: details.vote_count || 0,
      popularity: details.popularity || 0,
    }
  })

  return movie
}

export async function updateMovieLibraryStatus(
  userId: string,
  tmdbId: number,
  status: 'PLAN_TO_WATCH' | 'WATCHING' | 'WATCHED' | 'DROPPED',
  personalRating?: number | null,
  review?: string | null
) {
  const movie = await syncTMDBMovieToDB(tmdbId)

  const existing = await prisma.userMovie.findUnique({
    where: {
      userId_movieId: {
        userId,
        movieId: movie.id
      }
    }
  })

  let userMovie
  if (existing) {
    userMovie = await prisma.userMovie.update({
      where: { id: existing.id },
      data: {
        status,
        personalRating: personalRating !== undefined ? personalRating : existing.personalRating,
        review: review !== undefined ? review : existing.review,
        completedAt: status === 'WATCHED' ? new Date() : existing.completedAt
      }
    })
  } else {
    userMovie = await prisma.userMovie.create({
      data: {
        userId,
        movieId: movie.id,
        status,
        personalRating: personalRating ?? null,
        review: review ?? null,
        completedAt: status === 'WATCHED' ? new Date() : null
      }
    })
  }

  if (status === 'WATCHED') {
    await prisma.watchHistory.create({
      data: {
        userId,
        movieId: movie.id,
        ratingAtWatchTime: personalRating ?? null
      }
    })
  }

  revalidatePath('/library')
  revalidatePath('/dashboard')
  revalidatePath(`/movies/${tmdbId}`)
  return userMovie
}

export async function getUserMovieStatus(userId: string, tmdbId: number) {
  try {
    const movie = await prisma.movie.findUnique({
      where: { tmdbId }
    })
    if (!movie) return null

    return await prisma.userMovie.findUnique({
      where: {
        userId_movieId: {
          userId,
          movieId: movie.id
        }
      }
    })
  } catch (error) {
    console.error('Database query failed in getUserMovieStatus:', error)
    return null
  }
}

export async function getUserLibrary(userId: string, statusFilter?: string) {
  const whereClause: { userId: string; status?: string } = { userId }
  if (statusFilter && statusFilter !== 'ALL') {
    whereClause.status = statusFilter
  }

  try {
    return await prisma.userMovie.findMany({
      where: whereClause,
      include: {
        movie: true
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })
  } catch (error) {
    console.error('Database connection failed in getUserLibrary:', error)
    return []
  }
}

export async function getUserCollections(userId: string) {
  try {
    return await prisma.collection.findMany({
      where: { userId },
      include: {
        movies: {
          include: {
            movie: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })
  } catch (error) {
    console.error('Database connection failed in getUserCollections:', error)
    return []
  }
}

export async function createCollection(userId: string, name: string, description?: string) {
  const collection = await prisma.collection.create({
    data: {
      userId,
      name,
      description: description || null
    }
  })
  revalidatePath('/collections')
  return collection
}

export async function addMovieToCollection(userId: string, collectionId: string, tmdbId: number) {
  const collection = await prisma.collection.findFirst({
    where: { id: collectionId, userId }
  })
  if (!collection) throw new Error('Collection not found or access denied')

  const movie = await syncTMDBMovieToDB(tmdbId)

  await prisma.collectionMovie.upsert({
    where: {
      collectionId_movieId: {
        collectionId,
        movieId: movie.id
      }
    },
    create: {
      collectionId,
      movieId: movie.id
    },
    update: {}
  })

  revalidatePath('/collections')
  revalidatePath(`/collections/${collectionId}`)
}
