'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Plus,
  Search,
  Filter,
  BarChart3,
  Eye,
  Edit,
  Copy,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { QUIZ_TYPE_NAMES } from '@/lib/quiz-config'

export default function QuizzesPage() {
  const router = useRouter()
  const [quizzes, setQuizzes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('')
  const [filterPublished, setFilterPublished] = useState<string>('')

  useEffect(() => {
    fetchQuizzes()
  }, [filterType, filterPublished])

  const fetchQuizzes = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filterType) params.set('type', filterType)
      if (filterPublished) params.set('published', filterPublished)
      if (searchTerm) params.set('search', searchTerm)

      const res = await fetch(`/api/quizzes?${params}`)
      const data = await res.json()
      setQuizzes(data.quizzes || [])
    } catch (error) {
      console.error('Error fetching quizzes:', error)
    } finally {
      setLoading(false)
    }
  }

  const createQuiz = async (type: string) => {
    try {
      const res = await fetch('/api/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `New ${QUIZ_TYPE_NAMES[type as keyof typeof QUIZ_TYPE_NAMES]} Quiz`,
          quizType: type,
        }),
      })

      if (res.ok) {
        const quiz = await res.json()
        router.push(`/quizzes/${quiz.id}/builder`)
      }
    } catch (error) {
      console.error('Error creating quiz:', error)
    }
  }

  const deleteQuiz = async (id: string) => {
    if (!confirm('Are you sure you want to delete this quiz?')) return

    try {
      const res = await fetch(`/api/quizzes/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        fetchQuizzes()
      }
    } catch (error) {
      console.error('Error deleting quiz:', error)
    }
  }

  const duplicateQuiz = async (quiz: any) => {
    try {
      const res = await fetch('/api/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `${quiz.title} (Copy)`,
          description: quiz.description,
          quizType: quiz.quizType,
        }),
      })

      if (res.ok) {
        const newQuiz = await res.json()
        router.push(`/quizzes/${newQuiz.id}/builder`)
      }
    } catch (error) {
      console.error('Error duplicating quiz:', error)
    }
  }

  const filteredQuizzes = quizzes.filter((quiz) =>
    searchTerm
      ? quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quiz.description?.toLowerCase().includes(searchTerm.toLowerCase())
      : true
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-orange-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-orange-500 bg-clip-text text-transparent mb-2">
            Quizzes & Forms
          </h1>
          <p className="text-gray-600">
            Create engaging quizzes, assessments, and lead magnets
          </p>
        </div>

        {/* Actions Bar */}
        <div className="mb-8 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search quizzes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchQuizzes()}
                className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Types</option>
              {Object.entries(QUIZ_TYPE_NAMES).map(([key, name]) => (
                <option key={key} value={key}>
                  {name}
                </option>
              ))}
            </select>

            <select
              value={filterPublished}
              onChange={(e) => setFilterPublished(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Status</option>
              <option value="true">Published</option>
              <option value="false">Draft</option>
            </select>
          </div>

          <div className="flex gap-2">
            <Link href="/quiz-templates">
              <Button variant="outline">
                <Copy className="w-4 h-4 mr-2" />
                Use Template
              </Button>
            </Link>
            <div className="relative group">
              <Button className="bg-gradient-to-r from-pink-500 to-purple-500">
                <Plus className="w-4 h-4 mr-2" />
                Create Quiz
              </Button>
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                <div className="p-2">
                  {Object.entries(QUIZ_TYPE_NAMES).map(([key, name]) => (
                    <button
                      key={key}
                      onClick={() => createQuiz(key)}
                      className="w-full text-left px-4 py-2 hover:bg-purple-50 rounded transition-colors"
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Total Quizzes</span>
              <BarChart3 className="w-5 h-5 text-purple-500" />
            </div>
            <div className="text-3xl font-bold text-purple-600">{quizzes.length}</div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Published</span>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-green-600">
              {quizzes.filter((q) => q.isPublished).length}
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Total Views</span>
              <Eye className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-3xl font-bold text-blue-600">
              {quizzes.reduce((sum, q) => sum + (q.viewCount || 0), 0)}
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Total Responses</span>
              <BarChart3 className="w-5 h-5 text-orange-500" />
            </div>
            <div className="text-3xl font-bold text-orange-600">
              {quizzes.reduce((sum, q) => sum + (q._count?.responses || 0), 0)}
            </div>
          </Card>
        </div>

        {/* Quizzes List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
          </div>
        ) : filteredQuizzes.length === 0 ? (
          <Card className="p-12 text-center">
            <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No quizzes yet</h3>
            <p className="text-gray-600 mb-6">
              Create your first quiz to start collecting responses
            </p>
            <Button
              onClick={() => createQuiz('SCORED')}
              className="bg-gradient-to-r from-pink-500 to-purple-500"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Quiz
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQuizzes.map((quiz) => (
              <Card key={quiz.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-1 line-clamp-2">{quiz.title}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {quiz.description || 'No description'}
                      </p>
                    </div>
                    <div
                      className={`ml-2 px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                        quiz.isPublished
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {quiz.isPublished ? 'Published' : 'Draft'}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {quiz.viewCount || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <BarChart3 className="w-4 h-4" />
                      {quiz._count?.responses || 0} responses
                    </span>
                    <span className="capitalize text-purple-600">
                      {QUIZ_TYPE_NAMES[quiz.quizType as keyof typeof QUIZ_TYPE_NAMES]}
                    </span>
                  </div>

                  <div className="text-xs text-gray-500 mb-4">
                    {quiz.questions?.length || 0} questions • {quiz.results?.length || 0} results
                  </div>

                  <div className="flex gap-2">
                    <Link href={`/quizzes/${quiz.id}/builder`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    </Link>
                    <Link href={`/quizzes/${quiz.id}/analytics`}>
                      <Button variant="outline">
                        <BarChart3 className="w-4 h-4" />
                      </Button>
                    </Link>
                    <button
                      onClick={() => duplicateQuiz(quiz)}
                      className="px-3 py-2 border rounded-lg hover:bg-gray-50"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteQuiz(quiz.id)}
                      className="px-3 py-2 border rounded-lg hover:bg-red-50 text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
