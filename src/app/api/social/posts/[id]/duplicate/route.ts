import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { duplicateSocialPost } from '@/lib/social-media'

/**
 * POST /api/social/posts/[id]/duplicate
 * Duplicate an existing social post
 */
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const newPost = await duplicateSocialPost(params.id, session.user.id)

    return NextResponse.json(newPost, { status: 201 })
  } catch (error) {
    console.error('Failed to duplicate post:', error)
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to duplicate post'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
