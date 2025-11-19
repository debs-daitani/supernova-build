/**
 * SUPERNova Competitor Tracker - Report Service
 *
 * Report generation:
 * - Weekly competitive digest
 * - Monthly summary
 * - SWOT analysis
 * - Custom reports
 * - Email delivery
 */

import { fetch } from 'wix-fetch';
import { getCompetitor, listCompetitors } from './competitorService';
import { getAlerts } from './competitorAlertService';
import { getCurrentPricing } from './competitorPricingService';
import { getSocialOverview } from './competitorSocialService';
import { getLatestSEOData } from './competitorSEOService';
import { getRecentContent } from './competitorContentService';

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const CLAUDE_API_KEY = 'YOUR_ANTHROPIC_API_KEY';
const CLAUDE_MODEL = 'claude-3-5-sonnet-20241022';

/**
 * Generate weekly competitive digest
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Weekly digest
 */
export async function generateWeeklyDigest(userId) {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 7);

    // Get all competitors
    const competitors = await listCompetitors(userId, { status: 'active' });

    // Get activity from the past week
    const weeklyActivity = [];

    for (const competitor of competitors) {
      const activity = await getWeeklyActivity(competitor._id, cutoffDate);

      if (activity.hasActivity) {
        weeklyActivity.push({
          competitor: competitor.name,
          ...activity
        });
      }
    }

    // Get alerts from past week
    const alerts = await getAlerts(userId, {
      limit: 100
    });

    const weeklyAlerts = alerts.filter(alert =>
      new Date(alert.createdAt) >= cutoffDate
    );

    // Group alerts by severity
    const criticalAlerts = weeklyAlerts.filter(a => a.severity === 'critical');
    const importantAlerts = weeklyAlerts.filter(a => a.severity === 'important');

    // Generate AI summary
    const aiSummary = await generateWeeklySummary({
      weeklyActivity,
      criticalAlerts,
      importantAlerts
    });

    const digest = {
      weekEnding: new Date().toISOString().split('T')[0],
      summary: aiSummary,
      activity: weeklyActivity,
      alerts: {
        critical: criticalAlerts,
        important: importantAlerts,
        total: weeklyAlerts.length
      },
      topChanges: extractTopChanges(weeklyActivity),
      recommendations: aiSummary.recommendations || []
    };

    return digest;
  } catch (error) {
    console.error('Error generating weekly digest:', error);
    throw error;
  }
}

/**
 * Get weekly activity for a competitor
 * @param {string} competitorId - Competitor ID
 * @param {Date} since - Date to check from
 * @returns {Promise<Object>} Weekly activity
 */
async function getWeeklyActivity(competitorId, since) {
  try {
    const activity = {
      hasActivity: false,
      changes: []
    };

    // Check for new content
    const content = await getRecentContent(competitorId, 10);
    const newContent = content.filter(c => new Date(c.publishedAt) >= since);

    if (newContent.length > 0) {
      activity.hasActivity = true;
      activity.changes.push({
        type: 'content',
        count: newContent.length,
        items: newContent.map(c => c.title)
      });
    }

    // Check pricing changes (would check actual changes)
    // Check social media spikes
    // Check website updates

    return activity;
  } catch (error) {
    console.error('Error getting weekly activity:', error);
    return { hasActivity: false, changes: [] };
  }
}

/**
 * Generate AI summary of weekly activity
 * @param {Object} data - Weekly data
 * @returns {Promise<Object>} AI summary
 */
async function generateWeeklySummary(data) {
  try {
    const prompt = `Generate a weekly competitive intelligence summary.

WEEKLY ACTIVITY:
${JSON.stringify(data, null, 2)}

Provide a summary in JSON format:
{
  "overview": "1-2 sentence overview of the week",
  "keyInsights": ["insight 1", "insight 2", "insight 3"],
  "threats": ["threat 1", "threat 2"],
  "opportunities": ["opportunity 1", "opportunity 2"],
  "recommendations": [
    {
      "action": "specific action to take",
      "priority": "high|medium|low",
      "reasoning": "why this matters"
    }
  ]
}`;

    const response = await callClaudeAPI(prompt);

    try {
      return JSON.parse(response);
    } catch (parseError) {
      console.error('Failed to parse AI summary:', parseError);
      return {
        overview: 'Weekly summary unavailable',
        keyInsights: [],
        threats: [],
        opportunities: [],
        recommendations: []
      };
    }
  } catch (error) {
    console.error('Error generating weekly summary:', error);
    return {
      overview: 'Error generating summary',
      keyInsights: [],
      threats: [],
      opportunities: [],
      recommendations: []
    };
  }
}

/**
 * Extract top changes from activity
 * @param {Array} weeklyActivity - Weekly activity data
 * @returns {Array} Top changes
 */
function extractTopChanges(weeklyActivity) {
  const changes = [];

  weeklyActivity.forEach(activity => {
    activity.changes?.forEach(change => {
      changes.push({
        competitor: activity.competitor,
        type: change.type,
        description: `${change.count} ${change.type} update(s)`
      });
    });
  });

  return changes.slice(0, 10); // Top 10
}

/**
 * Generate SWOT analysis
 * @param {string} userId - User ID
 * @param {Array<string>} competitorIds - Competitor IDs to analyze
 * @returns {Promise<Object>} SWOT analysis
 */
export async function generateSWOTAnalysis(userId, competitorIds) {
  try {
    // Gather comprehensive data about competitors
    const competitorData = [];

    for (const competitorId of competitorIds) {
      const competitor = await getCompetitor(competitorId);
      const pricing = await getCurrentPricing(competitorId);
      const social = await getSocialOverview(competitorId);
      const seo = await getLatestSEOData(competitorId);

      competitorData.push({
        name: competitor.name,
        pricing,
        social,
        seo
      });
    }

    // Use AI to generate SWOT
    const swot = await generateAISWOT(competitorData);

    return swot;
  } catch (error) {
    console.error('Error generating SWOT analysis:', error);
    throw error;
  }
}

/**
 * Generate AI-powered SWOT analysis
 * @param {Array} competitorData - Competitor data
 * @returns {Promise<Object>} SWOT analysis
 */
async function generateAISWOT(competitorData) {
  try {
    const prompt = `Analyze this competitive landscape and create a SWOT analysis from the perspective of a business competing against these companies.

COMPETITOR DATA:
${JSON.stringify(competitorData, null, 2)}

Generate SWOT analysis in JSON format:
{
  "strengths": [
    {
      "strength": "what you do better than competitors",
      "evidence": "supporting data"
    }
  ],
  "weaknesses": [
    {
      "weakness": "where competitors outperform you",
      "impact": "high|medium|low",
      "suggestion": "how to address it"
    }
  ],
  "opportunities": [
    {
      "opportunity": "market gap or competitor weakness",
      "potential": "high|medium|low",
      "action": "how to capitalize"
    }
  ],
  "threats": [
    {
      "threat": "competitive threat",
      "severity": "high|medium|low",
      "mitigation": "how to defend"
    }
  ]
}`;

    const response = await callClaudeAPI(prompt);

    try {
      return JSON.parse(response);
    } catch (parseError) {
      console.error('Failed to parse SWOT:', parseError);
      return {
        strengths: [],
        weaknesses: [],
        opportunities: [],
        threats: []
      };
    }
  } catch (error) {
    console.error('Error generating AI SWOT:', error);
    throw error;
  }
}

/**
 * Call Claude API
 * @param {string} prompt - Prompt
 * @returns {Promise<string>} Response
 */
async function callClaudeAPI(prompt) {
  try {
    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 2048,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.content[0].text;
  } catch (error) {
    console.error('Error calling AI API:', error);
    throw error;
  }
}

/**
 * Generate custom report
 * @param {string} userId - User ID
 * @param {Object} reportConfig - Report configuration
 * @returns {Promise<Object>} Custom report
 */
export async function generateCustomReport(userId, reportConfig) {
  try {
    const {
      competitorIds,
      dateRange,
      sections
    } = reportConfig;

    const report = {
      title: reportConfig.title || 'Custom Competitive Report',
      generatedAt: new Date(),
      dateRange,
      sections: {}
    };

    // Generate requested sections
    if (sections.includes('pricing')) {
      const pricingData = [];
      for (const competitorId of competitorIds) {
        const pricing = await getCurrentPricing(competitorId);
        const competitor = await getCompetitor(competitorId);
        pricingData.push({ name: competitor.name, pricing });
      }
      report.sections.pricing = pricingData;
    }

    if (sections.includes('social')) {
      const socialData = [];
      for (const competitorId of competitorIds) {
        const social = await getSocialOverview(competitorId);
        const competitor = await getCompetitor(competitorId);
        socialData.push({ name: competitor.name, social });
      }
      report.sections.social = socialData;
    }

    if (sections.includes('seo')) {
      const seoData = [];
      for (const competitorId of competitorIds) {
        const seo = await getLatestSEOData(competitorId);
        const competitor = await getCompetitor(competitorId);
        seoData.push({ name: competitor.name, seo });
      }
      report.sections.seo = seoData;
    }

    return report;
  } catch (error) {
    console.error('Error generating custom report:', error);
    throw error;
  }
}

/**
 * Format digest for email
 * @param {Object} digest - Weekly digest
 * @returns {string} HTML email
 */
export function formatDigestEmail(digest) {
  let html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .header { background: #1E3A8A; color: white; padding: 20px; }
    .section { padding: 20px; border-bottom: 1px solid #eee; }
    .alert { padding: 10px; margin: 10px 0; border-left: 4px solid #f59e0b; background: #fef3c7; }
    .alert.critical { border-left-color: #dc2626; background: #fee2e2; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Weekly Competitive Digest</h1>
    <p>Week Ending: ${digest.weekEnding}</p>
  </div>

  <div class="section">
    <h2>Overview</h2>
    <p>${digest.summary.overview}</p>
  </div>

  <div class="section">
    <h2>Key Insights</h2>
    <ul>
      ${digest.summary.keyInsights.map(insight => `<li>${insight}</li>`).join('')}
    </ul>
  </div>

  <div class="section">
    <h2>Critical Alerts (${digest.alerts.critical.length})</h2>
    ${digest.alerts.critical.map(alert => `
      <div class="alert critical">
        <strong>${alert.title}</strong>
        <p>${alert.description}</p>
      </div>
    `).join('')}
  </div>

  <div class="section">
    <h2>Recommendations</h2>
    <ol>
      ${digest.summary.recommendations.map(rec => `
        <li>
          <strong>${rec.action}</strong> (Priority: ${rec.priority})
          <p>${rec.reasoning}</p>
        </li>
      `).join('')}
    </ol>
  </div>
</body>
</html>
`;

  return html;
}

export default {
  generateWeeklyDigest,
  generateSWOTAnalysis,
  generateCustomReport,
  formatDigestEmail
};
