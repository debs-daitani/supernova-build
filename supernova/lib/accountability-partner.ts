import { prisma } from './prisma'

/**
 * Keywords that indicate user is making a commitment
 */
const COMMITMENT_KEYWORDS = [
  "i'll",
  "i will",
  "i'm going to",
  'going to',
  'planning to',
  'committed to',
  'promise',
  'by tomorrow',
  'by next week',
  'by friday',
  'by monday',
  'this week',
  'today',
  'tonight',
]

/**
 * Detect if a message contains commitment language
 */
export function detectCommitment(message: string): boolean {
  const lowerMessage = message.toLowerCase()
  return COMMITMENT_KEYWORDS.some((keyword) => lowerMessage.includes(keyword))
}

/**
 * Extract commitment details from message
 * Uses simple heuristics to identify what user is committing to
 */
export function extractCommitment(message: string): {
  description: string
  timeframe?: string
  pillar?: string
} | null {
  const lowerMessage = message.toLowerCase()

  // Look for timeframe indicators
  let timeframe: string | undefined
  const timePatterns = [
    { pattern: /(by|before)\s+(tomorrow|tonight|today)/i, value: 'today' },
    { pattern: /(by|before)\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i, value: 'this_week' },
    { pattern: /(this|next)\s+week/i, value: 'this_week' },
    { pattern: /(by|before)\s+the\s+end\s+of\s+(the\s+)?(week|month)/i, value: 'this_week' },
  ]

  for (const { pattern, value } of timePatterns) {
    if (pattern.test(lowerMessage)) {
      timeframe = value
      break
    }
  }

  // Extract description (everything after "I'll" or "I'm going to")
  const commitmentPatterns = [
    /i'll\s+(.+?)(?:\.|$|by\s|tomorrow|next\s)/i,
    /i\s+will\s+(.+?)(?:\.|$|by\s|tomorrow|next\s)/i,
    /i'm\s+going\s+to\s+(.+?)(?:\.|$|by\s|tomorrow|next\s)/i,
    /going\s+to\s+(.+?)(?:\.|$|by\s|tomorrow|next\s)/i,
  ]

  let description: string | undefined
  for (const pattern of commitmentPatterns) {
    const match = message.match(pattern)
    if (match) {
      description = match[1].trim()
      break
    }
  }

  if (!description) return null

  // Infer pillar from keywords
  let pillar: string | undefined
  if (/post|content|launch|business|client|pricing|sales/i.test(description)) {
    pillar = 'BUSINESS'
  } else if (/workout|exercise|sleep|eat|body|physical/i.test(description)) {
    pillar = 'BODY'
  } else if (/adhd|focus|brain|routine|organize|task/i.test(description)) {
    pillar = 'BRAIN'
  }

  return {
    description,
    timeframe,
    pillar,
  }
}

/**
 * Create a commitment record
 * Updated to match actual schema: uses commitmentType instead of frequency
 */
export async function createCommitment(
  userId: string,
  description: string,
  commitmentType: 'one-time' | 'daily' | 'weekly' = 'one-time',
  deadline?: Date,
  pillar?: string
): Promise<string> {
  const commitment = await prisma.commitment.create({
    data: {
      userId,
      description,
      commitmentType, // Schema uses commitmentType, not frequency
      deadline,
      pillar: pillar || 'GENERAL',
      status: 'active',
    },
  })

  return commitment.id
}

/**
 * Create a check-in for a commitment
 * Updated to match actual schema: uses status and note instead of completed/userResponse/snResponse
 */
export async function createCheckIn(
  commitmentId: string,
  completed: boolean,
  userResponse?: string,
  snResponse?: string
): Promise<void> {
  // Schema uses 'status' (string) and 'note' instead of 'completed' (boolean)
  await prisma.checkIn.create({
    data: {
      commitmentId,
      status: completed ? 'completed' : 'missed',
      note: userResponse || snResponse || null,
    },
  })

  // Update commitment streak tracking
  const commitment = await prisma.commitment.findUnique({
    where: { id: commitmentId },
  })

  if (commitment) {
    const newStreak = completed ? commitment.currentStreak + 1 : 0
    const longestStreak = Math.max(commitment.longestStreak, newStreak)

    await prisma.commitment.update({
      where: { id: commitmentId },
      data: {
        currentStreak: newStreak,
        longestStreak,
        lastCheckIn: new Date(),
      },
    })

    // If one-time commitment is completed, mark it done
    if (completed && commitment.commitmentType === 'one-time') {
      await prisma.commitment.update({
        where: { id: commitmentId },
        data: {
          status: 'completed',
        },
      })
    }
  }
}

/**
 * Get active commitments for a user
 * Updated to use createdAt instead of checkedAt for ordering
 */
export async function getActiveCommitments(userId: string) {
  return await prisma.commitment.findMany({
    where: {
      userId,
      status: 'active',
    },
    include: {
      checkIns: {
        orderBy: { createdAt: 'desc' }, // Schema uses createdAt, not checkedAt
        take: 3,
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
}

/**
 * Get commitments that need check-in
 * (active commitments with deadline approaching or no recent check-in)
 */
export async function getCommitmentsNeedingCheckIn(userId: string) {
  const activeCommitments = await getActiveCommitments(userId)

  const now = new Date()
  const needCheckIn = activeCommitments.filter((c) => {
    // If has deadline and it's passed, needs check-in
    if (c.deadline && c.deadline < now) {
      return true
    }

    // If no check-ins yet and created >24h ago, needs check-in
    if (c.checkIns.length === 0) {
      const hoursSinceCreated =
        (now.getTime() - c.createdAt.getTime()) / (1000 * 60 * 60)
      return hoursSinceCreated > 24
    }

    // If last check-in was >24h ago, needs check-in
    const lastCheckIn = c.checkIns[0]
    if (lastCheckIn) {
      const hoursSinceCheckIn =
        (now.getTime() - lastCheckIn.createdAt.getTime()) / (1000 * 60 * 60) // Use createdAt instead of checkedAt
      return hoursSinceCheckIn > 24
    }

    return false
  })

  return needCheckIn
}

/**
 * Generate accountability check-in prompt
 * Updated to use currentStreak/longestStreak instead of completionCount/missedCount
 */
export function generateCheckInPrompt(commitments: any[]): string {
  if (commitments.length === 0) return ''

  const commitmentList = commitments
    .map((c, i) => {
      const currentStreak = c.currentStreak || 0
      const longestStreak = c.longestStreak || 0

      let status = ''
      if (c.deadline && c.deadline < new Date()) {
        status = ' (DEADLINE PASSED)'
      } else if (currentStreak === 0 && c.checkIns?.length > 0) {
        status = ' (STREAK BROKEN)'
      }

      return `${i + 1}. "${c.description}"${status}\n   - Current streak: ${currentStreak} | Longest: ${longestStreak}`
    })
    .join('\n')

  return `
# ACCOUNTABILITY CHECK-IN TIME

You have ${commitments.length} active commitment(s) that need checking in on:

${commitmentList}

For EACH commitment:
1. Ask: "Did you do it? Yes or no."
2. If YES: Celebrate the win (genuinely, not generic praise)
3. If NO: Ask what got in the way (no judgment, just facts)
4. If streak broken multiple times: Call out the pattern and ask if they want to ABANDON it (it's okay to quit things that aren't working)

IMPORTANT:
- Don't lecture or guilt-trip
- Celebrate wins HARD (even small ones)
- If they're making excuses, gently call BS
- If a commitment isn't serving them, give permission to drop it
- Focus on ONE commitment at a time, don't overwhelm
`
}

/**
 * Generate commitment confirmation prompt (when user makes new commitment)
 */
export function generateCommitmentConfirmation(
  description: string,
  timeframe?: string
): string {
  const deadline = timeframe === 'today' ? 'by end of today' : timeframe === 'this_week' ? 'by end of this week' : 'soon'

  return `
# COMMITMENT LOCKED IN

Got it. You're committing to: **${description}** ${deadline}.

I'm holding you to this. I'll check in with you later.

One question: What's the FIRST tiny step you can take right now (like, in the next 5 minutes) toward this?

Don't overthink it. Just the first micro-action.
`
}

/**
 * Calculate commitment success metrics
 * Updated to use currentStreak/longestStreak and count check-ins by status
 */
export async function getCommitmentMetrics(userId: string) {
  const allCommitments = await prisma.commitment.findMany({
    where: { userId },
    include: {
      checkIns: true,
    },
  })

  const totalCommitments = allCommitments.length
  const completedCommitments = allCommitments.filter(
    (c) => c.status === 'completed'
  ).length
  const abandonedCommitments = allCommitments.filter(
    (c) => c.status === 'abandoned'
  ).length

  // Count check-ins by status
  let totalCheckIns = 0
  let completedCheckIns = 0

  for (const commitment of allCommitments) {
    totalCheckIns += commitment.checkIns.length
    completedCheckIns += commitment.checkIns.filter(
      (checkIn) => checkIn.status === 'completed'
    ).length
  }

  const overallCompletionRate =
    totalCheckIns > 0 ? Math.round((completedCheckIns / totalCheckIns) * 100) : 0

  return {
    totalCommitments,
    completedCommitments,
    abandonedCommitments,
    activeCommitments: totalCommitments - completedCommitments - abandonedCommitments,
    overallCompletionRate,
  }
}

/**
 * Abandon a commitment (user wants to stop tracking it)
 */
export async function abandonCommitment(commitmentId: string): Promise<void> {
  await prisma.commitment.update({
    where: { id: commitmentId },
    data: {
      status: 'abandoned',
    },
  })
}
