import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// PATCH /api/quizzes/[id]/results/[resultId] - Update result
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; resultId: string } }
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

    const { id, resultId } = params

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
      title,
      description,
      minScore,
      maxScore,
      conditions,
      imageUrl,
      ctaText,
      ctaUrl,
      showScore,
      emailSubject,
      emailBody,
      order,
    } = body

    const updateData: any = {}

    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (minScore !== undefined) updateData.minScore = minScore
    if (maxScore !== undefined) updateData.maxScore = maxScore
    if (conditions !== undefined) updateData.conditions = conditions
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl
    if (ctaText !== undefined) updateData.ctaText = ctaText
    if (ctaUrl !== undefined) updateData.ctaUrl = ctaUrl
    if (showScore !== undefined) updateData.showScore = showScore
    if (emailSubject !== undefined) updateData.emailSubject = emailSubject
    if (emailBody !== undefined) updateData.emailBody = emailBody
    if (order !== undefined) updateData.order = order

    const result = await prisma.quizResult.update({
      where: { id: resultId },
      data: updateData,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error updating result:', error)
    return NextResponse.json({ error: 'Failed to update result' }, { status: 500 })
  }
}

// DELETE /api/quizzes/[id]/results/[resultId] - Delete result
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; resultId: string } }
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

    const { id, resultId } = params

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

    // Delete result
    await prisma.quizResult.delete({
      where: { id: resultId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting result:', error)
    return NextResponse.json({ error: 'Failed to delete result' }, { status: 500 })
  }
}
