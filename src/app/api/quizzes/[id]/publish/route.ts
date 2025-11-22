import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { validateQuiz } from '@/lib/quiz-utils'

// POST /api/quizzes/[id]/publish - Publish/unpublish quiz
export async function POST(
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
        questions: true,
        results: true,
      },
    })

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 })
    }

    if (quiz.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { publish } = body

    // If publishing, validate quiz first
    if (publish) {
      const validation = validateQuiz(quiz)

      if (!validation.valid) {
        return NextResponse.json(
          {
            error: 'Quiz validation failed',
            errors: validation.errors,
          },
          { status: 400 }
        )
      }
    }

    // Update publish status
    const updatedQuiz = await prisma.quiz.update({
      where: { id },
      data: {
        isPublished: publish,
        publishedAt: publish ? new Date() : null,
      },
    })

    return NextResponse.json({
      success: true,
      isPublished: updatedQuiz.isPublished,
      publishedAt: updatedQuiz.publishedAt,
    })
  } catch (error) {
    console.error('Error publishing quiz:', error)
    return NextResponse.json({ error: 'Failed to publish quiz' }, { status: 500 })
  }
}
