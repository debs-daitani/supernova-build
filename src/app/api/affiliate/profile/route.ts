import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { createAffiliateProfile } from '@/lib/affiliates'

/**
 * GET /api/affiliate/profile
 * Get or create user's affiliate profile
 */
export async function GET() {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has affiliate profile
    let profile = await prisma.affiliateProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        user: {
          select: {
            email: true,
            role: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    })

    // Create profile if it doesn't exist
    if (!profile) {
      const newProfile = await createAffiliateProfile(session.user.id)
      profile = await prisma.affiliateProfile.findUnique({
        where: { userId: session.user.id },
        include: {
          user: {
            select: {
              email: true,
              role: true,
              profile: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      })
    }

    return NextResponse.json(profile)
  } catch (error) {
    console.error('Error fetching affiliate profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
