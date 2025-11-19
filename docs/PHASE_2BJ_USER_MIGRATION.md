# Phase 2BJ: YOUR User Migration

Complete system for importing your existing users from Wix into The dAItaniverse platform.

## 📋 Table of Contents

- [Overview](#overview)
- [Database Schema](#database-schema)
- [Quiz Testers](#quiz-testers)
- [Migration Script](#migration-script)
- [Admin Interface](#admin-interface)
- [API Endpoints](#api-endpoints)
- [Email Templates](#email-templates)
- [How to Export from Wix](#how-to-export-from-wix)
- [Running the Migration](#running-the-migration)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

Phase 2BJ provides a complete user migration system that:

- **Imports 200+ email subscribers** from Wix
- **Identifies 18 quiz testers** automatically by name
- **Grants lifetime free SUPERNova-LTE** to quiz testers
- **Generates temporary passwords** for all users
- **Sends welcome emails** with login credentials
- **Tracks migration progress** with detailed logging
- **Handles duplicates** and errors gracefully
- **Provides admin interface** for easy import

Think of it as: **A turnkey solution to migrate all YOUR users without data loss**.

## 🗄️ Database Schema

### User Model Extensions

```prisma
model User {
  // Migration metadata
  migratedFrom      String?   // "wix", "shopify", etc.
  migratedAt        DateTime? // When migrated
  originalUserId    String?   // Their ID in old system
  migrationBatch    String?   // Batch identifier

  // Quiz tester special status
  isQuizTester      Boolean   @default(false)
  lifetimeAccess    Boolean   @default(false)
  quizResults       Json?     // Impact Authenticator results
  quizCompletedAt   DateTime?

  // Temporary password
  requirePasswordReset Boolean @default(false)
  temporaryPassword    String? // Cleared after first login

  // Additional data
  migrationNotes    String?
  importSource      String?   // "landing_page", "quiz", etc.
  originalTags      String[]  // Tags from old system
}
```

### New Models

**MigrationLog** - Tracks each migration batch
```prisma
- batchId (unique identifier)
- totalProcessed, successCount, duplicateCount, errorCount
- emailsSent, emailsFailed
- source ("wix"), migratedBy (admin user)
- startedAt, completedAt
- status (PENDING, IN_PROGRESS, COMPLETED, FAILED, PARTIAL)
- errorLog, successLog, skippedLog (JSON arrays)
- filename, fileSize
```

**MigratedUser** - Individual user import record
```prisma
- batchId (links to MigrationLog)
- originalEmail, originalName, originalData (JSON)
- userId (if created successfully)
- status ("success", "duplicate", "error")
- errorMessage
- emailSent, emailSentAt
```

## 🎯 Quiz Testers

### The 18 Quiz Testers (Lifetime Free Access)

The script automatically recognizes these names and grants them:
- ✅ Lifetime free SUPERNova-LTE membership
- ✅ `isQuizTester: true` flag
- ✅ `lifetimeAccess: true` flag
- ✅ Special "Thank You" email

**Names:**
1. Ria Jackson
2. Rachael Rocco
3. Nina de Sausmarez
4. Natalie Ingham
5. Felicity Pryke
6. Anna Foxx Neal
7. Catherine Nina
8. Georgia Norval
9. Helen Vasiliou Field
10. Joanna Wood
11. Karen Colqhoun
12. Jo Swann
13. Maddy Alexander Grout
14. Emma Last
15. Yuliya Poberezhnik
16. Tee Murairwa
17. Rachel Peru
18. Rachel Savory
19. Sara Cox

**Recognition Logic:**
- Matches by exact name (case-insensitive)
- Automatic tier assignment: SUPERNova-LTE
- No manual tagging required

## ⚙️ Migration Script

**File:** `/server/src/scripts/migrateYourUsers.js`

### Usage

**Command Line:**
```bash
# Run migration
node server/src/scripts/migrateYourUsers.js data/wix-subscribers.csv

# Dry run (preview only, no changes)
node server/src/scripts/migrateYourUsers.js data/wix-subscribers.csv --dry-run

# Skip sending emails
node server/src/scripts/migrateYourUsers.js data/wix-subscribers.csv --no-emails
```

**Programmatic:**
```javascript
const { migrateUsers } = require('./server/src/scripts/migrateYourUsers');

const result = await migrateUsers('data/wix-subscribers.csv', {
  dryRun: false,
  sendEmails: true
});

console.log(`Success: ${result.successCount}`);
console.log(`Errors: ${result.errorCount}`);
```

### What It Does

1. **Reads CSV file** - Parses email, name, signup_date, source, tags
2. **Validates data** - Checks email format, required fields
3. **Checks for duplicates** - Skips users already in database
4. **Identifies quiz testers** - Matches names against list
5. **Generates passwords** - Creates secure temporary passwords (e.g., "SuperNovaDream42")
6. **Creates users** - Inserts into database with migration metadata
7. **Assigns tiers** - Quiz testers get SUPERNova-LTE, others get Free
8. **Sends emails** - Welcome emails with login credentials
9. **Logs everything** - Creates MigrationLog and MigratedUser records
10. **Returns summary** - Statistics and results

### Features

- **Automatic quiz tester detection** by name
- **Duplicate handling** - Skips existing users
- **Error handling** - Continues on error, logs all issues
- **Batch tracking** - Unique batch ID for each run
- **Email templates** - Different for quiz testers vs. regular users
- **Dry run mode** - Preview without changes
- **Progress logging** - Real-time console output
- **Detailed reporting** - Success/error/skip lists

## 🖥️ Admin Interface

**File:** `/client/src/pages/Admin/MigrationPanel.jsx`

**URL:** `/admin/migration`

### Features

**Upload & Import Tab:**
- Drag-and-drop CSV upload
- File size validation
- Preview first 5 rows
- Column header detection
- Dry run preview
- One-click import

**Results Tab:**
- Success/duplicate/error counts
- Quiz testers list
- Email send status
- Detailed error messages
- Batch ID tracking

**History Tab:**
- All previous migrations
- Status badges (COMPLETED, FAILED, PARTIAL)
- Success/error statistics
- Resend emails option
- View detailed logs

**Log Details Tab:**
- Per-user import status
- Email sent confirmation
- Error messages
- Original data view
- Batch metadata

### Screenshots Description

1. **Upload Interface:**
   - Clean file upload area
   - CSV format instructions
   - Preview table after upload

2. **Results Dashboard:**
   - Statistics cards (total, success, errors)
   - Quiz testers highlight
   - Status indicators

3. **History Table:**
   - Date, source, counts, status
   - Action buttons (View, Resend)
   - Sortable columns

## 🔌 API Endpoints

**File:** `/server/src/routes/migration.js`

### Admin Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/migration/logs` | List all migration logs |
| GET | `/api/migration/logs/:batchId` | Get specific log details |
| GET | `/api/migration/stats` | Get migration statistics |
| POST | `/api/migration/upload` | Upload CSV file |
| POST | `/api/migration/preview` | Dry run preview |
| POST | `/api/migration/run` | Run actual migration |
| POST | `/api/migration/resend-emails/:batchId` | Resend welcome emails |
| DELETE | `/api/migration/logs/:batchId` | Delete migration log |

### Example Requests

**Upload CSV:**
```javascript
const formData = new FormData();
formData.append('file', csvFile);

const response = await fetch('/api/migration/upload', {
  method: 'POST',
  body: formData
});

const { filename, filepath, totalRows, preview } = await response.json();
```

**Run Migration:**
```javascript
const response = await fetch('/api/migration/run', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    filepath: '/uploads/migrations/migration_123.csv',
    sendEmails: true
  })
});

const { result } = await response.json();
console.log(`Created ${result.successCount} users`);
```

**Get Statistics:**
```javascript
const response = await fetch('/api/migration/stats');
const stats = await response.json();

console.log(`Total migrations: ${stats.totalMigrations}`);
console.log(`Total users: ${stats.totalUsers}`);
console.log(`Quiz testers: ${stats.quizTesters}`);
```

## 📧 Email Templates

### Quiz Tester Email

**Subject:** "Thank You! Your Lifetime Access is Ready 🎉"

**Content:**
- Personal thank you for being a quiz tester
- Explanation of lifetime free access
- Login credentials (email + temp password)
- What's included (all SUPERNova-LTE features)
- CTA to login

### Regular Subscriber Email

**Subject:** "Welcome to The dAItaniverse - Your Account is Ready!"

**Content:**
- Welcome message
- Explanation of migration from Wix
- Login credentials
- Free tier benefits
- Invitation to explore
- Option to upgrade to SUPERNova-LTE (£26/month)
- CTA to login

### Email Variables

Both templates include:
- `{user.name}` - User's full name
- `{user.email}` - Email address
- `{tempPassword}` - Generated temporary password
- Login link: `https://thedaitaniverse.com/login`

## 📤 How to Export from Wix

### Step 1: Access Wix Dashboard
1. Login to Wix.com
2. Go to your site dashboard
3. Navigate to **Contacts** or **Site Members**

### Step 2: Export Contacts
1. Click **Export** button
2. Select **All Contacts** or filter as needed
3. Choose **CSV format**
4. Include these fields:
   - Email (required)
   - First Name + Last Name (or Full Name)
   - Created Date (signup date)
   - Source
   - Tags/Labels

### Step 3: Clean CSV
1. Open in Excel/Google Sheets
2. Ensure column headers match:
   - `email` (required)
   - `name` (combine first + last if needed)
   - `signup_date`
   - `source`
   - `tags`
3. Remove any test/spam emails
4. Save as CSV

### Expected CSV Format

```csv
email,name,signup_date,source,tags
user1@example.com,John Smith,2024-10-15,landing_page,interested
user2@example.com,Jane Doe,2024-11-01,quiz,quiz_tester
```

**Column Descriptions:**
- `email` - User email address (REQUIRED)
- `name` - Full name (optional, but needed for quiz tester matching)
- `signup_date` - Original signup date (optional, format: YYYY-MM-DD)
- `source` - Where they signed up (optional: "landing_page", "quiz", "blog", etc.)
- `tags` - Comma-separated tags (optional: "interested", "quiz_tester", etc.)

## 🚀 Running the Migration

### Option 1: Via Admin Interface (Recommended)

1. **Navigate to Admin Panel:**
   - Go to `https://thedaitaniverse.com/admin/migration`
   - Login as admin

2. **Upload CSV:**
   - Click "Upload & Import" tab
   - Select your CSV file
   - Click "Upload File"

3. **Preview Data:**
   - Review preview table
   - Check headers are correct
   - Verify sample rows look good

4. **Run Preview (Optional):**
   - Click "Run Preview (Dry Run)"
   - See how many users would be created
   - Check for any errors

5. **Import Users:**
   - Click "Import Users"
   - Wait for completion
   - View results summary

6. **Verify:**
   - Check "Results" tab
   - Confirm quiz testers identified
   - Review any errors

### Option 2: Via Command Line

1. **Prepare CSV file:**
   ```bash
   # Place CSV in data folder
   cp /path/to/wix-export.csv data/wix-subscribers.csv
   ```

2. **Run dry run first:**
   ```bash
   cd server
   node src/scripts/migrateYourUsers.js ../data/wix-subscribers.csv --dry-run
   ```

3. **Review output:**
   - Check counts
   - Verify quiz testers identified
   - Look for errors

4. **Run actual migration:**
   ```bash
   node src/scripts/migrateYourUsers.js ../data/wix-subscribers.csv
   ```

5. **Check results:**
   - Review console output
   - Check database for users
   - Verify emails sent

### Option 3: Programmatic

```javascript
const { PrismaClient } = require('@prisma/client');
const { migrateUsers } = require('./server/src/scripts/migrateYourUsers');

const prisma = new PrismaClient();

async function runMigration() {
  try {
    const result = await migrateUsers('data/wix-subscribers.csv', {
      dryRun: false,
      sendEmails: true
    });

    console.log('Migration complete!');
    console.log(`✅ Success: ${result.successCount}`);
    console.log(`⏭️  Duplicates: ${result.duplicateCount}`);
    console.log(`❌ Errors: ${result.errorCount}`);
    console.log(`📧 Emails sent: ${result.emailsSent}`);

    // List quiz testers
    if (result.quizTesters.length > 0) {
      console.log('\n🎉 Quiz Testers:');
      result.quizTesters.forEach(qt => {
        console.log(`  - ${qt.name} (${qt.email})`);
      });
    }

    // Show errors
    if (result.errors.length > 0) {
      console.log('\n❌ Errors:');
      result.errors.forEach(err => {
        console.log(`  - ${err.email}: ${err.error}`);
      });
    }

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

runMigration();
```

## 🧪 Testing

### Test with Sample Data

1. **Use provided sample CSV:**
   ```bash
   node server/src/scripts/migrateYourUsers.js data/sample-wix-subscribers.csv --dry-run
   ```

2. **Expected output:**
   - 10 total users
   - 4 quiz testers identified
   - 0 errors

3. **Run actual import:**
   ```bash
   node server/src/scripts/migrateYourUsers.js data/sample-wix-subscribers.csv
   ```

4. **Verify in database:**
   ```javascript
   const users = await prisma.user.findMany({
     where: { migratedFrom: 'wix' }
   });
   console.log(`Created ${users.length} users`);

   const quizTesters = await prisma.user.findMany({
     where: { isQuizTester: true }
   });
   console.log(`Quiz testers: ${quizTesters.length}`);
   ```

### Manual Testing Checklist

**Before Migration:**
- [ ] CSV file exported from Wix
- [ ] Column headers correct
- [ ] No test/spam emails
- [ ] Quiz tester names spelled correctly
- [ ] Database backup created

**During Migration:**
- [ ] Dry run completed without errors
- [ ] Preview shows correct counts
- [ ] Quiz testers identified (18 expected)
- [ ] No unexpected errors

**After Migration:**
- [ ] All users created in database
- [ ] Quiz testers have SUPERNova-LTE tier
- [ ] Quiz testers have `isQuizTester: true`
- [ ] Quiz testers have `lifetimeAccess: true`
- [ ] Regular users have Free tier
- [ ] Temporary passwords generated
- [ ] Welcome emails sent
- [ ] Migration log created
- [ ] No duplicate users created

### Edge Cases to Test

1. **Duplicate email:**
   - Import same CSV twice
   - Should skip duplicates

2. **Invalid email:**
   - CSV with "not-an-email"
   - Should log error, continue

3. **Missing name:**
   - CSV with only email
   - Should create user, skip quiz tester check

4. **Missing columns:**
   - CSV missing optional columns
   - Should use defaults

5. **Large file:**
   - CSV with 1000+ rows
   - Should handle without memory issues

## 🐛 Troubleshooting

### Issue: "CSV file is empty"

**Cause:** File has no content or is corrupt

**Solution:**
- Verify CSV file has content
- Check file encoding (should be UTF-8)
- Re-export from Wix

### Issue: "Invalid email format: ..."

**Cause:** Email address malformed

**Solution:**
- Find and fix invalid email in CSV
- Remove row if email is beyond repair
- Check for special characters

### Issue: "User already exists (duplicate)"

**Cause:** User email already in database

**Solution:**
- This is expected behavior
- User is skipped, not an error
- Check if previous migration ran

### Issue: Quiz tester not recognized

**Cause:** Name doesn't match exactly

**Solution:**
- Check spelling in CSV
- Ensure exact match (case-insensitive)
- Full name required, not just first/last

**Example:**
```
❌ "Nina Sausmarez" - won't match
✅ "Nina de Sausmarez" - will match
```

### Issue: Emails not sending

**Cause:** Email service not configured

**Solution:**
- Integrate email service (SendGrid, Mailgun, etc.)
- Update `sendWelcomeEmail()` function
- Test email service separately
- Check email service API keys

### Issue: "Permission denied" when uploading

**Cause:** Upload directory doesn't exist or no write permission

**Solution:**
```bash
mkdir -p server/uploads/migrations
chmod 755 server/uploads/migrations
```

### Issue: Migration stuck in IN_PROGRESS

**Cause:** Script crashed before completion

**Solution:**
```javascript
// Manually update status
await prisma.migrationLog.update({
  where: { batchId: 'stuck_batch_id' },
  data: { status: 'FAILED', completedAt: new Date() }
});
```

### Issue: Need to reset migration

**Cause:** Want to re-run migration

**Solution:**
```javascript
// Delete migrated users from batch
await prisma.user.deleteMany({
  where: { migrationBatch: 'batch_id_to_reset' }
});

// Delete migration log
await prisma.migrationLog.delete({
  where: { batchId: 'batch_id_to_reset' }
});

// Delete migrated user records
await prisma.migratedUser.deleteMany({
  where: { batchId: 'batch_id_to_reset' }
});
```

## 📊 Post-Migration Verification

### SQL Queries to Verify

**Count total migrated users:**
```sql
SELECT COUNT(*) FROM "User" WHERE "migratedFrom" = 'wix';
```

**Count quiz testers:**
```sql
SELECT COUNT(*) FROM "User" WHERE "isQuizTester" = true;
```

**List quiz testers:**
```sql
SELECT name, email, "membershipTier", "lifetimeAccess"
FROM "User"
WHERE "isQuizTester" = true
ORDER BY name;
```

**Count by migration batch:**
```sql
SELECT "migrationBatch", COUNT(*)
FROM "User"
WHERE "migratedFrom" = 'wix'
GROUP BY "migrationBatch";
```

**Check users needing password reset:**
```sql
SELECT email, name, "requirePasswordReset"
FROM "User"
WHERE "requirePasswordReset" = true
LIMIT 10;
```

### Email Verification

Check that emails were sent:
```javascript
const sentEmails = await prisma.migratedUser.count({
  where: {
    batchId: 'your_batch_id',
    emailSent: true
  }
});

console.log(`Emails sent: ${sentEmails}`);
```

Resend failed emails:
```bash
POST /api/migration/resend-emails/{batchId}
```

## 🎯 Success Criteria

After migration, verify:

✅ **All subscribers imported** (200+ expected)
✅ **18 quiz testers identified** and granted lifetime access
✅ **Temporary passwords** generated for all users
✅ **Welcome emails** sent to all users
✅ **No data loss** - all original data preserved
✅ **Duplicate handling** worked correctly
✅ **Migration log** created with accurate statistics
✅ **Admin interface** shows migration results
✅ **Users can login** with temporary passwords
✅ **Quiz testers** have SUPERNova-LTE tier

## 🚀 Next Steps

After successful migration:

1. **Notify quiz testers personally:**
   - Send personalized thank you
   - Confirm lifetime access
   - Offer onboarding call

2. **Monitor first logins:**
   - Track password resets
   - Watch for login issues
   - Provide support as needed

3. **Clean up:**
   - Clear temporary passwords after first login
   - Delete CSV files from server
   - Archive migration logs

4. **Engage users:**
   - Send welcome email series
   - Invite to community
   - Showcase platform features

5. **Analyze results:**
   - Track login rates
   - Monitor engagement
   - Identify inactive users
   - Plan re-engagement campaign

---

**Phase 2BJ Status:** ✅ Complete

**Built with:** Prisma, Node.js, React, CSV parsing

**Dependencies:** @prisma/client, bcryptjs, multer, fs

**Integration Required:** Email service (SendGrid, Mailgun, etc.)

**Support:** For migration issues, check troubleshooting section or run with `--dry-run` flag first
