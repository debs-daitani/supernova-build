/**
 * Memory Extraction Service for SUPERNova AI
 * Intelligently extracts facts, preferences, goals, entities, and patterns from conversations
 */

import Anthropic from '@anthropic-ai/sdk'
import { prisma } from './prisma'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export interface ExtractedMemories {
  facts: Array<{ content: string; confidence: number; pillarTags: string[] }>
  preferences: Array<{ content: string; confidence: number; pillarTags: string[] }>
  goals: Array<{ content: string; confidence: number; pillarTags: string[] }>
  context: Array<{ content: string; confidence: number; pillarTags: string[] }>
  struggles: Array<{ content: string; confidence: number; pillarTags: string[] }>
  strengths: Array<{ content: string; confidence: number; pillarTags: string[] }>
  entities: Array<{
    type: string
    name: string
    description: string
    pillarTags: string[]
  }>
  patterns: Array<{
    type: string
    description: string
    confidence: number
    pillarTags: string[]
  }>
}

const MEMORY_EXTRACTION_PROMPT = `You are a memory extraction system for SUPERNova AI. Your job is to analyze conversation messages and extract structured memories.

Analyze the conversation and extract ONLY significant, meaningful information. Be selective - not everything needs to be extracted.

EXTRACT THE FOLLOWING:

1. FACTS (objectively true things about the user):
   - Professional details (job, business, industry)
   - Personal details (family, location, life stage)
   - Technical details (tools they use, platforms)

2. PREFERENCES (how they like things):
   - Communication style preferences
   - Work style preferences
   - Decision-making preferences

3. GOALS (what they want to achieve):
   - Short-term goals (next 1-3 months)
   - Long-term goals (6+ months)
   - Aspirations and dreams

4. CONTEXT (important situational information):
   - Current projects
   - Current challenges
   - Current life circumstances

5. STRUGGLES (what's hard for them):
   - Recurring pain points
   - Blockers and obstacles
   - Frustrations

6. STRENGTHS (what they're good at):
   - Skills and talents
   - Natural abilities
   - Wins and successes

7. ENTITIES (people, places, projects, concepts mentioned):
   - Names of people, businesses, projects
   - Tools and platforms they use
   - Concepts and frameworks they reference

8. PATTERNS (behavioral patterns you notice):
   - Recurring triggers
   - Decision-making patterns
   - Emotional patterns

PILLAR TAGS:
- BODY: Body acceptance, self-love, menopause, cold water therapy
- BRAIN: Neurovariance, ADHD, executive function, overwhelm
- BUSINESS: Branding, strategy, life-first entrepreneurship, content

Return ONLY valid JSON (no markdown, no backticks):
{
  "facts": [{ "content": "...", "confidence": 0.9, "pillarTags": ["BUSINESS"] }],
  "preferences": [],
  "goals": [],
  "context": [],
  "struggles": [],
  "strengths": [],
  "entities": [{ "type": "project", "name": "SUPERNova AI", "description": "AI coaching platform for neurodivergent entrepreneurs", "pillarTags": ["BUSINESS", "BRAIN"] }],
  "patterns": [{ "type": "trigger", "description": "...", "confidence": 0.7, "pillarTags": ["BRAIN"] }]
}`

/**
 * Extract memories from a conversation
 */
export async function extractMemoriesFromConversation(
  conversationId: string,
  userId: string
): Promise<ExtractedMemories | null> {
  try {
    // Get the last 10 messages from the conversation
    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    })

    if (messages.length < 2) {
      return null // Not enough to extract from
    }

    // Separate user and assistant messages
    const userMessages = messages
      .filter((m) => m.role === 'user')
      .reverse()
      .map((m) => m.content)
      .join('\n\n')

    const assistantMessages = messages
      .filter((m) => m.role === 'assistant')
      .reverse()
      .map((m) => m.content)
      .join('\n\n')

    // Call Claude Haiku for extraction (cheaper and faster)
    const response = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 2048,
      temperature: 0.3, // Lower temperature for more consistent extraction
      messages: [
        {
          role: 'user',
          content: `${MEMORY_EXTRACTION_PROMPT}

CONVERSATION TO ANALYZE:

USER MESSAGES:
${userMessages}

ASSISTANT RESPONSES:
${assistantMessages}

Extract memories as JSON:`,
        },
      ],
    })

    const textContent = response.content.find((block) => block.type === 'text')
    if (!textContent || textContent.type !== 'text') {
      return null
    }

    // Parse the JSON response
    const extracted = JSON.parse(textContent.text) as ExtractedMemories

    return extracted
  } catch (error) {
    console.error('Memory extraction error:', error)
    return null
  }
}

/**
 * Store extracted memories in the database
 */
export async function storeExtractedMemories(
  userId: string,
  conversationId: string,
  extracted: ExtractedMemories
): Promise<void> {
  try {
    // Store facts
    for (const fact of extracted.facts) {
      await prisma.userMemory.create({
        data: {
          userId,
          sourceConversationId: conversationId,
          memoryType: 'FACT',
          content: fact.content,
          importanceScore: fact.confidence * 10,
          pillarTags: fact.pillarTags,
        },
      })
    }

    // Store preferences
    for (const pref of extracted.preferences) {
      await prisma.userMemory.create({
        data: {
          userId,
          sourceConversationId: conversationId,
          memoryType: 'PREFERENCE',
          content: pref.content,
          importanceScore: pref.confidence * 10,
          pillarTags: pref.pillarTags,
        },
      })
    }

    // Store goals
    for (const goal of extracted.goals) {
      await prisma.userMemory.create({
        data: {
          userId,
          sourceConversationId: conversationId,
          memoryType: 'GOAL',
          content: goal.content,
          importanceScore: goal.confidence * 10,
          pillarTags: goal.pillarTags,
        },
      })
    }

    // Store context
    for (const ctx of extracted.context) {
      await prisma.userMemory.create({
        data: {
          userId,
          sourceConversationId: conversationId,
          memoryType: 'CONTEXT',
          content: ctx.content,
          importanceScore: ctx.confidence * 10,
          pillarTags: ctx.pillarTags,
        },
      })
    }

    // Store struggles
    for (const struggle of extracted.struggles) {
      await prisma.userMemory.create({
        data: {
          userId,
          sourceConversationId: conversationId,
          memoryType: 'STRUGGLE',
          content: struggle.content,
          importanceScore: struggle.confidence * 10,
          pillarTags: struggle.pillarTags,
        },
      })
    }

    // Store strengths
    for (const strength of extracted.strengths) {
      await prisma.userMemory.create({
        data: {
          userId,
          sourceConversationId: conversationId,
          memoryType: 'STRENGTH',
          content: strength.content,
          importanceScore: strength.confidence * 10,
          pillarTags: strength.pillarTags,
        },
      })
    }

    // Store entities
    for (const entity of extracted.entities) {
      // Check if entity already exists
      const existing = await prisma.extractedEntity.findFirst({
        where: {
          userId,
          name: entity.name,
          entityType: entity.type,
        },
      })

      if (existing) {
        // Update existing entity
        await prisma.extractedEntity.update({
          where: { id: existing.id },
          data: {
            description: entity.description,
            conversationIds: {
              push: conversationId,
            },
            mentionCount: { increment: 1 },
            lastMentioned: new Date(),
          },
        })
      } else {
        // Create new entity
        await prisma.extractedEntity.create({
          data: {
            userId,
            entityType: entity.type,
            name: entity.name,
            description: entity.description,
            conversationIds: [conversationId],
            pillarTags: entity.pillarTags,
            mentionCount: 1,
          },
        })
      }
    }

    // Store patterns
    for (const pattern of extracted.patterns) {
      // Check if pattern already exists
      const existing = await prisma.userPattern.findFirst({
        where: {
          userId,
          description: pattern.description,
        },
      })

      if (existing) {
        // Update existing pattern
        await prisma.userPattern.update({
          where: { id: existing.id },
          data: {
            evidence: {
              push: conversationId,
            },
            observationCount: { increment: 1 },
            confidence: Math.min((existing.confidence + pattern.confidence) / 2, 1.0),
            lastObserved: new Date(),
          },
        })
      } else {
        // Create new pattern
        await prisma.userPattern.create({
          data: {
            userId,
            patternType: pattern.type,
            description: pattern.description,
            evidence: [conversationId],
            confidence: pattern.confidence,
            pillarTags: pattern.pillarTags,
          },
        })
      }
    }

    console.log(`Stored memories for conversation ${conversationId}`)
  } catch (error) {
    console.error('Error storing memories:', error)
    throw error
  }
}

/**
 * Generate a conversation summary
 */
export async function generateConversationSummary(
  conversationId: string,
  userId: string,
  pillar: string
): Promise<void> {
  try {
    // Check if summary already exists
    const existing = await prisma.conversationSummary.findUnique({
      where: { conversationId },
    })

    if (existing) {
      return // Already summarized
    }

    // Get all messages
    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
    })

    if (messages.length < 3) {
      return // Not enough to summarize
    }

    const conversationText = messages
      .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
      .join('\n\n')

    // Generate summary with Haiku
    const response = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 1024,
      temperature: 0.3,
      messages: [
        {
          role: 'user',
          content: `Summarize this SUPERNova AI coaching conversation. Extract:
1. A 2-3 sentence summary
2. Key topics discussed (array of keywords)
3. Key concepts (main ideas)
4. Action items or commitments made
5. Emotional tone (one word: frustrated, motivated, stuck, excited, etc.)

CONVERSATION:
${conversationText}

Return as JSON:
{
  "summary": "...",
  "keyTopics": ["purpose", "branding"],
  "keyConcepts": ["..."],
  "actionItems": ["..."],
  "emotionalTone": "motivated"
}`,
        },
      ],
    })

    const textContent = response.content.find((block) => block.type === 'text')
    if (!textContent || textContent.type !== 'text') {
      return
    }

    const summaryData = JSON.parse(textContent.text)

    // Store summary
    await prisma.conversationSummary.create({
      data: {
        conversationId,
        userId,
        summary: summaryData.summary,
        keyTopics: summaryData.keyTopics || [],
        keyConcepts: summaryData.keyConcepts || [],
        actionItems: summaryData.actionItems || [],
        emotionalTone: summaryData.emotionalTone,
        messageCount: messages.length,
        pillar,
      },
    })

    console.log(`Generated summary for conversation ${conversationId}`)
  } catch (error) {
    console.error('Error generating summary:', error)
  }
}
