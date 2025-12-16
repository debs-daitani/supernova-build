import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // First, show ALL users
  console.log('\n=== ALL USERS BEFORE ===')
  const allUsers = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' }
  })
  console.table(allUsers)

  // Update ALL users that have debs in email to ADMIN (case insensitive)
  const result = await prisma.user.updateMany({
    where: {
      OR: [
        { email: { contains: 'debs', mode: 'insensitive' } },
        { email: { contains: 'daitani', mode: 'insensitive' } },
      ]
    },
    data: { role: 'ADMIN' }
  })

  console.log('\n>>> Updated', result.count, 'users to ADMIN')

  // Show all users after
  console.log('\n=== ALL USERS AFTER ===')
  const afterUsers = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' }
  })
  console.table(afterUsers)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
