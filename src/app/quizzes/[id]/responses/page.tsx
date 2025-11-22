'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Download, Search, Filter, Eye, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { formatTimeSpent, exportToCSV } from '@/lib/quiz-utils'

export default function QuizResponsesPage() {
  const params = useParams()
  const router = useRouter()
  const quizId = params.id as string

  const [quiz, setQuiz] = useState<any>(null)
  const [responses, setResponses] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedResponse, setSelectedResponse] = useState<any>(null)

  useEffect(() => {
    if (quizId) {
      fetchQuiz()
      fetchResponses()
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

  const fetchResponses = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/quizzes/${quizId}/responses?limit=100`)
      const data = await res.json()
      setResponses(data.responses || [])
      setTotal(data.total || 0)
    } catch (error) {
      console.error('Error fetching responses:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = () => {
    if (!quiz || responses.length === 0) return

    const csv = exportToCSV(responses, quiz.questions)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${quiz.slug}-responses-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  const filteredResponses = responses.filter((response) => {
    if (!searchTerm) return true
    const name = response.respondentName?.toLowerCase() || ''
    const email = response.respondentEmail?.toLowerCase() || ''
    return name.includes(searchTerm.toLowerCase()) || email.includes(searchTerm.toLowerCase())
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-orange-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (!quiz) {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-orange-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/quizzes"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Quizzes
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-orange-500 bg-clip-text text-transparent mb-2">
                Responses
              </h1>
              <p className="text-gray-600">{quiz.title}</p>
            </div>
            <div className="flex gap-2">
              <Link href={`/quizzes/${quizId}/analytics`}>
                <Button variant="outline">View Analytics</Button>
              </Link>
              <Button onClick={handleExport} variant="outline" disabled={responses.length === 0}>
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Responses List */}
        {filteredResponses.length > 0 ? (
          <div className="space-y-4">
            {filteredResponses.map((response) => {
              const answers =
                typeof response.answers === 'string'
                  ? JSON.parse(response.answers)
                  : response.answers

              return (
                <Card
                  key={response.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setSelectedResponse(selectedResponse?.id === response.id ? null : response)}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold">
                            {response.respondentName?.[0] || response.user?.name?.[0] || '?'}
                          </div>
                          <div>
                            <div className="font-semibold">
                              {response.respondentName || response.user?.name || 'Anonymous'}
                            </div>
                            {(response.respondentEmail || response.user?.email) && (
                              <div className="text-sm text-gray-600 flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {response.respondentEmail || response.user?.email}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>
                            {new Date(response.completedAt).toLocaleDateString()}{' '}
                            {new Date(response.completedAt).toLocaleTimeString()}
                          </span>
                          {response.timeSpent && (
                            <span>Time: {formatTimeSpent(response.timeSpent)}</span>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        {response.score !== null && (
                          <div className="text-3xl font-bold text-purple-600 mb-1">
                            {response.score}
                          </div>
                        )}
                        {response.result && (
                          <div className="text-sm text-gray-600">{response.result.title}</div>
                        )}
                      </div>
                    </div>

                    {/* Expanded View */}
                    {selectedResponse?.id === response.id && (
                      <div className="mt-6 pt-6 border-t">
                        <h4 className="font-semibold mb-4">Answers</h4>
                        <div className="space-y-4">
                          {quiz.questions?.map((question: any, index: number) => {
                            const answer = answers[question.id]
                            if (!answer) return null

                            return (
                              <div key={question.id} className="bg-gray-50 rounded-lg p-4">
                                <div className="font-medium mb-2">
                                  Q{index + 1}: {question.questionText}
                                </div>
                                <div className="text-gray-700">
                                  {Array.isArray(answer) ? answer.join(', ') : answer}
                                </div>
                              </div>
                            )
                          })}
                        </div>

                        {response.dimensionScores && (
                          <div className="mt-6">
                            <h4 className="font-semibold mb-3">Dimension Scores</h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                              {Object.entries(
                                typeof response.dimensionScores === 'string'
                                  ? JSON.parse(response.dimensionScores)
                                  : response.dimensionScores
                              ).map(([dimension, score]) => (
                                <div key={dimension} className="bg-purple-50 rounded-lg p-3">
                                  <div className="text-sm text-gray-600">{dimension}</div>
                                  <div className="text-2xl font-bold text-purple-600">{score}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <Eye className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {searchTerm ? 'No responses found' : 'No responses yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm
                ? 'Try adjusting your search'
                : 'Responses will appear here once people complete your quiz'}
            </p>
            {!searchTerm && (
              <Link href={`/quiz/${quiz.slug}`} target="_blank">
                <Button className="bg-gradient-to-r from-pink-500 to-purple-500">
                  Share Quiz
                </Button>
              </Link>
            )}
          </Card>
        )}

        {/* Pagination Info */}
        {total > responses.length && (
          <div className="mt-6 text-center text-sm text-gray-600">
            Showing {responses.length} of {total} responses
          </div>
        )}
      </div>
    </div>
  )
}
