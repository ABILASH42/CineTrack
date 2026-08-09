import { searchMovies, getPopularMovies, getGenres } from '@/lib/tmdb/client'
import { createClient } from '@/lib/supabase/server'
import SearchPageClient from './search-client'

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const resolvedParams = await searchParams
  const query = resolvedParams.q || ''

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const searchData = query ? await searchMovies(query) : await getPopularMovies()
  const genres = await getGenres()

  return (
    <SearchPageClient
      userEmail={user?.email}
      initialMovies={searchData.results || []}
      initialQuery={query}
      genres={genres}
    />
  )
}
