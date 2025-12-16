import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth-middleware'

// Helper function to refresh Google token if needed
async function getValidAccessToken(userId: string): Promise<string | null> {
  const connection = await prisma.calendarConnection.findUnique({
    where: { userId },
  })

  if (!connection) return null

  if (new Date() > new Date(connection.expiresAt.getTime() - 5 * 60 * 1000)) {
    const clientId = process.env.GOOGLE_CLIENT_ID
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET

    if (!clientId || !clientSecret) return null

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: connection.refreshToken,
        grant_type: 'refresh_token',
      }),
    })

    if (!tokenResponse.ok) return null

    const tokens = await tokenResponse.json()
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000)

    await prisma.calendarConnection.update({
      where: { userId },
      data: {
        accessToken: tokens.access_token,
        expiresAt,
      },
    })

    return tokens.access_token
  }

  return connection.accessToken
}

// GET /api/calendar/events/[id] - Get single event
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const auth = await verifyAuth(request)
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const event = await prisma.calendarEvent.findUnique({
      where: { id },
      include: {
        contact: {
          select: { id: true, firstName: true, lastName: true, company: true },
        },
      },
    })

    if (!event || event.userId !== auth.userId) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    return NextResponse.json(event)
  } catch (error) {
    console.error('Error fetching event:', error)
    return NextResponse.json({ error: 'Failed to fetch event' }, { status: 500 })
  }
}

// PATCH /api/calendar/events/[id] - Update event
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const auth = await verifyAuth(request)
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check ownership
    const existing = await prisma.calendarEvent.findUnique({
      where: { id },
    })

    if (!existing || existing.userId !== auth.userId) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    const body = await request.json()
    const {
      title,
      description,
      startTime,
      endTime,
      allDay,
      location,
      colour,
      contactId,
    } = body

    // Update in Google Calendar if synced
    if (existing.externalId) {
      const accessToken = await getValidAccessToken(auth.userId)
      if (accessToken) {
        const googleEvent: any = {}
        if (title) googleEvent.summary = title
        if (description !== undefined) googleEvent.description = description
        if (location !== undefined) googleEvent.location = location
        if (startTime) {
          googleEvent.start = allDay
            ? { date: new Date(startTime).toISOString().split('T')[0] }
            : { dateTime: new Date(startTime).toISOString() }
        }
        if (endTime) {
          googleEvent.end = allDay
            ? { date: new Date(endTime).toISOString().split('T')[0] }
            : { dateTime: new Date(endTime).toISOString() }
        }

        try {
          await fetch(
            `https://www.googleapis.com/calendar/v3/calendars/primary/events/${existing.externalId}`,
            {
              method: 'PATCH',
              headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(googleEvent),
            }
          )
        } catch (e) {
          console.error('Failed to update in Google:', e)
        }
      }
    }

    // Update in database
    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (startTime) updateData.startTime = new Date(startTime)
    if (endTime) updateData.endTime = new Date(endTime)
    if (allDay !== undefined) updateData.allDay = allDay
    if (location !== undefined) updateData.location = location
    if (colour !== undefined) updateData.colour = colour
    if (contactId !== undefined) updateData.contactId = contactId || null

    const event = await prisma.calendarEvent.update({
      where: { id },
      data: updateData,
      include: {
        contact: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    })

    return NextResponse.json(event)
  } catch (error) {
    console.error('Error updating event:', error)
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 })
  }
}

// DELETE /api/calendar/events/[id] - Delete single event
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const auth = await verifyAuth(request)
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check ownership
    const existing = await prisma.calendarEvent.findUnique({
      where: { id },
    })

    if (!existing || existing.userId !== auth.userId) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Delete from Google Calendar if synced
    if (existing.externalId) {
      const accessToken = await getValidAccessToken(auth.userId)
      if (accessToken) {
        try {
          await fetch(
            `https://www.googleapis.com/calendar/v3/calendars/primary/events/${existing.externalId}`,
            {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${accessToken}` },
            }
          )
        } catch (e) {
          console.error('Failed to delete from Google:', e)
        }
      }
    }

    await prisma.calendarEvent.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting event:', error)
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 })
  }
}
