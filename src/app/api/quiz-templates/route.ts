import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/quiz-templates - List all quiz templates
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')
    const isPublic = searchParams.get('public')

    const where: any = {}

    if (category) {
      where.category = category
    }

    if (isPublic !== null) {
      where.isPublic = isPublic === 'true'
    }

    const templates = await prisma.quizTemplate.findMany({
      where,
      orderBy: {
        usageCount: 'desc',
      },
    })

    return NextResponse.json({ templates })
  } catch (error) {
    console.error('Error fetching quiz templates:', error)
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 })
  }
}

// POST /api/quiz-templates - Create quiz from template
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
    const { templateId } = body

    if (!templateId) {
      return NextResponse.json({ error: 'Template ID is required' }, { status: 400 })
    }

    // Get template
    const template = await prisma.quizTemplate.findUnique({
      where: { id: templateId },
    })

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    // Parse template data
    const quizData = typeof template.quizData === 'string'
      ? JSON.parse(template.quizData)
      : template.quizData

    // Create quiz from template
    const quiz = await prisma.quiz.create({
      data: {
        userId: user.id,
        title: quizData.title || template.name,
        slug: `${template.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`,
        description: quizData.description || template.description,
        quizType: quizData.quizType || 'SCORED',
        settings: quizData.settings || {},
        requireEmail: quizData.requireEmail || false,
        showProgressBar: quizData.showProgressBar !== undefined ? quizData.showProgressBar : true,
        allowBack: quizData.allowBack !== undefined ? quizData.allowBack : true,
        shuffleQuestions: quizData.shuffleQuestions || false,
        collectLeads: quizData.collectLeads || false,
        questions: {
          create: (quizData.questions || []).map((q: any, index: number) => ({
            questionText: q.questionText,
            questionType: q.questionType || 'SINGLE_CHOICE',
            options: q.options || [],
            required: q.required !== undefined ? q.required : true,
            description: q.description || null,
            imageUrl: q.imageUrl || null,
            videoUrl: q.videoUrl || null,
            dimension: q.dimension || null,
            points: q.points || null,
            order: index + 1,
          })),
        },
        results: {
          create: (quizData.results || []).map((r: any, index: number) => ({
            title: r.title,
            description: r.description || '',
            minScore: r.minScore || null,
            maxScore: r.maxScore || null,
            conditions: r.conditions || null,
            imageUrl: r.imageUrl || null,
            ctaText: r.ctaText || null,
            ctaUrl: r.ctaUrl || null,
            showScore: r.showScore !== undefined ? r.showScore : true,
            emailSubject: r.emailSubject || null,
            emailBody: r.emailBody || null,
            order: index + 1,
          })),
        },
      },
      include: {
        questions: true,
        results: true,
      },
    })

    // Increment template usage count
    await prisma.quizTemplate.update({
      where: { id: templateId },
      data: {
        usageCount: { increment: 1 },
      },
    })

    return NextResponse.json(quiz, { status: 201 })
  } catch (error) {
    console.error('Error creating quiz from template:', error)
    return NextResponse.json({ error: 'Failed to create quiz from template' }, { status: 500 })
  }
}
