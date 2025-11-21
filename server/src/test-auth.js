require('dotenv').config();
const authService = require('./services/authService');
const { prisma } = require('./config/database');

async function testAuthentication() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Testing Authentication System');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    // Test 1: Registration
    console.log('1️⃣  Testing User Registration...');
    const testEmail = `test-${Date.now()}@example.com`;
    const registrationResult = await authService.register({
      email: testEmail,
      password: 'SecurePassword123!',
      fullName: 'Test User',
      preferredName: 'Testy',
      pronouns: 'they/them'
    });

    console.log('   ✅ Registration successful');
    console.log(`   User ID: ${registrationResult.user.id}`);
    console.log(`   Email: ${registrationResult.user.email}`);
    console.log(`   Token generated: ${registrationResult.token.substring(0, 20)}...`);

    // Test 2: Login
    console.log('\n2️⃣  Testing User Login...');
    const loginResult = await authService.login({
      email: testEmail,
      password: 'SecurePassword123!'
    });

    console.log('   ✅ Login successful');
    console.log(`   User ID: ${loginResult.user.id}`);
    console.log(`   Profile: ${loginResult.user.profile.fullName}`);
    console.log(`   Token generated: ${loginResult.token.substring(0, 20)}...`);

    // Test 3: Invalid Login
    console.log('\n3️⃣  Testing Invalid Login...');
    try {
      await authService.login({
        email: testEmail,
        password: 'WrongPassword'
      });
      console.log('   ❌ Should have thrown an error');
    } catch (error) {
      console.log('   ✅ Invalid login rejected correctly');
      console.log(`   Error: ${error.message}`);
    }

    // Test 4: Password Reset Request
    console.log('\n4️⃣  Testing Password Reset Request...');
    const resetResult = await authService.requestPasswordReset(testEmail);

    console.log('   ✅ Password reset requested');
    console.log(`   Message: ${resetResult.message}`);
    if (resetResult.resetToken) {
      console.log(`   Reset Token: ${resetResult.resetToken.substring(0, 20)}...`);
    }

    // Test 5: Password Reset Confirmation
    console.log('\n5️⃣  Testing Password Reset Confirmation...');
    if (resetResult.resetToken) {
      const confirmResult = await authService.resetPassword({
        token: resetResult.resetToken,
        newPassword: 'NewSecurePassword456!'
      });

      console.log('   ✅ Password reset successful');
      console.log(`   Message: ${confirmResult.message}`);

      // Test 6: Login with new password
      console.log('\n6️⃣  Testing Login with New Password...');
      const newLoginResult = await authService.login({
        email: testEmail,
        password: 'NewSecurePassword456!'
      });

      console.log('   ✅ Login with new password successful');
      console.log(`   User ID: ${newLoginResult.user.id}`);
    }

    // Test 7: Validate Session
    console.log('\n7️⃣  Testing Session Validation...');
    const user = await authService.validateSession(registrationResult.user.id);

    console.log('   ✅ Session validated successfully');
    console.log(`   User: ${user.profile.fullName} (${user.email})`);
    console.log(`   Profile completed: ${user.profile.onboardingCompleted}`);

    // Test 8: Logout
    console.log('\n8️⃣  Testing Logout...');
    const logoutResult = await authService.logout(loginResult.token);

    console.log('   ✅ Logout successful');
    console.log(`   Message: ${logoutResult.message}`);

    // Clean up test user
    console.log('\n🧹 Cleaning up test user...');
    await prisma.user.delete({
      where: { id: registrationResult.user.id }
    });

    console.log('   ✅ Test user deleted');

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ All authentication tests passed!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

// Run tests
testAuthentication();
