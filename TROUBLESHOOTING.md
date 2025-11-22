# SUPERNova AI - Troubleshooting Guide

## 🚨 Getting 500 Errors?

The API now has **comprehensive logging** to help diagnose issues. Follow these steps:

---

## Step 1: Run Diagnostics

```bash
npm run diagnose
```

This will check:
- ✅ Environment variables (ANTHROPIC_API_KEY, DATABASE_URL)
- ✅ Database connection
- ✅ Database tables exist
- ✅ Anthropic API connection
- ✅ User data exists

---

## Step 2: Check Server Logs

When you run `npm run dev`, you'll now see detailed logs like:

```
🚀 SUPERNova API Route Loading...
📋 Environment Check:
  - ANTHROPIC_API_KEY: ✅ Set
  - DATABASE_URL: ✅ Set
  - Using Claude Model: claude-sonnet-4-20250514

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 [req_123] SUPERNova API Route Hit
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📥 [req_123] Parsing request body...
✅ [req_123] Request body parsed
🔍 [req_123] Looking up user: user-123
✅ [req_123] User authenticated
🔐 [req_123] Checking tier access: MEMBER
✅ [req_123] Tier access granted: MEMBER
...
```

**Look for `❌` symbols** - they indicate where the error occurred!

---

## Common Issues

### ❌ "ANTHROPIC_API_KEY not set"

**Problem**: Environment variable is missing

**Fix**:
```bash
# Create .env file
cp .env.example .env

# Edit .env and add:
ANTHROPIC_API_KEY="sk-ant-your-key-here"
```

---

### ❌ "Database connection failed"

**Problem**: Can't connect to PostgreSQL

**Fix**:
1. Check PostgreSQL is running:
   ```bash
   # macOS
   brew services start postgresql

   # Linux
   sudo systemctl start postgresql
   ```

2. Check DATABASE_URL in `.env`:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/supernova"
   ```

3. Run database setup:
   ```bash
   npm run db:push
   ```

---

### ❌ "User not found: user-123"

**Problem**: No users in database

**Fix**:
```bash
# Option 1: Use Prisma Studio
npm run db:studio

# Then create a User with:
# - id: user-123
# - email: test@example.com
# - tier: MEMBER

# Option 2: SQL query
# Connect to database and run:
INSERT INTO "User" (id, email, tier, "createdAt", "updatedAt")
VALUES ('user-123', 'test@example.com', 'MEMBER', NOW(), NOW());
```

---

### ❌ "Table does not exist"

**Problem**: Database schema not created

**Fix**:
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push
```

---

### ❌ "Anthropic API error: 401"

**Problem**: Invalid API key

**Fix**:
1. Check API key in `.env` starts with `sk-ant-`
2. Verify key is valid in Anthropic Console
3. Check account has credits
4. Try regenerating the API key

---

### ❌ "Anthropic API error: 404"

**Problem**: Wrong model name

**Fix**: The code should use `claude-sonnet-4-20250514` - this is already fixed in the latest version.

---

### ❌ Frontend shows "Streaming error"

**Problem**: API returning 500 but not logging why

**Fix**: Check server console logs. With the new logging, you'll see exactly where it failed:

```
❌ [req_123] FATAL ERROR in SUPERNova API
Error type: PrismaClientKnownRequestError
Error message: Invalid `prisma.user.findUnique()` invocation
Stack trace: ...
```

---

## Debug Checklist

Before reporting an issue, check:

- [ ] `npm install` completed successfully
- [ ] `.env` file exists with both environment variables
- [ ] `npm run db:push` created database tables
- [ ] At least one user exists in database
- [ ] PostgreSQL is running
- [ ] ANTHROPIC_API_KEY is valid
- [ ] Server logs show the exact error (look for `❌`)

---

## Reading the Logs

The new logging system shows:

| Symbol | Meaning |
|--------|---------|
| 🎯 | API route was hit |
| 📥 | Parsing request |
| ✅ | Step succeeded |
| ❌ | Step failed (THIS IS YOUR ERROR!) |
| 🔍 | Looking up data |
| 💾 | Saving to database |
| 🤖 | Calling Anthropic API |
| 📊 | Tracking usage/tokens |

**Example error log:**
```
🔍 [req_123] Looking up user: user-123
❌ [req_123] User not found: user-123
```
→ **Problem**: Need to create user `user-123` in database

---

## Still Stuck?

1. Run `npm run diagnose` and share the output
2. Check server console for logs with `❌` symbols
3. Share the full error message including:
   - Request ID (e.g., `[req_123]`)
   - Error type
   - Error message
   - Stack trace

---

## Environment File Template

Your `.env` should look like:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/supernova"

# Anthropic API
ANTHROPIC_API_KEY="sk-ant-your-key-here"

# App URL (optional)
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## Quick Fix Commands

```bash
# Full reset
npm install
npm run db:generate
npm run db:push
npm run diagnose

# Create test user via Prisma Studio
npm run db:studio

# Start development server with logging
npm run dev
```

---

## Success Indicators

When everything works, you'll see:

```
🚀 SUPERNova API Route Loading...
📋 Environment Check:
  - ANTHROPIC_API_KEY: ✅ Set
  - DATABASE_URL: ✅ Set
  - Using Claude Model: claude-sonnet-4-20250514

[Next.js server logs]
✓ Ready in 1234ms
```

And when you send a message:

```
🎯 [req_123] SUPERNova API Route Hit
✅ [req_123] Request validated successfully
✅ [req_123] User authenticated
✅ [req_123] Tier access granted: MEMBER
✅ [req_123] Anthropic API stream started successfully
✅ [req_123] Request completed successfully
```

---

**Remember**: The logs now tell you EXACTLY where things are breaking. Look for the `❌` symbols!
