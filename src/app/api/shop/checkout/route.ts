import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { calculatePlatformFee, generateDownloadUrl } from '@/lib/shop-utils'

export async function POST(request: NextRequest) {
  try {
    const userId = 'user_placeholder' // TODO: Get from auth
    const body = await request.json()
    const { cartItems, customerEmail, customerName, paymentIntentId } = body

    // Create orders for each item
    const orders = []

    for (const item of cartItems) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        select: {
          id: true,
          userId: true,
          name: true,
          price: true,
          downloadUrl: true,
        },
      })

      if (!product) continue

      const totalAmount = item.price * item.quantity

      // Generate download URL for digital products
      let downloadUrl = null
      let downloadExpiresAt = null

      if (product.downloadUrl) {
        // In production, generate signed URL
        downloadUrl = product.downloadUrl
        downloadExpiresAt = new Date()
        downloadExpiresAt.setHours(downloadExpiresAt.getHours() + 24)
      }

      const order = await prisma.order.create({
        data: {
          buyerId: userId || null,
          sellerId: product.userId,
          productId: product.id,
          variantId: item.variantId,
          quantity: item.quantity,
          unitPrice: item.price,
          totalAmount,
          currency: 'GBP',
          status: 'PAID',
          paymentIntentId,
          customerEmail,
          customerName,
          downloadUrl,
          downloadExpiresAt,
          paidAt: new Date(),
        },
        include: {
          product: {
            select: {
              name: true,
              thumbnail: true,
            },
          },
        },
      })

      // Update product stats
      await prisma.product.update({
        where: { id: product.id },
        data: {
          salesCount: { increment: item.quantity },
          revenue: { increment: totalAmount },
        },
      })

      orders.push(order)
    }

    // Clear cart
    await prisma.cart.deleteMany({
      where: { userId },
    })

    return NextResponse.json({ orders })
  } catch (error) {
    console.error('Error processing checkout:', error)
    return NextResponse.json(
      { error: 'Failed to process checkout' },
      { status: 500 }
    )
  }
}
