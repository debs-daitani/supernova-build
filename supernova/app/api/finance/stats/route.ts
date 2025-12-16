import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth-middleware'

// GET /api/finance/stats - Get finance overview stats
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const userId = auth.userId

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfYear = new Date(now.getFullYear(), 0, 1)

    // Get income totals
    const [monthlyIncome, yearlyIncome, monthlyExpenses, yearlyExpenses] = await Promise.all([
      prisma.financeIncome.aggregate({
        where: { userId, date: { gte: startOfMonth } },
        _sum: { amount: true },
      }),
      prisma.financeIncome.aggregate({
        where: { userId, date: { gte: startOfYear } },
        _sum: { amount: true },
      }),
      prisma.financeExpense.aggregate({
        where: { userId, date: { gte: startOfMonth } },
        _sum: { amount: true },
      }),
      prisma.financeExpense.aggregate({
        where: { userId, date: { gte: startOfYear } },
        _sum: { amount: true },
      }),
    ])

    // Get income by category (this month)
    const incomeByCategory = await prisma.financeIncome.groupBy({
      by: ['category'],
      where: { userId, date: { gte: startOfMonth } },
      _sum: { amount: true },
    })

    // Get expenses by category (this month)
    const expensesByCategory = await prisma.financeExpense.groupBy({
      by: ['category'],
      where: { userId, date: { gte: startOfMonth } },
      _sum: { amount: true },
    })

    // Get recent transactions (last 10)
    const [recentIncome, recentExpenses] = await Promise.all([
      prisma.financeIncome.findMany({
        where: { userId },
        orderBy: { date: 'desc' },
        take: 5,
        include: { contact: { select: { firstName: true, lastName: true } } },
      }),
      prisma.financeExpense.findMany({
        where: { userId },
        orderBy: { date: 'desc' },
        take: 5,
      }),
    ])

    // Get pending invoices
    const pendingInvoices = await prisma.financeInvoice.findMany({
      where: { userId, status: { in: ['SENT', 'OVERDUE'] } },
      orderBy: { dueDate: 'asc' },
      take: 5,
      include: { contact: { select: { firstName: true, lastName: true, company: true } } },
    })

    const pendingInvoiceTotal = await prisma.financeInvoice.aggregate({
      where: { userId, status: { in: ['SENT', 'OVERDUE'] } },
      _sum: { total: true },
    })

    return NextResponse.json({
      income: {
        monthly: monthlyIncome._sum.amount || 0,
        yearly: yearlyIncome._sum.amount || 0,
        byCategory: incomeByCategory.map(c => ({
          category: c.category,
          amount: c._sum.amount || 0,
        })),
      },
      expenses: {
        monthly: monthlyExpenses._sum.amount || 0,
        yearly: yearlyExpenses._sum.amount || 0,
        byCategory: expensesByCategory.map(c => ({
          category: c.category,
          amount: c._sum.amount || 0,
        })),
      },
      profit: {
        monthly: (monthlyIncome._sum.amount || 0) - (monthlyExpenses._sum.amount || 0),
        yearly: (yearlyIncome._sum.amount || 0) - (yearlyExpenses._sum.amount || 0),
      },
      recentTransactions: [
        ...recentIncome.map(i => ({
          id: i.id,
          type: 'income' as const,
          amount: i.amount,
          description: i.source,
          category: i.category,
          date: i.date,
          contact: i.contact,
        })),
        ...recentExpenses.map(e => ({
          id: e.id,
          type: 'expense' as const,
          amount: e.amount,
          description: e.vendor,
          category: e.category,
          date: e.date,
          contact: null,
        })),
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10),
      pendingInvoices,
      pendingInvoiceTotal: pendingInvoiceTotal._sum.total || 0,
    })
  } catch (error) {
    console.error('Error fetching finance stats:', error)
    return NextResponse.json({ error: 'Failed to fetch finance stats' }, { status: 500 })
  }
}
