import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { validateName, validateBio, validateUrl, validateSocialHandle, sanitizeInput } from '@/lib/validation'

// GET /api/user/profile - Get user profile
export async function GET(request: NextRequest) {
  try {
    // TODO: Get userId from session
    const userId = 'user_1'

    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        username: true,
        profilePhotoUrl: true,
        bio: true,
        pronouns: true,
        twitterHandle: true,
        linkedinUrl: true,
        instagramHandle: true,
        websiteUrl: true,
        createdAt: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
  }
}

// PUT /api/user/profile - Update user profile
export async function PUT(request: NextRequest) {
  try {
    // TODO: Get userId from session
    const userId = 'user_1'

    const body = await request.json()
    const { firstName, lastName, bio, pronouns, twitterHandle, linkedinUrl, instagramHandle, websiteUrl } = body

    // Validate inputs
    const errors: string[] = []

    if (firstName) {
      const validation = validateName(firstName)
      if (!validation.valid) errors.push(validation.error!)
    }

    if (lastName) {
      const validation = validateName(lastName)
      if (!validation.valid) errors.push(validation.error!)
    }

    if (bio) {
      const validation = validateBio(bio)
      if (!validation.valid) errors.push(validation.error!)
    }

    if (linkedinUrl) {
      const validation = validateUrl(linkedinUrl)
      if (!validation.valid) errors.push(`LinkedIn: ${validation.error}`)
    }

    if (websiteUrl) {
      const validation = validateUrl(websiteUrl)
      if (!validation.valid) errors.push(`Website: ${validation.error}`)
    }

    if (twitterHandle) {
      const validation = validateSocialHandle(twitterHandle, 'Twitter')
      if (!validation.valid) errors.push(validation.error!)
    }

    if (instagramHandle) {
      const validation = validateSocialHandle(instagramHandle, 'Instagram')
      if (!validation.valid) errors.push(validation.error!)
    }

    if (errors.length > 0) {
      return NextResponse.json({ error: 'Validation failed', errors }, { status: 400 })
    }

    // Update user profile
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        firstName: firstName ? sanitizeInput(firstName) : undefined,
        lastName: lastName ? sanitizeInput(lastName) : undefined,
        bio: bio ? sanitizeInput(bio) : undefined,
        pronouns: pronouns || undefined,
        twitterHandle: twitterHandle ? sanitizeInput(twitterHandle).replace(/^@/, '') : undefined,
        linkedinUrl: linkedinUrl ? sanitizeInput(linkedinUrl) : undefined,
        instagramHandle: instagramHandle ? sanitizeInput(instagramHandle).replace(/^@/, '') : undefined,
        websiteUrl: websiteUrl ? sanitizeInput(websiteUrl) : undefined,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        profilePhotoUrl: true,
        bio: true,
        pronouns: true,
        twitterHandle: true,
        linkedinUrl: true,
        instagramHandle: true,
        websiteUrl: true,
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
