import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

/**
 * Get quiz by ID (public endpoint for quiz takers)
 * GET /api/quiz/[id]
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const quizId = params.id

    const quiz = await prisma.quiz.findUnique({
      where: {
        id: quizId,
        status: 'PUBLISHED', // Only return published quizzes
      },
      include: {
        questions: {
          include: {
            options: {
              orderBy: { order: 'asc' },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
    })

    if (!quiz) {
      return NextResponse.json(
        { error: 'Quiz not found or not published' },
        { status: 404 }
      )
    }

    // Remove sensitive data (points, tags) from options for public view
    const sanitizedQuiz = {
      ...quiz,
      questions: quiz.questions.map((q) => ({
        ...q,
        options: q.options.map((opt) => ({
          id: opt.id,
          text: opt.text,
          imageUrl: opt.imageUrl,
          order: opt.order,
          // Don't expose points and tags to quiz takers
        })),
      })),
    }

    return NextResponse.json({
      success: true,
      quiz: sanitizedQuiz,
    })
  } catch (error) {
    console.error('Get quiz error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch quiz' },
      { status: 500 }
    )
  }
}
