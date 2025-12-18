import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth-middleware'

// GET /api/marketing/automations - List automations
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const automations = await prisma.automation.findMany({
      where: { userId: auth.userId },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(automations)
  } catch (error) {
    console.error('Error fetching automations:', error)
    return NextResponse.json({ error: 'Failed to fetch automations' }, { status: 500 })
  }
}

// POST /api/marketing/automations - Create automation
export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, trigger, actions } = body

    if (!name || !trigger || !actions) {
      return NextResponse.json({ error: 'Name, trigger, and actions are required' }, { status: 400 })
    }

    const automation = await prisma.automation.create({
      data: {
        userId: auth.userId,
        name,
        trigger,
        actions,
      }
    })

    return NextResponse.json(automation, { status: 201 })
  } catch (error) {
    console.error('Error creating automation:', error)
    return NextResponse.json({ error: 'Failed to create automation' }, { status: 500 })
  }
}
