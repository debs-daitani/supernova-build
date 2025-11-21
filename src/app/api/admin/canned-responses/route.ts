import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

// GET - List canned responses
export async function GET() {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const responses = await prisma.cannedResponse.findMany({
      where: { isActive: true },
      orderBy: [{ category: 'asc' }, { title: 'asc' }],
    })

    return NextResponse.json(responses)
  } catch (error) {
    console.error('Error fetching canned responses:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create canned response
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { title, category, content } = body

    if (!title || !category || !content) {
      return NextResponse.json(
        { error: 'Title, category, and content are required' },
        { status: 400 }
      )
    }

    const response = await prisma.cannedResponse.create({
      data: {
        title,
        category,
        content,
        createdBy: session.user.id,
      },
    })

    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error('Error creating canned response:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
