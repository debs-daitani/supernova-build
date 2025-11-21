import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { LessonPlayerClient } from './LessonPlayerClient'

export default async function LessonPlayerPage({
  params,
}: {
  params: { id: string; lessonId: string }
}) {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  return (
    <LessonPlayerClient
      programId={params.id}
      lessonId={params.lessonId}
      userId={session.user.id}
    />
  )
}
