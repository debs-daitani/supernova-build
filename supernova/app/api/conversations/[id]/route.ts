import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { cookies } from 'next/headers'
import { verify } from 'jsonwebtoken'

interface JWTPayload {
  userId: string
  email: string
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let decoded: JWTPayload
    try {
      decoded = verify(token, process.env.JWT_SECRET || 'fallback-secret') as JWTPayload
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { id } = await params

    // Get conversation with messages
    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    // Verify user owns this conversation
    if (conversation.userId !== decoded.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    return NextResponse.json({
      id: conversation.id,
      title: conversation.title,
      mode: conversation.mode,
      messages: conversation.messages,
      createdAt: conversation.createdAt,
      lastMessageAt: conversation.lastMessageAt,
    })
  } catch (error) {
    console.error('Get conversation error:', error)
    return NextResponse.json(
      { error: 'Failed to get conversation' },
      { status: 500 }
    )
  }
}
