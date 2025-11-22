import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const limit = parseInt(searchParams.get('limit') || '100')

    const where: any = {}

    if (userId) where.userId = userId
    if (startDate && endDate) {
      where.startedAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      }
    }

    const sessions = await prisma.analyticsSession.findMany({
      where,
      orderBy: { startedAt: 'desc' },
      take: limit,
    })

    return NextResponse.json(sessions)
  } catch (error) {
    console.error('Error fetching sessions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      sessionId,
      userId,
      deviceType,
      browser,
      os,
      entryPage,
    } = body

    const session = await prisma.analyticsSession.create({
      data: {
        sessionId,
        userId: userId || undefined,
        startedAt: new Date(),
        deviceType,
        browser,
        os,
        entryPage,
        eventsCount: 0,
        pageViews: 0,
      },
    })

    return NextResponse.json(session)
  } catch (error) {
    console.error('Error creating session:', error)
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    )
  }
}
