import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth-middleware'

type RouteContext = {
  params: Promise<{ id: string }>
}

// GET /api/finance/invoice-prefixes/[id] - Get single prefix
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params

    const prefix = await prisma.invoicePrefix.findFirst({
      where: {
        id,
        userId: auth.userId
      },
      include: {
        _count: {
          select: { invoices: true }
        }
      }
    })

    if (!prefix) {
      return NextResponse.json({ error: 'Prefix not found' }, { status: 404 })
    }

    return NextResponse.json(prefix)
  } catch (error) {
    console.error('Error fetching invoice prefix:', error)
    return NextResponse.json({ error: 'Failed to fetch prefix' }, { status: 500 })
  }
}

// PATCH /api/finance/invoice-prefixes/[id] - Update prefix
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params
    const body = await request.json()

    // Check ownership
    const existing = await prisma.invoicePrefix.findFirst({
      where: { id, userId: auth.userId }
    })

    if (!existing) {
      return NextResponse.json({ error: 'Prefix not found' }, { status: 404 })
    }

    // If changing prefix, check for duplicates
    if (body.prefix && body.prefix.toUpperCase() !== existing.prefix) {
      const duplicate = await prisma.invoicePrefix.findUnique({
        where: {
          userId_prefix: {
            userId: auth.userId,
            prefix: body.prefix.toUpperCase()
          }
        }
      })

      if (duplicate) {
        return NextResponse.json({ error: 'Prefix already exists' }, { status: 400 })
      }
    }

    const prefix = await prisma.invoicePrefix.update({
      where: { id },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.prefix && { prefix: body.prefix.toUpperCase() }),
        ...(body.nextNumber && { nextNumber: body.nextNumber })
      }
    })

    return NextResponse.json(prefix)
  } catch (error) {
    console.error('Error updating invoice prefix:', error)
    return NextResponse.json({ error: 'Failed to update prefix' }, { status: 500 })
  }
}

// DELETE /api/finance/invoice-prefixes/[id] - Delete prefix
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params

    // Check ownership and if invoices exist
    const existing = await prisma.invoicePrefix.findFirst({
      where: { id, userId: auth.userId },
      include: {
        _count: {
          select: { invoices: true }
        }
      }
    })

    if (!existing) {
      return NextResponse.json({ error: 'Prefix not found' }, { status: 404 })
    }

    if (existing._count.invoices > 0) {
      return NextResponse.json(
        { error: 'Cannot delete prefix with existing invoices' },
        { status: 400 }
      )
    }

    await prisma.invoicePrefix.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting invoice prefix:', error)
    return NextResponse.json({ error: 'Failed to delete prefix' }, { status: 500 })
  }
}
