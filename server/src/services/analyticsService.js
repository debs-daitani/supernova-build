/**
 * Analytics Tracking Service
 * Track events, sessions, and user behavior
 */

const UAParser = require('ua-parser-js');

/**
 * Track an analytics event
 */
async function trackEvent(prisma, eventData) {
  try {
    const {
      userId,
      sessionId,
      eventType,
      eventCategory,
      eventAction,
      eventLabel,
      eventValue,
      pagePath,
      pageTitle,
      referrer,
      utmParams,
      ipAddress,
      userAgent,
      metadata
    } = eventData;

    // Parse user agent for device/browser info
    const deviceInfo = parseUserAgent(userAgent);

    // Get location from IP (simplified - in production use geolocation service)
    const locationInfo = await getLocationFromIP(ipAddress);

    // Create event
    const event = await prisma.analyticsEvent.create({
      data: {
        userId,
        sessionId,
        eventType,
        eventCategory,
        eventAction,
        eventLabel,
        eventValue,
        pagePath,
        pageTitle,
        referrer,

        // UTM parameters
        utmSource: utmParams?.utm_source,
        utmMedium: utmParams?.utm_medium,
        utmCampaign: utmParams?.utm_campaign,
        utmContent: utmParams?.utm_content,
        utmTerm: utmParams?.utm_term,

        // Technical
        ipAddress,
        userAgent,
        device: deviceInfo.device,
        browser: deviceInfo.browser,
        os: deviceInfo.os,
        screenResolution: deviceInfo.screenResolution,
        language: deviceInfo.language,

        // Location
        country: locationInfo.country,
        region: locationInfo.region,
        city: locationInfo.city,
        latitude: locationInfo.latitude,
        longitude: locationInfo.longitude,

        // Metadata
        metadata
      }
    });

    // Update session
    await updateSession(prisma, sessionId, {
      eventCount: { increment: 1 },
      endTime: new Date()
    });

    // If page view, increment page views
    if (eventType === 'page_view') {
      await updateSession(prisma, sessionId, {
        pageViews: { increment: 1 },
        exitPage: pagePath
      });
    }

    // Update real-time active users
    if (userId || sessionId) {
      await updateActiveUser(prisma, sessionId, userId, pagePath, deviceInfo, locationInfo);
    }

    return { success: true, event };
  } catch (error) {
    console.error('Error tracking event:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Create or update analytics session
 */
async function createSession(prisma, sessionData) {
  try {
    const {
      sessionId,
      userId,
      landingPage,
      referrer,
      utmParams,
      ipAddress,
      userAgent
    } = sessionData;

    const deviceInfo = parseUserAgent(userAgent);
    const locationInfo = await getLocationFromIP(ipAddress);

    // Check if session exists
    const existing = await prisma.analyticsSession.findUnique({
      where: { id: sessionId }
    });

    if (existing) {
      return { success: true, session: existing };
    }

    // Create new session
    const session = await prisma.analyticsSession.create({
      data: {
        id: sessionId,
        userId,
        landingPage,
        referrer,

        // UTM parameters
        utmSource: utmParams?.utm_source,
        utmMedium: utmParams?.utm_medium,
        utmCampaign: utmParams?.utm_campaign,
        utmContent: utmParams?.utm_content,
        utmTerm: utmParams?.utm_term,

        // Device info
        device: deviceInfo.device,
        browser: deviceInfo.browser,
        os: deviceInfo.os,

        // Location
        country: locationInfo.country,
        city: locationInfo.city,

        // Technical
        ipAddress,
        userAgent
      }
    });

    return { success: true, session };
  } catch (error) {
    console.error('Error creating session:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Update session
 */
async function updateSession(prisma, sessionId, updates) {
  try {
    await prisma.analyticsSession.update({
      where: { id: sessionId },
      data: updates
    });
  } catch (error) {
    // Session might not exist yet, ignore
  }
}

/**
 * End session and calculate metrics
 */
async function endSession(prisma, sessionId) {
  try {
    const session = await prisma.analyticsSession.findUnique({
      where: { id: sessionId }
    });

    if (!session) return;

    const endTime = new Date();
    const duration = Math.floor((endTime - session.startTime) / 1000); // seconds

    // Determine if bounced (1 page view and < 10 seconds)
    const bounced = session.pageViews === 1 && duration < 10;

    await prisma.analyticsSession.update({
      where: { id: sessionId },
      data: {
        endTime,
        duration,
        bounced
      }
    });

    // Remove from active users
    await prisma.activeUser.deleteMany({
      where: { sessionId }
    });
  } catch (error) {
    console.error('Error ending session:', error);
  }
}

/**
 * Update active users (for real-time tracking)
 */
async function updateActiveUser(prisma, sessionId, userId, currentPage, deviceInfo, locationInfo) {
  try {
    await prisma.activeUser.upsert({
      where: { sessionId },
      update: {
        currentPage,
        lastActivity: new Date()
      },
      create: {
        sessionId,
        userId,
        currentPage,
        device: deviceInfo.device,
        country: locationInfo.country,
        city: locationInfo.city
      }
    });

    // Clean up stale active users (inactive for > 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    await prisma.activeUser.deleteMany({
      where: {
        lastActivity: {
          lt: fiveMinutesAgo
        }
      }
    });
  } catch (error) {
    console.error('Error updating active user:', error);
  }
}

/**
 * Get dashboard overview stats
 */
async function getDashboardOverview(prisma, dateRange = 'last_7_days') {
  try {
    const { startDate, endDate } = parseDateRange(dateRange);

    // Get current period stats
    const [
      totalVisitors,
      totalSessions,
      totalPageViews,
      avgSessionDuration,
      bounceRate,
      activeUsers
    ] = await Promise.all([
      // Unique visitors
      prisma.analyticsSession.count({
        where: {
          startTime: {
            gte: startDate,
            lte: endDate
          }
        },
        distinct: ['userId']
      }),

      // Total sessions
      prisma.analyticsSession.count({
        where: {
          startTime: {
            gte: startDate,
            lte: endDate
          }
        }
      }),

      // Total page views
      prisma.analyticsEvent.count({
        where: {
          eventType: 'page_view',
          timestamp: {
            gte: startDate,
            lte: endDate
          }
        }
      }),

      // Average session duration
      prisma.analyticsSession.aggregate({
        where: {
          startTime: {
            gte: startDate,
            lte: endDate
          },
          duration: {
            not: null
          }
        },
        _avg: {
          duration: true
        }
      }),

      // Bounce rate
      calculateBounceRate(prisma, startDate, endDate),

      // Active users (real-time)
      prisma.activeUser.count()
    ]);

    // Get previous period for comparison
    const previousPeriod = getPreviousPeriod(startDate, endDate);
    const previousVisitors = await prisma.analyticsSession.count({
      where: {
        startTime: {
          gte: previousPeriod.startDate,
          lte: previousPeriod.endDate
        }
      },
      distinct: ['userId']
    });

    // Calculate percentage changes
    const visitorChange = calculatePercentageChange(totalVisitors, previousVisitors);

    return {
      current: {
        visitors: totalVisitors,
        sessions: totalSessions,
        pageViews: totalPageViews,
        avgSessionDuration: avgSessionDuration._avg.duration || 0,
        bounceRate,
        activeUsers
      },
      changes: {
        visitorsChange: visitorChange
      }
    };
  } catch (error) {
    console.error('Error getting dashboard overview:', error);
    throw error;
  }
}

/**
 * Get traffic sources
 */
async function getTrafficSources(prisma, dateRange = 'last_7_days') {
  try {
    const { startDate, endDate } = parseDateRange(dateRange);

    const sources = await prisma.analyticsSession.groupBy({
      by: ['utmSource'],
      where: {
        startTime: {
          gte: startDate,
          lte: endDate
        },
        utmSource: {
          not: null
        }
      },
      _count: true
    });

    // Also get direct traffic (no UTM source)
    const directTraffic = await prisma.analyticsSession.count({
      where: {
        startTime: {
          gte: startDate,
          lte: endDate
        },
        utmSource: null
      }
    });

    return [
      ...sources.map(s => ({
        source: s.utmSource,
        sessions: s._count
      })),
      {
        source: 'Direct',
        sessions: directTraffic
      }
    ].sort((a, b) => b.sessions - a.sessions);
  } catch (error) {
    console.error('Error getting traffic sources:', error);
    throw error;
  }
}

/**
 * Get top pages
 */
async function getTopPages(prisma, dateRange = 'last_7_days', limit = 10) {
  try {
    const { startDate, endDate } = parseDateRange(dateRange);

    const pages = await prisma.analyticsEvent.groupBy({
      by: ['pagePath'],
      where: {
        eventType: 'page_view',
        timestamp: {
          gte: startDate,
          lte: endDate
        },
        pagePath: {
          not: null
        }
      },
      _count: true,
      orderBy: {
        _count: {
          pagePath: 'desc'
        }
      },
      take: limit
    });

    return pages.map(p => ({
      path: p.pagePath,
      views: p._count
    }));
  } catch (error) {
    console.error('Error getting top pages:', error);
    throw error;
  }
}

/**
 * Get device breakdown
 */
async function getDeviceBreakdown(prisma, dateRange = 'last_7_days') {
  try {
    const { startDate, endDate } = parseDateRange(dateRange);

    const devices = await prisma.analyticsSession.groupBy({
      by: ['device'],
      where: {
        startTime: {
          gte: startDate,
          lte: endDate
        }
      },
      _count: true
    });

    return devices.map(d => ({
      device: d.device || 'Unknown',
      sessions: d._count
    }));
  } catch (error) {
    console.error('Error getting device breakdown:', error);
    throw error;
  }
}

/**
 * Get geographic distribution
 */
async function getGeographicData(prisma, dateRange = 'last_7_days') {
  try {
    const { startDate, endDate } = parseDateRange(dateRange);

    const countries = await prisma.analyticsSession.groupBy({
      by: ['country'],
      where: {
        startTime: {
          gte: startDate,
          lte: endDate
        },
        country: {
          not: null
        }
      },
      _count: true,
      orderBy: {
        _count: {
          country: 'desc'
        }
      }
    });

    return countries.map(c => ({
      country: c.country,
      sessions: c._count
    }));
  } catch (error) {
    console.error('Error getting geographic data:', error);
    throw error;
  }
}

/**
 * Get visitors over time (for chart)
 */
async function getVisitorsOverTime(prisma, dateRange = 'last_7_days') {
  try {
    const { startDate, endDate } = parseDateRange(dateRange);

    // Get sessions grouped by date
    const sessions = await prisma.analyticsSession.findMany({
      where: {
        startTime: {
          gte: startDate,
          lte: endDate
        }
      },
      select: {
        startTime: true
      }
    });

    // Group by date
    const byDate = {};
    sessions.forEach(session => {
      const date = session.startTime.toISOString().split('T')[0];
      byDate[date] = (byDate[date] || 0) + 1;
    });

    // Convert to array
    return Object.entries(byDate).map(([date, count]) => ({
      date,
      visitors: count
    })).sort((a, b) => a.date.localeCompare(b.date));
  } catch (error) {
    console.error('Error getting visitors over time:', error);
    throw error;
  }
}

/**
 * Track funnel progress
 */
async function trackFunnelProgress(prisma, funnelId, userId, sessionId, step) {
  try {
    // Find existing completion
    let completion = await prisma.funnelCompletion.findFirst({
      where: {
        funnelId,
        sessionId
      }
    });

    if (!completion) {
      // Create new completion
      completion = await prisma.funnelCompletion.create({
        data: {
          funnelId,
          userId,
          sessionId,
          currentStep: step,
          completedSteps: [step]
        }
      });
    } else {
      // Update existing completion
      const completedSteps = Array.from(new Set([...completion.completedSteps, step]));

      await prisma.funnelCompletion.update({
        where: { id: completion.id },
        data: {
          currentStep: step,
          completedSteps
        }
      });
    }

    // Check if funnel is complete
    const funnel = await prisma.conversionFunnel.findUnique({
      where: { id: funnelId }
    });

    if (funnel && completion.completedSteps.length === funnel.steps.length) {
      await prisma.funnelCompletion.update({
        where: { id: completion.id },
        data: {
          isCompleted: true,
          completedAt: new Date()
        }
      });
    }

    return { success: true, completion };
  } catch (error) {
    console.error('Error tracking funnel progress:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Helper: Parse user agent string
 */
function parseUserAgent(userAgent) {
  if (!userAgent) {
    return {
      device: 'Unknown',
      browser: 'Unknown',
      os: 'Unknown'
    };
  }

  const parser = new UAParser(userAgent);
  const result = parser.getResult();

  return {
    device: result.device.type || 'desktop',
    browser: result.browser.name || 'Unknown',
    os: result.os.name || 'Unknown',
    screenResolution: null,
    language: null
  };
}

/**
 * Helper: Get location from IP address
 * Simplified version - in production use a geolocation API
 */
async function getLocationFromIP(ipAddress) {
  // This is a placeholder - integrate with IP geolocation service
  // e.g., MaxMind GeoIP2, IP2Location, ipapi.co
  return {
    country: null,
    region: null,
    city: null,
    latitude: null,
    longitude: null
  };
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
 * Helper: Calculate bounce rate
 */
async function calculateBounceRate(prisma, startDate, endDate) {
  const [total, bounced] = await Promise.all([
    prisma.analyticsSession.count({
      where: {
        startTime: {
          gte: startDate,
          lte: endDate
        }
      }
    }),
    prisma.analyticsSession.count({
      where: {
        startTime: {
          gte: startDate,
          lte: endDate
        },
        bounced: true
      }
    })
  ]);

  return total > 0 ? (bounced / total) * 100 : 0;
}

/**
 * Helper: Calculate percentage change
 */
function calculatePercentageChange(current, previous) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

/**
 * Helper: Get previous period
 */
function getPreviousPeriod(startDate, endDate) {
  const duration = endDate - startDate;
  return {
    startDate: new Date(startDate - duration),
    endDate: new Date(startDate)
  };
}

module.exports = {
  trackEvent,
  createSession,
  updateSession,
  endSession,
  updateActiveUser,
  getDashboardOverview,
  getTrafficSources,
  getTopPages,
  getDeviceBreakdown,
  getGeographicData,
  getVisitorsOverTime,
  trackFunnelProgress
};
