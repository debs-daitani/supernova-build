import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { generateSlug, makeUniqueSlug, calculatePoints } from '@/lib/forum-utils'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')
    const userId = searchParams.get('userId')
    const featured = searchParams.get('featured')
    const sort = searchParams.get('sort') || 'recent'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search')

    const where: any = {}

    if (categoryId) where.categoryId = categoryId
    if (userId) where.userId = userId
    if (featured === 'true') where.isFeatured = true
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } },
      ]
    }

    let orderBy: any = { lastActivityAt: 'desc' }
    if (sort === 'recent') orderBy = { createdAt: 'desc' }
    if (sort === 'popular') orderBy = { viewCount: 'desc' }
    if (sort === 'replies') orderBy = { replyCount: 'desc' }

    const [threads, total] = await Promise.all([
      prisma.forumThread.findMany({
        where,
        orderBy: [{ isPinned: 'desc' }, orderBy],
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              profilePhotoUrl: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
              color: true,
            },
          },
          posts: {
            where: { isFirstPost: true },
            take: 1,
            select: {
              content: true,
              createdAt: true,
            },
          },
          _count: {
            select: {
              posts: true,
            },
          },
        },
      }),
      prisma.forumThread.count({ where }),
    ])

    return NextResponse.json({
      threads,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Error fetching threads:', error)
    return NextResponse.json(
      { error: 'Failed to fetch threads' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = 'user_placeholder' // TODO: Get from auth
    const body = await request.json()
    const { title, content, categoryId, tags } = body

    // Validate
    if (!title || title.length < 10) {
      return NextResponse.json(
        { error: 'Title must be at least 10 characters' },
        { status: 400 }
      )
    }

    if (!content || content.length < 10) {
      return NextResponse.json(
        { error: 'Content must be at least 10 characters' },
        { status: 400 }
      )
    }

    // Generate unique slug
    const baseSlug = generateSlug(title)
    const existingSlugs = await prisma.forumThread.findMany({
      where: {
        slug: {
          startsWith: baseSlug,
        },
      },
      select: { slug: true },
    })
    const slug = makeUniqueSlug(
      baseSlug,
      existingSlugs.map((t) => t.slug)
    )

    // Create thread and first post in transaction
    const result = await prisma.$transaction(async (tx) => {
      const thread = await tx.forumThread.create({
        data: {
          title,
          slug,
          categoryId,
          userId,
          tags: tags || [],
          lastActivityAt: new Date(),
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
          category: true,
        },
      })

      // Create first post
      await tx.forumPost.create({
        data: {
          threadId: thread.id,
          userId,
          content,
          isFirstPost: true,
        },
      })

      // Update reputation
      const reputation = await tx.userReputation.upsert({
        where: { userId },
        update: {
          points: { increment: calculatePoints({ type: 'CREATE_THREAD' }) },
          threadsCount: { increment: 1 },
          postsCount: { increment: 1 },
        },
        create: {
          userId,
          points: calculatePoints({ type: 'CREATE_THREAD' }),
          threadsCount: 1,
          postsCount: 1,
        },
      })

      return { thread, reputation }
    })

    return NextResponse.json(result.thread, { status: 201 })
  } catch (error) {
    console.error('Error creating thread:', error)
    return NextResponse.json(
      { error: 'Failed to create thread' },
      { status: 500 }
    )
  }
}
