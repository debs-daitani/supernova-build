import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { addSubscriber, canAddSubscribers } from '@/lib/email-marketing'

/**
 * GET /api/email/subscribers
 * List all subscribers for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const tags = searchParams.get('tags')?.split(',').filter(Boolean)

    const where: any = { userId: session.user.id }

    if (status) {
      where.status = status
    }

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (tags && tags.length > 0) {
      where.tags = { hasSome: tags }
    }

    const subscribers = await prisma.emailSubscriber.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    // Get quota info
    const quota = await canAddSubscribers(session.user.id, 0)

    return NextResponse.json({
      subscribers,
      quota: {
        current: quota.current,
        limit: quota.limit,
      },
    })
  } catch (error) {
    console.error('Error fetching subscribers:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/email/subscribers
 * Add a new subscriber
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { email, firstName, lastName, tags } = body

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const subscriber = await addSubscriber(session.user.id, {
      email,
      firstName,
      lastName,
      tags,
      source: 'MANUAL',
    })

    return NextResponse.json(subscriber, { status: 201 })
  } catch (error) {
    console.error('Error adding subscriber:', error)
    const message = (error as Error).message || 'Internal server error'
    const status = message.includes('limit') || message.includes('exists') ? 400 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
