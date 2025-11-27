/**
 * Analytics Aggregation Service
 * Background jobs for pre-calculating metrics and rollups
 */

/**
 * Aggregate analytics data for a specific period
 * Called by background jobs to pre-calculate metrics
 */
async function aggregatePeriod(prisma, periodType, periodStart, periodEnd) {
  try {
    console.log(`Aggregating ${periodType} data for ${periodStart.toISOString()}`);

    // Get sessions in this period
    const sessions = await prisma.analyticsSession.findMany({
      where: {
        startTime: {
          gte: periodStart,
          lt: periodEnd
        }
      }
    });

    // Get page views in this period
    const pageViews = await prisma.analyticsEvent.count({
      where: {
        eventType: 'page_view',
        timestamp: {
          gte: periodStart,
          lt: periodEnd
        }
      }
    });

    // Get total events
    const totalEvents = await prisma.analyticsEvent.count({
      where: {
        timestamp: {
          gte: periodStart,
          lt: periodEnd
        }
      }
    });

    // Calculate unique visitors
    const uniqueVisitors = new Set(sessions.filter(s => s.userId).map(s => s.userId)).size;

    // Calculate bounce rate
    const bouncedSessions = sessions.filter(s => s.bounced).length;
    const bounceRate = sessions.length > 0 ? (bouncedSessions / sessions.length) * 100 : 0;

    // Calculate average session duration
    const durationsSum = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
    const avgDuration = sessions.length > 0 ? durationsSum / sessions.length : 0;

    // Overall aggregate (no dimension)
    await upsertAggregate(prisma, {
      periodType,
      periodStart,
      periodEnd,
      dimension: null,
      dimensionValue: null,
      visitors: uniqueVisitors,
      sessions: sessions.length,
      pageViews,
      bounceRate,
      avgDuration,
      events: totalEvents
    });

    // Aggregate by source
    await aggregateByDimension(prisma, sessions, periodType, periodStart, periodEnd, 'source', 'utmSource');

    // Aggregate by device
    await aggregateByDimension(prisma, sessions, periodType, periodStart, periodEnd, 'device', 'device');

    // Aggregate by country
    await aggregateByDimension(prisma, sessions, periodType, periodStart, periodEnd, 'country', 'country');

    // Aggregate by landing page
    await aggregateByDimension(prisma, sessions, periodType, periodStart, periodEnd, 'landing_page', 'landingPage');

    // Aggregate by campaign
    await aggregateByDimension(prisma, sessions, periodType, periodStart, periodEnd, 'campaign', 'utmCampaign');

    console.log(`✓ Completed ${periodType} aggregation for ${periodStart.toISOString()}`);
    return { success: true };
  } catch (error) {
    console.error('Error aggregating period:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Aggregate by a specific dimension (source, device, country, etc.)
 */
async function aggregateByDimension(prisma, sessions, periodType, periodStart, periodEnd, dimension, field) {
  // Group sessions by dimension value
  const grouped = {};

  sessions.forEach(session => {
    const value = session[field] || 'Unknown';
    if (!grouped[value]) {
      grouped[value] = [];
    }
    grouped[value].push(session);
  });

  // Create aggregate for each dimension value
  for (const [value, sessionGroup] of Object.entries(grouped)) {
    const uniqueVisitors = new Set(sessionGroup.filter(s => s.userId).map(s => s.userId)).size;
    const bouncedSessions = sessionGroup.filter(s => s.bounced).length;
    const bounceRate = sessionGroup.length > 0 ? (bouncedSessions / sessionGroup.length) * 100 : 0;
    const durationsSum = sessionGroup.reduce((sum, s) => sum + (s.duration || 0), 0);
    const avgDuration = sessionGroup.length > 0 ? durationsSum / sessionGroup.length : 0;

    // Get page views for this dimension
    const sessionIds = sessionGroup.map(s => s.id);
    const pageViews = await prisma.analyticsEvent.count({
      where: {
        sessionId: { in: sessionIds },
        eventType: 'page_view',
        timestamp: {
          gte: periodStart,
          lt: periodEnd
        }
      }
    });

    await upsertAggregate(prisma, {
      periodType,
      periodStart,
      periodEnd,
      dimension,
      dimensionValue: value,
      visitors: uniqueVisitors,
      sessions: sessionGroup.length,
      pageViews,
      bounceRate,
      avgDuration
    });
  }
}

/**
 * Upsert an aggregate record
 */
async function upsertAggregate(prisma, data) {
  try {
    await prisma.analyticsAggregate.upsert({
      where: {
        periodType_periodStart_dimension_dimensionValue: {
          periodType: data.periodType,
          periodStart: data.periodStart,
          dimension: data.dimension,
          dimensionValue: data.dimensionValue
        }
      },
      update: {
        visitors: data.visitors,
        sessions: data.sessions,
        pageViews: data.pageViews,
        bounceRate: data.bounceRate,
        avgDuration: data.avgDuration,
        events: data.events,
        revenue: data.revenue,
        transactions: data.transactions,
        conversions: data.conversions,
        conversionRate: data.conversionRate
      },
      create: {
        periodType: data.periodType,
        periodStart: data.periodStart,
        periodEnd: data.periodEnd,
        dimension: data.dimension,
        dimensionValue: data.dimensionValue,
        visitors: data.visitors || 0,
        sessions: data.sessions || 0,
        pageViews: data.pageViews || 0,
        bounceRate: data.bounceRate,
        avgDuration: data.avgDuration,
        events: data.events,
        revenue: data.revenue,
        transactions: data.transactions,
        conversions: data.conversions,
        conversionRate: data.conversionRate
      }
    });
  } catch (error) {
    console.error('Error upserting aggregate:', error);
  }
}

/**
 * Run hourly aggregation
 * Should be called every hour
 */
async function runHourlyAggregation(prisma) {
  try {
    const now = new Date();
    const currentHour = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), 0, 0, 0);
    const previousHour = new Date(currentHour.getTime() - 60 * 60 * 1000);

    await aggregatePeriod(prisma, 'HOUR', previousHour, currentHour);

    return { success: true };
  } catch (error) {
    console.error('Error running hourly aggregation:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Run daily aggregation
 * Should be called at midnight every day
 */
async function runDailyAggregation(prisma) {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

    await aggregatePeriod(prisma, 'DAY', yesterday, today);

    // Also aggregate by week if it's Monday
    if (now.getDay() === 1) {
      const weekStart = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      await aggregatePeriod(prisma, 'WEEK', weekStart, today);
    }

    // Also aggregate by month if it's the 1st
    if (now.getDate() === 1) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth(), 1);
      await aggregatePeriod(prisma, 'MONTH', monthStart, monthEnd);
    }

    return { success: true };
  } catch (error) {
    console.error('Error running daily aggregation:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Clean up old raw events
 * Delete events older than 90 days to save storage
 */
async function cleanupOldEvents(prisma, retentionDays = 90) {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const result = await prisma.analyticsEvent.deleteMany({
      where: {
        timestamp: {
          lt: cutoffDate
        }
      }
    });

    console.log(`✓ Deleted ${result.count} events older than ${retentionDays} days`);
    return { success: true, deleted: result.count };
  } catch (error) {
    console.error('Error cleaning up old events:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Clean up old sessions
 * Delete sessions older than 90 days
 */
async function cleanupOldSessions(prisma, retentionDays = 90) {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const result = await prisma.analyticsSession.deleteMany({
      where: {
        startTime: {
          lt: cutoffDate
        }
      }
    });

    console.log(`✓ Deleted ${result.count} sessions older than ${retentionDays} days`);
    return { success: true, deleted: result.count };
  } catch (error) {
    console.error('Error cleaning up old sessions:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Query aggregated data (faster than raw events)
 */
async function queryAggregates(prisma, options) {
  try {
    const {
      periodType = 'DAY',
      startDate,
      endDate,
      dimension = null,
      dimensionValue = null
    } = options;

    const where = {
      periodType,
      periodStart: {
        gte: startDate,
        lte: endDate
      }
    };

    if (dimension) {
      where.dimension = dimension;
    }

    if (dimensionValue) {
      where.dimensionValue = dimensionValue;
    }

    const aggregates = await prisma.analyticsAggregate.findMany({
      where,
      orderBy: {
        periodStart: 'asc'
      }
    });

    return aggregates;
  } catch (error) {
    console.error('Error querying aggregates:', error);
    throw error;
  }
}

/**
 * Get aggregated stats (uses pre-calculated aggregates for speed)
 */
async function getAggregatedStats(prisma, dateRange = 'last_7_days') {
  try {
    const { startDate, endDate } = parseDateRange(dateRange);

    // Try to use aggregates first
    const aggregates = await queryAggregates(prisma, {
      periodType: 'DAY',
      startDate,
      endDate,
      dimension: null
    });

    if (aggregates.length > 0) {
      // Calculate totals from aggregates
      const totals = aggregates.reduce((acc, agg) => ({
        visitors: acc.visitors + agg.visitors,
        sessions: acc.sessions + agg.sessions,
        pageViews: acc.pageViews + agg.pageViews,
        totalDuration: acc.totalDuration + (agg.avgDuration * agg.sessions),
        sessionCount: acc.sessionCount + agg.sessions,
        totalBounces: acc.totalBounces + ((agg.bounceRate / 100) * agg.sessions)
      }), { visitors: 0, sessions: 0, pageViews: 0, totalDuration: 0, sessionCount: 0, totalBounces: 0 });

      return {
        visitors: totals.visitors,
        sessions: totals.sessions,
        pageViews: totals.pageViews,
        avgSessionDuration: totals.sessionCount > 0 ? totals.totalDuration / totals.sessionCount : 0,
        bounceRate: totals.sessions > 0 ? (totals.totalBounces / totals.sessions) * 100 : 0,
        source: 'aggregates'
      };
    }

    // Fallback to raw data if no aggregates available
    return null;
  } catch (error) {
    console.error('Error getting aggregated stats:', error);
    throw error;
  }
}

/**
 * Helper: Parse date range string
 */
function parseDateRange(range) {
  const now = new Date();
  let startDate, endDate = now;

  switch (range) {
    case 'today':
      startDate = new Date(now.setHours(0, 0, 0, 0));
      break;
    case 'yesterday':
      startDate = new Date(now.setDate(now.getDate() - 1));
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate);
      endDate.setHours(23, 59, 59, 999);
      break;
    case 'last_7_days':
      startDate = new Date(now.setDate(now.getDate() - 7));
      break;
    case 'last_30_days':
      startDate = new Date(now.setDate(now.getDate() - 30));
      break;
    case 'last_90_days':
      startDate = new Date(now.setDate(now.getDate() - 90));
      break;
    case 'this_month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'last_month':
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), 0);
      break;
    default:
      startDate = new Date(now.setDate(now.getDate() - 7));
  }

  return { startDate, endDate };
}

/**
 * Initialize background jobs
 * Call this when the server starts
 */
function initializeAggregationJobs(prisma) {
  console.log('📊 Initializing analytics aggregation jobs...');

  // Run hourly aggregation every hour
  setInterval(async () => {
    console.log('Running hourly aggregation...');
    await runHourlyAggregation(prisma);
  }, 60 * 60 * 1000); // Every hour

  // Run daily aggregation at midnight
  const now = new Date();
  const midnight = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    0, 0, 0, 0
  );
  const msUntilMidnight = midnight - now;

  setTimeout(() => {
    runDailyAggregation(prisma);
    // Then run every 24 hours
    setInterval(() => {
      runDailyAggregation(prisma);
    }, 24 * 60 * 60 * 1000);
  }, msUntilMidnight);

  // Clean up old data once a week (Sunday at 3am)
  const getNextSunday3am = () => {
    const date = new Date();
    date.setHours(3, 0, 0, 0);
    const daysUntilSunday = (7 - date.getDay()) % 7;
    date.setDate(date.getDate() + daysUntilSunday);
    return date;
  };

  const nextCleanup = getNextSunday3am();
  const msUntilCleanup = nextCleanup - now;

  setTimeout(() => {
    cleanupOldEvents(prisma);
    cleanupOldSessions(prisma);
    // Then run every week
    setInterval(() => {
      cleanupOldEvents(prisma);
      cleanupOldSessions(prisma);
    }, 7 * 24 * 60 * 60 * 1000);
  }, msUntilCleanup);

  console.log('✓ Analytics aggregation jobs initialized');
  console.log(`  - Hourly aggregation: Every hour`);
  console.log(`  - Daily aggregation: At midnight`);
  console.log(`  - Weekly cleanup: Sundays at 3am`);
}

module.exports = {
  aggregatePeriod,
  runHourlyAggregation,
  runDailyAggregation,
  cleanupOldEvents,
  cleanupOldSessions,
  queryAggregates,
  getAggregatedStats,
  initializeAggregationJobs
};
