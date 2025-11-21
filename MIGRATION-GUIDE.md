# Database Migration Guide

## VERSE-002: SUPERNova AI Integration

This guide covers the database migration for adding SUPERNova AI models to The dAItaniverse platform.

## What's New

### Models Added (9 total)
1. **Conversation** - User conversations with SUPERNova AI
2. **Message** - Individual messages in conversations
3. **Memory** - User-specific memory system
4. **Context** - Real-time user context tracking
5. **CoachingSession** - Coaching session records
6. **CoachingProgram** - Structured coaching programs
7. **ProgramModule** - Program modules
8. **ProgramLesson** - Individual lessons
9. **UserProgress** - User progress tracking

### Relations Updated
- **User** model now includes relations to:
  - conversations
  - memories
  - coachingSessions
  - context
  - userProgress

## Migration Steps

### 1. Generate Prisma Client

First, regenerate the Prisma client to include the new models:

```bash
cd /home/user/supernova-build
npx prisma generate
```

### 2. Create and Run Migration

Create a new migration for the SUPERNova models:

```bash
cd /home/user/supernova-build
npx prisma migrate dev --name add-supernova-models
```

This will:
- Create migration files in `prisma/migrations/`
- Apply the migration to your database
- Update the database schema with all new tables

### 3. Seed Coaching Programs

Run the updated seed script to populate the coaching programs:

```bash
cd server
npm run db:seed
```

This will create:
- **BBB01**: The BADASS Branding Blueprint
  - 2 modules
  - 3 lessons total
- **BAI01**: Authentic Impact - BADASS AI Strategies
  - 2 modules
  - 3 lessons total

### 4. Verify Migration

Test that the new models are working:

```bash
cd server
node src/test-supernova.js
```

Expected output:
- Lists all coaching programs with their modules and lessons
- Shows database statistics
- Confirms SUPERNova models are working

## Schema Changes

### New Tables Created
- `Conversation`
- `Message`
- `Memory`
- `CoachingSession`
- `Context`
- `CoachingProgram`
- `ProgramModule`
- `ProgramLesson`
- `UserProgress`

### Existing Tables Modified
- `User` - Added foreign key indices for new relations

## Coaching Program Structure

### BBB01: The BADASS Branding Blueprint

**Module 1: Your Brand Foundation**
- Lesson 1: Welcome to BADASS Branding (10 min)
- Lesson 2: Your Brand Values (15 min)

**Module 2: Your Brand Voice**
- Lesson 1: Authentic vs Performative (12 min)

### BAI01: Authentic Impact - BADASS AI Strategies

**Module 1: AI Foundations**
- Lesson 1: Welcome to AI for Humans (8 min)
- Lesson 2: What AI Can (and Cannot) Do (15 min)

**Module 2: AI in Your Business**
- Lesson 1: Content Creation with AI (20 min)

## Features Enabled

### SUPERNova Conversational AI
- Three coaching modes: Body, Brain, Business
- Persistent conversation history
- Message tracking with metadata
- Token usage monitoring

### Memory System
- Category-based memory storage
- Importance levels (low, medium, high)
- Use tracking and recency
- Context preservation

### Coaching Sessions
- Session tracking per mode
- Key insights capture
- Action items recording
- Progress metrics

### Coaching Programs
- Structured learning paths
- Multi-tier program support
- Module and lesson organization
- User progress tracking
- Completion tracking

## Rollback

If you need to rollback this migration:

```bash
cd /home/user/supernova-build
npx prisma migrate reset
```

⚠️ **Warning**: This will delete ALL data in your database and reset to the initial state.

## Troubleshooting

### Migration Fails

If the migration fails, check:
1. Database is running and accessible
2. DATABASE_URL is correct in `.env`
3. No existing data conflicts with new schema
4. Prisma client is up to date

### Seed Fails

If seeding fails, ensure:
1. Migration completed successfully
2. No duplicate programs exist (codes are unique)
3. Database connection is stable

### Test Fails

If tests fail:
1. Verify migration completed
2. Check seed data was created
3. Ensure Prisma client was regenerated

## Next Phase

After successful migration, you're ready for:
- **VERSE-003**: i•DEA Marketplace Models
- API development for SUPERNova interactions
- Frontend integration with coaching programs
