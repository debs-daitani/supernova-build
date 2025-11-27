import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// ============================================
// HELPER FUNCTIONS
// ============================================

// Personalize email content with user data
function personalizeContent(content, user) {
  if (!content) return content;

  const pronouns = user.pronouns || 'they/them';
  const pronounParts = pronouns.toLowerCase().split('/');
  const subject = pronounParts[0] || 'they';
  const object = pronounParts[1] || 'them';

  return content
    .replace(/\{\{name\}\}/g, user.name || '')
    .replace(/\{\{preferredName\}\}/g, user.preferredName || user.name || '')
    .replace(/\{\{email\}\}/g, user.email || '')
    .replace(/\{\{pronouns\}\}/g, pronouns)
    .replace(/\{\{pronounSubject\}\}/g, subject)
    .replace(/\{\{pronounObject\}\}/g, object)
    .replace(/\{\{businessGoal\}\}/g, user.onboardingProgress?.primaryGoal || 'your business');
}

// Calculate next email send time
function calculateNextEmailTime(baseTime, delayDays, delayHours = 0) {
  const delay = (delayDays * 24 * 60 * 60 * 1000) + (delayHours * 60 * 60 * 1000);
  return new Date(baseTime.getTime() + delay);
}

// Check if user meets sequence conditions
function meetsConditions(user, conditions) {
  if (!conditions) return true;

  // Simple condition checking (can be expanded)
  if (conditions.accountType && user.accountType !== conditions.accountType) {
    return false;
  }

  if (conditions.hasCompletedOnboarding !== undefined) {
    const completed = user.onboardingProgress?.progressPercent === 100;
    if (completed !== conditions.hasCompletedOnboarding) {
      return false;
    }
  }

  return true;
}

// ============================================
// SEQUENCE CRUD (Admin)
// ============================================

// Get all sequences
router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const sequences = await prisma.emailSequence.findMany({
      include: {
        _count: {
          select: {
            emails: true,
            enrollments: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(sequences);
  } catch (error) {
    console.error('Get sequences error:', error);
    res.status(500).json({ error: 'Failed to get sequences' });
  }
});

// Get single sequence
router.get('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const sequence = await prisma.emailSequence.findUnique({
      where: { id: req.params.id },
      include: {
        emails: {
          orderBy: { order: 'asc' }
        },
        _count: {
          select: {
            enrollments: true
          }
        }
      }
    });

    if (!sequence) {
      return res.status(404).json({ error: 'Sequence not found' });
    }

    res.json(sequence);
  } catch (error) {
    console.error('Get sequence error:', error);
    res.status(500).json({ error: 'Failed to get sequence' });
  }
});

// Create sequence
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const {
      name,
      description,
      sequenceType,
      triggerEvent,
      triggerDelay,
      conditions,
      isActive
    } = req.body;

    if (!name || !sequenceType || !triggerEvent) {
      return res.status(400).json({ error: 'Name, type, and trigger event required' });
    }

    const sequence = await prisma.emailSequence.create({
      data: {
        name,
        description,
        sequenceType,
        triggerEvent,
        triggerDelay: triggerDelay || 0,
        conditions,
        isActive: isActive !== undefined ? isActive : true
      }
    });

    res.json(sequence);
  } catch (error) {
    console.error('Create sequence error:', error);
    res.status(500).json({ error: 'Failed to create sequence' });
  }
});

// Update sequence
router.patch('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const {
      name,
      description,
      sequenceType,
      triggerEvent,
      triggerDelay,
      conditions,
      isActive
    } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (sequenceType !== undefined) updateData.sequenceType = sequenceType;
    if (triggerEvent !== undefined) updateData.triggerEvent = triggerEvent;
    if (triggerDelay !== undefined) updateData.triggerDelay = triggerDelay;
    if (conditions !== undefined) updateData.conditions = conditions;
    if (isActive !== undefined) updateData.isActive = isActive;

    const sequence = await prisma.emailSequence.update({
      where: { id: req.params.id },
      data: updateData
    });

    res.json(sequence);
  } catch (error) {
    console.error('Update sequence error:', error);
    res.status(500).json({ error: 'Failed to update sequence' });
  }
});

// Delete sequence
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    await prisma.emailSequence.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Sequence deleted successfully' });
  } catch (error) {
    console.error('Delete sequence error:', error);
    res.status(500).json({ error: 'Failed to delete sequence' });
  }
});

// Pause sequence
router.post('/:id/pause', authenticate, requireAdmin, async (req, res) => {
  try {
    const sequence = await prisma.emailSequence.update({
      where: { id: req.params.id },
      data: { isActive: false }
    });

    res.json(sequence);
  } catch (error) {
    console.error('Pause sequence error:', error);
    res.status(500).json({ error: 'Failed to pause sequence' });
  }
});

// Activate sequence
router.post('/:id/activate', authenticate, requireAdmin, async (req, res) => {
  try {
    const sequence = await prisma.emailSequence.update({
      where: { id: req.params.id },
      data: { isActive: true }
    });

    res.json(sequence);
  } catch (error) {
    console.error('Activate sequence error:', error);
    res.status(500).json({ error: 'Failed to activate sequence' });
  }
});

// ============================================
// EMAIL CRUD (Admin)
// ============================================

// Add email to sequence
router.post('/:id/emails', authenticate, requireAdmin, async (req, res) => {
  try {
    const {
      order,
      delayDays,
      delayHours,
      subject,
      previewText,
      htmlContent,
      textContent,
      variables,
      ctaText,
      ctaUrl
    } = req.body;

    if (!subject || !htmlContent || !textContent) {
      return res.status(400).json({ error: 'Subject, HTML content, and text content required' });
    }

    const email = await prisma.sequenceEmail.create({
      data: {
        sequenceId: req.params.id,
        order: order || 0,
        delayDays: delayDays || 0,
        delayHours: delayHours || 0,
        subject,
        previewText,
        htmlContent,
        textContent,
        variables: variables || [],
        ctaText,
        ctaUrl
      }
    });

    res.json(email);
  } catch (error) {
    console.error('Add email error:', error);
    res.status(500).json({ error: 'Failed to add email' });
  }
});

// Update email
router.patch('/emails/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const {
      order,
      delayDays,
      delayHours,
      subject,
      previewText,
      htmlContent,
      textContent,
      variables,
      ctaText,
      ctaUrl
    } = req.body;

    const updateData = {};
    if (order !== undefined) updateData.order = order;
    if (delayDays !== undefined) updateData.delayDays = delayDays;
    if (delayHours !== undefined) updateData.delayHours = delayHours;
    if (subject !== undefined) updateData.subject = subject;
    if (previewText !== undefined) updateData.previewText = previewText;
    if (htmlContent !== undefined) updateData.htmlContent = htmlContent;
    if (textContent !== undefined) updateData.textContent = textContent;
    if (variables !== undefined) updateData.variables = variables;
    if (ctaText !== undefined) updateData.ctaText = ctaText;
    if (ctaUrl !== undefined) updateData.ctaUrl = ctaUrl;

    const email = await prisma.sequenceEmail.update({
      where: { id: req.params.id },
      data: updateData
    });

    res.json(email);
  } catch (error) {
    console.error('Update email error:', error);
    res.status(500).json({ error: 'Failed to update email' });
  }
});

// Delete email
router.delete('/emails/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    await prisma.sequenceEmail.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Email deleted successfully' });
  } catch (error) {
    console.error('Delete email error:', error);
    res.status(500).json({ error: 'Failed to delete email' });
  }
});

// ============================================
// ENROLLMENT MANAGEMENT
// ============================================

// Enroll user(s) in sequence
router.post('/:id/enroll', authenticate, requireAdmin, async (req, res) => {
  try {
    const { userIds } = req.body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ error: 'User IDs array required' });
    }

    const sequence = await prisma.emailSequence.findUnique({
      where: { id: req.params.id },
      include: {
        emails: {
          orderBy: { order: 'asc' },
          take: 1
        }
      }
    });

    if (!sequence) {
      return res.status(404).json({ error: 'Sequence not found' });
    }

    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      include: { onboardingProgress: true }
    });

    const enrollments = [];
    const now = new Date();

    for (const user of users) {
      // Check conditions
      if (!meetsConditions(user, sequence.conditions)) {
        continue;
      }

      // Check if already enrolled
      const existing = await prisma.sequenceEnrollment.findUnique({
        where: {
          userId_sequenceId: {
            userId: user.id,
            sequenceId: sequence.id
          }
        }
      });

      if (existing) continue;

      // Calculate first email send time
      const triggerDelay = sequence.triggerDelay || 0;
      const firstEmail = sequence.emails[0];
      const nextEmailAt = firstEmail
        ? calculateNextEmailTime(now, 0, 0)  // Send first email immediately (or based on trigger delay)
        : null;

      const enrollment = await prisma.sequenceEnrollment.create({
        data: {
          userId: user.id,
          sequenceId: sequence.id,
          nextEmailAt
        }
      });

      enrollments.push(enrollment);
    }

    // Update recipient count
    await prisma.emailSequence.update({
      where: { id: sequence.id },
      data: {
        recipientsCount: {
          increment: enrollments.length
        }
      }
    });

    res.json({
      enrolled: enrollments.length,
      enrollments
    });
  } catch (error) {
    console.error('Enroll users error:', error);
    res.status(500).json({ error: 'Failed to enroll users' });
  }
});

// Get all enrollments
router.get('/enrollments', authenticate, requireAdmin, async (req, res) => {
  try {
    const { sequenceId, status } = req.query;

    const where = {};
    if (sequenceId) where.sequenceId = sequenceId;
    if (status) where.status = status;

    const enrollments = await prisma.sequenceEnrollment.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            preferredName: true
          }
        },
        sequence: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { enrolledAt: 'desc' },
      take: 100
    });

    res.json(enrollments);
  } catch (error) {
    console.error('Get enrollments error:', error);
    res.status(500).json({ error: 'Failed to get enrollments' });
  }
});

// Unenroll user
router.delete('/enrollments/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    await prisma.sequenceEnrollment.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'User unenrolled successfully' });
  } catch (error) {
    console.error('Unenroll user error:', error);
    res.status(500).json({ error: 'Failed to unenroll user' });
  }
});

// ============================================
// ANALYTICS
// ============================================

// Get sequence analytics
router.get('/:id/analytics', authenticate, requireAdmin, async (req, res) => {
  try {
    const sequence = await prisma.emailSequence.findUnique({
      where: { id: req.params.id },
      include: {
        emails: {
          orderBy: { order: 'asc' }
        },
        enrollments: true
      }
    });

    if (!sequence) {
      return res.status(404).json({ error: 'Sequence not found' });
    }

    const totalEnrollments = sequence.enrollments.length;
    const activeEnrollments = sequence.enrollments.filter(e => e.status === 'active').length;
    const completedEnrollments = sequence.enrollments.filter(e => e.status === 'completed').length;
    const unsubscribed = sequence.enrollments.filter(e => e.status === 'unsubscribed').length;

    // Get delivery stats
    const deliveries = await prisma.emailDelivery.findMany({
      where: { sequenceId: sequence.id }
    });

    const totalSent = deliveries.length;
    const totalOpened = deliveries.filter(d => d.opened).length;
    const totalClicked = deliveries.filter(d => d.clicked).length;

    const openRate = totalSent > 0 ? ((totalOpened / totalSent) * 100).toFixed(2) : 0;
    const clickRate = totalSent > 0 ? ((totalClicked / totalSent) * 100).toFixed(2) : 0;

    // Per-email stats
    const emailStats = sequence.emails.map(email => ({
      id: email.id,
      subject: email.subject,
      order: email.order,
      sentCount: email.sentCount,
      openCount: email.openCount,
      clickCount: email.clickCount,
      openRate: email.sentCount > 0 ? ((email.openCount / email.sentCount) * 100).toFixed(2) : 0,
      clickRate: email.sentCount > 0 ? ((email.clickCount / email.sentCount) * 100).toFixed(2) : 0
    }));

    res.json({
      sequence: {
        id: sequence.id,
        name: sequence.name,
        type: sequence.sequenceType
      },
      enrollments: {
        total: totalEnrollments,
        active: activeEnrollments,
        completed: completedEnrollments,
        unsubscribed
      },
      performance: {
        totalSent,
        totalOpened,
        totalClicked,
        openRate: parseFloat(openRate),
        clickRate: parseFloat(clickRate)
      },
      emails: emailStats
    });
  } catch (error) {
    console.error('Get sequence analytics error:', error);
    res.status(500).json({ error: 'Failed to get analytics' });
  }
});

// Get email analytics
router.get('/emails/:id/analytics', authenticate, requireAdmin, async (req, res) => {
  try {
    const email = await prisma.sequenceEmail.findUnique({
      where: { id: req.params.id }
    });

    if (!email) {
      return res.status(404).json({ error: 'Email not found' });
    }

    const deliveries = await prisma.emailDelivery.findMany({
      where: { emailId: email.id }
    });

    const sent = deliveries.length;
    const opened = deliveries.filter(d => d.opened).length;
    const clicked = deliveries.filter(d => d.clicked).length;

    res.json({
      email: {
        id: email.id,
        subject: email.subject,
        order: email.order
      },
      stats: {
        sent,
        opened,
        clicked,
        openRate: sent > 0 ? ((opened / sent) * 100).toFixed(2) : 0,
        clickRate: sent > 0 ? ((clicked / sent) * 100).toFixed(2) : 0
      }
    });
  } catch (error) {
    console.error('Get email analytics error:', error);
    res.status(500).json({ error: 'Failed to get email analytics' });
  }
});

// ============================================
// EMAIL PROCESSING (would run on a cron job)
// ============================================

// Manual trigger to process email queue (for testing)
router.post('/process-queue', authenticate, requireAdmin, async (req, res) => {
  try {
    const now = new Date();

    // Find enrollments ready for next email
    const ready = await prisma.sequenceEnrollment.findMany({
      where: {
        status: 'active',
        nextEmailAt: {
          lte: now
        }
      },
      include: {
        user: {
          include: {
            onboardingProgress: true
          }
        },
        sequence: {
          include: {
            emails: {
              orderBy: { order: 'asc' }
            }
          }
        }
      },
      take: 50 // Process in batches
    });

    const results = [];

    for (const enrollment of ready) {
      const nextEmail = enrollment.sequence.emails[enrollment.currentStep];

      if (!nextEmail) {
        // Sequence complete
        await prisma.sequenceEnrollment.update({
          where: { id: enrollment.id },
          data: {
            status: 'completed',
            completedAt: new Date()
          }
        });
        results.push({ enrollmentId: enrollment.id, status: 'completed' });
        continue;
      }

      // Personalize content
      const personalizedSubject = personalizeContent(nextEmail.subject, enrollment.user);
      const personalizedHtml = personalizeContent(nextEmail.htmlContent, enrollment.user);
      const personalizedText = personalizeContent(nextEmail.textContent, enrollment.user);

      // Log delivery (actual sending would happen here via SendGrid/Mailgun/etc)
      const delivery = await prisma.emailDelivery.create({
        data: {
          userId: enrollment.user.id,
          sequenceId: enrollment.sequenceId,
          emailId: nextEmail.id,
          subject: personalizedSubject,
          content: personalizedHtml,
          status: 'sent',
          sentAt: new Date(),
          provider: 'demo' // Would be 'sendgrid', 'mailgun', etc.
        }
      });

      // Update email stats
      await prisma.sequenceEmail.update({
        where: { id: nextEmail.id },
        data: {
          sentCount: {
            increment: 1
          }
        }
      });

      // Calculate next email time
      const nextStep = enrollment.currentStep + 1;
      const nextEmailInSequence = enrollment.sequence.emails[nextStep];
      const nextEmailAt = nextEmailInSequence
        ? calculateNextEmailTime(now, nextEmailInSequence.delayDays, nextEmailInSequence.delayHours)
        : null;

      // Update enrollment
      await prisma.sequenceEnrollment.update({
        where: { id: enrollment.id },
        data: {
          currentStep: nextStep,
          nextEmailAt
        }
      });

      results.push({
        enrollmentId: enrollment.id,
        emailSent: nextEmail.subject,
        deliveryId: delivery.id
      });
    }

    res.json({
      processed: results.length,
      results
    });
  } catch (error) {
    console.error('Process queue error:', error);
    res.status(500).json({ error: 'Failed to process email queue' });
  }
});

export default router;
