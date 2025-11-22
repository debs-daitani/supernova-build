import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// Delete user analytics data (GDPR right to be forgotten)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params

    // Delete all analytics data for this user
    await prisma.$transaction([
      prisma.analyticsEvent.deleteMany({ where: { userId } }),
      prisma.analyticsSession.deleteMany({ where: { userId } }),
      prisma.userActivity.deleteMany({ where: { userId } }),
    ])

    return NextResponse.json({
      success: true,
      message: 'User analytics data deleted',
    })
  } catch (error) {
    console.error('Error deleting user analytics:', error)
    return NextResponse.json(
      { error: 'Failed to delete user analytics' },
      { status: 500 }
    )
  }
}
