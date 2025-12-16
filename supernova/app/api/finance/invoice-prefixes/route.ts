import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth-middleware'

// GET /api/finance/invoice-prefixes - Get all invoice prefixes
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const prefixes = await prisma.invoicePrefix.findMany({
      where: { userId: auth.userId },
      orderBy: { createdAt: 'asc' },
      include: {
        _count: {
          select: { invoices: true }
        }
      }
    })

    return NextResponse.json(prefixes)
  } catch (error) {
    console.error('Error fetching invoice prefixes:', error)
    return NextResponse.json({ error: 'Failed to fetch prefixes' }, { status: 500 })
  }
}

// POST /api/finance/invoice-prefixes - Create new invoice prefix
export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, prefix } = body

    if (!name || !prefix) {
      return NextResponse.json({ error: 'Name and prefix are required' }, { status: 400 })
    }

    // Check if prefix already exists for this user
    const existing = await prisma.invoicePrefix.findUnique({
      where: {
        userId_prefix: {
          userId: auth.userId,
          prefix: prefix.toUpperCase()
        }
      }
    })

    if (existing) {
      return NextResponse.json({ error: 'Prefix already exists' }, { status: 400 })
    }

    const invoicePrefix = await prisma.invoicePrefix.create({
      data: {
        userId: auth.userId,
        name,
        prefix: prefix.toUpperCase(),
        nextNumber: 1
      }
    })

    return NextResponse.json(invoicePrefix, { status: 201 })
  } catch (error) {
    console.error('Error creating invoice prefix:', error)
    return NextResponse.json({ error: 'Failed to create prefix' }, { status: 500 })
  }
}
