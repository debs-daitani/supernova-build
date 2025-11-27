'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Mail, Calendar, Tag, Activity } from 'lucide-react'
import Link from 'next/link'

interface Subscriber {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  status: string
  source: string
  tags: string[]
  customFields: any
  subscribedAt: string
  unsubscribedAt: string | null
  lists: Array<{
    list: {
      id: string
      name: string
    }
  }>
  events: Array<{
    id: string
    type: string
    createdAt: string
    campaign?: {
      name: string
    }
  }>
}

export default function SubscriberDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [subscriber, setSubscriber] = useState<Subscriber | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    tags: [] as string[],
    status: 'SUBSCRIBED'
  })

  useEffect(() => {
    fetchSubscriber()
  }, [params.id])

  const fetchSubscriber = async () => {
    try {
      const res = await fetch(`/api/email/subscribers/${params.id}`)
      const data = await res.json()
      setSubscriber(data)
      setFormData({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        tags: data.tags || [],
        status: data.status
      })
    } catch (error) {
      console.error('Error fetching subscriber:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch(`/api/email/subscribers/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        setEditing(false)
        fetchSubscriber()
      }
    } catch (error) {
      console.error('Error updating subscriber:', error)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this subscriber?')) return

    try {
      const res = await fetch(`/api/email/subscribers/${params.id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        router.push('/email/subscribers')
      }
    } catch (error) {
      console.error('Error deleting subscriber:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-white text-xl font-josefin">Loading...</div>
      </div>
    )
  }

  if (!subscriber) {
    return (
      <div className="backdrop-blur-xl bg-white/5 border border-hot-pink/20 rounded-2xl p-8">
        <p className="text-white font-josefin">Subscriber not found</p>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUBSCRIBED':
        return 'text-green-400 bg-green-400/10'
      case 'UNSUBSCRIBED':
        return 'text-red-400 bg-red-400/10'
      case 'BOUNCED':
        return 'text-yellow-400 bg-yellow-400/10'
      default:
        return 'text-gray-400 bg-gray-400/10'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/email/subscribers"
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h2 className="text-2xl font-supernova text-white">
              {subscriber.firstName || subscriber.lastName
                ? `${subscriber.firstName || ''} ${subscriber.lastName || ''}`
                : subscriber.email}
            </h2>
            <p className="text-sm text-gray-400 font-josefin flex items-center gap-2">
              <Mail size={14} />
              {subscriber.email}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-josefin ${getStatusColor(subscriber.status)}`}>
            {subscriber.status}
          </span>
        </div>
        <button
          onClick={handleDelete}
          className="px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 font-josefin transition-all"
        >
          Delete
        </button>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="backdrop-blur-xl bg-white/5 border border-hot-pink/20 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-supernova text-hot-pink">Profile</h3>
              <button
                onClick={() => setEditing(!editing)}
                className="px-4 py-2 rounded-lg bg-light-teal/10 hover:bg-light-teal/20 text-light-teal font-josefin transition-all"
              >
                {editing ? 'Cancel' : 'Edit'}
              </button>
            </div>

            {editing ? (
              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-josefin text-gray-400 mb-2">First Name</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-black/50 border border-light-teal/20 text-white font-josefin focus:outline-none focus:border-light-teal"
                  />
                </div>
                <div>
                  <label className="block text-sm font-josefin text-gray-400 mb-2">Last Name</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-black/50 border border-light-teal/20 text-white font-josefin focus:outline-none focus:border-light-teal"
                  />
                </div>
                <div>
                  <label className="block text-sm font-josefin text-gray-400 mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-black/50 border border-light-teal/20 text-white font-josefin focus:outline-none focus:border-light-teal"
                  >
                    <option value="SUBSCRIBED">Subscribed</option>
                    <option value="UNSUBSCRIBED">Unsubscribed</option>
                    <option value="BOUNCED">Bounced</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-hot-pink to-light-teal text-black font-bold font-josefin hover:shadow-lg hover:shadow-hot-pink/50 transition-all"
                >
                  Save Changes
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-josefin text-gray-400 mb-1">Email</label>
                  <p className="text-white font-josefin">{subscriber.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-josefin text-gray-400 mb-1">Name</label>
                  <p className="text-white font-josefin">
                    {subscriber.firstName || subscriber.lastName
                      ? `${subscriber.firstName || ''} ${subscriber.lastName || ''}`
                      : 'Not set'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-josefin text-gray-400 mb-1">Source</label>
                  <p className="text-white font-josefin">{subscriber.source}</p>
                </div>
                <div>
                  <label className="block text-sm font-josefin text-gray-400 mb-1">Subscribed At</label>
                  <p className="text-white font-josefin">
                    {new Date(subscriber.subscribedAt).toLocaleDateString()}
                  </p>
                </div>
                {subscriber.tags && subscriber.tags.length > 0 && (
                  <div>
                    <label className="block text-sm font-josefin text-gray-400 mb-2">Tags</label>
                    <div className="flex flex-wrap gap-2">
                      {subscriber.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 rounded-full bg-neon-lime/10 text-neon-lime text-sm font-josefin"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Activity Timeline */}
          <div className="backdrop-blur-xl bg-white/5 border border-hot-pink/20 rounded-2xl p-6">
            <h3 className="text-xl font-supernova text-hot-pink mb-6 flex items-center gap-2">
              <Activity size={20} />
              Activity Timeline
            </h3>
            <div className="space-y-4">
              {subscriber.events && subscriber.events.length > 0 ? (
                subscriber.events.map((event) => (
                  <div key={event.id} className="flex gap-4 pb-4 border-b border-white/5 last:border-0">
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 rounded-full bg-light-teal mt-2"></div>
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-josefin">{event.type}</p>
                      {event.campaign && (
                        <p className="text-sm text-gray-400 font-josefin">{event.campaign.name}</p>
                      )}
                      <p className="text-xs text-gray-500 font-josefin mt-1">
                        {new Date(event.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 font-josefin">No activity yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Lists */}
          <div className="backdrop-blur-xl bg-white/5 border border-hot-pink/20 rounded-2xl p-6">
            <h3 className="text-xl font-supernova text-hot-pink mb-4">Lists</h3>
            <div className="space-y-2">
              {subscriber.lists && subscriber.lists.length > 0 ? (
                subscriber.lists.map((item) => (
                  <Link
                    key={item.list.id}
                    href={`/email/lists/${item.list.id}`}
                    className="block p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all"
                  >
                    <p className="text-white font-josefin">{item.list.name}</p>
                  </Link>
                ))
              ) : (
                <p className="text-gray-400 font-josefin text-sm">Not in any lists</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
