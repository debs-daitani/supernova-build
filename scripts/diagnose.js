#!/usr/bin/env node

/**
 * SUPERNova AI Diagnostic Script
 *
 * This script checks your environment setup and helps diagnose issues.
 */

console.log('🔍 SUPERNova AI Diagnostic Check\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Check environment variables
console.log('📋 Environment Variables:');
console.log('  - NODE_ENV:', process.env.NODE_ENV || 'not set');
console.log('  - ANTHROPIC_API_KEY:', process.env.ANTHROPIC_API_KEY ? '✅ Set (' + process.env.ANTHROPIC_API_KEY.substring(0, 10) + '...)' : '❌ MISSING');
console.log('  - DATABASE_URL:', process.env.DATABASE_URL ? '✅ Set' : '❌ MISSING');

if (!process.env.ANTHROPIC_API_KEY) {
  console.log('\n⚠️  WARNING: ANTHROPIC_API_KEY is not set!');
  console.log('   Create a .env file with: ANTHROPIC_API_KEY="sk-ant-..."');
}

if (!process.env.DATABASE_URL) {
  console.log('\n⚠️  WARNING: DATABASE_URL is not set!');
  console.log('   Create a .env file with: DATABASE_URL="postgresql://..."');
}

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Test database connection
console.log('🗄️  Testing Database Connection...\n');

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testDatabase() {
  try {
    console.log('  Connecting to database...');
    await prisma.$connect();
    console.log('  ✅ Database connection successful!\n');

    // Check if tables exist
    console.log('  Checking database tables...');
    const userCount = await prisma.user.count();
    console.log(`  ✅ User table found (${userCount} users)`);

    const conversationCount = await prisma.conversation.count();
    console.log(`  ✅ Conversation table found (${conversationCount} conversations)`);

    const messageCount = await prisma.message.count();
    console.log(`  ✅ Message table found (${messageCount} messages)`);

    const usageCount = await prisma.usageTracking.count();
    console.log(`  ✅ UsageTracking table found (${usageCount} records)`);

    console.log('\n  Database schema is properly set up! 🎉');

    // Check if we have at least one user
    if (userCount === 0) {
      console.log('\n⚠️  WARNING: No users found in database!');
      console.log('   You need to create a test user:');
      console.log('   1. Run: npm run db:studio');
      console.log('   2. Create a User with:');
      console.log('      - id: user-123');
      console.log('      - email: test@example.com');
      console.log('      - tier: MEMBER');
    } else {
      console.log('\n📊 Users in database:');
      const users = await prisma.user.findMany({
        select: { id: true, email: true, tier: true },
        take: 5,
      });
      users.forEach(user => {
        console.log(`   - ${user.id} (${user.email}) - ${user.tier}`);
      });
    }
  } catch (error) {
    console.log('  ❌ Database connection failed!\n');
    console.error('Error:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('  1. Check DATABASE_URL in .env file');
    console.log('  2. Make sure PostgreSQL is running');
    console.log('  3. Run: npm run db:push');
    console.log('  4. Check database credentials');
  } finally {
    await prisma.$disconnect();
  }
}

// Test Anthropic API
async function testAnthropicAPI() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('🤖 Testing Anthropic API Connection...\n');

  if (!process.env.ANTHROPIC_API_KEY) {
    console.log('  ⚠️  Skipping (ANTHROPIC_API_KEY not set)');
    return;
  }

  try {
    const Anthropic = require('@anthropic-ai/sdk');
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    console.log('  Sending test request to Claude...');
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 50,
      messages: [{ role: 'user', content: 'Say hi in 5 words or less' }],
    });

    console.log('  ✅ Anthropic API connection successful!');
    console.log('  Response:', message.content[0].text);
    console.log('  Model:', message.model);
    console.log(`  Tokens: ${message.usage.input_tokens} in + ${message.usage.output_tokens} out`);
  } catch (error) {
    console.log('  ❌ Anthropic API connection failed!\n');
    console.error('Error:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('  1. Check ANTHROPIC_API_KEY in .env file');
    console.log('  2. Verify API key is valid');
    console.log('  3. Check your Anthropic account has credits');
    console.log('  4. Try regenerating the API key');
  }
}

// Run diagnostics
(async () => {
  try {
    await testDatabase();
    await testAnthropicAPI();

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Diagnostics Complete\n');
    console.log('If all checks passed, run: npm run dev');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Diagnostic failed:', error);
    process.exit(1);
  }
})();
