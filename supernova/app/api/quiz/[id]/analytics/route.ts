import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/prisma'

/**
 * Get quiz analytics
 * GET /api/quiz/[id]/analytics
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const quizId = params.id

    // Get quiz basic info
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      select: {
        id: true,
        title: true,
        totalViews: true,
        totalStarts: true,
        totalCompletions: true,
        createdAt: true,
      },
    })

    if (!quiz) {
      return NextResponse.json(
        { error: 'Quiz not found' },
        { status: 404 }
      )
    }

    // Calculate completion rate
    const completionRate =
      quiz.totalStarts > 0
        ? (quiz.totalCompletions / quiz.totalStarts) * 100
        : 0

    // Get recent responses with details
    const responses = await prisma.quizResponse.findMany({
      where: {
        quizId,
        completedAt: { not: null },
      },
      select: {
        id: true,
        email: true,
        name: true,
        totalScore: true,
        resultTierId: true,
        completedAt: true,
        timeSpent: true,
      },
      orderBy: { completedAt: 'desc' },
      take: 20,
    })

    // Calculate average time spent
    const totalTime = responses.reduce((sum, r) => sum + (r.timeSpent || 0), 0)
    const avgTimeSpent = responses.length > 0 ? Math.round(totalTime / responses.length) : 0

    // Get result tier counts
    const resultTiers = await prisma.resultTier.findMany({
      where: { quizId },
      select: { id: true, name: true },
    })

    const resultCounts: Record<string, number> = {}
    responses.forEach((r) => {
      if (r.resultTierId) {
        resultCounts[r.resultTierId] = (resultCounts[r.resultTierId] || 0) + 1
      }
    })

    const topResults = Object.entries(resultCounts)
      .map(([tierId, count]) => {
        const tier = resultTiers.find((t) => t.id === tierId)
        return {
          tierName: tier?.name || 'Unknown',
          count,
          percentage: (count / responses.length) * 100,
        }
      })
      .sort((a, b) => b.count - a.count)

    // Get daily stats (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const dailyStats = await prisma.quizAnalytics.findMany({
      where: {
        quizId,
        date: { gte: thirtyDaysAgo },
      },
      orderBy: { date: 'desc' },
      select: {
        date: true,
        views: true,
        starts: true,
        completions: true,
      },
    })

    return NextResponse.json({
      success: true,
      analytics: {
        quiz,
        completionRate,
        avgTimeSpent,
        topResults,
        recentResponses: responses,
        dailyStats,
      },
    })
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}
