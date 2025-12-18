import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type RouteContext = {
  params: Promise<{ id: string }>
}

// POST /api/marketing/pages/[id]/submit - Public form submission on landing page
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const body = await request.json()

    // Find the landing page
    const page = await prisma.landingPage.findUnique({
      where: { id }
    })

    if (!page || page.status !== 'published') {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 })
    }

    // Increment conversion count
    await prisma.landingPage.update({
      where: { id },
      data: { conversions: { increment: 1 } }
    })

    // Find any automations triggered by form submission
    const automations = await prisma.automation.findMany({
      where: {
        userId: page.userId,
        status: 'active',
      }
    })

    // Run automation actions
    for (const automation of automations) {
      const trigger = automation.trigger as any
      if (trigger?.type === 'form_submitted') {
        await runAutomationActions(automation, body, page.userId)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error submitting form:', error)
    return NextResponse.json({ error: 'Failed to submit' }, { status: 500 })
  }
}

async function runAutomationActions(automation: any, formData: any, userId: string) {
  const actions = automation.actions as any[]

  for (const action of actions) {
    switch (action.type) {
      case 'add_to_list':
        // In a real app, you'd add to an email list service
        console.log(`Adding ${formData.email} to list: ${action.listName}`)
        break
      case 'add_tag':
        // In a real app, you'd add a tag to the subscriber
        console.log(`Adding tag ${action.tag} to ${formData.email}`)
        break
      case 'send_email':
        // In a real app, you'd send an email via service like SendGrid
        console.log(`Sending email to ${formData.email}: ${action.subject}`)
        break
      case 'webhook':
        // Send data to webhook URL
        if (action.url) {
          try {
            await fetch(action.url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(formData)
            })
          } catch (e) {
            console.error('Webhook failed:', e)
          }
        }
        break
    }
  }

  // Update run count
  await prisma.automation.update({
    where: { id: automation.id },
    data: { runCount: { increment: 1 } }
  })
}
