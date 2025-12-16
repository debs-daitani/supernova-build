'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Trash2, Search, RefreshCw } from 'lucide-react'

const INCOME_CATEGORIES = [
  'Client Work',
  'Product Sales',
  'Affiliate',
  'Sponsorship',
  'Consulting',
  'Coaching',
  'Digital Products',
  'Subscriptions',
  'Other'
]

interface Income {
  id: string
  amount: number
  source: string
  category: string
  date: string
  notes?: string
  isRecurring: boolean
  recurringFrequency?: string
  contact?: {
    id: string
    firstName: string
    lastName?: string
    company?: string
  }
}

interface Contact {
  id: string
  firstName: string
  lastName?: string
  company?: string
}

export default function IncomePage() {
  const router = useRouter()
  const [income, setIncome] = useState<Income[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [deleting, setDeleting] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState('ALL')
  const [total, setTotal] = useState(0)

  const [formData, setFormData] = useState({
    amount: '',
    source: '',
    category: 'Client Work',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    contactId: '',
    isRecurring: false,
    recurringFrequency: '',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchIncome()
    fetchContacts()
  }, [categoryFilter])

  const fetchIncome = async () => {
    try {
      const params = new URLSearchParams({ category: categoryFilter })
      const response = await fetch(`/api/finance/income?${params}`)
      if (response.ok) {
        const data = await response.json()
        setIncome(data.income)
        setTotal(data.total)
      }
    } catch (error) {
      console.error('Failed to fetch income:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchContacts = async () => {
    try {
      const response = await fetch('/api/crm/contacts?limit=100')
      if (response.ok) {
        const data = await response.json()
        setContacts(data.contacts || [])
      }
    } catch (error) {
      console.error('Failed to fetch contacts:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch('/api/finance/income', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setShowModal(false)
        setFormData({
          amount: '',
          source: '',
          category: 'Client Work',
          date: new Date().toISOString().split('T')[0],
          notes: '',
          contactId: '',
          isRecurring: false,
          recurringFrequency: '',
        })
        fetchIncome()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to create income entry')
      }
    } catch (error) {
      alert('Failed to create income entry')
    } finally {
      setSaving(false)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedItems.size === 0) return

    const confirmed = confirm(`Delete ${selectedItems.size} income entries? This cannot be undone.`)
    if (!confirmed) return

    setDeleting(true)
    try {
      const response = await fetch('/api/finance/income', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selectedItems) }),
      })

      if (response.ok) {
        setSelectedItems(new Set())
        fetchIncome()
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
    if (selectedItems.size === income.length) {
      setSelectedItems(new Set())
    } else {
      setSelectedItems(new Set(income.map(i => i.id)))
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(amount)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-light-teal font-josefin">Loading income...</div>
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
            <h2 className="text-2xl font-supernova text-light-teal">Income</h2>
            <p className="text-sm text-gray-400 font-josefin">
              Total: <span className="text-green-400 font-semibold">{formatCurrency(total)}</span>
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
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-light-teal text-white font-josefin hover:shadow-[0_0_20px_rgba(0,255,136,0.3)] transition-all"
          >
            <Plus size={18} />
            Add Income
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
            {INCOME_CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Income Table */}
      <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-light-teal/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-light-teal/20">
              <tr>
                <th className="px-4 py-3 w-12">
                  <input
                    type="checkbox"
                    checked={income.length > 0 && selectedItems.size === income.length}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-light-teal/30 bg-black/50 text-green-500 cursor-pointer"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-supernova text-light-teal uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-supernova text-light-teal uppercase">Source</th>
                <th className="px-6 py-3 text-left text-xs font-supernova text-light-teal uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-supernova text-light-teal uppercase">Client</th>
                <th className="px-6 py-3 text-right text-xs font-supernova text-light-teal uppercase">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {income.map((item) => (
                <tr
                  key={item.id}
                  className={`hover:bg-white/5 transition-colors ${selectedItems.has(item.id) ? 'bg-green-500/10' : ''}`}
                >
                  <td className="px-4 py-4" onClick={(e) => toggleSelect(item.id, e)}>
                    <input
                      type="checkbox"
                      checked={selectedItems.has(item.id)}
                      onChange={() => {}}
                      className="w-4 h-4 rounded border-light-teal/30 bg-black/50 text-green-500 cursor-pointer"
                    />
                  </td>
                  <td className="px-6 py-4 font-josefin text-gray-300">
                    {new Date(item.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-josefin text-white">{item.source}</div>
                    {item.notes && (
                      <div className="text-xs text-gray-500 mt-1">{item.notes}</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 font-josefin text-sm">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-josefin text-gray-300">
                    {item.contact ? `${item.contact.firstName} ${item.contact.lastName || ''}` : '-'}
                  </td>
                  <td className="px-6 py-4 text-right font-josefin font-semibold text-green-400">
                    {formatCurrency(item.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {income.length === 0 && (
          <div className="py-12 text-center text-gray-400 font-josefin">
            No income entries yet. Click "Add Income" to get started.
          </div>
        )}
      </div>

      {/* Add Income Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl border border-light-teal/20 p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-supernova text-light-teal mb-4">Add Income</h3>
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
                <label className="block text-sm font-josefin text-gray-300 mb-1">Source *</label>
                <input
                  type="text"
                  required
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-black/50 border border-light-teal/20 text-white font-josefin focus:outline-none focus:border-light-teal"
                  placeholder="e.g., Website Design Project"
                />
              </div>

              <div>
                <label className="block text-sm font-josefin text-gray-300 mb-1">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-black/50 border border-light-teal/20 text-white font-josefin focus:outline-none focus:border-light-teal"
                >
                  {INCOME_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-josefin text-gray-300 mb-1">Client (Optional)</label>
                <select
                  value={formData.contactId}
                  onChange={(e) => setFormData({ ...formData, contactId: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-black/50 border border-light-teal/20 text-white font-josefin focus:outline-none focus:border-light-teal"
                >
                  <option value="">No client linked</option>
                  {contacts.map(contact => (
                    <option key={contact.id} value={contact.id}>
                      {contact.firstName} {contact.lastName || ''} {contact.company ? `(${contact.company})` : ''}
                    </option>
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
                    className="w-4 h-4 rounded border-light-teal/30 bg-black/50 text-green-500"
                  />
                  <span className="font-josefin text-gray-300">Recurring income</span>
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
                  className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-light-teal text-white font-josefin hover:shadow-[0_0_20px_rgba(0,255,136,0.3)] transition-all disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Add Income'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
