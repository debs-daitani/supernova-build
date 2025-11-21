import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { validateCSVData, importUsers, type CSVRow } from '@/lib/migration'

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
    const { rows, filename, dryRun = false } = body as {
      rows: CSVRow[]
      filename: string
      dryRun?: boolean
    }

    if (!rows || !Array.isArray(rows)) {
      return NextResponse.json({ error: 'Invalid CSV data' }, { status: 400 })
    }

    if (!filename) {
      return NextResponse.json({ error: 'Filename is required' }, { status: 400 })
    }

    // First validate the data
    const validation = await validateCSVData(rows)

    if (!validation.success || !validation.users) {
      return NextResponse.json({
        error: 'CSV validation failed',
        details: validation,
      })
    }

    // Import the validated users
    const result = await importUsers(validation.users, session.user.id, filename, dryRun)

    return NextResponse.json({
      ...result,
      dryRun,
    })
  } catch (error) {
    console.error('Error importing users:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
