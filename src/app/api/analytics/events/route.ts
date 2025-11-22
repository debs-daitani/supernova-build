import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { AnalyticsPrivacy } from '@/lib/analytics-tracking'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      userId,
      eventType,
      eventCategory,
      eventData,
      sessionId,
      deviceType,
      browser,
      os,
      referrer,
      utmSource,
      utmMedium,
      utmCampaign,
    } = body

    // Check if tracking is allowed
    if (!AnalyticsPrivacy.isTrackingAllowed(userId)) {
      return NextResponse.json({ tracked: false }, { status: 200 })
    }

    // Get IP address and anonymize it for GDPR compliance
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || ''
    const ipAddress = AnalyticsPrivacy.anonymizeIP(ip)

    // TODO: Get geo-location from IP (using a service like MaxMind or ipapi)
    const country = undefined
    const city = undefined

    // Create analytics event
    const event = await prisma.analyticsEvent.create({
      data: {
        userId: userId || undefined,
        eventType,
        eventCategory,
        eventData: eventData || {},
        sessionId,
        deviceType,
        browser,
        os,
        ipAddress,
        country,
        city,
        referrer,
        utmSource,
        utmMedium,
        utmCampaign,
      },
    })

    // Update or create session
    const existingSession = await prisma.analyticsSession.findUnique({
      where: { sessionId },
    })

    if (existingSession) {
      // Update session
      await prisma.analyticsSession.update({
        where: { sessionId },
        data: {
          endedAt: new Date(),
          eventsCount: { increment: 1 },
          pageViews:
            eventCategory === 'PAGE_VIEW'
              ? { increment: 1 }
              : existingSession.pageViews,
          exitPage:
            eventCategory === 'PAGE_VIEW'
              ? (eventData?.page as string) || undefined
              : existingSession.exitPage,
        },
      })

      // Calculate duration if session ended
      if (eventType === 'session_end') {
        const duration = Math.floor(
          (new Date().getTime() - new Date(existingSession.startedAt).getTime()) / 1000
        )
        await prisma.analyticsSession.update({
          where: { sessionId },
          data: { duration },
        })
      }
    } else {
      // Create new session
      await prisma.analyticsSession.create({
        data: {
          userId: userId || undefined,
          sessionId,
          startedAt: new Date(),
          deviceType,
          browser,
          os,
          entryPage:
            eventCategory === 'PAGE_VIEW'
              ? (eventData?.page as string) || undefined
              : undefined,
          eventsCount: 1,
          pageViews: eventCategory === 'PAGE_VIEW' ? 1 : 0,
        },
      })
    }

    // Update user activity if userId present
    if (userId) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const activity = await prisma.userActivity.findUnique({
        where: {
          userId_date: {
            userId,
            date: today,
          },
        },
      })

      if (activity) {
        const featuresUsed = new Set(activity.featuresUsed)
        if (eventCategory === 'FEATURE_USE') {
          featuresUsed.add(eventType)
        }

        await prisma.userActivity.update({
          where: {
            userId_date: {
              userId,
              date: today,
            },
          },
          data: {
            actionsCount: { increment: 1 },
            featuresUsed: Array.from(featuresUsed),
          },
        })
      } else {
        await prisma.userActivity.create({
          data: {
            userId,
            date: today,
            loginCount: eventType === 'session_start' ? 1 : 0,
            featuresUsed: eventCategory === 'FEATURE_USE' ? [eventType] : [],
            actionsCount: 1,
            timeSpent: 0,
          },
        })
      }
    }

    return NextResponse.json({ tracked: true, eventId: event.id })
  } catch (error) {
    console.error('Error tracking event:', error)
    return NextResponse.json(
      { error: 'Failed to track event' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const eventCategory = searchParams.get('eventCategory')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const limit = parseInt(searchParams.get('limit') || '100')

    const where: any = {}

    if (userId) where.userId = userId
    if (eventCategory) where.eventCategory = eventCategory
    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      }
    }

    const events = await prisma.analyticsEvent.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    return NextResponse.json(events)
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    )
  }
}
