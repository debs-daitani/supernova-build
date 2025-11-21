import { redirect, notFound } from 'next/navigation'
import { auth } from '@/auth'
import { ContentViewClient } from './ContentViewClient'

export default async function ContentViewPage({ params }: { params: { id: string } }) {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  // Fetch content item via API on the client side for real-time updates
  return <ContentViewClient contentId={params.id} userId={session.user.id} />
}
