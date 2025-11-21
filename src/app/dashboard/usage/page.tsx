import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { UsageDashboardClient } from './UsageDashboardClient'

export default async function UsageDashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  return <UsageDashboardClient userId={session.user.id} />
}
