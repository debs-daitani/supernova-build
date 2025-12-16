import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth-middleware'

// Helper function to refresh Google token if needed
async function getValidAccessToken(userId: string): Promise<string | null> {
  const connection = await prisma.calendarConnection.findUnique({
    where: { userId },
  })

  if (!connection) return null

  // Check if token needs refresh (with 5 min buffer)
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

// GET /api/calendar/events - Fetch events
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const start = searchParams.get('start')
    const end = searchParams.get('end')
    const syncGoogle = searchParams.get('syncGoogle') === 'true'

    const userId = auth.userId

    // If sync requested and connected to Google, fetch from Google
    if (syncGoogle) {
      const accessToken = await getValidAccessToken(userId)
      if (accessToken) {
        try {
          const params = new URLSearchParams({
            timeMin: start || new Date().toISOString(),
            timeMax: end || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            singleEvents: 'true',
            orderBy: 'startTime',
            maxResults: '250',
          })

          const googleResponse = await fetch(
            `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`,
            {
              headers: { Authorization: `Bearer ${accessToken}` },
            }
          )

          if (googleResponse.ok) {
            const googleData = await googleResponse.json()

            // Sync Google events to our database
            for (const gEvent of googleData.items || []) {
              const startTime = gEvent.start?.dateTime || gEvent.start?.date
              const endTime = gEvent.end?.dateTime || gEvent.end?.date

              if (startTime && endTime) {
                await prisma.calendarEvent.upsert({
                  where: {
                    id: gEvent.id, // This won't match, we need externalId
                  },
                  create: {
                    userId,
                    externalId: gEvent.id,
                    title: gEvent.summary || 'Untitled Event',
                    description: gEvent.description || null,
                    startTime: new Date(startTime),
                    endTime: new Date(endTime),
                    allDay: !gEvent.start?.dateTime,
                    location: gEvent.location || null,
                    source: 'google',
                  },
                  update: {
                    title: gEvent.summary || 'Untitled Event',
                    description: gEvent.description || null,
                    startTime: new Date(startTime),
                    endTime: new Date(endTime),
                    allDay: !gEvent.start?.dateTime,
                    location: gEvent.location || null,
                  },
                })
              }
            }
          }
        } catch (syncError) {
          console.error('Google sync error:', syncError)
        }
      }
    }

    // Build query filters
    const where: any = { userId }

    if (start) {
      where.startTime = { ...where.startTime, gte: new Date(start) }
    }
    if (end) {
      where.endTime = { ...where.endTime, lte: new Date(end) }
    }

    // Fetch events from database
    const events = await prisma.calendarEvent.findMany({
      where,
      orderBy: { startTime: 'asc' },
      include: {
        contact: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    })

    // Also fetch VENUED tasks that are scheduled
    const venuedTasks = await prisma.venuedTask.findMany({
      where: {
        userId,
        scheduledDate: {
          gte: start ? new Date(start) : undefined,
          lte: end ? new Date(end) : undefined,
        },
      },
      orderBy: { scheduledDate: 'asc' },
    })

    // Convert VENUED tasks to event format
    const venuedEvents = venuedTasks
      .filter(task => task.scheduledDate)
      .map(task => ({
        id: `venued-${task.id}`,
        userId: task.userId,
        externalId: null,
        title: task.title,
        description: task.description,
        startTime: task.scheduledDate,
        endTime: new Date((task.scheduledDate as Date).getTime() + (task.estimatedMins || 30) * 60 * 1000),
        allDay: false,
        location: null,
        colour: '#FF008E', // VENUED color
        isRecurring: false,
        recurrenceRule: null,
        contactId: null,
        venuedTaskId: task.id,
        source: 'venued',
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
        contact: null,
        isCompleted: task.completed,
      }))

    return NextResponse.json({
      events: [...events, ...venuedEvents].sort(
        (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      ),
    })
  } catch (error) {
    console.error('Error fetching calendar events:', error)
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 })
  }
}

// POST /api/calendar/events - Create event
export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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
      syncToGoogle,
    } = body

    if (!title || !startTime || !endTime) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const userId = auth.userId
    let externalId = null

    // Create in Google Calendar if requested and connected
    if (syncToGoogle) {
      const accessToken = await getValidAccessToken(userId)
      if (accessToken) {
        const googleEvent = {
          summary: title,
          description,
          location,
          start: allDay
            ? { date: new Date(startTime).toISOString().split('T')[0] }
            : { dateTime: new Date(startTime).toISOString() },
          end: allDay
            ? { date: new Date(endTime).toISOString().split('T')[0] }
            : { dateTime: new Date(endTime).toISOString() },
        }

        const googleResponse = await fetch(
          'https://www.googleapis.com/calendar/v3/calendars/primary/events',
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(googleEvent),
          }
        )

        if (googleResponse.ok) {
          const created = await googleResponse.json()
          externalId = created.id
        }
      }
    }

    // Create in database
    const event = await prisma.calendarEvent.create({
      data: {
        userId,
        externalId,
        title,
        description: description || null,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        allDay: allDay || false,
        location: location || null,
        colour: colour || null,
        contactId: contactId || null,
        source: externalId ? 'google' : 'manual',
      },
      include: {
        contact: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    })

    return NextResponse.json(event)
  } catch (error) {
    console.error('Error creating calendar event:', error)
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 })
  }
}

// DELETE /api/calendar/events - Bulk delete events
export async function DELETE(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { ids } = await request.json()

    if (!ids || !Array.isArray(ids)) {
      return NextResponse.json({ error: 'Missing event IDs' }, { status: 400 })
    }

    // Get events to check for Google Calendar IDs
    const events = await prisma.calendarEvent.findMany({
      where: {
        id: { in: ids },
        userId: auth.userId,
      },
    })

    // Delete from Google Calendar if connected
    const accessToken = await getValidAccessToken(auth.userId)
    if (accessToken) {
      for (const event of events) {
        if (event.externalId) {
          try {
            await fetch(
              `https://www.googleapis.com/calendar/v3/calendars/primary/events/${event.externalId}`,
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
    }

    // Delete from database
    const result = await prisma.calendarEvent.deleteMany({
      where: {
        id: { in: ids },
        userId: auth.userId,
      },
    })

    return NextResponse.json({ deleted: result.count })
  } catch (error) {
    console.error('Error deleting calendar events:', error)
    return NextResponse.json({ error: 'Failed to delete events' }, { status: 500 })
  }
}
