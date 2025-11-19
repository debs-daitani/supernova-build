/**
 * Support Ticket Service
 * Business logic for support ticket management
 */

/**
 * Generate unique ticket number
 * Format: TICKET-001234
 */
async function generateTicketNumber(prisma) {
  // Get the latest ticket number
  const lastTicket = await prisma.ticket.findFirst({
    orderBy: { ticketNumber: 'desc' },
    select: { ticketNumber: true }
  });

  let nextNumber = 1;

  if (lastTicket) {
    // Extract number from "TICKET-001234"
    const match = lastTicket.ticketNumber.match(/TICKET-(\d+)/);
    if (match) {
      nextNumber = parseInt(match[1]) + 1;
    }
  }

  // Pad with zeros (6 digits)
  const paddedNumber = nextNumber.toString().padStart(6, '0');
  return `TICKET-${paddedNumber}`;
}

/**
 * Create new support ticket
 * @param {object} ticketData - Ticket information
 * @param {object} prisma - Prisma client
 * @returns {object} Created ticket
 */
async function createTicket(ticketData, prisma) {
  const {
    userId,
    subject,
    description,
    category = 'OTHER',
    priority = 'MEDIUM',
    source = 'web',
    userAgent,
    ipAddress,
    attachments = []
  } = ticketData;

  // Validate required fields
  if (!userId || !subject || !description) {
    throw new Error('Missing required fields: userId, subject, description');
  }

  // Generate ticket number
  const ticketNumber = await generateTicketNumber(prisma);

  // Create ticket
  const ticket = await prisma.ticket.create({
    data: {
      ticketNumber,
      userId,
      subject,
      description,
      category,
      priority,
      status: 'OPEN',
      source,
      userAgent,
      ipAddress,
      tags: []
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true
        }
      }
    }
  });

  // Create attachments if any
  if (attachments.length > 0) {
    await prisma.ticketAttachment.createMany({
      data: attachments.map(att => ({
        ticketId: ticket.id,
        fileName: att.fileName,
        originalName: att.originalName,
        fileUrl: att.fileUrl,
        fileSize: att.fileSize,
        mimeType: att.mimeType,
        uploadedBy: userId
      }))
    });
  }

  return ticket;
}

/**
 * Get ticket by ID with full details
 */
async function getTicketById(ticketId, prisma) {
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          membershipTier: true
        }
      },
      assignedTo: {
        select: {
          id: true,
          email: true,
          name: true
        }
      },
      messages: {
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true
            }
          },
          attachments: true
        },
        orderBy: { createdAt: 'asc' }
      },
      attachments: true,
      internalNotes: {
        include: {
          user: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  return ticket;
}

/**
 * Get user's tickets
 */
async function getUserTickets(userId, options = {}, prisma) {
  const {
    status,
    page = 1,
    limit = 20,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = options;

  const where = {
    userId,
    ...(status && { status })
  };

  const [tickets, total] = await Promise.all([
    prisma.ticket.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        assignedTo: {
          select: { id: true, name: true }
        },
        _count: {
          select: { messages: true }
        }
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit
    }),
    prisma.ticket.count({ where })
  ]);

  return {
    tickets,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
}

/**
 * Get all tickets (for admin/support)
 */
async function getAllTickets(filters = {}, prisma) {
  const {
    status,
    priority,
    category,
    assignedToId,
    tags,
    search,
    page = 1,
    limit = 50,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = filters;

  const where = {
    ...(status && { status }),
    ...(priority && { priority }),
    ...(category && { category }),
    ...(assignedToId && { assignedToId }),
    ...(tags && tags.length > 0 && { tags: { hasSome: tags } }),
    ...(search && {
      OR: [
        { subject: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { ticketNumber: { contains: search, mode: 'insensitive' } }
      ]
    })
  };

  const [tickets, total] = await Promise.all([
    prisma.ticket.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        assignedTo: {
          select: { id: true, name: true }
        },
        _count: {
          select: { messages: true }
        }
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit
    }),
    prisma.ticket.count({ where })
  ]);

  return {
    tickets,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
}

/**
 * Add message to ticket
 */
async function addTicketMessage(ticketId, messageData, prisma) {
  const {
    userId,
    message,
    isStaffReply = false,
    isInternal = false,
    attachments = []
  } = messageData;

  // Create message
  const ticketMessage = await prisma.ticketMessage.create({
    data: {
      ticketId,
      userId,
      message,
      isStaffReply,
      isInternal
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  });

  // Add attachments if any
  if (attachments.length > 0) {
    await prisma.messageAttachment.createMany({
      data: attachments.map(att => ({
        messageId: ticketMessage.id,
        fileName: att.fileName,
        originalName: att.originalName,
        fileUrl: att.fileUrl,
        fileSize: att.fileSize,
        mimeType: att.mimeType,
        uploadedBy: userId
      }))
    });
  }

  // Update ticket's lastActivityAt
  await prisma.ticket.update({
    where: { id: ticketId },
    data: { lastActivityAt: new Date() }
  });

  // If staff first reply, record first response time
  if (isStaffReply) {
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      select: { firstResponseAt: true, createdAt: true }
    });

    if (!ticket.firstResponseAt) {
      const firstResponseTime = Math.floor(
        (new Date() - new Date(ticket.createdAt)) / 60000
      ); // Minutes

      await prisma.ticket.update({
        where: { id: ticketId },
        data: {
          firstResponseAt: new Date(),
          firstResponseTime
        }
      });
    }
  }

  return ticketMessage;
}

/**
 * Update ticket
 */
async function updateTicket(ticketId, updates, prisma) {
  const allowedUpdates = {
    status: updates.status,
    priority: updates.priority,
    category: updates.category,
    assignedToId: updates.assignedToId,
    tags: updates.tags
  };

  // Remove undefined values
  Object.keys(allowedUpdates).forEach(key => {
    if (allowedUpdates[key] === undefined) {
      delete allowedUpdates[key];
    }
  });

  // If assigning, set assignedAt
  if (updates.assignedToId) {
    allowedUpdates.assignedAt = new Date();
  }

  // If resolving, set resolvedAt and calculate resolution time
  if (updates.status === 'RESOLVED') {
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      select: { resolvedAt: true, createdAt: true }
    });

    if (!ticket.resolvedAt) {
      allowedUpdates.resolvedAt = new Date();
      allowedUpdates.resolutionTime = Math.floor(
        (new Date() - new Date(ticket.createdAt)) / 60000
      ); // Minutes
    }
  }

  // If closing, set closedAt
  if (updates.status === 'CLOSED') {
    allowedUpdates.closedAt = new Date();
  }

  const updatedTicket = await prisma.ticket.update({
    where: { id: ticketId },
    data: {
      ...allowedUpdates,
      lastActivityAt: new Date()
    },
    include: {
      user: {
        select: { id: true, name: true, email: true }
      },
      assignedTo: {
        select: { id: true, name: true, email: true }
      }
    }
  });

  return updatedTicket;
}

/**
 * Assign ticket to staff member
 */
async function assignTicket(ticketId, assignedToId, prisma) {
  return updateTicket(ticketId, { assignedToId }, prisma);
}

/**
 * Resolve ticket
 */
async function resolveTicket(ticketId, prisma) {
  return updateTicket(ticketId, { status: 'RESOLVED' }, prisma);
}

/**
 * Close ticket
 */
async function closeTicket(ticketId, prisma) {
  return updateTicket(ticketId, { status: 'CLOSED' }, prisma);
}

/**
 * Add internal note (staff only)
 */
async function addInternalNote(ticketId, userId, note, prisma) {
  const internalNote = await prisma.internalNote.create({
    data: {
      ticketId,
      userId,
      note
    },
    include: {
      user: {
        select: { id: true, name: true }
      }
    }
  });

  // Update ticket's lastActivityAt
  await prisma.ticket.update({
    where: { id: ticketId },
    data: { lastActivityAt: new Date() }
  });

  return internalNote;
}

/**
 * Get support statistics
 */
async function getSupportStats(dateRange, prisma) {
  const { startDate, endDate } = dateRange || {
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    endDate: new Date()
  };

  // Get ticket counts
  const [
    totalTickets,
    openTickets,
    pendingTickets,
    resolvedTickets,
    closedTickets,
    urgentTickets
  ] = await Promise.all([
    prisma.ticket.count({
      where: {
        createdAt: { gte: startDate, lte: endDate }
      }
    }),
    prisma.ticket.count({
      where: { status: 'OPEN' }
    }),
    prisma.ticket.count({
      where: { status: 'PENDING' }
    }),
    prisma.ticket.count({
      where: {
        status: 'RESOLVED',
        resolvedAt: { gte: startDate, lte: endDate }
      }
    }),
    prisma.ticket.count({
      where: {
        status: 'CLOSED',
        closedAt: { gte: startDate, lte: endDate }
      }
    }),
    prisma.ticket.count({
      where: {
        priority: 'URGENT',
        status: { in: ['OPEN', 'PENDING', 'IN_PROGRESS'] }
      }
    })
  ]);

  // Calculate average response times
  const tickets = await prisma.ticket.findMany({
    where: {
      createdAt: { gte: startDate, lte: endDate },
      firstResponseTime: { not: null }
    },
    select: {
      firstResponseTime: true,
      resolutionTime: true
    }
  });

  const avgFirstResponse = tickets.length > 0
    ? tickets.reduce((sum, t) => sum + (t.firstResponseTime || 0), 0) / tickets.length
    : 0;

  const resolvedWithTime = tickets.filter(t => t.resolutionTime !== null);
  const avgResolutionTime = resolvedWithTime.length > 0
    ? resolvedWithTime.reduce((sum, t) => sum + (t.resolutionTime || 0), 0) / resolvedWithTime.length
    : 0;

  // Get satisfaction ratings
  const ratingsData = await prisma.ticket.aggregate({
    where: {
      satisfactionRating: { not: null },
      resolvedAt: { gte: startDate, lte: endDate }
    },
    _avg: {
      satisfactionRating: true
    },
    _count: {
      satisfactionRating: true
    }
  });

  return {
    counts: {
      total: totalTickets,
      open: openTickets,
      pending: pendingTickets,
      resolved: resolvedTickets,
      closed: closedTickets,
      urgent: urgentTickets
    },
    avgFirstResponseTime: Math.round(avgFirstResponse), // Minutes
    avgResolutionTime: Math.round(avgResolutionTime), // Minutes
    satisfaction: {
      average: ratingsData._avg.satisfactionRating || 0,
      totalRatings: ratingsData._count.satisfactionRating
    }
  };
}

/**
 * Get canned responses
 */
async function getCannedResponses(category, prisma) {
  const where = {
    isActive: true,
    ...(category && { category })
  };

  return prisma.cannedResponse.findMany({
    where,
    include: {
      creator: {
        select: { id: true, name: true }
      }
    },
    orderBy: { usageCount: 'desc' }
  });
}

/**
 * Create canned response
 */
async function createCannedResponse(data, prisma) {
  const { title, content, category, createdBy } = data;

  return prisma.cannedResponse.create({
    data: {
      title,
      content,
      category,
      createdBy
    }
  });
}

/**
 * Use canned response (increment usage count)
 */
async function useCannedResponse(cannedResponseId, prisma) {
  return prisma.cannedResponse.update({
    where: { id: cannedResponseId },
    data: {
      usageCount: { increment: 1 },
      lastUsedAt: new Date()
    }
  });
}

/**
 * Rate ticket (customer satisfaction)
 */
async function rateTicket(ticketId, rating, comment, prisma) {
  if (rating < 1 || rating > 5) {
    throw new Error('Rating must be between 1 and 5');
  }

  return prisma.ticket.update({
    where: { id: ticketId },
    data: {
      satisfactionRating: rating,
      satisfactionComment: comment || null
    }
  });
}

/**
 * Auto-close old resolved tickets
 * Call this from a cron job
 */
async function autoCloseOldTickets(daysOld = 7, prisma) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  const ticketsToClose = await prisma.ticket.findMany({
    where: {
      status: 'RESOLVED',
      resolvedAt: { lte: cutoffDate }
    }
  });

  for (const ticket of ticketsToClose) {
    await closeTicket(ticket.id, prisma);
  }

  return ticketsToClose.length;
}

module.exports = {
  generateTicketNumber,
  createTicket,
  getTicketById,
  getUserTickets,
  getAllTickets,
  addTicketMessage,
  updateTicket,
  assignTicket,
  resolveTicket,
  closeTicket,
  addInternalNote,
  getSupportStats,
  getCannedResponses,
  createCannedResponse,
  useCannedResponse,
  rateTicket,
  autoCloseOldTickets
};
