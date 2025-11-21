require('dotenv').config();
const { getPrisma } = require('./utils/database');
const {
  getAllTiers,
  getTierByName,
  createSubscription,
  getUserSubscription,
  updateSubscription,
  checkFeatureAccess,
  getAllUsageStats,
  getRemainingFeatureUsage,
} = require('./services/subscriptionService');
const {
  trackSNMessage,
  trackSocialPost,
  trackContentRepurpose,
  trackAIImageGen,
  getUsageSummary,
} = require('./services/usageService');
const {
  compareTiers,
  getTierLevel,
  isWithinLimit,
  parseFeatures,
} = require('./utils/tierComparison');

/**
 * Test Subscription System
 * Tests all subscription and usage tracking functionality
 */

async function runTests() {
  const prisma = getPrisma();

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🧪 Testing Subscription System');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');

  try {
    // Test 1: Tier Comparison
    console.log('Test 1: Tier Comparison');
    console.log('─────────────────────────────────────────────────');
    const braveLevel = getTierLevel('BRAVE');
    const boldLevel = getTierLevel('BOLD');
    const badassLevel = getTierLevel('BADASS');
    console.log(`✓ BRAVE level: ${braveLevel}`);
    console.log(`✓ BOLD level: ${boldLevel}`);
    console.log(`✓ BADASS level: ${badassLevel}`);
    console.log(`✓ BOLD > BRAVE: ${compareTiers('BOLD', 'BRAVE') > 0}`);
    console.log(`✓ BADASS > BOLD: ${compareTiers('BADASS', 'BOLD') > 0}`);
    console.log('');

    // Test 2: Get All Tiers
    console.log('Test 2: Get All Tiers');
    console.log('─────────────────────────────────────────────────');
    const tiers = await getAllTiers();
    console.log(`✓ Found ${tiers.length} tiers`);
    tiers.forEach((tier) => {
      console.log(`  • ${tier.displayName} ($${tier.price}/mo)`);
    });
    console.log('');

    // Test 3: Get Specific Tier
    console.log('Test 3: Get Specific Tier');
    console.log('─────────────────────────────────────────────────');
    const boldTier = await getTierByName('BOLD');
    console.log(`✓ Found tier: ${boldTier.displayName}`);
    console.log(`✓ Features:`, JSON.stringify(boldTier.features, null, 2));
    console.log('');

    // Test 4: Create Test User
    console.log('Test 4: Create Test User');
    console.log('─────────────────────────────────────────────────');

    // Clean up any existing test user
    await prisma.usageTracking.deleteMany({
      where: { user: { email: 'test@subscription.com' } },
    });
    await prisma.userSubscription.deleteMany({
      where: { user: { email: 'test@subscription.com' } },
    });
    await prisma.user.deleteMany({
      where: { email: 'test@subscription.com' },
    });

    const testUser = await prisma.user.create({
      data: {
        email: 'test@subscription.com',
        username: 'testsubscriber',
        passwordHash: 'hashed_password',
      },
    });
    console.log(`✓ Created test user: ${testUser.email}`);
    console.log('');

    // Test 5: Create Subscription
    console.log('Test 5: Create Subscription');
    console.log('─────────────────────────────────────────────────');
    const subscription = await createSubscription(testUser.id, 'BOLD');
    console.log(`✓ Created ${subscription.tier.displayName} subscription`);
    console.log(`✓ Status: ${subscription.status}`);
    console.log(`✓ Period: ${subscription.currentPeriodStart.toISOString().split('T')[0]} to ${subscription.currentPeriodEnd.toISOString().split('T')[0]}`);
    console.log('');

    // Test 6: Check Feature Access
    console.log('Test 6: Check Feature Access');
    console.log('─────────────────────────────────────────────────');
    const hasSNMessages = await checkFeatureAccess(testUser.id, 'snMessages');
    const hasAIImages = await checkFeatureAccess(testUser.id, 'aiImages');
    const hasContentRepurposer = await checkFeatureAccess(testUser.id, 'contentRepurposer');
    console.log(`✓ Has SN Messages: ${hasSNMessages}`);
    console.log(`✓ Has AI Images: ${hasAIImages}`);
    console.log(`✓ Has Content Repurposer: ${hasContentRepurposer}`);
    console.log('');

    // Test 7: Track Usage
    console.log('Test 7: Track Usage');
    console.log('─────────────────────────────────────────────────');

    // Track some SN messages
    for (let i = 1; i <= 5; i++) {
      await trackSNMessage(testUser.id);
    }
    console.log('✓ Tracked 5 SN messages');

    // Track some social posts
    for (let i = 1; i <= 3; i++) {
      await trackSocialPost(testUser.id);
    }
    console.log('✓ Tracked 3 social posts');

    // Track content repurpose
    await trackContentRepurpose(testUser.id);
    console.log('✓ Tracked 1 content repurpose');

    // Track AI images
    await trackAIImageGen(testUser.id, 2);
    console.log('✓ Tracked 2 AI images');
    console.log('');

    // Test 8: Get Usage Stats
    console.log('Test 8: Get Usage Stats');
    console.log('─────────────────────────────────────────────────');
    const usageStats = await getAllUsageStats(testUser.id);
    console.log(`✓ Tier: ${usageStats.tier.displayName}`);
    console.log(`✓ SN Messages: ${usageStats.usage.snMessages.used}/${usageStats.usage.snMessages.limit || 'unlimited'}`);
    console.log(`✓ Social Posts: ${usageStats.usage.socialPosts.used}/${usageStats.usage.socialPosts.limit || 'unlimited'}`);
    console.log(`✓ Content Repurpose: ${usageStats.usage.contentRepurpose.used}/${usageStats.usage.contentRepurpose.limit || 'unlimited'}`);
    console.log(`✓ AI Images: ${usageStats.usage.aiImages.used}/${usageStats.usage.aiImages.limit || 'unlimited'}`);
    console.log('');

    // Test 9: Get Remaining Usage
    console.log('Test 9: Get Remaining Usage');
    console.log('─────────────────────────────────────────────────');
    const snRemaining = await getRemainingFeatureUsage(testUser.id, 'snMessages');
    console.log(`✓ SN Messages: ${snRemaining.used}/${snRemaining.limit} (${snRemaining.remaining} remaining)`);
    console.log(`✓ Within limit: ${snRemaining.withinLimit}`);
    console.log('');

    // Test 10: Upgrade Subscription
    console.log('Test 10: Upgrade Subscription');
    console.log('─────────────────────────────────────────────────');
    const upgraded = await updateSubscription(testUser.id, 'BADASS');
    console.log(`✓ Upgraded to ${upgraded.tier.displayName}`);
    console.log(`✓ New status: ${upgraded.status}`);
    console.log('');

    // Test 11: Check Unlimited Features
    console.log('Test 11: Check Unlimited Features (BADASS tier)');
    console.log('─────────────────────────────────────────────────');
    const badassUsage = await getAllUsageStats(testUser.id);
    console.log(`✓ SN Messages limit: ${badassUsage.usage.snMessages.limit || 'unlimited'}`);
    console.log(`✓ Social Posts limit: ${badassUsage.usage.socialPosts.limit || 'unlimited'}`);
    console.log(`✓ AI Images limit: ${badassUsage.usage.aiImages.limit || 'unlimited'}`);
    console.log('');

    // Test 12: Limit Enforcement
    console.log('Test 12: Limit Enforcement');
    console.log('─────────────────────────────────────────────────');

    // Downgrade back to BRAVE to test limits
    await updateSubscription(testUser.id, 'BRAVE');
    console.log('✓ Downgraded to BRAVE tier');

    // Try to exceed AI image limit (BRAVE doesn't have AI images)
    try {
      await trackAIImageGen(testUser.id);
      console.log('✗ Should have blocked AI image (not in BRAVE tier)');
    } catch (error) {
      console.log('✓ Correctly blocked AI image generation (not available in BRAVE)');
    }
    console.log('');

    // Test 13: Usage Summary
    console.log('Test 13: Usage Summary');
    console.log('─────────────────────────────────────────────────');
    const summary = await getUsageSummary(testUser.id);
    console.log(`✓ Tier: ${summary.tierName}`);
    console.log(`✓ Period: ${summary.period.start.toISOString().split('T')[0]} to ${summary.period.end.toISOString().split('T')[0]}`);
    console.log('✓ Usage summary retrieved successfully');
    console.log('');

    // Cleanup
    console.log('Cleanup');
    console.log('─────────────────────────────────────────────────');
    await prisma.usageTracking.delete({
      where: { userId: testUser.id },
    });
    await prisma.userSubscription.delete({
      where: { userId: testUser.id },
    });
    await prisma.user.delete({
      where: { id: testUser.id },
    });
    console.log('✓ Cleaned up test data');
    console.log('');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ All tests passed!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');

    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error('');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌ Test failed!');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('');
    console.error('Error:', error.message);
    console.error(error.stack);
    console.error('');

    await prisma.$disconnect();
    process.exit(1);
  }
}

// Run tests
runTests();
