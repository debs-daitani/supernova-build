import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { disconnectPlatform } from '@/lib/social-media'

/**
 * DELETE /api/social/platforms/[id]
 * Disconnect a social platform
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const platform = await disconnectPlatform(session.user.id, params.id)

    return NextResponse.json({
      message: 'Platform disconnected successfully',
      platform,
    })
  } catch (error) {
    console.error('Failed to disconnect platform:', error)
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to disconnect platform'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
