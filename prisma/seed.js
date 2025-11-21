const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const brave = await prisma.subscriptionTier.create({
    data: {
      name: 'BRAVE',
      price: 6.00,
      currency: 'GBP',
      description: 'Perfect for testing the waters',
      features: {
        snMessages: 100,
        emailSubscribers: 300,
        socialPlatforms: 1,
        socialPosts: 20,
        coachingPrograms: false,
        websiteBuilder: false,
        ideaMarketplace: false
      }
    }
  });

  const bold = await prisma.subscriptionTier.create({
    data: {
      name: 'BOLD',
      price: 26.00,
      currency: 'GBP',
      description: 'Everything you need to build and grow',
      features: {
        snMessages: 300,
        emailSubscribers: 1000,
        socialPlatforms: 'all',
        socialPosts: 60,
        contentRepurposer: 4,
        aiImages: 10,
        aiVideos: 2,
        photoLibraryGB: 5,
        courses: 6,
        storeProducts: 50,
        websites: 1,
        mockupsPerWeek: 1,
        coachingPrograms: true,
        websiteBuilder: true,
        ideaMarketplace: true
      }
    }
  });

  const badass = await prisma.subscriptionTier.create({
    data: {
      name: 'BADASS',
      price: 260.00,
      currency: 'GBP',
      description: 'Unlimited everything for established entrepreneurs',
      features: {
        snMessages: 'unlimited',
        emailSubscribers: 'unlimited',
        socialPlatforms: 'all',
        socialPosts: 'unlimited',
        contentRepurposer: 'unlimited',
        aiImages: 'unlimited',
        aiVideos: 'unlimited',
        photoLibraryGB: 'unlimited',
        courses: 'unlimited',
        storeProducts: 'unlimited',
        websites: 'unlimited',
        mockupsPerWeek: 'unlimited',
        coachingPrograms: true,
        websiteBuilder: true,
        ideaMarketplace: true,
        whiteLabel: true,
        prioritySupport: true,
        monthlyCall: true
      }
    }
  });

  console.log('✅ Created subscription tiers:', { brave, bold, badass });

  // Coaching Programs
  const bbb01 = await prisma.coachingProgram.create({
    data: {
      code: 'BBB01',
      name: 'The BADASS Branding Blueprint',
      description: 'Build your bold, authentic brand that stands out in a world of beige boring bullshit.',
      tier: 'BOLD',
      order: 1,
      modules: {
        create: [
          {
            title: 'Your Brand Foundation',
            description: 'Discover who you really are and what you stand for',
            order: 1,
            lessons: {
              create: [
                {
                  title: 'Welcome to BADASS Branding',
                  content: 'Introduction to building an authentic brand',
                  contentType: 'text',
                  duration: 10,
                  order: 1
                },
                {
                  title: 'Your Brand Values',
                  content: 'Identifying what you stand for',
                  contentType: 'text',
                  duration: 15,
                  order: 2
                }
              ]
            }
          },
          {
            title: 'Your Brand Voice',
            description: 'Finding your authentic communication style',
            order: 2,
            lessons: {
              create: [
                {
                  title: 'Authentic vs Performative',
                  content: 'The difference between real and fake',
                  contentType: 'text',
                  duration: 12,
                  order: 1
                }
              ]
            }
          }
        ]
      }
    }
  });

  const bai01 = await prisma.coachingProgram.create({
    data: {
      code: 'BAI01',
      name: 'Authentic Impact - BADASS AI Strategies for Entrepreneurs',
      description: 'Master AI tools without losing your humanity or becoming a robot.',
      tier: 'BOLD',
      order: 2,
      modules: {
        create: [
          {
            title: 'AI Foundations',
            description: 'Understanding AI without the tech jargon',
            order: 1,
            lessons: {
              create: [
                {
                  title: 'Welcome to AI for Humans',
                  content: 'AI is a tool, not magic. Learn how to use it.',
                  contentType: 'text',
                  duration: 8,
                  order: 1
                },
                {
                  title: 'What AI Can (and Cannot) Do',
                  content: 'Real capabilities vs hype',
                  contentType: 'text',
                  duration: 15,
                  order: 2
                }
              ]
            }
          },
          {
            title: 'AI in Your Business',
            description: 'Practical applications that actually matter',
            order: 2,
            lessons: {
              create: [
                {
                  title: 'Content Creation with AI',
                  content: 'Speed up without selling out',
                  contentType: 'text',
                  duration: 20,
                  order: 1
                }
              ]
            }
          }
        ]
      }
    }
  });

  console.log('✅ Created coaching programs:', { bbb01, bai01 });
  console.log('✅ Seed complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
