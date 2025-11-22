'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Plus,
  Trash2,
  GripVertical,
  Eye,
  Settings as SettingsIcon,
  Save,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Video as VideoIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { QUESTION_TYPES, QUESTION_TYPE_NAMES, getQuestionTypeIcon } from '@/lib/quiz-config'

export default function QuizBuilderPage() {
  const params = useParams()
  const router = useRouter()
  const quizId = params.id as string

  const [quiz, setQuiz] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

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
      setTitle(data.title)
      setDescription(data.description || '')
    } catch (error) {
      console.error('Error fetching quiz:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveQuizInfo = async () => {
    setSaving(true)
    try {
      await fetch(`/api/quizzes/${quizId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description }),
      })
      setEditingTitle(false)
      fetchQuiz()
    } catch (error) {
      console.error('Error saving quiz:', error)
    } finally {
      setSaving(false)
    }
  }

  const addQuestion = async () => {
    try {
      const res = await fetch(`/api/quizzes/${quizId}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionText: 'New Question',
          questionType: 'SINGLE_CHOICE',
          options: [
            { text: 'Option 1', points: 10 },
            { text: 'Option 2', points: 5 },
          ],
        }),
      })

      if (res.ok) {
        const newQuestion = await res.json()
        setExpandedQuestion(newQuestion.id)
        fetchQuiz()
      }
    } catch (error) {
      console.error('Error adding question:', error)
    }
  }

  const updateQuestion = async (questionId: string, updates: any) => {
    try {
      await fetch(`/api/quizzes/${quizId}/questions/${questionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      fetchQuiz()
    } catch (error) {
      console.error('Error updating question:', error)
    }
  }

  const deleteQuestion = async (questionId: string) => {
    if (!confirm('Delete this question?')) return

    try {
      await fetch(`/api/quizzes/${quizId}/questions/${questionId}`, {
        method: 'DELETE',
      })
      fetchQuiz()
    } catch (error) {
      console.error('Error deleting question:', error)
    }
  }

  const addOption = (question: any) => {
    const options = question.options || []
    const newOptions = [
      ...options,
      { text: `Option ${options.length + 1}`, points: 0 },
    ]
    updateQuestion(question.id, { options: newOptions })
  }

  const updateOption = (question: any, index: number, field: string, value: any) => {
    const options = [...question.options]
    options[index] = { ...options[index], [field]: value }
    updateQuestion(question.id, { options })
  }

  const deleteOption = (question: any, index: number) => {
    const options = question.options.filter((_: any, i: number) => i !== index)
    updateQuestion(question.id, { options })
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
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/quizzes" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Quizzes
          </Link>

          {editingTitle ? (
            <div className="space-y-4">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-4xl font-bold w-full border-b-2 border-purple-500 bg-transparent focus:outline-none"
                autoFocus
              />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a description..."
                className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                rows={3}
              />
              <div className="flex gap-2">
                <Button onClick={saveQuizInfo} disabled={saving}>
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Saving...' : 'Save'}
                </Button>
                <Button variant="outline" onClick={() => setEditingTitle(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div onClick={() => setEditingTitle(true)} className="cursor-pointer hover:bg-white/50 rounded p-2 -m-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-orange-500 bg-clip-text text-transparent mb-2">
                {quiz.title}
              </h1>
              <p className="text-gray-600">{quiz.description || 'Click to add description'}</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mb-6 flex gap-3 flex-wrap">
          <Button onClick={addQuestion} className="bg-gradient-to-r from-pink-500 to-purple-500">
            <Plus className="w-4 h-4 mr-2" />
            Add Question
          </Button>
          <Link href={`/quizzes/${quizId}/logic`}>
            <Button variant="outline">
              <SettingsIcon className="w-4 h-4 mr-2" />
              Logic & Branching
            </Button>
          </Link>
          <Link href={`/quizzes/${quizId}/results`}>
            <Button variant="outline">
              <Eye className="w-4 h-4 mr-2" />
              Results Pages
            </Button>
          </Link>
          <Link href={`/quizzes/${quizId}/settings`}>
            <Button variant="outline">
              <SettingsIcon className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </Link>
          <Link href={`/quiz/${quiz.slug}`} target="_blank">
            <Button variant="outline">
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
          </Link>
        </div>

        {/* Questions List */}
        {quiz.questions && quiz.questions.length > 0 ? (
          <div className="space-y-4">
            {quiz.questions.map((question: any, index: number) => (
              <Card key={question.id} className="overflow-hidden">
                <div
                  className="p-4 flex items-center gap-3 cursor-pointer hover:bg-gray-50"
                  onClick={() =>
                    setExpandedQuestion(expandedQuestion === question.id ? null : question.id)
                  }
                >
                  <GripVertical className="w-5 h-5 text-gray-400" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">Q{index + 1}.</span>
                      <span className="text-sm text-gray-600 capitalize">
                        {QUESTION_TYPE_NAMES[question.questionType as keyof typeof QUESTION_TYPE_NAMES]}
                      </span>
                    </div>
                    <p className="text-gray-700">{question.questionText}</p>
                  </div>
                  {expandedQuestion === question.id ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>

                {expandedQuestion === question.id && (
                  <div className="p-6 border-t bg-gray-50 space-y-4">
                    {/* Question Text */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Question</label>
                      <input
                        type="text"
                        value={question.questionText}
                        onChange={(e) =>
                          updateQuestion(question.id, { questionText: e.target.value })
                        }
                        className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    {/* Question Type */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Question Type</label>
                      <select
                        value={question.questionType}
                        onChange={(e) =>
                          updateQuestion(question.id, { questionType: e.target.value })
                        }
                        className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        {Object.entries(QUESTION_TYPE_NAMES).map(([key, name]) => (
                          <option key={key} value={key}>
                            {name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Options (for SINGLE_CHOICE, MULTIPLE_CHOICE, DROPDOWN) */}
                    {(question.questionType === 'SINGLE_CHOICE' ||
                      question.questionType === 'MULTIPLE_CHOICE' ||
                      question.questionType === 'DROPDOWN') && (
                      <div>
                        <label className="block text-sm font-medium mb-2">Options</label>
                        <div className="space-y-2">
                          {question.options?.map((option: any, optIndex: number) => (
                            <div key={optIndex} className="flex gap-2">
                              <input
                                type="text"
                                value={option.text}
                                onChange={(e) =>
                                  updateOption(question, optIndex, 'text', e.target.value)
                                }
                                className="flex-1 border rounded-lg p-2"
                                placeholder="Option text"
                              />
                              {quiz.quizType === 'SCORED' && (
                                <input
                                  type="number"
                                  value={option.points || 0}
                                  onChange={(e) =>
                                    updateOption(question, optIndex, 'points', parseInt(e.target.value))
                                  }
                                  className="w-24 border rounded-lg p-2"
                                  placeholder="Points"
                                />
                              )}
                              <button
                                onClick={() => deleteOption(question, optIndex)}
                                className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                          <Button onClick={() => addOption(question)} variant="outline" size="sm">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Option
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Description (optional)
                      </label>
                      <textarea
                        value={question.description || ''}
                        onChange={(e) => updateQuestion(question.id, { description: e.target.value })}
                        className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        rows={2}
                        placeholder="Add helpful context for this question..."
                      />
                    </div>

                    {/* Required Toggle */}
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`required-${question.id}`}
                        checked={question.required}
                        onChange={(e) => updateQuestion(question.id, { required: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <label htmlFor={`required-${question.id}`} className="text-sm">
                        Required question
                      </label>
                    </div>

                    {/* Delete Button */}
                    <div className="pt-4 border-t">
                      <Button
                        onClick={() => deleteQuestion(question.id)}
                        variant="outline"
                        className="text-red-500 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Question
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <h3 className="text-xl font-semibold mb-2">No questions yet</h3>
            <p className="text-gray-600 mb-6">Add your first question to get started</p>
            <Button onClick={addQuestion} className="bg-gradient-to-r from-pink-500 to-purple-500">
              <Plus className="w-4 h-4 mr-2" />
              Add Question
            </Button>
          </Card>
        )}
      </div>
    </div>
  )
}
