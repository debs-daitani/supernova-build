import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - List all memories for user
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const pillar = searchParams.get('pillar')

    const memories = await prisma.userMemory.findMany({
      where: {
        userId: session.userId,
        ...(type && { memoryType: type as any }),
        ...(pillar && { pillarTags: { has: pillar as any } }),
      },
      orderBy: [
        { importanceScore: 'desc' },
        { createdAt: 'desc' },
      ],
      include: {
        sourceConversation: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    })

    return NextResponse.json({ memories })
  } catch (error) {
    console.error('Get memories error:', error)
    return NextResponse.json(
      { error: 'Failed to get memories' },
      { status: 500 }
    )
  }
}
