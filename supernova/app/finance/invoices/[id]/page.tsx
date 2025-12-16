'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Send, CheckCircle, XCircle, Edit2, Save, Printer } from 'lucide-react'

interface LineItem {
  description: string
  quantity: number
  rate: number
}

interface Invoice {
  id: string
  invoiceNumber: string
  status: string
  issueDate: string
  dueDate: string
  subtotal: number
  tax: number | null
  total: number
  notes: string | null
  lineItems: LineItem[]
  contact: {
    id: string
    firstName: string
    lastName?: string
    company?: string
    email?: string
    phone?: string
  } | null
}

const STATUS_OPTIONS = ['DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED']

export default function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    fetchInvoice()
  }, [id])

  const fetchInvoice = async () => {
    try {
      const response = await fetch(`/api/finance/invoices/${id}`)
      if (response.ok) {
        const data = await response.json()
        setInvoice(data)
      } else {
        router.push('/finance/invoices')
      }
    } catch (error) {
      console.error('Failed to fetch invoice:', error)
      router.push('/finance/invoices')
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (newStatus: string) => {
    if (!invoice) return
    setSaving(true)
    try {
      const response = await fetch(`/api/finance/invoices/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        const updated = await response.json()
        setInvoice(updated)
      } else {
        alert('Failed to update status')
      }
    } catch (error) {
      alert('Failed to update status')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!invoice) return
    const confirmed = confirm('Delete this invoice? This cannot be undone.')
    if (!confirmed) return

    try {
      const response = await fetch(`/api/finance/invoices/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        router.push('/finance/invoices')
      } else {
        alert('Failed to delete invoice')
      }
    } catch (error) {
      alert('Failed to delete invoice')
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
      case 'SENT': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'PAID': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'OVERDUE': return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'CANCELLED': return 'bg-gray-500/20 text-gray-500 border-gray-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-light-teal font-josefin">Loading invoice...</div>
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 font-josefin">Invoice not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/finance/invoices')}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="text-light-teal" size={24} />
          </button>
          <div>
            <h2 className="text-2xl font-supernova text-light-teal">{invoice.invoiceNumber}</h2>
            <p className="text-sm text-gray-400 font-josefin">
              Created {new Date(invoice.issueDate).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 text-white font-josefin hover:bg-white/20 transition-all"
          >
            <Printer size={18} />
            Print
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 font-josefin hover:bg-red-500/30 transition-all"
          >
            <XCircle size={18} />
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Invoice Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status & Client */}
          <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-light-teal/20 p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-3xl font-supernova text-light-teal mb-2">INVOICE</h3>
                <p className="text-xl font-josefin text-white">{invoice.invoiceNumber}</p>
              </div>
              <span className={`px-4 py-2 rounded-lg border font-josefin font-semibold ${getStatusColor(invoice.status)}`}>
                {invoice.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Bill To */}
              <div>
                <p className="text-xs font-supernova text-gray-400 uppercase mb-2">Bill To</p>
                {invoice.contact ? (
                  <div>
                    <p className="font-josefin text-white font-semibold">
                      {invoice.contact.firstName} {invoice.contact.lastName || ''}
                    </p>
                    {invoice.contact.company && (
                      <p className="font-josefin text-gray-300">{invoice.contact.company}</p>
                    )}
                    {invoice.contact.email && (
                      <p className="font-josefin text-gray-400 text-sm">{invoice.contact.email}</p>
                    )}
                    {invoice.contact.phone && (
                      <p className="font-josefin text-gray-400 text-sm">{invoice.contact.phone}</p>
                    )}
                  </div>
                ) : (
                  <p className="font-josefin text-gray-500">No client assigned</p>
                )}
              </div>

              {/* Dates */}
              <div className="text-right">
                <div className="mb-4">
                  <p className="text-xs font-supernova text-gray-400 uppercase">Issue Date</p>
                  <p className="font-josefin text-white">{new Date(invoice.issueDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-xs font-supernova text-gray-400 uppercase">Due Date</p>
                  <p className={`font-josefin ${new Date(invoice.dueDate) < new Date() && invoice.status !== 'PAID' ? 'text-red-400' : 'text-white'}`}>
                    {new Date(invoice.dueDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-light-teal/20 overflow-hidden">
            <table className="w-full">
              <thead className="bg-white/5 border-b border-light-teal/20">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-supernova text-light-teal uppercase">Description</th>
                  <th className="px-6 py-3 text-center text-xs font-supernova text-light-teal uppercase">Qty</th>
                  <th className="px-6 py-3 text-right text-xs font-supernova text-light-teal uppercase">Rate</th>
                  <th className="px-6 py-3 text-right text-xs font-supernova text-light-teal uppercase">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {(invoice.lineItems as LineItem[]).map((item, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 font-josefin text-white">{item.description}</td>
                    <td className="px-6 py-4 font-josefin text-gray-300 text-center">{item.quantity}</td>
                    <td className="px-6 py-4 font-josefin text-gray-300 text-right">{formatCurrency(item.rate)}</td>
                    <td className="px-6 py-4 font-josefin text-white text-right font-semibold">
                      {formatCurrency(item.quantity * item.rate)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t border-light-teal/20">
                <tr>
                  <td colSpan={3} className="px-6 py-3 text-right font-josefin text-gray-400">Subtotal</td>
                  <td className="px-6 py-3 text-right font-josefin text-white">{formatCurrency(invoice.subtotal)}</td>
                </tr>
                {invoice.tax !== null && invoice.tax > 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-3 text-right font-josefin text-gray-400">VAT</td>
                    <td className="px-6 py-3 text-right font-josefin text-white">{formatCurrency(invoice.tax)}</td>
                  </tr>
                )}
                <tr className="bg-white/5">
                  <td colSpan={3} className="px-6 py-4 text-right font-supernova text-light-teal text-lg">Total</td>
                  <td className="px-6 py-4 text-right font-supernova text-hot-pink text-xl">{formatCurrency(invoice.total)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-light-teal/20 p-6">
              <h3 className="text-xs font-supernova text-gray-400 uppercase mb-2">Notes</h3>
              <p className="font-josefin text-gray-300 whitespace-pre-wrap">{invoice.notes}</p>
            </div>
          )}
        </div>

        {/* Right Sidebar - Actions */}
        <div className="space-y-6 print:hidden">
          <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-light-teal/20 p-6">
            <h3 className="text-lg font-supernova text-light-teal mb-4">Actions</h3>

            <div className="space-y-3">
              {/* Quick Status Changes */}
              {invoice.status === 'DRAFT' && (
                <button
                  onClick={() => updateStatus('SENT')}
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-blue-500/20 border border-blue-500/30 text-blue-400 font-josefin hover:bg-blue-500/30 transition-all disabled:opacity-50"
                >
                  <Send size={18} />
                  {saving ? 'Updating...' : 'Mark as Sent'}
                </button>
              )}

              {(invoice.status === 'SENT' || invoice.status === 'OVERDUE') && (
                <button
                  onClick={() => updateStatus('PAID')}
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-green-500/20 border border-green-500/30 text-green-400 font-josefin hover:bg-green-500/30 transition-all disabled:opacity-50"
                >
                  <CheckCircle size={18} />
                  {saving ? 'Updating...' : 'Mark as Paid'}
                </button>
              )}

              {invoice.status !== 'CANCELLED' && invoice.status !== 'PAID' && (
                <button
                  onClick={() => updateStatus('CANCELLED')}
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gray-500/20 border border-gray-500/30 text-gray-400 font-josefin hover:bg-gray-500/30 transition-all disabled:opacity-50"
                >
                  <XCircle size={18} />
                  {saving ? 'Updating...' : 'Cancel Invoice'}
                </button>
              )}

              {/* Manual Status Select */}
              <div className="pt-4 border-t border-white/10">
                <label className="block text-sm font-josefin text-gray-400 mb-2">Change Status</label>
                <select
                  value={invoice.status}
                  onChange={(e) => updateStatus(e.target.value)}
                  disabled={saving}
                  className="w-full px-4 py-2 rounded-lg bg-black/50 border border-light-teal/20 text-white font-josefin focus:outline-none focus:border-light-teal disabled:opacity-50"
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Invoice Summary */}
          <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-light-teal/20 p-6">
            <h3 className="text-lg font-supernova text-light-teal mb-4">Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between font-josefin">
                <span className="text-gray-400">Subtotal</span>
                <span className="text-white">{formatCurrency(invoice.subtotal)}</span>
              </div>
              {invoice.tax !== null && invoice.tax > 0 && (
                <div className="flex justify-between font-josefin">
                  <span className="text-gray-400">VAT</span>
                  <span className="text-white">{formatCurrency(invoice.tax)}</span>
                </div>
              )}
              <div className="flex justify-between font-josefin text-xl pt-3 border-t border-white/10">
                <span className="text-light-teal">Total</span>
                <span className="text-hot-pink font-supernova">{formatCurrency(invoice.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  )
}
