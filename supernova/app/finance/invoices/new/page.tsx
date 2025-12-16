'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'

interface Contact {
  id: string
  firstName: string
  lastName?: string
  company?: string
}

interface LineItem {
  description: string
  quantity: number
  rate: number
}

interface InvoicePrefix {
  id: string
  name: string
  prefix: string
  nextNumber: number
}

export default function NewInvoicePage() {
  const router = useRouter()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [prefixes, setPrefixes] = useState<InvoicePrefix[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    contactId: '',
    prefixId: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: '',
    taxRate: 20,
  })

  const [lineItems, setLineItems] = useState<LineItem[]>([
    { description: '', quantity: 1, rate: 0 }
  ])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [contactsRes, prefixesRes] = await Promise.all([
        fetch('/api/crm/contacts?limit=500'),
        fetch('/api/finance/invoice-prefixes')
      ])

      if (contactsRes.ok) {
        const data = await contactsRes.json()
        setContacts(data.contacts || [])
      }

      if (prefixesRes.ok) {
        const data = await prefixesRes.json()
        setPrefixes(data)
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const addLineItem = () => {
    setLineItems([...lineItems, { description: '', quantity: 1, rate: 0 }])
  }

  const removeLineItem = (index: number) => {
    if (lineItems.length === 1) return
    setLineItems(lineItems.filter((_, i) => i !== index))
  }

  const updateLineItem = (index: number, field: keyof LineItem, value: string | number) => {
    const updated = [...lineItems]
    if (field === 'description') {
      updated[index].description = value as string
    } else {
      updated[index][field] = parseFloat(value as string) || 0
    }
    setLineItems(updated)
  }

  const subtotal = lineItems.reduce((sum, item) => sum + (item.quantity * item.rate), 0)
  const taxAmount = subtotal * (formData.taxRate / 100)
  const total = subtotal + taxAmount

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(amount)
  }

  const handleSubmit = async (e: React.FormEvent, status: string = 'DRAFT') => {
    e.preventDefault()

    // Validate line items
    const validItems = lineItems.filter(item => item.description.trim() && item.rate > 0)
    if (validItems.length === 0) {
      alert('Please add at least one line item with a description and amount')
      return
    }

    setSaving(true)
    try {
      const response = await fetch('/api/finance/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactId: formData.contactId || null,
          prefixId: formData.prefixId || null,
          issueDate: formData.issueDate,
          dueDate: formData.dueDate,
          notes: formData.notes,
          tax: formData.taxRate,
          lineItems: validItems,
          status,
        }),
      })

      if (response.ok) {
        const invoice = await response.json()
        router.push(`/finance/invoices/${invoice.id}`)
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to create invoice')
      }
    } catch (error) {
      alert('Failed to create invoice')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-light-teal font-josefin">Loading...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push('/finance/invoices')}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="text-light-teal" size={24} />
        </button>
        <div>
          <h2 className="text-2xl font-supernova text-light-teal">New Invoice</h2>
          <p className="text-sm text-gray-400 font-josefin">Create a new invoice for your client</p>
        </div>
      </div>

      <form onSubmit={(e) => handleSubmit(e, 'DRAFT')}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Invoice Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Client & Dates */}
            <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-light-teal/20 p-6">
              <h3 className="text-lg font-supernova text-light-teal mb-4">Invoice Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-josefin text-gray-300 mb-1">Client</label>
                  <select
                    value={formData.contactId}
                    onChange={(e) => setFormData({ ...formData, contactId: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-black/50 border border-light-teal/20 text-white font-josefin focus:outline-none focus:border-light-teal"
                  >
                    <option value="">Select a client...</option>
                    {contacts.map((contact) => (
                      <option key={contact.id} value={contact.id}>
                        {contact.firstName} {contact.lastName || ''} {contact.company ? `(${contact.company})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-josefin text-gray-300 mb-1">Invoice Prefix</label>
                  <select
                    value={formData.prefixId}
                    onChange={(e) => setFormData({ ...formData, prefixId: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-black/50 border border-light-teal/20 text-white font-josefin focus:outline-none focus:border-light-teal"
                  >
                    <option value="">Default (INV-0001)</option>
                    {prefixes.map((prefix) => (
                      <option key={prefix.id} value={prefix.id}>
                        {prefix.name} ({prefix.prefix}-{prefix.nextNumber.toString().padStart(4, '0')})
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.prefixId
                      ? `Next invoice will be: ${prefixes.find(p => p.id === formData.prefixId)?.prefix}-${prefixes.find(p => p.id === formData.prefixId)?.nextNumber.toString().padStart(4, '0')}`
                      : 'Using default INV- prefix'
                    }
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-josefin text-gray-300 mb-1">Issue Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.issueDate}
                    onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-black/50 border border-light-teal/20 text-white font-josefin focus:outline-none focus:border-light-teal"
                  />
                </div>
                <div>
                  <label className="block text-sm font-josefin text-gray-300 mb-1">Due Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-black/50 border border-light-teal/20 text-white font-josefin focus:outline-none focus:border-light-teal"
                  />
                </div>
              </div>
            </div>

            {/* Line Items */}
            <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-light-teal/20 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-supernova text-light-teal">Line Items</h3>
                <button
                  type="button"
                  onClick={addLineItem}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-light-teal/20 text-light-teal font-josefin text-sm hover:bg-light-teal/30 transition-all"
                >
                  <Plus size={16} />
                  Add Item
                </button>
              </div>

              <div className="space-y-3">
                {/* Header */}
                <div className="grid grid-cols-12 gap-3 text-xs font-supernova text-gray-400 uppercase px-2">
                  <div className="col-span-6">Description</div>
                  <div className="col-span-2 text-center">Qty</div>
                  <div className="col-span-2 text-right">Rate</div>
                  <div className="col-span-1 text-right">Amount</div>
                  <div className="col-span-1"></div>
                </div>

                {/* Items */}
                {lineItems.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-3 items-center">
                    <div className="col-span-6">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                        placeholder="Service or product description"
                        className="w-full px-3 py-2 rounded-lg bg-black/50 border border-light-teal/20 text-white font-josefin text-sm focus:outline-none focus:border-light-teal"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={item.quantity}
                        onChange={(e) => updateLineItem(index, 'quantity', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-black/50 border border-light-teal/20 text-white font-josefin text-sm text-center focus:outline-none focus:border-light-teal"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.rate || ''}
                        onChange={(e) => updateLineItem(index, 'rate', e.target.value)}
                        placeholder="0.00"
                        className="w-full px-3 py-2 rounded-lg bg-black/50 border border-light-teal/20 text-white font-josefin text-sm text-right focus:outline-none focus:border-light-teal"
                      />
                    </div>
                    <div className="col-span-1 text-right font-josefin text-white text-sm">
                      {formatCurrency(item.quantity * item.rate)}
                    </div>
                    <div className="col-span-1 text-right">
                      <button
                        type="button"
                        onClick={() => removeLineItem(index)}
                        disabled={lineItems.length === 1}
                        className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-light-teal/20 p-6">
              <h3 className="text-lg font-supernova text-light-teal mb-4">Notes</h3>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={4}
                placeholder="Payment terms, thank you message, or any other notes for the client..."
                className="w-full px-4 py-2 rounded-lg bg-black/50 border border-light-teal/20 text-white font-josefin focus:outline-none focus:border-light-teal"
              />
            </div>
          </div>

          {/* Right Column - Summary */}
          <div className="space-y-6">
            <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-light-teal/20 p-6 sticky top-6">
              <h3 className="text-lg font-supernova text-light-teal mb-4">Invoice Summary</h3>

              <div className="space-y-4">
                {/* Tax Rate */}
                <div>
                  <label className="block text-sm font-josefin text-gray-300 mb-1">VAT Rate (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={formData.taxRate}
                    onChange={(e) => setFormData({ ...formData, taxRate: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 rounded-lg bg-black/50 border border-light-teal/20 text-white font-josefin focus:outline-none focus:border-light-teal"
                  />
                </div>

                {/* Totals */}
                <div className="pt-4 border-t border-white/10 space-y-3">
                  <div className="flex justify-between font-josefin">
                    <span className="text-gray-400">Subtotal</span>
                    <span className="text-white">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between font-josefin">
                    <span className="text-gray-400">VAT ({formData.taxRate}%)</span>
                    <span className="text-white">{formatCurrency(taxAmount)}</span>
                  </div>
                  <div className="flex justify-between font-josefin text-xl pt-3 border-t border-white/10">
                    <span className="text-light-teal">Total</span>
                    <span className="text-hot-pink font-supernova">{formatCurrency(total)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 space-y-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-light-teal/30 text-light-teal font-josefin hover:bg-white/20 transition-all disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save as Draft'}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleSubmit(e as any, 'SENT')}
                    disabled={saving}
                    className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-hot-pink to-light-teal text-white font-josefin hover:shadow-[0_0_20px_rgba(255,0,100,0.3)] transition-all disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save & Mark as Sent'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
