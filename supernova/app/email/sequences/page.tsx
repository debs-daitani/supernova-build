'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Workflow, Plus, Play, Pause } from 'lucide-react'

export default function SequencesPage() {
  const [sequences, setSequences] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSequences()
  }, [])

  const fetchSequences = async () => {
    try {
      const res = await fetch('/api/email/sequences')
      const data = await res.json()
      setSequences(data)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="text-white font-josefin">Loading...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-supernova text-white">Email Sequences</h2>
          <p className="text-sm text-gray-400 font-josefin">Automated drip campaigns</p>
        </div>
        <Link
          href="/email/sequences/create"
          className="px-6 py-3 rounded-lg bg-gradient-to-r from-hot-pink to-light-teal text-black font-bold font-josefin flex items-center gap-2"
        >
          <Plus size={20} />
          Create Sequence
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sequences.map((sequence) => (
          <Link
            key={sequence.id}
            href={`/email/sequences/${sequence.id}`}
            className="backdrop-blur-xl bg-white/5 border border-hot-pink/20 rounded-2xl p-6 hover:bg-white/10 transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <Workflow className="text-light-teal" size={32} />
              <span className={`px-3 py-1 rounded-full text-xs font-josefin ${
                sequence.status === 'ACTIVE' ? 'bg-green-500/10 text-green-400' :
                sequence.status === 'PAUSED' ? 'bg-yellow-500/10 text-yellow-400' :
                'bg-gray-500/10 text-gray-400'
              }`}>
                {sequence.status}
              </span>
            </div>
            <h3 className="text-xl font-supernova text-white mb-2">{sequence.name}</h3>
            <p className="text-sm text-gray-400 font-josefin mb-4 line-clamp-2">{sequence.description || 'No description'}</p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400 font-josefin">{sequence.emails?.length || 0} emails</span>
              <span className="text-light-teal font-josefin">{sequence.triggerType}</span>
            </div>
          </Link>
        ))}
      </div>

      {sequences.length === 0 && (
        <div className="backdrop-blur-xl bg-white/5 border border-hot-pink/20 rounded-2xl p-12 text-center">
          <Workflow className="mx-auto text-gray-600 mb-4" size={64} />
          <h3 className="text-xl font-supernova text-white mb-2">No sequences yet</h3>
          <p className="text-gray-400 font-josefin mb-6">Create your first automated email sequence</p>
          <Link
            href="/email/sequences/create"
            className="inline-block px-6 py-3 rounded-lg bg-gradient-to-r from-hot-pink to-light-teal text-black font-bold font-josefin"
          >
            Create Sequence
          </Link>
        </div>
      )}
    </div>
  )
}
