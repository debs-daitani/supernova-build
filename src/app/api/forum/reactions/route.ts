import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { calculatePoints } from '@/lib/forum-utils'

export async function POST(request: NextRequest) {
  try {
    const userId = 'user_placeholder' // TODO: Get from auth
    const body = await request.json()
    const { postId, reactionType } = body

    // Validate reaction type
    const validReactions = ['HELPFUL', 'LOVE', 'CELEBRATE', 'SPARK', 'ROCKSTAR']
    if (!validReactions.includes(reactionType)) {
      return NextResponse.json(
        { error: 'Invalid reaction type' },
        { status: 400 }
      )
    }

    // Check if reaction already exists
    const existing = await prisma.forumReaction.findUnique({
      where: {
        postId_userId_reactionType: {
          postId,
          userId,
          reactionType,
        },
      },
    })

    if (existing) {
      // Remove reaction (toggle off)
      await prisma.forumReaction.delete({
        where: { id: existing.id },
      })

      // Decrement helpful count if HELPFUL reaction
      if (reactionType === 'HELPFUL') {
        const post = await prisma.forumPost.findUnique({
          where: { id: postId },
          select: { userId: true },
        })

        if (post) {
          await prisma.userReputation.update({
            where: { userId: post.userId },
            data: {
              points: { decrement: calculatePoints({ type: 'RECEIVE_HELPFUL' }) },
              helpfulCount: { decrement: 1 },
            },
          })
        }
      }

      return NextResponse.json({ removed: true })
    }

    // Create reaction
    const reaction = await prisma.forumReaction.create({
      data: {
        postId,
        userId,
        reactionType,
      },
    })

    // Increment helpful count if HELPFUL reaction
    if (reactionType === 'HELPFUL') {
      const post = await prisma.forumPost.findUnique({
        where: { id: postId },
        select: { userId: true },
      })

      if (post) {
        await prisma.userReputation.upsert({
          where: { userId: post.userId },
          update: {
            points: { increment: calculatePoints({ type: 'RECEIVE_HELPFUL' }) },
            helpfulCount: { increment: 1 },
          },
          create: {
            userId: post.userId,
            points: calculatePoints({ type: 'RECEIVE_HELPFUL' }),
            helpfulCount: 1,
          },
        })
      }
    }

    return NextResponse.json({ added: true, reaction })
  } catch (error) {
    console.error('Error managing reaction:', error)
    return NextResponse.json(
      { error: 'Failed to manage reaction' },
      { status: 500 }
    )
  }
}
