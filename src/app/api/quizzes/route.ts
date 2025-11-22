import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateQuizSlug } from '@/lib/quiz-utils'

// GET /api/quizzes - List all quizzes for current user
export async function GET(req: NextRequest) {
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

    const { searchParams } = new URL(req.url)
    const quizType = searchParams.get('type')
    const isPublished = searchParams.get('published')
    const search = searchParams.get('search')

    const where: any = { userId: user.id }

    if (quizType) {
      where.quizType = quizType
    }

    if (isPublished !== null) {
      where.isPublished = isPublished === 'true'
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    const quizzes = await prisma.quiz.findMany({
      where,
      include: {
        questions: true,
        results: true,
        _count: {
          select: {
            responses: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    })

    return NextResponse.json({ quizzes })
  } catch (error) {
    console.error('Error fetching quizzes:', error)
    return NextResponse.json({ error: 'Failed to fetch quizzes' }, { status: 500 })
  }
}

// POST /api/quizzes - Create new quiz
export async function POST(req: NextRequest) {
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

    const body = await req.json()
    const { title, description, quizType, settings } = body

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    // Generate unique slug
    const baseSlug = generateQuizSlug(title)
    let slug = baseSlug
    let counter = 1

    while (await prisma.quiz.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`
      counter++
    }

    const quiz = await prisma.quiz.create({
      data: {
        userId: user.id,
        title,
        slug,
        description: description || '',
        quizType: quizType || 'SCORED',
        settings: settings || {},
      },
      include: {
        questions: true,
        results: true,
      },
    })

    return NextResponse.json(quiz, { status: 201 })
  } catch (error) {
    console.error('Error creating quiz:', error)
    return NextResponse.json({ error: 'Failed to create quiz' }, { status: 500 })
  }
}
