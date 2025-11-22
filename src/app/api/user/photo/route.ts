import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST /api/user/photo - Upload profile photo
export async function POST(request: NextRequest) {
  try {
    // TODO: Get userId from session
    const userId = 'user_1'

    const formData = await request.formData()
    const file = formData.get('photo') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 })
    }

    // TODO: Upload to cloud storage (S3, Cloudinary, etc.)
    // For now, we'll just create a placeholder URL
    const fileName = `${userId}-${Date.now()}-${file.name}`
    const photoUrl = `/uploads/${fileName}`

    // In production, you would:
    // 1. Upload file to S3/Cloudinary
    // 2. Generate thumbnail
    // 3. Return CDN URL

    // Update user profile photo
    const user = await db.user.update({
      where: { id: userId },
      data: { profilePhotoUrl: photoUrl },
      select: { id: true, profilePhotoUrl: true },
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error uploading photo:', error)
    return NextResponse.json({ error: 'Failed to upload photo' }, { status: 500 })
  }
}

// DELETE /api/user/photo - Remove profile photo
export async function DELETE(request: NextRequest) {
  try {
    // TODO: Get userId from session
    const userId = 'user_1'

    // TODO: Delete file from cloud storage

    const user = await db.user.update({
      where: { id: userId },
      data: { profilePhotoUrl: null },
      select: { id: true, profilePhotoUrl: true },
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error removing photo:', error)
    return NextResponse.json({ error: 'Failed to remove photo' }, { status: 500 })
  }
}
