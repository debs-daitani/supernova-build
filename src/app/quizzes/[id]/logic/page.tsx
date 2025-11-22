'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, Trash2, GitBranch } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  CONDITION_TYPES,
  CONDITION_TYPE_NAMES,
  ACTION_TYPES,
  ACTION_TYPE_NAMES,
} from '@/lib/quiz-config'

export default function QuizLogicPage() {
  const params = useParams()
  const router = useRouter()
  const quizId = params.id as string

  const [quiz, setQuiz] = useState<any>(null)
  const [logicRules, setLogicRules] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newRule, setNewRule] = useState({
    questionId: '',
    conditionType: 'IF_ANSWER_EQUALS',
    conditionValue: '',
    actionType: 'SKIP_TO_QUESTION',
    actionValue: '',
  })

  useEffect(() => {
    if (quizId) {
      fetchQuiz()
      fetchLogicRules()
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

  const fetchLogicRules = async () => {
    try {
      const res = await fetch(`/api/quizzes/${quizId}/logic`)
      const data = await res.json()
      setLogicRules(data.logicRules || [])
    } catch (error) {
      console.error('Error fetching logic rules:', error)
    }
  }

  const addLogicRule = async () => {
    if (!newRule.questionId || !newRule.conditionType || !newRule.actionType) {
      alert('Please fill in all required fields')
      return
    }

    try {
      const res = await fetch(`/api/quizzes/${quizId}/logic`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRule),
      })

      if (res.ok) {
        setShowAddForm(false)
        setNewRule({
          questionId: '',
          conditionType: 'IF_ANSWER_EQUALS',
          conditionValue: '',
          actionType: 'SKIP_TO_QUESTION',
          actionValue: '',
        })
        fetchLogicRules()
      }
    } catch (error) {
      console.error('Error adding logic rule:', error)
    }
  }

  const deleteLogicRule = async (ruleId: string) => {
    if (!confirm('Delete this logic rule?')) return

    try {
      const res = await fetch(`/api/quizzes/${quizId}/logic?ruleId=${ruleId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        fetchLogicRules()
      }
    } catch (error) {
      console.error('Error deleting logic rule:', error)
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
            <GitBranch className="w-8 h-8 text-purple-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-orange-500 bg-clip-text text-transparent">
              Logic & Branching
            </h1>
          </div>
          <p className="text-gray-600">
            Create conditional logic to show different questions based on answers
          </p>
        </div>

        {/* Add Rule Button */}
        <div className="mb-6">
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-gradient-to-r from-pink-500 to-purple-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Logic Rule
          </Button>
        </div>

        {/* Add Rule Form */}
        {showAddForm && (
          <Card className="p-6 mb-6">
            <h3 className="font-bold text-lg mb-4">New Logic Rule</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">When Question</label>
                <select
                  value={newRule.questionId}
                  onChange={(e) => setNewRule({ ...newRule, questionId: e.target.value })}
                  className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select a question...</option>
                  {quiz.questions?.map((q: any, index: number) => (
                    <option key={q.id} value={q.id}>
                      Q{index + 1}: {q.questionText}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Condition</label>
                <select
                  value={newRule.conditionType}
                  onChange={(e) => setNewRule({ ...newRule, conditionType: e.target.value })}
                  className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {Object.entries(CONDITION_TYPE_NAMES).map(([key, name]) => (
                    <option key={key} value={key}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Value</label>
                <input
                  type="text"
                  value={newRule.conditionValue}
                  onChange={(e) => setNewRule({ ...newRule, conditionValue: e.target.value })}
                  className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter the value to check against"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Then</label>
                <select
                  value={newRule.actionType}
                  onChange={(e) => setNewRule({ ...newRule, actionType: e.target.value })}
                  className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {Object.entries(ACTION_TYPE_NAMES).map(([key, name]) => (
                    <option key={key} value={key}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              {newRule.actionType === 'SKIP_TO_QUESTION' && (
                <div>
                  <label className="block text-sm font-medium mb-2">Target Question</label>
                  <select
                    value={newRule.actionValue}
                    onChange={(e) => setNewRule({ ...newRule, actionValue: e.target.value })}
                    className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select a question...</option>
                    {quiz.questions?.map((q: any, index: number) => (
                      <option key={q.id} value={q.id}>
                        Q{index + 1}: {q.questionText}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button onClick={addLogicRule} className="bg-gradient-to-r from-pink-500 to-purple-500">
                  Add Rule
                </Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Logic Rules List */}
        {logicRules.length > 0 ? (
          <div className="space-y-4">
            {logicRules.map((rule) => {
              const question = quiz.questions?.find((q: any) => q.id === rule.questionId)
              const targetQuestion = quiz.questions?.find((q: any) => q.id === rule.actionValue)

              return (
                <Card key={rule.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <GitBranch className="w-5 h-5 text-purple-500" />
                        <span className="font-semibold text-purple-600">IF</span>
                      </div>

                      <div className="ml-7 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600">Question:</span>
                          <span className="font-medium">{question?.questionText || 'Unknown'}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-gray-600">Condition:</span>
                          <span className="font-medium">
                            {CONDITION_TYPE_NAMES[rule.conditionType as keyof typeof CONDITION_TYPE_NAMES]}
                          </span>
                          {rule.conditionValue && (
                            <>
                              <span className="text-gray-600">→</span>
                              <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                                "{rule.conditionValue}"
                              </span>
                            </>
                          )}
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t">
                          <span className="font-semibold text-orange-600">THEN</span>
                          <span className="font-medium">
                            {ACTION_TYPE_NAMES[rule.actionType as keyof typeof ACTION_TYPE_NAMES]}
                          </span>
                          {rule.actionType === 'SKIP_TO_QUESTION' && targetQuestion && (
                            <>
                              <span className="text-gray-600">→</span>
                              <span className="font-medium">{targetQuestion.questionText}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => deleteLogicRule(rule.id)}
                      className="ml-4 p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </Card>
              )
            })}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <GitBranch className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No logic rules yet</h3>
            <p className="text-gray-600 mb-6">
              Add logic rules to create conditional branching in your quiz
            </p>
            <Button
              onClick={() => setShowAddForm(true)}
              className="bg-gradient-to-r from-pink-500 to-purple-500"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Rule
            </Button>
          </Card>
        )}
      </div>
    </div>
  )
}
