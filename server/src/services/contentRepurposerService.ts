/**
 * Content Repurposer Service
 *
 * Main service for content repurposing orchestration
 */

import { PrismaClient, RepurposedContentStatus } from '@prisma/client';

const prisma = new PrismaClient();

export class ContentRepurposerService {
  /**
   * Get repurposed content by ID
   */
  static async getRepurposedContent(id: string) {
    return await prisma.repurposedContent.findUnique({
      where: { id },
      include: {
        sourceContent: true,
        template: true,
      },
    });
  }

  /**
   * Get outputs for source content
   */
  static async getSourceOutputs(sourceContentId: string, filters?: {
    outputType?: string;
    platform?: string;
    status?: RepurposedContentStatus;
  }) {
    const where: any = { sourceContentId };

    if (filters?.outputType) {
      where.outputType = filters.outputType;
    }
    if (filters?.platform) {
      where.platform = filters.platform;
    }
    if (filters?.status) {
      where.status = filters.status;
    }

    return await prisma.repurposedContent.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        template: true,
      },
    });
  }

  /**
   * Update repurposed content
   */
  static async updateRepurposedContent(id: string, updates: {
    title?: string;
    content?: string;
    caption?: string;
    hashtags?: string[];
    mentions?: string[];
    status?: RepurposedContentStatus;
    scheduledFor?: Date;
  }) {
    return await prisma.repurposedContent.update({
      where: { id },
      data: updates,
    });
  }

  /**
   * Schedule content
   */
  static async scheduleContent(id: string, scheduledFor: Date) {
    return await prisma.repurposedContent.update({
      where: { id },
      data: {
        scheduledFor,
        status: 'SCHEDULED',
      },
    });
  }

  /**
   * Publish content
   */
  static async publishContent(id: string, publishedUrl?: string) {
    return await prisma.repurposedContent.update({
      where: { id },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date(),
        publishedUrl,
      },
    });
  }

  /**
   * Update performance metrics
   */
  static async updatePerformance(id: string, performance: any) {
    return await prisma.repurposedContent.update({
      where: { id },
      data: { performance },
    });
  }

  /**
   * Delete repurposed content
   */
  static async deleteRepurposedContent(id: string) {
    return await prisma.repurposedContent.delete({
      where: { id },
    });
  }

  /**
   * Get repurposing job status
   */
  static async getJobStatus(jobId: string) {
    return await prisma.repurposingJob.findUnique({
      where: { id: jobId },
      include: {
        sourceContent: true,
        repurposedContent: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  /**
   * Get user's content calendar
   */
  static async getContentCalendar(userId: string, startDate: Date, endDate: Date) {
    return await prisma.contentCalendar.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: 'asc' },
    });
  }

  /**
   * Add content to calendar
   */
  static async addToCalendar(userId: string, date: Date, contentId: string, platform?: string) {
    // Check if calendar entry exists
    const existing = await prisma.contentCalendar.findFirst({
      where: {
        userId,
        date,
        platform: platform as any,
      },
    });

    if (existing) {
      // Add to existing entry
      const contentPieces = existing.contentPieces as any[];
      contentPieces.push(contentId);

      return await prisma.contentCalendar.update({
        where: { id: existing.id },
        data: { contentPieces },
      });
    }

    // Create new entry
    return await prisma.contentCalendar.create({
      data: {
        userId,
        date,
        platform: platform as any,
        contentPieces: [contentId],
      },
    });
  }

  /**
   * Get analytics for source content
   */
  static async getSourceAnalytics(sourceContentId: string) {
    const outputs = await prisma.repurposedContent.findMany({
      where: { sourceContentId },
    });

    const totalOutputs = outputs.length;
    const published = outputs.filter(o => o.status === 'PUBLISHED').length;
    const scheduled = outputs.filter(o => o.status === 'SCHEDULED').length;

    // Calculate total performance metrics
    let totalViews = 0;
    let totalLikes = 0;
    let totalShares = 0;

    outputs.forEach(output => {
      const perf = output.performance as any;
      if (perf) {
        totalViews += perf.views || 0;
        totalLikes += perf.likes || 0;
        totalShares += perf.shares || 0;
      }
    });

    // Group by platform
    const byPlatform: any = {};
    outputs.forEach(output => {
      if (output.platform) {
        if (!byPlatform[output.platform]) {
          byPlatform[output.platform] = {
            count: 0,
            published: 0,
            views: 0,
          };
        }
        byPlatform[output.platform].count++;
        if (output.status === 'PUBLISHED') {
          byPlatform[output.platform].published++;
          const perf = output.performance as any;
          if (perf) {
            byPlatform[output.platform].views += perf.views || 0;
          }
        }
      }
    });

    // Group by output type
    const byType: any = {};
    outputs.forEach(output => {
      if (!byType[output.outputType]) {
        byType[output.outputType] = 0;
      }
      byType[output.outputType]++;
    });

    return {
      totalOutputs,
      published,
      scheduled,
      totalPerformance: {
        views: totalViews,
        likes: totalLikes,
        shares: totalShares,
      },
      byPlatform,
      byType,
    };
  }
}
