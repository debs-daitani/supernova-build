require('dotenv').config();
const { getPrisma } = require('./utils/database');

/**
 * Seed Subscription Tiers
 * Populates the database with the three subscription tiers
 */

const tiers = [
  {
    name: 'BRAVE',
    displayName: 'Brave',
    price: 6,
    sortOrder: 1,
    features: JSON.stringify({
      snMessages: 100,
      emailSubscribers: 300,
      socialPlatforms: 1,
      socialPosts: 20,
    }),
  },
  {
    name: 'BOLD',
    displayName: 'Bold',
    price: 26,
    sortOrder: 2,
    features: JSON.stringify({
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
    }),
  },
  {
    name: 'BADASS',
    displayName: 'Badass',
    price: 260,
    sortOrder: 3,
    features: JSON.stringify({
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
      brandKits: 'unlimited',
      teamMembers: 'unlimited',
      prioritySupport: true,
      customDomain: true,
      whiteLabel: true,
    }),
  },
];

async function seedTiers() {
  const prisma = getPrisma();

  console.log('🌱 Seeding subscription tiers...');

  try {
    // Delete existing tiers
    await prisma.subscriptionTier.deleteMany();
    console.log('✅ Cleared existing tiers');

    // Create new tiers
    for (const tier of tiers) {
      await prisma.subscriptionTier.create({
        data: tier,
      });
      console.log(`✅ Created tier: ${tier.displayName} ($${tier.price}/mo)`);
    }

    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 Subscription tiers seeded successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('Available Tiers:');
    console.log('  • Brave ($6/mo) - 100 SN messages, 20 social posts');
    console.log('  • Bold ($26/mo) - 300 SN messages, 60 social posts, AI features');
    console.log('  • Badass ($260/mo) - Unlimited everything');
    console.log('');

    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding tiers:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

// Run seed
seedTiers();
