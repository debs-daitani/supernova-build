'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { BarChart3 } from 'lucide-react'

interface QuizStats {
  active: number
  total: number
  thisWeek: number
  topQuiz: string
  topCount: number
}

export default function QuizStatsWidget() {
  const [stats, setStats] = useState<QuizStats>({
    active: 0,
    total: 0,
    thisWeek: 0,
    topQuiz: '',
    topCount: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // TODO: Replace with actual API call
        // Use placeholder data for now
        setStats({
          active: 2,
          total: 156,
          thisWeek: 23,
          topQuiz: 'AI Impact Authenticator',
          topCount: 89,
        })
      } catch (error) {
        console.error('Failed to fetch quiz stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return (
    <div className="bg-[#1a1a1a] border border-[#3d3d3d] rounded-xl p-6 col-span-2">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-[#0a0a0a] rounded-lg">
          <BarChart3 size={20} className="text-[#00F0E9]" />
        </div>
        <div>
          <h3 className="text-white font-semibold text-sm">QUIZ PERFORMANCE</h3>
        </div>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div className="grid grid-cols-3 gap-4 mb-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-[#3d3d3d] rounded animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-[#0a0a0a] rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-white">{stats.active}</p>
              <p className="text-[#888888] text-xs">Active Quizzes</p>
            </div>
            <div className="bg-[#0a0a0a] rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-white">{stats.total}</p>
              <p className="text-[#888888] text-xs">Total Completions</p>
            </div>
            <div className="bg-[#0a0a0a] rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-[#00F0E9]">+{stats.thisWeek}</p>
              <p className="text-[#888888] text-xs">This Week</p>
            </div>
          </div>

          {/* Top Performer */}
          {stats.topQuiz && (
            <div className="bg-[#0a0a0a] border border-[#3d3d3d] rounded-lg p-3 mb-4">
              <p className="text-[#888888] text-xs mb-1">TOP PERFORMER</p>
              <p className="text-white text-sm">
                {stats.topQuiz} - <span className="text-[#D3FF2C]">{stats.topCount} completions</span>
              </p>
            </div>
          )}
        </>
      )}

      {/* Footer */}
      <Link href="/admin/quiz/create" className="text-[#00F0E9] text-sm hover:underline">
        View Quiz Analytics →
      </Link>
    </div>
  )
}
