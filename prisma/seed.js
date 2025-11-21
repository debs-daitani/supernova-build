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
