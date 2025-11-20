/**
 * Trend Service
 *
 * Tracks and analyzes viral trends
 */

import { PrismaClient, SocialPlatform, TrendStatus, Prisma } from '@prisma/client';
import OpenAI from 'openai';

const prisma = new PrismaClient();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface TrendInput {
  platform: SocialPlatform;
  trend: string;
  category?: string;
  startDate: Date;
  howToCapitalize?: string;
}

export class TrendService {
  /**
   * Create a new trend
   */
  static async createTrend(input: TrendInput) {
    return await prisma.viralTrend.create({
      data: {
        platform: input.platform,
        trend: input.trend,
        category: input.category,
        startDate: input.startDate,
        status: 'RISING',
        howToCapitalize: input.howToCapitalize,
      },
    });
  }

  /**
   * Get current trends
   */
  static async getCurrentTrends(filters: {
    platform?: SocialPlatform;
    category?: string;
    status?: TrendStatus;
  } = {}) {
    const where: Prisma.ViralTrendWhereInput = {};

    if (filters.platform) {
      where.platform = filters.platform;
    }

    if (filters.category) {
      where.category = filters.category;
    }

    if (filters.status) {
      where.status = filters.status;
    } else {
      // By default, show only active trends (not dead)
      where.status = { in: ['RISING', 'PEAK', 'DECLINING'] };
    }

    return await prisma.viralTrend.findMany({
      where,
      orderBy: [
        { status: 'asc' }, // RISING first, then PEAK, then DECLINING
        { peakDate: 'desc' },
        { startDate: 'desc' },
      ],
      include: {
        exampleContent: {
          take: 5,
          orderBy: { viralScore: 'desc' },
        },
      },
    });
  }

  /**
   * Get trend by ID
   */
  static async getTrendById(id: string) {
    return await prisma.viralTrend.findUnique({
      where: { id },
      include: {
        exampleContent: {
          take: 10,
          orderBy: { viralScore: 'desc' },
        },
      },
    });
  }

  /**
   * Discover new trends from recent viral content
   */
  static async discoverTrends(platform?: SocialPlatform) {
    // Get recent viral content (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const where: Prisma.ViralContentWhereInput = {
      discoveredAt: { gte: sevenDaysAgo },
      viralScore: { gte: 60 },
    };

    if (platform) {
      where.platform = platform;
    }

    const recentViral = await prisma.viralContent.findMany({
      where,
      orderBy: { viralScore: 'desc' },
      take: 100,
      include: {
        analyses: true,
      },
    });

    if (recentViral.length < 10) {
      return [];
    }

    // Use AI to identify emerging trends
    const trends = await this.identifyTrendsWithAI(recentViral);

    // Create new trends
    const createdTrends = await Promise.all(
      trends.map(async (trend: any) => {
        // Check if trend already exists
        const existing = await prisma.viralTrend.findFirst({
          where: {
            platform: trend.platform,
            trend: {
              contains: trend.trend,
              mode: 'insensitive',
            },
            status: { not: 'DEAD' },
          },
        });

        if (existing) {
          // Update existing trend
          return await this.updateTrendStatus(existing.id);
        }

        // Create new trend
        return await prisma.viralTrend.create({
          data: {
            platform: trend.platform,
            trend: trend.trend,
            category: trend.category,
            startDate: new Date(),
            status: 'RISING',
            howToCapitalize: trend.howToCapitalize,
          },
        });
      })
    );

    return createdTrends;
  }

  /**
   * Use AI to identify trends
   */
  private static async identifyTrendsWithAI(viralContent: any[]): Promise<any[]> {
    const contentSummary = viralContent.map(content => ({
      platform: content.platform,
      title: content.title,
      caption: content.caption?.substring(0, 150),
      hashtags: content.hashtags,
      topic: content.topic,
      viralScore: content.viralScore,
      publishedAt: content.publishedAt,
    }));

    const prompt = `Analyze these ${viralContent.length} recent viral posts and identify emerging trends:

RECENT VIRAL CONTENT:
${JSON.stringify(contentSummary, null, 2)}

Identify 3-7 emerging trends. Look for:
- Repeated topics/themes
- Common hashtags gaining traction
- Similar content formats going viral
- Shared cultural moments/events
- New challenges or movements

For each trend, provide:
1. Platform where it's trending
2. Trend name (concise, descriptive)
3. Category (business, lifestyle, tech, entertainment, etc.)
4. How to capitalize on it (specific, actionable advice)

Return as JSON array:
[
  {
    "platform": "TWITTER",
    "trend": "Deinfluencing",
    "category": "lifestyle",
    "howToCapitalize": "Create content telling your audience what NOT to buy in your niche. Be honest and helpful, suggest better alternatives. Post now before trend is oversaturated (2-3 week window)."
  }
]`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(response.choices[0].message.content || '{"trends": []}');
    return result.trends || [];
  }

  /**
   * Update trend status
   */
  static async updateTrendStatus(trendId: string) {
    const trend = await prisma.viralTrend.findUnique({
      where: { id: trendId },
      include: {
        exampleContent: {
          where: {
            discoveredAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
            },
          },
        },
      },
    });

    if (!trend) {
      throw new Error('Trend not found');
    }

    const daysSinceStart = Math.floor(
      (new Date().getTime() - new Date(trend.startDate).getTime()) / (1000 * 60 * 60 * 24)
    );

    let newStatus: TrendStatus = trend.status;
    let peakDate = trend.peakDate;
    let endDate = trend.endDate;

    // Analyze trend lifecycle based on recent content volume
    const recentContentCount = trend.exampleContent.length;

    if (recentContentCount === 0 && daysSinceStart > 14) {
      // Trend is dead if no content in last 7 days and been around for 2+ weeks
      newStatus = 'DEAD';
      endDate = new Date();
    } else if (recentContentCount > 20 && daysSinceStart < 7) {
      // High volume + recent = rising or peak
      newStatus = daysSinceStart < 3 ? 'RISING' : 'PEAK';
      if (newStatus === 'PEAK' && !peakDate) {
        peakDate = new Date();
      }
    } else if (recentContentCount < 10 && daysSinceStart > 7) {
      // Low volume + older = declining
      newStatus = 'DECLINING';
    } else if (trend.status === 'PEAK' && recentContentCount < 15) {
      // Was at peak but declining
      newStatus = 'DECLINING';
    }

    return await prisma.viralTrend.update({
      where: { id: trendId },
      data: {
        status: newStatus,
        peakDate,
        endDate,
      },
    });
  }

  /**
   * Link viral content to trend
   */
  static async linkContentToTrend(trendId: string, viralContentId: string) {
    const trend = await prisma.viralTrend.findUnique({
      where: { id: trendId },
    });

    if (!trend) {
      throw new Error('Trend not found');
    }

    return await prisma.viralTrend.update({
      where: { id: trendId },
      data: {
        exampleContent: {
          connect: { id: viralContentId },
        },
      },
    });
  }

  /**
   * Get trend statistics
   */
  static async getTrendStats(trendId: string) {
    const trend = await prisma.viralTrend.findUnique({
      where: { id: trendId },
      include: {
        exampleContent: true,
      },
    });

    if (!trend) {
      throw new Error('Trend not found');
    }

    const totalViralScore = trend.exampleContent.reduce((sum, content) => sum + content.viralScore, 0);
    const avgViralScore = trend.exampleContent.length > 0 ? totalViralScore / trend.exampleContent.length : 0;

    const daysSinceStart = Math.floor(
      (new Date().getTime() - new Date(trend.startDate).getTime()) / (1000 * 60 * 60 * 24)
    );

    const daysUntilPeak = trend.peakDate
      ? Math.floor(
          (new Date(trend.peakDate).getTime() - new Date(trend.startDate).getTime()) / (1000 * 60 * 60 * 24)
        )
      : null;

    let estimatedTimeRemaining = 'Unknown';
    if (trend.status === 'RISING') {
      estimatedTimeRemaining = '1-2 weeks';
    } else if (trend.status === 'PEAK') {
      estimatedTimeRemaining = '3-7 days';
    } else if (trend.status === 'DECLINING') {
      estimatedTimeRemaining = '1-3 days';
    } else {
      estimatedTimeRemaining = 'Trend ended';
    }

    return {
      trendId: trend.id,
      trend: trend.trend,
      platform: trend.platform,
      status: trend.status,
      exampleCount: trend.exampleContent.length,
      avgViralScore,
      daysSinceStart,
      daysUntilPeak,
      estimatedTimeRemaining,
      urgency: trend.status === 'PEAK' || trend.status === 'DECLINING' ? 'HIGH' : 'MEDIUM',
    };
  }

  /**
   * Get trending topics across all platforms
   */
  static async getTrendingTopics(limit = 10) {
    const trends = await prisma.viralTrend.findMany({
      where: {
        status: { in: ['RISING', 'PEAK'] },
      },
      orderBy: [
        { status: 'asc' }, // PEAK first, then RISING
        { startDate: 'desc' },
      ],
      take: limit,
      include: {
        exampleContent: {
          take: 3,
          orderBy: { viralScore: 'desc' },
        },
      },
    });

    return trends.map(trend => ({
      ...trend,
      stats: this.getTrendStats(trend.id),
    }));
  }

  /**
   * Check if content matches any active trends
   */
  static async detectTrendsInContent(content: {
    caption?: string;
    hashtags?: string[];
    topic?: string;
  }) {
    const activeTrends = await prisma.viralTrend.findMany({
      where: {
        status: { in: ['RISING', 'PEAK', 'DECLINING'] },
      },
    });

    const matchedTrends = activeTrends.filter(trend => {
      const trendLower = trend.trend.toLowerCase();
      const captionLower = (content.caption || '').toLowerCase();
      const hashtagsLower = (content.hashtags || []).map(h => h.toLowerCase());
      const topicLower = (content.topic || '').toLowerCase();

      return (
        captionLower.includes(trendLower) ||
        hashtagsLower.some(h => h.includes(trendLower) || trendLower.includes(h)) ||
        topicLower.includes(trendLower)
      );
    });

    return matchedTrends;
  }
}
