/**
 * SUPERNova AI Business Advisor - Health Score Service
 *
 * Manages business health scoring:
 * - Calculate overall health score
 * - Category-specific scores (revenue, growth, marketing, etc.)
 * - Health trends and changes
 * - Risk detection
 */

import wixData from 'wix-data';
import { getProfile, getBusinessDataSummary } from './businessProfileService';

// ============================================================================
// Configuration
// ============================================================================

const COLLECTIONS = {
  BUSINESS_HEALTH_SCORES: 'BusinessHealthScores',
  BUSINESS_PROFILES: 'BusinessProfiles'
};

// Health status thresholds
const HEALTH_THRESHOLDS = {
  THRIVING: 80,
  STABLE: 60,
  AT_RISK: 40,
  CRITICAL: 0
};

// ============================================================================
// Health Score Calculation
// ============================================================================

/**
 * Calculate and store current health score
 * @param {string} userId - User ID
 * @param {Object} businessData - Business data for scoring
 * @returns {Promise<Object>} Health score record
 */
export async function calculateHealthScore(userId, businessData = null) {
  try {
    // Get business data if not provided
    if (!businessData) {
      businessData = await getBusinessDataSummary(userId);
    }

    if (!businessData) {
      throw new Error('No business data available for health scoring');
    }

    // Calculate individual category scores
    const revenueScore = calculateRevenueScore(businessData);
    const growthScore = calculateGrowthScore(businessData);
    const customerScore = calculateCustomerScore(businessData);
    const marketingScore = calculateMarketingScore(businessData);
    const operationsScore = calculateOperationsScore(businessData);
    const profitabilityScore = calculateProfitabilityScore(businessData);

    // Calculate overall score (weighted average)
    const overallScore = Math.round(
      revenueScore * 0.25 +
      growthScore * 0.20 +
      customerScore * 0.20 +
      marketingScore * 0.15 +
      operationsScore * 0.10 +
      profitabilityScore * 0.10
    );

    // Determine health status
    const healthStatus = getHealthStatus(overallScore);

    // Get insights and trends
    const insights = generateHealthInsights(businessData, {
      overall: overallScore,
      revenue: revenueScore,
      growth: growthScore,
      customer: customerScore,
      marketing: marketingScore,
      operations: operationsScore,
      profitability: profitabilityScore
    });

    // Get score changes from previous period
    const scoreChanges = await getScoreChanges(userId, overallScore);

    // Calculate trends
    const trends = calculateTrends(scoreChanges);

    // Identify strengths and weaknesses
    const scores = {
      revenue: revenueScore,
      growth: growthScore,
      customer: customerScore,
      marketing: marketingScore,
      operations: operationsScore,
      profitability: profitabilityScore
    };

    const strengths = Object.entries(scores)
      .filter(([_, score]) => score >= 80)
      .map(([category, score]) => ({ category, score }));

    const weaknesses = Object.entries(scores)
      .filter(([_, score]) => score < 60)
      .map(([category, score]) => ({ category, score }));

    // Identify critical issues
    const criticalIssues = Object.entries(scores)
      .filter(([_, score]) => score < 40)
      .map(([category, score]) => ({
        category,
        score,
        severity: 'critical'
      }));

    // Identify opportunity areas
    const opportunityAreas = Object.entries(scores)
      .filter(([_, score]) => score >= 60 && score < 80)
      .map(([category, score]) => ({ category, score }));

    // Assess data quality
    const dataQuality = assessDataQuality(businessData);

    // Create health score record
    const now = new Date();

    const healthRecord = {
      userId,
      date: now,
      overallScore,
      healthStatus,
      revenueScore,
      growthScore,
      customerScore,
      marketingScore,
      operationsScore,
      profitabilityScore,
      insights,
      trends,
      scoreChanges,
      strengths,
      weaknesses,
      criticalIssues,
      opportunityAreas,
      dataQuality,
      createdAt: now
    };

    // Save to database
    const saved = await wixData.insert(COLLECTIONS.BUSINESS_HEALTH_SCORES, healthRecord);

    return saved;
  } catch (error) {
    console.error('Error calculating health score:', error);
    throw new Error(`Failed to calculate health score: ${error.message}`);
  }
}

/**
 * Calculate revenue health score
 * @param {Object} businessData - Business data
 * @returns {number} Score 0-100
 */
function calculateRevenueScore(businessData) {
  let score = 50; // Base score

  const revenue = businessData.revenue || {};
  const profile = businessData.profile || {};

  // Has revenue
  if (revenue.current > 0) {
    score += 20;
  }

  // Meeting target
  if (profile.targetRevenue > 0) {
    const targetPercentage = (revenue.current / profile.targetRevenue) * 100;
    if (targetPercentage >= 100) {
      score += 30;
    } else if (targetPercentage >= 75) {
      score += 20;
    } else if (targetPercentage >= 50) {
      score += 10;
    }
  }

  // Growth trend
  if (revenue.trend === 'growing') {
    score += 20;
  } else if (revenue.trend === 'stable') {
    score += 10;
  }

  // Revenue stability (consistent revenue)
  if (revenue.consistency === 'high') {
    score += 10;
  }

  return Math.min(100, Math.max(0, score));
}

/**
 * Calculate growth momentum score
 * @param {Object} businessData - Business data
 * @returns {number} Score 0-100
 */
function calculateGrowthScore(businessData) {
  let score = 50; // Base score

  const revenue = businessData.revenue || {};

  // Growth rate
  if (revenue.growth > 20) {
    score += 40; // Exceptional growth
  } else if (revenue.growth > 10) {
    score += 30; // Strong growth
  } else if (revenue.growth > 5) {
    score += 20; // Good growth
  } else if (revenue.growth > 0) {
    score += 10; // Positive growth
  } else {
    score -= 20; // Decline
  }

  // Acceleration
  if (revenue.acceleration === 'accelerating') {
    score += 20;
  } else if (revenue.acceleration === 'decelerating') {
    score -= 10;
  }

  return Math.min(100, Math.max(0, score));
}

/**
 * Calculate customer health score
 * @param {Object} businessData - Business data
 * @returns {number} Score 0-100
 */
function calculateCustomerScore(businessData) {
  let score = 50; // Base score

  const customers = businessData.customers || {};

  // Has customers
  if (customers.total > 0) {
    score += 10;
  }

  // Low churn rate (< 5% is excellent)
  if (customers.churnRate < 5) {
    score += 25;
  } else if (customers.churnRate < 10) {
    score += 15;
  } else if (customers.churnRate < 15) {
    score += 5;
  } else {
    score -= 10; // High churn is bad
  }

  // Good LTV to CAC ratio (> 3 is healthy)
  if (customers.ltv > 0 && customers.acquisitionCost > 0) {
    const ratio = customers.ltv / customers.acquisitionCost;
    if (ratio > 5) {
      score += 25;
    } else if (ratio > 3) {
      score += 20;
    } else if (ratio > 2) {
      score += 10;
    } else {
      score -= 10;
    }
  }

  // Customer satisfaction
  if (customers.satisfaction >= 90) {
    score += 20;
  } else if (customers.satisfaction >= 75) {
    score += 10;
  }

  return Math.min(100, Math.max(0, score));
}

/**
 * Calculate marketing effectiveness score
 * @param {Object} businessData - Business data
 * @returns {number} Score 0-100
 */
function calculateMarketingScore(businessData) {
  let score = 50; // Base score

  const marketing = businessData.marketing || {};

  // Good conversion rate (> 3% is good for most industries)
  if (marketing.conversionRate > 5) {
    score += 25;
  } else if (marketing.conversionRate > 3) {
    score += 20;
  } else if (marketing.conversionRate > 2) {
    score += 10;
  } else if (marketing.conversionRate < 1) {
    score -= 10;
  }

  // Positive ROAS (> 3 is good)
  if (marketing.roas > 5) {
    score += 25;
  } else if (marketing.roas > 3) {
    score += 20;
  } else if (marketing.roas > 2) {
    score += 10;
  } else if (marketing.roas > 1) {
    score += 5;
  } else if (marketing.roas > 0 && marketing.roas < 1) {
    score -= 15; // Losing money on ads
  }

  // Growing audience
  if (marketing.audienceGrowth > 10) {
    score += 15;
  } else if (marketing.audienceGrowth > 5) {
    score += 10;
  }

  return Math.min(100, Math.max(0, score));
}

/**
 * Calculate operations efficiency score
 * @param {Object} businessData - Business data
 * @returns {number} Score 0-100
 */
function calculateOperationsScore(businessData) {
  let score = 70; // Base score (assume decent unless data shows otherwise)

  const operations = businessData.operations || {};

  // Low support ticket volume relative to customers
  if (operations.supportTicketRate < 5) {
    score += 15;
  } else if (operations.supportTicketRate > 15) {
    score -= 15;
  }

  // Fast response times
  if (operations.avgResponseTime < 2) {
    score += 15; // < 2 hours is excellent
  } else if (operations.avgResponseTime < 24) {
    score += 10;
  } else {
    score -= 10;
  }

  return Math.min(100, Math.max(0, score));
}

/**
 * Calculate profitability score
 * @param {Object} businessData - Business data
 * @returns {number} Score 0-100
 */
function calculateProfitabilityScore(businessData) {
  let score = 50; // Base score

  const revenue = businessData.revenue || {};
  const profitMargin = revenue.profitMargin || 0;

  // Profit margin thresholds vary by industry
  if (profitMargin > 40) {
    score += 50; // Exceptional
  } else if (profitMargin > 25) {
    score += 40;
  } else if (profitMargin > 15) {
    score += 30;
  } else if (profitMargin > 10) {
    score += 20;
  } else if (profitMargin > 5) {
    score += 10;
  } else if (profitMargin < 0) {
    score -= 30; // Losing money
  }

  return Math.min(100, Math.max(0, score));
}

/**
 * Get health status from score
 * @param {number} score - Overall score
 * @returns {string} Health status
 */
function getHealthStatus(score) {
  if (score >= HEALTH_THRESHOLDS.THRIVING) return 'thriving';
  if (score >= HEALTH_THRESHOLDS.STABLE) return 'stable';
  if (score >= HEALTH_THRESHOLDS.AT_RISK) return 'at_risk';
  return 'critical';
}

/**
 * Generate health insights
 * @param {Object} businessData - Business data
 * @param {Object} scores - All category scores
 * @returns {Object} Insights object
 */
function generateHealthInsights(businessData, scores) {
  const insights = {
    overall: '',
    revenue: '',
    growth: '',
    customer: '',
    marketing: '',
    operations: '',
    profitability: ''
  };

  // Overall insight
  if (scores.overall >= 80) {
    insights.overall = 'Your business is thriving! Keep up the excellent work.';
  } else if (scores.overall >= 60) {
    insights.overall = 'Your business is stable but has room for improvement.';
  } else if (scores.overall >= 40) {
    insights.overall = 'Your business needs attention in several areas.';
  } else {
    insights.overall = 'Critical issues detected. Immediate action required.';
  }

  // Category-specific insights would be generated based on scores
  // This is simplified - in production, these would be more detailed

  return insights;
}

/**
 * Get score changes from previous period
 * @param {string} userId - User ID
 * @param {number} currentScore - Current overall score
 * @returns {Promise<Object>} Score changes
 */
async function getScoreChanges(userId, currentScore) {
  try {
    // Get previous health score
    const previous = await wixData.query(COLLECTIONS.BUSINESS_HEALTH_SCORES)
      .eq('userId', userId)
      .descending('date')
      .limit(1)
      .find();

    if (previous.items.length === 0) {
      return {
        overall: 0,
        revenue: 0,
        growth: 0,
        customer: 0,
        marketing: 0,
        operations: 0,
        profitability: 0
      };
    }

    const prev = previous.items[0];

    return {
      overall: currentScore - (prev.overallScore || 0),
      revenue: 0, // Calculate from current vs previous
      growth: 0,
      customer: 0,
      marketing: 0,
      operations: 0,
      profitability: 0
    };
  } catch (error) {
    console.error('Error getting score changes:', error);
    return {};
  }
}

/**
 * Calculate trends
 * @param {Object} scoreChanges - Score changes
 * @returns {Object} Trends object
 */
function calculateTrends(scoreChanges) {
  const getTrend = (change) => {
    if (change > 5) return 'improving';
    if (change < -5) return 'declining';
    return 'stable';
  };

  return {
    overall: getTrend(scoreChanges.overall || 0),
    revenue: getTrend(scoreChanges.revenue || 0),
    growth: getTrend(scoreChanges.growth || 0),
    customer: getTrend(scoreChanges.customer || 0),
    marketing: getTrend(scoreChanges.marketing || 0),
    operations: getTrend(scoreChanges.operations || 0),
    profitability: getTrend(scoreChanges.profitability || 0)
  };
}

/**
 * Assess data quality
 * @param {Object} businessData - Business data
 * @returns {number} Quality score 0-100
 */
function assessDataQuality(businessData) {
  let quality = 0;
  let dataPoints = 0;
  let filledPoints = 0;

  // Check key data points
  const checks = [
    businessData.revenue?.current,
    businessData.customers?.total,
    businessData.marketing?.conversionRate,
    businessData.marketing?.websiteVisitors,
    businessData.profile?.monthlyRevenue
  ];

  checks.forEach(point => {
    dataPoints++;
    if (point !== undefined && point !== null && point !== 0) {
      filledPoints++;
    }
  });

  quality = (filledPoints / dataPoints) * 100;

  return Math.round(quality);
}

// ============================================================================
// Health Score Retrieval
// ============================================================================

/**
 * Get current health score
 * @param {string} userId - User ID
 * @returns {Promise<Object|null>} Latest health score
 */
export async function getCurrentHealthScore(userId) {
  try {
    const results = await wixData.query(COLLECTIONS.BUSINESS_HEALTH_SCORES)
      .eq('userId', userId)
      .descending('date')
      .limit(1)
      .find();

    return results.items.length > 0 ? results.items[0] : null;
  } catch (error) {
    console.error('Error getting current health score:', error);
    throw error;
  }
}

/**
 * Get health score history
 * @param {string} userId - User ID
 * @param {number} days - Number of days to retrieve
 * @returns {Promise<Array>} Health score history
 */
export async function getHealthScoreHistory(userId, days = 30) {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const results = await wixData.query(COLLECTIONS.BUSINESS_HEALTH_SCORES)
      .eq('userId', userId)
      .ge('date', startDate)
      .ascending('date')
      .find();

    return results.items;
  } catch (error) {
    console.error('Error getting health score history:', error);
    throw error;
  }
}

/**
 * Get health score for specific date
 * @param {string} userId - User ID
 * @param {Date} date - Date
 * @returns {Promise<Object|null>} Health score for date
 */
export async function getHealthScoreForDate(userId, date) {
  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const results = await wixData.query(COLLECTIONS.BUSINESS_HEALTH_SCORES)
      .eq('userId', userId)
      .ge('date', startOfDay)
      .le('date', endOfDay)
      .limit(1)
      .find();

    return results.items.length > 0 ? results.items[0] : null;
  } catch (error) {
    console.error('Error getting health score for date:', error);
    throw error;
  }
}

export default {
  calculateHealthScore,
  getCurrentHealthScore,
  getHealthScoreHistory,
  getHealthScoreForDate
};
