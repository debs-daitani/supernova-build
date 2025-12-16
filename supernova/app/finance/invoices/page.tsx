'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Trash2, FileText, Send, CheckCircle, AlertCircle } from 'lucide-react'

interface Invoice {
  id: string
  invoiceNumber: string
  status: string
  issueDate: string
  dueDate: string
  subtotal: number
  tax: number | null
  total: number
  contact: {
    id: string
    firstName: string
    lastName?: string
    company?: string
  } | null
}

const STATUS_COLORS: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
  DRAFT: { bg: 'bg-gray-500/20', text: 'text-gray-400', icon: <FileText size={14} /> },
  SENT: { bg: 'bg-blue-500/20', text: 'text-blue-400', icon: <Send size={14} /> },
  PAID: { bg: 'bg-green-500/20', text: 'text-green-400', icon: <CheckCircle size={14} /> },
  OVERDUE: { bg: 'bg-red-500/20', text: 'text-red-400', icon: <AlertCircle size={14} /> },
  CANCELLED: { bg: 'bg-gray-500/20', text: 'text-gray-500', icon: <FileText size={14} /> },
}

export default function InvoicesPage() {
  const router = useRouter()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [deleting, setDeleting] = useState(false)
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [totals, setTotals] = useState({
    draft: 0,
    sent: 0,
    paid: 0,
    overdue: 0,
  })

  useEffect(() => {
    fetchInvoices()
  }, [statusFilter])

  const fetchInvoices = async () => {
    try {
      const params = new URLSearchParams({ status: statusFilter })
      const response = await fetch(`/api/finance/invoices?${params}`)
      if (response.ok) {
        const data = await response.json()
        setInvoices(data.invoices)
        setTotals(data.totals)
      }
    } catch (error) {
      console.error('Failed to fetch invoices:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedItems.size === 0) return

    const confirmed = confirm(`Delete ${selectedItems.size} invoices? This cannot be undone.`)
    if (!confirmed) return

    setDeleting(true)
    try {
      const response = await fetch('/api/finance/invoices', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selectedItems) }),
      })

      if (response.ok) {
        setSelectedItems(new Set())
        fetchInvoices()
      }
    } catch (error) {
      alert('Failed to delete invoices')
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
    if (selectedItems.size === invoices.length) {
      setSelectedItems(new Set())
    } else {
      setSelectedItems(new Set(invoices.map(i => i.id)))
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(amount)
  }

  const isOverdue = (dueDate: string, status: string) => {
    if (status === 'PAID' || status === 'CANCELLED') return false
    return new Date(dueDate) < new Date()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-light-teal font-josefin">Loading invoices...</div>
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
            <h2 className="text-2xl font-supernova text-light-teal">Invoices</h2>
            <p className="text-sm text-gray-400 font-josefin">
              Manage your client invoices
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
            onClick={() => router.push('/finance/invoices/new')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-hot-pink to-light-teal text-white font-josefin hover:shadow-[0_0_20px_rgba(255,0,100,0.3)] transition-all"
          >
            <Plus size={18} />
            New Invoice
          </button>
        </div>
      </div>

      {/* Status Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-gray-500/20 p-4">
          <div className="text-gray-400 font-josefin text-sm mb-1">Draft</div>
          <div className="text-xl font-supernova text-gray-400">{formatCurrency(totals.draft)}</div>
        </div>
        <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-blue-500/20 p-4">
          <div className="text-blue-400 font-josefin text-sm mb-1">Sent</div>
          <div className="text-xl font-supernova text-blue-400">{formatCurrency(totals.sent)}</div>
        </div>
        <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-red-500/20 p-4">
          <div className="text-red-400 font-josefin text-sm mb-1">Overdue</div>
          <div className="text-xl font-supernova text-red-400">{formatCurrency(totals.overdue)}</div>
        </div>
        <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-green-500/20 p-4">
          <div className="text-green-400 font-josefin text-sm mb-1">Paid</div>
          <div className="text-xl font-supernova text-green-400">{formatCurrency(totals.paid)}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-light-teal/20 p-4">
        <div className="flex gap-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 rounded-lg bg-black/50 border border-light-teal/20 text-white font-josefin focus:outline-none focus:border-light-teal"
          >
            <option value="ALL">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="SENT">Sent</option>
            <option value="PAID">Paid</option>
            <option value="OVERDUE">Overdue</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-light-teal/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-light-teal/20">
              <tr>
                <th className="px-4 py-3 w-12">
                  <input
                    type="checkbox"
                    checked={invoices.length > 0 && selectedItems.size === invoices.length}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-light-teal/30 bg-black/50 text-hot-pink cursor-pointer"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-supernova text-light-teal uppercase">Invoice #</th>
                <th className="px-6 py-3 text-left text-xs font-supernova text-light-teal uppercase">Client</th>
                <th className="px-6 py-3 text-left text-xs font-supernova text-light-teal uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-supernova text-light-teal uppercase">Issue Date</th>
                <th className="px-6 py-3 text-left text-xs font-supernova text-light-teal uppercase">Due Date</th>
                <th className="px-6 py-3 text-right text-xs font-supernova text-light-teal uppercase">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {invoices.map((invoice) => {
                const overdue = isOverdue(invoice.dueDate, invoice.status)
                const displayStatus = overdue && invoice.status === 'SENT' ? 'OVERDUE' : invoice.status
                const statusStyle = STATUS_COLORS[displayStatus] || STATUS_COLORS.DRAFT

                return (
                  <tr
                    key={invoice.id}
                    onClick={() => router.push(`/finance/invoices/${invoice.id}`)}
                    className={`hover:bg-white/5 transition-colors cursor-pointer ${selectedItems.has(invoice.id) ? 'bg-hot-pink/10' : ''}`}
                  >
                    <td className="px-4 py-4" onClick={(e) => toggleSelect(invoice.id, e)}>
                      <input
                        type="checkbox"
                        checked={selectedItems.has(invoice.id)}
                        onChange={() => {}}
                        className="w-4 h-4 rounded border-light-teal/30 bg-black/50 text-hot-pink cursor-pointer"
                      />
                    </td>
                    <td className="px-6 py-4 font-josefin text-white font-semibold">
                      {invoice.invoiceNumber}
                    </td>
                    <td className="px-6 py-4">
                      {invoice.contact ? (
                        <div>
                          <div className="font-josefin text-white">
                            {invoice.contact.firstName} {invoice.contact.lastName || ''}
                          </div>
                          {invoice.contact.company && (
                            <div className="text-xs text-gray-500">{invoice.contact.company}</div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-500 font-josefin">No client</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${statusStyle.bg} ${statusStyle.text} font-josefin text-sm`}>
                        {statusStyle.icon}
                        {displayStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-josefin text-gray-300">
                      {new Date(invoice.issueDate).toLocaleDateString()}
                    </td>
                    <td className={`px-6 py-4 font-josefin ${overdue ? 'text-red-400' : 'text-gray-300'}`}>
                      {new Date(invoice.dueDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right font-josefin font-semibold text-hot-pink">
                      {formatCurrency(invoice.total)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {invoices.length === 0 && (
          <div className="py-12 text-center text-gray-400 font-josefin">
            No invoices yet. Click "New Invoice" to create your first one.
          </div>
        )}
      </div>
    </div>
  )
}
