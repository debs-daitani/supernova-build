/**
 * SUPERNova AI Business Advisor - Report Service
 *
 * Manages business reports:
 * - Weekly business health reports
 * - Monthly summary reports
 * - Custom date range reports
 * - Performance summaries
 * - Trend analysis
 */

import wixData from 'wix-data';
import { getBusinessDataSummary } from './businessProfileService';
import { getCurrentHealthScore, getHealthScoreHistory } from './businessHealthService';
import { getPriorityInsights } from './businessInsightService';
import { getActiveGoals } from './businessGoalService';

// ============================================================================
// Weekly Report
// ============================================================================

/**
 * Generate weekly business health report
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Weekly report
 */
export async function generateWeeklyReport(userId) {
  try {
    const now = new Date();
    const oneWeekAgo = new Date(now);
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Get current data
    const currentData = await getBusinessDataSummary(userId);
    const currentHealth = await getCurrentHealthScore(userId);

    // Get historical health scores
    const healthHistory = await getHealthScoreHistory(userId, 14);

    // Calculate week-over-week changes
    const changes = calculateWeekOverWeekChanges(healthHistory);

    // Get insights
    const insights = await getPriorityInsights(userId);

    // Get active goals
    const goals = await getActiveGoals(userId);

    // Identify wins
    const wins = identifyWins(currentData, changes);

    // Identify areas to watch
    const areasToWatch = identifyAreasToWatch(currentData, changes, insights);

    // Get priority action
    const priorityAction = getPriorityAction(insights);

    // Forecast next week
    const forecast = forecastNextWeek(currentData, changes);

    const report = {
      userId,
      reportType: 'weekly',
      period: {
        start: oneWeekAgo,
        end: now
      },
      snapshot: {
        revenue: currentData.revenue?.current || 0,
        revenueChange: changes.revenue || 0,
        customers: currentData.customers?.total || 0,
        customerChange: changes.customers || 0,
        websiteVisitors: currentData.marketing?.websiteVisitors || 0,
        visitorChange: changes.traffic || 0,
        conversionRate: currentData.marketing?.conversionRate || 0,
        conversionChange: changes.conversion || 0
      },
      healthScore: {
        current: currentHealth?.overallScore || 0,
        change: changes.healthScore || 0,
        status: currentHealth?.healthStatus || 'unknown'
      },
      wins: wins,
      areasToWatch: areasToWatch,
      priorityAction: priorityAction,
      insights: insights.slice(0, 3), // Top 3 insights
      goals: goals.map(g => ({
        goal: g.goal,
        progress: g.progress,
        status: g.status
      })),
      forecast: forecast,
      generatedAt: now
    };

    return report;
  } catch (error) {
    console.error('Error generating weekly report:', error);
    throw new Error(`Failed to generate weekly report: ${error.message}`);
  }
}

/**
 * Calculate week-over-week changes
 * @param {Array} healthHistory - Health score history
 * @returns {Object} Changes
 */
function calculateWeekOverWeekChanges(healthHistory) {
  const changes = {
    healthScore: 0,
    revenue: 0,
    customers: 0,
    traffic: 0,
    conversion: 0
  };

  if (healthHistory.length >= 2) {
    const current = healthHistory[healthHistory.length - 1];
    const previous = healthHistory[0];

    changes.healthScore = (current.overallScore || 0) - (previous.overallScore || 0);
  }

  // In production, calculate actual metric changes from historical data
  // For now, returning structure

  return changes;
}

/**
 * Identify wins for the week
 * @param {Object} currentData - Current business data
 * @param {Object} changes - Week-over-week changes
 * @returns {Array} Wins
 */
function identifyWins(currentData, changes) {
  const wins = [];

  // Revenue increase
  if (changes.revenue > 0) {
    wins.push({
      title: 'Revenue increased',
      description: `Revenue up ${Math.abs(changes.revenue)}% vs last week`,
      impact: 'positive'
    });
  }

  // Health score improvement
  if (changes.healthScore > 5) {
    wins.push({
      title: 'Business health improving',
      description: `Health score increased ${Math.round(changes.healthScore)} points`,
      impact: 'positive'
    });
  }

  // Customer growth
  if (changes.customers > 0) {
    wins.push({
      title: 'Customer base growing',
      description: `Added ${Math.abs(changes.customers)} new customers`,
      impact: 'positive'
    });
  }

  // Traffic increase
  if (changes.traffic > 10) {
    wins.push({
      title: 'Traffic surging',
      description: `Website traffic up ${Math.abs(changes.traffic)}%`,
      impact: 'positive'
    });
  }

  // Conversion improvement
  if (changes.conversion > 0.5) {
    wins.push({
      title: 'Conversions improving',
      description: `Conversion rate increased ${changes.conversion.toFixed(1)}%`,
      impact: 'positive'
    });
  }

  // If no wins, add encouraging message
  if (wins.length === 0) {
    wins.push({
      title: 'Keep going!',
      description: 'Focus on implementing the priority actions below',
      impact: 'neutral'
    });
  }

  return wins;
}

/**
 * Identify areas to watch
 * @param {Object} currentData - Current business data
 * @param {Object} changes - Week-over-week changes
 * @param {Array} insights - Priority insights
 * @returns {Array} Areas to watch
 */
function identifyAreasToWatch(currentData, changes, insights) {
  const areas = [];

  // Declining revenue
  if (changes.revenue < -5) {
    areas.push({
      title: 'Revenue declining',
      description: `Revenue down ${Math.abs(changes.revenue)}% - investigate cause`,
      severity: 'high'
    });
  }

  // Declining health score
  if (changes.healthScore < -5) {
    areas.push({
      title: 'Health score declining',
      description: `Business health dropped ${Math.abs(Math.round(changes.healthScore))} points`,
      severity: 'medium'
    });
  }

  // Low conversion rate
  const conversionRate = currentData.marketing?.conversionRate || 0;
  if (conversionRate > 0 && conversionRate < 2) {
    areas.push({
      title: 'Low conversion rate',
      description: `Conversion rate at ${conversionRate.toFixed(1)}% - optimize checkout`,
      severity: 'medium'
    });
  }

  // Critical insights
  const criticalInsights = insights.filter(i => i.priority === 'critical');
  criticalInsights.forEach(insight => {
    areas.push({
      title: insight.title,
      description: insight.insight,
      severity: 'high'
    });
  });

  return areas.slice(0, 5); // Top 5 areas
}

/**
 * Get priority action for the week
 * @param {Array} insights - Priority insights
 * @returns {Object} Priority action
 */
function getPriorityAction(insights) {
  if (insights.length === 0) {
    return {
      title: 'Review your business goals',
      description: 'Set clear goals for the week ahead',
      steps: [
        'Review current business state',
        'Set specific goals',
        'Identify key actions'
      ]
    };
  }

  const topInsight = insights[0];

  return {
    title: topInsight.title,
    description: topInsight.recommendation,
    expectedImpact: topInsight.expectedImpact,
    effort: topInsight.effort,
    steps: topInsight.actionSteps || []
  };
}

/**
 * Forecast next week
 * @param {Object} currentData - Current business data
 * @param {Object} changes - Recent changes
 * @returns {Object} Forecast
 */
function forecastNextWeek(currentData, changes) {
  const revenue = currentData.revenue?.current || 0;
  const growthRate = changes.revenue || 0;

  // Simple projection based on recent trend
  const projectedRevenue = revenue * (1 + growthRate / 100);

  return {
    revenue: {
      projected: Math.round(projectedRevenue),
      range: {
        low: Math.round(projectedRevenue * 0.9),
        high: Math.round(projectedRevenue * 1.1)
      }
    },
    confidence: growthRate !== 0 ? 'medium' : 'low',
    assumptions: 'Based on recent trend continuing'
  };
}

// ============================================================================
// Monthly Report
// ============================================================================

/**
 * Generate monthly business summary report
 * @param {string} userId - User ID
 * @param {Date} month - Month to report on (defaults to previous month)
 * @returns {Promise<Object>} Monthly report
 */
export async function generateMonthlyReport(userId, month = null) {
  try {
    // Default to previous month
    const reportMonth = month ? new Date(month) : new Date();
    if (!month) {
      reportMonth.setMonth(reportMonth.getMonth() - 1);
    }

    const startOfMonth = new Date(reportMonth.getFullYear(), reportMonth.getMonth(), 1);
    const endOfMonth = new Date(reportMonth.getFullYear(), reportMonth.getMonth() + 1, 0);

    // Get business data
    const currentData = await getBusinessDataSummary(userId);

    // Get health scores for the month
    const healthScores = await getHealthScoreHistory(userId, 30);

    // Calculate monthly stats
    const monthlyStats = calculateMonthlyStats(currentData, healthScores);

    // Get goals progress
    const goals = await getActiveGoals(userId);

    // Identify top wins
    const topWins = identifyMonthlyWins(monthlyStats);

    // Identify improvements needed
    const improvements = identifyImprovements(monthlyStats);

    // Get monthly insights
    const insights = await getPriorityInsights(userId);

    const report = {
      userId,
      reportType: 'monthly',
      period: {
        start: startOfMonth,
        end: endOfMonth,
        month: reportMonth.toLocaleString('default', { month: 'long', year: 'numeric' })
      },
      summary: {
        revenue: monthlyStats.revenue,
        customers: monthlyStats.customers,
        growth: monthlyStats.growth,
        healthScore: monthlyStats.healthScore
      },
      topWins: topWins,
      improvements: improvements,
      goals: goals.map(g => ({
        goal: g.goal,
        progress: g.progress,
        status: g.status,
        targetDate: g.targetDate
      })),
      insights: insights.slice(0, 5),
      nextMonthFocus: generateNextMonthFocus(monthlyStats, insights),
      generatedAt: new Date()
    };

    return report;
  } catch (error) {
    console.error('Error generating monthly report:', error);
    throw new Error(`Failed to generate monthly report: ${error.message}`);
  }
}

/**
 * Calculate monthly statistics
 * @param {Object} currentData - Current business data
 * @param {Array} healthScores - Health scores for the month
 * @returns {Object} Monthly stats
 */
function calculateMonthlyStats(currentData, healthScores) {
  const stats = {
    revenue: {
      total: currentData.revenue?.current || 0,
      growth: currentData.revenue?.growth || 0,
      trend: currentData.revenue?.trend || 'stable'
    },
    customers: {
      total: currentData.customers?.total || 0,
      new: 0, // Calculate from data
      churnRate: currentData.customers?.churnRate || 0
    },
    growth: {
      overall: currentData.revenue?.growth || 0,
      momentum: currentData.revenue?.trend === 'growing' ? 'positive' : 'neutral'
    },
    healthScore: {
      average: calculateAverageHealthScore(healthScores),
      trend: calculateHealthTrend(healthScores)
    }
  };

  return stats;
}

/**
 * Calculate average health score
 * @param {Array} healthScores - Health scores
 * @returns {number} Average score
 */
function calculateAverageHealthScore(healthScores) {
  if (healthScores.length === 0) return 0;

  const sum = healthScores.reduce((acc, score) => acc + (score.overallScore || 0), 0);
  return Math.round(sum / healthScores.length);
}

/**
 * Calculate health trend
 * @param {Array} healthScores - Health scores
 * @returns {string} Trend (improving, declining, stable)
 */
function calculateHealthTrend(healthScores) {
  if (healthScores.length < 2) return 'stable';

  const recent = healthScores.slice(-7); // Last week
  const earlier = healthScores.slice(0, 7); // First week

  const recentAvg = recent.reduce((acc, s) => acc + (s.overallScore || 0), 0) / recent.length;
  const earlierAvg = earlier.reduce((acc, s) => acc + (s.overallScore || 0), 0) / earlier.length;

  const change = recentAvg - earlierAvg;

  if (change > 5) return 'improving';
  if (change < -5) return 'declining';
  return 'stable';
}

/**
 * Identify monthly wins
 * @param {Object} monthlyStats - Monthly statistics
 * @returns {Array} Top wins
 */
function identifyMonthlyWins(monthlyStats) {
  const wins = [];

  // Revenue growth
  if (monthlyStats.revenue.growth > 0) {
    wins.push({
      title: `${monthlyStats.revenue.growth}% revenue growth`,
      description: `Revenue reached £${monthlyStats.revenue.total.toLocaleString()} this month`,
      category: 'revenue'
    });
  }

  // Health improvement
  if (monthlyStats.healthScore.trend === 'improving') {
    wins.push({
      title: 'Business health improving',
      description: `Average health score: ${monthlyStats.healthScore.average}/100`,
      category: 'health'
    });
  }

  // Customer growth
  if (monthlyStats.customers.new > 0) {
    wins.push({
      title: `${monthlyStats.customers.new} new customers`,
      description: `Customer base grew to ${monthlyStats.customers.total}`,
      category: 'customers'
    });
  }

  return wins;
}

/**
 * Identify areas for improvement
 * @param {Object} monthlyStats - Monthly statistics
 * @returns {Array} Improvements needed
 */
function identifyImprovements(monthlyStats) {
  const improvements = [];

  // Negative growth
  if (monthlyStats.revenue.growth < 0) {
    improvements.push({
      area: 'Revenue',
      issue: `Revenue declined ${Math.abs(monthlyStats.revenue.growth)}%`,
      priority: 'high'
    });
  }

  // High churn
  if (monthlyStats.customers.churnRate > 10) {
    improvements.push({
      area: 'Customer Retention',
      issue: `Churn rate at ${monthlyStats.customers.churnRate}%`,
      priority: 'high'
    });
  }

  // Declining health
  if (monthlyStats.healthScore.trend === 'declining') {
    improvements.push({
      area: 'Business Health',
      issue: 'Health score declining',
      priority: 'medium'
    });
  }

  return improvements;
}

/**
 * Generate next month focus areas
 * @param {Object} monthlyStats - Monthly statistics
 * @param {Array} insights - Priority insights
 * @returns {Array} Focus areas
 */
function generateNextMonthFocus(monthlyStats, insights) {
  const focus = [];

  // Top 3 insights become focus areas
  insights.slice(0, 3).forEach(insight => {
    focus.push({
      area: insight.category,
      goal: insight.title,
      actions: insight.actionSteps || []
    });
  });

  // Add growth focus if not in insights
  if (!focus.find(f => f.area === 'growth')) {
    focus.push({
      area: 'growth',
      goal: 'Accelerate business growth',
      actions: ['Test new marketing channels', 'Optimize conversion funnel', 'Launch growth experiments']
    });
  }

  return focus.slice(0, 3); // Top 3 focus areas
}

// ============================================================================
// Custom Date Range Report
// ============================================================================

/**
 * Generate custom date range report
 * @param {string} userId - User ID
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Promise<Object>} Custom report
 */
export async function generateCustomReport(userId, startDate, endDate) {
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

    // Get health scores for date range
    const healthScores = await getHealthScoreHistory(userId, days);

    // Get business data
    const currentData = await getBusinessDataSummary(userId);

    const report = {
      userId,
      reportType: 'custom',
      period: {
        start,
        end,
        days
      },
      summary: {
        avgHealthScore: calculateAverageHealthScore(healthScores),
        healthTrend: calculateHealthTrend(healthScores),
        revenue: currentData.revenue,
        customers: currentData.customers,
        marketing: currentData.marketing
      },
      healthScores: healthScores,
      generatedAt: new Date()
    };

    return report;
  } catch (error) {
    console.error('Error generating custom report:', error);
    throw new Error(`Failed to generate custom report: ${error.message}`);
  }
}

// ============================================================================
// Report Delivery
// ============================================================================

/**
 * Format report for email delivery
 * @param {Object} report - Report object
 * @returns {string} HTML formatted report
 */
export function formatReportForEmail(report) {
  // This would generate HTML email template
  // For now, returning simple text format

  let html = `
    <h1>Your ${report.reportType.charAt(0).toUpperCase() + report.reportType.slice(1)} Business Report</h1>
    <p><strong>Period:</strong> ${report.period.start.toLocaleDateString()} - ${report.period.end.toLocaleDateString()}</p>
  `;

  if (report.snapshot) {
    html += `
      <h2>This Week's Snapshot</h2>
      <ul>
        <li>Revenue: £${report.snapshot.revenue.toLocaleString()} (${report.snapshot.revenueChange > 0 ? '+' : ''}${report.snapshot.revenueChange}%)</li>
        <li>Website Visitors: ${report.snapshot.websiteVisitors.toLocaleString()} (${report.snapshot.visitorChange > 0 ? '+' : ''}${report.snapshot.visitorChange}%)</li>
        <li>Conversion Rate: ${report.snapshot.conversionRate.toFixed(1)}%</li>
        <li>Health Score: ${report.healthScore.current}/100</li>
      </ul>
    `;
  }

  if (report.wins && report.wins.length > 0) {
    html += `<h2>🎉 Wins This Week</h2><ul>`;
    report.wins.forEach(win => {
      html += `<li><strong>${win.title}:</strong> ${win.description}</li>`;
    });
    html += `</ul>`;
  }

  if (report.areasToWatch && report.areasToWatch.length > 0) {
    html += `<h2>⚠️ Areas to Watch</h2><ul>`;
    report.areasToWatch.forEach(area => {
      html += `<li><strong>${area.title}:</strong> ${area.description}</li>`;
    });
    html += `</ul>`;
  }

  if (report.priorityAction) {
    html += `
      <h2>🎯 This Week's Priority</h2>
      <p><strong>${report.priorityAction.title}</strong></p>
      <p>${report.priorityAction.description}</p>
    `;
  }

  return html;
}

export default {
  generateWeeklyReport,
  generateMonthlyReport,
  generateCustomReport,
  formatReportForEmail
};
