import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth-middleware'

// GET /api/finance/income - List income entries
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const userId = auth.userId

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const where: any = { userId }

    if (category && category !== 'ALL') {
      where.category = category
    }

    if (startDate) {
      where.date = { ...where.date, gte: new Date(startDate) }
    }

    if (endDate) {
      where.date = { ...where.date, lte: new Date(endDate) }
    }

    const income = await prisma.financeIncome.findMany({
      where,
      orderBy: { date: 'desc' },
      include: {
        contact: { select: { id: true, firstName: true, lastName: true, company: true } },
      },
    })

    const total = await prisma.financeIncome.aggregate({
      where,
      _sum: { amount: true },
    })

    return NextResponse.json({
      income,
      total: total._sum.amount || 0,
    })
  } catch (error) {
    console.error('Error fetching income:', error)
    return NextResponse.json({ error: 'Failed to fetch income' }, { status: 500 })
  }
}

// POST /api/finance/income - Create income entry
export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const userId = auth.userId

    const body = await request.json()
    const { amount, source, category, date, notes, contactId, isRecurring, recurringFrequency } = body

    if (!amount || !source || !category || !date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const income = await prisma.financeIncome.create({
      data: {
        userId,
        amount: parseFloat(amount),
        source,
        category,
        date: new Date(date),
        notes,
        contactId: contactId || null,
        isRecurring: isRecurring || false,
        recurringFrequency: recurringFrequency || null,
      },
      include: {
        contact: { select: { id: true, firstName: true, lastName: true, company: true } },
      },
    })

    return NextResponse.json(income, { status: 201 })
  } catch (error) {
    console.error('Error creating income:', error)
    return NextResponse.json({ error: 'Failed to create income' }, { status: 500 })
  }
}

// DELETE /api/finance/income - Bulk delete income entries
export async function DELETE(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const userId = auth.userId

    const body = await request.json()
    const { ids } = body

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'No IDs provided' }, { status: 400 })
    }

    const result = await prisma.financeIncome.deleteMany({
      where: { id: { in: ids }, userId },
    })

    return NextResponse.json({ deleted: result.count })
  } catch (error) {
    console.error('Error deleting income:', error)
    return NextResponse.json({ error: 'Failed to delete income' }, { status: 500 })
  }
}
