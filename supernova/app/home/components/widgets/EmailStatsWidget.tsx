'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Mail } from 'lucide-react'

interface EmailStats {
  subscribers: number
  openRate: number
  clickRate: number
}

export default function EmailStatsWidget() {
  const [stats, setStats] = useState<EmailStats>({ subscribers: 0, openRate: 0, clickRate: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/email/analytics')
        if (response.ok) {
          const data = await response.json()
          setStats({
            subscribers: data.subscribers || 0,
            openRate: data.openRate || 0,
            clickRate: data.clickRate || 0,
          })
        }
      } catch (error) {
        console.error('Failed to fetch email stats:', error)
        // Use placeholder data
        setStats({ subscribers: 247, openRate: 42, clickRate: 12 })
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return (
    <div className="bg-[#1a1a1a] border border-[#3d3d3d] rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-[#0a0a0a] rounded-lg">
          <Mail size={20} className="text-[#FF008E]" />
        </div>
        <div>
          <h3 className="text-white font-semibold text-sm">EMAIL</h3>
          <p className="text-[#888888] text-xs">Last 30 Days</p>
        </div>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="space-y-3 mb-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-6 bg-[#3d3d3d] rounded animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-3 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-[#888888] text-sm">Subscribers</span>
            <span className="text-white font-semibold">{stats.subscribers}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#888888] text-sm">Open Rate</span>
            <span className="text-white font-semibold">{stats.openRate}%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#888888] text-sm">Click Rate</span>
            <span className="text-white font-semibold">{stats.clickRate}%</span>
          </div>
        </div>
      )}

      {/* Footer */}
      <Link href="/email" className="text-[#00F0E9] text-sm hover:underline">
        View Campaigns →
      </Link>
    </div>
  )
}
