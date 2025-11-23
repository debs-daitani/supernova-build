import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

/**
 * Add a question to a quiz
 * POST /api/quiz/questions
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      quizId,
      questionText,
      description,
      type,
      required,
      order,
      imageUrl,
      videoUrl,
      options, // For multiple choice: [{ text, imageUrl, order, points, tags }]
      scaleMin,
      scaleMax,
      scaleMinLabel,
      scaleMaxLabel,
    } = body

    if (!quizId || !questionText || !type) {
      return NextResponse.json(
        { error: 'Quiz ID, question text, and type are required' },
        { status: 400 }
      )
    }

    // Create question
    const question = await prisma.question.create({
      data: {
        quizId,
        questionText,
        description,
        type,
        required: required ?? true,
        order: order ?? 0,
        imageUrl,
        videoUrl,
        scaleMin,
        scaleMax,
        scaleMinLabel,
        scaleMaxLabel,
      },
    })

    // Create options if provided
    if (options && Array.isArray(options)) {
      await prisma.questionOption.createMany({
        data: options.map((opt: any, idx: number) => ({
          questionId: question.id,
          text: opt.text,
          imageUrl: opt.imageUrl,
          order: opt.order ?? idx,
          points: opt.points ?? 0,
          tags: opt.tags || [],
        })),
      })
    }

    // Fetch complete question with options
    const completeQuestion = await prisma.question.findUnique({
      where: { id: question.id },
      include: { options: true },
    })

    return NextResponse.json({
      success: true,
      question: completeQuestion,
    })
  } catch (error) {
    console.error('Question creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create question' },
      { status: 500 }
    )
  }
}

/**
 * Update a question
 * PATCH /api/quiz/questions?questionId=xxx
 */
export async function PATCH(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const questionId = searchParams.get('questionId')

    if (!questionId) {
      return NextResponse.json(
        { error: 'Question ID is required' },
        { status: 400 }
      )
    }

    const body = await req.json()
    const {
      questionText,
      description,
      type,
      required,
      order,
      imageUrl,
      videoUrl,
      scaleMin,
      scaleMax,
      scaleMinLabel,
      scaleMaxLabel,
    } = body

    const updatedQuestion = await prisma.question.update({
      where: { id: questionId },
      data: {
        questionText,
        description,
        type,
        required,
        order,
        imageUrl,
        videoUrl,
        scaleMin,
        scaleMax,
        scaleMinLabel,
        scaleMaxLabel,
      },
      include: { options: true },
    })

    return NextResponse.json({
      success: true,
      question: updatedQuestion,
    })
  } catch (error) {
    console.error('Question update error:', error)
    return NextResponse.json(
      { error: 'Failed to update question' },
      { status: 500 }
    )
  }
}

/**
 * Delete a question
 * DELETE /api/quiz/questions?questionId=xxx
 */
export async function DELETE(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const questionId = searchParams.get('questionId')

    if (!questionId) {
      return NextResponse.json(
        { error: 'Question ID is required' },
        { status: 400 }
      )
    }

    await prisma.question.delete({
      where: { id: questionId },
    })

    return NextResponse.json({
      success: true,
      message: 'Question deleted',
    })
  } catch (error) {
    console.error('Question deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete question' },
      { status: 500 }
    )
  }
}
