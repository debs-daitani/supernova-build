import { NextRequest, NextResponse } from 'next/server'
import { verifyVenuedSSOToken } from '../../../../lib/venued-sso'
import { prisma } from '../../../../lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json()

    if (!token) {
      return NextResponse.json(
        { error: 'SSO token is required' },
        { status: 400 }
      )
    }

    // Verify the SSO token
    const payload = verifyVenuedSSOToken(token)

    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired SSO token' },
        { status: 401 }
      )
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Return user data and a new session token if needed
    return NextResponse.json({
      success: true,
      user,
    })
  } catch (error) {
    console.error('SSO verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
