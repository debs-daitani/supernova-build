import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/quizzes/[id] - Get quiz by ID or slug
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Try to find by ID first, then by slug
    let quiz = await prisma.quiz.findUnique({
      where: { id },
      include: {
        questions: {
          orderBy: { order: 'asc' },
          include: {
            logicRules: true,
          },
        },
        results: {
          orderBy: { order: 'asc' },
        },
        analytics: {
          orderBy: { date: 'desc' },
          take: 30,
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePhotoUrl: true,
          },
        },
      },
    })

    if (!quiz) {
      quiz = await prisma.quiz.findUnique({
        where: { slug: id },
        include: {
          questions: {
            orderBy: { order: 'asc' },
            include: {
              logicRules: true,
            },
          },
          results: {
            orderBy: { order: 'asc' },
          },
          analytics: {
            orderBy: { date: 'desc' },
            take: 30,
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              profilePhotoUrl: true,
            },
          },
        },
      })
    }

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 })
    }

    // Increment view count if not the owner
    const session = await getServerSession(authOptions)
    const isOwner = session?.user?.email && quiz.user.email === session.user.email

    if (!isOwner) {
      await prisma.quiz.update({
        where: { id: quiz.id },
        data: { viewCount: { increment: 1 } },
      })
    }

    return NextResponse.json(quiz)
  } catch (error) {
    console.error('Error fetching quiz:', error)
    return NextResponse.json({ error: 'Failed to fetch quiz' }, { status: 500 })
  }
}

// PATCH /api/quizzes/[id] - Update quiz
export async function PATCH(
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
    const body = await req.json()

    // Check ownership
    const existingQuiz = await prisma.quiz.findUnique({
      where: { id },
    })

    if (!existingQuiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 })
    }

    if (existingQuiz.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const {
      title,
      description,
      quizType,
      settings,
      isPublished,
      requireEmail,
      showProgressBar,
      allowBack,
      shuffleQuestions,
      collectLeads,
      thankYouMessage,
      redirectUrl,
      metaTitle,
      metaDescription,
      customCss,
    } = body

    const updateData: any = {}

    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (quizType !== undefined) updateData.quizType = quizType
    if (settings !== undefined) updateData.settings = settings
    if (isPublished !== undefined) updateData.isPublished = isPublished
    if (requireEmail !== undefined) updateData.requireEmail = requireEmail
    if (showProgressBar !== undefined) updateData.showProgressBar = showProgressBar
    if (allowBack !== undefined) updateData.allowBack = allowBack
    if (shuffleQuestions !== undefined) updateData.shuffleQuestions = shuffleQuestions
    if (collectLeads !== undefined) updateData.collectLeads = collectLeads
    if (thankYouMessage !== undefined) updateData.thankYouMessage = thankYouMessage
    if (redirectUrl !== undefined) updateData.redirectUrl = redirectUrl
    if (metaTitle !== undefined) updateData.metaTitle = metaTitle
    if (metaDescription !== undefined) updateData.metaDescription = metaDescription
    if (customCss !== undefined) updateData.customCss = customCss

    const quiz = await prisma.quiz.update({
      where: { id },
      data: updateData,
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
        results: {
          orderBy: { order: 'asc' },
        },
      },
    })

    return NextResponse.json(quiz)
  } catch (error) {
    console.error('Error updating quiz:', error)
    return NextResponse.json({ error: 'Failed to update quiz' }, { status: 500 })
  }
}

// DELETE /api/quizzes/[id] - Delete quiz
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

    // Check ownership
    const existingQuiz = await prisma.quiz.findUnique({
      where: { id },
    })

    if (!existingQuiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 })
    }

    if (existingQuiz.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Delete quiz (cascade will handle questions, results, responses, analytics)
    await prisma.quiz.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting quiz:', error)
    return NextResponse.json({ error: 'Failed to delete quiz' }, { status: 500 })
  }
}
