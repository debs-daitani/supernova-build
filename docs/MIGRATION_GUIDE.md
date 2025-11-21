# User Migration Guide - The dAItaniverse Platform

## Overview

This guide explains how to migrate users from Wix to The dAItaniverse platform, preserving quiz results and assigning correct membership tiers.

## Migration Goals

- Import 200+ email subscribers from Wix
- Give 18 quiz testers free MEMBER access forever
- Preserve quiz results (Impact Authenticator)
- Maintain email consent status
- Send welcome emails with password reset links

## Quiz Testers (Free MEMBER Access)

The following 18 users will receive **MEMBER tier with lifetime access**:

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

## CSV Format

### Required Columns

- `email` (required): User's email address

### Optional Columns

- `firstName`: User's first name
- `lastName`: User's last name
- `isQuizTester`: Boolean (true/false/yes/no/1/0)
- `quizPillar1Score`: Body pillar score (0-100)
- `quizPillar2Score`: Brain pillar score (0-100)
- `quizPillar3Score`: Business pillar score (0-100)
- `signupDate`: Signup date (YYYY-MM-DD format)
- `emailConsent`: Boolean (true/false/yes/no/1/0), defaults to true

### Example CSV

```csv
email,firstName,lastName,isQuizTester,quizPillar1Score,quizPillar2Score,quizPillar3Score,signupDate,emailConsent
ria@example.com,Ria,Jackson,true,85,72,90,2024-10-15,true
rachael@example.com,Rachael,Rocco,true,78,88,92,2024-10-14,true
subscriber@example.com,Jane,Doe,false,,,,,true
```

## Migration Process

### Step 1: Prepare CSV File

1. Export users from Wix database
2. Format data according to CSV specifications above
3. Validate all email addresses are unique
4. Ensure quiz scores are between 0-100
5. Save file as `.csv` format

### Step 2: Access Migration Dashboard

1. Log in as an ADMIN user
2. Navigate to `/admin/migration`
3. You'll see the Migration Dashboard

### Step 3: Upload and Preview

1. Click "Select CSV File" and choose your prepared CSV
2. Click "Preview Import" to validate the data
3. Review the preview results:
   - **Valid Users**: Green box shows how many users will be imported
   - **Errors**: Red box shows validation errors
4. Check the first 10 users in the preview table
5. Review any errors and fix them in your CSV if needed

### Step 4: Dry Run (Recommended)

1. Click "Dry Run (Test Only)" to simulate the import
2. This validates everything without actually creating users
3. Review the results to ensure accuracy
4. No changes are made to the database during dry run

### Step 5: Execute Import

1. Once satisfied with the preview, click "✓ Execute Import"
2. Wait for the import to complete (this may take a few minutes for large files)
3. Review the import results:
   - **Imported Count**: Successfully created users
   - **Error Count**: Failed imports
   - **Error Log**: Download detailed error report if needed

### Step 6: Verify Import

1. Navigate to `/admin/users` to see the User Management page
2. Verify:
   - Quiz testers have MEMBER role
   - Quiz testers have lifetime access (crown icon)
   - Regular subscribers have FREE role
   - User counts match expected numbers
3. Search for specific users to verify their data

## What Happens During Import

### For Quiz Testers (`isQuizTester: true`)

1. **User Account Created**:
   - Email: From CSV
   - Role: MEMBER
   - Lifetime Access: ✓ Yes
   - Migrated from Wix: ✓ Yes
   - Must Reset Password: ✓ Yes (temporary password generated)

2. **Profile Created** (if names provided):
   - First Name
   - Last Name

3. **Quiz Results Saved** (if scores provided):
   - Body Score (Pillar 1)
   - Brain Score (Pillar 2)
   - Business Score (Pillar 3)
   - Quiz Type: "impact_authenticator"

4. **Welcome Email Sent**:
   - Subject: "🎉 Thanks for Testing! Your Free MEMBER Access Awaits"
   - Contains password reset link
   - Lists all MEMBER benefits
   - Thanks them for testing

### For Regular Subscribers (`isQuizTester: false` or not provided)

1. **User Account Created**:
   - Email: From CSV
   - Role: FREE
   - Lifetime Access: ✗ No
   - Migrated from Wix: ✓ Yes
   - Must Reset Password: ✓ Yes

2. **Profile Created** (if names provided)

3. **Welcome Email Sent**:
   - Subject: "Welcome to The dAItaniverse, [Name]! 🚀"
   - Contains password reset link
   - Lists available features
   - Encourages upgrade to MEMBER

## User Management

### Access User Management Dashboard

Navigate to `/admin/users` to:

- **View all users** with pagination
- **Search** by email or name
- **Filter** by role (FREE/UPGRADE/MEMBER/ADMIN)
- **Edit user roles** inline
- **View user activity** (enrollments, bookmarks)
- **See user stats** (total, migrated, quiz testers, by role)

### Updating User Roles

1. Find the user in the User Management table
2. Click "Edit" in the Actions column
3. Use the dropdown to change their role
4. Changes are saved immediately
5. Click "Cancel" to exit edit mode

### User Data Displayed

- **Email and Name**: Primary identification
- **Role**: Current membership tier with color coding
- **Lifetime Access**: Crown icon if lifetime MEMBER
- **Migrated**: Checkmark if migrated from Wix
- **Activity**: Number of course enrollments and bookmarks
- **Joined Date**: Account creation date

## Validation Rules

### Email Validation

- Must be valid email format (contains @ and domain)
- Must be unique in CSV (no duplicates)
- Must not already exist in database

### Quiz Score Validation

- Must be between 0 and 100
- All three scores required if any is provided
- Body = Pillar 1, Brain = Pillar 2, Business = Pillar 3

### Date Validation

- Signup date must be in YYYY-MM-DD format
- Invalid dates will be ignored (user created with current date)

## Error Handling

### Common Errors

1. **"Email is required"**: Row is missing email column
2. **"Invalid email format"**: Email doesn't contain @ or domain
3. **"Duplicate email in CSV"**: Same email appears multiple times
4. **"User already exists in database"**: Email already registered
5. **"Quiz scores must be between 0 and 100"**: Score out of range

### Handling Errors

1. Download the error log (if import completed with errors)
2. Fix errors in your CSV file
3. Remove successfully imported users from CSV
4. Re-run the import with corrected data

### Transaction Safety

- Import uses database transactions
- If ANY error occurs during import, ALL changes are rolled back
- This ensures database integrity
- You can safely retry imports

## Post-Migration Tasks

### 1. Welcome Email Campaign

Users receive automated welcome emails with:
- Password reset links (valid for 24 hours)
- Login instructions
- Platform overview
- Feature highlights based on tier

### 2. User Verification

1. Check User Management dashboard
2. Verify user counts match expectations
3. Spot-check quiz tester roles and lifetime access
4. Confirm quiz results are saved

### 3. Monitor First Logins

1. Users must reset their password on first login
2. Check that password reset flow works
3. Monitor for any login issues

### 4. Support Preparation

Prepare support team for:
- Password reset requests
- Questions about membership tiers
- Quiz result inquiries
- Feature access questions

## Security & Privacy

### Password Security

- Temporary passwords are randomly generated (32 characters)
- Passwords are hashed with bcrypt before storage
- Users MUST reset password on first login
- Password reset tokens expire after 24 hours

### Data Privacy

- Email consent status is preserved
- Users can opt out of emails in settings
- Migration logs are admin-only
- User data is encrypted in database

### CSRF Protection

- File upload endpoint has CSRF protection
- Admin-only access with role validation
- Session-based authentication required

## Troubleshooting

### Import Fails Completely

**Possible Causes**:
- CSV file is corrupted
- Server timeout (too many users)
- Database connection issue

**Solutions**:
- Validate CSV format
- Split large files into batches of 50-100 users
- Check server logs for detailed errors

### Some Users Not Imported

**Possible Causes**:
- Validation errors (see error log)
- Duplicate emails
- Users already exist

**Solutions**:
- Download error log
- Fix validation errors
- Remove duplicates
- Check User Management for existing users

### Quiz Results Not Showing

**Possible Causes**:
- Missing quiz score columns in CSV
- Invalid score values
- Scores not in 0-100 range

**Solutions**:
- Verify CSV has all three pillar scores
- Check score values are numbers
- Ensure scores are 0-100

### Welcome Emails Not Sent

**Note**: In current implementation, emails are logged to console only. In production:
- Integrate with SendGrid/Resend/AWS SES
- Check email service logs
- Verify email template rendering
- Queue emails to avoid rate limits

## Database Schema

### User Model (Extended)

```typescript
{
  id: string
  email: string
  password: string (hashed)
  role: 'FREE' | 'UPGRADE' | 'MEMBER' | 'ADMIN'
  mustResetPassword: boolean
  migratedFromWix: boolean
  migrationDate: DateTime?
  lifetimeAccess: boolean
  emailConsent: boolean
  createdAt: DateTime
  updatedAt: DateTime
}
```

### QuizResult Model

```typescript
{
  id: string
  userId: string
  quizType: string
  bodyScore: number (0-100)
  brainScore: number (0-100)
  businessScore: number (0-100)
  recommendations: JSON?
  completedAt: DateTime
  createdAt: DateTime
}
```

### MigrationLog Model

```typescript
{
  id: string
  adminUserId: string
  csvFilename: string
  importedCount: number
  skippedCount: number
  errorCount: number
  errors: JSON?
  importedAt: DateTime
  createdAt: DateTime
}
```

## Support & Resources

### Admin Pages

- Migration Dashboard: `/admin/migration`
- User Management: `/admin/users`
- Usage Analytics: `/admin/usage`

### API Endpoints

- Preview CSV: `POST /api/admin/migration/preview`
- Import Users: `POST /api/admin/migration/import`
- Migration History: `GET /api/admin/migration/history`
- List Users: `GET /api/admin/users`
- Update User: `PATCH /api/admin/users/:id`

### Sample Files

- Sample CSV: `/docs/sample_migration.csv`
- This Guide: `/docs/MIGRATION_GUIDE.md`

## Success Criteria

✅ All 18 quiz testers imported with MEMBER + lifetime access
✅ All quiz results preserved and accessible
✅ All regular subscribers imported with FREE tier
✅ No duplicate users created
✅ Welcome emails sent to all users
✅ Password reset flow working
✅ User Management dashboard shows accurate data
✅ Migration logs recorded for audit trail

---

**Need Help?** Contact the platform administrator or check server logs for detailed error messages.
