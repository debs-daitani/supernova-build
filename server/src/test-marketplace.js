const { prisma } = require('./config/database');

async function test() {
  console.log('Testing i•DEA Marketplace models...\n');

  // Test idea categories
  console.log('📚 Fetching idea categories...');
  const categories = await prisma.ideaCategory.findMany({
    orderBy: {
      order: 'asc'
    }
  });

  console.log(`\n✅ Found ${categories.length} idea categories:\n`);

  categories.forEach(category => {
    console.log(`  ${category.icon} ${category.name}`);
  });

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 Database Statistics:\n');

  const stats = {
    ideaCategories: await prisma.ideaCategory.count(),
    subscriptionTiers: await prisma.subscriptionTier.count(),
    coachingPrograms: await prisma.coachingProgram.count(),
  };

  Object.entries(stats).forEach(([key, count]) => {
    console.log(`  ${key}: ${count}`);
  });

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ i•DEA Marketplace models working perfectly!\n');

  await prisma.$disconnect();
}

test().catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
