import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const userId = 'user_placeholder' // TODO: Get from auth

    const orders = await prisma.order.findMany({
      where: {
        OR: [
          { buyerId: userId },
          { customerEmail: userId }, // For guest purchases
        ],
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            thumbnail: true,
            fileSize: true,
            fileType: true,
          },
        },
        seller: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ orders })
  } catch (error) {
    console.error('Error fetching purchases:', error)
    return NextResponse.json(
      { error: 'Failed to fetch purchases' },
      { status: 500 }
    )
  }
}
