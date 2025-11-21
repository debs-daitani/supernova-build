import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { MyLearningClient } from './MyLearningClient'

export default async function MyLearningPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  return <MyLearningClient userId={session.user.id} />
}
