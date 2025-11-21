import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { ContentLibraryClient } from './ContentLibraryClient'

export default async function ContentLibraryPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  // Fetch categories
  const categories = await prisma.contentCategory.findMany({
    orderBy: { order: 'asc' },
    include: {
      _count: {
        select: { items: true },
      },
    },
  })

  // Fetch user's role
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })

  return (
    <ContentLibraryClient
      categories={categories}
      userRole={user?.role || 'FREE'}
      userId={session.user.id}
    />
  )
}
