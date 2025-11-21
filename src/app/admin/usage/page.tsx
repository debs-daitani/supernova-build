import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { AdminUsageClient } from './AdminUsageClient'

export default async function AdminUsagePage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  // Check if user has ADMIN role
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })

  if (!user || user.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  return <AdminUsageClient />
}
