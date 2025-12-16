import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth-middleware'

type RouteContext = {
  params: Promise<{ id: string }>
}

// GET /api/social/posts/[id] - Get single post
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params

    const post = await prisma.socialPost.findFirst({
      where: { id, userId: auth.userId }
    })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    return NextResponse.json(post)
  } catch (error) {
    console.error('Error fetching social post:', error)
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 })
  }
}

// PUT /api/social/posts/[id] - Update post
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params
    const body = await request.json()

    // Check ownership
    const existing = await prisma.socialPost.findFirst({
      where: { id, userId: auth.userId }
    })

    if (!existing) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // Can't edit published posts
    if (existing.status === 'published') {
      return NextResponse.json({ error: 'Cannot edit published posts' }, { status: 400 })
    }

    const { content, mediaUrls, platforms, scheduledFor, status } = body

    const post = await prisma.socialPost.update({
      where: { id },
      data: {
        ...(content !== undefined && { content }),
        ...(mediaUrls !== undefined && { mediaUrls }),
        ...(platforms !== undefined && { platforms }),
        ...(scheduledFor !== undefined && {
          scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
          status: scheduledFor ? 'scheduled' : (status || existing.status)
        }),
        ...(status !== undefined && !scheduledFor && { status }),
      }
    })

    return NextResponse.json(post)
  } catch (error) {
    console.error('Error updating social post:', error)
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 })
  }
}

// DELETE /api/social/posts/[id] - Delete post
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params

    // Check ownership
    const existing = await prisma.socialPost.findFirst({
      where: { id, userId: auth.userId }
    })

    if (!existing) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // Can't delete published posts (they exist on social platforms)
    if (existing.status === 'published') {
      return NextResponse.json({ error: 'Cannot delete published posts' }, { status: 400 })
    }

    await prisma.socialPost.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting social post:', error)
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 })
  }
}

// POST /api/social/posts/[id]/publish - Publish now
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params

    // Check ownership
    const post = await prisma.socialPost.findFirst({
      where: { id, userId: auth.userId }
    })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    if (post.status === 'published') {
      return NextResponse.json({ error: 'Post already published' }, { status: 400 })
    }

    const platforms = post.platforms as string[]

    // Get connected accounts for platforms
    const accounts = await prisma.socialAccount.findMany({
      where: {
        userId: auth.userId,
        platform: { in: platforms },
        isActive: true
      }
    })

    if (accounts.length === 0) {
      return NextResponse.json({ error: 'No connected accounts for selected platforms' }, { status: 400 })
    }

    const results: Record<string, { success: boolean; postId?: string; error?: string }> = {}

    // Publish to each platform
    for (const account of accounts) {
      try {
        const result = await publishToPlatform(account, post)
        results[account.platform] = result
      } catch (error: any) {
        results[account.platform] = { success: false, error: error.message }
      }
    }

    // Check if any succeeded
    const anySuccess = Object.values(results).some(r => r.success)

    // Update post status
    const updatedPost = await prisma.socialPost.update({
      where: { id },
      data: {
        status: anySuccess ? 'published' : 'failed',
        publishedAt: anySuccess ? new Date() : null,
        externalIds: results,
        errorMessage: anySuccess ? null : 'Failed to publish to all platforms'
      }
    })

    return NextResponse.json({
      post: updatedPost,
      results
    })
  } catch (error) {
    console.error('Error publishing social post:', error)
    return NextResponse.json({ error: 'Failed to publish post' }, { status: 500 })
  }
}

async function publishToPlatform(
  account: any,
  post: any
): Promise<{ success: boolean; postId?: string; error?: string }> {
  const mediaUrls = (post.mediaUrls as string[]) || []

  switch (account.platform) {
    case 'facebook': {
      // Facebook Page Post
      const response = await fetch(
        `https://graph.facebook.com/v18.0/me/feed`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: post.content,
            access_token: account.accessToken,
            ...(mediaUrls.length > 0 && { link: mediaUrls[0] })
          })
        }
      )
      const data = await response.json()
      if (data.error) {
        return { success: false, error: data.error.message }
      }
      return { success: true, postId: data.id }
    }

    case 'instagram': {
      // Instagram requires media - can't post text-only
      if (mediaUrls.length === 0) {
        return { success: false, error: 'Instagram requires an image' }
      }

      // Step 1: Create media container
      const containerResponse = await fetch(
        `https://graph.facebook.com/v18.0/${account.accountId}/media`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image_url: mediaUrls[0],
            caption: post.content,
            access_token: account.accessToken
          })
        }
      )
      const containerData = await containerResponse.json()
      if (containerData.error) {
        return { success: false, error: containerData.error.message }
      }

      // Step 2: Publish the container
      const publishResponse = await fetch(
        `https://graph.facebook.com/v18.0/${account.accountId}/media_publish`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            creation_id: containerData.id,
            access_token: account.accessToken
          })
        }
      )
      const publishData = await publishResponse.json()
      if (publishData.error) {
        return { success: false, error: publishData.error.message }
      }
      return { success: true, postId: publishData.id }
    }

    case 'linkedin': {
      // LinkedIn share
      const response = await fetch(
        'https://api.linkedin.com/v2/ugcPosts',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${account.accessToken}`,
            'X-Restli-Protocol-Version': '2.0.0'
          },
          body: JSON.stringify({
            author: `urn:li:person:${account.accountId}`,
            lifecycleState: 'PUBLISHED',
            specificContent: {
              'com.linkedin.ugc.ShareContent': {
                shareCommentary: { text: post.content },
                shareMediaCategory: mediaUrls.length > 0 ? 'IMAGE' : 'NONE',
                ...(mediaUrls.length > 0 && {
                  media: mediaUrls.map((url: string) => ({
                    status: 'READY',
                    originalUrl: url
                  }))
                })
              }
            },
            visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' }
          })
        }
      )
      const data = await response.json()
      if (data.status && data.status >= 400) {
        return { success: false, error: data.message || 'LinkedIn API error' }
      }
      return { success: true, postId: data.id }
    }

    case 'tiktok': {
      // TikTok video upload (requires video, not just images)
      return { success: false, error: 'TikTok posting requires video upload via their creator tools' }
    }

    default:
      return { success: false, error: 'Unsupported platform' }
  }
}
