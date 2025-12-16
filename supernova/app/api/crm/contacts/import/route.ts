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

    for (const contactData of contacts) {
      try {
        const { firstName, lastName, email, phone, company, tags, notes, status } = contactData

        if (!firstName) {
          results.errors.push(`Missing first name for contact: ${email || 'unknown'}`)
          continue
        }

        // Check for duplicates by email (if provided)
        let existing = null
        if (email) {
          existing = await prisma.contact.findFirst({
            where: { email, userId },
          })
        }

        if (existing) {
          if (skipDuplicates) {
            results.skipped++
            continue
          } else {
            // Update existing contact
            await prisma.contact.update({
              where: { id: existing.id },
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
          // Create new contact
          await prisma.contact.create({
            data: {
              firstName,
              lastName: lastName || null,
              email,
              phone,
              company,
              tags: tags || [],
              notes,
              source: 'import',
              status: status || 'lead',
              userId,
            },
          })
          results.imported++
        }
      } catch (error) {
        results.errors.push(`Error importing contact ${contactData.email}: ${error}`)
      }
    }

    return NextResponse.json(results)
  } catch (error) {
    console.error('Error importing contacts:', error)
    return NextResponse.json({ error: 'Failed to import contacts' }, { status: 500 })
  }
}
