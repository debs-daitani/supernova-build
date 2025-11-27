import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌟 Seeding SUPERNova AI database...')

  // Create demo user
  const user = await prisma.user.upsert({
    where: { email: 'demo@daitaniverse.com' },
    update: {},
    create: {
      id: 'demo-user-1',
      email: 'demo@daitaniverse.com',
      password: 'demo-password-hash', // In production, use proper hashing
      name: 'Demo User',
      role: 'USER',
      subscriptionStatus: 'TRIAL',
      subscriptionTier: 'PRO',
      bio: 'Entrepreneur with ADHD exploring SUPERNova AI',
      skills: ['Marketing', 'Content Creation', 'Coaching'],
    },
  })

  console.log('✅ Created demo user:', user.email)

  // Create sample memories for the demo user
  const memories = await prisma.userMemory.createMany({
    data: [
      {
        userId: user.id,
        memoryType: 'FACT',
        content: 'Has ADHD and struggles with time management',
        importanceScore: 9.0,
        pillarTags: ['BRAIN'],
      },
      {
        userId: user.id,
        memoryType: 'GOAL',
        content: 'Wants to build a sustainable 6-figure coaching business',
        importanceScore: 10.0,
        pillarTags: ['BUSINESS'],
      },
      {
        userId: user.id,
        memoryType: 'PREFERENCE',
        content: 'Prefers direct, no-BS communication style',
        importanceScore: 8.0,
        pillarTags: [],
      },
      {
        userId: user.id,
        memoryType: 'FACT',
        content: 'Works best in the morning, energy crashes after 3pm',
        importanceScore: 7.5,
        pillarTags: ['BODY', 'BRAIN'],
      },
      {
        userId: user.id,
        memoryType: 'CONTEXT',
        content: 'Has a tendency to start many projects but struggle to finish them',
        importanceScore: 8.5,
        pillarTags: ['BRAIN', 'BUSINESS'],
      },
    ],
    skipDuplicates: true,
  })

  console.log('✅ Created', memories.count, 'sample memories')

  // Create a sample conversation
  const conversation = await prisma.conversation.create({
    data: {
      userId: user.id,
      title: 'Getting started with ADHD coaching',
      mode: 'BRAIN',
      messages: {
        create: [
          {
            userId: user.id,
            role: 'user',
            content: 'I keep starting projects but never finishing them. Help!',
          },
          {
            userId: user.id,
            role: 'assistant',
            content: 'Sounds like classic ADHD project hopping. Your brain gets that dopamine hit from the NEW and then ghosts the actual work. Let me guess - you\'ve got 5-10 "almost done" projects gathering dust right now?\n\nHere\'s the truth: your brain isn\'t broken, but the way you\'re approaching projects is. We need to redesign your system to work WITH your ADHD, not against it.\n\nFirst question: which ONE project would actually move the needle if you finished it? Not the sexiest one, not the newest one - the one that would create real impact or revenue.',
            modelUsed: 'claude-3-5-sonnet-20241022',
          },
        ],
      },
    },
  })

  console.log('✅ Created sample conversation:', conversation.id)

  console.log('\n🎉 Database seeded successfully!')
  console.log('\n📝 Demo credentials:')
  console.log('   Email: demo@daitaniverse.com')
  console.log('   User ID: demo-user-1')
  console.log('\n🚀 Start the app and visit /supernova to chat!')
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
