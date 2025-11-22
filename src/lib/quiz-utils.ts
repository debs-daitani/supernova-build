// Quiz Utility Functions

import { PERSONALITY_CATEGORIES, SCORING_SETTINGS, VALIDATION } from './quiz-config'

// Generate unique slug from title
export function generateQuizSlug(title: string, id?: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50)

  return id ? `${slug}-${id.substring(0, 8)}` : slug
}

// Calculate total score for scored quiz
export function calculateTotalScore(
  answers: Record<string, any>,
  questions: any[]
): number {
  let total = 0

  questions.forEach((question) => {
    const answer = answers[question.id]
    if (!answer) return

    if (question.questionType === 'MULTIPLE_CHOICE') {
      // Answer is array of selected options
      if (Array.isArray(answer)) {
        answer.forEach((selectedOption: string) => {
          const option = question.options?.find((o: any) => o.text === selectedOption)
          if (option?.points) {
            total += option.points
          }
        })
      }
    } else if (question.questionType === 'SINGLE_CHOICE') {
      const option = question.options?.find((o: any) => o.text === answer)
      if (option?.points) {
        total += option.points
      }
    } else if (question.questionType === 'SCALE') {
      // Scale questions use numeric value as points
      total += parseInt(answer) || 0
    } else if (question.questionType === 'YES_NO') {
      total += answer === 'Yes' ? (question.points || 10) : 0
    }
  })

  return total
}

// Calculate dimensional scores for assessment quiz
export function calculateDimensionalScores(
  answers: Record<string, any>,
  questions: any[]
): Record<string, number> {
  const dimensionScores: Record<string, number> = {}

  questions.forEach((question) => {
    if (!question.dimension) return

    const answer = answers[question.id]
    if (!answer) return

    if (!dimensionScores[question.dimension]) {
      dimensionScores[question.dimension] = 0
    }

    if (question.questionType === 'MULTIPLE_CHOICE') {
      if (Array.isArray(answer)) {
        answer.forEach((selectedOption: string) => {
          const option = question.options?.find((o: any) => o.text === selectedOption)
          if (option?.points) {
            dimensionScores[question.dimension] += option.points
          }
        })
      }
    } else if (question.questionType === 'SINGLE_CHOICE') {
      const option = question.options?.find((o: any) => o.text === answer)
      if (option?.points) {
        dimensionScores[question.dimension] += option.points
      }
    } else if (question.questionType === 'SCALE') {
      dimensionScores[question.dimension] += parseInt(answer) || 0
    }
  })

  return dimensionScores
}

// Calculate personality type (most common answer category)
export function calculatePersonalityType(
  answers: Record<string, any>,
  questions: any[]
): string {
  const categoryCounts: Record<string, number> = {}

  questions.forEach((question) => {
    const answer = answers[question.id]
    if (!answer) return

    if (question.questionType === 'SINGLE_CHOICE') {
      const option = question.options?.find((o: any) => o.text === answer)
      if (option?.category) {
        categoryCounts[option.category] = (categoryCounts[option.category] || 0) + 1
      }
    } else if (question.questionType === 'MULTIPLE_CHOICE') {
      if (Array.isArray(answer)) {
        answer.forEach((selectedOption: string) => {
          const option = question.options?.find((o: any) => o.text === selectedOption)
          if (option?.category) {
            categoryCounts[option.category] = (categoryCounts[option.category] || 0) + 1
          }
        })
      }
    }
  })

  // Find category with highest count
  let maxCategory = ''
  let maxCount = 0

  Object.entries(categoryCounts).forEach(([category, count]) => {
    if (count > maxCount) {
      maxCount = count
      maxCategory = category
    }
  })

  return maxCategory || 'A'
}

// Determine result based on quiz type and score
export function determineResult(
  quizType: string,
  score: number | null,
  personalityType: string | null,
  dimensionScores: Record<string, number> | null,
  results: any[]
): any {
  if (!results || results.length === 0) {
    return null
  }

  if (quizType === 'SCORED') {
    // Find result where score is within min/max range
    return results.find(
      (r) =>
        score !== null &&
        (r.minScore === null || score >= r.minScore) &&
        (r.maxScore === null || score <= r.maxScore)
    ) || results[0]
  }

  if (quizType === 'PERSONALITY') {
    // Find result matching personality type
    const result = results.find((r) => {
      if (!r.conditions) return false
      const conditions = typeof r.conditions === 'string' ? JSON.parse(r.conditions) : r.conditions
      return conditions.category === personalityType
    })
    return result || results[0]
  }

  if (quizType === 'ASSESSMENT') {
    // Find result based on dimensional scores (could be complex logic)
    // For now, return first result
    // In production, this would evaluate dimension thresholds
    return results[0]
  }

  // For SURVEY or LEAD_MAGNET, return first result (thank you page)
  return results[0]
}

// Evaluate logic condition
export function evaluateLogicCondition(
  conditionType: string,
  conditionValue: string,
  answer: any,
  score: number | null
): boolean {
  switch (conditionType) {
    case 'IF_ANSWER_EQUALS':
      return answer === conditionValue

    case 'IF_ANSWER_CONTAINS':
      if (typeof answer === 'string') {
        return answer.toLowerCase().includes(conditionValue.toLowerCase())
      }
      if (Array.isArray(answer)) {
        return answer.some((a) =>
          a.toLowerCase().includes(conditionValue.toLowerCase())
        )
      }
      return false

    case 'IF_SCORE_GREATER_THAN':
      return score !== null && score > parseInt(conditionValue)

    case 'IF_SCORE_LESS_THAN':
      return score !== null && score < parseInt(conditionValue)

    default:
      return false
  }
}

// Get next question based on logic rules
export function getNextQuestion(
  currentQuestion: any,
  answer: any,
  score: number | null,
  questions: any[]
): any {
  // Check if current question has logic rules
  if (!currentQuestion.logicRules || currentQuestion.logicRules.length === 0) {
    // No logic, return next question in order
    const currentIndex = questions.findIndex((q) => q.id === currentQuestion.id)
    return questions[currentIndex + 1] || null
  }

  // Evaluate logic rules
  for (const rule of currentQuestion.logicRules) {
    if (evaluateLogicCondition(rule.conditionType, rule.conditionValue, answer, score)) {
      if (rule.actionType === 'SKIP_TO_QUESTION') {
        return questions.find((q) => q.id === rule.actionValue) || null
      }
      if (rule.actionType === 'SHOW_RESULT') {
        return null // End quiz and show result
      }
    }
  }

  // No matching logic, return next question in order
  const currentIndex = questions.findIndex((q) => q.id === currentQuestion.id)
  return questions[currentIndex + 1] || null
}

// Calculate completion percentage
export function calculateProgress(
  currentQuestionIndex: number,
  totalQuestions: number
): number {
  if (totalQuestions === 0) return 0
  return Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100)
}

// Calculate completion rate
export function calculateCompletionRate(starts: number, completions: number): number {
  if (starts === 0) return 0
  return Math.round((completions / starts) * 100)
}

// Calculate average score
export function calculateAverageScore(responses: any[]): number {
  if (responses.length === 0) return 0

  const total = responses.reduce((sum, r) => sum + (r.score || 0), 0)
  return Math.round(total / responses.length)
}

// Calculate drop-off rate
export function calculateDropOffRate(starts: number, completions: number): number {
  if (starts === 0) return 0
  return Math.round(((starts - completions) / starts) * 100)
}

// Validate quiz data
export function validateQuiz(quiz: any): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!quiz.title || quiz.title.trim().length === 0) {
    errors.push('Title is required')
  }

  if (quiz.title && quiz.title.length > VALIDATION.MAX_TITLE_LENGTH) {
    errors.push(`Title must be less than ${VALIDATION.MAX_TITLE_LENGTH} characters`)
  }

  if (!quiz.questions || quiz.questions.length < VALIDATION.MIN_QUESTIONS) {
    errors.push(`Quiz must have at least ${VALIDATION.MIN_QUESTIONS} question`)
  }

  if (quiz.questions && quiz.questions.length > VALIDATION.MAX_QUESTIONS) {
    errors.push(`Quiz cannot have more than ${VALIDATION.MAX_QUESTIONS} questions`)
  }

  // Validate each question
  if (quiz.questions) {
    quiz.questions.forEach((q: any, index: number) => {
      if (!q.questionText || q.questionText.trim().length === 0) {
        errors.push(`Question ${index + 1}: Question text is required`)
      }

      if (
        (q.questionType === 'MULTIPLE_CHOICE' || q.questionType === 'SINGLE_CHOICE') &&
        (!q.options || q.options.length < VALIDATION.MIN_OPTIONS)
      ) {
        errors.push(
          `Question ${index + 1}: Must have at least ${VALIDATION.MIN_OPTIONS} options`
        )
      }
    })
  }

  // Validate results
  if (!quiz.results || quiz.results.length < VALIDATION.MIN_RESULTS) {
    errors.push('Quiz must have at least one result page')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

// Validate email format
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Format time spent (seconds to human readable)
export function formatTimeSpent(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`
  }

  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  if (minutes < 60) {
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`
  }

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
}

// Format score as percentage
export function formatScorePercentage(score: number, totalScore: number): string {
  if (totalScore === 0) return '0%'
  return `${Math.round((score / totalScore) * 100)}%`
}

// Get random questions for shuffling
export function shuffleQuestions(questions: any[]): any[] {
  const shuffled = [...questions]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// Generate embed code
export function generateEmbedCode(
  quizSlug: string,
  type: string = 'INLINE',
  width: string = '100%',
  height: string = '600px'
): string {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
  const quizUrl = `${baseUrl}/quiz/${quizSlug}`

  if (type === 'INLINE') {
    return `<iframe
  src="${quizUrl}"
  width="${width}"
  height="${height}"
  frameborder="0"
  style="border: none;">
</iframe>`
  }

  if (type === 'POPUP') {
    return `<script>
  function openQuiz() {
    window.open('${quizUrl}', 'quiz', 'width=800,height=600,scrollbars=yes');
  }
</script>
<button onclick="openQuiz()">Take Quiz</button>`
  }

  return ''
}

// Export responses to CSV
export function exportToCSV(responses: any[], questions: any[]): string {
  if (responses.length === 0) return ''

  // Headers
  const headers = [
    'Name',
    'Email',
    'Score',
    'Result',
    'Completed At',
    'Time Spent',
    ...questions.map((q) => q.questionText),
  ]

  // Rows
  const rows = responses.map((response) => {
    const answers = typeof response.answers === 'string'
      ? JSON.parse(response.answers)
      : response.answers

    return [
      response.respondentName || '',
      response.respondentEmail || '',
      response.score || '',
      response.result?.title || '',
      new Date(response.completedAt).toLocaleString(),
      formatTimeSpent(response.timeSpent || 0),
      ...questions.map((q) => {
        const answer = answers[q.id]
        return Array.isArray(answer) ? answer.join(', ') : answer || ''
      }),
    ]
  })

  // Combine
  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell}"`).join(','))
    .join('\n')

  return csv
}

// Calculate max possible score
export function calculateMaxScore(questions: any[]): number {
  let maxScore = 0

  questions.forEach((question) => {
    if (question.questionType === 'MULTIPLE_CHOICE' && question.options) {
      const maxOption = Math.max(...question.options.map((o: any) => o.points || 0))
      maxScore += maxOption
    } else if (question.questionType === 'SINGLE_CHOICE' && question.options) {
      const maxOption = Math.max(...question.options.map((o: any) => o.points || 0))
      maxScore += maxOption
    } else if (question.questionType === 'SCALE') {
      maxScore += 10 // Max scale value
    } else if (question.questionType === 'YES_NO') {
      maxScore += question.points || SCORING_SETTINGS.DEFAULT_POINTS
    }
  })

  return maxScore
}

// Sanitize HTML for safe display
export function sanitizeHtml(html: string): string {
  // Basic sanitization - remove script tags and on* attributes
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/g, '')
    .replace(/on\w+='[^']*'/g, '')
}

// Get quiz type color
export function getQuizTypeColor(quizType: string): string {
  const colors: Record<string, string> = {
    SCORED: '#3B82F6', // Blue
    PERSONALITY: '#EC4899', // Pink
    ASSESSMENT: '#8B5CF6', // Purple
    SURVEY: '#10B981', // Green
    LEAD_MAGNET: '#F59E0B', // Orange
  }
  return colors[quizType] || '#6B7280'
}

// Get question type icon
export function getQuestionTypeIcon(questionType: string): string {
  const icons: Record<string, string> = {
    MULTIPLE_CHOICE: 'check-square',
    SINGLE_CHOICE: 'circle-dot',
    TEXT: 'text',
    EMAIL: 'at-sign',
    SCALE: 'sliders',
    YES_NO: 'toggle-left',
    DROPDOWN: 'chevron-down',
  }
  return icons[questionType] || 'help-circle'
}
