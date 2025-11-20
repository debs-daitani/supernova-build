/**
 * Viral Content Service
 *
 * Handles viral content discovery, storage, and retrieval
 */

import { PrismaClient, SocialPlatform, ViralContentType, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

interface ViralContentFilters {
  platform?: SocialPlatform;
  industry?: string;
  contentType?: ViralContentType;
  minViralScore?: number;
  startDate?: Date;
  endDate?: Date;
  topic?: string;
}

interface ViralContentInput {
  platform: SocialPlatform;
  url: string;
  author: string;
  authorFollowers?: number;
  contentType: ViralContentType;
  title?: string;
  caption?: string;
  transcript?: string;
  hashtags?: string[];
  mentions?: string[];
  publishedAt?: Date;
  views?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  saves?: number;
  topic?: string;
  industry?: string;
  userId?: string;
}

export class ViralContentService {
  /**
   * Calculate viral score based on engagement metrics
   */
  static calculateViralScore(data: {
    views?: number;
    likes?: number;
    comments?: number;
    shares?: number;
    saves?: number;
    authorFollowers?: number;
  }): number {
    const { views = 0, likes = 0, comments = 0, shares = 0, saves = 0, authorFollowers = 1 } = data;

    // Calculate engagement rate
    const totalEngagements = likes + (comments * 3) + (shares * 5) + (saves * 4);
    const engagementRate = views > 0 ? (totalEngagements / views) * 100 : 0;

    // Calculate reach vs followers ratio
    const reachRatio = authorFollowers > 0 ? (views / authorFollowers) : 1;

    // Weighted viral score (0-100)
    let score = 0;

    // Engagement rate contribution (40 points max)
    score += Math.min(engagementRate * 4, 40);

    // Reach contribution (30 points max)
    score += Math.min(reachRatio * 15, 30);

    // Share velocity contribution (20 points max)
    if (views > 0) {
      const shareRate = (shares / views) * 1000;
      score += Math.min(shareRate * 10, 20);
    }

    // Comment engagement (10 points max)
    if (views > 0) {
      const commentRate = (comments / views) * 1000;
      score += Math.min(commentRate * 5, 10);
    }

    return Math.min(Math.round(score), 100);
  }

  /**
   * Calculate engagement rate
   */
  static calculateEngagementRate(data: {
    views?: number;
    likes?: number;
    comments?: number;
    shares?: number;
    saves?: number;
  }): number {
    const { views = 0, likes = 0, comments = 0, shares = 0, saves = 0 } = data;

    if (views === 0) return 0;

    const totalEngagements = likes + comments + shares + saves;
    return (totalEngagements / views) * 100;
  }

  /**
   * Create viral content entry
   */
  static async createViralContent(input: ViralContentInput) {
    const viralScore = this.calculateViralScore({
      views: input.views,
      likes: input.likes,
      comments: input.comments,
      shares: input.shares,
      saves: input.saves,
      authorFollowers: input.authorFollowers,
    });

    const engagementRate = this.calculateEngagementRate({
      views: input.views,
      likes: input.likes,
      comments: input.comments,
      shares: input.shares,
      saves: input.saves,
    });

    const content = await prisma.viralContent.create({
      data: {
        platform: input.platform,
        url: input.url,
        author: input.author,
        authorFollowers: input.authorFollowers,
        contentType: input.contentType,
        title: input.title,
        caption: input.caption,
        transcript: input.transcript,
        hashtags: input.hashtags || [],
        mentions: input.mentions || [],
        publishedAt: input.publishedAt,
        views: input.views,
        likes: input.likes,
        comments: input.comments,
        shares: input.shares,
        saves: input.saves,
        engagementRate,
        viralScore,
        topic: input.topic,
        industry: input.industry,
        userId: input.userId,
      },
      include: {
        analyses: true,
      },
    });

    return content;
  }

  /**
   * Get viral content by ID
   */
  static async getViralContentById(id: string) {
    return await prisma.viralContent.findUnique({
      where: { id },
      include: {
        analyses: true,
        patterns: true,
        trends: true,
      },
    });
  }

  /**
   * Get viral content by URL
   */
  static async getViralContentByUrl(url: string) {
    return await prisma.viralContent.findUnique({
      where: { url },
      include: {
        analyses: true,
        patterns: true,
      },
    });
  }

  /**
   * Get trending viral content
   */
  static async getTrendingContent(filters: ViralContentFilters = {}, page = 1, limit = 20) {
    const where: Prisma.ViralContentWhereInput = {};

    if (filters.platform) {
      where.platform = filters.platform;
    }

    if (filters.industry) {
      where.industry = filters.industry;
    }

    if (filters.contentType) {
      where.contentType = filters.contentType;
    }

    if (filters.minViralScore) {
      where.viralScore = { gte: filters.minViralScore };
    }

    if (filters.topic) {
      where.topic = { contains: filters.topic, mode: 'insensitive' };
    }

    if (filters.startDate || filters.endDate) {
      where.publishedAt = {};
      if (filters.startDate) {
        where.publishedAt.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.publishedAt.lte = filters.endDate;
      }
    }

    const [content, total] = await Promise.all([
      prisma.viralContent.findMany({
        where,
        orderBy: [
          { viralScore: 'desc' },
          { discoveredAt: 'desc' },
        ],
        skip: (page - 1) * limit,
        take: limit,
        include: {
          analyses: true,
        },
      }),
      prisma.viralContent.count({ where }),
    ]);

    return {
      content,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Search viral content
   */
  static async searchViralContent(query: string, filters: ViralContentFilters = {}, page = 1, limit = 20) {
    const where: Prisma.ViralContentWhereInput = {
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { caption: { contains: query, mode: 'insensitive' } },
        { author: { contains: query, mode: 'insensitive' } },
        { topic: { contains: query, mode: 'insensitive' } },
      ],
    };

    if (filters.platform) {
      where.platform = filters.platform;
    }

    if (filters.industry) {
      where.industry = filters.industry;
    }

    if (filters.contentType) {
      where.contentType = filters.contentType;
    }

    if (filters.minViralScore) {
      where.viralScore = { gte: filters.minViralScore };
    }

    const [content, total] = await Promise.all([
      prisma.viralContent.findMany({
        where,
        orderBy: { viralScore: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          analyses: true,
        },
      }),
      prisma.viralContent.count({ where }),
    ]);

    return {
      content,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get user's saved viral content
   */
  static async getUserViralContent(userId: string, page = 1, limit = 20) {
    const [content, total] = await Promise.all([
      prisma.viralContent.findMany({
        where: { userId },
        orderBy: { discoveredAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          analyses: true,
        },
      }),
      prisma.viralContent.count({ where: { userId } }),
    ]);

    return {
      content,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update viral content metrics
   */
  static async updateMetrics(id: string, metrics: {
    views?: number;
    likes?: number;
    comments?: number;
    shares?: number;
    saves?: number;
  }) {
    const content = await prisma.viralContent.findUnique({ where: { id } });
    if (!content) {
      throw new Error('Viral content not found');
    }

    const updatedMetrics = {
      views: metrics.views ?? content.views,
      likes: metrics.likes ?? content.likes,
      comments: metrics.comments ?? content.comments,
      shares: metrics.shares ?? content.shares,
      saves: metrics.saves ?? content.saves,
    };

    const viralScore = this.calculateViralScore({
      ...updatedMetrics,
      authorFollowers: content.authorFollowers || undefined,
    });

    const engagementRate = this.calculateEngagementRate(updatedMetrics);

    return await prisma.viralContent.update({
      where: { id },
      data: {
        ...updatedMetrics,
        viralScore,
        engagementRate,
      },
    });
  }

  /**
   * Delete viral content
   */
  static async deleteViralContent(id: string) {
    return await prisma.viralContent.delete({
      where: { id },
    });
  }

  /**
   * Get viral content stats
   */
  static async getStats(filters: ViralContentFilters = {}) {
    const where: Prisma.ViralContentWhereInput = {};

    if (filters.platform) {
      where.platform = filters.platform;
    }

    if (filters.industry) {
      where.industry = filters.industry;
    }

    const [
      total,
      megaViral,
      viral,
      trending,
      avgScore,
      topTopics,
      topIndustries,
    ] = await Promise.all([
      prisma.viralContent.count({ where }),
      prisma.viralContent.count({ where: { ...where, viralScore: { gte: 80 } } }),
      prisma.viralContent.count({ where: { ...where, viralScore: { gte: 60, lt: 80 } } }),
      prisma.viralContent.count({ where: { ...where, viralScore: { gte: 40, lt: 60 } } }),
      prisma.viralContent.aggregate({
        where,
        _avg: { viralScore: true },
      }),
      prisma.viralContent.groupBy({
        by: ['topic'],
        where: { ...where, topic: { not: null } },
        _count: { topic: true },
        orderBy: { _count: { topic: 'desc' } },
        take: 10,
      }),
      prisma.viralContent.groupBy({
        by: ['industry'],
        where: { ...where, industry: { not: null } },
        _count: { industry: true },
        orderBy: { _count: { industry: 'desc' } },
        take: 10,
      }),
    ]);

    return {
      total,
      byLevel: {
        megaViral,
        viral,
        trending,
      },
      avgViralScore: avgScore._avg.viralScore || 0,
      topTopics: topTopics.map(t => ({ topic: t.topic, count: t._count.topic })),
      topIndustries: topIndustries.map(i => ({ industry: i.industry, count: i._count.industry })),
    };
  }
}
