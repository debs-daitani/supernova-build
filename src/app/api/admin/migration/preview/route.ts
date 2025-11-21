import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { validateCSVData, type CSVRow } from '@/lib/migration'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is ADMIN
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { rows } = body as { rows: CSVRow[] }

    if (!rows || !Array.isArray(rows)) {
      return NextResponse.json({ error: 'Invalid CSV data' }, { status: 400 })
    }

    // Validate the CSV data
    const result = await validateCSVData(rows)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error previewing migration:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
