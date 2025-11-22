import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/form-submissions - List all form submissions
export async function GET(request: NextRequest) {
  try {
    // TODO: Get userId from session
    const userId = 'user_1'

    const { searchParams } = new URL(request.url)
    const websiteId = searchParams.get('websiteId')
    const formName = searchParams.get('formName')

    const where: any = { userId }

    if (websiteId) {
      where.websiteId = websiteId
    }

    if (formName) {
      where.formName = formName
    }

    const submissions = await db.formSubmission.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(submissions)
  } catch (error) {
    console.error('Error fetching form submissions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch form submissions' },
      { status: 500 }
    )
  }
}

// POST /api/form-submissions - Create a new form submission
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { websiteId, pageId, formName, data } = body

    // Extract common fields
    const name = data.name || data.fullName || null
    const email = data.email || null
    const phone = data.phone || null
    const message = data.message || data.comment || null

    // Get website owner
    const website = await db.website.findUnique({
      where: { id: websiteId },
    })

    if (!website) {
      return NextResponse.json(
        { error: 'Website not found' },
        { status: 404 }
      )
    }

    // Get client info
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
    const userAgent = request.headers.get('user-agent')

    const submission = await db.formSubmission.create({
      data: {
        userId: website.userId,
        websiteId,
        pageId,
        formName,
        data,
        name,
        email,
        phone,
        message,
        ipAddress,
        userAgent,
      },
    })

    // TODO: Send email notification to website owner

    return NextResponse.json(submission, { status: 201 })
  } catch (error) {
    console.error('Error creating form submission:', error)
    return NextResponse.json(
      { error: 'Failed to create form submission' },
      { status: 500 }
    )
  }
}
