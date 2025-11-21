import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@prisma/client'

export async function GET() {
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

    // Fetch all programs with enrollment status
    const programs = await prisma.program.findMany({
      where: { isPublished: true },
      include: {
        modules: {
          include: {
            lessons: true,
          },
          orderBy: { order: 'asc' },
        },
        enrollments: {
          where: { userId: session.user.id },
        },
        _count: {
          select: {
            modules: true,
            enrollments: true,
          },
        },
      },
      orderBy: { order: 'asc' },
    })

    // Add access control and enrollment status
    const programsWithAccess = programs.map((program) => {
      const hasAccess = checkAccess(user.role, program.requiredRole)
      const isEnrolled = program.enrollments.length > 0
      const enrollment = program.enrollments[0] || null

      // Calculate total lessons
      const totalLessons = program.modules.reduce(
        (sum, module) => sum + module.lessons.length,
        0
      )

      return {
        ...program,
        hasAccess,
        isEnrolled,
        enrollment,
        totalLessons,
        totalModules: program.modules.length,
      }
    })

    // Sort: enrolled programs first, then by order
    programsWithAccess.sort((a, b) => {
      if (a.isEnrolled && !b.isEnrolled) return -1
      if (!a.isEnrolled && b.isEnrolled) return 1
      return a.order - b.order
    })

    return NextResponse.json(programsWithAccess)
  } catch (error) {
    console.error('Error fetching programs:', error)
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
