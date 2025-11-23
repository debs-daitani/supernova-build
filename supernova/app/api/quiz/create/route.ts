import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { generateEmbedCode } from '../../../../lib/quiz-scoring'

/**
 * Create a new quiz
 * POST /api/quiz/create
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      userId,
      title,
      description,
      coverImage,
      primaryColor,
      secondaryColor,
      logoUrl,
      fontFamily,
      showProgressBar,
      randomizeQuestions,
      requireEmail,
      collectPhone,
      resultsTitle,
      resultsMessage,
      showScore,
    } = body

    if (!userId || !title) {
      return NextResponse.json(
        { error: 'User ID and title are required' },
        { status: 400 }
      )
    }

    // Create quiz
    const quiz = await prisma.quiz.create({
      data: {
        userId,
        title,
        description,
        coverImage,
        primaryColor: primaryColor || '#FF008E',
        secondaryColor: secondaryColor || '#00F0E9',
        logoUrl,
        fontFamily: fontFamily || 'Josefin Sans',
        showProgressBar: showProgressBar ?? true,
        randomizeQuestions: randomizeQuestions ?? false,
        requireEmail: requireEmail ?? true,
        collectPhone: collectPhone ?? false,
        resultsTitle: resultsTitle || 'Your Results',
        resultsMessage,
        showScore: showScore ?? true,
        status: 'DRAFT',
      },
    })

    return NextResponse.json({
      success: true,
      quizId: quiz.id,
      quiz,
    })
  } catch (error) {
    console.error('Quiz creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create quiz' },
      { status: 500 }
    )
  }
}
