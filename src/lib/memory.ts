import { openai } from './openai'
import { prisma } from './prisma'

const MEMORY_EXTRACTION_PROMPT = `Analyze the following conversation and extract key memories about the user.

Extract:
1. **Facts** - Concrete information (e.g., "runs a coaching business", "has 2 kids")
2. **Preferences** - Likes, dislikes, communication style (e.g., "prefers short emails", "dislikes corporate jargon")
3. **Goals** - Aspirations, targets, challenges (e.g., "wants to scale to £10k/month", "struggling with time management")
4. **Context** - Important background information (e.g., "diagnosed with ADHD in 2022", "recently left corporate job")

For each memory:
- Be specific and actionable
- Use first-person perspective ("I run a coaching business" not "User runs...")
- Include context when relevant
- Rate importance 0.0-1.0 (1.0 = critical, 0.5 = useful, 0.0 = trivial)

Return as JSON array:
[
  {
    "type": "FACT" | "PREFERENCE" | "GOAL" | "CONTEXT",
    "content": "specific memory text",
    "importance": 0.0-1.0,
    "pillar": "BODY" | "BRAIN" | "BUSINESS" | null
  }
]

Conversation:
`

export async function extractMemoriesFromConversation(
  userId: string,
  conversationId: string,
  messages: Array<{ role: string; content: string }>
): Promise<void> {
  try {
    // Only extract memories from conversations with at least 4 messages
    if (messages.length < 4) return

    // Get last few messages for context
    const recentMessages = messages.slice(-10)

    const conversationText = recentMessages
      .map(m => `${m.role === 'user' ? 'User' : 'SUPERNova'}: ${m.content}`)
      .join('\n\n')

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: MEMORY_EXTRACTION_PROMPT,
        },
        {
          role: 'user',
          content: conversationText,
        },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    })

    const content = response.choices[0]?.message?.content
    if (!content) return

    let extracted: any
    try {
      extracted = JSON.parse(content)
    } catch {
      console.error('Failed to parse memory extraction response')
      return
    }

    const memories = Array.isArray(extracted) ? extracted : extracted.memories || []

    // Store memories
    for (const memory of memories) {
      if (!memory.content || !memory.type) continue

      // Check if similar memory already exists
      const existing = await prisma.userMemory.findFirst({
        where: {
          userId,
          content: {
            contains: memory.content.substring(0, 50),
          },
        },
      })

      if (existing) {
        // Update importance if new one is higher
        if (memory.importance > existing.importanceScore) {
          await prisma.userMemory.update({
            where: { id: existing.id },
            data: {
              importanceScore: memory.importance,
              sourceConversationId: conversationId,
            },
          })
        }
      } else {
        // Create new memory
        await prisma.userMemory.create({
          data: {
            userId,
            memoryType: memory.type,
            content: memory.content,
            sourceConversationId: conversationId,
            importanceScore: memory.importance || 0.5,
            pillarTags: memory.pillar ? [memory.pillar] : [],
          },
        })
      }
    }

    console.log(`Extracted ${memories.length} memories from conversation ${conversationId}`)
  } catch (error) {
    console.error('Memory extraction error:', error)
    // Don't throw - memory extraction is optional
  }
}

export async function getRelevantMemories(
  userId: string,
  currentMessage: string,
  limit: number = 10
): Promise<any[]> {
  try {
    // Simple relevance: get most important memories
    // TODO: Implement semantic search with embeddings for better matching
    const memories = await prisma.userMemory.findMany({
      where: { userId },
      orderBy: [
        { importanceScore: 'desc' },
        { createdAt: 'desc' },
      ],
      take: limit,
    })

    return memories
  } catch (error) {
    console.error('Get relevant memories error:', error)
    return []
  }
}

export async function updateMemoryFromFeedback(
  memoryId: string,
  userId: string,
  feedback: 'important' | 'forget'
): Promise<void> {
  try {
    if (feedback === 'forget') {
      await prisma.userMemory.deleteMany({
        where: {
          id: memoryId,
          userId,
        },
      })
    } else if (feedback === 'important') {
      await prisma.userMemory.updateMany({
        where: {
          id: memoryId,
          userId,
        },
        data: {
          importanceScore: 1.0,
        },
      })
    }
  } catch (error) {
    console.error('Update memory feedback error:', error)
  }
}
