'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Eye,
  PlayCircle,
  CheckCircle,
  TrendingUp,
  Clock,
  BarChart3,
  Download,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { formatTimeSpent } from '@/lib/quiz-utils'

export default function QuizAnalyticsPage() {
  const params = useParams()
  const router = useRouter()
  const quizId = params.id as string

  const [quiz, setQuiz] = useState<any>(null)
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (quizId) {
      fetchQuiz()
      fetchAnalytics()
    }
  }, [quizId])

  const fetchQuiz = async () => {
    try {
      const res = await fetch(`/api/quizzes/${quizId}`)
      const data = await res.json()
      setQuiz(data)
    } catch (error) {
      console.error('Error fetching quiz:', error)
    }
  }

  const fetchAnalytics = async () => {
    try {
      const res = await fetch(`/api/quizzes/${quizId}/analytics`)
      const data = await res.json()
      setAnalytics(data)
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-orange-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (!quiz || !analytics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Quiz not found</h2>
          <Link href="/quizzes">
            <Button>Back to Quizzes</Button>
          </Link>
        </div>
      </div>
    )
  }

  const { overview, questionStats, dailyStats, completionTrend } = analytics

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-orange-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/quizzes" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Quizzes
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-orange-500 bg-clip-text text-transparent mb-2">
                Analytics
              </h1>
              <p className="text-gray-600">{quiz.title}</p>
            </div>
            <div className="flex gap-2">
              <Link href={`/quizzes/${quizId}/responses`}>
                <Button variant="outline">
                  <Eye className="w-4 h-4 mr-2" />
                  View Responses
                </Button>
              </Link>
              <Link href={`/quizzes/${quizId}/builder`}>
                <Button variant="outline">Edit Quiz</Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Total Views</span>
              <Eye className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-3xl font-bold text-blue-600">{overview.totalViews}</div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Starts</span>
              <PlayCircle className="w-5 h-5 text-purple-500" />
            </div>
            <div className="text-3xl font-bold text-purple-600">{overview.totalStarts}</div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Completions</span>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-green-600">{overview.totalCompletions}</div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Completion Rate</span>
              <TrendingUp className="w-5 h-5 text-orange-500" />
            </div>
            <div className="text-3xl font-bold text-orange-600">{overview.completionRate}%</div>
          </Card>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <h3 className="font-bold mb-4">Average Score</h3>
            <div className="text-4xl font-bold text-purple-600 mb-2">{overview.avgScore}</div>
            <p className="text-sm text-gray-600">Out of 100 points</p>
          </Card>

          <Card className="p-6">
            <h3 className="font-bold mb-4">Average Time</h3>
            <div className="text-4xl font-bold text-blue-600 mb-2">
              {formatTimeSpent(overview.avgTimeSpent)}
            </div>
            <p className="text-sm text-gray-600">To complete quiz</p>
          </Card>

          <Card className="p-6">
            <h3 className="font-bold mb-4">Drop-off Rate</h3>
            <div className="text-4xl font-bold text-red-600 mb-2">{overview.dropOffRate}%</div>
            <p className="text-sm text-gray-600">Started but didn't finish</p>
          </Card>
        </div>

        {/* Completion Trend Chart */}
        {completionTrend && completionTrend.length > 0 && (
          <Card className="p-6 mb-8">
            <h3 className="font-bold text-xl mb-6">Completions Over Time</h3>
            <div className="h-64 flex items-end gap-2">
              {completionTrend.map((item: any, index: number) => {
                const maxCount = Math.max(...completionTrend.map((t: any) => t.count))
                const height = maxCount > 0 ? (item.count / maxCount) * 100 : 0

                return (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-gradient-to-t from-pink-500 to-purple-500 rounded-t transition-all hover:opacity-80"
                      style={{ height: `${height}%`, minHeight: item.count > 0 ? '20px' : '0' }}
                      title={`${item.date}: ${item.count} completions`}
                    />
                    <div className="text-xs text-gray-600 mt-2 truncate w-full text-center">
                      {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                    <div className="text-xs font-semibold text-purple-600">{item.count}</div>
                  </div>
                )
              })}
            </div>
          </Card>
        )}

        {/* Question-level Stats */}
        <Card className="p-6 mb-8">
          <h3 className="font-bold text-xl mb-6">Question Performance</h3>
          <div className="space-y-6">
            {questionStats.map((stat: any, index: number) => (
              <div key={stat.questionId} className="border-b pb-6 last:border-b-0">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="font-semibold mb-1">
                      Q{index + 1}: {stat.questionText}
                    </div>
                    <div className="text-sm text-gray-600 capitalize">
                      {stat.questionType.replace(/_/g, ' ').toLowerCase()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-purple-600">{stat.answerCount}</div>
                    <div className="text-sm text-gray-600">answers</div>
                  </div>
                </div>

                {stat.popularAnswers && stat.popularAnswers.length > 0 && (
                  <div className="mt-3">
                    <div className="text-sm font-medium mb-2">Popular Answers:</div>
                    <div className="space-y-2">
                      {stat.popularAnswers.map((answer: any, i: number) => {
                        const percentage = stat.answerCount > 0
                          ? Math.round((answer.count / stat.answerCount) * 100)
                          : 0

                        return (
                          <div key={i} className="flex items-center gap-3">
                            <div className="flex-1">
                              <div className="flex items-center justify-between text-sm mb-1">
                                <span className="text-gray-700">{answer.answer}</span>
                                <span className="font-semibold text-purple-600">
                                  {answer.count} ({percentage}%)
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-gradient-to-r from-pink-500 to-purple-500 h-2 rounded-full"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Daily Stats Table */}
        {dailyStats && dailyStats.length > 0 && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-xl">Daily Statistics</h3>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Date</th>
                    <th className="text-right py-3 px-4">Views</th>
                    <th className="text-right py-3 px-4">Starts</th>
                    <th className="text-right py-3 px-4">Completions</th>
                    <th className="text-right py-3 px-4">Avg Score</th>
                    <th className="text-right py-3 px-4">Avg Time</th>
                  </tr>
                </thead>
                <tbody>
                  {dailyStats.map((stat: any, index: number) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        {new Date(stat.date).toLocaleDateString()}
                      </td>
                      <td className="text-right py-3 px-4">{stat.views}</td>
                      <td className="text-right py-3 px-4">{stat.starts}</td>
                      <td className="text-right py-3 px-4">{stat.completions}</td>
                      <td className="text-right py-3 px-4">
                        {stat.avgScore ? Math.round(stat.avgScore) : '-'}
                      </td>
                      <td className="text-right py-3 px-4">
                        {stat.avgTimeSpent ? formatTimeSpent(stat.avgTimeSpent) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
