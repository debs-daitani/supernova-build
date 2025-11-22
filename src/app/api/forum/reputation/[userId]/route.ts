import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getReputationLevel, checkBadgesEarned } from '@/lib/forum-utils'

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params

    const reputation = await prisma.userReputation.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            profilePhotoUrl: true,
            createdAt: true,
          },
        },
      },
    })

    if (!reputation) {
      // Create initial reputation
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          username: true,
          profilePhotoUrl: true,
          createdAt: true,
        },
      })

      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      const newReputation = await prisma.userReputation.create({
        data: { userId },
      })

      const levelInfo = getReputationLevel(0)

      return NextResponse.json({
        ...newReputation,
        user,
        levelInfo,
      })
    }

    const levelInfo = getReputationLevel(reputation.points)

    // Check for new badges
    const newBadges = checkBadgesEarned({
      postsCount: reputation.postsCount,
      threadsCount: reputation.threadsCount,
      helpfulCount: reputation.helpfulCount,
      points: reputation.points,
      joinedAt: reputation.user.createdAt,
      currentBadges: reputation.badges,
    })

    // Update badges if new ones earned
    if (newBadges.length > 0) {
      const updatedReputation = await prisma.userReputation.update({
        where: { userId },
        data: {
          badges: {
            push: newBadges,
          },
        },
      })

      return NextResponse.json({
        ...updatedReputation,
        user: reputation.user,
        levelInfo,
        newBadges,
      })
    }

    return NextResponse.json({
      ...reputation,
      levelInfo,
    })
  } catch (error) {
    console.error('Error fetching reputation:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reputation' },
      { status: 500 }
    )
  }
}
