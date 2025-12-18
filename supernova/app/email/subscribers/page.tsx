'use client'

import { useState, useEffect } from 'react'
import { Users, RefreshCw, Trash2, Download, Upload, CheckCircle } from 'lucide-react'

interface Subscriber {
  id: string
  email: string
  name: string | null
  tags: string[]
  status: string
  source: string | null
  createdAt: string
}

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState<any>(null)

  useEffect(() => {
    fetchSubscribers()
  }, [])

  const fetchSubscribers = async () => {
    try {
      const response = await fetch('/api/email/subscribers')
      if (response.ok) {
        const data = await response.json()
        setSubscribers(data)
      }
    } catch (error) {
      console.error('Failed to fetch subscribers:', error)
    } finally {
      setLoading(false)
    }
  }

  const syncFromCRM = async () => {
    setSyncing(true)
    setSyncResult(null)
    try {
      const response = await fetch('/api/email/sync-contacts', {
        method: 'POST',
      })
      if (response.ok) {
        const result = await response.json()
        setSyncResult(result)
        // Refresh subscribers list
        await fetchSubscribers()
      } else {
        alert('Failed to sync contacts')
      }
    } catch (error) {
      alert('Failed to sync contacts')
    } finally {
      setSyncing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-light-teal font-josefin">Loading subscribers...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-supernova text-light-teal">Email Subscribers</h2>
          <p className="text-sm text-gray-400 font-josefin">
            {subscribers.length} subscribers
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={syncFromCRM}
            disabled={syncing}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500/20 text-purple-400 font-josefin hover:bg-purple-500/30 transition-all disabled:opacity-50"
          >
            <RefreshCw size={18} className={syncing ? 'animate-spin' : ''} />
            {syncing ? 'Syncing...' : 'Sync from CRM'}
          </button>
        </div>
      </div>

      {/* Sync Result */}
      {syncResult && (
        <div className="backdrop-blur-xl bg-green-500/10 border border-green-500/30 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="text-green-400 mt-0.5" size={20} />
            <div>
              <h3 className="font-supernova text-white mb-1">Sync Complete!</h3>
              <p className="text-sm text-gray-300 font-josefin">
                {syncResult.message}
              </p>
              <div className="flex gap-4 mt-2 text-xs text-gray-400 font-josefin">
                <span>Total: {syncResult.totalContacts}</span>
                <span>New: {syncResult.syncedCount}</span>
                <span>Updated: {syncResult.skippedCount}</span>
                {syncResult.errorCount > 0 && (
                  <span className="text-red-400">Errors: {syncResult.errorCount}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subscribers Table */}
      {subscribers.length === 0 ? (
        <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-light-teal/20 p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-500/20 flex items-center justify-center">
            <Users className="text-purple-400" size={32} />
          </div>
          <h3 className="text-xl font-supernova text-white mb-2">No Subscribers Yet</h3>
          <p className="text-gray-400 font-josefin mb-4">
            Sync your CRM contacts to add them as email subscribers
          </p>
          <button
            onClick={syncFromCRM}
            disabled={syncing}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500/20 text-purple-400 font-josefin hover:bg-purple-500/30 transition-all"
          >
            <RefreshCw size={18} />
            Sync from CRM
          </button>
        </div>
      ) : (
        <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-light-teal/20 overflow-hidden">
          <table className="w-full">
            <thead className="bg-black/30">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-josefin text-gray-400 uppercase">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-josefin text-gray-400 uppercase">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-josefin text-gray-400 uppercase">
                  Tags
                </th>
                <th className="px-4 py-3 text-left text-xs font-josefin text-gray-400 uppercase">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-josefin text-gray-400 uppercase">
                  Source
                </th>
                <th className="px-4 py-3 text-left text-xs font-josefin text-gray-400 uppercase">
                  Added
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-teal/10">
              {subscribers.map((subscriber) => (
                <tr key={subscriber.id} className="hover:bg-white/5">
                  <td className="px-4 py-3 text-sm font-josefin text-white">
                    {subscriber.email}
                  </td>
                  <td className="px-4 py-3 text-sm font-josefin text-gray-300">
                    {subscriber.name || '-'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {subscriber.tags.slice(0, 3).map((tag, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 text-xs font-josefin"
                        >
                          {tag}
                        </span>
                      ))}
                      {subscriber.tags.length > 3 && (
                        <span className="text-xs text-gray-500 font-josefin">
                          +{subscriber.tags.length - 3}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-josefin ${
                        subscriber.status === 'active'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-gray-500/20 text-gray-400'
                      }`}
                    >
                      {subscriber.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-josefin text-gray-400">
                    {subscriber.source || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm font-josefin text-gray-400">
                    {new Date(subscriber.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
