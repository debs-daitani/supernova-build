'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type QuestionType = 'MULTIPLE_CHOICE' | 'SCALE' | 'YES_NO' | 'SHORT_TEXT' | 'LONG_TEXT'

interface QuizQuestion {
  id?: string
  questionText: string
  description?: string
  type: QuestionType
  required: boolean
  order: number
  imageUrl?: string
  options?: Array<{
    text: string
    points: number
    tags: string[]
  }>
  scaleMin?: number
  scaleMax?: number
  scaleMinLabel?: string
  scaleMaxLabel?: string
}

export default function CreateQuizPage() {
  const router = useRouter()
  const [step, setStep] = useState<'settings' | 'questions' | 'results'>('settings')

  // Quiz settings
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [primaryColor, setPrimaryColor] = useState('#FF008E')
  const [secondaryColor, setSecondaryColor] = useState('#00F0E9')
  const [requireEmail, setRequireEmail] = useState(true)
  const [collectPhone, setCollectPhone] = useState(false)

  // Questions
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null)

  // Result tiers
  const [resultTiers, setResultTiers] = useState<Array<{
    name: string
    description: string
    minScore: number
    maxScore: number
    ctaText?: string
    ctaUrl?: string
  }>>([])

  const [saving, setSaving] = useState(false)
  const [quizId, setQuizId] = useState<string | null>(null)

  const handleCreateQuiz = async () => {
    if (!title) {
      alert('Please enter a quiz title')
      return
    }

    setSaving(true)

    try {
      // Create quiz
      const response = await fetch('/api/quiz/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'admin', // TODO: Get from auth
          title,
          description,
          primaryColor,
          secondaryColor,
          requireEmail,
          collectPhone,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setQuizId(data.quizId)
        setStep('questions')
      } else {
        alert('Failed to create quiz')
      }
    } catch (error) {
      console.error('Create quiz error:', error)
      alert('Error creating quiz')
    } finally {
      setSaving(false)
    }
  }

  const handleAddQuestion = async () => {
    if (!quizId || !currentQuestion) return

    setSaving(true)

    try {
      const response = await fetch('/api/quiz/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizId,
          ...currentQuestion,
          order: questions.length,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setQuestions([...questions, data.question])
        setCurrentQuestion(null)
      } else {
        alert('Failed to add question')
      }
    } catch (error) {
      console.error('Add question error:', error)
      alert('Error adding question')
    } finally {
      setSaving(false)
    }
  }

  const handlePublish = async () => {
    if (!quizId) return

    setSaving(true)

    try {
      const response = await fetch('/api/quiz/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quizId }),
      })

      const data = await response.json()

      if (data.success) {
        alert('Quiz published successfully!\n\nPublic URL: ' + data.publicUrl)
        router.push(`/admin/quiz/${quizId}`)
      } else {
        alert('Failed to publish quiz')
      }
    } catch (error) {
      console.error('Publish error:', error)
      alert('Error publishing quiz')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="min-h-screen bg-black text-white p-8"
      style={{
        backgroundImage: 'url("/images/dAitaniverse Stage.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/admin/quiz')}
            className="text-light-teal hover:text-hot-pink mb-4 font-josefin"
          >
            ← Back to Quizzes
          </button>
          <h1 className="text-4xl font-supernova text-transparent bg-clip-text bg-gradient-to-r from-hot-pink via-light-teal to-neon-lime mb-2">
            Create Quiz
          </h1>
          <p className="text-gray-400 font-josefin">Build a ScoreApp-style quiz with drag-drop questions</p>
        </div>

        {/* Progress Steps */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setStep('settings')}
            className={`px-6 py-3 rounded-xl font-josefin font-bold transition-all ${
              step === 'settings'
                ? 'bg-gradient-to-br from-hot-pink to-light-teal text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            1. Settings
          </button>
          <button
            onClick={() => quizId && setStep('questions')}
            disabled={!quizId}
            className={`px-6 py-3 rounded-xl font-josefin font-bold transition-all ${
              step === 'questions'
                ? 'bg-gradient-to-br from-hot-pink to-light-teal text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10 disabled:opacity-50'
            }`}
          >
            2. Questions ({questions.length})
          </button>
          <button
            onClick={() => quizId && setStep('results')}
            disabled={!quizId || questions.length === 0}
            className={`px-6 py-3 rounded-xl font-josefin font-bold transition-all ${
              step === 'results'
                ? 'bg-gradient-to-br from-hot-pink to-light-teal text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10 disabled:opacity-50'
            }`}
          >
            3. Results
          </button>
        </div>

        {/* STEP 1: Settings */}
        {step === 'settings' && (
          <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-light-teal/20 p-8">
            <h2 className="text-2xl font-supernova text-light-teal mb-6">Quiz Settings</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-josefin text-gray-300 mb-2">Quiz Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., What's Your Entrepreneurial Superpower?"
                  className="w-full px-4 py-3 rounded-xl bg-charcoal/60 border border-light-teal/20 text-white font-josefin focus:outline-none focus:border-light-teal"
                />
              </div>

              <div>
                <label className="block text-sm font-josefin text-gray-300 mb-2">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="A short description of your quiz..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-charcoal/60 border border-light-teal/20 text-white font-josefin focus:outline-none focus:border-light-teal"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-josefin text-gray-300 mb-2">Primary Color</label>
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-full h-12 rounded-xl bg-charcoal/60 border border-light-teal/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-josefin text-gray-300 mb-2">Secondary Color</label>
                  <input
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="w-full h-12 rounded-xl bg-charcoal/60 border border-light-teal/20"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={requireEmail}
                    onChange={(e) => setRequireEmail(e.target.checked)}
                    className="w-5 h-5 rounded border-light-teal/20"
                  />
                  <span className="font-josefin text-gray-300">Require Email</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={collectPhone}
                    onChange={(e) => setCollectPhone(e.target.checked)}
                    className="w-5 h-5 rounded border-light-teal/20"
                  />
                  <span className="font-josefin text-gray-300">Collect Phone Number</span>
                </label>
              </div>

              <button
                onClick={handleCreateQuiz}
                disabled={!title || saving}
                className={`w-full px-6 py-4 rounded-xl font-josefin font-bold transition-all ${
                  !title || saving
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-br from-hot-pink to-light-teal text-white hover:scale-105 shadow-[0_0_30px_rgba(255,0,142,0.4)]'
                }`}
              >
                {saving ? 'Creating...' : quizId ? 'Settings Saved ✓' : 'Create Quiz & Continue'}
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Questions */}
        {step === 'questions' && (
          <div className="space-y-6">
            {/* Existing Questions */}
            {questions.map((q, index) => (
              <div key={index} className="backdrop-blur-xl bg-white/5 rounded-2xl border border-light-teal/20 p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Question {index + 1} · {q.type}</div>
                    <div className="text-lg font-josefin">{q.questionText}</div>
                    {q.options && (
                      <div className="mt-3 space-y-1">
                        {q.options.map((opt: any, i: number) => (
                          <div key={i} className="text-sm text-gray-400">
                            • {opt.text} ({opt.points} pts)
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <button className="text-red-400 hover:text-red-300 text-sm">Delete</button>
                </div>
              </div>
            ))}

            {/* Add New Question */}
            {!currentQuestion ? (
              <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-light-teal/20 p-8">
                <h3 className="text-xl font-supernova text-light-teal mb-4">Add Question</h3>
                <div className="grid grid-cols-2 gap-4">
                  {(['MULTIPLE_CHOICE', 'SCALE', 'YES_NO', 'SHORT_TEXT'] as QuestionType[]).map((type) => (
                    <button
                      key={type}
                      onClick={() =>
                        setCurrentQuestion({
                          questionText: '',
                          type,
                          required: true,
                          order: questions.length,
                          options: type === 'MULTIPLE_CHOICE' || type === 'YES_NO' ? [{ text: '', points: 0, tags: [] }] : undefined,
                          scaleMin: type === 'SCALE' ? 1 : undefined,
                          scaleMax: type === 'SCALE' ? 10 : undefined,
                        })
                      }
                      className="p-6 rounded-xl bg-charcoal/60 border border-light-teal/20 hover:border-light-teal transition-all font-josefin"
                    >
                      <div className="text-2xl mb-2">
                        {type === 'MULTIPLE_CHOICE' && '☑️'}
                        {type === 'SCALE' && '📊'}
                        {type === 'YES_NO' && '✔️'}
                        {type === 'SHORT_TEXT' && '✍️'}
                      </div>
                      <div className="font-bold">{type.replace('_', ' ')}</div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <QuestionBuilder
                question={currentQuestion}
                onChange={setCurrentQuestion}
                onSave={handleAddQuestion}
                onCancel={() => setCurrentQuestion(null)}
                saving={saving}
              />
            )}

            <button
              onClick={() => setStep('results')}
              disabled={questions.length === 0}
              className="w-full px-6 py-4 rounded-xl font-josefin font-bold bg-gradient-to-br from-hot-pink to-light-teal text-white hover:scale-105 transition-all disabled:opacity-50"
            >
              Continue to Results →
            </button>
          </div>
        )}

        {/* STEP 3: Results */}
        {step === 'results' && (
          <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-light-teal/20 p-8">
            <h2 className="text-2xl font-supernova text-light-teal mb-6">Results & Publishing</h2>

            <div className="space-y-6">
              <div className="p-6 rounded-xl bg-green-500/10 border border-green-500/30 text-green-300">
                <div className="font-bold mb-2">✓ Quiz Ready!</div>
                <div className="text-sm">
                  Your quiz has {questions.length} question{questions.length !== 1 ? 's' : ''}.
                  Click Publish to make it live.
                </div>
              </div>

              <button
                onClick={handlePublish}
                disabled={saving}
                className="w-full px-6 py-4 rounded-xl font-josefin font-bold bg-gradient-to-br from-hot-pink to-light-teal text-white hover:scale-105 transition-all shadow-[0_0_30px_rgba(255,0,142,0.4)]"
              >
                {saving ? 'Publishing...' : '🚀 Publish Quiz'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Question Builder Component
function QuestionBuilder({
  question,
  onChange,
  onSave,
  onCancel,
  saving,
}: {
  question: QuizQuestion
  onChange: (q: QuizQuestion) => void
  onSave: () => void
  onCancel: () => void
  saving: boolean
}) {
  const addOption = () => {
    onChange({
      ...question,
      options: [...(question.options || []), { text: '', points: 0, tags: [] }],
    })
  }

  const updateOption = (index: number, field: string, value: any) => {
    const newOptions = [...(question.options || [])]
    newOptions[index] = { ...newOptions[index], [field]: value }
    onChange({ ...question, options: newOptions })
  }

  return (
    <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-light-teal/20 p-8">
      <h3 className="text-xl font-supernova text-light-teal mb-6">
        {question.type.replace('_', ' ')} Question
      </h3>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-josefin text-gray-300 mb-2">Question Text *</label>
          <input
            type="text"
            value={question.questionText}
            onChange={(e) => onChange({ ...question, questionText: e.target.value })}
            placeholder="What's your question?"
            className="w-full px-4 py-3 rounded-xl bg-charcoal/60 border border-light-teal/20 text-white font-josefin focus:outline-none focus:border-light-teal"
          />
        </div>

        {/* Multiple Choice Options */}
        {(question.type === 'MULTIPLE_CHOICE' || question.type === 'YES_NO') && (
          <div>
            <label className="block text-sm font-josefin text-gray-300 mb-2">Options</label>
            {question.options?.map((opt, index) => (
              <div key={index} className="flex gap-3 mb-3">
                <input
                  type="text"
                  value={opt.text}
                  onChange={(e) => updateOption(index, 'text', e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  className="flex-1 px-4 py-2 rounded-xl bg-charcoal/60 border border-light-teal/20 text-white font-josefin focus:outline-none focus:border-light-teal"
                />
                <input
                  type="number"
                  value={opt.points}
                  onChange={(e) => updateOption(index, 'points', parseInt(e.target.value) || 0)}
                  placeholder="Points"
                  className="w-24 px-4 py-2 rounded-xl bg-charcoal/60 border border-light-teal/20 text-white font-josefin focus:outline-none focus:border-light-teal"
                />
              </div>
            ))}
            {question.type === 'MULTIPLE_CHOICE' && (
              <button onClick={addOption} className="text-light-teal hover:text-hot-pink text-sm font-josefin">
                + Add Option
              </button>
            )}
          </div>
        )}

        {/* Scale Settings */}
        {question.type === 'SCALE' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-josefin text-gray-300 mb-2">Min Value</label>
              <input
                type="number"
                value={question.scaleMin}
                onChange={(e) => onChange({ ...question, scaleMin: parseInt(e.target.value) || 1 })}
                className="w-full px-4 py-2 rounded-xl bg-charcoal/60 border border-light-teal/20 text-white font-josefin"
              />
            </div>
            <div>
              <label className="block text-sm font-josefin text-gray-300 mb-2">Max Value</label>
              <input
                type="number"
                value={question.scaleMax}
                onChange={(e) => onChange({ ...question, scaleMax: parseInt(e.target.value) || 10 })}
                className="w-full px-4 py-2 rounded-xl bg-charcoal/60 border border-light-teal/20 text-white font-josefin"
              />
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-6 py-3 rounded-xl font-josefin font-bold bg-gray-700 text-white hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={!question.questionText || saving}
            className={`flex-1 px-6 py-3 rounded-xl font-josefin font-bold ${
              !question.questionText || saving
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-br from-hot-pink to-light-teal text-white hover:scale-105'
            }`}
          >
            {saving ? 'Adding...' : 'Add Question'}
          </button>
        </div>
      </div>
    </div>
  )
}
