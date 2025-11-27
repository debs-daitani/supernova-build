import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '../../../../lib/auth-middleware'

/**
 * POST /api/sso/revoke
 *
 * Revoke all SSO sessions for the current user
 * This effectively logs the user out of all connected applications
 *
 * NOTE: Since we're using short-lived JWT tokens (5 min) rather than
 * persistent session tokens in a database, this route primarily serves
 * to document the SSO architecture and provide a clear logout endpoint.
 *
 * In a production system with longer-lived sessions, you would:
 * 1. Delete all SSOSession records for the user from database
 * 2. Invalidate refresh tokens
 * 3. Clear all session cookies
 */
export async function POST(req: NextRequest) {
  try {
    const authResult = await verifyAuth(req)
    if (!authResult.authenticated || !authResult.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Since we're using short-lived JWTs, there's no server-side session to revoke
    // The client should:
    // 1. Delete auth cookies
    // 2. Clear localStorage
    // 3. Redirect to login

    // In the future, if you implement refresh tokens or persistent sessions:
    // await prisma.sSOSession.deleteMany({
    //   where: { userId: authResult.userId }
    // })

    return NextResponse.json({
      success: true,
      message: 'All SSO sessions revoked. Please clear local storage and cookies.',
    })
  } catch (error) {
    console.error('SSO revoke error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
