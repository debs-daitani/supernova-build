import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth-middleware'

// GET /api/marketing/bio - Get user's link-in-bio
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const bio = await prisma.linkInBio.findUnique({
      where: { userId: auth.userId }
    })

    return NextResponse.json(bio)
  } catch (error) {
    console.error('Error fetching bio:', error)
    return NextResponse.json({ error: 'Failed to fetch bio' }, { status: 500 })
  }
}

// POST /api/marketing/bio - Create or update link-in-bio
export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { username, title, bio, avatarUrl, links, theme } = body

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 })
    }

    // Check if username is unique (excluding current user)
    const existingUsername = await prisma.linkInBio.findFirst({
      where: {
        username,
        NOT: { userId: auth.userId }
      }
    })

    if (existingUsername) {
      return NextResponse.json({ error: 'Username already taken' }, { status: 400 })
    }

    const linkInBio = await prisma.linkInBio.upsert({
      where: { userId: auth.userId },
      create: {
        userId: auth.userId,
        username,
        title,
        bio,
        avatarUrl,
        links: links || [],
        theme: theme || 'default',
      },
      update: {
        username,
        ...(title !== undefined && { title }),
        ...(bio !== undefined && { bio }),
        ...(avatarUrl !== undefined && { avatarUrl }),
        ...(links !== undefined && { links }),
        ...(theme !== undefined && { theme }),
      }
    })

    return NextResponse.json(linkInBio)
  } catch (error) {
    console.error('Error saving bio:', error)
    return NextResponse.json({ error: 'Failed to save bio' }, { status: 500 })
  }
}

// DELETE /api/marketing/bio - Delete link-in-bio
export async function DELETE(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.linkInBio.delete({
      where: { userId: auth.userId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting bio:', error)
    return NextResponse.json({ error: 'Failed to delete bio' }, { status: 500 })
  }
}
