import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth-middleware'

// POST /api/crm/contacts/import - Import contacts from CSV
export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const userId = auth.userId

    const body = await request.json()
    const { contacts, skipDuplicates = true } = body

    if (!contacts || !Array.isArray(contacts)) {
      return NextResponse.json(
        { error: 'Invalid contacts data' },
        { status: 400 }
      )
    }

    const results = {
      imported: 0,
      skipped: 0,
      errors: [] as string[],
    }

    // Get all existing emails for this user in one query (much faster than checking each one)
    const existingContacts = await prisma.contact.findMany({
      where: { userId },
      select: { id: true, email: true },
    })
    const existingEmailMap = new Map(
      existingContacts
        .filter(c => c.email)
        .map(c => [c.email!.toLowerCase(), c.id])
    )

    // Prepare contacts for batch insert
    const contactsToCreate: any[] = []
    const contactsToUpdate: { id: string; data: any }[] = []

    for (const contactData of contacts) {
      try {
        const { firstName, lastName, email, phone, company, tags, notes, status } = contactData

        if (!firstName) {
          results.errors.push(`Missing first name for contact: ${email || 'unknown'}`)
          continue
        }

        // Check for duplicates by email (if provided)
        const existingId = email ? existingEmailMap.get(email.toLowerCase()) : null

        if (existingId) {
          if (skipDuplicates) {
            results.skipped++
            continue
          } else {
            // Queue for update
            contactsToUpdate.push({
              id: existingId,
              data: {
                firstName,
                lastName: lastName || null,
                phone,
                company,
                tags: tags || [],
                notes,
                status: status || 'lead',
              },
            })
            results.imported++
          }
        } else {
          // Queue for batch create
          contactsToCreate.push({
            firstName,
            lastName: lastName || null,
            email: email || null,
            phone: phone || null,
            company: company || null,
            tags: tags || [],
            notes: notes || null,
            source: 'import',
            status: status || 'lead',
            userId,
          })
          results.imported++

          // Add to map to prevent duplicates within same import
          if (email) {
            existingEmailMap.set(email.toLowerCase(), 'pending')
          }
        }
      } catch (error) {
        results.errors.push(`Error processing contact ${contactData.email}: ${error}`)
      }
    }

    // Batch create contacts (much faster than individual creates)
    if (contactsToCreate.length > 0) {
      // Process in batches of 100 to avoid overwhelming the database
      const BATCH_SIZE = 100
      for (let i = 0; i < contactsToCreate.length; i += BATCH_SIZE) {
        const batch = contactsToCreate.slice(i, i + BATCH_SIZE)
        await prisma.contact.createMany({
          data: batch,
          skipDuplicates: true,
        })
      }
    }

    // Process updates (still need to do these individually)
    for (const update of contactsToUpdate) {
      try {
        await prisma.contact.update({
          where: { id: update.id },
          data: update.data,
        })
      } catch (error) {
        results.errors.push(`Error updating contact: ${error}`)
        results.imported-- // Decrement since we already counted it
      }
    }

    return NextResponse.json(results)
  } catch (error) {
    console.error('Error importing contacts:', error)
    return NextResponse.json({ error: 'Failed to import contacts' }, { status: 500 })
  }
}
