# dAItaniverse Platform Setup

## Implemented Phases

### Phase VERSE-001 (CORE01-A1): Core Essentials
Foundational database models for users, authentication, and subscriptions.

### Phase VERSE-002: SUPERNova AI Integration
Conversational AI heart with coaching modes, memory system, and coaching programs.

### Phase VERSE-003: i•DEA Marketplace Integration
Complete marketplace system with SELL, BUILD, and FUND pathways for business ideas.

### Phase VERSE-004: Authentication System
Complete authentication system with JWT tokens, password hashing, and session management.

## Prerequisites

- Node.js 18+
- PostgreSQL database
- Network access for Prisma binary downloads

## Initial Setup

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Configure Environment Variables

Copy the example environment file and update with your database credentials:

```bash
cd server
cp .env.example .env
```

Edit `.env` with your PostgreSQL connection string:
```
DATABASE_URL="postgresql://username:password@localhost:5432/daitaniverse?schema=public"
```

### 3. Generate Prisma Client

⚠️ **Note**: This step requires network access to download Prisma engine binaries.

```bash
cd /home/user/supernova-build
npx prisma generate
```

If you encounter 403 errors downloading Prisma binaries, ensure you have network access to `binaries.prisma.sh`.

### 4. Run Database Migrations

```bash
cd /home/user/supernova-build
npx prisma migrate dev --name init-core-essentials
```

This will:
- Create the database schema
- Generate migration files in `prisma/migrations/`

### 5. Seed the Database

```bash
cd server
npm run db:seed
```

This will create:

**Subscription Tiers:**
- **BRAVE** - £6.00/month - Perfect for testing the waters
- **BOLD** - £26.00/month - Everything you need to build and grow
- **BADASS** - £260.00/month - Unlimited everything for established entrepreneurs

**Coaching Programs:**
- **BBB01** - The BADASS Branding Blueprint (2 modules, 3 lessons)
- **BAI01** - Authentic Impact - BADASS AI Strategies (2 modules, 3 lessons)

**i•DEA Marketplace Categories:**
- 8 categories: Tech & Apps, E-commerce, Content & Media, Health & Wellness, Education, Food & Beverage, Services, Entertainment

### 6. Test Database Connection

**Test Core Models:**
```bash
cd server
node src/test-db.js
```

**Test SUPERNova Models:**
```bash
cd server
node src/test-supernova.js
```

**Test i•DEA Marketplace Models:**
```bash
cd server
node src/test-marketplace.js
```

**Test Authentication System:**
```bash
cd server
node src/test-auth.js
```

## Database Schema

### VERSE-001: Core Essentials Models

**User Management:**
- `User` - Core user accounts
- `UserProfile` - Extended user profile information
- `Session` - User authentication sessions
- `PasswordReset` - Password reset tokens

**Subscription System:**
- `SubscriptionTier` - Available subscription plans
- `Subscription` - User subscriptions with VIP support
- `Payment` - Payment transactions
- `Invoice` - Invoice records
- `AddOnPurchase` - Additional feature purchases

### VERSE-002: SUPERNova AI Models

**Conversational AI:**
- `Conversation` - User conversations with SUPERNova (supports Body, Brain, Business modes)
- `Message` - Individual messages in conversations
- `Memory` - User-specific memory system for context retention
- `Context` - Real-time user context (platform activity, business metrics, goals)

**Coaching System:**
- `CoachingSession` - Individual coaching sessions with insights and action items
- `CoachingProgram` - Structured programs (BBB01, BAI01, etc.)
- `ProgramModule` - Program modules
- `ProgramLesson` - Individual lessons with content
- `UserProgress` - User progress tracking through programs

### VERSE-003: i•DEA Marketplace Models

**Core Marketplace:**
- `Idea` - Main idea/project model with pathway support (SELL, BUILD, FUND)
- `IdeaCategory` - Categories for organizing ideas
- `IdeaTransaction` - Financial transactions and escrow
- `IdeaCollaboration` - Team collaboration and equity management
- `IdeaMessage` - Direct messaging between users
- `IdeaReview` - User reviews and ratings
- `IdeaBookmark` - User bookmarks and saved ideas
- `IdeaView` - View tracking and analytics
- `IdeaTag` - Tags for idea discovery
- `IdeaAttachment` - File attachments for ideas

**SELL Pathway:**
- `IdeaFlatpack` - Complete business-in-a-box packages with market research, business model, etc.

**BUILD Pathway:**
- `BuildRequest` - Projects seeking builders
- `BuilderProfile` - Builder profiles with skills, portfolio, ratings
- `BuildProposal` - Builder proposals for build requests
- `BuildMilestone` - Project milestones with payment tracking
- `BuildDeliverable` - Deliverable submissions and approvals

**FUND Pathway:**
- `FundingRequest` - Ideas seeking investment
- `InvestorProfile` - Investor profiles with investment focus and criteria
- `InvestmentOffer` - Investment offers from investors
- `PitchDeck` - Pitch deck storage and versioning

## Troubleshooting

### Prisma Generate Fails with 403 Error

This occurs when Prisma cannot download engine binaries from their CDN. Ensure:
1. You have internet access
2. No firewall is blocking `binaries.prisma.sh`
3. Try setting environment variable: `PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1`

### Database Connection Fails

1. Verify PostgreSQL is running: `psql --version`
2. Check your DATABASE_URL in `.env`
3. Ensure the database exists: `createdb daitaniverse`

## Next Steps

With VERSE-001, VERSE-002, and VERSE-003 complete, proceed to:
- **VERSE-004**: Content & Social Media Models
- **VERSE-005**: Website Builder Models
- **VERSE-006**: Email Marketing Models
- **API Development**: Authentication, SUPERNova, i•DEA Marketplace

## Useful Commands

```bash
# Open Prisma Studio (GUI for database)
npm run db:studio

# Create a new migration
npx prisma migrate dev --name your_migration_name

# Reset database (⚠️ deletes all data)
npx prisma migrate reset

# Format Prisma schema
npx prisma format
```
