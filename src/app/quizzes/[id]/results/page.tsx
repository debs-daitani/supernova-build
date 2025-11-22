'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Plus,
  Trash2,
  Trophy,
  Edit,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function QuizResultsPage() {
  const params = useParams()
  const router = useRouter()
  const quizId = params.id as string

  const [quiz, setQuiz] = useState<any>(null)
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedResult, setExpandedResult] = useState<string | null>(null)

  useEffect(() => {
    if (quizId) {
      fetchQuiz()
      fetchResults()
    }
  }, [quizId])

  const fetchQuiz = async () => {
    try {
      const res = await fetch(`/api/quizzes/${quizId}`)
      const data = await res.json()
      setQuiz(data)
    } catch (error) {
      console.error('Error fetching quiz:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchResults = async () => {
    try {
      const res = await fetch(`/api/quizzes/${quizId}/results`)
      const data = await res.json()
      setResults(data.results || [])
    } catch (error) {
      console.error('Error fetching results:', error)
    }
  }

  const addResult = async () => {
    try {
      const res = await fetch(`/api/quizzes/${quizId}/results`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'New Result',
          description: 'Add a description for this result...',
        }),
      })

      if (res.ok) {
        const newResult = await res.json()
        setExpandedResult(newResult.id)
        fetchResults()
      }
    } catch (error) {
      console.error('Error adding result:', error)
    }
  }

  const updateResult = async (resultId: string, updates: any) => {
    try {
      await fetch(`/api/quizzes/${quizId}/results/${resultId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      fetchResults()
    } catch (error) {
      console.error('Error updating result:', error)
    }
  }

  const deleteResult = async (resultId: string) => {
    if (!confirm('Delete this result?')) return

    try {
      await fetch(`/api/quizzes/${quizId}/results/${resultId}`, {
        method: 'DELETE',
      })
      fetchResults()
    } catch (error) {
      console.error('Error deleting result:', error)
    }
  }

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
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/quizzes/${quizId}/builder`}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Builder
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="w-8 h-8 text-purple-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-orange-500 bg-clip-text text-transparent">
              Result Pages
            </h1>
          </div>
          <p className="text-gray-600">
            Define different outcomes based on quiz responses and scores
          </p>
        </div>

        {/* Add Result Button */}
        <div className="mb-6">
          <Button
            onClick={addResult}
            className="bg-gradient-to-r from-pink-500 to-purple-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Result Page
          </Button>
        </div>

        {/* Results List */}
        {results.length > 0 ? (
          <div className="space-y-4">
            {results.map((result, index) => (
              <Card key={result.id} className="overflow-hidden">
                <div
                  className="p-4 flex items-center gap-3 cursor-pointer hover:bg-gray-50"
                  onClick={() =>
                    setExpandedResult(expandedResult === result.id ? null : result.id)
                  }
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{result.title}</h3>
                    {quiz.quizType === 'SCORED' && (result.minScore || result.maxScore) && (
                      <p className="text-sm text-gray-600">
                        Score range: {result.minScore || 0} - {result.maxScore || '∞'}
                      </p>
                    )}
                  </div>
                  {expandedResult === result.id ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>

                {expandedResult === result.id && (
                  <div className="p-6 border-t bg-gray-50 space-y-4">
                    {/* Title */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Result Title</label>
                      <input
                        type="text"
                        value={result.title}
                        onChange={(e) => updateResult(result.id, { title: e.target.value })}
                        className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Description</label>
                      <textarea
                        value={result.description}
                        onChange={(e) => updateResult(result.id, { description: e.target.value })}
                        className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        rows={4}
                      />
                    </div>

                    {/* Score Range (for SCORED quizzes) */}
                    {quiz.quizType === 'SCORED' && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Minimum Score
                          </label>
                          <input
                            type="number"
                            value={result.minScore || ''}
                            onChange={(e) =>
                              updateResult(result.id, {
                                minScore: e.target.value ? parseInt(e.target.value) : null,
                              })
                            }
                            className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="0"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Maximum Score
                          </label>
                          <input
                            type="number"
                            value={result.maxScore || ''}
                            onChange={(e) =>
                              updateResult(result.id, {
                                maxScore: e.target.value ? parseInt(e.target.value) : null,
                              })
                            }
                            className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="100"
                          />
                        </div>
                      </div>
                    )}

                    {/* Image */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Result Image URL (optional)
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="url"
                          value={result.imageUrl || ''}
                          onChange={(e) => updateResult(result.id, { imageUrl: e.target.value })}
                          className="flex-1 border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="https://example.com/image.jpg"
                        />
                        {result.imageUrl && (
                          <div className="w-16 h-16 border rounded-lg overflow-hidden">
                            <img
                              src={result.imageUrl}
                              alt="Preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* CTA */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Call-to-Action Text
                        </label>
                        <input
                          type="text"
                          value={result.ctaText || ''}
                          onChange={(e) => updateResult(result.id, { ctaText: e.target.value })}
                          className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="Get Started"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          CTA URL
                        </label>
                        <input
                          type="url"
                          value={result.ctaUrl || ''}
                          onChange={(e) => updateResult(result.id, { ctaUrl: e.target.value })}
                          className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="https://example.com"
                        />
                      </div>
                    </div>

                    {/* Show Score Toggle */}
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`show-score-${result.id}`}
                        checked={result.showScore}
                        onChange={(e) =>
                          updateResult(result.id, { showScore: e.target.checked })
                        }
                        className="w-4 h-4"
                      />
                      <label htmlFor={`show-score-${result.id}`} className="text-sm">
                        Show score on result page
                      </label>
                    </div>

                    {/* Email Template */}
                    <div className="pt-4 border-t">
                      <h4 className="font-semibold mb-3">Email Template (optional)</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Email Subject
                          </label>
                          <input
                            type="text"
                            value={result.emailSubject || ''}
                            onChange={(e) =>
                              updateResult(result.id, { emailSubject: e.target.value })
                            }
                            className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="Your Quiz Results"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Email Body
                          </label>
                          <textarea
                            value={result.emailBody || ''}
                            onChange={(e) =>
                              updateResult(result.id, { emailBody: e.target.value })
                            }
                            className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            rows={6}
                            placeholder="Include {name}, {score}, {result} placeholders..."
                          />
                        </div>
                      </div>
                    </div>

                    {/* Delete Button */}
                    <div className="pt-4 border-t">
                      <Button
                        onClick={() => deleteResult(result.id)}
                        variant="outline"
                        className="text-red-500 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Result
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No results yet</h3>
            <p className="text-gray-600 mb-6">
              Add result pages to show different outcomes based on quiz responses
            </p>
            <Button
              onClick={addResult}
              className="bg-gradient-to-r from-pink-500 to-purple-500"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Result
            </Button>
          </Card>
        )}
      </div>
    </div>
  )
}
