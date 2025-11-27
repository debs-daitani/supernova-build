import { prisma } from './prisma'

/**
 * Decision-related keywords that indicate user is trying to make a choice
 */
const DECISION_KEYWORDS = [
  'should i',
  'which',
  'or',
  'either',
  'option',
  'choice',
  'decide',
  'deciding',
  'not sure if',
  'trying to choose',
  'debating',
  'considering',
  'what do you think',
  'which one',
]

/**
 * Detect if a message contains decision-making language
 */
export function detectDecisionParalysis(message: string): boolean {
  const lowerMessage = message.toLowerCase()
  return DECISION_KEYWORDS.some((keyword) => lowerMessage.includes(keyword))
}

/**
 * Extract decision question and options from message
 * Returns null if can't extract clear decision structure
 */
export function extractDecision(message: string): {
  question: string
  options: string[]
} | null {
  // Look for "A or B" patterns
  const orPattern = /(.+?)\s+or\s+(.+?)[\?\.]?$/i
  const orMatch = message.match(orPattern)

  if (orMatch) {
    return {
      question: message,
      options: [orMatch[1].trim(), orMatch[2].trim()],
    }
  }

  // Look for numbered options
  const numberedPattern = /\d+[.):]\s*(.+?)(?=\d+[.):]\s*|\n|$)/g
  const numberedMatches = [...message.matchAll(numberedPattern)]

  if (numberedMatches.length >= 2) {
    return {
      question: message.split(/\d+[.):]/)[0].trim() || message,
      options: numberedMatches.map((m) => m[1].trim()),
    }
  }

  // Look for "either X or Y" patterns
  const eitherPattern = /either\s+(.+?)\s+or\s+(.+?)[\?\.]?$/i
  const eitherMatch = message.match(eitherPattern)

  if (eitherMatch) {
    return {
      question: message,
      options: [eitherMatch[1].trim(), eitherMatch[2].trim()],
    }
  }

  return null
}

/**
 * Track a decision and check if user is stuck (asked same thing multiple times)
 */
export async function trackDecision(
  userId: string,
  conversationId: string,
  question: string,
  options: string[]
): Promise<{
  isStuck: boolean
  timesAsked: number
  decisionId: string
}> {
  // Normalize question for matching (lowercase, remove punctuation)
  const normalizedQuestion = question.toLowerCase().replace(/[^\w\s]/g, '')

  // Find similar decisions (exact match or very similar)
  const existingDecisions = await prisma.decision.findMany({
    where: {
      userId,
      lockedIn: false,
    },
  })

  // Check if user has asked this (or very similar) question before
  const similarDecision = existingDecisions.find((d) => {
    const normalizedExisting = d.question.toLowerCase().replace(/[^\w\s]/g, '')
    // Simple similarity: if 80% of words match, consider it the same question
    const existingWords = new Set(normalizedExisting.split(/\s+/))
    const questionWords = normalizedQuestion.split(/\s+/)
    const matchingWords = questionWords.filter((w) => existingWords.has(w))
    return matchingWords.length / questionWords.length > 0.8
  })

  if (similarDecision) {
    // User is asking about the same decision again
    const updated = await prisma.decision.update({
      where: { id: similarDecision.id },
      data: {
        timesAsked: similarDecision.timesAsked + 1,
      },
    })

    return {
      isStuck: updated.timesAsked >= 2, // Stuck after asking 2+ times
      timesAsked: updated.timesAsked,
      decisionId: updated.id,
    }
  } else {
    // New decision
    const newDecision = await prisma.decision.create({
      data: {
        userId,
        conversationId,
        question,
        options,
        timesAsked: 1,
      },
    })

    return {
      isStuck: false,
      timesAsked: 1,
      decisionId: newDecision.id,
    }
  }
}

/**
 * Lock in a decision (user has chosen)
 */
export async function lockInDecision(
  decisionId: string,
  chosenOption: string
): Promise<void> {
  await prisma.decision.update({
    where: { id: decisionId },
    data: {
      chosenOption,
      lockedIn: true,
      lockedAt: new Date(),
      timeToDecide: Math.floor(
        (new Date().getTime() -
          (await prisma.decision.findUnique({ where: { id: decisionId } }))!
            .createdAt.getTime()) /
          1000
      ),
    },
  })
}

/**
 * Generate decision killer prompt (forces binary choice)
 */
export function generateDecisionKillerPrompt(
  question: string,
  options: string[],
  timesAsked: number
): string {
  // If more than 2 options, force reduction to 2
  if (options.length > 2) {
    return `
# DECISION PARALYSIS DETECTED

You've presented ${options.length} options. That's TOO MANY. ADHD brains shut down with choice overload.

Here's what we're doing:

**60-SECOND TIMER STARTS NOW.**

Which TWO options are you ACTUALLY considering? Not what sounds good. Not what you "should" do. Which two are pulling at you?

Pick TWO. I'll help you choose between them. GO.
`
  }

  // Binary choice - activate decision killer
  const optionA = options[0]
  const optionB = options[1]

  if (timesAsked === 1) {
    // First time asking - give them a moment
    return `
# DECISION TIME

You're choosing between:
- **A**: ${optionA}
- **B**: ${optionB}

Quick gut check: Which one makes your chest feel LIGHTER? Not which one sounds "smarter" or more "strategic." Which one feels like RELIEF?

That's your answer. Trust it.
`
  } else if (timesAsked === 2) {
    // Second time asking - get firm
    return `
# DECISION PARALYSIS ALERT

We've talked about this decision ${timesAsked} times now. You're stuck in analysis mode.

Here's the truth: **BOTH OPTIONS WILL WORK.** The cost of NOT deciding is higher than picking the "wrong" one.

**30-SECOND DECISION:**

Option A: ${optionA}
Option B: ${optionB}

Close your eyes. Count to 3. Say the first one that comes out of your mouth.

I'm waiting. A or B?
`
  } else {
    // Third+ time asking - FORCE IT
    return `
# DECISION OVERRIDE ACTIVATED

This is the ${timesAsked}th time you've asked about this. I'm not letting you spiral anymore.

**I'm flipping a coin for you.**

*flips coin*

**The answer is: ${Math.random() > 0.5 ? 'A' : 'B'}**

- **A**: ${optionA}
- **B**: ${optionB}

Go with it. If your gut SCREAMS "no," then you know it's the other one. But you're not allowed to think anymore. You're DOING.

Commit to it RIGHT NOW in your next message. Which one is it?
`
  }
}

/**
 * Get pending decisions for a user (for admin/debugging)
 */
export async function getPendingDecisions(userId: string) {
  return await prisma.decision.findMany({
    where: {
      userId,
      lockedIn: false,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
}

/**
 * Get decision history for a user
 */
export async function getDecisionHistory(userId: string, limit: number = 10) {
  return await prisma.decision.findMany({
    where: {
      userId,
      lockedIn: true,
    },
    orderBy: {
      lockedAt: 'desc',
    },
    take: limit,
  })
}

/**
 * Calculate average time to decide for a user
 */
export async function getAverageDecisionTime(userId: string): Promise<number> {
  const decisions = await prisma.decision.findMany({
    where: {
      userId,
      lockedIn: true,
      timeToDecide: { not: null },
    },
  })

  if (decisions.length === 0) return 0

  const total = decisions.reduce((sum, d) => sum + (d.timeToDecide || 0), 0)
  return Math.floor(total / decisions.length)
}
