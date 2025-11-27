/**
 * Seed Membership Tiers
 * Populates database with default tiers, features, and add-ons
 *
 * Run with: node server/src/scripts/seedTiers.js
 */

const { DEFAULT_TIERS, DEFAULT_FEATURES, DEFAULT_ADDONS } = require('../config/membershipTiers');

// In production, you'd import your actual Prisma client
// For now, this is a template that shows the structure

async function seedTiers(prisma) {
  if (!prisma) {
    console.error('Prisma client not provided');
    console.log('Usage: Pass prisma client to seedTiers(prisma)');
    return;
  }

  console.log('🌱 Seeding membership tiers...\n');

  try {
    // Seed Membership Tiers
    console.log('📊 Seeding Membership Tiers...');
    for (const tierData of DEFAULT_TIERS) {
      const tier = await prisma.membershipTier.upsert({
        where: { slug: tierData.slug },
        update: tierData,
        create: tierData
      });
      console.log(`  ✓ ${tier.icon} ${tier.name} - £${tier.priceMonthly}/mo`);
    }

    console.log('');

    // Seed Features
    console.log('🎯 Seeding Features...');
    for (const featureData of DEFAULT_FEATURES) {
      const feature = await prisma.feature.upsert({
        where: { key: featureData.key },
        update: featureData,
        create: featureData
      });
      console.log(`  ✓ ${feature.name} (${feature.availableInTiers.length} tiers)`);
    }

    console.log('');

    // Seed Add-ons
    console.log('🔌 Seeding Add-ons...');
    for (const addOnData of DEFAULT_ADDONS) {
      const addOn = await prisma.addOn.upsert({
        where: { slug: addOnData.slug },
        update: addOnData,
        create: addOnData
      });
      console.log(`  ✓ ${addOn.name} - £${addOn.priceMonthly}/mo`);
    }

    console.log('');
    console.log('✅ Seeding complete!');
    console.log('');
    console.log('Summary:');
    console.log(`  - ${DEFAULT_TIERS.length} membership tiers`);
    console.log(`  - ${DEFAULT_FEATURES.length} features`);
    console.log(`  - ${DEFAULT_ADDONS.length} add-ons`);
    console.log('');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

/**
 * Standalone execution
 * If run directly (not imported), execute the seed
 */
if (require.main === module) {
  console.log('⚠️  This seed script requires a Prisma client');
  console.log('');
  console.log('To use this script:');
  console.log('1. Import your Prisma client');
  console.log('2. Call seedTiers(prisma)');
  console.log('');
  console.log('Example:');
  console.log('  const { PrismaClient } = require("@prisma/client");');
  console.log('  const prisma = new PrismaClient();');
  console.log('  const { seedTiers } = require("./seedTiers");');
  console.log('  await seedTiers(prisma);');
  console.log('');
}

module.exports = { seedTiers };
