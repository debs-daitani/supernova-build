'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, Percent, Download } from 'lucide-react'

interface ReportData {
  period: string
  summary: {
    totalIncome: number
    totalExpenses: number
    totalInvoiced: number
    profit: number
    profitMargin: string
  }
  incomeByCategory: { category: string; amount: number }[]
  expensesByCategory: { category: string; amount: number }[]
  monthlyBreakdown: { month: string; income: number; expenses: number; profit: number }[]
  transactionCounts: {
    income: number
    expenses: number
    invoices: number
  }
}

export default function ReportsPage() {
  const router = useRouter()
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [year, setYear] = useState(new Date().getFullYear())
  const [month, setMonth] = useState<string>('')

  useEffect(() => {
    fetchReportData()
  }, [year, month])

  const fetchReportData = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ year: year.toString() })
      if (month) params.append('month', month)

      const response = await fetch(`/api/finance/reports?${params}`)
      if (response.ok) {
        const data = await response.json()
        setReportData(data)
      }
    } catch (error) {
      console.error('Failed to fetch report data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(amount)
  }

  const maxMonthlyValue = reportData?.monthlyBreakdown.length
    ? Math.max(...reportData.monthlyBreakdown.flatMap(m => [m.income, m.expenses]))
    : 0

  const getBarHeight = (value: number) => {
    if (maxMonthlyValue === 0) return 0
    return (value / maxMonthlyValue) * 100
  }

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i)
  const months = [
    { value: '', label: 'Full Year' },
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-light-teal font-josefin">Loading reports...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/finance')}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="text-light-teal" size={24} />
          </button>
          <div>
            <h2 className="text-2xl font-supernova text-light-teal">Financial Reports</h2>
            <p className="text-sm text-gray-400 font-josefin">
              {reportData?.period || 'Loading...'}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-light-teal/20 p-4">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-xs font-josefin text-gray-400 mb-1">Year</label>
            <select
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              className="px-4 py-2 rounded-lg bg-black/50 border border-light-teal/20 text-white font-josefin focus:outline-none focus:border-light-teal"
            >
              {years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-josefin text-gray-400 mb-1">Period</label>
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="px-4 py-2 rounded-lg bg-black/50 border border-light-teal/20 text-white font-josefin focus:outline-none focus:border-light-teal"
            >
              {months.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-green-500/20 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 font-josefin text-sm">Total Income</span>
            <TrendingUp className="text-green-400" size={20} />
          </div>
          <div className="text-2xl font-supernova text-green-400">
            {formatCurrency(reportData?.summary.totalIncome || 0)}
          </div>
          <div className="text-xs text-gray-500 font-josefin mt-1">
            {reportData?.transactionCounts.income || 0} transactions
          </div>
        </div>

        <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-red-500/20 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 font-josefin text-sm">Total Expenses</span>
            <TrendingDown className="text-red-400" size={20} />
          </div>
          <div className="text-2xl font-supernova text-red-400">
            {formatCurrency(reportData?.summary.totalExpenses || 0)}
          </div>
          <div className="text-xs text-gray-500 font-josefin mt-1">
            {reportData?.transactionCounts.expenses || 0} transactions
          </div>
        </div>

        <div className={`backdrop-blur-xl bg-white/5 rounded-2xl border p-6 ${(reportData?.summary.profit || 0) >= 0 ? 'border-neon-lime/20' : 'border-red-500/20'}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 font-josefin text-sm">Net Profit</span>
            <DollarSign className={`${(reportData?.summary.profit || 0) >= 0 ? 'text-neon-lime' : 'text-red-400'}`} size={20} />
          </div>
          <div className={`text-2xl font-supernova ${(reportData?.summary.profit || 0) >= 0 ? 'text-neon-lime' : 'text-red-400'}`}>
            {formatCurrency(reportData?.summary.profit || 0)}
          </div>
          <div className="text-xs text-gray-500 font-josefin mt-1">
            Income - Expenses
          </div>
        </div>

        <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-light-teal/20 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 font-josefin text-sm">Profit Margin</span>
            <Percent className="text-light-teal" size={20} />
          </div>
          <div className="text-2xl font-supernova text-light-teal">
            {reportData?.summary.profitMargin || 0}%
          </div>
          <div className="text-xs text-gray-500 font-josefin mt-1">
            {reportData?.transactionCounts.invoices || 0} paid invoices
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Chart (only for full year view) */}
        {!month && reportData?.monthlyBreakdown && (
          <div className="lg:col-span-2 backdrop-blur-xl bg-white/5 rounded-2xl border border-light-teal/20 p-6">
            <h3 className="text-lg font-supernova text-light-teal mb-6">Monthly Overview</h3>
            <div className="h-64 flex items-end justify-between gap-2">
              {reportData.monthlyBreakdown.map((m, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex gap-1 h-48 items-end">
                    {/* Income bar */}
                    <div
                      className="flex-1 bg-green-500/50 rounded-t transition-all hover:bg-green-500/70"
                      style={{ height: `${getBarHeight(m.income)}%` }}
                      title={`Income: ${formatCurrency(m.income)}`}
                    />
                    {/* Expense bar */}
                    <div
                      className="flex-1 bg-red-500/50 rounded-t transition-all hover:bg-red-500/70"
                      style={{ height: `${getBarHeight(m.expenses)}%` }}
                      title={`Expenses: ${formatCurrency(m.expenses)}`}
                    />
                  </div>
                  <span className="text-xs font-josefin text-gray-400">{m.month}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-green-500/50" />
                <span className="text-xs font-josefin text-gray-400">Income</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-red-500/50" />
                <span className="text-xs font-josefin text-gray-400">Expenses</span>
              </div>
            </div>
          </div>
        )}

        {/* Income by Category */}
        <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-light-teal/20 p-6">
          <h3 className="text-lg font-supernova text-light-teal mb-4">Income by Category</h3>
          {reportData?.incomeByCategory.length ? (
            <div className="space-y-4">
              {reportData.incomeByCategory.map((cat, i) => {
                const maxIncome = Math.max(...reportData.incomeByCategory.map(c => c.amount))
                const percentage = maxIncome > 0 ? (cat.amount / maxIncome) * 100 : 0
                return (
                  <div key={i}>
                    <div className="flex justify-between mb-1">
                      <span className="font-josefin text-gray-300 text-sm">{cat.category}</span>
                      <span className="font-josefin text-green-400 text-sm">{formatCurrency(cat.amount)}</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-gray-500 font-josefin text-sm text-center py-8">No income recorded for this period</p>
          )}
        </div>

        {/* Expenses by Category */}
        <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-light-teal/20 p-6">
          <h3 className="text-lg font-supernova text-light-teal mb-4">Expenses by Category</h3>
          {reportData?.expensesByCategory.length ? (
            <div className="space-y-4">
              {reportData.expensesByCategory.map((cat, i) => {
                const maxExpense = Math.max(...reportData.expensesByCategory.map(c => c.amount))
                const percentage = maxExpense > 0 ? (cat.amount / maxExpense) * 100 : 0
                return (
                  <div key={i}>
                    <div className="flex justify-between mb-1">
                      <span className="font-josefin text-gray-300 text-sm">{cat.category}</span>
                      <span className="font-josefin text-red-400 text-sm">{formatCurrency(cat.amount)}</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-gray-500 font-josefin text-sm text-center py-8">No expenses recorded for this period</p>
          )}
        </div>

        {/* Profit/Loss Statement */}
        <div className="lg:col-span-2 backdrop-blur-xl bg-white/5 rounded-2xl border border-light-teal/20 p-6">
          <h3 className="text-lg font-supernova text-light-teal mb-4">Profit & Loss Summary</h3>
          <div className="space-y-4">
            {/* Income Section */}
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="flex justify-between items-center">
                <span className="font-supernova text-green-400">Total Income</span>
                <span className="font-josefin text-green-400 text-xl">{formatCurrency(reportData?.summary.totalIncome || 0)}</span>
              </div>
              <div className="mt-2 text-xs text-gray-400 font-josefin">
                {reportData?.incomeByCategory.map(c => c.category).join(', ') || 'No categories'}
              </div>
            </div>

            {/* Expenses Section */}
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
              <div className="flex justify-between items-center">
                <span className="font-supernova text-red-400">Total Expenses</span>
                <span className="font-josefin text-red-400 text-xl">-{formatCurrency(reportData?.summary.totalExpenses || 0)}</span>
              </div>
              <div className="mt-2 text-xs text-gray-400 font-josefin">
                {reportData?.expensesByCategory.map(c => c.category).join(', ') || 'No categories'}
              </div>
            </div>

            {/* Net Profit */}
            <div className={`p-4 rounded-lg ${(reportData?.summary.profit || 0) >= 0 ? 'bg-neon-lime/10 border border-neon-lime/20' : 'bg-red-500/10 border border-red-500/20'}`}>
              <div className="flex justify-between items-center">
                <span className={`font-supernova ${(reportData?.summary.profit || 0) >= 0 ? 'text-neon-lime' : 'text-red-400'}`}>
                  Net {(reportData?.summary.profit || 0) >= 0 ? 'Profit' : 'Loss'}
                </span>
                <span className={`font-supernova text-2xl ${(reportData?.summary.profit || 0) >= 0 ? 'text-neon-lime' : 'text-red-400'}`}>
                  {formatCurrency(reportData?.summary.profit || 0)}
                </span>
              </div>
              <div className="mt-2 text-xs text-gray-400 font-josefin">
                Profit margin: {reportData?.summary.profitMargin || 0}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
