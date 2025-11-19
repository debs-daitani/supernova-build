/**
 * YOUR User Migration Script
 * Imports users from Wix CSV export into The dAItaniverse
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// Quiz tester names (18 people who get lifetime free access)
const QUIZ_TESTERS = [
  'Ria Jackson',
  'Rachael Rocco',
  'Nina de Sausmarez',
  'Natalie Ingham',
  'Felicity Pryke',
  'Anna Foxx Neal',
  'Catherine Nina',
  'Georgia Norval',
  'Helen Vasiliou Field',
  'Joanna Wood',
  'Karen Colqhoun',
  'Jo Swann',
  'Maddy Alexander Grout',
  'Emma Last',
  'Yuliya Poberezhnik',
  'Tee Murairwa',
  'Rachel Peru',
  'Rachel Savory',
  'Sara Cox'
];

/**
 * Check if user is a quiz tester
 */
function isQuizTester(name, email) {
  if (!name) return false;

  const normalizedName = name.toLowerCase().trim();

  return QUIZ_TESTERS.some(testerName => {
    const normalizedTester = testerName.toLowerCase().trim();
    return normalizedName === normalizedTester;
  });
}

/**
 * Generate secure random password
 */
function generateTemporaryPassword() {
  // Generate readable but secure password: 3 words + 2 numbers
  const words = ['Super', 'Nova', 'Impact', 'Quiz', 'Authentic', 'Dream', 'Build', 'Create'];
  const word1 = words[Math.floor(Math.random() * words.length)];
  const word2 = words[Math.floor(Math.random() * words.length)];
  const word3 = words[Math.floor(Math.random() * words.length)];
  const num = Math.floor(Math.random() * 100);

  return `${word1}${word2}${word3}${num}`;
}

/**
 * Hash password using bcrypt
 */
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Parse CSV line into object
 */
function parseCSVLine(line, headers) {
  // Simple CSV parser (handles basic quoting)
  const values = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current.trim());

  // Map to object
  const obj = {};
  headers.forEach((header, index) => {
    obj[header] = values[index] || '';
  });

  return obj;
}

/**
 * Read and parse CSV file
 */
function readCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());

  if (lines.length === 0) {
    throw new Error('CSV file is empty');
  }

  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const row = parseCSVLine(lines[i], headers);
    rows.push(row);
  }

  return rows;
}

/**
 * Validate email format
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Create user account
 */
async function createUser(userData, batchId, options = {}) {
  const { email, name, signupDate, source, tags, originalData } = userData;
  const { isTester = false, sendEmail = true } = options;

  // Validate email
  if (!isValidEmail(email)) {
    throw new Error(`Invalid email format: ${email}`);
  }

  // Check for duplicate
  const existing = await prisma.user.findUnique({
    where: { email: email.toLowerCase() }
  });

  if (existing) {
    throw new Error('DUPLICATE');
  }

  // Generate temporary password
  const tempPassword = generateTemporaryPassword();
  const hashedPassword = await hashPassword(tempPassword);

  // Determine membership tier
  let membershipTier = 'FREE';
  if (isTester) {
    membershipTier = 'SUPERNOVA_LTE';
  }

  // Create user
  const user = await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      name: name || null,
      password: hashedPassword,

      // Migration metadata
      migratedFrom: 'wix',
      migratedAt: new Date(),
      migrationBatch: batchId,
      originalUserId: null,

      // Quiz tester status
      isQuizTester: isTester,
      lifetimeAccess: isTester,

      // Password management
      requirePasswordReset: true,
      temporaryPassword: tempPassword, // Store plaintext temporarily for email

      // Additional data
      importSource: source || null,
      originalTags: tags ? tags.split(',').map(t => t.trim()) : [],

      // Membership
      membershipTier: membershipTier,

      // Timestamps
      createdAt: signupDate ? new Date(signupDate) : new Date(),
      updatedAt: new Date()
    }
  });

  // Log the migrated user
  await prisma.migratedUser.create({
    data: {
      batchId,
      originalEmail: email,
      originalName: name || null,
      originalData: originalData || {},
      userId: user.id,
      status: 'success',
      emailSent: false
    }
  });

  return { user, tempPassword };
}

/**
 * Send welcome email
 */
async function sendWelcomeEmail(user, tempPassword, isQuizTester = false) {
  // In production, integrate with your email service (SendGrid, Mailgun, etc.)
  // For now, we'll just log the email content

  const emailContent = isQuizTester
    ? getQuizTesterEmail(user, tempPassword)
    : getSubscriberEmail(user, tempPassword);

  console.log(`\n📧 Email to ${user.email}:`);
  console.log(`Subject: ${emailContent.subject}`);
  console.log(`Password: ${tempPassword}`);
  console.log('---');

  // TODO: Integrate with email service
  // await emailService.send({
  //   to: user.email,
  //   subject: emailContent.subject,
  //   html: emailContent.html,
  //   text: emailContent.text
  // });

  return true;
}

/**
 * Get quiz tester email template
 */
function getQuizTesterEmail(user, tempPassword) {
  return {
    subject: 'Thank You! Your Lifetime Access is Ready 🎉',
    html: `
      <h1>Thank You for Being a Quiz Tester! 🎉</h1>
      <p>Dear ${user.name || 'there'},</p>
      <p>As one of our original 18 quiz testers, you have <strong>lifetime free access</strong> to SUPERNova-LTE!</p>

      <h2>Your Login Credentials</h2>
      <p>Email: <strong>${user.email}</strong></p>
      <p>Temporary Password: <strong>${tempPassword}</strong></p>

      <p><a href="https://thedaitaniverse.com/login">Login to The dAItaniverse</a></p>

      <p>You'll be prompted to change your password on first login.</p>

      <h3>What's Included (Forever Free):</h3>
      <ul>
        <li>Full SUPERNova-LTE access</li>
        <li>All premium features</li>
        <li>Impact Authenticator Quiz</li>
        <li>Microblogging platform</li>
        <li>Video platform</li>
        <li>And much more!</li>
      </ul>

      <p>Thank you for your support and feedback! You helped make this platform amazing.</p>

      <p>With gratitude,<br>Debs Daitani<br>Founder, The dAItaniverse</p>
    `,
    text: `
Thank You for Being a Quiz Tester!

Dear ${user.name || 'there'},

As one of our original 18 quiz testers, you have lifetime free access to SUPERNova-LTE!

Your Login Credentials:
Email: ${user.email}
Temporary Password: ${tempPassword}

Login here: https://thedaitaniverse.com/login

You'll be prompted to change your password on first login.

What's Included (Forever Free):
- Full SUPERNova-LTE access
- All premium features
- Impact Authenticator Quiz
- Microblogging platform
- Video platform
- And much more!

Thank you for your support and feedback!

With gratitude,
Debs Daitani
Founder, The dAItaniverse
    `.trim()
  };
}

/**
 * Get subscriber email template
 */
function getSubscriberEmail(user, tempPassword) {
  return {
    subject: 'Welcome to The dAItaniverse - Your Account is Ready!',
    html: `
      <h1>Welcome to The dAItaniverse! 🚀</h1>
      <p>Hi ${user.name || 'there'},</p>
      <p>Great news! We've migrated your subscription from Wix, and your account on our new platform is ready.</p>

      <h2>Your Login Credentials</h2>
      <p>Email: <strong>${user.email}</strong></p>
      <p>Temporary Password: <strong>${tempPassword}</strong></p>

      <p><a href="https://thedaitaniverse.com/login">Login to The dAItaniverse</a></p>

      <p>You'll be prompted to change your password on first login.</p>

      <h3>What's Available Now:</h3>
      <ul>
        <li>Free tier access (forever)</li>
        <li>Impact Authenticator Quiz</li>
        <li>Community features</li>
        <li>Basic platform access</li>
      </ul>

      <h3>Want More? Upgrade to SUPERNova-LTE:</h3>
      <ul>
        <li>Full platform access</li>
        <li>Microblogging (Twitter/X killer)</li>
        <li>Video platform (YouTube/TikTok killer)</li>
        <li>AI-powered tools</li>
        <li>And much more!</li>
      </ul>
      <p>Only £26/month - <a href="https://thedaitaniverse.com/pricing">View Plans</a></p>

      <p>Looking forward to seeing you on the platform!</p>

      <p>Best,<br>Debs Daitani<br>Founder, The dAItaniverse</p>
    `,
    text: `
Welcome to The dAItaniverse!

Hi ${user.name || 'there'},

Great news! We've migrated your subscription from Wix, and your account on our new platform is ready.

Your Login Credentials:
Email: ${user.email}
Temporary Password: ${tempPassword}

Login here: https://thedaitaniverse.com/login

You'll be prompted to change your password on first login.

What's Available Now:
- Free tier access (forever)
- Impact Authenticator Quiz
- Community features
- Basic platform access

Want More? Upgrade to SUPERNova-LTE (£26/month):
- Full platform access
- Microblogging (Twitter/X killer)
- Video platform (YouTube/TikTok killer)
- AI-powered tools
- And much more!

View plans: https://thedaitaniverse.com/pricing

Looking forward to seeing you on the platform!

Best,
Debs Daitani
Founder, The dAItaniverse
    `.trim()
  };
}

/**
 * Main migration function
 */
async function migrateUsers(csvFilePath, options = {}) {
  const { dryRun = false, sendEmails = true } = options;

  console.log('🚀 Starting user migration from Wix...\n');

  // Create migration log
  const batchId = `wix_${Date.now()}`;
  const migrationLog = await prisma.migrationLog.create({
    data: {
      batchId,
      source: 'wix',
      filename: path.basename(csvFilePath),
      fileSize: fs.statSync(csvFilePath).size,
      status: 'IN_PROGRESS'
    }
  });

  // Read CSV
  console.log(`📄 Reading CSV file: ${csvFilePath}`);
  const users = readCSV(csvFilePath);
  console.log(`Found ${users.length} users to migrate\n`);

  // Statistics
  let successCount = 0;
  let duplicateCount = 0;
  let errorCount = 0;
  let emailsSent = 0;
  let emailsFailed = 0;

  const errors = [];
  const successes = [];
  const skipped = [];

  // Process each user
  for (const userData of users) {
    const email = userData.email?.trim().toLowerCase();
    const name = userData.name?.trim();

    if (!email) {
      console.log(`⚠️  Skipping row with no email`);
      errorCount++;
      errors.push({ row: userData, error: 'No email provided' });
      continue;
    }

    try {
      // Check if quiz tester
      const isTester = isQuizTester(name, email);

      if (dryRun) {
        console.log(`[DRY RUN] Would create: ${email} ${isTester ? '(QUIZ TESTER)' : ''}`);
        successCount++;
        continue;
      }

      // Create user
      const { user, tempPassword } = await createUser(
        {
          email,
          name,
          signupDate: userData.signup_date || userData.signupDate,
          source: userData.source,
          tags: userData.tags,
          originalData: userData
        },
        batchId,
        { isTester }
      );

      console.log(`✅ Created: ${email}${isTester ? ' (QUIZ TESTER - Lifetime Free)' : ''}`);
      successCount++;
      successes.push({
        email,
        name,
        userId: user.id,
        isQuizTester: isTester,
        password: tempPassword
      });

      // Send welcome email
      if (sendEmails) {
        try {
          await sendWelcomeEmail(user, tempPassword, isTester);
          emailsSent++;

          // Update migrated user record
          await prisma.migratedUser.updateMany({
            where: {
              batchId,
              originalEmail: email
            },
            data: {
              emailSent: true,
              emailSentAt: new Date()
            }
          });
        } catch (emailError) {
          console.log(`⚠️  Email failed for ${email}: ${emailError.message}`);
          emailsFailed++;
        }
      }

    } catch (error) {
      if (error.message === 'DUPLICATE') {
        console.log(`⏭️  Skipped (duplicate): ${email}`);
        duplicateCount++;
        skipped.push({ email, name, reason: 'duplicate' });

        // Log as duplicate
        await prisma.migratedUser.create({
          data: {
            batchId,
            originalEmail: email,
            originalName: name,
            originalData: userData,
            status: 'duplicate',
            errorMessage: 'User already exists'
          }
        });
      } else {
        console.log(`❌ Error creating ${email}: ${error.message}`);
        errorCount++;
        errors.push({ email, name, error: error.message });

        // Log as error
        await prisma.migratedUser.create({
          data: {
            batchId,
            originalEmail: email,
            originalName: name,
            originalData: userData,
            status: 'error',
            errorMessage: error.message
          }
        });
      }
    }
  }

  // Update migration log
  const finalStatus = errorCount === 0 && successCount > 0 ? 'COMPLETED' :
                      successCount === 0 ? 'FAILED' : 'PARTIAL';

  await prisma.migrationLog.update({
    where: { id: migrationLog.id },
    data: {
      totalProcessed: users.length,
      successCount,
      duplicateCount,
      errorCount,
      emailsSent,
      emailsFailed,
      status: finalStatus,
      completedAt: new Date(),
      errorLog: errors,
      successLog: successes,
      skippedLog: skipped
    }
  });

  // Print summary
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 MIGRATION SUMMARY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Total Processed: ${users.length}`);
  console.log(`✅ Successfully Created: ${successCount}`);
  console.log(`⏭️  Skipped (Duplicates): ${duplicateCount}`);
  console.log(`❌ Errors: ${errorCount}`);
  console.log(`📧 Emails Sent: ${emailsSent}`);
  console.log(`⚠️  Emails Failed: ${emailsFailed}`);
  console.log(`\nBatch ID: ${batchId}`);
  console.log(`Status: ${finalStatus}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // List quiz testers
  const quizTesters = successes.filter(s => s.isQuizTester);
  if (quizTesters.length > 0) {
    console.log('🎉 QUIZ TESTERS (Lifetime Free Access):');
    quizTesters.forEach(qt => {
      console.log(`  - ${qt.name} (${qt.email})`);
    });
    console.log('');
  }

  // Show errors if any
  if (errors.length > 0) {
    console.log('❌ ERRORS:');
    errors.forEach(err => {
      console.log(`  - ${err.email}: ${err.error}`);
    });
    console.log('');
  }

  return {
    batchId,
    totalProcessed: users.length,
    successCount,
    duplicateCount,
    errorCount,
    emailsSent,
    emailsFailed,
    status: finalStatus,
    quizTesters,
    errors
  };
}

/**
 * Run migration from command line
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: node migrateYourUsers.js <csv-file-path> [--dry-run] [--no-emails]');
    console.log('\nExample:');
    console.log('  node migrateYourUsers.js data/wix-subscribers.csv');
    console.log('  node migrateYourUsers.js data/wix-subscribers.csv --dry-run');
    process.exit(1);
  }

  const csvFilePath = args[0];
  const dryRun = args.includes('--dry-run');
  const sendEmails = !args.includes('--no-emails');

  if (!fs.existsSync(csvFilePath)) {
    console.error(`❌ File not found: ${csvFilePath}`);
    process.exit(1);
  }

  try {
    await migrateUsers(csvFilePath, { dryRun, sendEmails });
    console.log('✅ Migration completed successfully!\n');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = {
  migrateUsers,
  isQuizTester,
  generateTemporaryPassword
};
