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
        const { name, email, phone, company, jobTitle, location, tags, status } = contactData

        if (!name || !email) {
          results.errors.push(`Missing required fields for contact: ${email || 'unknown'}`)
          continue
        }

        // Check for duplicates
        const existing = await prisma.contact.findUnique({
          where: { email },
        })

        if (existing) {
          if (skipDuplicates) {
            results.skipped++
            continue
          } else {
            // Update existing contact
            await prisma.contact.update({
              where: { email },
              data: {
                name,
                phone,
                company,
                jobTitle,
                location,
                tags: tags || [],
                status: status || 'LEAD',
              },
            })
            results.imported++
          }
        } else {
          // Create new contact
          await prisma.contact.create({
            data: {
              name,
              email,
              phone,
              company,
              jobTitle,
              location,
              tags: tags || [],
              source: 'IMPORT',
              status: status || 'LEAD',
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
