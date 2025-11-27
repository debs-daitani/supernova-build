/**
 * Master Seed File
 * Runs all database seeds for The dAItaniverse
 */

import seedMainSalesPage from './seeds/main-sales-page.js';

async function main() {
  console.log('🌱 Starting database seeding...\n');

  try {
    // Seed main sales page
    await seedMainSalesPage();

    console.log('\n✅ All seeds completed successfully!');
  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    throw error;
  }
}

main()
  .then(() => {
    console.log('\n🎉 Database seeding complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Fatal error during seeding:', error);
    process.exit(1);
  });
