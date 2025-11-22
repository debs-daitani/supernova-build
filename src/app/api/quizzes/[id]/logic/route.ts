import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/quizzes/[id]/logic - List all logic rules for quiz
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const logicRules = await prisma.quizLogic.findMany({
      where: { quizId: id },
      include: {
        question: {
          select: {
            id: true,
            questionText: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json({ logicRules })
  } catch (error) {
    console.error('Error fetching logic rules:', error)
    return NextResponse.json({ error: 'Failed to fetch logic rules' }, { status: 500 })
  }
}

// POST /api/quizzes/[id]/logic - Create new logic rule
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
    })

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 })
    }

    if (quiz.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { questionId, conditionType, conditionValue, actionType, actionValue } = body

    if (!questionId || !conditionType || !actionType) {
      return NextResponse.json(
        { error: 'questionId, conditionType, and actionType are required' },
        { status: 400 }
      )
    }

    const logicRule = await prisma.quizLogic.create({
      data: {
        quizId: id,
        questionId,
        conditionType,
        conditionValue: conditionValue || '',
        actionType,
        actionValue: actionValue || '',
      },
      include: {
        question: {
          select: {
            id: true,
            questionText: true,
          },
        },
      },
    })

    return NextResponse.json(logicRule, { status: 201 })
  } catch (error) {
    console.error('Error creating logic rule:', error)
    return NextResponse.json({ error: 'Failed to create logic rule' }, { status: 500 })
  }
}

// DELETE /api/quizzes/[id]/logic/[ruleId] - Delete logic rule
export async function DELETE(
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
    const { searchParams } = new URL(req.url)
    const ruleId = searchParams.get('ruleId')

    if (!ruleId) {
      return NextResponse.json({ error: 'ruleId is required' }, { status: 400 })
    }

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

    // Delete logic rule
    await prisma.quizLogic.delete({
      where: { id: ruleId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting logic rule:', error)
    return NextResponse.json({ error: 'Failed to delete logic rule' }, { status: 500 })
  }
}
