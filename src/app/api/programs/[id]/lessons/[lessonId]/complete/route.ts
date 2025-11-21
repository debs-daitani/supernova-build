import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; lessonId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { completed } = body

    // Check if lesson exists and belongs to program
    const lesson = await prisma.lesson.findUnique({
      where: { id: params.lessonId },
      include: {
        module: {
          select: { programId: true },
        },
      },
    })

    if (!lesson || lesson.module.programId !== params.id) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
    }

    // Update or create lesson progress
    const progress = await prisma.lessonProgress.upsert({
      where: {
        userId_lessonId: {
          userId: session.user.id,
          lessonId: params.lessonId,
        },
      },
      update: {
        completed: completed,
        completedAt: completed ? new Date() : null,
        viewedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        lessonId: params.lessonId,
        completed: completed,
        completedAt: completed ? new Date() : null,
      },
    })

    // Update program enrollment progress
    await updateProgramProgress(session.user.id, params.id)

    return NextResponse.json({ success: true, progress })
  } catch (error) {
    console.error('Error updating lesson progress:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function updateProgramProgress(userId: string, programId: string) {
  // Get all lessons in program
  const program = await prisma.program.findUnique({
    where: { id: programId },
    include: {
      modules: {
        include: {
          lessons: {
            include: {
              progress: {
                where: { userId },
              },
            },
          },
        },
      },
    },
  })

  if (!program) return

  const totalLessons = program.modules.reduce(
    (sum, module) => sum + module.lessons.length,
    0
  )

  const completedLessons = program.modules.reduce(
    (sum, module) =>
      sum + module.lessons.filter((lesson) => lesson.progress[0]?.completed).length,
    0
  )

  const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

  // Update enrollment
  await prisma.programEnrollment.update({
    where: {
      userId_programId: {
        userId,
        programId,
      },
    },
    data: {
      progress: progressPercentage,
      completedAt: progressPercentage === 100 ? new Date() : null,
      lastAccessedAt: new Date(),
    },
  })

  // If completed and no certificate exists, create one
  if (progressPercentage === 100) {
    const existingCertificate = await prisma.programCertificate.findUnique({
      where: {
        userId_programId: {
          userId,
          programId,
        },
      },
    })

    if (!existingCertificate) {
      await prisma.programCertificate.create({
        data: {
          userId,
          programId,
        },
      })
    }
  }
}
