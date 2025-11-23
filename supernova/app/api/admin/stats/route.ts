import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

export async function GET() {
  try {
    const [
      totalUsers,
      totalConversations,
      totalMessages,
      totalVoiceMemos,
      totalCommitments,
      activeCommitments,
      totalKnowledgePrograms,
      totalContentChunks,
      dopamineStats,
      patternsDetected,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.conversation.count(),
      prisma.message.count(),
      prisma.voiceMemo.count(),
      prisma.commitment.count(),
      prisma.commitment.count({ where: { status: 'active' } }),
      prisma.knowledgeProgram.count(),
      prisma.contentChunk.count(),
      prisma.dopamineMenuItem.aggregate({
        _sum: {
          timesOffered: true,
          timesCompleted: true,
        },
      }),
      prisma.loopDetection.count(),
    ])

    return NextResponse.json({
      totalUsers,
      totalConversations,
      totalMessages,
      totalVoiceMemos,
      totalCommitments,
      activeCommitments,
      totalKnowledgePrograms,
      totalContentChunks,
      dopamineItemsOffered: dopamineStats._sum.timesOffered || 0,
      dopamineItemsCompleted: dopamineStats._sum.timesCompleted || 0,
      patternsDetected,
    })
  } catch (error) {
    console.error('Stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
