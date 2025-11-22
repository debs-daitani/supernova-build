import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { trackAffiliateClick } from '@/lib/affiliates'

/**
 * GET /api/ref/:code
 * Track affiliate click and redirect to signup
 * Public route
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const affiliateCode = params.code

    // Verify affiliate code exists and is active
    const affiliateProfile = await prisma.affiliateProfile.findUnique({
      where: { affiliateCode },
      select: { isActive: true },
    })

    if (!affiliateProfile || !affiliateProfile.isActive) {
      // Invalid or inactive code - redirect to home page
      return NextResponse.redirect(new URL('/', request.url))
    }

    // Track the click
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined
    const userAgent = request.headers.get('user-agent') || undefined
    const referer = request.headers.get('referer') || undefined

    await trackAffiliateClick(affiliateCode, ipAddress, userAgent, referer)

    // Create response with redirect to signup
    const signupUrl = new URL('/signup', request.url)
    const response = NextResponse.redirect(signupUrl)

    // Set cookie to track referral for 30 days
    response.cookies.set('ref_code', affiliateCode, {
      maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    })

    return response
  } catch (error) {
    console.error('Error tracking referral:', error)
    // On error, redirect to home page
    return NextResponse.redirect(new URL('/', request.url))
  }
}
