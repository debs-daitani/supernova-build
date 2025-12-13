import { prisma } from './prisma'

// Common patterns that create loops
export const LOOP_PATTERNS = {
  pricing_paralysis: {
    keywords: ['pricing', 'price', 'charge', 'how much', 'what to charge', 'pricing strategy'],
    threshold: 3, // Trigger after 3 mentions
    interrupt: `
STOP. We've talked about pricing {{count}} times now.

Here's the truth: You're not stuck on pricing. You're stuck on WORTH.

What's the REAL fear? Say it out loud.
- "I'm not good enough to charge that"
- "What if no one pays?"
- "I don't have proof I'm worth it"

Which one is it? Because we're not doing another pricing dance until you tell me what you're ACTUALLY afraid of.
`,
  },

  imposter_syndrome: {
    keywords: [
      'imposter',
      "don't feel qualified",
      "who am I to",
      'not good enough',
      "don't have credentials",
      'fake',
      'fraud',
    ],
    threshold: 3,
    interrupt: `
OKAY. FULL STOP.

You've mentioned feeling like a fraud {{count}} times. I'm calling bullshit.

You know what's fraudulent? Pretending you DON'T know things you actually know. Hiding your experience because you didn't get it from a university.

Answer this: If someone paid you right now for what you know, could you help them? YES OR NO.

Don't intellectualize it. Don't list your credentials. Just yes or no.
`,
  },

  perfectionism: {
    keywords: [
      "it's not ready",
      'not perfect',
      'need to fix',
      'just one more thing',
      "it's not good enough",
      'refine',
      'polish',
    ],
    threshold: 3,
    interrupt: `
PATTERN INTERRUPT.

We've hit "not ready yet" {{count}} times. That's not perfectionism. That's FEAR wearing a productivity costume.

Here's what's happening: You're terrified it WON'T work, so you're making sure it NEVER has to work by keeping it "not ready."

What if I told you it's never going to feel ready? What if "good enough" is the only option that exists?

Ship it broken or don't ship it at all. Which one?
`,
  },

  launch_paralysis: {
    keywords: [
      'launch',
      'launching',
      'getting ready to',
      'about to launch',
      'planning to launch',
      'going to launch',
    ],
    threshold: 4,
    interrupt: `
NOPE. STOPPING YOU RIGHT HERE.

You've said "launching" {{count}} times. How many times have you ACTUALLY launched?

You're not planning a launch. You're rehearsing the idea of launching. There's a difference.

Set a timer for 60 seconds. When it goes off, tell me ONE THING you can do RIGHT NOW that gets you closer to ACTUAL launch (not planning, not strategizing, DOING).

GO.
`,
  },

  energy_excuse: {
    keywords: [
      "don't have energy",
      'too tired',
      'exhausted',
      'burned out',
      "can't focus",
      'no motivation',
      'drained',
    ],
    threshold: 2, // Lower threshold because this is urgent
    interrupt: `
HOLD UP.

You've mentioned being exhausted/drained {{count}} times. That's not laziness. That's your body SCREAMING at you.

Real talk: Are you actually tired, or are you doing things that drain you because you think you "should"?

If you could ONLY do ONE thing this week that GAVE you energy (not tasks, not obligations, just something that lights you up), what would it be?

And why aren't you doing it?
`,
  },

  comparison_trap: {
    keywords: [
      'everyone else',
      'other people',
      'they have',
      'compared to',
      'not like them',
      'behind everyone',
    ],
    threshold: 3,
    interrupt: `
PATTERN DETECTED: Comparison spiral.

We've hit "everyone else is..." {{count}} times. Time to interrupt this loop.

You're not behind. You're on a different ROUTE.

Quick: Name ONE thing you've done in the last month that was 100% YOU. Not what a guru said. Not what "successful people" do. Just authentically, weirdly, uniquely YOU.

What was it?
`,
  },

  time_excuse: {
    keywords: [
      "don't have time",
      'no time',
      'too busy',
      'not enough time',
      'if I had more time',
      'when I have time',
    ],
    threshold: 3,
    interrupt: `
STOP. Pattern interrupt activated.

"No time" has come up {{count}} times. That's not a time problem. That's a PRIORITY problem.

Hard truth: You DO have time. You just don't want to admit what you're actually prioritizing over this.

What are you choosing INSTEAD? Netflix? Scrolling? Overthinking? Other people's emergencies?

Name it. Own it. Then we can deal with it.
`,
  },
}

export type LoopType = keyof typeof LOOP_PATTERNS

/**
 * Detect if a user message contains keywords for known loop patterns
 */
export function detectLoopPattern(message: string): LoopType | null {
  const lowerMessage = message.toLowerCase()

  for (const [loopType, pattern] of Object.entries(LOOP_PATTERNS)) {
    const hasKeyword = pattern.keywords.some((keyword) =>
      lowerMessage.includes(keyword.toLowerCase())
    )
    if (hasKeyword) {
      return loopType as LoopType
    }
  }

  return null
}

/**
 * Track loop occurrence and determine if interrupt should trigger
 * Updated to match actual schema: isActive, lastTriggered, occurrenceCount, messages, conversationId
 */
export async function trackLoopOccurrence(
  userId: string,
  conversationId: string,
  loopType: LoopType,
  message: string
): Promise<{
  shouldInterrupt: boolean
  interruptMessage?: string
  occurrenceCount: number
}> {
  const pattern = LOOP_PATTERNS[loopType]

  // Find or create loop detection record
  let loopRecord = await prisma.loopDetection.findFirst({
    where: {
      userId,
      loopType,
      isActive: true, // Use isActive instead of wasResolved
    },
  })

  if (!loopRecord) {
    // Create new loop record - conversationId is required
    loopRecord = await prisma.loopDetection.create({
      data: {
        userId,
        conversationId,
        loopType,
        messages: [message.substring(0, 500)],
        occurrenceCount: 1,
        isActive: true,
        lastTriggered: new Date(),
      },
    })
  } else {
    // Update existing record
    const updatedMessages = [...loopRecord.messages, message.substring(0, 500)]
    loopRecord = await prisma.loopDetection.update({
      where: { id: loopRecord.id },
      data: {
        messages: updatedMessages,
        occurrenceCount: loopRecord.occurrenceCount + 1,
        lastTriggered: new Date(),
      },
    })
  }

  const occurrenceCount = loopRecord.occurrenceCount

  // Check if we should interrupt
  if (occurrenceCount >= pattern.threshold) {
    const interruptMessage = pattern.interrupt.replace(
      '{{count}}',
      occurrenceCount.toString()
    )

    return {
      shouldInterrupt: true,
      interruptMessage,
      occurrenceCount,
    }
  }

  return {
    shouldInterrupt: false,
    occurrenceCount,
  }
}

/**
 * Mark a loop as resolved (inactive)
 */
export async function resolveLoop(userId: string, loopType: LoopType) {
  await prisma.loopDetection.updateMany({
    where: {
      userId,
      loopType,
      isActive: true,
    },
    data: {
      isActive: false,
    },
  })
}

/**
 * Get active loops for a user (for debugging/admin view)
 */
export async function getActiveLoops(userId: string) {
  return await prisma.loopDetection.findMany({
    where: {
      userId,
      isActive: true,
    },
    orderBy: {
      lastTriggered: 'desc',
    },
  })
}

/**
 * Format loop summary for system prompt context
 */
export function formatLoopContext(loops: any[]): string {
  if (loops.length === 0) return ''

  return `
# ACTIVE PATTERN LOOPS DETECTED

The user has the following recurring patterns that may need interruption:

${loops
  .map(
    (loop) => `
- **${loop.loopType}**: Mentioned ${loop.occurrenceCount} times
  Last detected: ${loop.lastTriggered.toISOString().split('T')[0]}
`
  )
  .join('\n')}

If these patterns appear AGAIN in this conversation, consider escalating your approach or trying a different angle.
`
}
