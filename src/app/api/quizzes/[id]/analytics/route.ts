import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  calculateCompletionRate,
  calculateAverageScore,
  calculateDropOffRate,
} from '@/lib/quiz-utils'

// GET /api/quizzes/[id]/analytics - Get analytics for quiz (owner only)
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { id } = params

    // Check ownership
    const quiz = await prisma.quiz.findUnique({
      where: { id },
      include: {
        analytics: {
          orderBy: { date: 'desc' },
          take: 30,
        },
        responses: {
          select: {
            score: true,
            timeSpent: true,
            completedAt: true,
            answers: true,
          },
        },
        questions: {
          select: {
            id: true,
            questionText: true,
            questionType: true,
          },
        },
      },
    })

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 })
    }

    if (quiz.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Calculate overall stats
    const totalViews = quiz.viewCount
    const totalStarts = quiz.analytics.reduce((sum, a) => sum + a.starts, 0)
    const totalCompletions = quiz.completionCount
    const completionRate = calculateCompletionRate(totalStarts, totalCompletions)
    const dropOffRate = calculateDropOffRate(totalStarts, totalCompletions)
    const avgScore = calculateAverageScore(quiz.responses)

    // Calculate average time spent
    const avgTimeSpent =
      quiz.responses.length > 0
        ? Math.round(
            quiz.responses.reduce((sum, r) => sum + (r.timeSpent || 0), 0) /
              quiz.responses.length
          )
        : 0

    // Calculate question-level stats
    const questionStats = quiz.questions.map((q) => {
      const answers = quiz.responses
        .map((r) => {
          const parsedAnswers = typeof r.answers === 'string' ? JSON.parse(r.answers) : r.answers
          return parsedAnswers[q.id]
        })
        .filter((a) => a !== undefined)

      // Count answer frequency
      const answerCounts: Record<string, number> = {}
      answers.forEach((answer) => {
        const key = Array.isArray(answer) ? answer.join(', ') : String(answer)
        answerCounts[key] = (answerCounts[key] || 0) + 1
      })

      const popularAnswers = Object.entries(answerCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([answer, count]) => ({ answer, count }))

      return {
        questionId: q.id,
        questionText: q.questionText,
        questionType: q.questionType,
        answerCount: answers.length,
        popularAnswers,
      }
    })

    // Calculate daily trends
    const dailyStats = quiz.analytics.map((a) => ({
      date: a.date,
      views: a.views,
      starts: a.starts,
      completions: a.completions,
      avgScore: a.avgScore,
      avgTimeSpent: a.avgTimeSpent,
    }))

    // Calculate completion over time
    const completionsByDate = quiz.responses.reduce((acc, r) => {
      const date = new Date(r.completedAt)
      date.setHours(0, 0, 0, 0)
      const key = date.toISOString().split('T')[0]
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const completionTrend = Object.entries(completionsByDate)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))

    return NextResponse.json({
      overview: {
        totalViews,
        totalStarts,
        totalCompletions,
        completionRate,
        dropOffRate,
        avgScore,
        avgTimeSpent,
      },
      questionStats,
      dailyStats,
      completionTrend,
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}
