'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Users, Mail } from 'lucide-react'
import Link from 'next/link'

export default function ListDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [list, setList] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({ name: '', description: '' })

  useEffect(() => {
    fetchList()
  }, [params.id])

  const fetchList = async () => {
    try {
      const res = await fetch(`/api/email/lists/${params.id}`)
      const data = await res.json()
      setList(data)
      setFormData({ name: data.name, description: data.description || '' })
    } catch (error) {
      console.error('Error fetching list:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch(`/api/email/lists/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      if (res.ok) {
        setEditing(false)
        fetchList()
      }
    } catch (error) {
      console.error('Error updating list:', error)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this list?')) return
    try {
      await fetch(`/api/email/lists/${params.id}`, { method: 'DELETE' })
      router.push('/email/lists')
    } catch (error) {
      console.error('Error deleting list:', error)
    }
  }

  if (loading) return <div className="text-white font-josefin">Loading...</div>
  if (!list) return <div className="text-white font-josefin">List not found</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/email/lists" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h2 className="text-2xl font-supernova text-white">{list.name}</h2>
            <p className="text-sm text-gray-400 font-josefin flex items-center gap-2">
              <Users size={14} />
              {list.subscriberCount} subscribers
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setEditing(!editing)} className="px-4 py-2 rounded-lg bg-light-teal/10 hover:bg-light-teal/20 text-light-teal font-josefin transition-all">
            {editing ? 'Cancel' : 'Edit'}
          </button>
          <button onClick={handleDelete} className="px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 font-josefin transition-all">
            Delete
          </button>
        </div>
      </div>

      <div className="backdrop-blur-xl bg-white/5 border border-hot-pink/20 rounded-2xl p-6">
        {editing ? (
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-josefin text-gray-400 mb-2">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-black/50 border border-light-teal/20 text-white font-josefin"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-josefin text-gray-400 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-black/50 border border-light-teal/20 text-white font-josefin"
                rows={3}
              />
            </div>
            <button type="submit" className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-hot-pink to-light-teal text-black font-bold font-josefin">
              Save Changes
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-josefin text-gray-400 mb-1">Description</label>
              <p className="text-white font-josefin">{list.description || 'No description'}</p>
            </div>
          </div>
        )}
      </div>

      <div className="backdrop-blur-xl bg-white/5 border border-hot-pink/20 rounded-2xl p-6">
        <h3 className="text-xl font-supernova text-hot-pink mb-4">Subscribers</h3>
        <div className="space-y-2">
          {list.subscribers && list.subscribers.length > 0 ? (
            list.subscribers.map((item: any) => (
              <Link
                key={item.subscriber.id}
                href={`/email/subscribers/${item.subscriber.id}`}
                className="block p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-josefin">
                      {item.subscriber.firstName || item.subscriber.lastName
                        ? `${item.subscriber.firstName || ''} ${item.subscriber.lastName || ''}`
                        : item.subscriber.email}
                    </p>
                    <p className="text-sm text-gray-400 font-josefin">{item.subscriber.email}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-josefin ${
                    item.subscriber.status === 'SUBSCRIBED' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                  }`}>
                    {item.subscriber.status}
                  </span>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-gray-400 font-josefin">No subscribers yet</p>
          )}
        </div>
      </div>
    </div>
  )
}
