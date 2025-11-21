const { prisma, testConnection } = require('./config/database');

async function test() {
  console.log('Testing database connection...');
  await testConnection();

  console.log('\nQuerying subscription tiers...');
  const tiers = await prisma.subscriptionTier.findMany();
  console.log('Tiers:', tiers);

  console.log('\n✅ Database is working!');

  await prisma.$disconnect();
}

test().catch(console.error);
