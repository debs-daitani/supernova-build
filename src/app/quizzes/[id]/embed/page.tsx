'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Copy, CheckCircle, Code, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { generateEmbedCode } from '@/lib/quiz-utils'

export default function QuizEmbedPage() {
  const params = useParams()
  const quizId = params.id as string

  const [quiz, setQuiz] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [embedType, setEmbedType] = useState<'INLINE' | 'POPUP'>('INLINE')
  const [width, setWidth] = useState('100%')
  const [height, setHeight] = useState('600px')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (quizId) {
      fetchQuiz()
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

  const embedCode = quiz ? generateEmbedCode(quiz.slug, embedType, width, height) : ''
  const directUrl = typeof window !== 'undefined' ? `${window.location.origin}/quiz/${quiz?.slug}` : ''

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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
            <Code className="w-8 h-8 text-purple-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-orange-500 bg-clip-text text-transparent">
              Embed Quiz
            </h1>
          </div>
          <p className="text-gray-600">{quiz.title}</p>
        </div>

        {!quiz.isPublished && (
          <Card className="p-4 mb-6 bg-yellow-50 border-yellow-200">
            <div className="flex items-center gap-2 text-yellow-800">
              <span className="text-sm font-medium">
                ⚠️ This quiz is not published. Publish it before embedding on your website.
              </span>
              <Link href={`/quizzes/${quizId}/settings`}>
                <Button size="sm" variant="outline">
                  Publish Quiz
                </Button>
              </Link>
            </div>
          </Card>
        )}

        {/* Direct URL */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-5 h-5 text-purple-600" />
            <h3 className="font-bold text-lg">Direct Link</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Share this link directly with your audience
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={directUrl}
              readOnly
              className="flex-1 border rounded-lg p-3 bg-gray-50 font-mono text-sm"
            />
            <Button onClick={() => copyToClipboard(directUrl)} variant="outline">
              {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        </Card>

        {/* Embed Options */}
        <Card className="p-6 mb-6">
          <h3 className="font-bold text-lg mb-4">Embed Type</h3>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              onClick={() => setEmbedType('INLINE')}
              className={`p-4 border-2 rounded-lg transition-all ${
                embedType === 'INLINE'
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-300 hover:border-purple-300'
              }`}
            >
              <div className="font-semibold mb-1">Inline Embed</div>
              <div className="text-sm text-gray-600">
                Embed quiz directly in your page
              </div>
            </button>
            <button
              onClick={() => setEmbedType('POPUP')}
              className={`p-4 border-2 rounded-lg transition-all ${
                embedType === 'POPUP'
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-300 hover:border-purple-300'
              }`}
            >
              <div className="font-semibold mb-1">Popup Embed</div>
              <div className="text-sm text-gray-600">
                Open quiz in a popup window
              </div>
            </button>
          </div>

          {embedType === 'INLINE' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Width</label>
                <input
                  type="text"
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                  className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="100%"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Height</label>
                <input
                  type="text"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="600px"
                />
              </div>
            </div>
          )}
        </Card>

        {/* Embed Code */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg">Embed Code</h3>
            <Button
              onClick={() => copyToClipboard(embedCode)}
              variant="outline"
              size="sm"
            >
              {copied ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Code
                </>
              )}
            </Button>
          </div>
          <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
            <pre className="text-sm text-gray-100 font-mono whitespace-pre-wrap">
              {embedCode}
            </pre>
          </div>
          <p className="text-sm text-gray-600 mt-4">
            Copy and paste this code into your website's HTML where you want the quiz to appear
          </p>
        </Card>

        {/* Preview */}
        {embedType === 'INLINE' && quiz.isPublished && (
          <Card className="p-6 mt-6">
            <h3 className="font-bold text-lg mb-4">Preview</h3>
            <div
              className="border rounded-lg overflow-hidden"
              dangerouslySetInnerHTML={{ __html: embedCode }}
            />
          </Card>
        )}
      </div>
    </div>
  )
}
