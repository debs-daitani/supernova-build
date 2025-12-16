'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

interface QuizAnalytics {
  quiz: {
    id: string
    title: string
    totalViews: number
    totalStarts: number
    totalCompletions: number
    createdAt: string
  }
  completionRate: number
  avgTimeSpent: number
  topResults: Array<{
    tierName: string
    count: number
    percentage: number
  }>
  recentResponses: Array<{
    id: string
    email: string
    name: string | null
    totalScore: number
    completedAt: string
    timeSpent: number
  }>
  dailyStats: Array<{
    date: string
    views: number
    starts: number
    completions: number
  }>
}

export default function QuizAnalyticsPage() {
  const params = useParams()
  const router = useRouter()
  const quizId = params.id as string

  const [analytics, setAnalytics] = useState<QuizAnalytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAnalytics()
  }, [quizId])

  const loadAnalytics = async () => {
    try {
      const response = await fetch(`/api/quiz/${quizId}/analytics`)
      const data = await response.json()

      if (data.success) {
        setAnalytics(data.analytics)
      }
    } catch (error) {
      console.error('Load analytics error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading analytics...</div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Analytics not found</div>
      </div>
    )
  }

  return (
    <div className="text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/home')}
            className="text-light-teal hover:text-hot-pink mb-4 font-josefin"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-4xl font-supernova text-transparent bg-clip-text bg-gradient-to-r from-hot-pink via-light-teal to-neon-lime mb-2">
            Quiz Analytics
          </h1>
          <p className="text-gray-400 font-josefin">{analytics.quiz.title}</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Views"
            value={analytics.quiz.totalViews}
            icon="👁️"
            color="hot-pink"
          />
          <MetricCard
            title="Quiz Starts"
            value={analytics.quiz.totalStarts}
            icon="▶️"
            color="light-teal"
          />
          <MetricCard
            title="Completions"
            value={analytics.quiz.totalCompletions}
            icon="✅"
            color="neon-lime"
          />
          <MetricCard
            title="Completion Rate"
            value={`${analytics.completionRate.toFixed(1)}%`}
            icon="📊"
            color="mid-teal"
          />
        </div>

        {/* Avg Time Spent */}
        <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-light-teal/20 p-6 mb-8">
          <div className="text-sm text-gray-400 mb-2 font-josefin">Average Time Spent</div>
          <div className="text-3xl font-supernova text-light-teal">
            {formatTime(analytics.avgTimeSpent)}
          </div>
        </div>

        {/* Top Results */}
        {analytics.topResults.length > 0 && (
          <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-light-teal/20 p-6 mb-8">
            <h2 className="text-2xl font-supernova text-light-teal mb-6">Top Results</h2>
            <div className="space-y-4">
              {analytics.topResults.map((result, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="font-josefin text-lg mb-2">{result.tierName}</div>
                    <div className="w-full h-3 bg-charcoal/60 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-hot-pink to-light-teal"
                        style={{ width: `${result.percentage}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-supernova text-light-teal">{result.count}</div>
                    <div className="text-xs text-gray-400 font-josefin">
                      {result.percentage.toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Daily Stats Chart */}
        {analytics.dailyStats.length > 0 && (
          <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-light-teal/20 p-6 mb-8">
            <h2 className="text-2xl font-supernova text-light-teal mb-6">Daily Performance</h2>
            <div className="space-y-3">
              {analytics.dailyStats.slice(0, 7).map((stat) => (
                <div key={stat.date} className="flex items-center gap-4">
                  <div className="w-24 text-sm text-gray-400 font-josefin">
                    {new Date(stat.date).toLocaleDateString('en-GB', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </div>
                  <div className="flex-1 grid grid-cols-3 gap-4 text-sm font-josefin">
                    <div>
                      <span className="text-gray-400">Views:</span>{' '}
                      <span className="text-hot-pink font-bold">{stat.views}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Starts:</span>{' '}
                      <span className="text-light-teal font-bold">{stat.starts}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Completions:</span>{' '}
                      <span className="text-neon-lime font-bold">{stat.completions}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Responses */}
        <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-light-teal/20 p-6">
          <h2 className="text-2xl font-supernova text-light-teal mb-6">Recent Responses</h2>

          {analytics.recentResponses.length === 0 ? (
            <div className="text-gray-400 font-josefin text-center py-8">
              No responses yet
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-gray-400 font-josefin border-b border-light-teal/20">
                    <th className="pb-3">Email</th>
                    <th className="pb-3">Name</th>
                    <th className="pb-3">Score</th>
                    <th className="pb-3">Time Spent</th>
                    <th className="pb-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.recentResponses.map((response) => (
                    <tr
                      key={response.id}
                      className="border-b border-light-teal/10 font-josefin text-sm"
                    >
                      <td className="py-3">{response.email}</td>
                      <td className="py-3 text-gray-400">{response.name || '-'}</td>
                      <td className="py-3">
                        <span className="text-light-teal font-bold">{response.totalScore}</span>
                      </td>
                      <td className="py-3 text-gray-400">
                        {formatTime(response.timeSpent || 0)}
                      </td>
                      <td className="py-3 text-gray-400">
                        {new Date(response.completedAt).toLocaleDateString('en-GB')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function MetricCard({
  title,
  value,
  icon,
  color,
}: {
  title: string
  value: string | number
  icon: string
  color: string
}) {
  return (
    <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-light-teal/20 p-6">
      <div className="flex items-center gap-3 mb-3">
        <div className="text-2xl">{icon}</div>
        <div className="text-sm text-gray-400 font-josefin">{title}</div>
      </div>
      <div className={`text-3xl font-supernova text-${color}`}>{value}</div>
    </div>
  )
}

function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  if (remainingSeconds === 0) return `${minutes}m`
  return `${minutes}m ${remainingSeconds}s`
}
