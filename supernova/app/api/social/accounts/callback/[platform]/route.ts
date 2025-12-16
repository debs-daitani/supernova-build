import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type RouteContext = {
  params: Promise<{ platform: string }>
}

// GET /api/social/accounts/callback/[platform] - OAuth callback
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { platform } = await context.params
    const { searchParams } = new URL(request.url)

    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    if (error) {
      return NextResponse.redirect(
        new URL(`/social/settings?error=${encodeURIComponent(error)}`, request.url)
      )
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL('/social/settings?error=missing_code', request.url)
      )
    }

    // Decode state to get userId
    let stateData: { userId: string; timestamp: number }
    try {
      stateData = JSON.parse(Buffer.from(state, 'base64').toString())
    } catch {
      return NextResponse.redirect(
        new URL('/social/settings?error=invalid_state', request.url)
      )
    }

    // Verify state isn't too old (15 minutes max)
    if (Date.now() - stateData.timestamp > 15 * 60 * 1000) {
      return NextResponse.redirect(
        new URL('/social/settings?error=state_expired', request.url)
      )
    }

    const clientId = process.env[`${platform.toUpperCase()}_CLIENT_ID`]
    const clientSecret = process.env[`${platform.toUpperCase()}_CLIENT_SECRET`]
    const redirectUri = process.env[`${platform.toUpperCase()}_REDIRECT_URI`] ||
      `${process.env.NEXT_PUBLIC_APP_URL}/api/social/accounts/callback/${platform}`

    if (!clientId || !clientSecret) {
      return NextResponse.redirect(
        new URL('/social/settings?error=not_configured', request.url)
      )
    }

    let tokenData: any
    let profileData: any

    // Exchange code for token based on platform
    if (platform === 'facebook' || platform === 'instagram') {
      // Facebook/Instagram token exchange
      const tokenResponse = await fetch(
        `https://graph.facebook.com/v18.0/oauth/access_token?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${clientSecret}&code=${code}`
      )
      tokenData = await tokenResponse.json()

      if (tokenData.error) {
        console.error('Facebook token error:', tokenData.error)
        return NextResponse.redirect(
          new URL('/social/settings?error=token_error', request.url)
        )
      }

      // Get long-lived token
      const longLivedResponse = await fetch(
        `https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${clientId}&client_secret=${clientSecret}&fb_exchange_token=${tokenData.access_token}`
      )
      const longLivedData = await longLivedResponse.json()
      if (longLivedData.access_token) {
        tokenData = longLivedData
      }

      // Get user profile
      const profileResponse = await fetch(
        `https://graph.facebook.com/me?fields=id,name,picture&access_token=${tokenData.access_token}`
      )
      profileData = await profileResponse.json()

    } else if (platform === 'linkedin') {
      // LinkedIn token exchange
      const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri
        })
      })
      tokenData = await tokenResponse.json()

      if (tokenData.error) {
        console.error('LinkedIn token error:', tokenData.error)
        return NextResponse.redirect(
          new URL('/social/settings?error=token_error', request.url)
        )
      }

      // Get user profile
      const profileResponse = await fetch('https://api.linkedin.com/v2/me', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` }
      })
      profileData = await profileResponse.json()

    } else if (platform === 'tiktok') {
      // TikTok token exchange
      const tokenResponse = await fetch('https://open-api.tiktok.com/oauth/access_token/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_key: clientId,
          client_secret: clientSecret,
          code,
          grant_type: 'authorization_code'
        })
      })
      tokenData = await tokenResponse.json()

      if (tokenData.data?.error_code) {
        console.error('TikTok token error:', tokenData)
        return NextResponse.redirect(
          new URL('/social/settings?error=token_error', request.url)
        )
      }

      tokenData = tokenData.data
      profileData = {
        id: tokenData.open_id,
        name: 'TikTok User'
      }
    } else {
      return NextResponse.redirect(
        new URL('/social/settings?error=unsupported_platform', request.url)
      )
    }

    // Save to database
    const accountId = profileData.id || profileData.sub
    const accountName = profileData.name || profileData.localizedFirstName || 'Unknown'
    const profileImage = profileData.picture?.data?.url || profileData.profilePicture?.displayImage || null

    // Calculate expiry
    const expiresIn = tokenData.expires_in || 5184000 // Default 60 days
    const expiresAt = new Date(Date.now() + expiresIn * 1000)

    // Upsert account
    await prisma.socialAccount.upsert({
      where: {
        userId_platform_accountId: {
          userId: stateData.userId,
          platform,
          accountId: String(accountId)
        }
      },
      update: {
        accountName,
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token || null,
        expiresAt,
        profileImage,
        isActive: true,
      },
      create: {
        userId: stateData.userId,
        platform,
        accountId: String(accountId),
        accountName,
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token || null,
        expiresAt,
        profileImage,
      }
    })

    return NextResponse.redirect(
      new URL(`/social/settings?success=connected&platform=${platform}`, request.url)
    )
  } catch (error) {
    console.error('OAuth callback error:', error)
    return NextResponse.redirect(
      new URL('/social/settings?error=callback_error', request.url)
    )
  }
}
