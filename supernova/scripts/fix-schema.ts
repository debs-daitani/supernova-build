import { PrismaClient } from '@prisma/client'

// Direct connection to database
const prisma = new PrismaClient()

async function main() {
  console.log('\n=== Fixing schema issues ===')

  // First add the new enum values before removing old ones
  // This is done by temporarily setting subscriptionTier column to text, updating, then converting back

  // Step 1: Convert to text temporarily
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "User"
    ALTER COLUMN "subscriptionTier" TYPE TEXT
    USING "subscriptionTier"::TEXT
  `)
  console.log('Converted subscriptionTier to TEXT')

  // Step 2: Update old values to new values
  await prisma.$executeRawUnsafe(`UPDATE "User" SET "subscriptionTier" = 'NONE' WHERE "subscriptionTier" = 'FREE'`)
  await prisma.$executeRawUnsafe(`UPDATE "User" SET "subscriptionTier" = 'NONE' WHERE "subscriptionTier" = 'BASIC'`)
  await prisma.$executeRawUnsafe(`UPDATE "User" SET "subscriptionTier" = 'VENUED' WHERE "subscriptionTier" = 'PRO'`)
  await prisma.$executeRawUnsafe(`UPDATE "User" SET "subscriptionTier" = 'DAITANIVERSE' WHERE "subscriptionTier" = 'ENTERPRISE'`)
  console.log('Updated tier values')

  // Step 3: Drop the default constraint first
  await prisma.$executeRawUnsafe(`ALTER TABLE "User" ALTER COLUMN "subscriptionTier" DROP DEFAULT`)
  console.log('Dropped default')

  // Step 4: Drop the old enum and create the new one
  await prisma.$executeRawUnsafe(`DROP TYPE IF EXISTS "SubscriptionTier_new"`)
  await prisma.$executeRawUnsafe(`
    CREATE TYPE "SubscriptionTier_new" AS ENUM ('NONE', 'VENUED', 'DAITANIVERSE', 'BETA_TESTER')
  `)
  console.log('Created new enum type')

  // Step 5: Convert column back to enum
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "User"
    ALTER COLUMN "subscriptionTier" TYPE "SubscriptionTier_new"
    USING "subscriptionTier"::"SubscriptionTier_new"
  `)
  console.log('Converted column back to enum')

  // Step 6: Add the new default
  await prisma.$executeRawUnsafe(`ALTER TABLE "User" ALTER COLUMN "subscriptionTier" SET DEFAULT 'NONE'`)
  console.log('Set new default')

  // Step 5: Drop old enum and rename new
  await prisma.$executeRawUnsafe(`DROP TYPE IF EXISTS "SubscriptionTier"`)
  await prisma.$executeRawUnsafe(`ALTER TYPE "SubscriptionTier_new" RENAME TO "SubscriptionTier"`)
  console.log('Renamed enum')

  console.log('\n=== Done! Now run: npx prisma db push --accept-data-loss ===')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
