/**
 * SUPERNova AI Business Advisor - Goal Service
 *
 * Manages strategic goals:
 * - Goal creation and tracking
 * - AI-powered strategy generation
 * - Milestone management
 * - Progress tracking
 * - Goal recommendations
 */

import wixData from 'wix-data';
import { getBusinessDataSummary } from './businessProfileService';

// ============================================================================
// Configuration
// ============================================================================

const COLLECTIONS = {
  STRATEGIC_GOALS: 'StrategicGoals'
};

const GOAL_STATUS = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  ACHIEVED: 'achieved',
  AT_RISK: 'at_risk',
  ABANDONED: 'abandoned'
};

const CATEGORIES = {
  REVENUE: 'revenue',
  GROWTH: 'growth',
  MARKETING: 'marketing',
  PRODUCT: 'product',
  OPERATIONS: 'operations',
  CUSTOMER: 'customer'
};

// ============================================================================
// Goal CRUD
// ============================================================================

/**
 * Create a new goal
 * @param {string} userId - User ID
 * @param {Object} goalData - Goal data
 * @returns {Promise<Object>} Created goal
 */
export async function createGoal(userId, goalData) {
  try {
    const now = new Date();

    // Generate AI strategy for this goal
    const aiStrategy = await generateGoalStrategy(userId, goalData);

    const goal = {
      userId,
      goal: goalData.goal,
      description: goalData.description || '',
      category: goalData.category || CATEGORIES.REVENUE,
      targetValue: goalData.targetValue || 0,
      currentValue: goalData.currentValue || 0,
      targetDate: goalData.targetDate ? new Date(goalData.targetDate) : null,
      progress: 0,
      keyMetrics: goalData.keyMetrics || [],
      milestones: goalData.milestones || [],
      status: GOAL_STATUS.NOT_STARTED,
      aiStrategy: aiStrategy.strategy,
      aiRecommendations: aiStrategy.recommendations,
      projectedAchievement: aiStrategy.projectedDate,
      obstacles: [],
      actionItems: aiStrategy.actionItems || [],
      whyImportant: goalData.whyImportant || '',
      achievedAt: null,
      createdAt: now,
      updatedAt: now
    };

    const created = await wixData.insert(COLLECTIONS.STRATEGIC_GOALS, goal);
    return created;
  } catch (error) {
    console.error('Error creating goal:', error);
    throw new Error(`Failed to create goal: ${error.message}`);
  }
}

/**
 * Update goal
 * @param {string} goalId - Goal ID
 * @param {Object} updates - Updates
 * @returns {Promise<Object>} Updated goal
 */
export async function updateGoal(goalId, updates) {
  try {
    const goal = await wixData.get(COLLECTIONS.STRATEGIC_GOALS, goalId);

    const updatedGoal = {
      ...goal,
      ...updates,
      updatedAt: new Date()
    };

    // Recalculate progress if values changed
    if (updates.currentValue !== undefined || updates.targetValue !== undefined) {
      updatedGoal.progress = calculateProgress(
        updates.currentValue !== undefined ? updates.currentValue : goal.currentValue,
        updates.targetValue !== undefined ? updates.targetValue : goal.targetValue
      );
    }

    // Update status based on progress and dates
    updatedGoal.status = determineGoalStatus(updatedGoal);

    // Mark as achieved if progress is 100%
    if (updatedGoal.progress >= 100 && !updatedGoal.achievedAt) {
      updatedGoal.achievedAt = new Date();
      updatedGoal.status = GOAL_STATUS.ACHIEVED;
    }

    const result = await wixData.update(COLLECTIONS.STRATEGIC_GOALS, updatedGoal);
    return result;
  } catch (error) {
    console.error('Error updating goal:', error);
    throw new Error(`Failed to update goal: ${error.message}`);
  }
}

/**
 * Delete goal
 * @param {string} goalId - Goal ID
 * @returns {Promise<void>}
 */
export async function deleteGoal(goalId) {
  try {
    await wixData.remove(COLLECTIONS.STRATEGIC_GOALS, goalId);
  } catch (error) {
    console.error('Error deleting goal:', error);
    throw error;
  }
}

/**
 * Get a single goal
 * @param {string} goalId - Goal ID
 * @returns {Promise<Object>} Goal
 */
export async function getGoal(goalId) {
  try {
    const goal = await wixData.get(COLLECTIONS.STRATEGIC_GOALS, goalId);
    return goal;
  } catch (error) {
    console.error('Error getting goal:', error);
    throw error;
  }
}

/**
 * Get all goals for a user
 * @param {string} userId - User ID
 * @param {Object} filters - Filter options
 * @returns {Promise<Array>} Goals
 */
export async function getGoals(userId, filters = {}) {
  try {
    let query = wixData.query(COLLECTIONS.STRATEGIC_GOALS)
      .eq('userId', userId);

    if (filters.category) {
      query = query.eq('category', filters.category);
    }

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    query = query.descending('createdAt');

    const results = await query.find();
    return results.items;
  } catch (error) {
    console.error('Error getting goals:', error);
    throw error;
  }
}

/**
 * Get active goals
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Active goals
 */
export async function getActiveGoals(userId) {
  try {
    return await getGoals(userId, { status: GOAL_STATUS.IN_PROGRESS });
  } catch (error) {
    console.error('Error getting active goals:', error);
    throw error;
  }
}

// ============================================================================
// Progress Tracking
// ============================================================================

/**
 * Update goal progress
 * @param {string} goalId - Goal ID
 * @param {number} currentValue - Current value
 * @returns {Promise<Object>} Updated goal
 */
export async function updateProgress(goalId, currentValue) {
  try {
    return await updateGoal(goalId, { currentValue });
  } catch (error) {
    console.error('Error updating progress:', error);
    throw error;
  }
}

/**
 * Calculate progress percentage
 * @param {number} currentValue - Current value
 * @param {number} targetValue - Target value
 * @returns {number} Progress percentage (0-100)
 */
function calculateProgress(currentValue, targetValue) {
  if (targetValue === 0) return 0;
  const progress = (currentValue / targetValue) * 100;
  return Math.min(100, Math.max(0, Math.round(progress)));
}

/**
 * Determine goal status
 * @param {Object} goal - Goal object
 * @returns {string} Status
 */
function determineGoalStatus(goal) {
  // Already achieved
  if (goal.achievedAt) {
    return GOAL_STATUS.ACHIEVED;
  }

  // Abandoned
  if (goal.status === GOAL_STATUS.ABANDONED) {
    return GOAL_STATUS.ABANDONED;
  }

  // Check if at risk (past target date with low progress)
  if (goal.targetDate) {
    const now = new Date();
    const target = new Date(goal.targetDate);

    if (now > target && goal.progress < 100) {
      return GOAL_STATUS.AT_RISK;
    }
  }

  // In progress if any progress made
  if (goal.progress > 0) {
    return GOAL_STATUS.IN_PROGRESS;
  }

  // Not started
  return GOAL_STATUS.NOT_STARTED;
}

// ============================================================================
// Milestones
// ============================================================================

/**
 * Add milestone to goal
 * @param {string} goalId - Goal ID
 * @param {Object} milestone - Milestone data
 * @returns {Promise<Object>} Updated goal
 */
export async function addMilestone(goalId, milestone) {
  try {
    const goal = await getGoal(goalId);
    const milestones = goal.milestones || [];

    milestones.push({
      title: milestone.title,
      description: milestone.description || '',
      targetDate: milestone.targetDate ? new Date(milestone.targetDate) : null,
      targetValue: milestone.targetValue || 0,
      completed: false,
      completedAt: null,
      createdAt: new Date()
    });

    return await updateGoal(goalId, { milestones });
  } catch (error) {
    console.error('Error adding milestone:', error);
    throw error;
  }
}

/**
 * Complete milestone
 * @param {string} goalId - Goal ID
 * @param {number} milestoneIndex - Milestone index
 * @returns {Promise<Object>} Updated goal
 */
export async function completeMilestone(goalId, milestoneIndex) {
  try {
    const goal = await getGoal(goalId);
    const milestones = goal.milestones || [];

    if (milestoneIndex < 0 || milestoneIndex >= milestones.length) {
      throw new Error('Invalid milestone index');
    }

    milestones[milestoneIndex].completed = true;
    milestones[milestoneIndex].completedAt = new Date();

    return await updateGoal(goalId, { milestones });
  } catch (error) {
    console.error('Error completing milestone:', error);
    throw error;
  }
}

// ============================================================================
// AI Strategy Generation
// ============================================================================

/**
 * Generate AI-powered strategy for a goal
 * @param {string} userId - User ID
 * @param {Object} goalData - Goal data
 * @returns {Promise<Object>} Strategy object
 */
async function generateGoalStrategy(userId, goalData) {
  try {
    const businessData = await getBusinessDataSummary(userId);

    // This is a simplified version - in production, this would call Claude API
    // For now, generating basic strategy based on goal type

    const strategy = {
      strategy: '',
      recommendations: [],
      actionItems: [],
      projectedDate: null
    };

    const currentValue = goalData.currentValue || 0;
    const targetValue = goalData.targetValue || 0;
    const gap = targetValue - currentValue;

    // Revenue goal
    if (goalData.category === CATEGORIES.REVENUE || goalData.goal.toLowerCase().includes('revenue')) {
      strategy.strategy = `To reach £${targetValue.toLocaleString()}/month from £${currentValue.toLocaleString()}/month, you need to increase revenue by £${gap.toLocaleString()}/month (${Math.round((gap / currentValue) * 100)}% growth).`;

      strategy.recommendations = [
        {
          title: 'Increase Average Order Value',
          description: 'Add upsells and cross-sells to increase revenue per customer',
          impact: 'Could increase revenue by 15-30%',
          effort: 'Low'
        },
        {
          title: 'Acquire More Customers',
          description: 'Scale marketing efforts in proven channels',
          impact: 'Direct impact on revenue',
          effort: 'Medium'
        },
        {
          title: 'Optimize Pricing',
          description: 'Test price increases on best-selling products',
          impact: 'Could increase revenue by 10-20%',
          effort: 'Low'
        },
        {
          title: 'Launch New Product/Service',
          description: 'Add complementary offering to existing customers',
          impact: 'New revenue stream',
          effort: 'High'
        }
      ];

      strategy.actionItems = [
        { task: 'Analyze current revenue sources', completed: false },
        { task: 'Identify highest-leverage opportunities', completed: false },
        { task: 'Test price increase on top product', completed: false },
        { task: 'Set up upsell sequence', completed: false },
        { task: 'Increase marketing spend on best channel', completed: false }
      ];

      // Estimate timeline based on current growth rate
      if (businessData.revenue?.growth > 0) {
        const monthsToGoal = Math.log(targetValue / currentValue) / Math.log(1 + businessData.revenue.growth / 100);
        strategy.projectedDate = new Date();
        strategy.projectedDate.setMonth(strategy.projectedDate.getMonth() + Math.ceil(monthsToGoal));
      }
    }

    // Growth goal
    else if (goalData.category === CATEGORIES.GROWTH) {
      strategy.strategy = `To achieve this growth target, focus on scalable acquisition channels and retention optimization.`;

      strategy.recommendations = [
        {
          title: 'Scale Winning Channels',
          description: 'Double down on marketing channels with best ROI',
          impact: 'Predictable growth',
          effort: 'Medium'
        },
        {
          title: 'Improve Retention',
          description: 'Reduce churn to compound growth',
          impact: 'Accelerates growth rate',
          effort: 'Medium'
        },
        {
          title: 'Expand Market',
          description: 'Enter new customer segments or geographies',
          impact: 'New growth vector',
          effort: 'High'
        }
      ];

      strategy.actionItems = [
        { task: 'Audit all growth channels', completed: false },
        { task: 'Calculate LTV:CAC for each channel', completed: false },
        { task: 'Implement retention program', completed: false },
        { task: 'Test new acquisition channels', completed: false }
      ];
    }

    // Marketing goal
    else if (goalData.category === CATEGORIES.MARKETING) {
      strategy.strategy = `Focus on high-leverage marketing activities that drive measurable results.`;

      strategy.recommendations = [
        {
          title: 'Content Marketing',
          description: 'Create valuable content to attract organic traffic',
          impact: 'Long-term traffic growth',
          effort: 'Medium'
        },
        {
          title: 'Email Marketing',
          description: 'Build and nurture email list',
          impact: 'Highest ROI channel',
          effort: 'Low'
        },
        {
          title: 'Paid Advertising',
          description: 'Scale paid channels with positive ROAS',
          impact: 'Fast, scalable growth',
          effort: 'Medium'
        }
      ];

      strategy.actionItems = [
        { task: 'Define target audience clearly', completed: false },
        { task: 'Create content calendar', completed: false },
        { task: 'Set up email automation', completed: false },
        { task: 'Test ad campaigns', completed: false }
      ];
    }

    // Customer goal
    else if (goalData.category === CATEGORIES.CUSTOMER) {
      strategy.strategy = `Improve customer experience and satisfaction to drive retention and referrals.`;

      strategy.recommendations = [
        {
          title: 'Customer Onboarding',
          description: 'Create exceptional first experience',
          impact: 'Reduces early churn',
          effort: 'Medium'
        },
        {
          title: 'Support Excellence',
          description: 'Provide fast, helpful customer support',
          impact: 'Increases satisfaction and referrals',
          effort: 'Medium'
        },
        {
          title: 'Customer Success Program',
          description: 'Proactively help customers succeed',
          impact: 'Increases LTV and reduces churn',
          effort: 'High'
        }
      ];

      strategy.actionItems = [
        { task: 'Survey customers for feedback', completed: false },
        { task: 'Create onboarding checklist', completed: false },
        { task: 'Set up NPS tracking', completed: false },
        { task: 'Implement loyalty program', completed: false }
      ];
    }

    return strategy;
  } catch (error) {
    console.error('Error generating goal strategy:', error);
    return {
      strategy: 'Unable to generate strategy at this time.',
      recommendations: [],
      actionItems: [],
      projectedDate: null
    };
  }
}

/**
 * Refresh goal strategy (regenerate based on current data)
 * @param {string} goalId - Goal ID
 * @returns {Promise<Object>} Updated goal
 */
export async function refreshGoalStrategy(goalId) {
  try {
    const goal = await getGoal(goalId);
    const aiStrategy = await generateGoalStrategy(goal.userId, goal);

    return await updateGoal(goalId, {
      aiStrategy: aiStrategy.strategy,
      aiRecommendations: aiStrategy.recommendations,
      projectedAchievement: aiStrategy.projectedDate
    });
  } catch (error) {
    console.error('Error refreshing goal strategy:', error);
    throw error;
  }
}

// ============================================================================
// Action Items
// ============================================================================

/**
 * Add action item to goal
 * @param {string} goalId - Goal ID
 * @param {string} task - Action item task
 * @returns {Promise<Object>} Updated goal
 */
export async function addActionItem(goalId, task) {
  try {
    const goal = await getGoal(goalId);
    const actionItems = goal.actionItems || [];

    actionItems.push({
      task,
      completed: false,
      completedAt: null,
      createdAt: new Date()
    });

    return await updateGoal(goalId, { actionItems });
  } catch (error) {
    console.error('Error adding action item:', error);
    throw error;
  }
}

/**
 * Complete action item
 * @param {string} goalId - Goal ID
 * @param {number} actionIndex - Action item index
 * @returns {Promise<Object>} Updated goal
 */
export async function completeActionItem(goalId, actionIndex) {
  try {
    const goal = await getGoal(goalId);
    const actionItems = goal.actionItems || [];

    if (actionIndex < 0 || actionIndex >= actionItems.length) {
      throw new Error('Invalid action item index');
    }

    actionItems[actionIndex].completed = true;
    actionItems[actionIndex].completedAt = new Date();

    return await updateGoal(goalId, { actionItems });
  } catch (error) {
    console.error('Error completing action item:', error);
    throw error;
  }
}

// ============================================================================
// Obstacles
// ============================================================================

/**
 * Add obstacle to goal
 * @param {string} goalId - Goal ID
 * @param {Object} obstacle - Obstacle data
 * @returns {Promise<Object>} Updated goal
 */
export async function addObstacle(goalId, obstacle) {
  try {
    const goal = await getGoal(goalId);
    const obstacles = goal.obstacles || [];

    obstacles.push({
      description: obstacle.description,
      severity: obstacle.severity || 'medium', // low, medium, high
      solution: obstacle.solution || '',
      resolved: false,
      resolvedAt: null,
      createdAt: new Date()
    });

    return await updateGoal(goalId, { obstacles });
  } catch (error) {
    console.error('Error adding obstacle:', error);
    throw error;
  }
}

/**
 * Resolve obstacle
 * @param {string} goalId - Goal ID
 * @param {number} obstacleIndex - Obstacle index
 * @returns {Promise<Object>} Updated goal
 */
export async function resolveObstacle(goalId, obstacleIndex) {
  try {
    const goal = await getGoal(goalId);
    const obstacles = goal.obstacles || [];

    if (obstacleIndex < 0 || obstacleIndex >= obstacles.length) {
      throw new Error('Invalid obstacle index');
    }

    obstacles[obstacleIndex].resolved = true;
    obstacles[obstacleIndex].resolvedAt = new Date();

    return await updateGoal(goalId, { obstacles });
  } catch (error) {
    console.error('Error resolving obstacle:', error);
    throw error;
  }
}

// ============================================================================
// Goal Analytics
// ============================================================================

/**
 * Get goal analytics for user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Goal analytics
 */
export async function getGoalAnalytics(userId) {
  try {
    const allGoals = await getGoals(userId);

    const analytics = {
      total: allGoals.length,
      active: 0,
      achieved: 0,
      atRisk: 0,
      notStarted: 0,
      abandoned: 0,
      averageProgress: 0,
      completionRate: 0,
      byCategory: {}
    };

    let totalProgress = 0;

    allGoals.forEach(goal => {
      // Count by status
      switch (goal.status) {
        case GOAL_STATUS.IN_PROGRESS:
          analytics.active++;
          break;
        case GOAL_STATUS.ACHIEVED:
          analytics.achieved++;
          break;
        case GOAL_STATUS.AT_RISK:
          analytics.atRisk++;
          break;
        case GOAL_STATUS.NOT_STARTED:
          analytics.notStarted++;
          break;
        case GOAL_STATUS.ABANDONED:
          analytics.abandoned++;
          break;
      }

      // Sum progress
      totalProgress += goal.progress || 0;

      // Count by category
      const category = goal.category || 'other';
      if (!analytics.byCategory[category]) {
        analytics.byCategory[category] = 0;
      }
      analytics.byCategory[category]++;
    });

    // Calculate averages
    if (allGoals.length > 0) {
      analytics.averageProgress = Math.round(totalProgress / allGoals.length);

      const completedGoals = allGoals.filter(g => g.status === GOAL_STATUS.ACHIEVED).length;
      analytics.completionRate = Math.round((completedGoals / allGoals.length) * 100);
    }

    return analytics;
  } catch (error) {
    console.error('Error getting goal analytics:', error);
    throw error;
  }
}

export default {
  createGoal,
  updateGoal,
  deleteGoal,
  getGoal,
  getGoals,
  getActiveGoals,
  updateProgress,
  addMilestone,
  completeMilestone,
  refreshGoalStrategy,
  addActionItem,
  completeActionItem,
  addObstacle,
  resolveObstacle,
  getGoalAnalytics
};
