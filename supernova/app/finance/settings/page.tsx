'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, FileText, AlertCircle } from 'lucide-react'

interface InvoicePrefix {
  id: string
  name: string
  prefix: string
  nextNumber: number
  _count: {
    invoices: number
  }
}

export default function FinanceSettingsPage() {
  const [prefixes, setPrefixes] = useState<InvoicePrefix[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newPrefix, setNewPrefix] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchPrefixes()
  }, [])

  const fetchPrefixes = async () => {
    try {
      const response = await fetch('/api/finance/invoice-prefixes')
      if (response.ok) {
        const data = await response.json()
        setPrefixes(data)
      }
    } catch (error) {
      console.error('Failed to fetch prefixes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddPrefix = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      const response = await fetch('/api/finance/invoice-prefixes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName,
          prefix: newPrefix.toUpperCase()
        })
      })

      if (response.ok) {
        await fetchPrefixes()
        setNewName('')
        setNewPrefix('')
        setShowAddForm(false)
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to create prefix')
      }
    } catch (error) {
      setError('Failed to create prefix')
    } finally {
      setSaving(false)
    }
  }

  const handleDeletePrefix = async (id: string) => {
    if (!confirm('Are you sure you want to delete this prefix?')) return

    try {
      const response = await fetch(`/api/finance/invoice-prefixes/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchPrefixes()
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to delete prefix')
      }
    } catch (error) {
      alert('Failed to delete prefix')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-light-teal font-josefin">Loading settings...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-supernova text-light-teal">Finance Settings</h2>
        <p className="text-sm text-gray-400 font-josefin">Configure your invoice prefixes and more</p>
      </div>

      {/* Invoice Prefixes Section */}
      <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-light-teal/20 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-supernova text-light-teal flex items-center gap-2">
              <FileText size={20} />
              Invoice Prefixes
            </h3>
            <p className="text-sm text-gray-400 font-josefin mt-1">
              Create custom prefixes for different income streams (e.g., DD-0001 for coaching, PET-0001 for pet business)
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-light-teal/20 hover:bg-light-teal/30 text-light-teal font-josefin transition-all"
          >
            <Plus size={18} />
            Add Prefix
          </button>
        </div>

        {/* Add Form */}
        {showAddForm && (
          <form onSubmit={handleAddPrefix} className="mb-6 p-4 rounded-lg bg-black/30 border border-light-teal/20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-gray-400 font-josefin mb-1">Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g., Coaching, Pet Business"
                  className="w-full px-4 py-2 rounded-lg bg-black/50 border border-light-teal/20 text-white font-josefin focus:outline-none focus:border-light-teal"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 font-josefin mb-1">Prefix</label>
                <input
                  type="text"
                  value={newPrefix}
                  onChange={(e) => setNewPrefix(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                  placeholder="e.g., DD, PET, COACH"
                  maxLength={6}
                  className="w-full px-4 py-2 rounded-lg bg-black/50 border border-light-teal/20 text-white font-josefin focus:outline-none focus:border-light-teal uppercase"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">This will be used like {newPrefix || 'XX'}-0001</p>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm font-josefin mb-4">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving || !newName || !newPrefix}
                className="px-4 py-2 rounded-lg bg-light-teal text-black font-josefin font-semibold hover:bg-light-teal/90 transition-all disabled:opacity-50"
              >
                {saving ? 'Creating...' : 'Create Prefix'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false)
                  setNewName('')
                  setNewPrefix('')
                  setError('')
                }}
                className="px-4 py-2 rounded-lg bg-white/10 text-white font-josefin hover:bg-white/20 transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Default Prefix Info */}
        <div className="mb-4 p-4 rounded-lg bg-black/30 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-josefin text-white">Default (INV)</span>
              <span className="ml-3 text-sm text-gray-400 font-josefin">Standard invoice prefix</span>
            </div>
            <div className="text-sm text-gray-400 font-josefin">
              Used when no custom prefix selected
            </div>
          </div>
        </div>

        {/* Custom Prefixes List */}
        {prefixes.length === 0 ? (
          <div className="text-center py-8 text-gray-400 font-josefin">
            <FileText size={40} className="mx-auto mb-3 opacity-50" />
            <p>No custom prefixes yet</p>
            <p className="text-sm">Add prefixes to organize invoices by income stream</p>
          </div>
        ) : (
          <div className="space-y-2">
            {prefixes.map((prefix) => (
              <div
                key={prefix.id}
                className="flex items-center justify-between p-4 rounded-lg bg-black/30 border border-light-teal/10 hover:border-light-teal/30 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-20 h-10 flex items-center justify-center rounded bg-light-teal/20 text-light-teal font-supernova">
                    {prefix.prefix}
                  </div>
                  <div>
                    <span className="font-josefin text-white">{prefix.name}</span>
                    <div className="text-sm text-gray-400 font-josefin">
                      Next: {prefix.prefix}-{prefix.nextNumber.toString().padStart(4, '0')}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-400 font-josefin">
                    {prefix._count.invoices} invoice{prefix._count.invoices !== 1 ? 's' : ''}
                  </span>
                  <button
                    onClick={() => handleDeletePrefix(prefix.id)}
                    disabled={prefix._count.invoices > 0}
                    className={`p-2 rounded-lg transition-all ${
                      prefix._count.invoices > 0
                        ? 'text-gray-600 cursor-not-allowed'
                        : 'text-red-400 hover:bg-red-500/20'
                    }`}
                    title={prefix._count.invoices > 0 ? 'Cannot delete prefix with invoices' : 'Delete prefix'}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
