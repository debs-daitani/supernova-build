'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, CheckCircle, Loader } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  getNextQuestion,
  calculateProgress,
  shuffleQuestions,
  validateEmail,
} from '@/lib/quiz-utils'

export default function TakeQuizPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [quiz, setQuiz] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [respondentName, setRespondentName] = useState('')
  const [respondentEmail, setRespondentEmail] = useState('')
  const [showEmailCapture, setShowEmailCapture] = useState(false)
  const [startTime] = useState(Date.now())
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (slug) {
      fetchQuiz()
    }
  }, [slug])

  const fetchQuiz = async () => {
    try {
      const res = await fetch(`/api/quizzes/${slug}`)
      if (!res.ok) {
        setError('Quiz not found')
        setLoading(false)
        return
      }

      const data = await res.json()
      if (!data.isPublished) {
        setError('This quiz is not published')
        setLoading(false)
        return
      }

      // Shuffle questions if enabled
      if (data.shuffleQuestions) {
        data.questions = shuffleQuestions(data.questions)
      }

      setQuiz(data)
    } catch (error) {
      console.error('Error fetching quiz:', error)
      setError('Failed to load quiz')
    } finally {
      setLoading(false)
    }
  }

  const handleAnswer = (questionId: string, value: any) => {
    setAnswers({ ...answers, [questionId]: value })
  }

  const handleNext = () => {
    const currentQuestion = quiz.questions[currentQuestionIndex]

    // Validate required question
    if (currentQuestion.required && !answers[currentQuestion.id]) {
      alert('This question is required')
      return
    }

    // Check if this is the last question
    if (currentQuestionIndex === quiz.questions.length - 1) {
      // Show email capture if required
      if (quiz.requireEmail) {
        setShowEmailCapture(true)
      } else {
        submitQuiz()
      }
    } else {
      // TODO: Implement logic-based navigation
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const submitQuiz = async () => {
    // Validate email if required
    if (quiz.requireEmail) {
      if (!respondentEmail) {
        alert('Email is required')
        return
      }
      if (!validateEmail(respondentEmail)) {
        alert('Please enter a valid email')
        return
      }
    }

    setSubmitting(true)

    try {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000)

      const res = await fetch(`/api/quizzes/${quiz.id}/responses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers,
          respondentName,
          respondentEmail,
          timeSpent,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setResult(data)

        // Redirect if configured
        if (quiz.redirectUrl) {
          window.location.href = quiz.redirectUrl
        }
      } else {
        alert('Failed to submit quiz')
      }
    } catch (error) {
      console.error('Error submitting quiz:', error)
      alert('Failed to submit quiz')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-orange-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (error || !quiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-orange-50 flex items-center justify-center">
        <Card className="p-12 text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4">{error || 'Quiz not found'}</h2>
          <p className="text-gray-600 mb-6">
            This quiz may have been removed or is no longer available
          </p>
        </Card>
      </div>
    )
  }

  // Show result page
  if (result) {
    const resultData = result.result || {}

    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-orange-50 flex items-center justify-center p-4">
        <Card className="p-12 text-center max-w-2xl">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4">{resultData.title || 'Thank You!'}</h2>

          {resultData.showScore && result.score !== null && (
            <div className="mb-6">
              <div className="text-6xl font-bold text-purple-600 mb-2">{result.score}</div>
              <div className="text-gray-600">Your Score</div>
            </div>
          )}

          {resultData.imageUrl && (
            <img
              src={resultData.imageUrl}
              alt={resultData.title}
              className="w-full max-w-md mx-auto rounded-lg mb-6"
            />
          )}

          <p className="text-gray-700 text-lg mb-8 whitespace-pre-wrap">
            {resultData.description || quiz.thankYouMessage || 'Thank you for completing this quiz!'}
          </p>

          {resultData.ctaUrl && resultData.ctaText && (
            <a href={resultData.ctaUrl} target="_blank" rel="noopener noreferrer">
              <Button className="bg-gradient-to-r from-pink-500 to-purple-500">
                {resultData.ctaText}
              </Button>
            </a>
          )}
        </Card>
      </div>
    )
  }

  // Show email capture
  if (showEmailCapture) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-orange-50 flex items-center justify-center p-4">
        <Card className="p-12 max-w-md w-full">
          <h2 className="text-2xl font-bold mb-6 text-center">One More Step...</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Name (optional)</label>
              <input
                type="text"
                value={respondentName}
                onChange={(e) => setRespondentName(e.target.value)}
                className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter your name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email *</label>
              <input
                type="email"
                value={respondentEmail}
                onChange={(e) => setRespondentEmail(e.target.value)}
                className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter your email"
                required
              />
            </div>
            <Button
              onClick={submitQuiz}
              disabled={submitting}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500"
            >
              {submitting ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Get Results'
              )}
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  const currentQuestion = quiz.questions[currentQuestionIndex]
  const progress = calculateProgress(currentQuestionIndex, quiz.questions.length)

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-orange-50">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{quiz.title}</h1>
          {quiz.description && <p className="text-gray-600">{quiz.description}</p>}
        </div>

        {/* Progress Bar */}
        {quiz.showProgressBar && (
          <div className="mb-8">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>
                Question {currentQuestionIndex + 1} of {quiz.questions.length}
              </span>
              <span>{progress}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-pink-500 to-purple-500 h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Question Card */}
        <Card className="p-8 mb-6">
          <h2 className="text-2xl font-bold mb-6">
            {currentQuestionIndex + 1}. {currentQuestion.questionText}
          </h2>

          {currentQuestion.description && (
            <p className="text-gray-600 mb-6">{currentQuestion.description}</p>
          )}

          {currentQuestion.imageUrl && (
            <img
              src={currentQuestion.imageUrl}
              alt=""
              className="w-full rounded-lg mb-6 max-h-64 object-cover"
            />
          )}

          {/* Question Input */}
          <div className="space-y-3">
            {/* SINGLE_CHOICE */}
            {currentQuestion.questionType === 'SINGLE_CHOICE' && (
              <div className="space-y-2">
                {currentQuestion.options?.map((option: any, index: number) => (
                  <label
                    key={index}
                    className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-purple-50 transition-colors"
                  >
                    <input
                      type="radio"
                      name={currentQuestion.id}
                      value={option.text}
                      checked={answers[currentQuestion.id] === option.text}
                      onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                      className="w-5 h-5"
                    />
                    <span className="flex-1">{option.text}</span>
                  </label>
                ))}
              </div>
            )}

            {/* MULTIPLE_CHOICE */}
            {currentQuestion.questionType === 'MULTIPLE_CHOICE' && (
              <div className="space-y-2">
                {currentQuestion.options?.map((option: any, index: number) => (
                  <label
                    key={index}
                    className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-purple-50 transition-colors"
                  >
                    <input
                      type="checkbox"
                      value={option.text}
                      checked={(answers[currentQuestion.id] || []).includes(option.text)}
                      onChange={(e) => {
                        const current = answers[currentQuestion.id] || []
                        const updated = e.target.checked
                          ? [...current, option.text]
                          : current.filter((v: string) => v !== option.text)
                        handleAnswer(currentQuestion.id, updated)
                      }}
                      className="w-5 h-5"
                    />
                    <span className="flex-1">{option.text}</span>
                  </label>
                ))}
              </div>
            )}

            {/* TEXT */}
            {currentQuestion.questionType === 'TEXT' && (
              <textarea
                value={answers[currentQuestion.id] || ''}
                onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                className="w-full border rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
                rows={4}
                placeholder="Type your answer..."
              />
            )}

            {/* EMAIL */}
            {currentQuestion.questionType === 'EMAIL' && (
              <input
                type="email"
                value={answers[currentQuestion.id] || ''}
                onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                className="w-full border rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="your@email.com"
              />
            )}

            {/* SCALE */}
            {currentQuestion.questionType === 'SCALE' && (
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">1</span>
                  <span className="text-sm text-gray-600">10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={answers[currentQuestion.id] || 5}
                  onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                  className="w-full"
                />
                <div className="text-center mt-2 text-2xl font-bold text-purple-600">
                  {answers[currentQuestion.id] || 5}
                </div>
              </div>
            )}

            {/* YES_NO */}
            {currentQuestion.questionType === 'YES_NO' && (
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleAnswer(currentQuestion.id, 'Yes')}
                  className={`p-6 border-2 rounded-lg font-semibold transition-all ${
                    answers[currentQuestion.id] === 'Yes'
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-300 hover:border-purple-300'
                  }`}
                >
                  Yes
                </button>
                <button
                  onClick={() => handleAnswer(currentQuestion.id, 'No')}
                  className={`p-6 border-2 rounded-lg font-semibold transition-all ${
                    answers[currentQuestion.id] === 'No'
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-300 hover:border-purple-300'
                  }`}
                >
                  No
                </button>
              </div>
            )}

            {/* DROPDOWN */}
            {currentQuestion.questionType === 'DROPDOWN' && (
              <select
                value={answers[currentQuestion.id] || ''}
                onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                className="w-full border rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select an option...</option>
                {currentQuestion.options?.map((option: any, index: number) => (
                  <option key={index} value={option.text}>
                    {option.text}
                  </option>
                ))}
              </select>
            )}
          </div>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between">
          <Button
            onClick={handleBack}
            variant="outline"
            disabled={currentQuestionIndex === 0 || !quiz.allowBack}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <Button
            onClick={handleNext}
            className="bg-gradient-to-r from-pink-500 to-purple-500"
          >
            {currentQuestionIndex === quiz.questions.length - 1 ? 'Submit' : 'Next'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  )
}
