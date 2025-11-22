import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// PATCH /api/quizzes/[id]/questions/[questionId] - Update question
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; questionId: string } }
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

    const { id, questionId } = params

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

    const body = await req.json()
    const {
      questionText,
      questionType,
      options,
      required,
      description,
      imageUrl,
      videoUrl,
      dimension,
      points,
      order,
    } = body

    const updateData: any = {}

    if (questionText !== undefined) updateData.questionText = questionText
    if (questionType !== undefined) updateData.questionType = questionType
    if (options !== undefined) updateData.options = options
    if (required !== undefined) updateData.required = required
    if (description !== undefined) updateData.description = description
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl
    if (videoUrl !== undefined) updateData.videoUrl = videoUrl
    if (dimension !== undefined) updateData.dimension = dimension
    if (points !== undefined) updateData.points = points
    if (order !== undefined) updateData.order = order

    const question = await prisma.quizQuestion.update({
      where: { id: questionId },
      data: updateData,
      include: {
        logicRules: true,
      },
    })

    return NextResponse.json(question)
  } catch (error) {
    console.error('Error updating question:', error)
    return NextResponse.json({ error: 'Failed to update question' }, { status: 500 })
  }
}

// DELETE /api/quizzes/[id]/questions/[questionId] - Delete question
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; questionId: string } }
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

    const { id, questionId } = params

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

    // Delete question
    await prisma.quizQuestion.delete({
      where: { id: questionId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting question:', error)
    return NextResponse.json({ error: 'Failed to delete question' }, { status: 500 })
  }
}
