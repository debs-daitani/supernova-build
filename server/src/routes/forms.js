import express from 'express';
import crypto from 'crypto';

const router = express.Router();

// Mock auth middleware (replace with real authentication)
const authenticateUser = (req, res, next) => {
  // Mock user - in production, get from JWT token or session
  req.user = { id: 'user123', email: 'user@example.com', name: 'Test User' };
  next();
};

// Optional auth - allows both authenticated and unauthenticated requests
const optionalAuth = (req, res, next) => {
  // In production, check for token but don't require it
  req.user = { id: 'user123', email: 'user@example.com', name: 'Test User' };
  next();
};

// ============================================
// FORMS - CRUD
// ============================================

/**
 * GET /api/forms
 * List user's forms with optional filters
 */
router.get('/', authenticateUser, async (req, res) => {
  try {
    const { folderId, published } = req.query;
    const userId = req.user.id;

    // Mock data - Replace with Prisma query
    const mockForms = [
      {
        id: 'form1',
        userId,
        title: 'Customer Satisfaction Survey',
        description: 'Help us improve our service',
        questions: [
          {
            id: 'q1',
            type: 'linear-scale',
            question: 'How satisfied are you with our service?',
            required: true,
            options: { min: 1, max: 5, minLabel: 'Very Unsatisfied', maxLabel: 'Very Satisfied' },
          },
          {
            id: 'q2',
            type: 'paragraph',
            question: 'What can we improve?',
            required: false,
          },
        ],
        isPublished: true,
        acceptingResponses: true,
        requiresLogin: false,
        allowMultiple: true,
        shuffleQuestions: false,
        theme: { primaryColor: '#4F46E5', backgroundColor: '#FFFFFF' },
        confirmationMessage: 'Thank you for your feedback!',
        redirectUrl: null,
        emailNotification: true,
        notificationEmail: 'admin@example.com',
        folderId: null,
        shareLink: 'abc123',
        createdAt: new Date('2025-01-10'),
        updatedAt: new Date('2025-01-15'),
        _count: { responses: 42 },
      },
    ];

    // Apply filters
    let forms = mockForms;
    if (folderId) {
      forms = forms.filter(f => f.folderId === folderId);
    }
    if (published !== undefined) {
      forms = forms.filter(f => f.isPublished === (published === 'true'));
    }

    /*
    // Production Prisma query:
    const where = { userId };
    if (folderId) where.folderId = folderId;
    if (published !== undefined) where.isPublished = published === 'true';

    const forms = await prisma.form.findMany({
      where,
      include: {
        folder: true,
        _count: { select: { responses: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
    */

    res.json(forms);
  } catch (error) {
    console.error('Error fetching forms:', error);
    res.status(500).json({ error: 'Failed to fetch forms' });
  }
});

/**
 * GET /api/forms/:id
 * Get a specific form
 */
router.get('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Mock data
    const mockForm = {
      id,
      userId,
      title: 'Customer Satisfaction Survey',
      description: 'Help us improve our service',
      questions: [
        {
          id: 'q1',
          type: 'linear-scale',
          question: 'How satisfied are you with our service?',
          required: true,
          options: { min: 1, max: 5, minLabel: 'Very Unsatisfied', maxLabel: 'Very Satisfied' },
        },
      ],
      isPublished: true,
      acceptingResponses: true,
      requiresLogin: false,
      allowMultiple: true,
      shuffleQuestions: false,
      theme: null,
      confirmationMessage: 'Thank you!',
      redirectUrl: null,
      emailNotification: false,
      notificationEmail: null,
      folderId: null,
      shareLink: 'abc123',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    /*
    // Production Prisma query:
    const form = await prisma.form.findUnique({
      where: { id },
      include: {
        folder: true,
        _count: { select: { responses: true } },
      },
    });

    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }

    if (form.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    */

    res.json(mockForm);
  } catch (error) {
    console.error('Error fetching form:', error);
    res.status(500).json({ error: 'Failed to fetch form' });
  }
});

/**
 * POST /api/forms
 * Create a new form
 */
router.post('/', authenticateUser, async (req, res) => {
  try {
    const { title, description, folderId, templateId } = req.body;
    const userId = req.user.id;

    let questions = [
      {
        id: crypto.randomBytes(8).toString('hex'),
        type: 'short-answer',
        question: 'Untitled Question',
        required: false,
        options: {},
      },
    ];

    // If creating from template, fetch template data
    if (templateId) {
      /*
      const template = await prisma.formTemplate.findUnique({
        where: { id: templateId },
      });
      if (template) {
        questions = template.questions;
        await prisma.formTemplate.update({
          where: { id: templateId },
          data: { usageCount: { increment: 1 } },
        });
      }
      */
    }

    // Mock response
    const mockForm = {
      id: crypto.randomBytes(8).toString('hex'),
      userId,
      title: title || 'Untitled Form',
      description: description || null,
      questions,
      isPublished: false,
      acceptingResponses: true,
      requiresLogin: false,
      allowMultiple: true,
      shuffleQuestions: false,
      theme: null,
      confirmationMessage: 'Thank you for your response!',
      redirectUrl: null,
      emailNotification: false,
      notificationEmail: null,
      folderId: folderId || null,
      shareLink: crypto.randomBytes(16).toString('hex'),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    /*
    // Production Prisma query:
    const form = await prisma.form.create({
      data: {
        userId,
        title: title || 'Untitled Form',
        description,
        questions,
        shareLink: crypto.randomBytes(16).toString('hex'),
        folderId,
      },
      include: {
        folder: true,
      },
    });
    */

    res.status(201).json(mockForm);
  } catch (error) {
    console.error('Error creating form:', error);
    res.status(500).json({ error: 'Failed to create form' });
  }
});

/**
 * PATCH /api/forms/:id
 * Update a form
 */
router.patch('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updateData = req.body;

    // Mock response
    const mockForm = {
      id,
      userId,
      ...updateData,
      updatedAt: new Date(),
    };

    /*
    // Production Prisma query:
    const form = await prisma.form.findUnique({ where: { id } });

    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }

    if (form.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updated = await prisma.form.update({
      where: { id },
      data: updateData,
      include: {
        folder: true,
      },
    });
    */

    res.json(mockForm);
  } catch (error) {
    console.error('Error updating form:', error);
    res.status(500).json({ error: 'Failed to update form' });
  }
});

/**
 * DELETE /api/forms/:id
 * Delete a form
 */
router.delete('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    /*
    // Production Prisma query:
    const form = await prisma.form.findUnique({ where: { id } });

    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }

    if (form.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await prisma.form.delete({ where: { id } });
    */

    res.json({ message: 'Form deleted successfully' });
  } catch (error) {
    console.error('Error deleting form:', error);
    res.status(500).json({ error: 'Failed to delete form' });
  }
});

/**
 * POST /api/forms/:id/copy
 * Duplicate a form
 */
router.post('/:id/copy', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Mock response
    const mockForm = {
      id: crypto.randomBytes(8).toString('hex'),
      userId,
      title: 'Copy of Form',
      description: 'Copied form',
      questions: [],
      isPublished: false,
      shareLink: crypto.randomBytes(16).toString('hex'),
      createdAt: new Date(),
    };

    /*
    // Production Prisma query:
    const original = await prisma.form.findUnique({ where: { id } });

    if (!original || original.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const copy = await prisma.form.create({
      data: {
        userId,
        title: `Copy of ${original.title}`,
        description: original.description,
        questions: original.questions,
        theme: original.theme,
        confirmationMessage: original.confirmationMessage,
        requiresLogin: original.requiresLogin,
        allowMultiple: original.allowMultiple,
        shuffleQuestions: original.shuffleQuestions,
        shareLink: crypto.randomBytes(16).toString('hex'),
        isPublished: false,
        folderId: original.folderId,
      },
    });
    */

    res.status(201).json(mockForm);
  } catch (error) {
    console.error('Error copying form:', error);
    res.status(500).json({ error: 'Failed to copy form' });
  }
});

// ============================================
// FOLDERS
// ============================================

/**
 * GET /api/forms/folders/list
 * List user's form folders
 */
router.get('/folders/list', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;

    // Mock data
    const mockFolders = [
      {
        id: 'folder1',
        userId,
        name: 'Customer Surveys',
        color: '#8B5CF6',
        parentId: null,
        createdAt: new Date(),
        _count: { forms: 5, subfolders: 0 },
      },
    ];

    /*
    // Production Prisma query:
    const folders = await prisma.formFolder.findMany({
      where: { userId },
      include: {
        _count: { select: { forms: true, subfolders: true } },
      },
      orderBy: { name: 'asc' },
    });
    */

    res.json(mockFolders);
  } catch (error) {
    console.error('Error fetching folders:', error);
    res.status(500).json({ error: 'Failed to fetch folders' });
  }
});

/**
 * POST /api/forms/folders/create
 * Create a new folder
 */
router.post('/folders/create', authenticateUser, async (req, res) => {
  try {
    const { name, color, parentId } = req.body;
    const userId = req.user.id;

    if (!name) {
      return res.status(400).json({ error: 'Folder name is required' });
    }

    // Mock response
    const mockFolder = {
      id: crypto.randomBytes(8).toString('hex'),
      userId,
      name,
      color: color || null,
      parentId: parentId || null,
      createdAt: new Date(),
    };

    /*
    // Production Prisma query:
    const folder = await prisma.formFolder.create({
      data: { userId, name, color, parentId },
    });
    */

    res.status(201).json(mockFolder);
  } catch (error) {
    console.error('Error creating folder:', error);
    res.status(500).json({ error: 'Failed to create folder' });
  }
});

/**
 * PATCH /api/forms/folders/:id
 * Update a folder
 */
router.patch('/folders/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, color, parentId } = req.body;
    const userId = req.user.id;

    // Mock response
    const mockFolder = {
      id,
      userId,
      name: name || 'Folder',
      color: color || null,
      parentId: parentId || null,
    };

    /*
    // Production Prisma query:
    const folder = await prisma.formFolder.findUnique({ where: { id } });

    if (!folder || folder.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updated = await prisma.formFolder.update({
      where: { id },
      data: { ...(name && { name }), ...(color !== undefined && { color }), ...(parentId !== undefined && { parentId }) },
    });
    */

    res.json(mockFolder);
  } catch (error) {
    console.error('Error updating folder:', error);
    res.status(500).json({ error: 'Failed to update folder' });
  }
});

/**
 * DELETE /api/forms/folders/:id
 * Delete a folder
 */
router.delete('/folders/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    /*
    // Production Prisma query:
    const folder = await prisma.formFolder.findUnique({ where: { id } });

    if (!folder || folder.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await prisma.formFolder.delete({ where: { id } });
    */

    res.json({ message: 'Folder deleted successfully' });
  } catch (error) {
    console.error('Error deleting folder:', error);
    res.status(500).json({ error: 'Failed to delete folder' });
  }
});

// ============================================
// FORM SUBMISSION (PUBLIC)
// ============================================

/**
 * GET /api/forms/public/:shareLink
 * Get form by share link (public access)
 */
router.get('/public/:shareLink', optionalAuth, async (req, res) => {
  try {
    const { shareLink } = req.params;

    // Mock data
    const mockForm = {
      id: 'form1',
      title: 'Customer Satisfaction Survey',
      description: 'Help us improve our service',
      questions: [
        {
          id: 'q1',
          type: 'linear-scale',
          question: 'How satisfied are you?',
          required: true,
          options: { min: 1, max: 5, minLabel: 'Very Unsatisfied', maxLabel: 'Very Satisfied' },
        },
      ],
      theme: { primaryColor: '#4F46E5' },
      isPublished: true,
      acceptingResponses: true,
      requiresLogin: false,
      shuffleQuestions: false,
    };

    /*
    // Production Prisma query:
    const form = await prisma.form.findUnique({
      where: { shareLink },
      select: {
        id: true,
        title: true,
        description: true,
        questions: true,
        theme: true,
        isPublished: true,
        acceptingResponses: true,
        requiresLogin: true,
        shuffleQuestions: true,
        confirmationMessage: true,
        redirectUrl: true,
      },
    });

    if (!form || !form.isPublished) {
      return res.status(404).json({ error: 'Form not found' });
    }

    if (!form.acceptingResponses) {
      return res.status(403).json({ error: 'Form is not accepting responses' });
    }

    if (form.requiresLogin && !req.user) {
      return res.status(401).json({ error: 'Login required' });
    }
    */

    res.json(mockForm);
  } catch (error) {
    console.error('Error fetching form:', error);
    res.status(500).json({ error: 'Failed to fetch form' });
  }
});

/**
 * POST /api/forms/:id/submit
 * Submit a form response (public endpoint)
 */
router.post('/:id/submit', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { answers, email, startTime } = req.body;

    // Calculate completion time
    const completionTime = startTime ? Math.floor((Date.now() - startTime) / 1000) : null;

    // Get IP and user agent
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('user-agent');

    // Mock response
    const mockResponse = {
      id: crypto.randomBytes(8).toString('hex'),
      formId: id,
      userId: req.user?.id || null,
      email: email || null,
      answers,
      ipAddress,
      userAgent,
      completionTime,
      submittedAt: new Date(),
    };

    /*
    // Production implementation:
    // 1. Fetch form
    const form = await prisma.form.findUnique({ where: { id } });

    if (!form || !form.isPublished || !form.acceptingResponses) {
      return res.status(403).json({ error: 'Form not accepting responses' });
    }

    // 2. Validate required fields
    const requiredQuestions = form.questions.filter(q => q.required);
    for (const q of requiredQuestions) {
      if (!answers[q.id]) {
        return res.status(400).json({ error: `Question "${q.question}" is required` });
      }
    }

    // 3. Check if multiple responses allowed
    if (!form.allowMultiple && req.user) {
      const existing = await prisma.formResponse.findFirst({
        where: { formId: id, userId: req.user.id },
      });
      if (existing) {
        return res.status(403).json({ error: 'You have already submitted this form' });
      }
    }

    // 4. Save response
    const response = await prisma.formResponse.create({
      data: {
        formId: id,
        userId: req.user?.id,
        email,
        answers,
        ipAddress,
        userAgent,
        completionTime,
      },
    });

    // 5. Send email notification if enabled
    if (form.emailNotification && form.notificationEmail) {
      // TODO: Send email notification
      // await sendEmail({
      //   to: form.notificationEmail,
      //   subject: `New response to ${form.title}`,
      //   body: `You have a new response to your form.`,
      // });
    }

    // 6. Send confirmation email to respondent if they provided email
    if (email) {
      // TODO: Send confirmation email
    }

    // 7. Trigger integrations (CRM, Sheets, webhook)
    // TODO: Add integration logic
    */

    res.status(201).json({
      message: 'Response submitted successfully',
      response: mockResponse,
      confirmationMessage: 'Thank you for your response!',
      redirectUrl: null,
    });
  } catch (error) {
    console.error('Error submitting response:', error);
    res.status(500).json({ error: 'Failed to submit response' });
  }
});

// ============================================
// RESPONSES
// ============================================

/**
 * GET /api/forms/:id/responses
 * Get all responses for a form
 */
router.get('/:id/responses', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Mock data
    const mockResponses = [
      {
        id: 'resp1',
        formId: id,
        userId: null,
        email: 'respondent@example.com',
        answers: {
          q1: '4',
          q2: 'Great service, but delivery was slow.',
        },
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        completionTime: 120,
        submittedAt: new Date('2025-01-15T10:30:00'),
      },
      {
        id: 'resp2',
        formId: id,
        userId: null,
        email: 'john@example.com',
        answers: {
          q1: '5',
          q2: 'Excellent!',
        },
        ipAddress: '192.168.1.2',
        userAgent: 'Mozilla/5.0',
        completionTime: 90,
        submittedAt: new Date('2025-01-15T11:00:00'),
      },
    ];

    /*
    // Production Prisma query:
    const form = await prisma.form.findUnique({ where: { id } });

    if (!form || form.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const responses = await prisma.formResponse.findMany({
      where: { formId: id },
      orderBy: { submittedAt: 'desc' },
    });
    */

    res.json(mockResponses);
  } catch (error) {
    console.error('Error fetching responses:', error);
    res.status(500).json({ error: 'Failed to fetch responses' });
  }
});

/**
 * GET /api/forms/:id/responses/:responseId
 * Get a specific response
 */
router.get('/:id/responses/:responseId', authenticateUser, async (req, res) => {
  try {
    const { id, responseId } = req.params;
    const userId = req.user.id;

    // Mock data
    const mockResponse = {
      id: responseId,
      formId: id,
      userId: null,
      email: 'respondent@example.com',
      answers: {
        q1: '4',
        q2: 'Great service!',
      },
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0',
      completionTime: 120,
      submittedAt: new Date(),
    };

    /*
    // Production Prisma query:
    const form = await prisma.form.findUnique({ where: { id } });

    if (!form || form.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const response = await prisma.formResponse.findUnique({
      where: { id: responseId },
    });

    if (!response || response.formId !== id) {
      return res.status(404).json({ error: 'Response not found' });
    }
    */

    res.json(mockResponse);
  } catch (error) {
    console.error('Error fetching response:', error);
    res.status(500).json({ error: 'Failed to fetch response' });
  }
});

/**
 * DELETE /api/forms/:id/responses/:responseId
 * Delete a response
 */
router.delete('/:id/responses/:responseId', authenticateUser, async (req, res) => {
  try {
    const { id, responseId } = req.params;
    const userId = req.user.id;

    /*
    // Production Prisma query:
    const form = await prisma.form.findUnique({ where: { id } });

    if (!form || form.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const response = await prisma.formResponse.findUnique({
      where: { id: responseId },
    });

    if (!response || response.formId !== id) {
      return res.status(404).json({ error: 'Response not found' });
    }

    await prisma.formResponse.delete({ where: { id: responseId } });
    */

    res.json({ message: 'Response deleted successfully' });
  } catch (error) {
    console.error('Error deleting response:', error);
    res.status(500).json({ error: 'Failed to delete response' });
  }
});

// ============================================
// ANALYTICS
// ============================================

/**
 * GET /api/forms/:id/analytics
 * Get form analytics
 */
router.get('/:id/analytics', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Mock analytics
    const mockAnalytics = {
      totalResponses: 42,
      averageCompletionTime: 105, // seconds
      responseRate: {
        labels: ['Jan 10', 'Jan 11', 'Jan 12', 'Jan 13', 'Jan 14', 'Jan 15'],
        data: [5, 8, 12, 7, 6, 4],
      },
      questionAnalytics: [
        {
          questionId: 'q1',
          question: 'How satisfied are you?',
          type: 'linear-scale',
          responses: 42,
          skipped: 0,
          data: {
            '1': 2,
            '2': 3,
            '3': 8,
            '4': 15,
            '5': 14,
          },
          average: 4.1,
        },
        {
          questionId: 'q2',
          question: 'What can we improve?',
          type: 'paragraph',
          responses: 38,
          skipped: 4,
          wordCloud: {
            'delivery': 15,
            'customer service': 12,
            'price': 8,
            'quality': 10,
          },
        },
      ],
      dropOffRate: {
        'q1': 0,
        'q2': 10, // 10% dropped off at question 2
      },
      sources: {
        'email': 20,
        'link': 15,
        'embed': 5,
        'qr': 2,
      },
    };

    /*
    // Production implementation:
    const form = await prisma.form.findUnique({ where: { id } });

    if (!form || form.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const responses = await prisma.formResponse.findMany({
      where: { formId: id },
    });

    // Calculate analytics from responses
    // - Total responses
    // - Average completion time
    // - Response rate over time (group by date)
    // - Question-level analytics (counts, averages, word clouds)
    // - Drop-off rate (questions with most skips)
    // - Response sources (if tracked)
    */

    res.json(mockAnalytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// ============================================
// EXPORT
// ============================================

/**
 * GET /api/forms/:id/responses/export/csv
 * Export responses as CSV
 */
router.get('/:id/responses/export/csv', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    /*
    // Production implementation:
    const form = await prisma.form.findUnique({ where: { id } });

    if (!form || form.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const responses = await prisma.formResponse.findMany({
      where: { formId: id },
      orderBy: { submittedAt: 'asc' },
    });

    // Generate CSV
    // Header row: Timestamp, Email, Question 1, Question 2, ...
    // Data rows: response data
    const csv = generateCSV(form, responses);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="form-responses-${id}.csv"`);
    res.send(csv);
    */

    // Mock response
    res.json({
      url: `https://example.com/exports/form-${id}-responses.csv`,
      filename: `form-responses-${id}.csv`,
      format: 'csv',
    });
  } catch (error) {
    console.error('Error exporting CSV:', error);
    res.status(500).json({ error: 'Failed to export CSV' });
  }
});

/**
 * GET /api/forms/:id/responses/export/xlsx
 * Export responses as Excel
 */
router.get('/:id/responses/export/xlsx', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    /*
    // Production implementation:
    // Similar to CSV but use xlsx library
    // const xlsx = require('xlsx');
    // Create workbook with responses
    // res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    // res.send(buffer);
    */

    // Mock response
    res.json({
      url: `https://example.com/exports/form-${id}-responses.xlsx`,
      filename: `form-responses-${id}.xlsx`,
      format: 'xlsx',
    });
  } catch (error) {
    console.error('Error exporting Excel:', error);
    res.status(500).json({ error: 'Failed to export Excel' });
  }
});

/**
 * GET /api/forms/:id/responses/export/pdf
 * Export responses summary as PDF
 */
router.get('/:id/responses/export/pdf', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    /*
    // Production implementation:
    // Use Puppeteer or jsPDF to generate PDF report
    // Include:
    // - Form title
    // - Summary statistics
    // - Charts for multiple choice questions
    // - Individual responses
    */

    // Mock response
    res.json({
      url: `https://example.com/exports/form-${id}-summary.pdf`,
      filename: `form-summary-${id}.pdf`,
      format: 'pdf',
    });
  } catch (error) {
    console.error('Error exporting PDF:', error);
    res.status(500).json({ error: 'Failed to export PDF' });
  }
});

// ============================================
// TEMPLATES
// ============================================

/**
 * GET /api/forms/templates/list
 * Get all form templates
 */
router.get('/templates/list', authenticateUser, async (req, res) => {
  try {
    const { category, featured } = req.query;

    // Mock data
    const mockTemplates = [
      {
        id: 'template1',
        name: 'Contact Form',
        description: 'Simple contact form with name, email, and message',
        category: 'contact',
        questions: [
          { id: 'q1', type: 'short-answer', question: 'Name', required: true },
          { id: 'q2', type: 'email', question: 'Email', required: true },
          { id: 'q3', type: 'paragraph', question: 'Message', required: true },
        ],
        theme: { primaryColor: '#4F46E5' },
        thumbnail: null,
        featured: true,
        usageCount: 1200,
        createdAt: new Date(),
      },
      {
        id: 'template2',
        name: 'Customer Satisfaction Survey',
        description: 'Measure customer satisfaction with rating scales',
        category: 'survey',
        questions: [],
        theme: null,
        thumbnail: null,
        featured: true,
        usageCount: 890,
        createdAt: new Date(),
      },
    ];

    /*
    // Production Prisma query:
    const where = {};
    if (category) where.category = category;
    if (featured === 'true') where.featured = true;

    const templates = await prisma.formTemplate.findMany({
      where,
      orderBy: featured === 'true' ? { usageCount: 'desc' } : { createdAt: 'desc' },
    });
    */

    res.json(mockTemplates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

/**
 * GET /api/forms/templates/:id
 * Get a specific template
 */
router.get('/templates/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;

    // Mock data
    const mockTemplate = {
      id,
      name: 'Contact Form',
      description: 'Simple contact form',
      category: 'contact',
      questions: [
        { id: 'q1', type: 'short-answer', question: 'Name', required: true },
        { id: 'q2', type: 'email', question: 'Email', required: true },
        { id: 'q3', type: 'paragraph', question: 'Message', required: true },
      ],
      theme: { primaryColor: '#4F46E5' },
      thumbnail: null,
      featured: true,
      usageCount: 1200,
      createdAt: new Date(),
    };

    /*
    // Production Prisma query:
    const template = await prisma.formTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    */

    res.json(mockTemplate);
  } catch (error) {
    console.error('Error fetching template:', error);
    res.status(500).json({ error: 'Failed to fetch template' });
  }
});

export default router;
