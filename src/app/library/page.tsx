import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserLibrary } from '@/lib/services/movie-service'
import LibraryClient from './library-client'

export default async function LibraryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const userMovies = await getUserLibrary(user.id)

  return (
    <LibraryClient
      userEmail={user.email}
      userMovies={userMovies}
    />
  )
}
