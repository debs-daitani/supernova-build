import { prisma } from './prisma'

export type EnergyLevel = 'high' | 'medium' | 'low'
export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night'

/**
 * Track user energy at time of message
 * Infers energy from message tone, length, and keywords
 */
export async function trackEnergy(
  userId: string,
  conversationId: string,
  message: string,
  timestamp: Date = new Date()
): Promise<void> {
  const energyLevel = detectEnergyLevel(message)
  const timeOfDay = getTimeOfDay(timestamp)
  const dayOfWeek = getDayOfWeek(timestamp)

  await prisma.energyLog.create({
    data: {
      userId,
      conversationId,
      energyLevel,
      timeOfDay,
      dayOfWeek,
      timestamp,
      messageLength: message.length,
    },
  })
}

/**
 * Detect energy level from message content
 */
function detectEnergyLevel(message: string): EnergyLevel {
  const lowerMessage = message.toLowerCase()

  // High energy indicators
  const highEnergyKeywords = [
    '!',
    'excited',
    'pumped',
    'ready',
    'let\\'s go',
    'fuck yeah',
    'amazing',
    'awesome',
    'crushing it',
    'on fire',
    'motivated',
    'inspired',
    'hyped',
  ]

  // Low energy indicators
  const lowEnergyKeywords = [
    'tired',
    'exhausted',
    'drained',
    'can\\'t',
    'stuck',
    'overwhelm',
    'burnout',
    'no energy',
    'struggling',
    'hard',
    'difficult',
  ]

  // Count indicators
  let highScore = 0
  let lowScore = 0

  for (const keyword of highEnergyKeywords) {
    if (lowerMessage.includes(keyword)) {
      highScore += keyword === '!' ? 1 : 2
    }
  }

  for (const keyword of lowEnergyKeywords) {
    if (lowerMessage.includes(keyword)) {
      lowScore += 2
    }
  }

  // Message length also indicates energy (very short = low energy)
  if (message.length < 20) {
    lowScore += 1
  } else if (message.length > 200) {
    highScore += 1
  }

  // Determine level
  if (highScore > lowScore && highScore >= 3) return 'high'
  if (lowScore > highScore && lowScore >= 3) return 'low'
  return 'medium'
}

/**
 * Get time of day category
 */
function getTimeOfDay(date: Date): TimeOfDay {
  const hour = date.getHours()

  if (hour >= 5 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 17) return 'afternoon'
  if (hour >= 17 && hour < 22) return 'evening'
  return 'night'
}

/**
 * Get day of week (0 = Sunday, 6 = Saturday)
 */
function getDayOfWeek(date: Date): number {
  return date.getDay()
}

/**
 * Get energy pattern analysis for a user
 */
export async function getEnergyPatterns(userId: string, days: number = 30) {
  const since = new Date()
  since.setDate(since.getDate() - days)

  const logs = await prisma.energyLog.findMany({
    where: {
      userId,
      timestamp: { gte: since },
    },
    orderBy: { timestamp: 'asc' },
  })

  if (logs.length < 5) {
    return null // Not enough data
  }

  // Analyze by time of day
  const byTimeOfDay = {
    morning: { high: 0, medium: 0, low: 0, total: 0 },
    afternoon: { high: 0, medium: 0, low: 0, total: 0 },
    evening: { high: 0, medium: 0, low: 0, total: 0 },
    night: { high: 0, medium: 0, low: 0, total: 0 },
  }

  // Analyze by day of week
  const byDayOfWeek = Array(7)
    .fill(null)
    .map(() => ({ high: 0, medium: 0, low: 0, total: 0 }))

  for (const log of logs) {
    // By time of day
    byTimeOfDay[log.timeOfDay].total++
    byTimeOfDay[log.timeOfDay][log.energyLevel]++

    // By day of week
    byDayOfWeek[log.dayOfWeek].total++
    byDayOfWeek[log.dayOfWeek][log.energyLevel]++
  }

  // Find peak energy times
  const peakTimes: Array<{ period: string; highEnergyRate: number }> = []

  for (const [period, stats] of Object.entries(byTimeOfDay)) {
    if (stats.total >= 3) {
      const highRate = stats.high / stats.total
      peakTimes.push({ period, highEnergyRate: highRate })
    }
  }

  peakTimes.sort((a, b) => b.highEnergyRate - a.highEnergyRate)

  // Find peak energy days
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const peakDays: Array<{ day: string; highEnergyRate: number }> = []

  byDayOfWeek.forEach((stats, index) => {
    if (stats.total >= 2) {
      const highRate = stats.high / stats.total
      peakDays.push({ day: dayNames[index], highEnergyRate: highRate })
    }
  })

  peakDays.sort((a, b) => b.highEnergyRate - a.highEnergyRate)

  return {
    totalLogs: logs.length,
    peakTimes: peakTimes.slice(0, 2), // Top 2 peak times
    peakDays: peakDays.slice(0, 2), // Top 2 peak days
    byTimeOfDay,
    byDayOfWeek,
    recentTrend: analyzeTrend(logs.slice(-7)), // Last 7 logs
  }
}

/**
 * Analyze recent energy trend
 */
function analyzeTrend(recentLogs: any[]): 'improving' | 'declining' | 'stable' {
  if (recentLogs.length < 4) return 'stable'

  const first Half = recentLogs.slice(0, Math.floor(recentLogs.length / 2))
  const secondHalf = recentLogs.slice(Math.floor(recentLogs.length / 2))

  const firstScore = firstHalf.reduce((sum, log) => {
    if (log.energyLevel === 'high') return sum + 2
    if (log.energyLevel === 'medium') return sum + 1
    return sum
  }, 0) / firstHalf.length

  const secondScore = secondHalf.reduce((sum, log) => {
    if (log.energyLevel === 'high') return sum + 2
    if (log.energyLevel === 'medium') return sum + 1
    return sum
  }, 0) / secondHalf.length

  if (secondScore > firstScore + 0.3) return 'improving'
  if (secondScore < firstScore - 0.3) return 'declining'
  return 'stable'
}

/**
 * Generate energy insight message for user
 */
export function formatEnergyInsight(patterns: any): string {
  if (!patterns) {
    return "I'm still learning your energy patterns. Keep chatting with me!"
  }

  const insights: string[] = []

  // Peak times
  if (patterns.peakTimes.length > 0) {
    const topPeriod = patterns.peakTimes[0]
    insights.push(
      `You're consistently high-energy during **${topPeriod.period}** (${Math.round(topPeriod.highEnergyRate * 100)}% of the time). That's your power window.`
    )
  }

  // Peak days
  if (patterns.peakDays.length > 0) {
    const topDay = patterns.peakDays[0]
    insights.push(
      `**${topDay.day}s** are your strongest day (${Math.round(topDay.highEnergyRate * 100)}% high-energy). Schedule your most important work then.`
    )
  }

  // Trend
  if (patterns.recentTrend === 'declining') {
    insights.push(
      `**Warning**: Your energy has been declining lately. Time to check in on rest, boundaries, or burnout.`
    )
  } else if (patterns.recentTrend === 'improving') {
    insights.push(
      `**Good news**: Your energy is trending UP. Whatever you're doing, keep doing it.`
    )
  }

  if (insights.length === 0) {
    return "I'm tracking your energy patterns. Give me a few more days of data!"
  }

  return `
# 🔋 ENERGY PATTERN INSIGHTS

${insights.map((i) => `- ${i}`).join('\n')}

**What this means**: Work WITH your energy, not against it. High-energy windows = strategy, creative work, hard decisions. Low-energy = admin, easy tasks, rest.
`
}

/**
 * Get task recommendations based on current energy
 */
export async function getTaskRecommendations(
  userId: string,
  currentEnergy: EnergyLevel
): Promise<string> {
  const recommendations = {
    high: [
      'Tackle your biggest, scariest task first',
      'Make important business decisions',
      'Create content (you\\'ll sound more confident)',
      'Have difficult conversations',
      'Brainstorm new ideas',
      'Work on strategy',
    ],
    medium: [
      'Batch administrative tasks',
      'Respond to emails',
      'Plan your week',
      'Light content creation (captions, posts)',
      'Research and learning',
      'Client calls (not sales calls)',
    ],
    low: [
      'Don\\'t force it - rest or do easy wins',
      'Organize files/workspace',
      'Simple social media engagement',
      'Watch training videos (passive learning)',
      'Journal/reflect',
      'Plan tomorrow when you\\'ll have more energy',
    ],
  }

  const tasks = recommendations[currentEnergy]
  const randomTasks = tasks.sort(() => Math.random() - 0.5).slice(0, 3)

  return `
**Your energy is ${currentEnergy.toUpperCase()} right now. Best tasks:**

${randomTasks.map((task, i) => `${i + 1}. ${task}`).join('\n')}
`
}
