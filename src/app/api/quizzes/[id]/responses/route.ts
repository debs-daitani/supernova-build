import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  calculateTotalScore,
  calculateDimensionalScores,
  calculatePersonalityType,
  determineResult,
  validateEmail,
} from '@/lib/quiz-utils'

// GET /api/quizzes/[id]/responses - List all responses for quiz (owner only)
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
    })

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 })
    }

    if (quiz.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const responses = await prisma.quizResponse.findMany({
      where: { quizId: id },
      include: {
        result: {
          select: {
            id: true,
            title: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePhotoUrl: true,
          },
        },
      },
      orderBy: { completedAt: 'desc' },
      take: limit,
      skip: offset,
    })

    const total = await prisma.quizResponse.count({
      where: { quizId: id },
    })

    return NextResponse.json({ responses, total })
  } catch (error) {
    console.error('Error fetching responses:', error)
    return NextResponse.json({ error: 'Failed to fetch responses' }, { status: 500 })
  }
}

// POST /api/quizzes/[id]/responses - Submit quiz response (public)
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Get quiz with questions and results
    const quiz = await prisma.quiz.findUnique({
      where: { id },
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
        results: {
          orderBy: { order: 'asc' },
        },
      },
    })

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 })
    }

    if (!quiz.isPublished) {
      return NextResponse.json({ error: 'Quiz is not published' }, { status: 403 })
    }

    const body = await req.json()
    const { answers, respondentName, respondentEmail, timeSpent } = body

    if (!answers || typeof answers !== 'object') {
      return NextResponse.json({ error: 'Answers are required' }, { status: 400 })
    }

    // Validate email if required
    if (quiz.requireEmail) {
      if (!respondentEmail) {
        return NextResponse.json({ error: 'Email is required' }, { status: 400 })
      }
      if (!validateEmail(respondentEmail)) {
        return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
      }
    }

    // Calculate scores based on quiz type
    let score: number | null = null
    let dimensionScores: Record<string, number> | null = null
    let personalityType: string | null = null

    if (quiz.quizType === 'SCORED') {
      score = calculateTotalScore(answers, quiz.questions)
    } else if (quiz.quizType === 'ASSESSMENT') {
      dimensionScores = calculateDimensionalScores(answers, quiz.questions)
    } else if (quiz.quizType === 'PERSONALITY') {
      personalityType = calculatePersonalityType(answers, quiz.questions)
    }

    // Determine which result to show
    const result = determineResult(
      quiz.quizType,
      score,
      personalityType,
      dimensionScores,
      quiz.results
    )

    // Get user if authenticated
    const session = await getServerSession(authOptions)
    let userId: string | null = null

    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
      })
      userId = user?.id || null
    }

    // Create response
    const response = await prisma.quizResponse.create({
      data: {
        quizId: id,
        userId,
        answers,
        score,
        dimensionScores,
        personalityType,
        resultId: result?.id || null,
        respondentName: respondentName || null,
        respondentEmail: respondentEmail || null,
        timeSpent: timeSpent || 0,
        completedAt: new Date(),
      },
      include: {
        result: true,
      },
    })

    // Update quiz completion count
    await prisma.quiz.update({
      where: { id },
      data: {
        completionCount: { increment: 1 },
      },
    })

    // Update analytics
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    await prisma.quizAnalytics.upsert({
      where: {
        quizId_date: {
          quizId: id,
          date: today,
        },
      },
      create: {
        quizId: id,
        date: today,
        views: 0,
        starts: 1,
        completions: 1,
        avgScore: score || 0,
        avgTimeSpent: timeSpent || 0,
      },
      update: {
        completions: { increment: 1 },
        avgScore: score || undefined,
        avgTimeSpent: timeSpent || undefined,
      },
    })

    // TODO: Send email if configured

    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error('Error submitting response:', error)
    return NextResponse.json({ error: 'Failed to submit response' }, { status: 500 })
  }
}
