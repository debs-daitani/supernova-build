import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth-middleware'

// GET /api/calendar/status - Check connection status
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const connection = await prisma.calendarConnection.findUnique({
      where: { userId: auth.userId },
    })

    if (!connection) {
      return NextResponse.json({
        connected: false,
        provider: null,
      })
    }

    // Check if token is expired
    const isExpired = new Date() > connection.expiresAt

    return NextResponse.json({
      connected: true,
      provider: connection.provider,
      expiresAt: connection.expiresAt,
      isExpired,
      calendarIds: connection.calendarIds,
    })
  } catch (error) {
    console.error('Error checking calendar status:', error)
    return NextResponse.json({ error: 'Failed to check status' }, { status: 500 })
  }
}

// DELETE /api/calendar/status - Disconnect calendar
export async function DELETE(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.calendarConnection.delete({
      where: { userId: auth.userId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error disconnecting calendar:', error)
    return NextResponse.json({ error: 'Failed to disconnect' }, { status: 500 })
  }
}
