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
    address?: string
    city?: string
    postcode?: string
  } | null
}

const STATUS_OPTIONS = ['DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED']

// Business details - can be made configurable via settings later
const BUSINESS_DETAILS = {
  name: 'Daitani',
  tagline: 'Creative & Digital Solutions',
  address: '',
  city: '',
  postcode: '',
  email: 'hello@daitani.co.uk',
  phone: '',
  website: 'www.daitani.co.uk',
  vatNumber: '',
  companyNumber: '',
  bankName: '',
  sortCode: '',
  accountNumber: '',
}

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
    <>
      {/* Screen View - Hidden when printing */}
      <div className="space-y-6 print:hidden">
        {/* Header */}
        <div className="flex items-center justify-between">
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
          <div className="space-y-6">
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
      </div>

      {/* Print View - Only visible when printing */}
      <div className="hidden print:block">
        <div className="max-w-4xl mx-auto p-8 bg-white text-black">
          {/* Header with Logo/Business Name */}
          <div className="flex justify-between items-start border-b-2 border-gray-200 pb-6 mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 tracking-tight">{BUSINESS_DETAILS.name}</h1>
              {BUSINESS_DETAILS.tagline && (
                <p className="text-gray-500 mt-1">{BUSINESS_DETAILS.tagline}</p>
              )}
              {BUSINESS_DETAILS.address && (
                <div className="mt-4 text-sm text-gray-600">
                  <p>{BUSINESS_DETAILS.address}</p>
                  {BUSINESS_DETAILS.city && <p>{BUSINESS_DETAILS.city} {BUSINESS_DETAILS.postcode}</p>}
                </div>
              )}
              {BUSINESS_DETAILS.email && <p className="text-sm text-gray-600 mt-2">{BUSINESS_DETAILS.email}</p>}
              {BUSINESS_DETAILS.phone && <p className="text-sm text-gray-600">{BUSINESS_DETAILS.phone}</p>}
              {BUSINESS_DETAILS.website && <p className="text-sm text-gray-600">{BUSINESS_DETAILS.website}</p>}
            </div>
            <div className="text-right">
              <h2 className="text-3xl font-bold text-gray-900">INVOICE</h2>
              <p className="text-xl text-gray-600 mt-2">{invoice.invoiceNumber}</p>
              {invoice.status === 'PAID' && (
                <div className="mt-4 inline-block px-4 py-2 bg-green-100 text-green-800 font-bold rounded-lg border-2 border-green-300">
                  PAID
                </div>
              )}
            </div>
          </div>

          {/* Bill To and Invoice Details */}
          <div className="grid grid-cols-2 gap-12 mb-8">
            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Bill To</h3>
              {invoice.contact ? (
                <div className="text-gray-800">
                  <p className="font-semibold text-lg">
                    {invoice.contact.firstName} {invoice.contact.lastName || ''}
                  </p>
                  {invoice.contact.company && (
                    <p className="text-gray-600">{invoice.contact.company}</p>
                  )}
                  {invoice.contact.address && <p className="text-gray-600 mt-2">{invoice.contact.address}</p>}
                  {invoice.contact.city && <p className="text-gray-600">{invoice.contact.city} {invoice.contact.postcode}</p>}
                  {invoice.contact.email && <p className="text-gray-600 mt-2">{invoice.contact.email}</p>}
                  {invoice.contact.phone && <p className="text-gray-600">{invoice.contact.phone}</p>}
                </div>
              ) : (
                <p className="text-gray-500 italic">No client assigned</p>
              )}
            </div>
            <div className="text-right">
              <div className="inline-block text-left">
                <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                  <p className="text-xs font-bold text-gray-500 uppercase">Invoice Number</p>
                  <p className="text-gray-800 font-medium">{invoice.invoiceNumber}</p>

                  <p className="text-xs font-bold text-gray-500 uppercase">Issue Date</p>
                  <p className="text-gray-800">{new Date(invoice.issueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>

                  <p className="text-xs font-bold text-gray-500 uppercase">Due Date</p>
                  <p className={`font-medium ${new Date(invoice.dueDate) < new Date() && invoice.status !== 'PAID' ? 'text-red-600' : 'text-gray-800'}`}>
                    {new Date(invoice.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="mb-8">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider w-20">Qty</th>
                  <th className="py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider w-28">Rate</th>
                  <th className="py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider w-28">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {(invoice.lineItems as LineItem[]).map((item, index) => (
                  <tr key={index}>
                    <td className="py-4 text-gray-800">{item.description}</td>
                    <td className="py-4 text-gray-600 text-center">{item.quantity}</td>
                    <td className="py-4 text-gray-600 text-right">{formatCurrency(item.rate)}</td>
                    <td className="py-4 text-gray-800 text-right font-medium">{formatCurrency(item.quantity * item.rate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-72">
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-800 font-medium">{formatCurrency(invoice.subtotal)}</span>
              </div>
              {invoice.tax !== null && invoice.tax > 0 && (
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">VAT</span>
                  <span className="text-gray-800 font-medium">{formatCurrency(invoice.tax)}</span>
                </div>
              )}
              <div className="flex justify-between py-4 border-b-2 border-gray-900">
                <span className="text-xl font-bold text-gray-900">Total Due</span>
                <span className="text-xl font-bold text-gray-900">{formatCurrency(invoice.total)}</span>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          {(BUSINESS_DETAILS.bankName || BUSINESS_DETAILS.sortCode || BUSINESS_DETAILS.accountNumber) && (
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Payment Details</h3>
              <div className="grid grid-cols-3 gap-4 text-sm">
                {BUSINESS_DETAILS.bankName && (
                  <div>
                    <p className="text-gray-500">Bank</p>
                    <p className="text-gray-800 font-medium">{BUSINESS_DETAILS.bankName}</p>
                  </div>
                )}
                {BUSINESS_DETAILS.sortCode && (
                  <div>
                    <p className="text-gray-500">Sort Code</p>
                    <p className="text-gray-800 font-medium">{BUSINESS_DETAILS.sortCode}</p>
                  </div>
                )}
                {BUSINESS_DETAILS.accountNumber && (
                  <div>
                    <p className="text-gray-500">Account Number</p>
                    <p className="text-gray-800 font-medium">{BUSINESS_DETAILS.accountNumber}</p>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-4">
                Please use invoice number <strong>{invoice.invoiceNumber}</strong> as payment reference.
              </p>
            </div>
          )}

          {/* Notes */}
          {invoice.notes && (
            <div className="mb-8">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Notes</h3>
              <p className="text-gray-600 text-sm whitespace-pre-wrap">{invoice.notes}</p>
            </div>
          )}

          {/* Footer */}
          <div className="border-t-2 border-gray-200 pt-6 mt-8 text-center text-sm text-gray-500">
            <p className="font-medium">Thank you for your business!</p>
            {BUSINESS_DETAILS.vatNumber && (
              <p className="mt-2">VAT Registration: {BUSINESS_DETAILS.vatNumber}</p>
            )}
            {BUSINESS_DETAILS.companyNumber && (
              <p>Company Registration: {BUSINESS_DETAILS.companyNumber}</p>
            )}
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 0;
          }

          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .print\\:hidden {
            display: none !important;
          }

          .print\\:block {
            display: block !important;
          }
        }
      `}</style>
    </>
  )
}
