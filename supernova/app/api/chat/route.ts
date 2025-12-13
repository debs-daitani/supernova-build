import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { prisma } from '../../../lib/prisma'
import { getPersonalityContext, type CoachingMode } from '../../../lib/personalities'
import { curateContent } from '../../../lib/content-curator'
import {
  extractMemoriesFromConversation,
  storeExtractedMemories,
  generateConversationSummary,
} from '../../../lib/memory-extractor'
import {
  hybridSearch,
  formatChunksForPrompt,
} from '../../../lib/knowledge-retrieval'
import {
  detectOverwhelm,
  getDopamineMenu,
  formatDopamineMenuResponse,
  trackDopamineOffered,
} from '../../../lib/dopamine-detector'
import {
  detectLoopPattern,
  trackLoopOccurrence,
  getActiveLoops,
  formatLoopContext,
} from '../../../lib/pattern-interrupt'
import {
  detectDecisionParalysis,
  extractDecision,
  trackDecision,
  generateDecisionKillerPrompt,
} from '../../../lib/decision-killer'
import {
  detectCommitment,
  extractCommitment,
  createCommitment,
  getCommitmentsNeedingCheckIn,
  generateCheckInPrompt,
  generateCommitmentConfirmation,
} from '../../../lib/accountability-partner'
import {
  trackEnergy,
  getEnergyPatterns,
  formatEnergyInsight,
} from '../../../lib/energy-tracker'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      message,
      conversationId,
      userId,
      mode = 'GENERAL',
    } = body as {
      message: string
      conversationId?: string
      userId: string
      mode?: CoachingMode
    }

    if (!message || !userId) {
      return NextResponse.json(
        { error: 'Message and userId are required' },
        { status: 400 }
      )
    }

    // Get or create conversation
    let conversation
    if (conversationId) {
      conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        include: {
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 20, // Last 20 messages for context
          },
        },
      })
    }

    if (!conversation) {
      // Create new conversation
      conversation = await prisma.conversation.create({
        data: {
          userId,
          mode,
          title: message.slice(0, 50) + (message.length > 50 ? '...' : ''),
        },
        include: {
          messages: true,
        },
      })
    }

    // Get user memories for personalization
    const memories = await prisma.userMemory.findMany({
      where: {
        userId,
        OR: [
          { pillarTags: { has: mode } },
          { pillarTags: { isEmpty: true } },
        ],
      },
      orderBy: { importanceScore: 'desc' },
      take: 10,
    })

    const memoryContext = memories.map((m) => m.content)

    // Search knowledge base for relevant content
    const knowledgeChunks = await hybridSearch(message, mode, 3)

    // Curate relevant content from Albums (legacy system - keeping for now)
    const curatedContent = await curateContent(message, mode)

    // Store user message
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        userId,
        role: 'user',
        content: message,
      },
    })

    // TRACK ENERGY - background task, don't await
    trackEnergy(userId, conversation.id, message).catch((err) =>
      console.error('Energy tracking failed:', err)
    )

    // DETECT OVERWHELM - offer dopamine menu if user is stuck
    const isOverwhelmed = detectOverwhelm(message)
    let dopamineMenuContext = ''

    if (isOverwhelmed) {
      const dopamineItems = await getDopamineMenu(userId, mode, 3)
      if (dopamineItems.length > 0) {
        // Track that we're offering these
        dopamineItems.forEach((item) => trackDopamineOffered(item.id))

        dopamineMenuContext = `

# DOPAMINE RESCUE MODE ACTIVATED

The user sounds STUCK/OVERWHELMED. Offer them the dopamine menu below.

${formatDopamineMenuResponse(dopamineItems)}

Be empathetic but direct. Don't lecture. Just offer the menu and let them pick.
`
      }
    }

    // DETECT PATTERN LOOPS - interrupt spirals
    const loopType = detectLoopPattern(message)
    let patternInterruptContext = ''

    if (loopType) {
      const loopResult = await trackLoopOccurrence(
        userId,
        conversation.id,
        loopType,
        message
      )

      if (loopResult.shouldInterrupt) {
        patternInterruptContext = `

# PATTERN INTERRUPT TRIGGERED

Loop detected: ${loopType}
This pattern has appeared ${loopResult.occurrenceCount} times.

${loopResult.interruptMessage}

IMPORTANT: Deliver this interrupt with SUPERNova's bold, direct energy. Call out the pattern. Don't coddle. Be compassionate but FIRM.
`
      }
    }

    // Get active loops for context (even if not interrupting right now)
    const activeLoops = await getActiveLoops(userId)
    const loopHistoryContext = formatLoopContext(activeLoops)

    // DETECT DECISION PARALYSIS - force binary choices
    const isDeciding = detectDecisionParalysis(message)
    let decisionKillerContext = ''

    if (isDeciding) {
      const decision = extractDecision(message)
      if (decision) {
        const decisionResult = await trackDecision(
          userId,
          conversation.id,
          decision.question,
          decision.options
        )

        if (decisionResult.isStuck || decision.options.length > 2) {
          const killerPrompt = generateDecisionKillerPrompt(
            decision.question,
            decision.options,
            decisionResult.timesAsked
          )

          decisionKillerContext = `
${killerPrompt}

DELIVERY NOTES:
- Use SUPERNova's direct, no-BS energy
- Don't let them overthink
- Create urgency with time pressure
- If they've asked ${decisionResult.timesAsked}+ times, be FIRM
- Make them commit in their next message
`
        }
      }
    }

    // DETECT COMMITMENTS - track user promises
    const isCommitting = detectCommitment(message)
    let commitmentContext = ''

    if (isCommitting) {
      const commitment = extractCommitment(message)
      if (commitment) {
        // Create commitment record
        const deadline = commitment.timeframe === 'today'
          ? new Date(Date.now() + 24 * 60 * 60 * 1000)
          : commitment.timeframe === 'this_week'
          ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          : undefined

        await createCommitment(
          userId,
          commitment.description,
          'one-time',
          deadline,
          commitment.pillar
        )

        commitmentContext = generateCommitmentConfirmation(
          commitment.description,
          commitment.timeframe
        )
      }
    }

    // CHECK FOR COMMITMENTS NEEDING CHECK-IN
    const needCheckIn = await getCommitmentsNeedingCheckIn(userId)
    let checkInContext = ''

    if (needCheckIn.length > 0 && !isCommitting && !isOverwhelmed) {
      // Don't interrupt if user is overwhelmed or just made a new commitment
      checkInContext = generateCheckInPrompt(needCheckIn)
    }

    // GET ENERGY PATTERNS - every 10 messages, share insights
    const messageCount = await prisma.message.count({
      where: { conversationId: conversation.id },
    })
    let energyInsightContext = ''

    if (messageCount > 0 && messageCount % 10 === 0) {
      const patterns = await getEnergyPatterns(userId, 30)
      if (patterns) {
        energyInsightContext = formatEnergyInsight(patterns)
      }
    }

    // Build conversation history for Claude
    const conversationHistory: Anthropic.MessageParam[] =
      conversation.messages
        .reverse() // Oldest first
        .map((msg) => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        }))

    // Add current user message
    conversationHistory.push({
      role: 'user',
      content: message,
    })

    // Get personality-enhanced system prompt with curated content
    let systemPrompt = getPersonalityContext(mode, memoryContext)

    // If we found relevant content, add it to the system prompt
    if (curatedContent && curatedContent.relevanceScore >= 3) {
      const contentContext = `

# RELEVANT PROGRAM CONTENT

You have access to program content from "${curatedContent.albumTitle}" - specifically the track "${curatedContent.trackTitle}".

When responding to the user's question, you MAY weave in relevant insights, frameworks, or exercises from this content IF it's genuinely helpful. DO NOT force it - only reference it if it naturally enhances your response.

Available sections:
${curatedContent.sections.map((s) => `
## ${s.type}
${s.content.substring(0, 800)}...
`).join('\n')}

IMPORTANT DELIVERY GUIDELINES:
- Don't say "I have some content for you" or "Here's what the program says"
- Instead, naturally weave insights into your coaching response
- Use SUPERNova's voice (bold, direct, rock-and-roll energy) even when sharing program content
- If recommending an exercise from the content, present it as YOUR coaching guidance, not as "here's an exercise from the program"
- You can mention the Album/Track name IF it adds value (e.g., "This is what we cover in TOO GOOD AT RAISING HELL"), but don't make it feel like you're reading from a script
- Keep your responses conversational and personalized to THIS user, not generic program delivery

Think of the program content as YOUR knowledge base that you're sharing in a coaching conversation, not as a separate resource you're recommending.
`
      systemPrompt += contentContext
    }

    // Add knowledge base content if found
    if (knowledgeChunks.length > 0) {
      const knowledgeContext = `

# KNOWLEDGE BASE CONTENT

You have access to relevant content from your uploaded knowledge base. Use this to enhance your coaching response.

${formatChunksForPrompt(knowledgeChunks)}

DELIVERY GUIDELINES:
- Weave insights naturally into your coaching response
- Use SUPERNova's bold, direct voice (not generic textbook style)
- Don't say "According to the content..." - just share the insights as YOUR wisdom
- Adapt frameworks/exercises to THIS user's specific situation
- If the content provides a framework, deliver it conversationally, not as a bulleted list (unless that's SUPERNova's style for that specific point)
`
      systemPrompt += knowledgeContext
    }

    // Add dopamine menu if user is overwhelmed
    if (dopamineMenuContext) {
      systemPrompt += dopamineMenuContext
    }

    // Add pattern interrupt if loop detected
    if (patternInterruptContext) {
      systemPrompt += patternInterruptContext
    }

    // Add loop history context for awareness
    if (loopHistoryContext) {
      systemPrompt += loopHistoryContext
    }

    // Add decision killer if user is stuck deciding
    if (decisionKillerContext) {
      systemPrompt += decisionKillerContext
    }

    // Add commitment confirmation if user made a promise
    if (commitmentContext) {
      systemPrompt += commitmentContext
    }

    // Add check-in prompt if commitments need follow-up
    if (checkInContext) {
      systemPrompt += checkInContext
    }

    // Add energy insights if it's time
    if (energyInsightContext) {
      systemPrompt += energyInsightContext
    }

    // Call Claude with streaming
    const stream = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 2048,
      system: systemPrompt,
      messages: conversationHistory,
      stream: true,
    })

    // Set up streaming response
    const encoder = new TextEncoder()
    let fullResponse = ''

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const messageStreamEvent of stream) {
            if (
              messageStreamEvent.type === 'content_block_delta' &&
              messageStreamEvent.delta.type === 'text_delta'
            ) {
              const text = messageStreamEvent.delta.text
              fullResponse += text
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`))
            }
          }

          // Store assistant response
          const savedMessage = await prisma.message.create({
            data: {
              conversationId: conversation.id,
              userId,
              role: 'assistant',
              content: fullResponse,
              modelUsed: 'claude-3-5-sonnet-20241022',
            },
          })

          // Update conversation timestamp
          await prisma.conversation.update({
            where: { id: conversation.id },
            data: { lastMessageAt: new Date() },
          })

          // BACKGROUND: Extract memories every 5 messages
          const messageCount = await prisma.message.count({
            where: { conversationId: conversation.id },
          })

          if (messageCount % 5 === 0) {
            // Run extraction in background (don't await)
            extractMemoriesFromConversation(conversation.id, userId)
              .then((extracted) => {
                if (extracted) {
                  return storeExtractedMemories(userId, conversation.id, extracted)
                }
              })
              .then(() => {
                return generateConversationSummary(conversation.id, userId, mode)
              })
              .catch((error) => {
                console.error('Background memory extraction failed:', error)
              })
          }

          // Send final event with message ID
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                done: true,
                conversationId: conversation.id,
                messageId: savedMessage.id
              })}\n\n`
            )
          )

          controller.close()
        } catch (error) {
          console.error('Streaming error:', error)
          controller.error(error)
        }
      },
    })

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Chat API error:', error)

    // Provide more specific error messages
    let errorMessage = 'Internal server error'
    let errorDetails = 'Unknown error'

    if (error instanceof Error) {
      errorDetails = error.message

      // Check for common issues
      if (error.message.includes('prisma') || error.message.includes('database') || error.message.includes('connect')) {
        errorMessage = 'Database connection failed'
      } else if (error.message.includes('ANTHROPIC') || error.message.includes('API key') || error.message.includes('authentication')) {
        errorMessage = 'AI service configuration error'
      } else if (error.message.includes('Could not find')) {
        errorMessage = 'Missing dependency or import'
      }
    }

    return NextResponse.json(
      { error: errorMessage, details: errorDetails },
      { status: 500 }
    )
  }
}
