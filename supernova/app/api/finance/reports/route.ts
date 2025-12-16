import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth-middleware'

// GET /api/finance/reports - Get financial reports data
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())
    const month = searchParams.get('month') // optional - if not provided, show yearly

    const userId = auth.userId

    // Build date filters
    let startDate: Date
    let endDate: Date

    if (month) {
      const monthNum = parseInt(month)
      startDate = new Date(year, monthNum - 1, 1)
      endDate = new Date(year, monthNum, 0, 23, 59, 59)
    } else {
      startDate = new Date(year, 0, 1)
      endDate = new Date(year, 11, 31, 23, 59, 59)
    }

    // Get income data
    const income = await prisma.financeIncome.findMany({
      where: {
        userId,
        date: { gte: startDate, lte: endDate },
      },
      orderBy: { date: 'asc' },
    })

    // Get expenses data
    const expenses = await prisma.financeExpense.findMany({
      where: {
        userId,
        date: { gte: startDate, lte: endDate },
      },
      orderBy: { date: 'asc' },
    })

    // Get paid invoices
    const invoices = await prisma.financeInvoice.findMany({
      where: {
        userId,
        status: 'PAID',
        issueDate: { gte: startDate, lte: endDate },
      },
    })

    // Calculate totals
    const totalIncome = income.reduce((sum, i) => sum + i.amount, 0)
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)
    const totalInvoiced = invoices.reduce((sum, i) => sum + i.total, 0)
    const profit = totalIncome - totalExpenses

    // Group income by category
    const incomeByCategory = income.reduce((acc: Record<string, number>, i) => {
      acc[i.category] = (acc[i.category] || 0) + i.amount
      return acc
    }, {})

    // Group expenses by category
    const expensesByCategory = expenses.reduce((acc: Record<string, number>, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount
      return acc
    }, {})

    // Monthly breakdown (for yearly view)
    const monthlyBreakdown: { month: string; income: number; expenses: number; profit: number }[] = []

    if (!month) {
      for (let m = 0; m < 12; m++) {
        const monthStart = new Date(year, m, 1)
        const monthEnd = new Date(year, m + 1, 0, 23, 59, 59)

        const monthIncome = income
          .filter(i => new Date(i.date) >= monthStart && new Date(i.date) <= monthEnd)
          .reduce((sum, i) => sum + i.amount, 0)

        const monthExpenses = expenses
          .filter(e => new Date(e.date) >= monthStart && new Date(e.date) <= monthEnd)
          .reduce((sum, e) => sum + e.amount, 0)

        monthlyBreakdown.push({
          month: monthStart.toLocaleString('default', { month: 'short' }),
          income: monthIncome,
          expenses: monthExpenses,
          profit: monthIncome - monthExpenses,
        })
      }
    }

    // Top income sources
    const topIncomeSources = Object.entries(incomeByCategory)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5)

    // Top expense categories
    const topExpenseCategories = Object.entries(expensesByCategory)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5)

    // Recent transactions for P&L breakdown
    const recentIncome = income.slice(-10).reverse()
    const recentExpenses = expenses.slice(-10).reverse()

    return NextResponse.json({
      period: month ? `${new Date(year, parseInt(month) - 1).toLocaleString('default', { month: 'long' })} ${year}` : `${year}`,
      summary: {
        totalIncome,
        totalExpenses,
        totalInvoiced,
        profit,
        profitMargin: totalIncome > 0 ? ((profit / totalIncome) * 100).toFixed(1) : '0',
      },
      incomeByCategory: topIncomeSources,
      expensesByCategory: topExpenseCategories,
      monthlyBreakdown,
      recentIncome,
      recentExpenses,
      transactionCounts: {
        income: income.length,
        expenses: expenses.length,
        invoices: invoices.length,
      },
    })
  } catch (error) {
    console.error('Error generating reports:', error)
    return NextResponse.json({ error: 'Failed to generate reports' }, { status: 500 })
  }
}
