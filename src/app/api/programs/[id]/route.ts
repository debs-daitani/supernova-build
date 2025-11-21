import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@prisma/client'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's role
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Fetch program with all modules and lessons
    const program = await prisma.program.findUnique({
      where: { id: params.id },
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
        enrollments: {
          where: { userId: session.user.id },
        },
        certificates: {
          where: { userId: session.user.id },
        },
      },
    })

    if (!program) {
      return NextResponse.json({ error: 'Program not found' }, { status: 404 })
    }

    const hasAccess = checkAccess(user.role, program.requiredRole)
    const isEnrolled = program.enrollments.length > 0
    const enrollment = program.enrollments[0] || null
    const certificate = program.certificates[0] || null

    // Calculate progress
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

    // Find next incomplete lesson
    let nextLesson = null
    for (const module of program.modules) {
      for (const lesson of module.lessons) {
        if (!lesson.progress[0]?.completed) {
          nextLesson = { moduleId: module.id, lessonId: lesson.id }
          break
        }
      }
      if (nextLesson) break
    }

    return NextResponse.json({
      ...program,
      hasAccess,
      isEnrolled,
      enrollment,
      certificate,
      totalLessons,
      completedLessons,
      progressPercentage,
      nextLesson,
    })
  } catch (error) {
    console.error('Error fetching program:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function checkAccess(userRole: UserRole, requiredRole: UserRole): boolean {
  const roleHierarchy = {
    FREE: 0,
    UPGRADE: 1,
    MEMBER: 2,
  }

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
}
