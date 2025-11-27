import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// ============================================
// HELPER FUNCTIONS
// ============================================

// Get or create onboarding progress for user
async function getOrCreateProgress(userId) {
  let progress = await prisma.onboardingProgress.findUnique({
    where: { userId }
  });

  if (!progress) {
    progress = await prisma.onboardingProgress.create({
      data: {
        userId,
        completedSteps: [],
        progressPercent: 0
      }
    });
  }

  return progress;
}

// Calculate progress percentage
function calculateProgressPercent(completedSteps, totalSteps) {
  if (totalSteps === 0) return 0;
  return Math.round((completedSteps.length / totalSteps) * 100);
}

// Get default quick wins based on user's goal
function getDefaultQuickWins(goal) {
  const quickWins = {
    website: [
      { title: 'Create your first page', estimatedTime: '2 min', order: 1 },
      { title: 'Customize your theme', estimatedTime: '5 min', order: 2 },
      { title: 'Add your logo', estimatedTime: '2 min', order: 3 },
      { title: 'Publish your website', estimatedTime: '1 min', order: 4 }
    ],
    courses: [
      { title: 'Create your first course', estimatedTime: '3 min', order: 1 },
      { title: 'Add course content', estimatedTime: '10 min', order: 2 },
      { title: 'Set course pricing', estimatedTime: '2 min', order: 3 },
      { title: 'Publish your course', estimatedTime: '1 min', order: 4 }
    ],
    ecommerce: [
      { title: 'Add your first product', estimatedTime: '3 min', order: 1 },
      { title: 'Set up payment methods', estimatedTime: '5 min', order: 2 },
      { title: 'Configure shipping', estimatedTime: '5 min', order: 3 },
      { title: 'Make your first sale', estimatedTime: 'Varies', order: 4 }
    ],
    crm: [
      { title: 'Add your first contact', estimatedTime: '2 min', order: 1 },
      { title: 'Create a pipeline', estimatedTime: '3 min', order: 2 },
      { title: 'Send your first email', estimatedTime: '5 min', order: 3 },
      { title: 'Log your first deal', estimatedTime: '2 min', order: 4 }
    ],
    all: [
      { title: 'Complete your profile', estimatedTime: '3 min', order: 1 },
      { title: 'Invite a team member', estimatedTime: '2 min', order: 2 },
      { title: 'Connect a custom domain', estimatedTime: '5 min', order: 3 },
      { title: 'Explore all features', estimatedTime: '10 min', order: 4 }
    ]
  };

  return quickWins[goal] || quickWins.all;
}

// ============================================
// USER ENDPOINTS - Onboarding Progress
// ============================================

// Get current user's onboarding progress
router.get('/progress', authenticate, async (req, res) => {
  try {
    const progress = await getOrCreateProgress(req.user.id);
    res.json(progress);
  } catch (error) {
    console.error('Get onboarding progress error:', error);
    res.status(500).json({ error: 'Failed to get onboarding progress' });
  }
});

// Update onboarding progress
router.post('/progress', authenticate, async (req, res) => {
  try {
    const {
      currentStep,
      primaryGoal,
      selectedFeatures,
      showTips,
      skipOnboarding
    } = req.body;

    const updateData = {};
    if (currentStep !== undefined) updateData.currentStep = currentStep;
    if (primaryGoal !== undefined) updateData.primaryGoal = primaryGoal;
    if (selectedFeatures !== undefined) updateData.selectedFeatures = selectedFeatures;
    if (showTips !== undefined) updateData.showTips = showTips;
    if (skipOnboarding !== undefined) updateData.skipOnboarding = skipOnboarding;

    const progress = await prisma.onboardingProgress.upsert({
      where: { userId: req.user.id },
      update: updateData,
      create: {
        userId: req.user.id,
        ...updateData,
        completedSteps: []
      }
    });

    res.json(progress);
  } catch (error) {
    console.error('Update onboarding progress error:', error);
    res.status(500).json({ error: 'Failed to update onboarding progress' });
  }
});

// Complete a step
router.post('/complete-step', authenticate, async (req, res) => {
  try {
    const { stepId, milestone } = req.body;

    if (!stepId) {
      return res.status(400).json({ error: 'Step ID is required' });
    }

    const progress = await getOrCreateProgress(req.user.id);
    const completedSteps = Array.isArray(progress.completedSteps)
      ? progress.completedSteps
      : [];

    // Add step if not already completed
    if (!completedSteps.includes(stepId)) {
      completedSteps.push(stepId);
    }

    // Count total active steps
    const totalSteps = await prisma.onboardingStep.count({
      where: { isActive: true }
    });

    // Update milestone if provided
    const milestoneUpdate = {};
    if (milestone === 'welcome') milestoneUpdate.hasCompletedWelcome = true;
    if (milestone === 'tour') milestoneUpdate.hasCompletedTour = true;
    if (milestone === 'quick_wins') milestoneUpdate.hasSeenQuickWins = true;
    if (milestone === 'first_website') milestoneUpdate.firstWebsiteCreated = true;
    if (milestone === 'first_course') milestoneUpdate.firstCourseCreated = true;
    if (milestone === 'first_product') milestoneUpdate.firstProductAdded = true;
    if (milestone === 'first_contact') milestoneUpdate.firstContactAdded = true;
    if (milestone === 'first_sale') milestoneUpdate.firstSaleMade = true;

    const updatedProgress = await prisma.onboardingProgress.update({
      where: { userId: req.user.id },
      data: {
        completedSteps,
        progressPercent: calculateProgressPercent(completedSteps, totalSteps),
        ...milestoneUpdate
      }
    });

    res.json(updatedProgress);
  } catch (error) {
    console.error('Complete step error:', error);
    res.status(500).json({ error: 'Failed to complete step' });
  }
});

// Reset onboarding (start over)
router.post('/reset', authenticate, async (req, res) => {
  try {
    const progress = await prisma.onboardingProgress.update({
      where: { userId: req.user.id },
      data: {
        currentStep: null,
        completedSteps: [],
        progressPercent: 0,
        hasCompletedWelcome: false,
        hasCompletedTour: false,
        hasSeenQuickWins: false,
        skipOnboarding: false
      }
    });

    res.json(progress);
  } catch (error) {
    console.error('Reset onboarding error:', error);
    res.status(500).json({ error: 'Failed to reset onboarding' });
  }
});

// ============================================
// USER ENDPOINTS - Onboarding Steps
// ============================================

// Get all active onboarding steps
router.get('/steps', authenticate, async (req, res) => {
  try {
    const { goal } = req.query;

    const where = { isActive: true };

    // Filter by goal if provided
    if (goal && goal !== 'all') {
      where.OR = [
        { requiredForGoals: { path: '$', array_contains: goal } },
        { requiredForGoals: { path: '$', array_contains: 'all' } },
        { requiredForGoals: null }
      ];
    }

    const steps = await prisma.onboardingStep.findMany({
      where,
      orderBy: { order: 'asc' }
    });

    res.json(steps);
  } catch (error) {
    console.error('Get onboarding steps error:', error);
    res.status(500).json({ error: 'Failed to get onboarding steps' });
  }
});

// Get a specific step
router.get('/steps/:stepId', authenticate, async (req, res) => {
  try {
    const step = await prisma.onboardingStep.findUnique({
      where: { stepId: req.params.stepId }
    });

    if (!step) {
      return res.status(404).json({ error: 'Step not found' });
    }

    res.json(step);
  } catch (error) {
    console.error('Get step error:', error);
    res.status(500).json({ error: 'Failed to get step' });
  }
});

// ============================================
// USER ENDPOINTS - Quick Wins
// ============================================

// Get quick wins for user
router.get('/quick-wins', authenticate, async (req, res) => {
  try {
    const progress = await getOrCreateProgress(req.user.id);
    const goal = progress.primaryGoal || 'all';

    // Get quick wins for user's goal
    let quickWins = await prisma.quickWin.findMany({
      where: {
        OR: [
          { relatedGoal: goal },
          { relatedGoal: 'all' },
          { relatedGoal: null }
        ]
      },
      orderBy: { order: 'asc' },
      include: {
        userQuickWins: {
          where: { userId: req.user.id }
        }
      }
    });

    // If no quick wins in database, return defaults
    if (quickWins.length === 0) {
      const defaults = getDefaultQuickWins(goal);
      quickWins = defaults.map((qw, index) => ({
        id: `default-${index}`,
        ...qw,
        relatedGoal: goal,
        actionUrl: null,
        actionType: null,
        actionText: 'Get Started',
        rewardPoints: 10,
        rewardBadge: null,
        difficulty: 'easy',
        userQuickWins: []
      }));
    }

    // Transform to include completion status
    const quickWinsWithStatus = quickWins.map(qw => ({
      ...qw,
      completed: qw.userQuickWins.length > 0 && qw.userQuickWins[0].completed,
      completedAt: qw.userQuickWins.length > 0 ? qw.userQuickWins[0].completedAt : null,
      userQuickWins: undefined // Remove the relation from response
    }));

    res.json(quickWinsWithStatus);
  } catch (error) {
    console.error('Get quick wins error:', error);
    res.status(500).json({ error: 'Failed to get quick wins' });
  }
});

// Complete a quick win
router.post('/quick-wins/:id/complete', authenticate, async (req, res) => {
  try {
    const quickWinId = req.params.id;

    // Check if quick win exists
    const quickWin = await prisma.quickWin.findUnique({
      where: { id: quickWinId }
    });

    if (!quickWin) {
      return res.status(404).json({ error: 'Quick win not found' });
    }

    // Create or update user quick win
    const userQuickWin = await prisma.userQuickWin.upsert({
      where: {
        userId_quickWinId: {
          userId: req.user.id,
          quickWinId
        }
      },
      update: {
        completed: true,
        completedAt: new Date(),
        pointsEarned: quickWin.rewardPoints
      },
      create: {
        userId: req.user.id,
        quickWinId,
        completed: true,
        completedAt: new Date(),
        pointsEarned: quickWin.rewardPoints
      }
    });

    res.json(userQuickWin);
  } catch (error) {
    console.error('Complete quick win error:', error);
    res.status(500).json({ error: 'Failed to complete quick win' });
  }
});

// ============================================
// USER ENDPOINTS - Tutorials
// ============================================

// Get all tutorials with user's progress
router.get('/tutorials', authenticate, async (req, res) => {
  try {
    const { category } = req.query;

    // Get user's tutorial progress
    const where = { userId: req.user.id };
    if (category) {
      where.category = category;
    }

    const userProgress = await prisma.tutorialProgress.findMany({
      where,
      orderBy: { updatedAt: 'desc' }
    });

    // Define available tutorials (these could come from a Tutorial model in future)
    const allTutorials = [
      {
        id: 'website-basics',
        title: 'Website Builder Basics',
        category: 'website',
        description: 'Learn how to create your first website',
        videoUrl: '/tutorials/website-basics.mp4',
        thumbnail: '/tutorials/thumbnails/website-basics.jpg',
        totalSteps: 5,
        duration: '8 min'
      },
      {
        id: 'course-creation',
        title: 'Creating Your First Course',
        category: 'courses',
        description: 'Step-by-step guide to launching a course',
        videoUrl: '/tutorials/course-creation.mp4',
        thumbnail: '/tutorials/thumbnails/course-creation.jpg',
        totalSteps: 6,
        duration: '12 min'
      },
      {
        id: 'ecommerce-setup',
        title: 'Setting Up Your Store',
        category: 'ecommerce',
        description: 'Get your online store up and running',
        videoUrl: '/tutorials/ecommerce-setup.mp4',
        thumbnail: '/tutorials/thumbnails/ecommerce-setup.jpg',
        totalSteps: 7,
        duration: '15 min'
      },
      {
        id: 'crm-basics',
        title: 'CRM Fundamentals',
        category: 'crm',
        description: 'Manage contacts and deals effectively',
        videoUrl: '/tutorials/crm-basics.mp4',
        thumbnail: '/tutorials/thumbnails/crm-basics.jpg',
        totalSteps: 5,
        duration: '10 min'
      },
      {
        id: 'email-marketing',
        title: 'Email Marketing Mastery',
        category: 'marketing',
        description: 'Build and send effective email campaigns',
        videoUrl: '/tutorials/email-marketing.mp4',
        thumbnail: '/tutorials/thumbnails/email-marketing.jpg',
        totalSteps: 6,
        duration: '14 min'
      },
      {
        id: 'analytics-reporting',
        title: 'Analytics & Reporting',
        category: 'analytics',
        description: 'Track your performance and growth',
        videoUrl: '/tutorials/analytics-reporting.mp4',
        thumbnail: '/tutorials/thumbnails/analytics-reporting.jpg',
        totalSteps: 4,
        duration: '9 min'
      }
    ];

    // Filter by category if provided
    const filteredTutorials = category
      ? allTutorials.filter(t => t.category === category)
      : allTutorials;

    // Merge with user progress
    const tutorialsWithProgress = filteredTutorials.map(tutorial => {
      const progress = userProgress.find(p => p.tutorialId === tutorial.id);
      return {
        ...tutorial,
        progress: progress ? {
          currentStep: progress.currentStep,
          watchTime: progress.watchTime,
          completed: progress.completed,
          completedAt: progress.completedAt,
          bookmarked: progress.bookmarked
        } : null
      };
    });

    res.json(tutorialsWithProgress);
  } catch (error) {
    console.error('Get tutorials error:', error);
    res.status(500).json({ error: 'Failed to get tutorials' });
  }
});

// Update tutorial progress
router.post('/tutorials/:tutorialId/progress', authenticate, async (req, res) => {
  try {
    const { tutorialId } = req.params;
    const { currentStep, watchTime, completed, bookmarked, tutorialTitle, totalSteps, category } = req.body;

    const updateData = {};
    if (currentStep !== undefined) updateData.currentStep = currentStep;
    if (watchTime !== undefined) updateData.watchTime = watchTime;
    if (completed !== undefined) {
      updateData.completed = completed;
      if (completed) updateData.completedAt = new Date();
    }
    if (bookmarked !== undefined) updateData.bookmarked = bookmarked;

    const progress = await prisma.tutorialProgress.upsert({
      where: {
        userId_tutorialId: {
          userId: req.user.id,
          tutorialId
        }
      },
      update: updateData,
      create: {
        userId: req.user.id,
        tutorialId,
        tutorialTitle: tutorialTitle || 'Tutorial',
        totalSteps: totalSteps || 1,
        category: category || null,
        ...updateData
      }
    });

    res.json(progress);
  } catch (error) {
    console.error('Update tutorial progress error:', error);
    res.status(500).json({ error: 'Failed to update tutorial progress' });
  }
});

// ============================================
// ADMIN ENDPOINTS - Onboarding Steps
// ============================================

// Get all onboarding steps (admin)
router.get('/admin/steps', authenticate, requireAdmin, async (req, res) => {
  try {
    const steps = await prisma.onboardingStep.findMany({
      orderBy: { order: 'asc' }
    });

    res.json(steps);
  } catch (error) {
    console.error('Admin get steps error:', error);
    res.status(500).json({ error: 'Failed to get steps' });
  }
});

// Create onboarding step
router.post('/admin/steps', authenticate, requireAdmin, async (req, res) => {
  try {
    const {
      stepId,
      title,
      description,
      icon,
      videoUrl,
      imageUrl,
      ctaText,
      ctaUrl,
      prerequisiteSteps,
      requiredForGoals,
      completionAction,
      order,
      category,
      isActive
    } = req.body;

    if (!stepId || !title || !description) {
      return res.status(400).json({ error: 'Step ID, title, and description are required' });
    }

    const step = await prisma.onboardingStep.create({
      data: {
        stepId,
        title,
        description,
        icon,
        videoUrl,
        imageUrl,
        ctaText,
        ctaUrl,
        prerequisiteSteps: prerequisiteSteps || null,
        requiredForGoals: requiredForGoals || null,
        completionAction,
        order: order || 0,
        category,
        isActive: isActive !== undefined ? isActive : true
      }
    });

    res.json(step);
  } catch (error) {
    console.error('Create step error:', error);
    res.status(500).json({ error: 'Failed to create step' });
  }
});

// Update onboarding step
router.patch('/admin/steps/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const {
      stepId,
      title,
      description,
      icon,
      videoUrl,
      imageUrl,
      ctaText,
      ctaUrl,
      prerequisiteSteps,
      requiredForGoals,
      completionAction,
      order,
      category,
      isActive
    } = req.body;

    const updateData = {};
    if (stepId !== undefined) updateData.stepId = stepId;
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (icon !== undefined) updateData.icon = icon;
    if (videoUrl !== undefined) updateData.videoUrl = videoUrl;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (ctaText !== undefined) updateData.ctaText = ctaText;
    if (ctaUrl !== undefined) updateData.ctaUrl = ctaUrl;
    if (prerequisiteSteps !== undefined) updateData.prerequisiteSteps = prerequisiteSteps;
    if (requiredForGoals !== undefined) updateData.requiredForGoals = requiredForGoals;
    if (completionAction !== undefined) updateData.completionAction = completionAction;
    if (order !== undefined) updateData.order = order;
    if (category !== undefined) updateData.category = category;
    if (isActive !== undefined) updateData.isActive = isActive;

    const step = await prisma.onboardingStep.update({
      where: { id: req.params.id },
      data: updateData
    });

    res.json(step);
  } catch (error) {
    console.error('Update step error:', error);
    res.status(500).json({ error: 'Failed to update step' });
  }
});

// Delete onboarding step
router.delete('/admin/steps/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    await prisma.onboardingStep.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Step deleted successfully' });
  } catch (error) {
    console.error('Delete step error:', error);
    res.status(500).json({ error: 'Failed to delete step' });
  }
});

// ============================================
// ADMIN ENDPOINTS - Quick Wins
// ============================================

// Get all quick wins (admin)
router.get('/admin/quick-wins', authenticate, requireAdmin, async (req, res) => {
  try {
    const quickWins = await prisma.quickWin.findMany({
      orderBy: { order: 'asc' }
    });

    res.json(quickWins);
  } catch (error) {
    console.error('Admin get quick wins error:', error);
    res.status(500).json({ error: 'Failed to get quick wins' });
  }
});

// Create quick win
router.post('/admin/quick-wins', authenticate, requireAdmin, async (req, res) => {
  try {
    const {
      title,
      description,
      icon,
      relatedGoal,
      actionUrl,
      actionType,
      actionText,
      rewardPoints,
      rewardBadge,
      estimatedTime,
      difficulty,
      order
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    const quickWin = await prisma.quickWin.create({
      data: {
        title,
        description,
        icon,
        relatedGoal,
        actionUrl,
        actionType,
        actionText,
        rewardPoints: rewardPoints || 0,
        rewardBadge,
        estimatedTime,
        difficulty,
        order: order || 0
      }
    });

    res.json(quickWin);
  } catch (error) {
    console.error('Create quick win error:', error);
    res.status(500).json({ error: 'Failed to create quick win' });
  }
});

// Update quick win
router.patch('/admin/quick-wins/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const {
      title,
      description,
      icon,
      relatedGoal,
      actionUrl,
      actionType,
      actionText,
      rewardPoints,
      rewardBadge,
      estimatedTime,
      difficulty,
      order
    } = req.body;

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (icon !== undefined) updateData.icon = icon;
    if (relatedGoal !== undefined) updateData.relatedGoal = relatedGoal;
    if (actionUrl !== undefined) updateData.actionUrl = actionUrl;
    if (actionType !== undefined) updateData.actionType = actionType;
    if (actionText !== undefined) updateData.actionText = actionText;
    if (rewardPoints !== undefined) updateData.rewardPoints = rewardPoints;
    if (rewardBadge !== undefined) updateData.rewardBadge = rewardBadge;
    if (estimatedTime !== undefined) updateData.estimatedTime = estimatedTime;
    if (difficulty !== undefined) updateData.difficulty = difficulty;
    if (order !== undefined) updateData.order = order;

    const quickWin = await prisma.quickWin.update({
      where: { id: req.params.id },
      data: updateData
    });

    res.json(quickWin);
  } catch (error) {
    console.error('Update quick win error:', error);
    res.status(500).json({ error: 'Failed to update quick win' });
  }
});

// Delete quick win
router.delete('/admin/quick-wins/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    await prisma.quickWin.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Quick win deleted successfully' });
  } catch (error) {
    console.error('Delete quick win error:', error);
    res.status(500).json({ error: 'Failed to delete quick win' });
  }
});

// ============================================
// ADMIN ENDPOINTS - Analytics
// ============================================

// Get onboarding analytics
router.get('/admin/analytics', authenticate, requireAdmin, async (req, res) => {
  try {
    // Get overall stats
    const totalUsers = await prisma.user.count();
    const usersWithProgress = await prisma.onboardingProgress.count();
    const completedOnboarding = await prisma.onboardingProgress.count({
      where: { progressPercent: 100 }
    });
    const skippedOnboarding = await prisma.onboardingProgress.count({
      where: { skipOnboarding: true }
    });

    // Get milestone completion stats
    const milestones = await prisma.onboardingProgress.groupBy({
      by: ['hasCompletedWelcome', 'hasCompletedTour', 'hasSeenQuickWins'],
      _count: true
    });

    // Get goal distribution
    const goalDistribution = await prisma.onboardingProgress.groupBy({
      by: ['primaryGoal'],
      _count: true
    });

    // Get average progress
    const avgProgress = await prisma.onboardingProgress.aggregate({
      _avg: { progressPercent: true }
    });

    // Get quick win completion stats
    const totalQuickWins = await prisma.quickWin.count();
    const completedQuickWins = await prisma.userQuickWin.count({
      where: { completed: true }
    });

    // Get tutorial stats
    const tutorialViews = await prisma.tutorialProgress.count();
    const completedTutorials = await prisma.tutorialProgress.count({
      where: { completed: true }
    });

    res.json({
      overview: {
        totalUsers,
        usersWithProgress,
        completedOnboarding,
        skippedOnboarding,
        onboardingRate: totalUsers > 0 ? ((usersWithProgress / totalUsers) * 100).toFixed(1) : 0,
        completionRate: usersWithProgress > 0 ? ((completedOnboarding / usersWithProgress) * 100).toFixed(1) : 0,
        averageProgress: avgProgress._avg.progressPercent || 0
      },
      milestones,
      goalDistribution,
      quickWins: {
        total: totalQuickWins,
        completed: completedQuickWins,
        completionRate: totalQuickWins > 0 ? ((completedQuickWins / totalQuickWins) * 100).toFixed(1) : 0
      },
      tutorials: {
        views: tutorialViews,
        completed: completedTutorials,
        completionRate: tutorialViews > 0 ? ((completedTutorials / tutorialViews) * 100).toFixed(1) : 0
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Failed to get analytics' });
  }
});

export default router;
