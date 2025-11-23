import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { generateEmbedCode } from '../../../../lib/quiz-scoring'

/**
 * Publish a quiz and generate embed code
 * POST /api/quiz/publish
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { quizId, embedDomain } = body

    if (!quizId) {
      return NextResponse.json(
        { error: 'Quiz ID is required' },
        { status: 400 }
      )
    }

    // Verify quiz has at least one question
    const questionCount = await prisma.question.count({
      where: { quizId },
    })

    if (questionCount === 0) {
      return NextResponse.json(
        { error: 'Cannot publish quiz without questions' },
        { status: 400 }
      )
    }

    // Generate embed code
    const domain = embedDomain || process.env.NEXT_PUBLIC_APP_URL || 'https://daitaniverse.com'
    const embedCode = generateEmbedCode(quizId, domain)

    // Update quiz to published status
    const quiz = await prisma.quiz.update({
      where: { id: quizId },
      data: {
        status: 'PUBLISHED',
        embedCode,
        embedDomain: domain,
      },
    })

    return NextResponse.json({
      success: true,
      quiz,
      embedCode,
      publicUrl: `${domain}/quiz/${quizId}`,
    })
  } catch (error) {
    console.error('Quiz publish error:', error)
    return NextResponse.json(
      { error: 'Failed to publish quiz' },
      { status: 500 }
    )
  }
}

/**
 * Unpublish a quiz (archive it)
 * POST /api/quiz/unpublish
 */
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json()
    const { quizId } = body

    if (!quizId) {
      return NextResponse.json(
        { error: 'Quiz ID is required' },
        { status: 400 }
      )
    }

    const quiz = await prisma.quiz.update({
      where: { id: quizId },
      data: {
        status: 'ARCHIVED',
      },
    })

    return NextResponse.json({
      success: true,
      quiz,
    })
  } catch (error) {
    console.error('Quiz unpublish error:', error)
    return NextResponse.json(
      { error: 'Failed to unpublish quiz' },
      { status: 500 }
    )
  }
}
