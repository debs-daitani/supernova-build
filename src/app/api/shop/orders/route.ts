import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sellerId = searchParams.get('sellerId')
    const buyerId = searchParams.get('buyerId')
    const productId = searchParams.get('productId')
    const status = searchParams.get('status')

    const where: any = {}

    if (sellerId) where.sellerId = sellerId
    if (buyerId) where.buyerId = buyerId
    if (productId) where.productId = productId
    if (status) where.status = status

    const orders = await prisma.order.findMany({
      where,
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
            email: true,
          },
        },
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ orders })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}
