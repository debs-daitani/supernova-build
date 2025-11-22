import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const categories = await prisma.forumCategory.findMany({
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: {
            threads: true,
          },
        },
      },
    })

    // Get thread counts and latest activity for each category
    const categoriesWithStats = await Promise.all(
      categories.map(async (category) => {
        const threads = await prisma.forumThread.findMany({
          where: { categoryId: category.id },
          include: {
            _count: {
              select: { posts: true },
            },
          },
        })

        const postCount = threads.reduce((sum, thread) => sum + thread._count.posts, 0)

        const latestThread = await prisma.forumThread.findFirst({
          where: { categoryId: category.id },
          orderBy: { lastActivityAt: 'desc' },
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

        return {
          ...category,
          threadCount: threads.length,
          postCount,
          latestThread,
        }
      })
    )

    return NextResponse.json(categoriesWithStats)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, slug, description, icon, color, order } = body

    // Check if slug already exists
    const existing = await prisma.forumCategory.findUnique({
      where: { slug },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Category with this slug already exists' },
        { status: 400 }
      )
    }

    const category = await prisma.forumCategory.create({
      data: {
        name,
        slug,
        description,
        icon,
        color,
        order: order || 0,
      },
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    )
  }
}
