import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth-middleware'

type RouteContext = {
  params: Promise<{ platform: string }>
}

// Platform-specific OAuth URLs
const OAUTH_CONFIGS: Record<string, { authUrl: string; scopes: string[] }> = {
  facebook: {
    authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
    scopes: ['pages_manage_posts', 'pages_read_engagement', 'pages_show_list', 'public_profile']
  },
  instagram: {
    // Instagram uses Facebook OAuth (requires business account + Facebook Page)
    authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
    scopes: ['instagram_basic', 'instagram_content_publish', 'pages_show_list', 'pages_read_engagement', 'public_profile']
  },
  linkedin: {
    authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
    scopes: ['r_liteprofile', 'r_emailaddress', 'w_member_social']
  },
  tiktok: {
    authUrl: 'https://www.tiktok.com/auth/authorize/',
    scopes: ['user.info.basic', 'video.upload', 'video.publish']
  }
}

// GET /api/social/accounts/connect/[platform] - Initiate OAuth
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { platform } = await context.params
    const config = OAUTH_CONFIGS[platform]

    if (!config) {
      return NextResponse.json({ error: 'Unsupported platform' }, { status: 400 })
    }

    // Check for required environment variables
    const clientId = process.env[`${platform.toUpperCase()}_CLIENT_ID`]
    const redirectUri = process.env[`${platform.toUpperCase()}_REDIRECT_URI`] ||
      `${process.env.NEXT_PUBLIC_APP_URL}/api/social/accounts/callback/${platform}`

    if (!clientId) {
      return NextResponse.json({
        error: `${platform} not configured`,
        message: `Please configure ${platform.toUpperCase()}_CLIENT_ID in your environment variables`,
        setup: getSetupInstructions(platform)
      }, { status: 400 })
    }

    // Build OAuth URL
    const state = Buffer.from(JSON.stringify({
      userId: auth.userId,
      timestamp: Date.now()
    })).toString('base64')

    let authUrl: string

    if (platform === 'facebook' || platform === 'instagram') {
      authUrl = `${config.authUrl}?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${config.scopes.join(',')}&state=${state}&response_type=code`
    } else if (platform === 'linkedin') {
      authUrl = `${config.authUrl}?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${config.scopes.join('%20')}&state=${state}&response_type=code`
    } else if (platform === 'tiktok') {
      authUrl = `${config.authUrl}?client_key=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${config.scopes.join(',')}&state=${state}&response_type=code`
    } else {
      authUrl = ''
    }

    return NextResponse.json({ authUrl, platform })
  } catch (error) {
    console.error('Error initiating OAuth:', error)
    return NextResponse.json({ error: 'Failed to initiate connection' }, { status: 500 })
  }
}

function getSetupInstructions(platform: string): string {
  switch (platform) {
    case 'facebook':
    case 'instagram':
      return `
1. Go to developers.facebook.com
2. Create or select your app
3. Add Facebook Login product
4. Configure OAuth redirect URIs
5. Add FACEBOOK_CLIENT_ID and FACEBOOK_CLIENT_SECRET to env vars
For Instagram: User must have a Business/Creator account connected to a Facebook Page
      `.trim()
    case 'linkedin':
      return `
1. Go to linkedin.com/developers
2. Create or select your app
3. Request Marketing API access for posting
4. Add LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET to env vars
      `.trim()
    case 'tiktok':
      return `
1. Go to developers.tiktok.com
2. Create your app
3. Request Content Posting API access
4. Add TIKTOK_CLIENT_ID and TIKTOK_CLIENT_SECRET to env vars
      `.trim()
    default:
      return 'Contact support for setup instructions'
  }
}
