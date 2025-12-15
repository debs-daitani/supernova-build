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
 * Returns items personalized to pillar if provided
 */
export async function getDopamineMenu(
  userId: string,
  pillar?: string,
  limit: number = 3
) {
  const items = await prisma.dopamineMenuItem.findMany({
    where: {
      AND: [
        {
          OR: [
            { isGlobal: true }, // Global items
            { userId }, // User-specific items
          ],
        },
        pillar ? { pillar } : {},
      ],
    },
    orderBy: [
      { timesAccepted: 'desc' }, // Most successful first
      { timesOffered: 'asc' }, // Least offered first
    ],
    take: limit, // Limit options (avoid choice paralysis!)
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
 * Mark dopamine item as accepted/completed
 */
export async function trackDopamineAccepted(itemId: string) {
  await prisma.dopamineMenuItem.update({
    where: { id: itemId },
    data: {
      timesAccepted: { increment: 1 },
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
    duration: string
  }>
): string {
  if (items.length === 0) {
    return "Alright, let's try something different. What's one tiny thing you COULD do right now?"
  }

  const response = `You sound stuck. Let's get you moving. Pick ONE:

${items
  .map((item, i) => `${i + 1}. **${item.title}** (${item.duration})\n   ${item.description}`)
  .join('\n\n')}

Pick a number. Don't think. Just pick.`

  return response
}
