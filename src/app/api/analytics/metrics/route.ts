import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import type { MetricType } from '@/lib/analytics-tracking'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const metricType = searchParams.get('metricType') as MetricType | null
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const period = searchParams.get('period') || 'day' // day, week, month

    const where: any = {}

    if (metricType) where.metricType = metricType
    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      }
    }

    const metrics = await prisma.analyticsMetric.findMany({
      where,
      orderBy: { date: 'desc' },
    })

    return NextResponse.json(metrics)
  } catch (error) {
    console.error('Error fetching metrics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { date, metricType, metricValue, metadata } = body

    // Upsert metric (update if exists, create if not)
    const metric = await prisma.analyticsMetric.upsert({
      where: {
        date_metricType: {
          date: new Date(date),
          metricType,
        },
      },
      update: {
        metricValue,
        metadata: metadata || {},
      },
      create: {
        date: new Date(date),
        metricType,
        metricValue,
        metadata: metadata || {},
      },
    })

    return NextResponse.json(metric)
  } catch (error) {
    console.error('Error creating/updating metric:', error)
    return NextResponse.json(
      { error: 'Failed to save metric' },
      { status: 500 }
    )
  }
}

// Calculate and aggregate metrics
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0]
    const targetDate = new Date(date)
    targetDate.setHours(0, 0, 0, 0)

    const nextDay = new Date(targetDate)
    nextDay.setDate(nextDay.getDate() + 1)

    // Calculate DAU (Daily Active Users)
    const dauCount = await prisma.analyticsSession.count({
      where: {
        startedAt: {
          gte: targetDate,
          lt: nextDay,
        },
        userId: { not: null },
      },
      distinct: ['userId'],
    })

    await prisma.analyticsMetric.upsert({
      where: {
        date_metricType: {
          date: targetDate,
          metricType: 'dau',
        },
      },
      update: { metricValue: dauCount },
      create: {
        date: targetDate,
        metricType: 'dau',
        metricValue: dauCount,
      },
    })

    // Calculate WAU (Weekly Active Users - last 7 days)
    const sevenDaysAgo = new Date(targetDate)
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const wauCount = await prisma.analyticsSession.count({
      where: {
        startedAt: {
          gte: sevenDaysAgo,
          lt: nextDay,
        },
        userId: { not: null },
      },
      distinct: ['userId'],
    })

    await prisma.analyticsMetric.upsert({
      where: {
        date_metricType: {
          date: targetDate,
          metricType: 'wau',
        },
      },
      update: { metricValue: wauCount },
      create: {
        date: targetDate,
        metricType: 'wau',
        metricValue: wauCount,
      },
    })

    // Calculate MAU (Monthly Active Users - last 30 days)
    const thirtyDaysAgo = new Date(targetDate)
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const mauCount = await prisma.analyticsSession.count({
      where: {
        startedAt: {
          gte: thirtyDaysAgo,
          lt: nextDay,
        },
        userId: { not: null },
      },
      distinct: ['userId'],
    })

    await prisma.analyticsMetric.upsert({
      where: {
        date_metricType: {
          date: targetDate,
          metricType: 'mau',
        },
      },
      update: { metricValue: mauCount },
      create: {
        date: targetDate,
        metricType: 'mau',
        metricValue: mauCount,
      },
    })

    // Calculate new users (signups)
    const newUsersCount = await prisma.analyticsEvent.count({
      where: {
        eventType: 'signup',
        createdAt: {
          gte: targetDate,
          lt: nextDay,
        },
      },
    })

    await prisma.analyticsMetric.upsert({
      where: {
        date_metricType: {
          date: targetDate,
          metricType: 'new_users',
        },
      },
      update: { metricValue: newUsersCount },
      create: {
        date: targetDate,
        metricType: 'new_users',
        metricValue: newUsersCount,
      },
    })

    // Calculate daily revenue
    const revenueEvents = await prisma.analyticsEvent.findMany({
      where: {
        eventType: 'payment_success',
        createdAt: {
          gte: targetDate,
          lt: nextDay,
        },
      },
    })

    const dailyRevenue = revenueEvents.reduce((sum, event) => {
      return sum + ((event.eventData as any)?.amount || 0)
    }, 0)

    await prisma.analyticsMetric.upsert({
      where: {
        date_metricType: {
          date: targetDate,
          metricType: 'revenue',
        },
      },
      update: { metricValue: dailyRevenue },
      create: {
        date: targetDate,
        metricType: 'revenue',
        metricValue: dailyRevenue,
      },
    })

    // Calculate average session duration
    const sessions = await prisma.analyticsSession.findMany({
      where: {
        startedAt: {
          gte: targetDate,
          lt: nextDay,
        },
        duration: { not: null },
      },
      select: { duration: true },
    })

    const avgDuration =
      sessions.length > 0
        ? sessions.reduce((sum, s) => sum + (s.duration || 0), 0) / sessions.length
        : 0

    await prisma.analyticsMetric.upsert({
      where: {
        date_metricType: {
          date: targetDate,
          metricType: 'avg_session_duration',
        },
      },
      update: { metricValue: avgDuration },
      create: {
        date: targetDate,
        metricType: 'avg_session_duration',
        metricValue: avgDuration,
      },
    })

    // Calculate page views
    const pageViewCount = await prisma.analyticsEvent.count({
      where: {
        eventCategory: 'PAGE_VIEW',
        createdAt: {
          gte: targetDate,
          lt: nextDay,
        },
      },
    })

    await prisma.analyticsMetric.upsert({
      where: {
        date_metricType: {
          date: targetDate,
          metricType: 'page_views',
        },
      },
      update: { metricValue: pageViewCount },
      create: {
        date: targetDate,
        metricType: 'page_views',
        metricValue: pageViewCount,
      },
    })

    // Calculate conversion rate (signups / unique visitors)
    const uniqueVisitors = await prisma.analyticsSession.count({
      where: {
        startedAt: {
          gte: targetDate,
          lt: nextDay,
        },
      },
      distinct: ['sessionId'],
    })

    const conversionRate = uniqueVisitors > 0 ? newUsersCount / uniqueVisitors : 0

    await prisma.analyticsMetric.upsert({
      where: {
        date_metricType: {
          date: targetDate,
          metricType: 'conversion_rate',
        },
      },
      update: { metricValue: conversionRate },
      create: {
        date: targetDate,
        metricType: 'conversion_rate',
        metricValue: conversionRate,
      },
    })

    return NextResponse.json({
      success: true,
      date: targetDate,
      metrics: {
        dau: dauCount,
        wau: wauCount,
        mau: mauCount,
        new_users: newUsersCount,
        revenue: dailyRevenue,
        avg_session_duration: avgDuration,
        page_views: pageViewCount,
        conversion_rate: conversionRate,
      },
    })
  } catch (error) {
    console.error('Error calculating metrics:', error)
    return NextResponse.json(
      { error: 'Failed to calculate metrics' },
      { status: 500 }
    )
  }
}
