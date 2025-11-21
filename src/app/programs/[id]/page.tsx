import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { ProgramOverviewClient } from './ProgramOverviewClient'

export default async function ProgramOverviewPage({ params }: { params: { id: string } }) {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  return <ProgramOverviewClient programId={params.id} userId={session.user.id} />
}
