# Database Migration Guide

## VERSE-003: i•DEA Marketplace Integration

This guide covers the database migration for adding i•DEA Marketplace models to The dAItaniverse platform.

### Models Added (20 models)

**Core Marketplace (10 models):**
1. **Idea** - Main idea/project model
2. **IdeaCategory** - Categories for organizing ideas
3. **IdeaTransaction** - Transactions and escrow
4. **IdeaCollaboration** - Team collaboration
5. **IdeaMessage** - Direct messaging
6. **IdeaReview** - Reviews and ratings
7. **IdeaBookmark** - Saved ideas
8. **IdeaView** - View tracking
9. **IdeaTag** - Tags for discovery
10. **IdeaAttachment** - File attachments

**SELL Pathway (1 model):**
11. **IdeaFlatpack** - Business-in-a-box packages

**BUILD Pathway (5 models):**
12. **BuildRequest** - Projects seeking builders
13. **BuilderProfile** - Builder profiles
14. **BuildProposal** - Builder proposals
15. **BuildMilestone** - Project milestones
16. **BuildDeliverable** - Deliverables

**FUND Pathway (4 models):**
17. **FundingRequest** - Ideas seeking investment
18. **InvestorProfile** - Investor profiles
19. **InvestmentOffer** - Investment offers
20. **PitchDeck** - Pitch deck storage

### Relations Updated
- **User** model now includes relations to:
  - ideas
  - builderProfile
  - investorProfile
  - ideaCollaborations
  - sentMessages
  - receivedMessages
  - reviewsGiven
  - reviewsReceived
  - ideaBookmarks
  - ideaViews

### Migration Steps

#### 1. Generate Prisma Client

```bash
cd /home/user/supernova-build
npx prisma generate
```

#### 2. Create and Run Migration

```bash
cd /home/user/supernova-build
npx prisma migrate dev --name add-idea-marketplace-models
```

#### 3. Seed Idea Categories

```bash
cd server
npm run db:seed
```

This will create 8 idea categories:
- Tech & Apps 💻
- E-commerce 🛍️
- Content & Media 📺
- Health & Wellness 🏃
- Education 📚
- Food & Beverage 🍕
- Services 🤝
- Entertainment 🎮

#### 4. Verify Migration

```bash
cd server
node src/test-marketplace.js
```

### Three Pathways

**SELL Pathway:**
- Users can create and sell complete business packages (flatpacks)
- Includes market research, business model, projections, brand assets, etc.
- One-time purchase model

**BUILD Pathway:**
- Users post build requests for their ideas
- Builders submit proposals with budgets and timelines
- Milestone-based payment with escrow
- Deliverable submissions and approvals

**FUND Pathway:**
- Users seek investment for their ideas
- Investors browse and make offers
- Equity-based or other investment structures
- Pitch deck management and versioning

### Features Enabled

- **Marketplace Discovery**: Browse ideas by category, tags, search
- **Three Pathways**: SELL (flatpacks), BUILD (hiring), FUND (investment)
- **Collaboration**: Team up with others on ideas
- **Messaging**: Direct communication between users
- **Reviews**: Rate and review transactions
- **Bookmarks**: Save interesting ideas
- **Analytics**: View tracking and engagement metrics
- **Escrow**: Secure transaction handling
- **Milestones**: Structured project delivery

---

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
