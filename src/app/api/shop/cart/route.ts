import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { calculateCartTotal } from '@/lib/shop-utils'

export async function GET(request: NextRequest) {
  try {
    const userId = 'user_placeholder' // TODO: Get from auth or session

    const cart = await prisma.cart.findFirst({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    if (!cart) {
      return NextResponse.json({
        items: [],
        totalAmount: 0,
      })
    }

    return NextResponse.json(cart)
  } catch (error) {
    console.error('Error fetching cart:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cart' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = 'user_placeholder' // TODO: Get from auth
    const body = await request.json()
    const { productId, variantId, quantity = 1 } = body

    // Get product details
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, name: true, price: true, thumbnail: true },
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Get or create cart
    let cart = await prisma.cart.findFirst({
      where: { userId },
    })

    const items = cart ? (cart.items as any[]) : []
    const newItem = {
      productId,
      variantId,
      quantity,
      price: product.price,
      name: product.name,
      thumbnail: product.thumbnail,
    }

    // Check if item already in cart
    const existingIndex = items.findIndex(
      (item: any) =>
        item.productId === productId && item.variantId === variantId
    )

    if (existingIndex >= 0) {
      items[existingIndex].quantity += quantity
    } else {
      items.push(newItem)
    }

    const totalAmount = calculateCartTotal(items)

    if (cart) {
      cart = await prisma.cart.update({
        where: { id: cart.id },
        data: { items, totalAmount },
      })
    } else {
      cart = await prisma.cart.create({
        data: {
          userId,
          items,
          totalAmount,
        },
      })
    }

    return NextResponse.json(cart)
  } catch (error) {
    console.error('Error adding to cart:', error)
    return NextResponse.json(
      { error: 'Failed to add to cart' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = 'user_placeholder' // TODO: Get from auth

    await prisma.cart.deleteMany({
      where: { userId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error clearing cart:', error)
    return NextResponse.json(
      { error: 'Failed to clear cart' },
      { status: 500 }
    )
  }
}
