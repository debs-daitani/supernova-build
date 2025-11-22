import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/quizzes/[id]/results - List all results for quiz
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const results = await prisma.quizResult.findMany({
      where: { quizId: id },
      orderBy: { order: 'asc' },
    })

    return NextResponse.json({ results })
  } catch (error) {
    console.error('Error fetching results:', error)
    return NextResponse.json({ error: 'Failed to fetch results' }, { status: 500 })
  }
}

// POST /api/quizzes/[id]/results - Create new result
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
    } = body

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    // Get max order
    const maxOrder = await prisma.quizResult.findFirst({
      where: { quizId: id },
      orderBy: { order: 'desc' },
      select: { order: true },
    })

    const order = (maxOrder?.order || 0) + 1

    const result = await prisma.quizResult.create({
      data: {
        quizId: id,
        title,
        description: description || '',
        minScore: minScore || null,
        maxScore: maxScore || null,
        conditions: conditions || null,
        imageUrl: imageUrl || null,
        ctaText: ctaText || null,
        ctaUrl: ctaUrl || null,
        showScore: showScore !== undefined ? showScore : true,
        emailSubject: emailSubject || null,
        emailBody: emailBody || null,
        order,
      },
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Error creating result:', error)
    return NextResponse.json({ error: 'Failed to create result' }, { status: 500 })
  }
}
