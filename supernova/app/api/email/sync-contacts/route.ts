import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth-middleware'

// POST /api/email/sync-contacts - Sync CRM contacts to email subscribers
export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all CRM contacts with email addresses
    const contacts = await prisma.contact.findMany({
      where: {
        userId: auth.userId,
        email: {
          not: null
        }
      }
    })

    let syncedCount = 0
    let skippedCount = 0
    let errorCount = 0

    // Sync each contact to email subscribers
    for (const contact of contacts) {
      if (!contact.email) continue

      try {
        // Check if already exists
        const existing = await prisma.emailSubscriber.findUnique({
          where: { email: contact.email }
        })

        if (existing) {
          // Update existing subscriber with contact info
          await prisma.emailSubscriber.update({
            where: { email: contact.email },
            data: {
              name: contact.firstName + (contact.lastName ? ' ' + contact.lastName : ''),
              tags: [...new Set([...existing.tags, ...contact.tags])], // Merge tags
              source: existing.source || 'crm_sync'
            }
          })
          skippedCount++
        } else {
          // Create new subscriber
          await prisma.emailSubscriber.create({
            data: {
              email: contact.email,
              name: contact.firstName + (contact.lastName ? ' ' + contact.lastName : ''),
              tags: contact.tags,
              status: 'active',
              source: 'crm_sync'
            }
          })
          syncedCount++
        }
      } catch (error) {
        console.error(`Failed to sync contact ${contact.email}:`, error)
        errorCount++
      }
    }

    return NextResponse.json({
      success: true,
      totalContacts: contacts.length,
      syncedCount,
      skippedCount,
      errorCount,
      message: `Synced ${syncedCount} contacts, ${skippedCount} already existed, ${errorCount} errors`
    })
  } catch (error) {
    console.error('Error syncing contacts:', error)
    return NextResponse.json({ error: 'Failed to sync contacts' }, { status: 500 })
  }
}
