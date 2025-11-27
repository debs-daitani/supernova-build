/**
 * Support Ticket Routes
 * API endpoints for customer support system
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const {
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
  rateTicket
} = require('../services/ticketService');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/support');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max
  },
  fileFilter: (req, file, cb) => {
    // Allow images, PDFs, and documents
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|zip/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only images, PDFs, and documents are allowed'));
    }
  }
});

/**
 * CUSTOMER ROUTES (authenticated users)
 */

// Submit new ticket
router.post('/tickets', /* authenticate, */ upload.array('files', 5), async (req, res) => {
  try {
    const userId = req.user?.id || req.body.userId; // Development fallback
    const { subject, description, category, priority, source } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Process uploaded files
    const attachments = (req.files || []).map(file => ({
      fileName: file.filename,
      originalName: file.originalname,
      fileUrl: `/uploads/support/${file.filename}`,
      fileSize: file.size,
      mimeType: file.mimetype
    }));

    const ticket = await createTicket(
      {
        userId,
        subject,
        description,
        category: category || 'OTHER',
        priority: priority || 'MEDIUM',
        source: source || 'web',
        userAgent: req.get('user-agent'),
        ipAddress: req.ip,
        attachments
      },
      req.prisma
    );

    res.status(201).json({
      success: true,
      message: 'Ticket created successfully',
      ticket
    });
  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).json({ error: error.message || 'Failed to create ticket' });
  }
});

// Get my tickets
router.get('/tickets', /* authenticate, */ async (req, res) => {
  try {
    const userId = req.user?.id || req.query.userId; // Development fallback
    const { status, page, limit, sortBy, sortOrder } = req.query;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const result = await getUserTickets(
      userId,
      { status, page, limit, sortBy, sortOrder },
      req.prisma
    );

    res.json(result);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

// Get specific ticket
router.get('/tickets/:id', /* authenticate, */ async (req, res) => {
  try {
    const userId = req.user?.id || req.query.userId;
    const { id } = req.params;

    const ticket = await getTicketById(id, req.prisma);

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // Verify user owns this ticket (unless they're support staff)
    if (ticket.userId !== userId && !req.user?.isSupport) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(ticket);
  } catch (error) {
    console.error('Error fetching ticket:', error);
    res.status(500).json({ error: 'Failed to fetch ticket' });
  }
});

// Add message to ticket
router.post('/tickets/:id/messages', /* authenticate, */ upload.array('files', 5), async (req, res) => {
  try {
    const userId = req.user?.id || req.body.userId;
    const { id } = req.params;
    const { message } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Verify ticket exists and user has access
    const ticket = await getTicketById(id, req.prisma);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    if (ticket.userId !== userId && !req.user?.isSupport) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Process uploaded files
    const attachments = (req.files || []).map(file => ({
      fileName: file.filename,
      originalName: file.originalname,
      fileUrl: `/uploads/support/${file.filename}`,
      fileSize: file.size,
      mimeType: file.mimetype
    }));

    const ticketMessage = await addTicketMessage(
      id,
      {
        userId,
        message,
        isStaffReply: req.user?.isSupport || false,
        attachments
      },
      req.prisma
    );

    res.status(201).json({
      success: true,
      message: 'Message added',
      ticketMessage
    });
  } catch (error) {
    console.error('Error adding message:', error);
    res.status(500).json({ error: 'Failed to add message' });
  }
});

// Resolve ticket (customer marks as resolved)
router.patch('/tickets/:id/resolve', /* authenticate, */ async (req, res) => {
  try {
    const userId = req.user?.id || req.body.userId;
    const { id } = req.params;

    // Verify ticket exists and user owns it
    const ticket = await getTicketById(id, req.prisma);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    if (ticket.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const resolvedTicket = await resolveTicket(id, req.prisma);

    res.json({
      success: true,
      message: 'Ticket marked as resolved',
      ticket: resolvedTicket
    });
  } catch (error) {
    console.error('Error resolving ticket:', error);
    res.status(500).json({ error: 'Failed to resolve ticket' });
  }
});

// Rate ticket (customer satisfaction)
router.post('/tickets/:id/rate', /* authenticate, */ async (req, res) => {
  try {
    const userId = req.user?.id || req.body.userId;
    const { id } = req.params;
    const { rating, comment } = req.body;

    // Verify ticket exists and user owns it
    const ticket = await getTicketById(id, req.prisma);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    if (ticket.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const ratedTicket = await rateTicket(id, parseInt(rating), comment, req.prisma);

    res.json({
      success: true,
      message: 'Thank you for your feedback!',
      ticket: ratedTicket
    });
  } catch (error) {
    console.error('Error rating ticket:', error);
    res.status(400).json({ error: error.message || 'Failed to rate ticket' });
  }
});

/**
 * ADMIN/SUPPORT ROUTES (require support staff permissions)
 */

// Get all tickets (admin)
router.get('/admin/tickets', /* requireSupport, */ async (req, res) => {
  try {
    const filters = {
      status: req.query.status,
      priority: req.query.priority,
      category: req.query.category,
      assignedToId: req.query.assignedToId,
      tags: req.query.tags ? req.query.tags.split(',') : undefined,
      search: req.query.search,
      page: req.query.page,
      limit: req.query.limit,
      sortBy: req.query.sortBy,
      sortOrder: req.query.sortOrder
    };

    const result = await getAllTickets(filters, req.prisma);

    res.json(result);
  } catch (error) {
    console.error('Error fetching all tickets:', error);
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

// Update ticket (admin)
router.patch('/admin/tickets/:id', /* requireSupport, */ async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedTicket = await updateTicket(id, updates, req.prisma);

    res.json({
      success: true,
      message: 'Ticket updated',
      ticket: updatedTicket
    });
  } catch (error) {
    console.error('Error updating ticket:', error);
    res.status(500).json({ error: 'Failed to update ticket' });
  }
});

// Assign ticket (admin)
router.post('/admin/tickets/:id/assign', /* requireSupport, */ async (req, res) => {
  try {
    const { id } = req.params;
    const { assignedToId } = req.body;

    const assignedTicket = await assignTicket(id, assignedToId, req.prisma);

    res.json({
      success: true,
      message: 'Ticket assigned',
      ticket: assignedTicket
    });
  } catch (error) {
    console.error('Error assigning ticket:', error);
    res.status(500).json({ error: 'Failed to assign ticket' });
  }
});

// Add staff reply
router.post('/admin/tickets/:id/reply', /* requireSupport, */ async (req, res) => {
  try {
    const userId = req.user?.id || req.body.userId;
    const { id } = req.params;
    const { message } = req.body;

    const ticketMessage = await addTicketMessage(
      id,
      {
        userId,
        message,
        isStaffReply: true
      },
      req.prisma
    );

    res.status(201).json({
      success: true,
      message: 'Reply sent',
      ticketMessage
    });
  } catch (error) {
    console.error('Error sending reply:', error);
    res.status(500).json({ error: 'Failed to send reply' });
  }
});

// Add internal note
router.post('/admin/tickets/:id/notes', /* requireSupport, */ async (req, res) => {
  try {
    const userId = req.user?.id || req.body.userId;
    const { id } = req.params;
    const { note } = req.body;

    const internalNote = await addInternalNote(id, userId, note, req.prisma);

    res.status(201).json({
      success: true,
      message: 'Note added',
      note: internalNote
    });
  } catch (error) {
    console.error('Error adding note:', error);
    res.status(500).json({ error: 'Failed to add note' });
  }
});

// Close ticket (admin)
router.post('/admin/tickets/:id/close', /* requireSupport, */ async (req, res) => {
  try {
    const { id } = req.params;

    const closedTicket = await closeTicket(id, req.prisma);

    res.json({
      success: true,
      message: 'Ticket closed',
      ticket: closedTicket
    });
  } catch (error) {
    console.error('Error closing ticket:', error);
    res.status(500).json({ error: 'Failed to close ticket' });
  }
});

// Get support statistics
router.get('/admin/stats', /* requireSupport, */ async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const dateRange = startDate && endDate
      ? { startDate: new Date(startDate), endDate: new Date(endDate) }
      : undefined;

    const stats = await getSupportStats(dateRange, req.prisma);

    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Get canned responses
router.get('/admin/canned-responses', /* requireSupport, */ async (req, res) => {
  try {
    const { category } = req.query;

    const responses = await getCannedResponses(category, req.prisma);

    res.json({ responses });
  } catch (error) {
    console.error('Error fetching canned responses:', error);
    res.status(500).json({ error: 'Failed to fetch canned responses' });
  }
});

// Create canned response
router.post('/admin/canned-responses', /* requireSupport, */ async (req, res) => {
  try {
    const userId = req.user?.id || req.body.createdBy;
    const { title, content, category } = req.body;

    const response = await createCannedResponse(
      { title, content, category, createdBy: userId },
      req.prisma
    );

    res.status(201).json({
      success: true,
      message: 'Canned response created',
      response
    });
  } catch (error) {
    console.error('Error creating canned response:', error);
    res.status(500).json({ error: 'Failed to create canned response' });
  }
});

// Use canned response (increment usage count)
router.post('/admin/canned-responses/:id/use', /* requireSupport, */ async (req, res) => {
  try {
    const { id } = req.params;

    const response = await useCannedResponse(id, req.prisma);

    res.json({
      success: true,
      response
    });
  } catch (error) {
    console.error('Error using canned response:', error);
    res.status(500).json({ error: 'Failed to use canned response' });
  }
});

export default router;
