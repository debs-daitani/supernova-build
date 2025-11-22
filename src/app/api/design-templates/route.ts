import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/design-templates - List templates
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    const where: any = { isPublic: true }
    if (category) {
      where.category = category
    }

    const templates = await db.designTemplate.findMany({
      where,
      orderBy: [{ usageCount: 'desc' }, { createdAt: 'desc' }],
    })

    return NextResponse.json(templates)
  } catch (error) {
    console.error('Error fetching templates:', error)
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 })
  }
}

// POST /api/design-templates - Create template (admin)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const template = await db.designTemplate.create({
      data: body,
    })

    return NextResponse.json(template, { status: 201 })
  } catch (error) {
    console.error('Error creating template:', error)
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 })
  }
}
