import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/calendar/callback - Handle Google OAuth callback
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state') // userId
    const error = searchParams.get('error')

    if (error) {
      return NextResponse.redirect(new URL('/calendar/settings?error=access_denied', request.url))
    }

    if (!code || !state) {
      return NextResponse.redirect(new URL('/calendar/settings?error=invalid_request', request.url))
    }

    const clientId = process.env.GOOGLE_CLIENT_ID
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL}/api/calendar/callback`

    if (!clientId || !clientSecret) {
      return NextResponse.redirect(new URL('/calendar/settings?error=config_error', request.url))
    }

    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    })

    if (!tokenResponse.ok) {
      console.error('Token exchange failed:', await tokenResponse.text())
      return NextResponse.redirect(new URL('/calendar/settings?error=token_error', request.url))
    }

    const tokens = await tokenResponse.json()
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000)

    // Save or update connection
    await prisma.calendarConnection.upsert({
      where: { userId: state },
      create: {
        userId: state,
        provider: 'google',
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt,
      },
      update: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || undefined,
        expiresAt,
      },
    })

    return NextResponse.redirect(new URL('/calendar/settings?success=connected', request.url))
  } catch (error) {
    console.error('Error in calendar callback:', error)
    return NextResponse.redirect(new URL('/calendar/settings?error=server_error', request.url))
  }
}
