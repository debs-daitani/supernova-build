import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { prisma } from '@/lib/prisma'
import { getPersonalityContext, type CoachingMode } from '@/lib/personalities'

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

    // Store user message
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        userId,
        role: 'user',
        content: message,
      },
    })

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

    // Get personality-enhanced system prompt
    const systemPrompt = getPersonalityContext(mode, memoryContext)

    // Call Claude with streaming
    const stream = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
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
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
