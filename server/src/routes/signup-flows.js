/**
 * Phase 2BB: Signup Flow Builder
 * Backend API Routes - Multi-step signup forms and lead generation
 */

import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Generate unique slug from name
 */
function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    + '-' + Math.random().toString(36).substr(2, 6);
}

/**
 * Calculate conversion rate
 */
function calculateConversionRate(completions, starts) {
  if (starts === 0) return 0;
  return (completions / starts) * 100;
}

// ============================================
// SIGNUP FLOW CRUD
// ============================================

/**
 * GET /api/signup-flows
 * Get all signup flows for authenticated user
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const flows = await prisma.signupFlow.findMany({
      where: { userId: req.user.id },
      include: {
        _count: {
          select: {
            submissions: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ flows });
  } catch (error) {
    console.error('Failed to get signup flows:', error);
    res.status(500).json({ error: 'Failed to get signup flows' });
  }
});

/**
 * GET /api/signup-flows/:id
 * Get single signup flow
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const flow = await prisma.signupFlow.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!flow) {
      return res.status(404).json({ error: 'Signup flow not found' });
    }

    res.json({ flow });
  } catch (error) {
    console.error('Failed to get signup flow:', error);
    res.status(500).json({ error: 'Failed to get signup flow' });
  }
});

/**
 * POST /api/signup-flows
 * Create new signup flow
 */
router.post('/', authenticate, async (req, res) => {
  try {
    const {
      name,
      flowType,
      steps,
      showProgress,
      allowBack,
      confirmationType,
      confirmationMessage,
      confirmationUrl,
      leadMagnetUrl,
      leadMagnetName,
      sendToEmail,
      theme
    } = req.body;

    if (!name || !flowType || !steps) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const slug = generateSlug(name);

    const flow = await prisma.signupFlow.create({
      data: {
        userId: req.user.id,
        name,
        slug,
        flowType,
        steps,
        showProgress: showProgress !== undefined ? showProgress : true,
        allowBack: allowBack !== undefined ? allowBack : true,
        confirmationType: confirmationType || 'page',
        confirmationMessage,
        confirmationUrl,
        leadMagnetUrl,
        leadMagnetName,
        sendToEmail,
        theme: theme || 'default'
      }
    });

    res.json({ flow });
  } catch (error) {
    console.error('Failed to create signup flow:', error);
    res.status(500).json({ error: 'Failed to create signup flow' });
  }
});

/**
 * PATCH /api/signup-flows/:id
 * Update signup flow
 */
router.patch('/:id', authenticate, async (req, res) => {
  try {
    const existing = await prisma.signupFlow.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Signup flow not found' });
    }

    const {
      name,
      steps,
      showProgress,
      allowBack,
      confirmationType,
      confirmationMessage,
      confirmationUrl,
      leadMagnetUrl,
      leadMagnetName,
      sendToEmail,
      emailListId,
      autoResponder,
      theme,
      customCSS,
      metaTitle,
      metaDescription
    } = req.body;

    const flow = await prisma.signupFlow.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(steps && { steps }),
        ...(showProgress !== undefined && { showProgress }),
        ...(allowBack !== undefined && { allowBack }),
        ...(confirmationType && { confirmationType }),
        ...(confirmationMessage !== undefined && { confirmationMessage }),
        ...(confirmationUrl !== undefined && { confirmationUrl }),
        ...(leadMagnetUrl !== undefined && { leadMagnetUrl }),
        ...(leadMagnetName !== undefined && { leadMagnetName }),
        ...(sendToEmail !== undefined && { sendToEmail }),
        ...(emailListId !== undefined && { emailListId }),
        ...(autoResponder !== undefined && { autoResponder }),
        ...(theme && { theme }),
        ...(customCSS !== undefined && { customCSS }),
        ...(metaTitle !== undefined && { metaTitle }),
        ...(metaDescription !== undefined && { metaDescription })
      }
    });

    res.json({ flow });
  } catch (error) {
    console.error('Failed to update signup flow:', error);
    res.status(500).json({ error: 'Failed to update signup flow' });
  }
});

/**
 * DELETE /api/signup-flows/:id
 * Delete signup flow
 */
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const existing = await prisma.signupFlow.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Signup flow not found' });
    }

    await prisma.signupFlow.delete({
      where: { id: req.params.id }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Failed to delete signup flow:', error);
    res.status(500).json({ error: 'Failed to delete signup flow' });
  }
});

/**
 * POST /api/signup-flows/:id/publish
 * Publish signup flow
 */
router.post('/:id/publish', authenticate, async (req, res) => {
  try {
    const existing = await prisma.signupFlow.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Signup flow not found' });
    }

    const flow = await prisma.signupFlow.update({
      where: { id: req.params.id },
      data: {
        isPublished: true,
        publishedAt: new Date()
      }
    });

    res.json({ flow });
  } catch (error) {
    console.error('Failed to publish signup flow:', error);
    res.status(500).json({ error: 'Failed to publish signup flow' });
  }
});

/**
 * POST /api/signup-flows/:id/unpublish
 * Unpublish signup flow
 */
router.post('/:id/unpublish', authenticate, async (req, res) => {
  try {
    const existing = await prisma.signupFlow.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Signup flow not found' });
    }

    const flow = await prisma.signupFlow.update({
      where: { id: req.params.id },
      data: {
        isPublished: false
      }
    });

    res.json({ flow });
  } catch (error) {
    console.error('Failed to unpublish signup flow:', error);
    res.status(500).json({ error: 'Failed to unpublish signup flow' });
  }
});

/**
 * POST /api/signup-flows/:id/duplicate
 * Duplicate signup flow
 */
router.post('/:id/duplicate', authenticate, async (req, res) => {
  try {
    const existing = await prisma.signupFlow.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Signup flow not found' });
    }

    const newSlug = generateSlug(existing.name + ' Copy');

    const flow = await prisma.signupFlow.create({
      data: {
        userId: req.user.id,
        name: existing.name + ' (Copy)',
        slug: newSlug,
        flowType: existing.flowType,
        steps: existing.steps,
        showProgress: existing.showProgress,
        allowBack: existing.allowBack,
        confirmationType: existing.confirmationType,
        confirmationMessage: existing.confirmationMessage,
        confirmationUrl: existing.confirmationUrl,
        leadMagnetUrl: existing.leadMagnetUrl,
        leadMagnetName: existing.leadMagnetName,
        sendToEmail: existing.sendToEmail,
        emailListId: existing.emailListId,
        autoResponder: existing.autoResponder,
        theme: existing.theme,
        customCSS: existing.customCSS,
        metaTitle: existing.metaTitle,
        metaDescription: existing.metaDescription,
        isPublished: false
      }
    });

    res.json({ flow });
  } catch (error) {
    console.error('Failed to duplicate signup flow:', error);
    res.status(500).json({ error: 'Failed to duplicate signup flow' });
  }
});

// ============================================
// PUBLIC PAGES
// ============================================

/**
 * GET /api/signup-flows/public/:slug
 * Get published signup flow by slug (public)
 */
router.get('/public/:slug', async (req, res) => {
  try {
    const flow = await prisma.signupFlow.findFirst({
      where: {
        slug: req.params.slug,
        isPublished: true
      }
    });

    if (!flow) {
      return res.status(404).json({ error: 'Signup flow not found' });
    }

    // Increment views
    await prisma.signupFlow.update({
      where: { id: flow.id },
      data: { views: { increment: 1 } }
    });

    res.json({ flow });
  } catch (error) {
    console.error('Failed to get public signup flow:', error);
    res.status(500).json({ error: 'Failed to get signup flow' });
  }
});

// ============================================
// SUBMISSIONS
// ============================================

/**
 * POST /api/signup-flows/:id/start
 * Start a new submission (track form start)
 */
router.post('/:id/start', async (req, res) => {
  try {
    const { visitorId, userId, referrer, utmSource, utmMedium, utmCampaign } = req.body;

    const flow = await prisma.signupFlow.findUnique({
      where: { id: req.params.id }
    });

    if (!flow) {
      return res.status(404).json({ error: 'Signup flow not found' });
    }

    const submission = await prisma.signupSubmission.create({
      data: {
        flowId: req.params.id,
        visitorId: visitorId || 'anonymous',
        userId,
        data: {},
        currentStep: 0,
        totalSteps: Array.isArray(flow.steps) ? flow.steps.length : 0,
        referrer,
        utmSource,
        utmMedium,
        utmCampaign
      }
    });

    // Increment starts
    await prisma.signupFlow.update({
      where: { id: req.params.id },
      data: { starts: { increment: 1 } }
    });

    res.json({ submission });
  } catch (error) {
    console.error('Failed to start submission:', error);
    res.status(500).json({ error: 'Failed to start submission' });
  }
});

/**
 * PATCH /api/signup-flows/submissions/:id
 * Save step data (partial submission)
 */
router.patch('/submissions/:id', async (req, res) => {
  try {
    const { data, currentStep } = req.body;

    const submission = await prisma.signupSubmission.findUnique({
      where: { id: req.params.id }
    });

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    // Merge data
    const updatedData = {
      ...submission.data,
      ...data
    };

    const updated = await prisma.signupSubmission.update({
      where: { id: req.params.id },
      data: {
        data: updatedData,
        ...(currentStep !== undefined && { currentStep })
      }
    });

    res.json({ submission: updated });
  } catch (error) {
    console.error('Failed to save step:', error);
    res.status(500).json({ error: 'Failed to save step' });
  }
});

/**
 * POST /api/signup-flows/submissions/:id/complete
 * Complete submission
 */
router.post('/submissions/:id/complete', async (req, res) => {
  try {
    const submission = await prisma.signupSubmission.findUnique({
      where: { id: req.params.id },
      include: { flow: true }
    });

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    const startedAt = new Date(submission.startedAt);
    const completedAt = new Date();
    const timeToComplete = Math.floor((completedAt - startedAt) / 1000);

    const updated = await prisma.signupSubmission.update({
      where: { id: req.params.id },
      data: {
        completed: true,
        completedAt,
        timeToComplete
      }
    });

    // Increment completions
    const flow = await prisma.signupFlow.findUnique({
      where: { id: submission.flowId }
    });

    const newCompletions = flow.completions + 1;
    const conversionRate = calculateConversionRate(newCompletions, flow.starts);

    await prisma.signupFlow.update({
      where: { id: submission.flowId },
      data: {
        completions: newCompletions,
        conversionRate
      }
    });

    // TODO: Send to email list, deliver lead magnet, send notifications

    res.json({ submission: updated });
  } catch (error) {
    console.error('Failed to complete submission:', error);
    res.status(500).json({ error: 'Failed to complete submission' });
  }
});

/**
 * GET /api/signup-flows/:id/submissions
 * Get all submissions for a flow
 */
router.get('/:id/submissions', authenticate, async (req, res) => {
  try {
    const flow = await prisma.signupFlow.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!flow) {
      return res.status(404).json({ error: 'Signup flow not found' });
    }

    const { completed, limit = 100, offset = 0 } = req.query;

    const where = {
      flowId: req.params.id,
      ...(completed !== undefined && { completed: completed === 'true' })
    };

    const submissions = await prisma.signupSubmission.findMany({
      where,
      orderBy: { startedAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset)
    });

    const total = await prisma.signupSubmission.count({ where });

    res.json({ submissions, total });
  } catch (error) {
    console.error('Failed to get submissions:', error);
    res.status(500).json({ error: 'Failed to get submissions' });
  }
});

/**
 * GET /api/signup-flows/submissions/:id/detail
 * Get single submission detail
 */
router.get('/submissions/:id/detail', authenticate, async (req, res) => {
  try {
    const submission = await prisma.signupSubmission.findUnique({
      where: { id: req.params.id },
      include: {
        flow: {
          select: {
            id: true,
            name: true,
            userId: true
          }
        }
      }
    });

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    // Check ownership
    if (submission.flow.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    res.json({ submission });
  } catch (error) {
    console.error('Failed to get submission:', error);
    res.status(500).json({ error: 'Failed to get submission' });
  }
});

/**
 * POST /api/signup-flows/:id/export
 * Export submissions to CSV
 */
router.post('/:id/export', authenticate, async (req, res) => {
  try {
    const flow = await prisma.signupFlow.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!flow) {
      return res.status(404).json({ error: 'Signup flow not found' });
    }

    const submissions = await prisma.signupSubmission.findMany({
      where: {
        flowId: req.params.id,
        completed: true
      },
      orderBy: { completedAt: 'desc' }
    });

    // Build CSV
    const headers = ['Completed At', 'Time to Complete (s)'];
    const dataKeys = new Set();

    // Collect all unique field keys
    submissions.forEach(sub => {
      Object.keys(sub.data || {}).forEach(key => dataKeys.add(key));
    });

    headers.push(...Array.from(dataKeys));

    const csv = [
      headers.join(','),
      ...submissions.map(sub => {
        const row = [
          sub.completedAt ? new Date(sub.completedAt).toISOString() : '',
          sub.timeToComplete || ''
        ];

        dataKeys.forEach(key => {
          const value = sub.data[key] || '';
          row.push(`"${String(value).replace(/"/g, '""')}"`);
        });

        return row.join(',');
      })
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="submissions-${flow.slug}.csv"`);
    res.send(csv);
  } catch (error) {
    console.error('Failed to export submissions:', error);
    res.status(500).json({ error: 'Failed to export submissions' });
  }
});

// ============================================
// ANALYTICS
// ============================================

/**
 * GET /api/signup-flows/:id/analytics
 * Get signup flow analytics
 */
router.get('/:id/analytics', authenticate, async (req, res) => {
  try {
    const flow = await prisma.signupFlow.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!flow) {
      return res.status(404).json({ error: 'Signup flow not found' });
    }

    // Get all submissions
    const submissions = await prisma.signupSubmission.findMany({
      where: { flowId: req.params.id }
    });

    const completed = submissions.filter(s => s.completed);
    const abandoned = submissions.filter(s => !s.completed);

    // Calculate average time to complete
    const completedWithTime = completed.filter(s => s.timeToComplete);
    const avgTimeToComplete = completedWithTime.length > 0
      ? completedWithTime.reduce((sum, s) => sum + s.timeToComplete, 0) / completedWithTime.length
      : 0;

    // Step drop-off analysis
    const stepAnalysis = [];
    const totalSteps = Array.isArray(flow.steps) ? flow.steps.length : 0;

    for (let i = 0; i < totalSteps; i++) {
      const reachedStep = submissions.filter(s => s.currentStep >= i).length;
      const completedStep = submissions.filter(s => s.currentStep > i).length;
      const dropOff = reachedStep - completedStep;

      stepAnalysis.push({
        step: i,
        reached: reachedStep,
        completed: completedStep,
        dropOff,
        dropOffRate: reachedStep > 0 ? (dropOff / reachedStep) * 100 : 0
      });
    }

    // Source breakdown
    const sources = {};
    submissions.forEach(sub => {
      const source = sub.utmSource || sub.referrer || 'direct';
      sources[source] = (sources[source] || 0) + 1;
    });

    res.json({
      analytics: {
        overview: {
          views: flow.views,
          starts: flow.starts,
          completions: flow.completions,
          conversionRate: flow.conversionRate || 0,
          avgTimeToComplete: Math.round(avgTimeToComplete),
          abandoned: abandoned.length
        },
        stepAnalysis,
        sources
      }
    });
  } catch (error) {
    console.error('Failed to get analytics:', error);
    res.status(500).json({ error: 'Failed to get analytics' });
  }
});

// ============================================
// TEMPLATES
// ============================================

/**
 * GET /api/signup-flows/templates/all
 * Get all templates
 */
router.get('/templates/all', async (req, res) => {
  try {
    const templates = await prisma.signupFlowTemplate.findMany({
      where: { isActive: true },
      orderBy: { category: 'asc' }
    });

    res.json({ templates });
  } catch (error) {
    console.error('Failed to get templates:', error);
    res.status(500).json({ error: 'Failed to get templates' });
  }
});

export default router;
