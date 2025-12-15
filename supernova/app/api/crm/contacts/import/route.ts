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

// POST /api/crm/contacts/import - Import contacts from CSV
export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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
