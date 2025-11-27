import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { calculateQuizScore, trackQuizCompletion, QuizAnswer } from '../../../../lib/quiz-scoring'
import { sendQuizResults } from '../../../../lib/quiz-email'

/**
 * Submit quiz answers and get results
 * POST /api/quiz/submit
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      quizId,
      answers, // Array of { questionId, answer }
      email,
      name,
      phone,
      userId,
      timeSpent, // Seconds
    } = body

    if (!quizId || !answers || !email) {
      return NextResponse.json(
        { error: 'Quiz ID, answers, and email are required' },
        { status: 400 }
      )
    }

    // Calculate score and results
    const scoringResult = await calculateQuizScore(quizId, answers as QuizAnswer[])

    // Save quiz response
    const response = await prisma.quizResponse.create({
      data: {
        quizId,
        userId,
        email,
        name,
        phone,
        answers: answers, // Store as JSON
        totalScore: scoringResult.totalScore,
        resultTierId: scoringResult.resultTierId,
        recommendedProgramIds: scoringResult.recommendedPrograms.map((p) => p.id),
        completedAt: new Date(),
        timeSpent: timeSpent || 0,
        ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || null,
        userAgent: req.headers.get('user-agent') || null,
      },
    })

    // Track completion analytics
    await trackQuizCompletion(quizId, scoringResult.resultTierId, timeSpent || 0)

    // Get quiz details for email
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      select: { title: true },
    })

    // Send results via email
    if (quiz) {
      const emailSent = await sendQuizResults({
        to: email,
        name,
        quizTitle: quiz.title,
        result: scoringResult,
        quizUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://daitaniverse.com'}/quiz/${quizId}`,
      })

      if (emailSent) {
        await prisma.quizResponse.update({
          where: { id: response.id },
          data: {
            resultsSent: true,
            resultsSentAt: new Date(),
          },
        })
      }
    }

    return NextResponse.json({
      success: true,
      responseId: response.id,
      result: scoringResult,
    })
  } catch (error) {
    console.error('Quiz submission error:', error)
    return NextResponse.json(
      { error: 'Failed to submit quiz' },
      { status: 500 }
    )
  }
}
