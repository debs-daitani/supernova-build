/**
 * Dopamine Menu Detector
 * Detects when user is stuck/overwhelmed and offers instant dopamine hits
 */

import { prisma } from './prisma'

// Keywords that indicate user is stuck/overwhelmed
const STUCK_KEYWORDS = [
  "stuck",
  "overwhelm",
  "can't",
  "don't know",
  "paralyz",
  "freeze",
  "shutdown",
  "can't think",
  "brain fog",
  "executive dysfunction",
  "too much",
  "can't focus",
  "spinning",
  "spiraling",
  "lost",
  "confused",
  "procrastinat",
]

/**
 * Detect if user is experiencing overwhelm/stuck state
 */
export function detectOverwhelm(userMessage: string): boolean {
  const lowerMessage = userMessage.toLowerCase()

  return STUCK_KEYWORDS.some(keyword => lowerMessage.includes(keyword))
}

/**
 * Get dopamine menu items for user
 * Returns easiest items first, personalized to pillar if provided
 */
export async function getDopamineMenu(
  userId: string,
  pillar?: string,
  maxDifficulty: number = 3
) {
  const items = await prisma.dopamineMenuItem.findMany({
    where: {
      AND: [
        {
          OR: [
            { userId: null }, // Global items
            { userId }, // User-specific items
          ],
        },
        { difficultyLevel: { lte: maxDifficulty } },
        pillar ? { pillar } : {},
      ],
    },
    orderBy: [
      { difficultyLevel: 'asc' }, // Easiest first
      { timesCompleted: 'desc' }, // Most successful first
    ],
    take: 5, // Limit to 5 options (avoid choice paralysis!)
  })

  return items
}

/**
 * Mark dopamine item as offered
 */
export async function trackDopamineOffered(itemId: string) {
  await prisma.dopamineMenuItem.update({
    where: { id: itemId },
    data: {
      timesOffered: { increment: 1 },
    },
  })
}

/**
 * Mark dopamine item as completed
 */
export async function trackDopamineCompleted(
  itemId: string,
  completionTimeMinutes: number
) {
  const item = await prisma.dopamineMenuItem.findUnique({
    where: { id: itemId },
  })

  if (!item) return

  // Update average completion time
  const newAvg = item.avgCompletionTime
    ? Math.round((item.avgCompletionTime + completionTimeMinutes) / 2)
    : completionTimeMinutes

  await prisma.dopamineMenuItem.update({
    where: { id: itemId },
    data: {
      timesCompleted: { increment: 1 },
      avgCompletionTime: newAvg,
    },
  })
}

/**
 * Generate dopamine menu response for chat
 */
export function formatDopamineMenuResponse(
  items: Array<{
    id: string
    title: string
    description: string
    difficultyLevel: number
  }>
): string {
  if (items.length === 0) {
    return "Alright, let's try something different. What's one tiny thing you COULD do right now?"
  }

  const response = `You sound stuck. Let's get you moving. Pick ONE:

${items
  .map((item, i) => `${i + 1}. **${item.title}**\n   ${item.description}`)
  .join('\n\n')}

Pick a number. Don't think. Just pick.`

  return response
}
