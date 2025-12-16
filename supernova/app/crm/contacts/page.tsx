'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, Filter, Mail, Phone, Building, Tag, Trash2 } from 'lucide-react'

interface Contact {
  id: string
  firstName: string
  lastName?: string
  email: string
  phone?: string
  company?: string
  status: string
  source: string
  tags: string[]
  createdAt: string
  assignedTo?: { id: string; name: string }
  _count: { activities: number; deals: number; tasks: number }
}

export default function ContactsPage() {
  const router = useRouter()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [sourceFilter, setSourceFilter] = useState('ALL')
  const [showNewModal, setShowNewModal] = useState(false)
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set())
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchContacts()
  }, [search, statusFilter, sourceFilter])

  const fetchContacts = async () => {
    try {
      const params = new URLSearchParams({
        search,
        status: statusFilter,
        source: sourceFilter,
      })
      const response = await fetch(`/api/crm/contacts?${params}`)
      if (response.ok) {
        const data = await response.json()
        setContacts(data.contacts)
      }
    } catch (error) {
      console.error('Failed to fetch contacts:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      LEAD: 'text-neon-lime',
      PROSPECT: 'text-light-teal',
      CUSTOMER: 'text-hot-pink',
      INACTIVE: 'text-gray-500',
    }
    return colors[status] || 'text-gray-400'
  }

  // Helper to format full name
  const getFullName = (contact: Contact) => {
    return contact.lastName
      ? `${contact.firstName} ${contact.lastName}`
      : contact.firstName
  }

  // Selection handlers
  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const newSelected = new Set(selectedContacts)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedContacts(newSelected)
  }

  const toggleSelectAll = () => {
    if (selectedContacts.size === contacts.length) {
      setSelectedContacts(new Set())
    } else {
      setSelectedContacts(new Set(contacts.map(c => c.id)))
    }
  }

  const handleBulkDelete = async () => {
    if (selectedContacts.size === 0) return

    const confirmed = confirm(`Are you sure you want to delete ${selectedContacts.size} contact(s)? This cannot be undone.`)
    if (!confirmed) return

    setDeleting(true)
    try {
      const response = await fetch('/api/crm/contacts', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selectedContacts) }),
      })

      if (response.ok) {
        const result = await response.json()
        setSelectedContacts(new Set())
        fetchContacts()
      } else {
        alert('Failed to delete contacts')
      }
    } catch (error) {
      alert('Failed to delete contacts')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-light-teal font-josefin">Loading contacts...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-supernova text-light-teal">Contacts</h2>
          <p className="text-sm text-gray-400 font-josefin">{contacts.length} contacts</p>
        </div>
        <div className="flex items-center gap-3">
          {selectedContacts.size > 0 && (
            <button
              onClick={handleBulkDelete}
              disabled={deleting}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/20 border border-red-500/50 text-red-400 font-josefin hover:bg-red-500/30 transition-all disabled:opacity-50"
            >
              <Trash2 size={20} />
              {deleting ? 'Deleting...' : `Delete (${selectedContacts.size})`}
            </button>
          )}
          <button
            onClick={() => setShowNewModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-hot-pink to-light-teal text-white font-josefin hover:shadow-[0_0_20px_rgba(255,0,142,0.5)] transition-all"
          >
            <Plus size={20} />
            New Contact
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-light-teal/20 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search contacts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-black/50 border border-light-teal/20 text-white placeholder-gray-500 font-josefin focus:outline-none focus:border-light-teal"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 rounded-lg bg-black/50 border border-light-teal/20 text-white font-josefin focus:outline-none focus:border-light-teal"
          >
            <option value="ALL">All Status</option>
            <option value="LEAD">Lead</option>
            <option value="PROSPECT">Prospect</option>
            <option value="CUSTOMER">Customer</option>
            <option value="INACTIVE">Inactive</option>
          </select>

          {/* Source Filter */}
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="px-4 py-2 rounded-lg bg-black/50 border border-light-teal/20 text-white font-josefin focus:outline-none focus:border-light-teal"
          >
            <option value="ALL">All Sources</option>
            <option value="QUIZ">Quiz</option>
            <option value="MANUAL">Manual</option>
            <option value="IMPORT">Import</option>
            <option value="API">API</option>
          </select>
        </div>
      </div>

      {/* Contacts Table */}
      <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-light-teal/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-light-teal/20">
              <tr>
                <th className="px-4 py-3 w-12">
                  <input
                    type="checkbox"
                    checked={contacts.length > 0 && selectedContacts.size === contacts.length}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-light-teal/30 bg-black/50 text-hot-pink focus:ring-hot-pink/50 cursor-pointer"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-supernova text-light-teal uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-supernova text-light-teal uppercase">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-supernova text-light-teal uppercase">Company</th>
                <th className="px-6 py-3 text-left text-xs font-supernova text-light-teal uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-supernova text-light-teal uppercase">Source</th>
                <th className="px-6 py-3 text-left text-xs font-supernova text-light-teal uppercase">Activity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {contacts.map((contact) => (
                <tr
                  key={contact.id}
                  onClick={() => router.push(`/crm/contacts/${contact.id}`)}
                  className={`hover:bg-white/5 cursor-pointer transition-colors ${selectedContacts.has(contact.id) ? 'bg-hot-pink/10' : ''}`}
                >
                  <td className="px-4 py-4" onClick={(e) => toggleSelect(contact.id, e)}>
                    <input
                      type="checkbox"
                      checked={selectedContacts.has(contact.id)}
                      onChange={() => {}}
                      className="w-4 h-4 rounded border-light-teal/30 bg-black/50 text-hot-pink focus:ring-hot-pink/50 cursor-pointer"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <div className="font-josefin text-white">{getFullName(contact)}</div>
                      {contact.tags.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {contact.tags.slice(0, 2).map((tag, i) => (
                            <span
                              key={i}
                              className="text-xs px-2 py-0.5 rounded-full bg-light-teal/20 text-light-teal font-josefin"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1 text-sm font-josefin">
                      <div className="flex items-center gap-2 text-gray-400">
                        <Mail size={14} />
                        {contact.email}
                      </div>
                      {contact.phone && (
                        <div className="flex items-center gap-2 text-gray-400">
                          <Phone size={14} />
                          {contact.phone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {contact.company ? (
                      <div className="flex items-center gap-2 text-gray-300 font-josefin">
                        <Building size={16} />
                        {contact.company}
                      </div>
                    ) : (
                      <span className="text-gray-500 font-josefin">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`font-josefin font-semibold ${getStatusColor(contact.status)}`}>
                      {contact.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-400 font-josefin text-sm">{contact.source}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-3 text-xs font-josefin text-gray-400">
                      <span>{contact._count.deals} deals</span>
                      <span>{contact._count.tasks} tasks</span>
                      <span>{contact._count.activities} notes</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {contacts.length === 0 && (
          <div className="py-12 text-center text-gray-400 font-josefin">
            No contacts found. Create your first contact to get started.
          </div>
        )}
      </div>

      {/* New Contact Modal */}
      {showNewModal && (
        <NewContactModal
          onClose={() => setShowNewModal(false)}
          onSuccess={() => {
            setShowNewModal(false)
            fetchContacts()
          }}
        />
      )}
    </div>
  )
}

function NewContactModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    status: 'LEAD',
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch('/api/crm/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        onSuccess()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to create contact')
      }
    } catch (error) {
      alert('Failed to create contact')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="backdrop-blur-xl bg-white/10 rounded-2xl border border-light-teal/20 p-6 max-w-lg w-full">
        <h3 className="text-2xl font-supernova text-light-teal mb-4">New Contact</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-josefin text-gray-300 mb-1">First Name *</label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-black/50 border border-light-teal/20 text-white font-josefin focus:outline-none focus:border-light-teal"
              />
            </div>
            <div>
              <label className="block text-sm font-josefin text-gray-300 mb-1">Last Name</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-black/50 border border-light-teal/20 text-white font-josefin focus:outline-none focus:border-light-teal"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-josefin text-gray-300 mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 rounded-lg bg-black/50 border border-light-teal/20 text-white font-josefin focus:outline-none focus:border-light-teal"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-josefin text-gray-300 mb-1">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-black/50 border border-light-teal/20 text-white font-josefin focus:outline-none focus:border-light-teal"
              />
            </div>
            <div>
              <label className="block text-sm font-josefin text-gray-300 mb-1">Company</label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-black/50 border border-light-teal/20 text-white font-josefin focus:outline-none focus:border-light-teal"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-josefin text-gray-300 mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-4 py-2 rounded-lg bg-black/50 border border-light-teal/20 text-white font-josefin focus:outline-none focus:border-light-teal"
            >
              <option value="LEAD">Lead</option>
              <option value="PROSPECT">Prospect</option>
              <option value="CUSTOMER">Customer</option>
            </select>
          </div>
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-josefin transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-hot-pink to-light-teal text-white font-josefin hover:shadow-[0_0_20px_rgba(255,0,142,0.5)] transition-all disabled:opacity-50"
            >
              {saving ? 'Creating...' : 'Create Contact'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
