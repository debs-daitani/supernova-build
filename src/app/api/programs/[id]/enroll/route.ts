import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@prisma/client'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if program exists
    const program = await prisma.program.findUnique({
      where: { id: params.id },
      select: { requiredRole: true, isPublished: true },
    })

    if (!program || !program.isPublished) {
      return NextResponse.json({ error: 'Program not found' }, { status: 404 })
    }

    // Get user's role
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check access
    if (!checkAccess(user.role, program.requiredRole)) {
      return NextResponse.json(
        { error: 'You do not have access to this program. Please upgrade your membership.' },
        { status: 403 }
      )
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.programEnrollment.findUnique({
      where: {
        userId_programId: {
          userId: session.user.id,
          programId: params.id,
        },
      },
    })

    if (existingEnrollment) {
      return NextResponse.json({ error: 'Already enrolled' }, { status: 400 })
    }

    // Create enrollment
    const enrollment = await prisma.programEnrollment.create({
      data: {
        userId: session.user.id,
        programId: params.id,
      },
    })

    return NextResponse.json({ success: true, enrollment })
  } catch (error) {
    console.error('Error enrolling in program:', error)
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
