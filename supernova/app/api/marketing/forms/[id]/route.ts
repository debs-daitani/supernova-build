import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth-middleware'

type RouteContext = {
  params: Promise<{ id: string }>
}

// GET /api/marketing/forms/[id]
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params

    const form = await prisma.marketingForm.findFirst({
      where: { id, userId: auth.userId },
      include: {
        formSubmissions: {
          orderBy: { createdAt: 'desc' },
          take: 100
        },
        _count: {
          select: { formSubmissions: true }
        }
      }
    })

    if (!form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 })
    }

    return NextResponse.json(form)
  } catch (error) {
    console.error('Error fetching form:', error)
    return NextResponse.json({ error: 'Failed to fetch form' }, { status: 500 })
  }
}

// PUT /api/marketing/forms/[id]
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params
    const body = await request.json()

    const existing = await prisma.marketingForm.findFirst({
      where: { id, userId: auth.userId }
    })

    if (!existing) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 })
    }

    const { name, fields, settings } = body

    const form = await prisma.marketingForm.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(fields !== undefined && { fields }),
        ...(settings !== undefined && { settings }),
      }
    })

    return NextResponse.json(form)
  } catch (error) {
    console.error('Error updating form:', error)
    return NextResponse.json({ error: 'Failed to update form' }, { status: 500 })
  }
}

// DELETE /api/marketing/forms/[id]
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params

    const existing = await prisma.marketingForm.findFirst({
      where: { id, userId: auth.userId }
    })

    if (!existing) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 })
    }

    await prisma.marketingForm.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting form:', error)
    return NextResponse.json({ error: 'Failed to delete form' }, { status: 500 })
  }
}

// POST /api/marketing/forms/[id] - Public form submission
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const body = await request.json()

    const form = await prisma.marketingForm.findUnique({
      where: { id }
    })

    if (!form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 })
    }

    // Create submission
    const submission = await prisma.formSubmission.create({
      data: {
        formId: id,
        data: body,
      }
    })

    // Update submission count
    await prisma.marketingForm.update({
      where: { id },
      data: { submissions: { increment: 1 } }
    })

    // Check for automations triggered by this form
    const automations = await prisma.automation.findMany({
      where: {
        userId: form.userId,
        isActive: true,
      }
    })

    for (const automation of automations) {
      const trigger = automation.trigger as any
      if (trigger.type === 'form_submitted' && trigger.formId === id) {
        // Run automation actions
        await runAutomationActions(automation, body, form.userId)
      }
    }

    const settings = form.settings as any
    return NextResponse.json({
      success: true,
      redirectUrl: settings?.redirectUrl,
      message: settings?.successMessage || 'Thank you for your submission!'
    })
  } catch (error) {
    console.error('Error processing form submission:', error)
    return NextResponse.json({ error: 'Failed to submit form' }, { status: 500 })
  }
}

async function runAutomationActions(automation: any, formData: any, userId: string) {
  const actions = automation.actions as any[]

  for (const action of actions) {
    try {
      switch (action.type) {
        case 'add_to_list':
          // Add to email list
          if (formData.email) {
            await prisma.emailSubscriber.upsert({
              where: { email: formData.email },
              create: {
                email: formData.email,
                name: formData.name || null,
                tags: action.tags || [],
                source: 'form',
              },
              update: {
                tags: { push: action.tags || [] }
              }
            })
          }
          break

        case 'add_tag':
          if (formData.email) {
            await prisma.emailSubscriber.update({
              where: { email: formData.email },
              data: { tags: { push: action.tag } }
            })
          }
          break

        // More action types can be added here
      }
    } catch (err) {
      console.error('Automation action failed:', err)
    }
  }

  // Increment run count
  await prisma.automation.update({
    where: { id: automation.id },
    data: { runCount: { increment: 1 } }
  })
}
