import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/design-assets - List user's assets
export async function GET(request: NextRequest) {
  try {
    // TODO: Get userId from session
    const userId = 'user_1'

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    const where: any = { userId }
    if (type) {
      where.type = type
    }

    const assets = await db.designAsset.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(assets)
  } catch (error) {
    console.error('Error fetching assets:', error)
    return NextResponse.json({ error: 'Failed to fetch assets' }, { status: 500 })
  }
}

// POST /api/design-assets - Upload asset
export async function POST(request: NextRequest) {
  try {
    // TODO: Get userId from session
    const userId = 'user_1'

    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 10MB' }, { status: 400 })
    }

    // TODO: Upload to cloud storage (S3, Cloudinary, etc.)
    const fileName = `${userId}-${Date.now()}-${file.name}`
    const fileUrl = `/uploads/design-assets/${fileName}`

    const asset = await db.designAsset.create({
      data: {
        userId,
        name: file.name,
        type: type || 'IMAGE',
        fileUrl,
        thumbnailUrl: fileUrl,
        fileSize: file.size,
        mimeType: file.type,
      },
    })

    return NextResponse.json(asset, { status: 201 })
  } catch (error) {
    console.error('Error uploading asset:', error)
    return NextResponse.json({ error: 'Failed to upload asset' }, { status: 500 })
  }
}
