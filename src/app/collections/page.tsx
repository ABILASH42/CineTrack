import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserCollections } from '@/lib/services/movie-service'
import CollectionsClient from './collections-client'

export default async function CollectionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const collections = await getUserCollections(user.id)

  return (
    <CollectionsClient
      userEmail={user.email}
      userId={user.id}
      collections={collections}
    />
  )
}
