import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

export interface CSVRow {
  email: string
  firstName?: string
  lastName?: string
  isQuizTester?: string | boolean
  quizPillar1Score?: string | number // Body
  quizPillar2Score?: string | number // Brain
  quizPillar3Score?: string | number // Business
  signupDate?: string
  emailConsent?: string | boolean
}

export interface ValidatedUser {
  email: string
  firstName: string
  lastName: string
  isQuizTester: boolean
  quizScores?: {
    body: number
    brain: number
    business: number
  }
  signupDate?: Date
  emailConsent: boolean
}

export interface MigrationResult {
  success: boolean
  importedCount: number
  skippedCount: number
  errorCount: number
  errors: Array<{
    row: number
    email: string
    error: string
  }>
  users?: ValidatedUser[]
}

/**
 * Generate a secure random temporary password
 */
export function generateTempPassword(): string {
  return crypto.randomBytes(16).toString('hex')
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Parse boolean value from CSV
 */
function parseBoolean(value: string | boolean | undefined, defaultValue = false): boolean {
  if (typeof value === 'boolean') return value
  if (!value) return defaultValue
  const normalized = String(value).toLowerCase().trim()
  return normalized === 'true' || normalized === 'yes' || normalized === '1'
}

/**
 * Parse number value from CSV
 */
function parseNumber(value: string | number | undefined): number | undefined {
  if (typeof value === 'number') return value
  if (!value) return undefined
  const parsed = parseInt(String(value), 10)
  return isNaN(parsed) ? undefined : parsed
}

/**
 * Parse date value from CSV
 */
function parseDate(value: string | undefined): Date | undefined {
  if (!value) return undefined
  try {
    const date = new Date(value)
    return isNaN(date.getTime()) ? undefined : date
  } catch {
    return undefined
  }
}

/**
 * Validate and normalize a single CSV row
 */
export function validateRow(row: CSVRow, rowNumber: number): {
  valid: boolean
  user?: ValidatedUser
  error?: string
} {
  // Validate email
  const email = row.email?.trim()
  if (!email) {
    return { valid: false, error: 'Email is required' }
  }
  if (!isValidEmail(email)) {
    return { valid: false, error: 'Invalid email format' }
  }

  // Parse names
  const firstName = row.firstName?.trim() || ''
  const lastName = row.lastName?.trim() || ''

  // Parse quiz tester status
  const isQuizTester = parseBoolean(row.isQuizTester, false)

  // Parse quiz scores
  let quizScores: { body: number; brain: number; business: number } | undefined

  const bodyScore = parseNumber(row.quizPillar1Score)
  const brainScore = parseNumber(row.quizPillar2Score)
  const businessScore = parseNumber(row.quizPillar3Score)

  if (bodyScore !== undefined && brainScore !== undefined && businessScore !== undefined) {
    // Validate score ranges (0-100)
    if (
      bodyScore < 0 ||
      bodyScore > 100 ||
      brainScore < 0 ||
      brainScore > 100 ||
      businessScore < 0 ||
      businessScore > 100
    ) {
      return { valid: false, error: 'Quiz scores must be between 0 and 100' }
    }

    quizScores = {
      body: bodyScore,
      brain: brainScore,
      business: businessScore,
    }
  }

  // Parse signup date
  const signupDate = parseDate(row.signupDate)

  // Parse email consent
  const emailConsent = parseBoolean(row.emailConsent, true)

  return {
    valid: true,
    user: {
      email,
      firstName,
      lastName,
      isQuizTester,
      quizScores,
      signupDate,
      emailConsent,
    },
  }
}

/**
 * Validate CSV data before import
 */
export async function validateCSVData(rows: CSVRow[]): Promise<MigrationResult> {
  const errors: Array<{ row: number; email: string; error: string }> = []
  const validUsers: ValidatedUser[] = []
  const emailsSeen = new Set<string>()

  for (let i = 0; i < rows.length; i++) {
    const rowNumber = i + 2 // +2 because row 1 is headers, and we're 0-indexed

    const validation = validateRow(rows[i], rowNumber)

    if (!validation.valid) {
      errors.push({
        row: rowNumber,
        email: rows[i].email || 'unknown',
        error: validation.error || 'Unknown error',
      })
      continue
    }

    const user = validation.user!

    // Check for duplicate emails in CSV
    if (emailsSeen.has(user.email.toLowerCase())) {
      errors.push({
        row: rowNumber,
        email: user.email,
        error: 'Duplicate email in CSV',
      })
      continue
    }

    emailsSeen.add(user.email.toLowerCase())

    // Check if user already exists in database
    const existingUser = await prisma.user.findUnique({
      where: { email: user.email },
    })

    if (existingUser) {
      errors.push({
        row: rowNumber,
        email: user.email,
        error: 'User already exists in database',
      })
      continue
    }

    validUsers.push(user)
  }

  return {
    success: errors.length === 0,
    importedCount: 0, // Not imported yet, just validated
    skippedCount: errors.length,
    errorCount: errors.length,
    errors,
    users: validUsers,
  }
}

/**
 * Import validated users into the database
 */
export async function importUsers(
  users: ValidatedUser[],
  adminUserId: string,
  csvFilename: string,
  dryRun = false
): Promise<MigrationResult> {
  const errors: Array<{ row: number; email: string; error: string }> = []
  let importedCount = 0

  if (dryRun) {
    // Just return success for dry run
    return {
      success: true,
      importedCount: users.length,
      skippedCount: 0,
      errorCount: 0,
      errors: [],
      users,
    }
  }

  try {
    // Use a transaction to ensure all-or-nothing import
    await prisma.$transaction(async (tx) => {
      for (let i = 0; i < users.length; i++) {
        const user = users[i]

        try {
          // Generate temporary password
          const tempPassword = generateTempPassword()
          const hashedPassword = await bcrypt.hash(tempPassword, 10)

          // Determine role and lifetime access
          const role = user.isQuizTester ? 'MEMBER' : 'FREE'
          const lifetimeAccess = user.isQuizTester

          // Create user
          const createdUser = await tx.user.create({
            data: {
              email: user.email,
              password: hashedPassword,
              role,
              mustResetPassword: true,
              migratedFromWix: true,
              migrationDate: new Date(),
              lifetimeAccess,
              emailConsent: user.emailConsent,
              createdAt: user.signupDate || new Date(),
            },
          })

          // Create profile if we have name data
          if (user.firstName || user.lastName) {
            await tx.profile.create({
              data: {
                userId: createdUser.id,
                firstName: user.firstName,
                lastName: user.lastName,
              },
            })
          }

          // Create quiz results if available
          if (user.quizScores) {
            await tx.quizResult.create({
              data: {
                userId: createdUser.id,
                quizType: 'impact_authenticator',
                bodyScore: user.quizScores.body,
                brainScore: user.quizScores.brain,
                businessScore: user.quizScores.business,
              },
            })
          }

          importedCount++
        } catch (error) {
          errors.push({
            row: i + 2,
            email: user.email,
            error: error instanceof Error ? error.message : 'Unknown error during import',
          })
        }
      }

      // Create migration log
      await tx.migrationLog.create({
        data: {
          adminUserId,
          csvFilename,
          importedCount,
          skippedCount: 0,
          errorCount: errors.length,
          errors: errors.length > 0 ? errors : null,
        },
      })
    })

    return {
      success: errors.length === 0,
      importedCount,
      skippedCount: 0,
      errorCount: errors.length,
      errors,
    }
  } catch (error) {
    console.error('Migration transaction failed:', error)

    return {
      success: false,
      importedCount: 0,
      skippedCount: users.length,
      errorCount: users.length,
      errors: [
        {
          row: 0,
          email: 'all',
          error: `Transaction failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
      ],
    }
  }
}

/**
 * Get migration history
 */
export async function getMigrationHistory() {
  return await prisma.migrationLog.findMany({
    orderBy: { importedAt: 'desc' },
    take: 50,
  })
}

/**
 * Get user statistics
 */
export async function getUserStats() {
  const [
    totalUsers,
    migratedUsers,
    quizTesters,
    freeUsers,
    upgradeUsers,
    memberUsers,
    adminUsers,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { migratedFromWix: true } }),
    prisma.user.count({ where: { lifetimeAccess: true } }),
    prisma.user.count({ where: { role: 'FREE' } }),
    prisma.user.count({ where: { role: 'UPGRADE' } }),
    prisma.user.count({ where: { role: 'MEMBER' } }),
    prisma.user.count({ where: { role: 'ADMIN' } }),
  ])

  return {
    totalUsers,
    migratedUsers,
    quizTesters,
    byRole: {
      FREE: freeUsers,
      UPGRADE: upgradeUsers,
      MEMBER: memberUsers,
      ADMIN: adminUsers,
    },
  }
}
