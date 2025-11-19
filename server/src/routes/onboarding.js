/**
 * Onboarding API Routes
 * Handles all onboarding-related endpoints
 */

const express = require('express');
const router = express.Router();
const sampleDataService = require('../services/sampleDataService');
const emailAutomationService = require('../services/emailAutomationService');

// Middleware to check authentication (implement based on your auth system)
const requireAuth = (req, res, next) => {
  // TODO: Implement actual auth check
  // For now, assume user is in req.user
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

/**
 * GET /api/onboarding/status
 * Get current onboarding status for user
 */
router.get('/status', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get onboarding progress from database
    // TODO: Implement with actual Prisma
    const progress = {
      welcomeSeen: false,
      setupComplete: false,
      tourComplete: false,
      sampleDataCreated: false,
      quickWinsComplete: false
    };

    res.json(progress);
  } catch (error) {
    console.error('Error fetching onboarding status:', error);
    res.status(500).json({ error: 'Failed to fetch onboarding status' });
  }
});

/**
 * POST /api/onboarding/welcome-seen
 * Mark welcome splash as seen
 */
router.post('/welcome-seen', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    // TODO: Update database
    // await prisma.onboardingProgress.update({
    //   where: { userId },
    //   data: { welcomeSeen: true }
    // });

    res.json({ success: true });
  } catch (error) {
    console.error('Error marking welcome as seen:', error);
    res.status(500).json({ error: 'Failed to update onboarding status' });
  }
});

/**
 * POST /api/onboarding/setup
 * Save setup wizard preferences
 */
router.post('/setup', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { goal, wantsSampleData } = req.body;

    // Save user's goal
    // TODO: Update database
    // await prisma.user.update({
    //   where: { id: userId },
    //   data: { onboardingGoal: goal }
    // });

    // Generate sample data if requested
    if (wantsSampleData) {
      // This will be done in a separate endpoint to avoid timeout
      // Just mark that it should be generated
    }

    res.json({ success: true, goal, wantsSampleData });
  } catch (error) {
    console.error('Error saving setup:', error);
    res.status(500).json({ error: 'Failed to save setup preferences' });
  }
});

/**
 * POST /api/onboarding/setup-complete
 * Mark setup wizard as complete
 */
router.post('/setup-complete', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    // TODO: Update database
    // await prisma.onboardingProgress.update({
    //   where: { userId },
    //   data: { setupComplete: true }
    // });

    res.json({ success: true });
  } catch (error) {
    console.error('Error marking setup complete:', error);
    res.status(500).json({ error: 'Failed to update onboarding status' });
  }
});

/**
 * POST /api/onboarding/tour-complete
 * Mark dashboard tour as complete
 */
router.post('/tour-complete', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    // TODO: Update database
    // await prisma.onboardingProgress.update({
    //   where: { userId },
    //   data: { tourComplete: true }
    // });

    res.json({ success: true });
  } catch (error) {
    console.error('Error marking tour complete:', error);
    res.status(500).json({ error: 'Failed to update onboarding status' });
  }
});

/**
 * POST /api/onboarding/skip-all
 * Skip entire onboarding process
 */
router.post('/skip-all', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    // TODO: Update database
    // await prisma.onboardingProgress.update({
    //   where: { userId },
    //   data: {
    //     welcomeSeen: true,
    //     setupComplete: true,
    //     tourComplete: true
    //   }
    // });

    res.json({ success: true });
  } catch (error) {
    console.error('Error skipping onboarding:', error);
    res.status(500).json({ error: 'Failed to skip onboarding' });
  }
});

/**
 * GET /api/onboarding/quick-wins
 * Get quick wins checklist for user
 */
router.get('/quick-wins', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const userGoal = req.user.onboardingGoal || 'website';

    // TODO: Get actual progress from database
    const tasks = generateQuickWinsTasks(userGoal);

    res.json({ tasks });
  } catch (error) {
    console.error('Error fetching quick wins:', error);
    res.status(500).json({ error: 'Failed to fetch quick wins' });
  }
});

/**
 * GET /api/onboarding/progress
 * Get detailed progress metrics
 */
router.get('/progress', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    // TODO: Calculate actual progress from database
    const progress = {
      setupPercent: 80,
      setupComplete: false,
      quickWinsPercent: 40,
      quickWinsCompleted: 2,
      quickWinsTotal: 5,
      masteryPercent: 25,
      masteryLevel: 'Beginner',
      percentileRank: 65
    };

    res.json(progress);
  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
});

/**
 * POST /api/sample-data/generate
 * Generate sample data for user
 */
router.post('/sample-data/generate', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { goal } = req.body;

    // TODO: Implement with actual Prisma
    // const sampleItems = await sampleDataService.generateAllSampleData(
    //   userId,
    //   goal || 'all',
    //   prisma
    // );

    const sampleItems = [];

    res.json({
      success: true,
      itemsCreated: sampleItems.length,
      items: sampleItems
    });
  } catch (error) {
    console.error('Error generating sample data:', error);
    res.status(500).json({ error: 'Failed to generate sample data' });
  }
});

/**
 * DELETE /api/sample-data
 * Delete all sample data for user
 */
router.delete('/sample-data', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    // TODO: Implement with actual Prisma
    // const result = await sampleDataService.deleteAllSampleData(userId, prisma);

    const result = { deleted: 0 };

    res.json({
      success: true,
      deleted: result.deleted
    });
  } catch (error) {
    console.error('Error deleting sample data:', error);
    res.status(500).json({ error: 'Failed to delete sample data' });
  }
});

/**
 * GET /api/sample-data/check
 * Check if user has sample data
 */
router.get('/sample-data/check', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    // TODO: Implement with actual Prisma
    // const hasSamples = await sampleDataService.hasSampleData(userId, prisma);

    const hasSamples = false;

    res.json({ hasSampleData: hasSamples });
  } catch (error) {
    console.error('Error checking sample data:', error);
    res.status(500).json({ error: 'Failed to check sample data' });
  }
});

/**
 * Helper: Generate quick wins tasks based on goal
 */
function generateQuickWinsTasks(goal) {
  const baseTasks = [
    {
      title: 'Complete Your Profile',
      description: 'Add your bio and profile picture',
      completed: false,
      actionUrl: '/settings/profile'
    },
    {
      title: 'Chat with SUPERNova AI',
      description: 'Ask your first question',
      completed: false,
      actionUrl: '/chat'
    }
  ];

  const goalSpecificTasks = {
    website: [
      {
        title: 'Create Your First Page',
        description: 'Build a simple landing page',
        completed: false,
        actionUrl: '/pages/new'
      },
      {
        title: 'Write a Blog Post',
        description: 'Share your first thoughts',
        completed: false,
        actionUrl: '/blog/new'
      },
      {
        title: 'Connect Your Domain',
        description: 'Link your custom domain',
        completed: false,
        actionUrl: '/settings/domain'
      }
    ],
    ecommerce: [
      {
        title: 'Add Your First Product',
        description: 'List what you\'re selling',
        completed: false,
        actionUrl: '/products/new'
      },
      {
        title: 'Set Up Payment Gateway',
        description: 'Connect Stripe or PayPal',
        completed: false,
        actionUrl: '/settings/payments'
      },
      {
        title: 'Create a Store Page',
        description: 'Build your product showcase',
        completed: false,
        actionUrl: '/pages/new?template=store'
      }
    ],
    course: [
      {
        title: 'Create Your First Course',
        description: 'Start your course outline',
        completed: false,
        actionUrl: '/courses/new'
      },
      {
        title: 'Upload a Lesson',
        description: 'Add video or text content',
        completed: false,
        actionUrl: '/courses/lessons/new'
      },
      {
        title: 'Set Course Pricing',
        description: 'Decide your course price',
        completed: false,
        actionUrl: '/courses/pricing'
      }
    ],
    crm: [
      {
        title: 'Add Your First Contact',
        description: 'Start building your list',
        completed: false,
        actionUrl: '/contacts/new'
      },
      {
        title: 'Create a Pipeline',
        description: 'Set up your sales stages',
        completed: false,
        actionUrl: '/crm/pipelines'
      },
      {
        title: 'Import Contacts',
        description: 'Upload your existing list',
        completed: false,
        actionUrl: '/contacts/import'
      }
    ]
  };

  const specificTasks = goalSpecificTasks[goal] || goalSpecificTasks.website;
  return [...baseTasks, ...specificTasks].slice(0, 5);
}

module.exports = router;
