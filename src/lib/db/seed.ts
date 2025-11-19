import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../auth'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create admin user
  const adminPassword = await hashPassword('admin123')
  const admin = await prisma.user.upsert({
    where: { email: 'admin@daitani.co.uk' },
    update: {},
    create: {
      email: 'admin@daitani.co.uk',
      passwordHash: adminPassword,
      name: 'Debs Daitani',
      role: 'ADMIN',
      emailVerified: true,
      subscriptionStatus: 'ACTIVE',
      subscriptionTier: 'ANNUAL',
    },
  })

  console.log('✅ Created admin user:', admin.email)

  // Create sample free user
  const freePassword = await hashPassword('password123')
  const freeUser = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      passwordHash: freePassword,
      name: 'Test User',
      role: 'FREE',
      emailVerified: true,
    },
  })

  console.log('✅ Created test user:', freeUser.email)

  // Create sample content
  const content1 = await prisma.contentLibrary.create({
    data: {
      title: 'Personal Branding Fundamentals',
      description: 'Learn how to build an authentic personal brand that attracts your ideal clients.',
      contentType: 'VIDEO',
      pillar: 'BUSINESS',
      tags: ['branding', 'marketing', 'strategy'],
      accessLevel: 'MEMBER',
      orderIndex: 1,
    },
  })

  const content2 = await prisma.contentLibrary.create({
    data: {
      title: 'ADHD-Friendly Business Systems',
      description: 'Build business systems that work WITH your ADHD brain, not against it.',
      contentType: 'VIDEO',
      pillar: 'BRAIN',
      tags: ['ADHD', 'systems', 'productivity'],
      accessLevel: 'MEMBER',
      orderIndex: 2,
    },
  })

  const content3 = await prisma.contentLibrary.create({
    data: {
      title: 'Menopause and Your Business',
      description: 'Navigate menopause while building your business. You've got this.',
      contentType: 'VIDEO',
      pillar: 'BODY',
      tags: ['menopause', 'health', 'midlife'],
      accessLevel: 'MEMBER',
      orderIndex: 3,
    },
  })

  console.log('✅ Created sample content')

  console.log('🎉 Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
