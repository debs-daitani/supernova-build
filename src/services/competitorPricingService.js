/**
 * SUPERNova Competitor Tracker - Pricing Service
 *
 * Pricing intelligence:
 * - Track pricing changes
 * - Monitor new plans
 * - Detect discounts/promotions
 * - Compare pricing across competitors
 * - Pricing history and trends
 */

import wixData from 'wix-data';
import { getCompetitor } from './competitorService';
import { createSnapshot } from './competitorMonitoringService';
import { createAlert } from './competitorAlertService';

const COLLECTIONS = {
  PRICING: 'CompetitorPricing'
};

/**
 * Monitor competitor pricing
 * @param {string} competitorId - Competitor ID
 * @returns {Promise<Object>} Monitoring result
 */
export async function monitorPricing(competitorId) {
  try {
    const competitor = await getCompetitor(competitorId);

    // In production, this would scrape the pricing page
    // For now, we'll use placeholder logic

    // Get current pricing
    const currentPricing = await getCurrentPricing(competitorId);

    // Fetch new pricing data (would scrape pricing page)
    // const newPricing = await scrapePricingPage(competitor.website + '/pricing');

    // For demo purposes, return placeholder
    return {
      changes: 0,
      alerts: 0
    };
  } catch (error) {
    console.error('Error monitoring pricing:', error);
    throw error;
  }
}

/**
 * Get current pricing for competitor
 * @param {string} competitorId - Competitor ID
 * @returns {Promise<Array>} Current pricing plans
 */
export async function getCurrentPricing(competitorId) {
  try {
    const results = await wixData.query(COLLECTIONS.PRICING)
      .eq('competitorId', competitorId)
      .descending('capturedAt')
      .find();

    // Group by plan name to get latest version of each plan
    const planMap = new Map();

    results.items.forEach(pricing => {
      const key = `${pricing.productName}_${pricing.plan}`;
      if (!planMap.has(key)) {
        planMap.set(key, pricing);
      }
    });

    return Array.from(planMap.values());
  } catch (error) {
    console.error('Error getting current pricing:', error);
    throw error;
  }
}

/**
 * Add pricing record
 * @param {string} competitorId - Competitor ID
 * @param {Object} pricingData - Pricing data
 * @returns {Promise<Object>} Created pricing record
 */
export async function addPricing(competitorId, pricingData) {
  try {
    // Get previous pricing for this plan
    const previous = await getPlanPricing(
      competitorId,
      pricingData.productName,
      pricingData.plan
    );

    // Calculate changes
    let changes = {};
    let previousPrice = null;
    let priceChangePercentage = 0;

    if (previous) {
      previousPrice = previous.price;

      if (previous.price !== pricingData.price) {
        const change = pricingData.price - previous.price;
        priceChangePercentage = (change / previous.price) * 100;

        changes.price = {
          old: previous.price,
          new: pricingData.price,
          change,
          percentage: priceChangePercentage
        };
      }

      // Check for feature changes
      if (JSON.stringify(previous.features) !== JSON.stringify(pricingData.features)) {
        changes.features = {
          old: previous.features,
          new: pricingData.features
        };
      }
    }

    const pricing = {
      competitorId,
      productName: pricingData.productName,
      plan: pricingData.plan,
      price: pricingData.price,
      currency: pricingData.currency || 'GBP',
      billingCycle: pricingData.billingCycle || 'monthly',
      features: pricingData.features || [],
      limitations: pricingData.limitations || {},
      promotion: pricingData.promotion || '',
      changes,
      previousPrice,
      priceChangePercentage,
      effectiveDate: pricingData.effectiveDate || new Date(),
      capturedAt: new Date()
    };

    return await wixData.insert(COLLECTIONS.PRICING, pricing);
  } catch (error) {
    console.error('Error adding pricing:', error);
    throw error;
  }
}

/**
 * Get pricing for a specific plan
 * @param {string} competitorId - Competitor ID
 * @param {string} productName - Product name
 * @param {string} plan - Plan name
 * @returns {Promise<Object|null>} Latest pricing for plan
 */
async function getPlanPricing(competitorId, productName, plan) {
  try {
    const results = await wixData.query(COLLECTIONS.PRICING)
      .eq('competitorId', competitorId)
      .eq('productName', productName)
      .eq('plan', plan)
      .descending('capturedAt')
      .limit(1)
      .find();

    return results.items.length > 0 ? results.items[0] : null;
  } catch (error) {
    console.error('Error getting plan pricing:', error);
    return null;
  }
}

/**
 * Get pricing history for a plan
 * @param {string} competitorId - Competitor ID
 * @param {string} productName - Product name
 * @param {string} plan - Plan name
 * @returns {Promise<Array>} Pricing history
 */
export async function getPricingHistory(competitorId, productName, plan) {
  try {
    const results = await wixData.query(COLLECTIONS.PRICING)
      .eq('competitorId', competitorId)
      .eq('productName', productName)
      .eq('plan', plan)
      .descending('capturedAt')
      .find();

    return results.items;
  } catch (error) {
    console.error('Error getting pricing history:', error);
    throw error;
  }
}

/**
 * Compare pricing across competitors
 * @param {Array<string>} competitorIds - Competitor IDs
 * @param {string} planLevel - Plan level to compare (e.g., 'basic', 'pro')
 * @returns {Promise<Object>} Pricing comparison
 */
export async function comparePricing(competitorIds, planLevel = null) {
  try {
    const comparison = {
      competitors: [],
      priceRange: { min: Infinity, max: -Infinity },
      average: 0
    };

    for (const competitorId of competitorIds) {
      const pricing = await getCurrentPricing(competitorId);
      const competitor = await getCompetitor(competitorId);

      const competitorData = {
        id: competitorId,
        name: competitor.name,
        plans: pricing
      };

      // Track price range
      pricing.forEach(plan => {
        if (plan.price < comparison.priceRange.min) {
          comparison.priceRange.min = plan.price;
        }
        if (plan.price > comparison.priceRange.max) {
          comparison.priceRange.max = plan.price;
        }
      });

      comparison.competitors.push(competitorData);
    }

    // Calculate average
    const allPrices = comparison.competitors.flatMap(c => c.plans.map(p => p.price));
    comparison.average = allPrices.reduce((a, b) => a + b, 0) / allPrices.length;

    return comparison;
  } catch (error) {
    console.error('Error comparing pricing:', error);
    throw error;
  }
}

/**
 * Analyze pricing trends
 * @param {string} competitorId - Competitor ID
 * @returns {Promise<Object>} Pricing trends
 */
export async function analyzePricingTrends(competitorId) {
  try {
    const allPricing = await wixData.query(COLLECTIONS.PRICING)
      .eq('competitorId', competitorId)
      .descending('capturedAt')
      .find();

    const trends = {
      totalChanges: 0,
      priceIncreases: 0,
      priceDecreases: 0,
      newPlans: 0,
      averageChange: 0,
      recentChanges: []
    };

    const changes = [];

    allPricing.items.forEach(pricing => {
      if (pricing.priceChangePercentage !== 0) {
        trends.totalChanges++;

        if (pricing.priceChangePercentage > 0) {
          trends.priceIncreases++;
        } else {
          trends.priceDecreases++;
        }

        changes.push(pricing.priceChangePercentage);

        if (trends.recentChanges.length < 5) {
          trends.recentChanges.push({
            plan: pricing.plan,
            oldPrice: pricing.previousPrice,
            newPrice: pricing.price,
            change: pricing.priceChangePercentage,
            date: pricing.capturedAt
          });
        }
      }
    });

    if (changes.length > 0) {
      trends.averageChange = changes.reduce((a, b) => a + b, 0) / changes.length;
    }

    return trends;
  } catch (error) {
    console.error('Error analyzing pricing trends:', error);
    throw error;
  }
}

/**
 * Get pricing alerts
 * @param {string} competitorId - Competitor ID
 * @param {number} daysBack - Days to look back
 * @returns {Promise<Array>} Recent pricing changes
 */
export async function getPricingAlerts(competitorId, daysBack = 30) {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysBack);

    const results = await wixData.query(COLLECTIONS.PRICING)
      .eq('competitorId', competitorId)
      .ge('capturedAt', cutoffDate)
      .find();

    return results.items.filter(p => p.priceChangePercentage !== 0);
  } catch (error) {
    console.error('Error getting pricing alerts:', error);
    throw error;
  }
}

export default {
  monitorPricing,
  getCurrentPricing,
  addPricing,
  getPricingHistory,
  comparePricing,
  analyzePricingTrends,
  getPricingAlerts
};
