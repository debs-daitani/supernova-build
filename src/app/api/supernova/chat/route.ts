import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateResponse, buildContextPrompt } from '@/lib/openai'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { conversationId, message } = await request.json()

    if (!conversationId || !message) {
      return NextResponse.json(
        { error: 'Missing conversationId or message' },
        { status: 400 }
      )
    }

    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        name: true,
        role: true,
        quizResults: true,
        subscriptionTier: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check access level
    if (!['UPGRADE', 'MEMBER', 'ADMIN'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Upgrade required to access SUPERNova AI' },
        { status: 403 }
      )
    }

    // Get conversation
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        userId: session.userId,
      },
    })

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      )
    }

    // Store user message
    const userMessage = await prisma.message.create({
      data: {
        conversationId,
        userId: session.userId,
        role: 'user',
        content: message,
      },
    })

    // Get recent messages for context (last 20)
    const recentMessages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        role: true,
        content: true,
      },
    })

    // Reverse to get chronological order
    recentMessages.reverse()

    // Get user memories (top 10 most important)
    const memories = await prisma.userMemory.findMany({
      where: { userId: session.userId },
      orderBy: { importanceScore: 'desc' },
      take: 10,
      select: {
        content: true,
        memoryType: true,
      },
    })

    // Build context
    const userContext = buildContextPrompt(
      user.name,
      user.role,
      user.quizResults,
      memories,
      recentMessages
    )

    // Generate AI response (streaming)
    const stream = await generateResponse(
      recentMessages.map(m => ({ role: m.role, content: m.content })),
      userContext,
      true
    )

    // Create a streaming response
    const encoder = new TextEncoder()
    const readableStream = new ReadableStream({
      async start(controller) {
        let fullResponse = ''

        for await (const chunk of stream as any) {
          const content = chunk.choices[0]?.delta?.content || ''
          if (content) {
            fullResponse += content
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`))
          }
        }

        // Store assistant message
        await prisma.message.create({
          data: {
            conversationId,
            userId: session.userId,
            role: 'assistant',
            content: fullResponse,
            modelUsed: 'gpt-4-turbo-preview',
          },
        })

        // Update conversation timestamp
        await prisma.conversation.update({
          where: { id: conversationId },
          data: { lastMessageAt: new Date() },
        })

        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
      },
    })

    return new NextResponse(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    )
  }
}
