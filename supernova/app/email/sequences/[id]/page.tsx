'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Trash2, Play, Pause } from 'lucide-react'
import Link from 'next/link'

export default function SequenceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [sequence, setSequence] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSequence()
  }, [params.id])

  const fetchSequence = async () => {
    try {
      const res = await fetch(`/api/email/sequences/${params.id}`)
      const data = await res.json()
      setSequence(data)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleStatus = async () => {
    const newStatus = sequence.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE'
    try {
      await fetch(`/api/email/sequences/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      fetchSequence()
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this sequence?')) return
    try {
      await fetch(`/api/email/sequences/${params.id}`, { method: 'DELETE' })
      router.push('/email/sequences')
    } catch (error) {
      console.error('Error:', error)
    }
  }

  if (loading) return <div className="text-white font-josefin">Loading...</div>
  if (!sequence) return <div className="text-white font-josefin">Sequence not found</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/email/sequences" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h2 className="text-2xl font-supernova text-white">{sequence.name}</h2>
            <p className="text-sm text-gray-400 font-josefin">{sequence.description}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-josefin ${
            sequence.status === 'ACTIVE' ? 'bg-green-500/10 text-green-400' :
            sequence.status === 'PAUSED' ? 'bg-yellow-500/10 text-yellow-400' :
            'bg-gray-500/10 text-gray-400'
          }`}>
            {sequence.status}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={toggleStatus}
            className="px-4 py-2 rounded-lg bg-light-teal/10 hover:bg-light-teal/20 text-light-teal font-josefin flex items-center gap-2"
          >
            {sequence.status === 'ACTIVE' ? <Pause size={16} /> : <Play size={16} />}
            {sequence.status === 'ACTIVE' ? 'Pause' : 'Activate'}
          </button>
          <button onClick={handleDelete} className="px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 font-josefin">
            Delete
          </button>
        </div>
      </div>

      <div className="backdrop-blur-xl bg-white/5 border border-hot-pink/20 rounded-2xl p-6">
        <h3 className="text-xl font-supernova text-hot-pink mb-4">Trigger Settings</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-josefin text-gray-400 mb-1">Trigger Type</label>
            <p className="text-white font-josefin">{sequence.triggerType}</p>
          </div>
          {sequence.triggerValue && (
            <div>
              <label className="block text-sm font-josefin text-gray-400 mb-1">Trigger Value</label>
              <p className="text-white font-josefin">{sequence.triggerValue}</p>
            </div>
          )}
        </div>
      </div>

      <div className="backdrop-blur-xl bg-white/5 border border-hot-pink/20 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-supernova text-hot-pink">Email Steps</h3>
          <span className="text-sm text-gray-400 font-josefin">{sequence.emails?.length || 0} emails</span>
        </div>
        <div className="space-y-4">
          {sequence.emails && sequence.emails.length > 0 ? (
            sequence.emails.map((email: any, index: number) => (
              <div key={email.id} className="p-4 rounded-lg bg-white/5 border border-light-teal/10">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="w-8 h-8 rounded-full bg-light-teal/20 text-light-teal flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </span>
                      <div>
                        <p className="text-white font-josefin font-bold">{email.subject}</p>
                        {(email.delayDays > 0 || email.delayHours > 0) && (
                          <p className="text-sm text-gray-400 font-josefin">
                            Wait {email.delayDays > 0 && `${email.delayDays} days`} {email.delayHours > 0 && `${email.delayHours} hours`}
                          </p>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-400 font-josefin ml-11 line-clamp-2">{email.previewText || 'No preview'}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-400 font-josefin text-center py-8">No emails in this sequence yet</p>
          )}
        </div>
      </div>

      {sequence.stats && (
        <div className="backdrop-blur-xl bg-white/5 border border-hot-pink/20 rounded-2xl p-6">
          <h3 className="text-xl font-supernova text-hot-pink mb-4">Performance</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-3xl font-supernova text-white">{sequence.stats.totalEnrollments}</p>
              <p className="text-sm text-gray-400 font-josefin">Total Enrollments</p>
            </div>
            <div>
              <p className="text-3xl font-supernova text-white">{sequence.stats.uniqueEnrollments}</p>
              <p className="text-sm text-gray-400 font-josefin">Unique Subscribers</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
