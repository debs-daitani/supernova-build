import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const userId = 'user_placeholder' // TODO: Get from auth
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // THREAD or CATEGORY

    const where: any = { userId }
    if (type) where.subscriptionType = type

    const subscriptions = await prisma.forumSubscription.findMany({
      where,
      include: {
        thread: {
          include: {
            category: true,
            user: {
              select: {
                id: true,
                name: true,
                username: true,
              },
            },
          },
        },
        category: true,
      },
    })

    return NextResponse.json(subscriptions)
  } catch (error) {
    console.error('Error fetching subscriptions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscriptions' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = 'user_placeholder' // TODO: Get from auth
    const body = await request.json()
    const { threadId, categoryId, subscriptionType } = body

    if (!['THREAD', 'CATEGORY'].includes(subscriptionType)) {
      return NextResponse.json(
        { error: 'Invalid subscription type' },
        { status: 400 }
      )
    }

    if (subscriptionType === 'THREAD' && !threadId) {
      return NextResponse.json(
        { error: 'Thread ID required for thread subscription' },
        { status: 400 }
      )
    }

    if (subscriptionType === 'CATEGORY' && !categoryId) {
      return NextResponse.json(
        { error: 'Category ID required for category subscription' },
        { status: 400 }
      )
    }

    // Check if subscription exists
    const where: any = { userId }
    if (threadId) where.threadId = threadId
    if (categoryId) where.categoryId = categoryId

    const existing = await prisma.forumSubscription.findFirst({
      where,
    })

    if (existing) {
      // Unsubscribe (toggle off)
      await prisma.forumSubscription.delete({
        where: { id: existing.id },
      })

      return NextResponse.json({ unsubscribed: true })
    }

    // Subscribe
    const subscription = await prisma.forumSubscription.create({
      data: {
        userId,
        threadId,
        categoryId,
        subscriptionType,
      },
    })

    return NextResponse.json({ subscribed: true, subscription })
  } catch (error) {
    console.error('Error managing subscription:', error)
    return NextResponse.json(
      { error: 'Failed to manage subscription' },
      { status: 500 }
    )
  }
}
