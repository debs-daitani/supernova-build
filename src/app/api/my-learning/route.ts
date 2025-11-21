import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch user's enrollments with program details
    const enrollments = await prisma.programEnrollment.findMany({
      where: { userId: session.user.id },
      include: {
        program: {
          include: {
            modules: {
              include: {
                lessons: {
                  include: {
                    progress: {
                      where: { userId: session.user.id },
                    },
                  },
                  orderBy: { order: 'asc' },
                },
              },
              orderBy: { order: 'asc' },
            },
            certificates: {
              where: { userId: session.user.id },
            },
          },
        },
      },
      orderBy: { lastAccessedAt: 'desc' },
    })

    // Calculate next lesson for each enrollment
    const enrollmentsWithNext = enrollments.map((enrollment) => {
      const totalLessons = enrollment.program.modules.reduce(
        (sum, module) => sum + module.lessons.length,
        0
      )

      const completedLessons = enrollment.program.modules.reduce(
        (sum, module) =>
          sum + module.lessons.filter((lesson) => lesson.progress[0]?.completed).length,
        0
      )

      // Find next incomplete lesson
      let nextLesson = null
      for (const module of enrollment.program.modules) {
        for (const lesson of module.lessons) {
          if (!lesson.progress[0]?.completed) {
            nextLesson = {
              moduleId: module.id,
              moduleName: module.title,
              lessonId: lesson.id,
              lessonTitle: lesson.title,
            }
            break
          }
        }
        if (nextLesson) break
      }

      return {
        ...enrollment,
        totalLessons,
        completedLessons,
        progressPercentage: enrollment.progress,
        nextLesson,
        certificate: enrollment.program.certificates[0] || null,
      }
    })

    // Separate into in-progress and completed
    const inProgress = enrollmentsWithNext.filter((e) => !e.completedAt)
    const completed = enrollmentsWithNext.filter((e) => e.completedAt)

    return NextResponse.json({
      inProgress,
      completed,
    })
  } catch (error) {
    console.error('Error fetching my learning:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
