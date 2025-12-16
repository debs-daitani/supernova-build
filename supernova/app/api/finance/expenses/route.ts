import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth-middleware'

// GET /api/finance/expenses - List expense entries
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

    const expenses = await prisma.financeExpense.findMany({
      where,
      orderBy: { date: 'desc' },
    })

    const total = await prisma.financeExpense.aggregate({
      where,
      _sum: { amount: true },
    })

    return NextResponse.json({
      expenses,
      total: total._sum.amount || 0,
    })
  } catch (error) {
    console.error('Error fetching expenses:', error)
    return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 })
  }
}

// POST /api/finance/expenses - Create expense entry
export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const userId = auth.userId

    const body = await request.json()
    const { amount, vendor, category, date, notes, isRecurring, recurringFrequency } = body

    if (!amount || !vendor || !category || !date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const expense = await prisma.financeExpense.create({
      data: {
        userId,
        amount: parseFloat(amount),
        vendor,
        category,
        date: new Date(date),
        notes,
        isRecurring: isRecurring || false,
        recurringFrequency: recurringFrequency || null,
      },
    })

    return NextResponse.json(expense, { status: 201 })
  } catch (error) {
    console.error('Error creating expense:', error)
    return NextResponse.json({ error: 'Failed to create expense' }, { status: 500 })
  }
}

// DELETE /api/finance/expenses - Bulk delete expense entries
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

    const result = await prisma.financeExpense.deleteMany({
      where: { id: { in: ids }, userId },
    })

    return NextResponse.json({ deleted: result.count })
  } catch (error) {
    console.error('Error deleting expenses:', error)
    return NextResponse.json({ error: 'Failed to delete expenses' }, { status: 500 })
  }
}
