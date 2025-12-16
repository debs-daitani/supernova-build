'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  TrendingUp,
  TrendingDown,
  PoundSterling,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  Plus
} from 'lucide-react'

interface FinanceStats {
  income: {
    monthly: number
    yearly: number
    byCategory: { category: string; amount: number }[]
  }
  expenses: {
    monthly: number
    yearly: number
    byCategory: { category: string; amount: number }[]
  }
  profit: {
    monthly: number
    yearly: number
  }
  recentTransactions: {
    id: string
    type: 'income' | 'expense'
    amount: number
    description: string
    category: string
    date: string
    contact: { firstName: string; lastName?: string } | null
  }[]
  pendingInvoices: any[]
  pendingInvoiceTotal: number
}

export default function FinanceDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState<FinanceStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/finance/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Failed to fetch finance stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-light-teal font-josefin">Loading finances...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-supernova text-light-teal">Finances</h2>
          <p className="text-sm text-gray-400 font-josefin">Track your money flow</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => router.push('/finance/income')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/20 border border-green-500/30 text-green-400 font-josefin hover:bg-green-500/30 transition-all"
          >
            <Plus size={18} />
            Add Income
          </button>
          <button
            onClick={() => router.push('/finance/expenses')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 font-josefin hover:bg-red-500/30 transition-all"
          >
            <Plus size={18} />
            Add Expense
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Monthly Income */}
        <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-light-teal/20 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 font-josefin text-sm">Monthly Income</span>
            <TrendingUp className="text-green-400" size={20} />
          </div>
          <div className="text-2xl font-supernova text-green-400">
            {formatCurrency(stats?.income.monthly || 0)}
          </div>
          <div className="text-xs text-gray-500 font-josefin mt-1">
            YTD: {formatCurrency(stats?.income.yearly || 0)}
          </div>
        </div>

        {/* Monthly Expenses */}
        <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-light-teal/20 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 font-josefin text-sm">Monthly Expenses</span>
            <TrendingDown className="text-red-400" size={20} />
          </div>
          <div className="text-2xl font-supernova text-red-400">
            {formatCurrency(stats?.expenses.monthly || 0)}
          </div>
          <div className="text-xs text-gray-500 font-josefin mt-1">
            YTD: {formatCurrency(stats?.expenses.yearly || 0)}
          </div>
        </div>

        {/* Net Profit */}
        <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-light-teal/20 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 font-josefin text-sm">Net Profit</span>
            <PoundSterling className={`${(stats?.profit.monthly || 0) >= 0 ? 'text-neon-lime' : 'text-red-400'}`} size={20} />
          </div>
          <div className={`text-2xl font-supernova ${(stats?.profit.monthly || 0) >= 0 ? 'text-neon-lime' : 'text-red-400'}`}>
            {formatCurrency(stats?.profit.monthly || 0)}
          </div>
          <div className="text-xs text-gray-500 font-josefin mt-1">
            YTD: {formatCurrency(stats?.profit.yearly || 0)}
          </div>
        </div>

        {/* Pending Invoices */}
        <div
          className="backdrop-blur-xl bg-white/5 rounded-2xl border border-light-teal/20 p-6 cursor-pointer hover:border-light-teal/40 transition-all"
          onClick={() => router.push('/finance/invoices')}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 font-josefin text-sm">Pending Invoices</span>
            <FileText className="text-hot-pink" size={20} />
          </div>
          <div className="text-2xl font-supernova text-hot-pink">
            {formatCurrency(stats?.pendingInvoiceTotal || 0)}
          </div>
          <div className="text-xs text-gray-500 font-josefin mt-1">
            {stats?.pendingInvoices.length || 0} invoices awaiting payment
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-light-teal/20 p-6">
          <h3 className="text-lg font-supernova text-light-teal mb-4">Recent Transactions</h3>
          <div className="space-y-3">
            {stats?.recentTransactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-3 rounded-lg bg-black/30 hover:bg-black/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${tx.type === 'income' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                    {tx.type === 'income' ? (
                      <ArrowUpRight className="text-green-400" size={16} />
                    ) : (
                      <ArrowDownRight className="text-red-400" size={16} />
                    )}
                  </div>
                  <div>
                    <div className="font-josefin text-white text-sm">{tx.description}</div>
                    <div className="text-xs text-gray-500 font-josefin">
                      {tx.category} • {new Date(tx.date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className={`font-josefin font-semibold ${tx.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                  {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                </div>
              </div>
            ))}
            {(!stats?.recentTransactions || stats.recentTransactions.length === 0) && (
              <div className="text-center py-8 text-gray-500 font-josefin">
                No transactions yet. Start by adding income or expenses.
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions & Pending Invoices */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-light-teal/20 p-6">
            <h3 className="text-lg font-supernova text-light-teal mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => router.push('/finance/invoices/new')}
                className="p-4 rounded-lg bg-hot-pink/10 border border-hot-pink/30 text-hot-pink hover:bg-hot-pink/20 transition-all font-josefin"
              >
                <FileText size={24} className="mx-auto mb-2" />
                Create Invoice
              </button>
              <button
                onClick={() => router.push('/finance/reports')}
                className="p-4 rounded-lg bg-light-teal/10 border border-light-teal/30 text-light-teal hover:bg-light-teal/20 transition-all font-josefin"
              >
                <TrendingUp size={24} className="mx-auto mb-2" />
                View Reports
              </button>
            </div>
          </div>

          {/* Pending Invoices List */}
          <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-light-teal/20 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-supernova text-light-teal">Pending Invoices</h3>
              <button
                onClick={() => router.push('/finance/invoices')}
                className="text-sm text-hot-pink hover:text-hot-pink/80 font-josefin"
              >
                View All
              </button>
            </div>
            <div className="space-y-3">
              {stats?.pendingInvoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-black/30 hover:bg-black/50 transition-colors cursor-pointer"
                  onClick={() => router.push(`/finance/invoices/${invoice.id}`)}
                >
                  <div>
                    <div className="font-josefin text-white text-sm">{invoice.invoiceNumber}</div>
                    <div className="text-xs text-gray-500 font-josefin">
                      {invoice.contact ? `${invoice.contact.firstName} ${invoice.contact.lastName || ''}` : 'No contact'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-josefin font-semibold text-hot-pink">
                      {formatCurrency(invoice.total)}
                    </div>
                    <div className={`text-xs font-josefin ${invoice.status === 'OVERDUE' ? 'text-red-400' : 'text-gray-500'}`}>
                      Due {new Date(invoice.dueDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
              {(!stats?.pendingInvoices || stats.pendingInvoices.length === 0) && (
                <div className="text-center py-4 text-gray-500 font-josefin text-sm">
                  No pending invoices
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Category Breakdowns */}
      {(stats?.income.byCategory.length || stats?.expenses.byCategory.length) ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Income by Category */}
          {stats?.income.byCategory.length ? (
            <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-light-teal/20 p-6">
              <h3 className="text-lg font-supernova text-light-teal mb-4">Income by Category (This Month)</h3>
              <div className="space-y-3">
                {stats.income.byCategory.map((cat) => (
                  <div key={cat.category} className="flex items-center justify-between">
                    <span className="font-josefin text-gray-300">{cat.category}</span>
                    <span className="font-josefin text-green-400">{formatCurrency(cat.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {/* Expenses by Category */}
          {stats?.expenses.byCategory.length ? (
            <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-light-teal/20 p-6">
              <h3 className="text-lg font-supernova text-light-teal mb-4">Expenses by Category (This Month)</h3>
              <div className="space-y-3">
                {stats.expenses.byCategory.map((cat) => (
                  <div key={cat.category} className="flex items-center justify-between">
                    <span className="font-josefin text-gray-300">{cat.category}</span>
                    <span className="font-josefin text-red-400">{formatCurrency(cat.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
