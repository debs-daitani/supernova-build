import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { calculatePoints, extractMentions } from '@/lib/forum-utils'

export async function POST(request: NextRequest) {
  try {
    const userId = 'user_placeholder' // TODO: Get from auth
    const body = await request.json()
    const { threadId, content } = body

    // Validate
    if (!content || content.length < 10) {
      return NextResponse.json(
        { error: 'Content must be at least 10 characters' },
        { status: 400 }
      )
    }

    // Check if thread exists and is not locked
    const thread = await prisma.forumThread.findUnique({
      where: { id: threadId },
    })

    if (!thread) {
      return NextResponse.json({ error: 'Thread not found' }, { status: 404 })
    }

    if (thread.isLocked) {
      return NextResponse.json(
        { error: 'Thread is locked' },
        { status: 403 }
      )
    }

    // Extract mentions
    const mentions = extractMentions(content)

    // Create post and update thread/reputation in transaction
    const result = await prisma.$transaction(async (tx) => {
      const post = await tx.forumPost.create({
        data: {
          threadId,
          userId,
          content,
          isFirstPost: false,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              profilePhotoUrl: true,
            },
          },
        },
      })

      // Update thread
      await tx.forumThread.update({
        where: { id: threadId },
        data: {
          replyCount: { increment: 1 },
          lastActivityAt: new Date(),
          lastReplyUserId: userId,
        },
      })

      // Update reputation
      await tx.userReputation.upsert({
        where: { userId },
        update: {
          points: { increment: calculatePoints({ type: 'POST_REPLY' }) },
          postsCount: { increment: 1 },
        },
        create: {
          userId,
          points: calculatePoints({ type: 'POST_REPLY' }),
          postsCount: 1,
        },
      })

      // TODO: Send notifications for mentions

      return post
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Error creating post:', error)
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    )
  }
}
