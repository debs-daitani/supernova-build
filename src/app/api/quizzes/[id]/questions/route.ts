import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/quizzes/[id]/questions - List all questions for quiz
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const questions = await prisma.quizQuestion.findMany({
      where: { quizId: id },
      include: {
        logicRules: true,
      },
      orderBy: { order: 'asc' },
    })

    return NextResponse.json({ questions })
  } catch (error) {
    console.error('Error fetching questions:', error)
    return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 })
  }
}

// POST /api/quizzes/[id]/questions - Create new question
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
    } = body

    if (!questionText) {
      return NextResponse.json({ error: 'Question text is required' }, { status: 400 })
    }

    // Get max order
    const maxOrder = await prisma.quizQuestion.findFirst({
      where: { quizId: id },
      orderBy: { order: 'desc' },
      select: { order: true },
    })

    const order = (maxOrder?.order || 0) + 1

    const question = await prisma.quizQuestion.create({
      data: {
        quizId: id,
        questionText,
        questionType: questionType || 'SINGLE_CHOICE',
        options: options || [],
        required: required !== undefined ? required : true,
        description: description || null,
        imageUrl: imageUrl || null,
        videoUrl: videoUrl || null,
        dimension: dimension || null,
        points: points || null,
        order,
      },
      include: {
        logicRules: true,
      },
    })

    return NextResponse.json(question, { status: 201 })
  } catch (error) {
    console.error('Error creating question:', error)
    return NextResponse.json({ error: 'Failed to create question' }, { status: 500 })
  }
}
