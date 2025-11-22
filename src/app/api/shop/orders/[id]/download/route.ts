import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Increment download count
    const order = await prisma.order.update({
      where: { id },
      data: {
        downloadCount: { increment: 1 },
      },
    })

    // Check if download limit exceeded
    if (order.downloadCount > order.maxDownloads) {
      return NextResponse.json(
        { error: 'Download limit exceeded' },
        { status: 403 }
      )
    }

    // Check if download has expired
    if (order.downloadExpiresAt && new Date(order.downloadExpiresAt) < new Date()) {
      return NextResponse.json(
        { error: 'Download link has expired' },
        { status: 403 }
      )
    }

    return NextResponse.json({ success: true, downloadCount: order.downloadCount })
  } catch (error) {
    console.error('Error tracking download:', error)
    return NextResponse.json(
      { error: 'Failed to track download' },
      { status: 500 }
    )
  }
}
