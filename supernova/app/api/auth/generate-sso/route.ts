import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '../../../../lib/auth-middleware'
import { generateVenuedSSOToken } from '../../../../lib/venued-sso'
import { prisma } from '../../../../lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const authResult = await verifyAuth(req)
    if (!authResult.authenticated || !authResult.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: authResult.userId },
      select: {
        id: true,
        email: true,
        name: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Generate SSO token
    const token = generateVenuedSSOToken(user.id, user.email, user.name)

    // Get VENUED URL from environment or default to localhost
    const venuedUrl = process.env.VENUED_URL || 'http://localhost:3000'
    const launchUrl = `${venuedUrl}?sso_token=${token}`

    return NextResponse.json({
      token,
      launchUrl,
    })
  } catch (error) {
    console.error('Generate SSO error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
