'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'

const EXPENSE_CATEGORIES = [
  'Software/Subscriptions',
  'Marketing',
  'Equipment',
  'Travel',
  'Professional Services',
  'Office Supplies',
  'Training/Education',
  'Banking/Fees',
  'Insurance',
  'Utilities',
  'Other'
]

interface Expense {
  id: string
  amount: number
  vendor: string
  category: string
  date: string
  notes?: string
  isRecurring: boolean
  recurringFrequency?: string
}

export default function ExpensesPage() {
  const router = useRouter()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [deleting, setDeleting] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState('ALL')
  const [total, setTotal] = useState(0)

  const [formData, setFormData] = useState({
    amount: '',
    vendor: '',
    category: 'Software/Subscriptions',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    isRecurring: false,
    recurringFrequency: '',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchExpenses()
  }, [categoryFilter])

  const fetchExpenses = async () => {
    try {
      const params = new URLSearchParams({ category: categoryFilter })
      const response = await fetch(`/api/finance/expenses?${params}`)
      if (response.ok) {
        const data = await response.json()
        setExpenses(data.expenses)
        setTotal(data.total)
      }
    } catch (error) {
      console.error('Failed to fetch expenses:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch('/api/finance/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setShowModal(false)
        setFormData({
          amount: '',
          vendor: '',
          category: 'Software/Subscriptions',
          date: new Date().toISOString().split('T')[0],
          notes: '',
          isRecurring: false,
          recurringFrequency: '',
        })
        fetchExpenses()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to create expense entry')
      }
    } catch (error) {
      alert('Failed to create expense entry')
    } finally {
      setSaving(false)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedItems.size === 0) return

    const confirmed = confirm(`Delete ${selectedItems.size} expense entries? This cannot be undone.`)
    if (!confirmed) return

    setDeleting(true)
    try {
      const response = await fetch('/api/finance/expenses', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selectedItems) }),
      })

      if (response.ok) {
        setSelectedItems(new Set())
        fetchExpenses()
      }
    } catch (error) {
      alert('Failed to delete entries')
    } finally {
      setDeleting(false)
    }
  }

  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const newSelected = new Set(selectedItems)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedItems(newSelected)
  }

  const toggleSelectAll = () => {
    if (selectedItems.size === expenses.length) {
      setSelectedItems(new Set())
    } else {
      setSelectedItems(new Set(expenses.map(e => e.id)))
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(amount)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-light-teal font-josefin">Loading expenses...</div>
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
            <h2 className="text-2xl font-supernova text-light-teal">Expenses</h2>
            <p className="text-sm text-gray-400 font-josefin">
              Total: <span className="text-red-400 font-semibold">{formatCurrency(total)}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {selectedItems.size > 0 && (
            <button
              onClick={handleBulkDelete}
              disabled={deleting}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/20 border border-red-500/50 text-red-400 font-josefin hover:bg-red-500/30 transition-all disabled:opacity-50"
            >
              <Trash2 size={18} />
              {deleting ? 'Deleting...' : `Delete (${selectedItems.size})`}
            </button>
          )}
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-hot-pink text-white font-josefin hover:shadow-[0_0_20px_rgba(255,0,100,0.3)] transition-all"
          >
            <Plus size={18} />
            Add Expense
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-light-teal/20 p-4">
        <div className="flex gap-4">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 rounded-lg bg-black/50 border border-light-teal/20 text-white font-josefin focus:outline-none focus:border-light-teal"
          >
            <option value="ALL">All Categories</option>
            {EXPENSE_CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-light-teal/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-light-teal/20">
              <tr>
                <th className="px-4 py-3 w-12">
                  <input
                    type="checkbox"
                    checked={expenses.length > 0 && selectedItems.size === expenses.length}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-light-teal/30 bg-black/50 text-red-500 cursor-pointer"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-supernova text-light-teal uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-supernova text-light-teal uppercase">Vendor</th>
                <th className="px-6 py-3 text-left text-xs font-supernova text-light-teal uppercase">Category</th>
                <th className="px-6 py-3 text-right text-xs font-supernova text-light-teal uppercase">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {expenses.map((item) => (
                <tr
                  key={item.id}
                  className={`hover:bg-white/5 transition-colors ${selectedItems.has(item.id) ? 'bg-red-500/10' : ''}`}
                >
                  <td className="px-4 py-4" onClick={(e) => toggleSelect(item.id, e)}>
                    <input
                      type="checkbox"
                      checked={selectedItems.has(item.id)}
                      onChange={() => {}}
                      className="w-4 h-4 rounded border-light-teal/30 bg-black/50 text-red-500 cursor-pointer"
                    />
                  </td>
                  <td className="px-6 py-4 font-josefin text-gray-300">
                    {new Date(item.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-josefin text-white">{item.vendor}</div>
                    {item.notes && (
                      <div className="text-xs text-gray-500 mt-1">{item.notes}</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 font-josefin text-sm">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-josefin font-semibold text-red-400">
                    {formatCurrency(item.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {expenses.length === 0 && (
          <div className="py-12 text-center text-gray-400 font-josefin">
            No expense entries yet. Click "Add Expense" to get started.
          </div>
        )}
      </div>

      {/* Add Expense Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl border border-light-teal/20 p-6 max-w-lg w-full">
            <h3 className="text-2xl font-supernova text-light-teal mb-4">Add Expense</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-josefin text-gray-300 mb-1">Amount *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-black/50 border border-light-teal/20 text-white font-josefin focus:outline-none focus:border-light-teal"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-josefin text-gray-300 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-black/50 border border-light-teal/20 text-white font-josefin focus:outline-none focus:border-light-teal"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-josefin text-gray-300 mb-1">Vendor *</label>
                <input
                  type="text"
                  required
                  value={formData.vendor}
                  onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-black/50 border border-light-teal/20 text-white font-josefin focus:outline-none focus:border-light-teal"
                  placeholder="e.g., Adobe, Amazon, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-josefin text-gray-300 mb-1">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-black/50 border border-light-teal/20 text-white font-josefin focus:outline-none focus:border-light-teal"
                >
                  {EXPENSE_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-josefin text-gray-300 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-black/50 border border-light-teal/20 text-white font-josefin focus:outline-none focus:border-light-teal"
                  rows={2}
                  placeholder="Optional notes..."
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isRecurring}
                    onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                    className="w-4 h-4 rounded border-light-teal/30 bg-black/50 text-red-500"
                  />
                  <span className="font-josefin text-gray-300">Recurring expense</span>
                </label>
                {formData.isRecurring && (
                  <select
                    value={formData.recurringFrequency}
                    onChange={(e) => setFormData({ ...formData, recurringFrequency: e.target.value })}
                    className="px-3 py-1 rounded-lg bg-black/50 border border-light-teal/20 text-white font-josefin text-sm focus:outline-none focus:border-light-teal"
                  >
                    <option value="">Select frequency</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-josefin transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-hot-pink text-white font-josefin hover:shadow-[0_0_20px_rgba(255,0,100,0.3)] transition-all disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Add Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
