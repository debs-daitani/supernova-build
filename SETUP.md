# dAItaniverse Platform Setup

## Phase CORE01-A1: Core Essentials

This phase sets up the foundational database models for users, authentication, and subscriptions.

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

This will create the three subscription tiers:
- **BRAVE** - £6.00/month - Perfect for testing the waters
- **BOLD** - £26.00/month - Everything you need to build and grow
- **BADASS** - £260.00/month - Unlimited everything for established entrepreneurs

### 6. Test Database Connection

```bash
cd server
node src/test-db.js
```

## Database Schema

The CORE01-A1 phase includes these essential models:

### User Management
- `User` - Core user accounts
- `UserProfile` - Extended user profile information
- `Session` - User authentication sessions
- `PasswordReset` - Password reset tokens

### Subscription System
- `SubscriptionTier` - Available subscription plans
- `Subscription` - User subscriptions with VIP support
- `Payment` - Payment transactions
- `Invoice` - Invoice records
- `AddOnPurchase` - Additional feature purchases

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

Once this phase is complete, proceed to:
- **CORE01-A2**: SUPERNova AI Models (Memory, Context, Learning)
- **CORE01-A3**: Authentication & Authorization Routes
- **CORE01-A4**: Subscription Management API

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
