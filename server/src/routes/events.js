import express from 'express';
import prisma from '../config/database.js';
import { authenticate as authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Helper function to generate slug from title
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    + '-' + Math.random().toString(36).substring(2, 8);
}

// ============================================
// EVENTS
// ============================================

// Get all events (public + user's events)
router.get('/events', async (req, res) => {
  try {
    const { category, eventType, published, upcoming, userId } = req.query;

    const where = {};

    if (category) where.category = category;
    if (eventType) where.eventType = eventType;
    if (published !== undefined) where.isPublished = published === 'true';
    if (userId) where.userId = userId;

    // Filter for upcoming events
    if (upcoming) {
      where.startDateTime = { gte: new Date() };
    }

    const events = await prisma.event.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, avatar: true },
        },
        tickets: true,
        _count: {
          select: { registrations: true },
        },
      },
      orderBy: { startDateTime: 'asc' },
    });

    // Add registered count and availability
    const eventsWithStats = events.map(event => {
      const totalRegistered = event._count.registrations;
      const spotsLeft = event.unlimitedCapacity
        ? null
        : event.maxAttendees ? event.maxAttendees - totalRegistered : null;

      return {
        ...event,
        totalRegistered,
        spotsLeft,
      };
    });

    res.json(eventsWithStats);
  } catch (error) {
    console.error('Failed to fetch events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Get single event (public or user's own)
router.get('/events/:slug', async (req, res) => {
  try {
    const event = await prisma.event.findUnique({
      where: { slug: req.params.slug },
      include: {
        user: {
          select: { id: true, name: true, avatar: true },
        },
        tickets: true,
        sessions: {
          orderBy: { order: 'asc' },
        },
        _count: {
          select: { registrations: true },
        },
      },
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check if event is public or user is owner
    const isOwner = req.user && event.userId === req.user.id;
    if (!event.isPublished && !event.isPublic && !isOwner) {
      return res.status(403).json({ error: 'Event not found' });
    }

    const totalRegistered = event._count.registrations;
    const spotsLeft = event.unlimitedCapacity
      ? null
      : event.maxAttendees ? event.maxAttendees - totalRegistered : null;

    res.json({
      ...event,
      totalRegistered,
      spotsLeft,
    });
  } catch (error) {
    console.error('Failed to fetch event:', error);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

// Create event (authenticated)
router.post('/events', authMiddleware, async (req, res) => {
  try {
    const {
      title,
      description,
      coverImage,
      eventType,
      category,
      startDateTime,
      endDateTime,
      timezone,
      venueName,
      venueAddress,
      venueCity,
      venuePostcode,
      venueCountry,
      streamUrl,
      streamPlatform,
      maxAttendees,
      unlimitedCapacity,
      requiresApproval,
      registrationDeadline,
      isPublic,
      allowWaitlist,
      sendReminders,
      collectAttendeeInfo,
      isFree,
      seoTitle,
      seoDescription,
      tickets = [],
      sessions = [],
    } = req.body;

    if (!title || !description || !eventType || !category || !startDateTime || !endDateTime) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const slug = generateSlug(title);

    const event = await prisma.event.create({
      data: {
        userId: req.user.id,
        title,
        slug,
        description,
        coverImage,
        eventType,
        category,
        startDateTime: new Date(startDateTime),
        endDateTime: new Date(endDateTime),
        timezone,
        venueName,
        venueAddress,
        venueCity,
        venuePostcode,
        venueCountry,
        streamUrl,
        streamPlatform,
        maxAttendees,
        unlimitedCapacity,
        requiresApproval,
        registrationDeadline: registrationDeadline ? new Date(registrationDeadline) : null,
        isPublic,
        allowWaitlist,
        sendReminders,
        collectAttendeeInfo,
        isFree,
        seoTitle,
        seoDescription,
        tickets: {
          create: tickets.map(ticket => ({
            name: ticket.name,
            description: ticket.description,
            price: ticket.price || 0,
            currency: ticket.currency || 'GBP',
            quantity: ticket.quantity,
            salesStart: ticket.salesStart ? new Date(ticket.salesStart) : null,
            salesEnd: ticket.salesEnd ? new Date(ticket.salesEnd) : null,
            minPerOrder: ticket.minPerOrder || 1,
            maxPerOrder: ticket.maxPerOrder || 10,
          })),
        },
        sessions: {
          create: sessions.map((session, index) => ({
            title: session.title,
            description: session.description,
            startTime: new Date(session.startTime),
            endTime: new Date(session.endTime),
            speakerName: session.speakerName,
            speakerBio: session.speakerBio,
            speakerPhoto: session.speakerPhoto,
            location: session.location,
            order: index,
          })),
        },
      },
      include: {
        tickets: true,
        sessions: true,
      },
    });

    res.json(event);
  } catch (error) {
    console.error('Failed to create event:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// Update event
router.patch('/events/:id', authMiddleware, async (req, res) => {
  try {
    const event = await prisma.event.findUnique({
      where: { id: req.params.id },
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (event.userId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const updated = await prisma.event.update({
      where: { id: req.params.id },
      data: req.body,
      include: {
        tickets: true,
        sessions: true,
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('Failed to update event:', error);
    res.status(500).json({ error: 'Failed to update event' });
  }
});

// Delete event
router.delete('/events/:id', authMiddleware, async (req, res) => {
  try {
    const event = await prisma.event.findUnique({
      where: { id: req.params.id },
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (event.userId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await prisma.event.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Failed to delete event:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

// Publish event
router.post('/events/:id/publish', authMiddleware, async (req, res) => {
  try {
    const event = await prisma.event.findUnique({
      where: { id: req.params.id },
    });

    if (!event || event.userId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const updated = await prisma.event.update({
      where: { id: req.params.id },
      data: {
        isPublished: true,
        publishedAt: new Date(),
      },
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to publish event' });
  }
});

// Duplicate event
router.post('/events/:id/duplicate', authMiddleware, async (req, res) => {
  try {
    const original = await prisma.event.findUnique({
      where: { id: req.params.id },
      include: { tickets: true, sessions: true },
    });

    if (!original || original.userId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const duplicate = await prisma.event.create({
      data: {
        ...original,
        id: undefined,
        slug: generateSlug(original.title + ' Copy'),
        title: original.title + ' (Copy)',
        isPublished: false,
        publishedAt: null,
        tickets: {
          create: original.tickets.map(t => ({
            name: t.name,
            description: t.description,
            price: t.price,
            currency: t.currency,
            quantity: t.quantity,
            salesStart: t.salesStart,
            salesEnd: t.salesEnd,
            minPerOrder: t.minPerOrder,
            maxPerOrder: t.maxPerOrder,
          })),
        },
        sessions: {
          create: original.sessions.map(s => ({
            title: s.title,
            description: s.description,
            startTime: s.startTime,
            endTime: s.endTime,
            speakerName: s.speakerName,
            speakerBio: s.speakerBio,
            speakerPhoto: s.speakerPhoto,
            location: s.location,
            order: s.order,
          })),
        },
      },
    });

    res.json(duplicate);
  } catch (error) {
    console.error('Failed to duplicate event:', error);
    res.status(500).json({ error: 'Failed to duplicate event' });
  }
});

// ============================================
// REGISTRATIONS
// ============================================

// Register for event (public)
router.post('/events/:id/register', async (req, res) => {
  try {
    const { attendeeName, attendeeEmail, attendeePhone, ticketId, customData } = req.body;

    if (!attendeeName || !attendeeEmail) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    const event = await prisma.event.findUnique({
      where: { id: req.params.id },
      include: { tickets: true },
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check capacity
    if (!event.unlimitedCapacity && event.maxAttendees) {
      const currentCount = await prisma.eventRegistration.count({
        where: { eventId: event.id, status: { in: ['confirmed', 'checked_in'] } },
      });

      if (currentCount >= event.maxAttendees) {
        if (event.allowWaitlist) {
          // Add to waitlist
          const registration = await prisma.eventRegistration.create({
            data: {
              eventId: event.id,
              attendeeName,
              attendeeEmail,
              attendeePhone,
              userId: req.user?.id,
              ticketId,
              customData,
              status: 'waitlist',
            },
          });

          return res.json({ ...registration, message: 'Added to waitlist' });
        } else {
          return res.status(400).json({ error: 'Event is sold out' });
        }
      }
    }

    // Find ticket and calculate price
    let ticketName = 'General Admission';
    let orderTotal = 0;

    if (ticketId) {
      const ticket = event.tickets.find(t => t.id === ticketId);
      if (ticket) {
        ticketName = ticket.name;
        orderTotal = ticket.price;

        // Check ticket availability
        if (ticket.quantity && ticket.sold >= ticket.quantity) {
          return res.status(400).json({ error: 'Ticket sold out' });
        }

        // Update ticket sold count
        await prisma.eventTicket.update({
          where: { id: ticketId },
          data: { sold: { increment: 1 } },
        });
      }
    }

    const registration = await prisma.eventRegistration.create({
      data: {
        eventId: event.id,
        attendeeName,
        attendeeEmail,
        attendeePhone,
        userId: req.user?.id,
        ticketId,
        ticketName,
        orderTotal,
        customData,
        status: event.requiresApproval ? 'pending' : 'confirmed',
        paymentStatus: orderTotal > 0 ? 'pending' : 'paid',
      },
    });

    res.json(registration);
  } catch (error) {
    console.error('Failed to register:', error);
    res.status(500).json({ error: 'Failed to register for event' });
  }
});

// Get event registrations (owner only)
router.get('/events/:id/registrations', authMiddleware, async (req, res) => {
  try {
    const event = await prisma.event.findUnique({
      where: { id: req.params.id },
    });

    if (!event || event.userId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const registrations = await prisma.eventRegistration.findMany({
      where: { eventId: req.params.id },
      orderBy: { createdAt: 'desc' },
    });

    res.json(registrations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch registrations' });
  }
});

// Update registration
router.patch('/events/:eventId/registrations/:regId', authMiddleware, async (req, res) => {
  try {
    const event = await prisma.event.findUnique({
      where: { id: req.params.eventId },
    });

    if (!event || event.userId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const updated = await prisma.eventRegistration.update({
      where: { id: req.params.regId },
      data: req.body,
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update registration' });
  }
});

// Check in attendee
router.post('/events/:eventId/registrations/:regId/check-in', authMiddleware, async (req, res) => {
  try {
    const event = await prisma.event.findUnique({
      where: { id: req.params.eventId },
    });

    if (!event || event.userId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const updated = await prisma.eventRegistration.update({
      where: { id: req.params.regId },
      data: {
        checkedIn: true,
        checkedInAt: new Date(),
        status: 'checked_in',
      },
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to check in attendee' });
  }
});

// Cancel registration
router.post('/events/:eventId/registrations/:regId/cancel', authMiddleware, async (req, res) => {
  try {
    const updated = await prisma.eventRegistration.update({
      where: { id: req.params.regId },
      data: { status: 'cancelled' },
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to cancel registration' });
  }
});

// ============================================
// ANALYTICS
// ============================================

router.get('/events/:id/analytics', authMiddleware, async (req, res) => {
  try {
    const event = await prisma.event.findUnique({
      where: { id: req.params.id },
    });

    if (!event || event.userId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const registrations = await prisma.eventRegistration.findMany({
      where: { eventId: req.params.id },
    });

    const totalRegistrations = registrations.length;
    const confirmed = registrations.filter(r => r.status === 'confirmed').length;
    const checkedIn = registrations.filter(r => r.checkedIn).length;
    const waitlist = registrations.filter(r => r.status === 'waitlist').length;
    const cancelled = registrations.filter(r => r.status === 'cancelled').length;

    const totalRevenue = registrations
      .filter(r => r.paymentStatus === 'paid')
      .reduce((sum, r) => sum + r.orderTotal, 0);

    // Registration timeline (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const timeline = {};
    registrations
      .filter(r => r.createdAt >= thirtyDaysAgo)
      .forEach(r => {
        const date = r.createdAt.toISOString().split('T')[0];
        timeline[date] = (timeline[date] || 0) + 1;
      });

    res.json({
      totalRegistrations,
      confirmed,
      checkedIn,
      waitlist,
      cancelled,
      totalRevenue,
      timeline,
      noShowRate: event.endDateTime < new Date() && confirmed > 0
        ? ((confirmed - checkedIn) / confirmed * 100).toFixed(1)
        : null,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

export default router;
