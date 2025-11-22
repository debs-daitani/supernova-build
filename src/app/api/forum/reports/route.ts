import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'PENDING'

    const reports = await prisma.forumReport.findMany({
      where: { status },
      orderBy: { createdAt: 'desc' },
      include: {
        post: {
          include: {
            thread: {
              select: {
                id: true,
                title: true,
                slug: true,
              },
            },
            user: {
              select: {
                id: true,
                name: true,
                username: true,
              },
            },
          },
        },
        reportedBy: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
      },
    })

    return NextResponse.json(reports)
  } catch (error) {
    console.error('Error fetching reports:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reports' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = 'user_placeholder' // TODO: Get from auth
    const body = await request.json()
    const { postId, reason, details } = body

    const validReasons = ['SPAM', 'INAPPROPRIATE', 'OFF_TOPIC', 'HARASSMENT']
    if (!validReasons.includes(reason)) {
      return NextResponse.json(
        { error: 'Invalid report reason' },
        { status: 400 }
      )
    }

    const report = await prisma.forumReport.create({
      data: {
        postId,
        reportedByUserId: userId,
        reason,
        details,
        status: 'PENDING',
      },
    })

    return NextResponse.json(report, { status: 201 })
  } catch (error) {
    console.error('Error creating report:', error)
    return NextResponse.json(
      { error: 'Failed to create report' },
      { status: 500 }
    )
  }
}
