import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedDopamineMenu() {
  console.log('🍬 Seeding Dopamine Menu...')

  const menuItems = [
    // BRAIN - Executive Function Rescue
    {
      title: 'Text ONE person',
      description: 'Just one. Screenshot it back to me. That\'s it.',
      pillar: 'BRAIN',
      difficultyLevel: 1,
    },
    {
      title: '2-Minute Timer Challenge',
      description: 'Set a timer for 2 minutes. Do ANYTHING for 2 minutes. Doesn\'t matter what. Just move.',
      pillar: 'BRAIN',
      difficultyLevel: 1,
    },
    {
      title: 'Voice Dump',
      description: 'Record a 30-second voice memo. Say whatever\'s in your head. Don\'t think, just talk.',
      pillar: 'BRAIN',
      difficultyLevel: 1,
    },
    {
      title: 'Name 3 Things',
      description: 'Name 3 things you can see right now. That\'s the whole task.',
      pillar: 'BRAIN',
      difficultyLevel: 1,
    },
    {
      title: 'Screenshot Your Desktop',
      description: 'Take a screenshot of your current desktop. Send it. We\'re gonna talk about what\'s open.',
      pillar: 'BRAIN',
      difficultyLevel: 2,
    },
    {
      title: 'Delete 5 Emails',
      description: 'ANY 5 emails. Doesn\'t matter which. Just delete 5. Instant declutter hit.',
      pillar: 'BRAIN',
      difficultyLevel: 2,
    },
    {
      title: 'Close 3 Browser Tabs',
      description: 'Pick 3 tabs. Close them. Instant mental space.',
      pillar: 'BRAIN',
      difficultyLevel: 2,
    },
    {
      title: 'What Song Is Stuck?',
      description: 'Tell me what song is playing in your head right now. Then play it. Loud.',
      pillar: 'BRAIN',
      difficultyLevel: 1,
    },

    // BODY - Physical Reset
    {
      title: '30-Second Cold Water Blast',
      description: 'Cold water on your face for 30 seconds. Reset your nervous system. Come back.',
      pillar: 'BODY',
      difficultyLevel: 3,
    },
    {
      title: 'Drink Water Right Now',
      description: 'Get water. Drink it. All of it. Your brain is probably dehydrated.',
      pillar: 'BODY',
      difficultyLevel: 1,
    },
    {
      title: 'Stand Up and Stretch',
      description: 'Stand. Reach up. Touch your toes. 10 seconds. That\'s it.',
      pillar: 'BODY',
      difficultyLevel: 1,
    },
    {
      title: 'Walk Around the Block',
      description: 'Literally walk around your block. Or building. Or office. Move your body for 5 minutes.',
      pillar: 'BODY',
      difficultyLevel: 3,
    },
    {
      title: 'Deep Breath x3',
      description: 'In for 4. Hold for 4. Out for 4. Three times. Reset.',
      pillar: 'BODY',
      difficultyLevel: 1,
    },

    // BUSINESS - Micro Progress
    {
      title: 'Post ONE Thing on LinkedIn',
      description: 'One post. Doesn\'t have to be perfect. Just post SOMETHING.',
      pillar: 'BUSINESS',
      difficultyLevel: 4,
    },
    {
      title: 'Reply to ONE DM',
      description: 'Pick one DM you\'ve been avoiding. Reply. Just one.',
      pillar: 'BUSINESS',
      difficultyLevel: 3,
    },
    {
      title: 'Write ONE Idea',
      description: 'One content idea. One business idea. One anything. Write it down. That\'s progress.',
      pillar: 'BUSINESS',
      difficultyLevel: 2,
    },
    {
      title: 'Update Your Bio Somewhere',
      description: 'LinkedIn, Instagram, website, anywhere. Change ONE word in your bio. Instant progress.',
      pillar: 'BUSINESS',
      difficultyLevel: 2,
    },
    {
      title: 'Schedule ONE Post',
      description: 'Don\'t write it. Just schedule a time slot. You\'ll fill it later.',
      pillar: 'BUSINESS',
      difficultyLevel: 2,
    },
    {
      title: 'Send a Voice Note to a Client',
      description: 'Pick one client. Send them a 20-second check-in. Just "thinking of you" energy.',
      pillar: 'BUSINESS',
      difficultyLevel: 3,
    },

    // GENERAL - Pattern Interrupts
    {
      title: 'Fuck It - Dance Break',
      description: 'Put on ONE song. Dance like nobody\'s watching. Because they\'re not. 3 minutes.',
      pillar: 'GENERAL',
      difficultyLevel: 2,
    },
    {
      title: 'Say It Out Loud',
      description: 'Whatever you\'re stuck on, say it out loud. To yourself. Record it if you want. Just get it OUT.',
      pillar: 'GENERAL',
      difficultyLevel: 2,
    },
    {
      title: 'Change Your Location',
      description: 'Move to a different room. Different chair. Outside. Anywhere but where you are right now.',
      pillar: 'GENERAL',
      difficultyLevel: 2,
    },
    {
      title: 'Set a Stupid Goal',
      description: 'Not a real goal. A STUPID one. Like "touch my nose 10 times." Do it. Feel accomplished.',
      pillar: 'GENERAL',
      difficultyLevel: 1,
    },
  ]

  for (const item of menuItems) {
    await prisma.dopamineMenuItem.create({
      data: {
        ...item,
        userId: null, // Global menu items
      },
    })
  }

  console.log(`✅ Created ${menuItems.length} dopamine menu items!`)
}

seedDopamineMenu()
  .catch((e) => {
    console.error('❌ Error seeding dopamine menu:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
