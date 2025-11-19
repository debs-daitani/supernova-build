/**
 * SUPERNova Competitor Tracker - Comparison Service
 *
 * Competitive comparisons:
 * - Create comparison reports
 * - Feature matrices
 * - Pricing comparisons
 * - Social media comparisons
 * - SEO comparisons
 * - Export reports
 */

import wixData from 'wix-data';
import { fetch } from 'wix-fetch';
import { getCompetitor } from './competitorService';
import { getCurrentPricing } from './competitorPricingService';
import { getSocialOverview } from './competitorSocialService';
import { getLatestSEOData } from './competitorSEOService';
import { analyzeContentFrequency } from './competitorContentService';

const COLLECTIONS = {
  COMPARISONS: 'CompetitorComparisons'
};

const COMPARISON_TYPES = {
  PRICING: 'pricing',
  FEATURES: 'features',
  SOCIAL: 'social',
  SEO: 'seo',
  CONTENT: 'content',
  TRAFFIC: 'traffic',
  OVERALL: 'overall'
};

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const CLAUDE_API_KEY = 'YOUR_ANTHROPIC_API_KEY';
const CLAUDE_MODEL = 'claude-3-5-sonnet-20241022';

/**
 * Create a comparison
 * @param {string} userId - User ID
 * @param {Object} comparisonData - Comparison configuration
 * @returns {Promise<Object>} Created comparison
 */
export async function createComparison(userId, comparisonData) {
  try {
    const {
      name,
      comparisonType,
      competitorIds,
      metrics
    } = comparisonData;

    // Generate the comparison report
    const reportData = await generateComparisonReport(
      competitorIds,
      comparisonType,
      metrics
    );

    // Get AI insights
    const insights = await generateAIInsights(reportData, comparisonType);

    // Create visualizations config
    const visualizations = generateVisualizationConfig(reportData, comparisonType);

    const comparison = {
      userId,
      name,
      comparisonType,
      competitorIds,
      metrics: metrics || {},
      reportData,
      insights,
      visualizations,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return await wixData.insert(COLLECTIONS.COMPARISONS, comparison);
  } catch (error) {
    console.error('Error creating comparison:', error);
    throw new Error(`Failed to create comparison: ${error.message}`);
  }
}

/**
 * Generate comparison report
 * @param {Array<string>} competitorIds - Competitor IDs
 * @param {string} comparisonType - Type of comparison
 * @param {Object} metrics - Metrics to include
 * @returns {Promise<Object>} Report data
 */
async function generateComparisonReport(competitorIds, comparisonType, metrics) {
  switch (comparisonType) {
    case COMPARISON_TYPES.PRICING:
      return await generatePricingComparison(competitorIds);

    case COMPARISON_TYPES.FEATURES:
      return await generateFeatureComparison(competitorIds, metrics);

    case COMPARISON_TYPES.SOCIAL:
      return await generateSocialComparison(competitorIds);

    case COMPARISON_TYPES.SEO:
      return await generateSEOComparison(competitorIds);

    case COMPARISON_TYPES.CONTENT:
      return await generateContentComparison(competitorIds);

    case COMPARISON_TYPES.OVERALL:
      return await generateOverallComparison(competitorIds);

    default:
      throw new Error(`Unknown comparison type: ${comparisonType}`);
  }
}

/**
 * Generate pricing comparison
 * @param {Array<string>} competitorIds - Competitor IDs
 * @returns {Promise<Object>} Pricing comparison
 */
async function generatePricingComparison(competitorIds) {
  const comparison = {
    competitors: [],
    priceMatrix: [],
    featureMatrix: []
  };

  for (const competitorId of competitorIds) {
    const competitor = await getCompetitor(competitorId);
    const pricing = await getCurrentPricing(competitorId);

    comparison.competitors.push({
      id: competitorId,
      name: competitor.name,
      plans: pricing
    });

    // Build price matrix
    pricing.forEach(plan => {
      const existing = comparison.priceMatrix.find(p => p.planName === plan.plan);

      if (existing) {
        existing.prices[competitor.name] = plan.price;
      } else {
        comparison.priceMatrix.push({
          planName: plan.plan,
          prices: { [competitor.name]: plan.price }
        });
      }
    });
  }

  return comparison;
}

/**
 * Generate feature comparison
 * @param {Array<string>} competitorIds - Competitor IDs
 * @param {Object} metrics - Features to compare
 * @returns {Promise<Object>} Feature comparison
 */
async function generateFeatureComparison(competitorIds, metrics) {
  const comparison = {
    competitors: [],
    featureMatrix: []
  };

  const features = metrics.features || [];

  for (const competitorId of competitorIds) {
    const competitor = await getCompetitor(competitorId);

    comparison.competitors.push({
      id: competitorId,
      name: competitor.name
    });
  }

  // Build feature matrix
  features.forEach(feature => {
    const row = {
      feature: feature.name,
      values: {}
    };

    competitorIds.forEach((competitorId, index) => {
      const competitorName = comparison.competitors[index].name;
      // In production, this would check actual feature data
      row.values[competitorName] = feature.values?.[competitorId] || false;
    });

    comparison.featureMatrix.push(row);
  });

  return comparison;
}

/**
 * Generate social media comparison
 * @param {Array<string>} competitorIds - Competitor IDs
 * @returns {Promise<Object>} Social comparison
 */
async function generateSocialComparison(competitorIds) {
  const comparison = {
    competitors: [],
    metrics: {
      totalFollowers: {},
      engagementRate: {},
      postFrequency: {}
    }
  };

  for (const competitorId of competitorIds) {
    const competitor = await getCompetitor(competitorId);
    const socialData = await getSocialOverview(competitorId);

    comparison.competitors.push({
      id: competitorId,
      name: competitor.name,
      socialData
    });

    comparison.metrics.totalFollowers[competitor.name] = socialData.totalFollowers;
    comparison.metrics.engagementRate[competitor.name] = socialData.avgEngagementRate;
  }

  return comparison;
}

/**
 * Generate SEO comparison
 * @param {Array<string>} competitorIds - Competitor IDs
 * @returns {Promise<Object>} SEO comparison
 */
async function generateSEOComparison(competitorIds) {
  const comparison = {
    competitors: [],
    metrics: {
      domainAuthority: {},
      organicTraffic: {},
      backlinks: {}
    }
  };

  for (const competitorId of competitorIds) {
    const competitor = await getCompetitor(competitorId);
    const seoData = await getLatestSEOData(competitorId);

    if (seoData) {
      comparison.competitors.push({
        id: competitorId,
        name: competitor.name,
        seoData
      });

      comparison.metrics.domainAuthority[competitor.name] = seoData.domainAuthority;
      comparison.metrics.organicTraffic[competitor.name] = seoData.organicTraffic;
      comparison.metrics.backlinks[competitor.name] = seoData.backlinks;
    }
  }

  return comparison;
}

/**
 * Generate content strategy comparison
 * @param {Array<string>} competitorIds - Competitor IDs
 * @returns {Promise<Object>} Content comparison
 */
async function generateContentComparison(competitorIds) {
  const comparison = {
    competitors: [],
    metrics: {
      publishingFrequency: {},
      contentTypes: {}
    }
  };

  for (const competitorId of competitorIds) {
    const competitor = await getCompetitor(competitorId);
    const contentAnalysis = await analyzeContentFrequency(competitorId);

    comparison.competitors.push({
      id: competitorId,
      name: competitor.name,
      contentAnalysis
    });

    comparison.metrics.publishingFrequency[competitor.name] = contentAnalysis.byWeek;
    comparison.metrics.contentTypes[competitor.name] = contentAnalysis.byType;
  }

  return comparison;
}

/**
 * Generate overall comparison
 * @param {Array<string>} competitorIds - Competitor IDs
 * @returns {Promise<Object>} Overall comparison
 */
async function generateOverallComparison(competitorIds) {
  const [pricing, social, seo, content] = await Promise.all([
    generatePricingComparison(competitorIds),
    generateSocialComparison(competitorIds),
    generateSEOComparison(competitorIds),
    generateContentComparison(competitorIds)
  ]);

  return {
    pricing,
    social,
    seo,
    content
  };
}

/**
 * Generate AI insights from comparison
 * @param {Object} reportData - Report data
 * @param {string} comparisonType - Comparison type
 * @returns {Promise<Array>} Insights
 */
async function generateAIInsights(reportData, comparisonType) {
  try {
    const prompt = `Analyze this competitive comparison and provide strategic insights.

COMPARISON TYPE: ${comparisonType}

DATA:
${JSON.stringify(reportData, null, 2)}

Provide 5-7 key insights in JSON format:
[
  {
    "insight": "clear insight statement",
    "impact": "high|medium|low",
    "recommendation": "specific action to take"
  }
]`;

    const response = await callClaudeAPI(prompt);

    try {
      return JSON.parse(response);
    } catch (parseError) {
      console.error('Failed to parse AI insights:', parseError);
      return [];
    }
  } catch (error) {
    console.error('Error generating AI insights:', error);
    return [];
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
 * Generate visualization configuration
 * @param {Object} reportData - Report data
 * @param {string} comparisonType - Comparison type
 * @returns {Object} Visualization config
 */
function generateVisualizationConfig(reportData, comparisonType) {
  const config = {
    charts: []
  };

  switch (comparisonType) {
    case COMPARISON_TYPES.PRICING:
      config.charts.push({
        type: 'bar',
        title: 'Price Comparison',
        data: reportData.priceMatrix
      });
      break;

    case COMPARISON_TYPES.SOCIAL:
      config.charts.push({
        type: 'bar',
        title: 'Total Followers',
        data: reportData.metrics.totalFollowers
      });
      config.charts.push({
        type: 'radar',
        title: 'Engagement Rate',
        data: reportData.metrics.engagementRate
      });
      break;

    case COMPARISON_TYPES.SEO:
      config.charts.push({
        type: 'bar',
        title: 'Domain Authority',
        data: reportData.metrics.domainAuthority
      });
      config.charts.push({
        type: 'bar',
        title: 'Organic Traffic',
        data: reportData.metrics.organicTraffic
      });
      break;
  }

  return config;
}

/**
 * Get saved comparisons
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Saved comparisons
 */
export async function getSavedComparisons(userId) {
  try {
    const results = await wixData.query(COLLECTIONS.COMPARISONS)
      .eq('userId', userId)
      .descending('createdAt')
      .find();

    return results.items;
  } catch (error) {
    console.error('Error getting saved comparisons:', error);
    throw error;
  }
}

/**
 * Get comparison by ID
 * @param {string} comparisonId - Comparison ID
 * @returns {Promise<Object>} Comparison
 */
export async function getComparison(comparisonId) {
  try {
    return await wixData.get(COLLECTIONS.COMPARISONS, comparisonId);
  } catch (error) {
    console.error('Error getting comparison:', error);
    throw error;
  }
}

/**
 * Update comparison
 * @param {string} comparisonId - Comparison ID
 * @returns {Promise<Object>} Updated comparison
 */
export async function refreshComparison(comparisonId) {
  try {
    const comparison = await getComparison(comparisonId);

    // Regenerate report with latest data
    const reportData = await generateComparisonReport(
      comparison.competitorIds,
      comparison.comparisonType,
      comparison.metrics
    );

    // Generate new insights
    const insights = await generateAIInsights(reportData, comparison.comparisonType);

    const updated = {
      ...comparison,
      reportData,
      insights,
      updatedAt: new Date()
    };

    return await wixData.update(COLLECTIONS.COMPARISONS, updated);
  } catch (error) {
    console.error('Error refreshing comparison:', error);
    throw error;
  }
}

/**
 * Delete comparison
 * @param {string} comparisonId - Comparison ID
 * @returns {Promise<void>}
 */
export async function deleteComparison(comparisonId) {
  try {
    await wixData.remove(COLLECTIONS.COMPARISONS, comparisonId);
  } catch (error) {
    console.error('Error deleting comparison:', error);
    throw error;
  }
}

export default {
  createComparison,
  getSavedComparisons,
  getComparison,
  refreshComparison,
  deleteComparison,
  COMPARISON_TYPES
};
