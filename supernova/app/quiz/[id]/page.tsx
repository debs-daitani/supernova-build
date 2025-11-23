'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { trackQuizView, trackQuizStart } from '../../../lib/quiz-scoring'

interface Quiz {
  id: string
  title: string
  description: string
  coverImage: string | null
  primaryColor: string
  secondaryColor: string
  logoUrl: string | null
  showProgressBar: boolean
  requireEmail: boolean
  collectPhone: boolean
  questions: Question[]
}

interface Question {
  id: string
  questionText: string
  description: string | null
  type: string
  required: boolean
  order: number
  imageUrl: string | null
  options: QuestionOption[]
  scaleMin: number | null
  scaleMax: number | null
  scaleMinLabel: string | null
  scaleMaxLabel: string | null
}

interface QuestionOption {
  id: string
  text: string
  imageUrl: string | null
  order: number
  points: number
}

export default function QuizPage() {
  const params = useParams()
  const router = useRouter()
  const quizId = params.id as string

  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentStep, setCurrentStep] = useState<'start' | 'quiz' | 'contact' | 'results'>('start')
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})

  // Contact info
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')

  // Results
  const [result, setResult] = useState<any>(null)
  const [submitting, setSubmitting] = useState(false)

  // Timing
  const [startTime] = useState(Date.now())

  useEffect(() => {
    loadQuiz()
  }, [quizId])

  const loadQuiz = async () => {
    try {
      const response = await fetch(`/api/quiz/${quizId}`)
      const data = await response.json()

      if (data.success) {
        setQuiz(data.quiz)
        // Track view
        trackQuizView(quizId)
      } else {
        alert('Quiz not found')
        router.push('/')
      }
    } catch (error) {
      console.error('Load quiz error:', error)
      alert('Failed to load quiz')
    } finally {
      setLoading(false)
    }
  }

  const handleStart = () => {
    setCurrentStep('quiz')
    trackQuizStart(quizId)
  }

  const handleAnswer = (questionId: string, answer: any) => {
    setAnswers({ ...answers, [questionId]: answer })
  }

  const handleNext = () => {
    if (!quiz) return

    const currentQuestion = quiz.questions[currentQuestionIndex]

    // Validate required question
    if (currentQuestion.required && !answers[currentQuestion.id]) {
      alert('This question is required')
      return
    }

    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      // Move to contact info
      setCurrentStep('contact')
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const handleSubmit = async () => {
    if (!email) {
      alert('Email is required')
      return
    }

    setSubmitting(true)

    try {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000) // seconds

      const response = await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizId,
          answers: Object.entries(answers).map(([questionId, answer]) => ({
            questionId,
            answer,
          })),
          email,
          name,
          phone,
          timeSpent,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setResult(data.result)
        setCurrentStep('results')
      } else {
        alert('Failed to submit quiz')
      }
    } catch (error) {
      console.error('Submit error:', error)
      alert('Error submitting quiz')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white font-josefin text-xl">Loading quiz...</div>
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white font-josefin text-xl">Quiz not found</div>
      </div>
    )
  }

  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100

  return (
    <div
      className="min-h-screen bg-black text-white flex items-center justify-center p-4"
      style={{
        backgroundImage: 'url("/images/dAitaniverse Stage.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="w-full max-w-3xl">
        {/* START SCREEN */}
        {currentStep === 'start' && (
          <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-light-teal/20 p-12 text-center">
            {quiz.coverImage && (
              <img
                src={quiz.coverImage}
                alt={quiz.title}
                className="w-full max-w-md mx-auto rounded-xl mb-8"
              />
            )}

            <h1
              className="text-5xl font-supernova mb-6"
              style={{ color: quiz.primaryColor }}
            >
              {quiz.title}
            </h1>

            {quiz.description && (
              <p className="text-xl font-josefin text-gray-300 mb-8 leading-relaxed">
                {quiz.description}
              </p>
            )}

            <button
              onClick={handleStart}
              className="px-12 py-6 rounded-xl font-josefin font-bold text-lg transition-all hover:scale-105 shadow-[0_0_30px_rgba(255,0,142,0.4)]"
              style={{
                background: `linear-gradient(135deg, ${quiz.primaryColor}, ${quiz.secondaryColor})`,
              }}
            >
              Start Quiz →
            </button>
          </div>
        )}

        {/* QUIZ QUESTIONS */}
        {currentStep === 'quiz' && (
          <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-light-teal/20 p-8">
            {/* Progress Bar */}
            {quiz.showProgressBar && (
              <div className="mb-8">
                <div className="flex justify-between text-sm font-josefin text-gray-400 mb-2">
                  <span>Question {currentQuestionIndex + 1} of {quiz.questions.length}</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="w-full h-2 bg-charcoal/60 rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all duration-300"
                    style={{
                      width: `${progress}%`,
                      background: `linear-gradient(90deg, ${quiz.primaryColor}, ${quiz.secondaryColor})`,
                    }}
                  />
                </div>
              </div>
            )}

            <QuestionRenderer
              question={quiz.questions[currentQuestionIndex]}
              answer={answers[quiz.questions[currentQuestionIndex].id]}
              onAnswer={(answer) => handleAnswer(quiz.questions[currentQuestionIndex].id, answer)}
              primaryColor={quiz.primaryColor}
            />

            {/* Navigation */}
            <div className="flex gap-4 mt-8">
              {currentQuestionIndex > 0 && (
                <button
                  onClick={handlePrevious}
                  className="px-6 py-3 rounded-xl font-josefin font-bold bg-gray-700 text-white hover:bg-gray-600 transition-all"
                >
                  ← Previous
                </button>
              )}
              <button
                onClick={handleNext}
                className="flex-1 px-6 py-3 rounded-xl font-josefin font-bold text-white transition-all hover:scale-105"
                style={{
                  background: `linear-gradient(135deg, ${quiz.primaryColor}, ${quiz.secondaryColor})`,
                }}
              >
                {currentQuestionIndex < quiz.questions.length - 1 ? 'Next →' : 'Continue →'}
              </button>
            </div>
          </div>
        )}

        {/* CONTACT INFO */}
        {currentStep === 'contact' && (
          <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-light-teal/20 p-8">
            <h2 className="text-3xl font-supernova mb-2" style={{ color: quiz.primaryColor }}>
              Get Your Results
            </h2>
            <p className="text-gray-400 font-josefin mb-6">
              Enter your email to receive your personalized results
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-josefin text-gray-300 mb-2">
                  Email {quiz.requireEmail && '*'}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 rounded-xl bg-charcoal/60 border border-light-teal/20 text-white font-josefin focus:outline-none focus:border-light-teal"
                />
              </div>

              <div>
                <label className="block text-sm font-josefin text-gray-300 mb-2">Name (optional)</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full px-4 py-3 rounded-xl bg-charcoal/60 border border-light-teal/20 text-white font-josefin focus:outline-none focus:border-light-teal"
                />
              </div>

              {quiz.collectPhone && (
                <div>
                  <label className="block text-sm font-josefin text-gray-300 mb-2">Phone (optional)</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+44 7700 900000"
                    className="w-full px-4 py-3 rounded-xl bg-charcoal/60 border border-light-teal/20 text-white font-josefin focus:outline-none focus:border-light-teal"
                  />
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={!email || submitting}
                className={`w-full px-6 py-4 rounded-xl font-josefin font-bold text-white transition-all ${
                  !email || submitting
                    ? 'bg-gray-700 cursor-not-allowed'
                    : 'hover:scale-105 shadow-[0_0_30px_rgba(255,0,142,0.4)]'
                }`}
                style={{
                  background: !email || submitting ? undefined : `linear-gradient(135deg, ${quiz.primaryColor}, ${quiz.secondaryColor})`,
                }}
              >
                {submitting ? 'Calculating...' : 'Get My Results →'}
              </button>
            </div>
          </div>
        )}

        {/* RESULTS */}
        {currentStep === 'results' && result && (
          <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-light-teal/20 p-8">
            <div className="text-center mb-8">
              <div className="text-6xl font-supernova mb-4" style={{ color: quiz.primaryColor }}>
                {result.totalScore}
              </div>
              <div className="text-gray-400 font-josefin">Your Score</div>
            </div>

            {result.resultTier && (
              <div className="mb-8">
                <h2 className="text-3xl font-supernova mb-4" style={{ color: quiz.secondaryColor }}>
                  {result.resultTier.name}
                </h2>
                <p className="text-lg font-josefin text-gray-300 leading-relaxed">
                  {result.resultTier.description}
                </p>

                {result.resultTier.ctaText && result.resultTier.ctaUrl && (
                  <a
                    href={result.resultTier.ctaUrl}
                    className="inline-block mt-6 px-8 py-4 rounded-xl font-josefin font-bold text-white transition-all hover:scale-105 shadow-[0_0_30px_rgba(255,0,142,0.4)]"
                    style={{
                      background: `linear-gradient(135deg, ${quiz.primaryColor}, ${quiz.secondaryColor})`,
                    }}
                  >
                    {result.resultTier.ctaText}
                  </a>
                )}
              </div>
            )}

            {result.recommendedPrograms.length > 0 && (
              <div className="mt-8 pt-8 border-t border-light-teal/20">
                <h3 className="text-2xl font-supernova mb-4" style={{ color: quiz.secondaryColor }}>
                  Recommended Programs
                </h3>
                <div className="space-y-4">
                  {result.recommendedPrograms.map((program: any) => (
                    <div
                      key={program.id}
                      className="p-4 rounded-xl bg-charcoal/40 border border-light-teal/20"
                    >
                      <div className="text-sm text-gray-400 mb-1">{program.pillar}</div>
                      <div className="text-lg font-josefin font-bold text-light-teal">
                        {program.title}
                      </div>
                      <div className="text-sm text-gray-300 mt-1">{program.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8 p-6 rounded-xl bg-gradient-to-r from-hot-pink/10 to-light-teal/10 border border-light-teal/30">
              <p className="font-josefin text-center">
                📧 Check your email for your full results and personalized recommendations!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Question Renderer Component
function QuestionRenderer({
  question,
  answer,
  onAnswer,
  primaryColor,
}: {
  question: Question
  answer: any
  onAnswer: (answer: any) => void
  primaryColor: string
}) {
  return (
    <div>
      {question.imageUrl && (
        <img
          src={question.imageUrl}
          alt="Question"
          className="w-full max-w-md mx-auto rounded-xl mb-6"
        />
      )}

      <h2 className="text-2xl font-supernova mb-2" style={{ color: primaryColor }}>
        {question.questionText}
      </h2>

      {question.description && (
        <p className="text-gray-400 font-josefin mb-6">{question.description}</p>
      )}

      {/* Multiple Choice */}
      {question.type === 'MULTIPLE_CHOICE' && (
        <div className="space-y-3">
          {question.options.map((option) => (
            <button
              key={option.id}
              onClick={() => onAnswer(option.id)}
              className={`w-full p-4 rounded-xl font-josefin text-left transition-all ${
                answer === option.id
                  ? 'bg-light-teal/20 border-2 border-light-teal'
                  : 'bg-charcoal/40 border border-light-teal/20 hover:border-light-teal/50'
              }`}
            >
              {option.text}
            </button>
          ))}
        </div>
      )}

      {/* Yes/No */}
      {question.type === 'YES_NO' && (
        <div className="grid grid-cols-2 gap-4">
          {question.options.map((option) => (
            <button
              key={option.id}
              onClick={() => onAnswer(option.id)}
              className={`p-6 rounded-xl font-josefin font-bold text-lg transition-all ${
                answer === option.id
                  ? 'bg-light-teal/20 border-2 border-light-teal'
                  : 'bg-charcoal/40 border border-light-teal/20 hover:border-light-teal/50'
              }`}
            >
              {option.text}
            </button>
          ))}
        </div>
      )}

      {/* Scale */}
      {question.type === 'SCALE' && (
        <div>
          <div className="flex justify-between mb-6">
            {Array.from(
              { length: (question.scaleMax || 10) - (question.scaleMin || 1) + 1 },
              (_, i) => i + (question.scaleMin || 1)
            ).map((value) => (
              <button
                key={value}
                onClick={() => onAnswer(value)}
                className={`w-12 h-12 rounded-full font-josefin font-bold transition-all ${
                  answer === value
                    ? 'bg-light-teal text-charcoal scale-110'
                    : 'bg-charcoal/40 border border-light-teal/20 hover:border-light-teal'
                }`}
              >
                {value}
              </button>
            ))}
          </div>
          <div className="flex justify-between text-sm text-gray-400 font-josefin">
            <span>{question.scaleMinLabel}</span>
            <span>{question.scaleMaxLabel}</span>
          </div>
        </div>
      )}

      {/* Short Text */}
      {question.type === 'SHORT_TEXT' && (
        <input
          type="text"
          value={answer || ''}
          onChange={(e) => onAnswer(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-charcoal/60 border border-light-teal/20 text-white font-josefin focus:outline-none focus:border-light-teal"
          placeholder="Your answer..."
        />
      )}

      {/* Long Text */}
      {question.type === 'LONG_TEXT' && (
        <textarea
          value={answer || ''}
          onChange={(e) => onAnswer(e.target.value)}
          rows={5}
          className="w-full px-4 py-3 rounded-xl bg-charcoal/60 border border-light-teal/20 text-white font-josefin focus:outline-none focus:border-light-teal resize-none"
          placeholder="Your answer..."
        />
      )}
    </div>
  )
}
