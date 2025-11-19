/**
 * SUPERNova AI Business Advisor - Insight Service
 *
 * Manages business insights:
 * - Generate AI-powered insights
 * - Priority recommendations
 * - Pattern recognition
 * - Anomaly detection
 * - Opportunity identification
 */

import wixData from 'wix-data';
import { getBusinessDataSummary } from './businessProfileService';
import { getCurrentHealthScore } from './businessHealthService';

// ============================================================================
// Configuration
// ============================================================================

const COLLECTIONS = {
  BUSINESS_INSIGHTS: 'BusinessInsights'
};

const PRIORITIES = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low'
};

const CATEGORIES = {
  REVENUE: 'revenue',
  MARKETING: 'marketing',
  PRODUCT: 'product',
  OPERATIONS: 'operations',
  GROWTH: 'growth',
  RISK: 'risk',
  CUSTOMER: 'customer'
};

// ============================================================================
// Insight Generation
// ============================================================================

/**
 * Generate insights for a user's business
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Generated insights
 */
export async function generateInsights(userId) {
  try {
    const businessData = await getBusinessDataSummary(userId);
    const healthScore = await getCurrentHealthScore(userId);

    if (!businessData) {
      throw new Error('No business data available');
    }

    const insights = [];

    // Run various analysis functions
    insights.push(...await analyzeRevenue(userId, businessData));
    insights.push(...await analyzeMarketing(userId, businessData));
    insights.push(...await analyzeCustomers(userId, businessData));
    insights.push(...await analyzeGrowth(userId, businessData));
    insights.push(...await detectAnomalies(userId, businessData));
    insights.push(...await identifyOpportunities(userId, businessData));
    insights.push(...await detectRisks(userId, businessData));

    // Save insights to database
    const savedInsights = [];
    for (const insight of insights) {
      const saved = await createInsight(userId, insight);
      savedInsights.push(saved);
    }

    return savedInsights;
  } catch (error) {
    console.error('Error generating insights:', error);
    throw new Error(`Failed to generate insights: ${error.message}`);
  }
}

/**
 * Analyze revenue trends
 * @param {string} userId - User ID
 * @param {Object} businessData - Business data
 * @returns {Promise<Array>} Revenue insights
 */
async function analyzeRevenue(userId, businessData) {
  const insights = [];
  const revenue = businessData.revenue || {};
  const profile = businessData.profile || {};

  // Revenue vs target
  if (profile.targetRevenue > 0) {
    const currentRevenue = revenue.current || profile.monthlyRevenue || 0;
    const targetRevenue = profile.targetRevenue;
    const percentage = (currentRevenue / targetRevenue) * 100;

    if (percentage < 50) {
      insights.push({
        category: CATEGORIES.REVENUE,
        priority: PRIORITIES.CRITICAL,
        title: `Revenue at ${Math.round(percentage)}% of target`,
        insight: `Your current monthly revenue of £${currentRevenue.toLocaleString()} is significantly below your target of £${targetRevenue.toLocaleString()}.`,
        recommendation: `Focus on increasing revenue through: 1) Price optimization, 2) New customer acquisition, 3) Upselling existing customers, 4) Launching new products/services.`,
        expectedImpact: `Could increase revenue by £${Math.round((targetRevenue - currentRevenue) * 0.3).toLocaleString()}/month with focused effort`,
        effort: 'high',
        dataSource: 'Business profile and revenue data',
        estimatedRevenue: Math.round((targetRevenue - currentRevenue) * 0.3)
      });
    } else if (percentage >= 90 && percentage < 100) {
      insights.push({
        category: CATEGORIES.REVENUE,
        priority: PRIORITIES.HIGH,
        title: 'Almost at revenue target!',
        insight: `You're at ${Math.round(percentage)}% of your monthly revenue target. Just £${Math.round(targetRevenue - currentRevenue).toLocaleString()} to go!`,
        recommendation: `Run a limited-time promotion, launch an upsell, or increase outreach to push over the target this month.`,
        expectedImpact: `Hitting your target would be a major psychological win and build momentum`,
        effort: 'low',
        dataSource: 'Business profile and revenue data',
        estimatedRevenue: targetRevenue - currentRevenue
      });
    }
  }

  // Revenue trend
  if (revenue.trend === 'declining') {
    insights.push({
      category: CATEGORIES.REVENUE,
      priority: PRIORITIES.CRITICAL,
      title: 'Revenue is declining',
      insight: `Your revenue has been declining over recent periods.`,
      recommendation: `Investigate the cause: 1) Check if traffic has dropped, 2) Analyze conversion rates, 3) Review customer feedback, 4) Assess competitor activity.`,
      expectedImpact: `Identifying and fixing the root cause could reverse the decline`,
      effort: 'medium',
      dataSource: 'Revenue trend analysis'
    });
  }

  return insights;
}

/**
 * Analyze marketing effectiveness
 * @param {string} userId - User ID
 * @param {Object} businessData - Business data
 * @returns {Promise<Array>} Marketing insights
 */
async function analyzeMarketing(userId, businessData) {
  const insights = [];
  const marketing = businessData.marketing || {};

  // Low conversion rate
  if (marketing.conversionRate > 0 && marketing.conversionRate < 2) {
    insights.push({
      category: CATEGORIES.MARKETING,
      priority: PRIORITIES.HIGH,
      title: `Conversion rate is low at ${marketing.conversionRate.toFixed(1)}%`,
      insight: `Your website conversion rate of ${marketing.conversionRate.toFixed(1)}% is below the industry average of 2-3%.`,
      recommendation: `Optimize your: 1) Landing pages (clear CTAs, better copy), 2) Checkout process (reduce friction), 3) Trust signals (testimonials, guarantees), 4) Pricing presentation.`,
      expectedImpact: `Increasing to 3% could double your sales from the same traffic`,
      effort: 'medium',
      dataSource: 'Marketing analytics'
    });
  }

  // Negative ROAS
  if (marketing.roas > 0 && marketing.roas < 1) {
    insights.push({
      category: CATEGORIES.MARKETING,
      priority: PRIORITIES.CRITICAL,
      title: 'Losing money on advertising',
      insight: `Your Return on Ad Spend is ${marketing.roas.toFixed(2)}x - you're losing money on every ad pound spent.`,
      recommendation: `PAUSE your ads immediately and: 1) Review targeting, 2) Improve ad creative, 3) Optimize landing pages, 4) Increase prices if margins are too thin.`,
      expectedImpact: `Fixing this could save £${Math.round(marketing.adSpend * (1 - marketing.roas)).toLocaleString()}/month`,
      effort: 'high',
      dataSource: 'Advertising performance data',
      estimatedRevenue: Math.round(marketing.adSpend * (1 - marketing.roas))
    });
  }

  // High traffic, low conversions
  if (marketing.websiteVisitors > 1000 && marketing.conversionRate < 1) {
    insights.push({
      category: CATEGORIES.MARKETING,
      priority: PRIORITIES.HIGH,
      title: 'Lots of traffic but poor conversions',
      insight: `You're getting ${marketing.websiteVisitors.toLocaleString()} monthly visitors but only converting ${marketing.conversionRate.toFixed(1)}%.`,
      recommendation: `This is a HUGE opportunity. Focus on conversion optimization before spending on more traffic. Test: 1) Different headlines, 2) Stronger CTAs, 3) Better product descriptions, 4) Social proof.`,
      expectedImpact: `Doubling conversion rate = doubling revenue with no extra traffic cost`,
      effort: 'medium',
      dataSource: 'Website analytics and conversion data'
    });
  }

  return insights;
}

/**
 * Analyze customer metrics
 * @param {string} userId - User ID
 * @param {Object} businessData - Business data
 * @returns {Promise<Array>} Customer insights
 */
async function analyzeCustomers(userId, businessData) {
  const insights = [];
  const customers = businessData.customers || {};

  // High churn rate
  if (customers.churnRate > 10) {
    insights.push({
      category: CATEGORIES.CUSTOMER,
      priority: PRIORITIES.CRITICAL,
      title: `Customer churn rate is ${customers.churnRate}%`,
      insight: `You're losing ${customers.churnRate}% of customers - this is unsustainable for growth.`,
      recommendation: `Implement: 1) Exit surveys to understand why, 2) Onboarding improvements, 3) Regular check-ins, 4) Loyalty/retention incentives.`,
      expectedImpact: `Reducing churn to 5% could save significant revenue and growth potential`,
      effort: 'high',
      dataSource: 'Customer retention data'
    });
  }

  // Poor LTV:CAC ratio
  if (customers.ltv > 0 && customers.acquisitionCost > 0) {
    const ratio = customers.ltv / customers.acquisitionCost;

    if (ratio < 2) {
      insights.push({
        category: CATEGORIES.CUSTOMER,
        priority: PRIORITIES.CRITICAL,
        title: 'Customer economics are unhealthy',
        insight: `Your LTV:CAC ratio is ${ratio.toFixed(1)}:1. You need at least 3:1 for a sustainable business.`,
        recommendation: `Either: 1) Increase lifetime value (upsells, retention), 2) Reduce acquisition cost (better targeting, organic channels), 3) Increase prices.`,
        expectedImpact: `Critical for long-term profitability`,
        effort: 'high',
        dataSource: 'Customer economics data'
      });
    }
  }

  return insights;
}

/**
 * Analyze growth trends
 * @param {string} userId - User ID
 * @param {Object} businessData - Business data
 * @returns {Promise<Array>} Growth insights
 */
async function analyzeGrowth(userId, businessData) {
  const insights = [];
  const revenue = businessData.revenue || {};

  // Strong growth
  if (revenue.growth > 20) {
    insights.push({
      category: CATEGORIES.GROWTH,
      priority: PRIORITIES.MEDIUM,
      title: `Exceptional growth of ${revenue.growth}%`,
      insight: `Your business is growing ${revenue.growth}% - this is outstanding!`,
      recommendation: `Document what's working so you can replicate it. Consider: 1) Doubling down on successful channels, 2) Hiring to scale, 3) Raising prices (high demand).`,
      expectedImpact: `Maintaining this growth rate could 10x your business in 18 months`,
      effort: 'low',
      dataSource: 'Revenue growth analysis'
    });
  }

  // Stagnant growth
  if (revenue.growth >= 0 && revenue.growth < 3) {
    insights.push({
      category: CATEGORIES.GROWTH,
      priority: PRIORITIES.HIGH,
      title: 'Growth has stalled',
      insight: `Your business is only growing ${revenue.growth}% - essentially flat.`,
      recommendation: `Try new growth experiments: 1) New marketing channels, 2) Product launches, 3) Partnerships, 4) Geographic expansion.`,
      expectedImpact: `Getting to 10% growth could significantly improve business trajectory`,
      effort: 'high',
      dataSource: 'Revenue growth analysis'
    });
  }

  return insights;
}

/**
 * Detect anomalies in business data
 * @param {string} userId - User ID
 * @param {Object} businessData - Business data
 * @returns {Promise<Array>} Anomaly insights
 */
async function detectAnomalies(userId, businessData) {
  const insights = [];

  // This would use more sophisticated anomaly detection in production
  // For now, checking for obvious red flags

  const marketing = businessData.marketing || {};
  const customers = businessData.customers || {};

  // Traffic but no conversions
  if (marketing.websiteVisitors > 500 && marketing.conversionRate === 0) {
    insights.push({
      category: CATEGORIES.RISK,
      priority: PRIORITIES.CRITICAL,
      title: 'Zero conversions despite traffic',
      insight: `You have ${marketing.websiteVisitors} visitors but 0% conversion rate.`,
      recommendation: `URGENT: Check if your checkout is broken, payment processor is working, and forms are functional.`,
      expectedImpact: `Could be losing significant revenue to technical issues`,
      effort: 'low',
      dataSource: 'Website analytics'
    });
  }

  return insights;
}

/**
 * Identify opportunities
 * @param {string} userId - User ID
 * @param {Object} businessData - Business data
 * @returns {Promise<Array>} Opportunity insights
 */
async function identifyOpportunities(userId, businessData) {
  const insights = [];
  const marketing = businessData.marketing || {};
  const profile = businessData.profile || {};

  // Email list but not using it
  if (marketing.emailSubscribers > 500 && !marketing.emailActive) {
    insights.push({
      category: CATEGORIES.MARKETING,
      priority: PRIORITIES.HIGH,
      title: 'Untapped email list opportunity',
      insight: `You have ${marketing.emailSubscribers.toLocaleString()} email subscribers but aren't actively emailing them.`,
      recommendation: `Start a weekly email: 1) Share valuable content, 2) Promote products/services, 3) Build relationships. Email marketing has highest ROI of all channels.`,
      expectedImpact: `Could generate £${Math.round(marketing.emailSubscribers * 0.5).toLocaleString()}+ in sales per campaign`,
      effort: 'low',
      dataSource: 'Email marketing data',
      estimatedRevenue: Math.round(marketing.emailSubscribers * 0.5)
    });
  }

  return insights;
}

/**
 * Detect risks
 * @param {string} userId - User ID
 * @param {Object} businessData - Business data
 * @returns {Promise<Array>} Risk insights
 */
async function detectRisks(userId, businessData) {
  const insights = [];
  const revenue = businessData.revenue || {};
  const customers = businessData.customers || {};

  // Single customer concentration
  if (customers.topCustomerPercentage > 30) {
    insights.push({
      category: CATEGORIES.RISK,
      priority: PRIORITIES.HIGH,
      title: 'High customer concentration risk',
      insight: `Your top customer represents ${customers.topCustomerPercentage}% of revenue - this is risky.`,
      recommendation: `Diversify your customer base: 1) Acquire more customers, 2) Reduce dependence on any single client, 3) Have backup plans if they churn.`,
      expectedImpact: `Protects business from catastrophic revenue loss`,
      effort: 'high',
      dataSource: 'Customer revenue analysis'
    });
  }

  return insights;
}

// ============================================================================
// Insight CRUD
// ============================================================================

/**
 * Create a new insight
 * @param {string} userId - User ID
 * @param {Object} insightData - Insight data
 * @returns {Promise<Object>} Created insight
 */
export async function createInsight(userId, insightData) {
  try {
    const now = new Date();
    const validUntil = new Date(now);
    validUntil.setDate(validUntil.getDate() + 30); // Valid for 30 days

    const insight = {
      userId,
      category: insightData.category,
      priority: insightData.priority,
      title: insightData.title,
      insight: insightData.insight,
      recommendation: insightData.recommendation,
      expectedImpact: insightData.expectedImpact,
      effort: insightData.effort,
      dataSource: insightData.dataSource,
      supportingData: insightData.supportingData || {},
      actionSteps: insightData.actionSteps || [],
      estimatedRevenue: insightData.estimatedRevenue || 0,
      isRead: false,
      isActioned: false,
      actionedAt: null,
      dismissedAt: null,
      validUntil,
      createdAt: now
    };

    const created = await wixData.insert(COLLECTIONS.BUSINESS_INSIGHTS, insight);
    return created;
  } catch (error) {
    console.error('Error creating insight:', error);
    throw new Error(`Failed to create insight: ${error.message}`);
  }
}

/**
 * Get insights for a user
 * @param {string} userId - User ID
 * @param {Object} filters - Filter options
 * @returns {Promise<Array>} Insights
 */
export async function getInsights(userId, filters = {}) {
  try {
    let query = wixData.query(COLLECTIONS.BUSINESS_INSIGHTS)
      .eq('userId', userId);

    // Apply filters
    if (filters.category) {
      query = query.eq('category', filters.category);
    }

    if (filters.priority) {
      query = query.eq('priority', filters.priority);
    }

    if (filters.isRead !== undefined) {
      query = query.eq('isRead', filters.isRead);
    }

    if (filters.isActioned !== undefined) {
      query = query.eq('isActioned', filters.isActioned);
    }

    // Only show valid insights
    query = query.ge('validUntil', new Date());

    // Sort by priority and date
    query = query.descending('createdAt');

    const results = await query.find();

    // Custom sort by priority
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    results.items.sort((a, b) => {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    return results.items;
  } catch (error) {
    console.error('Error getting insights:', error);
    throw error;
  }
}

/**
 * Get a single insight
 * @param {string} insightId - Insight ID
 * @returns {Promise<Object>} Insight
 */
export async function getInsight(insightId) {
  try {
    const insight = await wixData.get(COLLECTIONS.BUSINESS_INSIGHTS, insightId);

    // Mark as read
    if (!insight.isRead) {
      insight.isRead = true;
      await wixData.update(COLLECTIONS.BUSINESS_INSIGHTS, insight);
    }

    return insight;
  } catch (error) {
    console.error('Error getting insight:', error);
    throw error;
  }
}

/**
 * Mark insight as actioned
 * @param {string} insightId - Insight ID
 * @returns {Promise<Object>} Updated insight
 */
export async function markAsActioned(insightId) {
  try {
    const insight = await wixData.get(COLLECTIONS.BUSINESS_INSIGHTS, insightId);

    insight.isActioned = true;
    insight.actionedAt = new Date();

    const updated = await wixData.update(COLLECTIONS.BUSINESS_INSIGHTS, insight);
    return updated;
  } catch (error) {
    console.error('Error marking insight as actioned:', error);
    throw error;
  }
}

/**
 * Dismiss insight
 * @param {string} insightId - Insight ID
 * @returns {Promise<Object>} Updated insight
 */
export async function dismissInsight(insightId) {
  try {
    const insight = await wixData.get(COLLECTIONS.BUSINESS_INSIGHTS, insightId);

    insight.dismissedAt = new Date();

    const updated = await wixData.update(COLLECTIONS.BUSINESS_INSIGHTS, insight);
    return updated;
  } catch (error) {
    console.error('Error dismissing insight:', error);
    throw error;
  }
}

/**
 * Get priority insights (top 5)
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Priority insights
 */
export async function getPriorityInsights(userId) {
  try {
    const insights = await getInsights(userId, {
      isActioned: false
    });

    // Return top 5 most critical
    return insights.slice(0, 5);
  } catch (error) {
    console.error('Error getting priority insights:', error);
    throw error;
  }
}

export default {
  generateInsights,
  createInsight,
  getInsights,
  getInsight,
  markAsActioned,
  dismissInsight,
  getPriorityInsights
};
