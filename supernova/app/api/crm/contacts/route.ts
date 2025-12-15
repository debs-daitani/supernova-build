import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

function getUserIdFromRequest(request: NextRequest): string | null {
  const token = request.cookies.get('token')?.value
  if (!token) return null

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
    return decoded.userId
  } catch {
    return null
  }
}

// GET /api/crm/contacts - List contacts with filters
export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status')
    const source = searchParams.get('source')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = (page - 1) * limit

    const where: any = { userId }

    // Search filter
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
      ]
    }

    // Status filter
    if (status && status !== 'ALL') {
      where.status = status
    }

    // Source filter
    if (source && source !== 'ALL') {
      where.source = source
    }

    const [contacts, total] = await Promise.all([
      prisma.contact.findMany({
        where,
        include: {
          deals: {
            select: {
              id: true,
              stage: true,
            },
          },
          tasks: {
            where: {
              status: { in: ['PENDING', 'IN_PROGRESS'] },
            },
            select: {
              id: true,
            },
          },
          _count: {
            select: {
              activities: true,
              deals: true,
              tasks: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.contact.count({ where }),
    ])

    return NextResponse.json({
      contacts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Error fetching contacts:', error)
    return NextResponse.json({ error: 'Failed to fetch contacts' }, { status: 500 })
  }
}

// POST /api/crm/contacts - Create contact
export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      firstName,
      lastName,
      email,
      phone,
      company,
      tags,
      notes,
      source,
      status,
    } = body

    // Validate required fields
    if (!firstName) {
      return NextResponse.json(
        { error: 'First name is required' },
        { status: 400 }
      )
    }

    // Check if email already exists for this user
    if (email) {
      const existing = await prisma.contact.findFirst({
        where: { email, userId },
      })

      if (existing) {
        return NextResponse.json(
          { error: 'Contact with this email already exists' },
          { status: 409 }
        )
      }
    }

    const contact = await prisma.contact.create({
      data: {
        firstName,
        lastName: lastName || null,
        email,
        phone,
        company,
        tags: tags || [],
        notes,
        source: source || 'manual',
        status: status || 'lead',
        userId,
      },
    })

    return NextResponse.json(contact, { status: 201 })
  } catch (error) {
    console.error('Error creating contact:', error)
    return NextResponse.json({ error: 'Failed to create contact' }, { status: 500 })
  }
}
