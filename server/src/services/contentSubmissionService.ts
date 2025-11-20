/**
 * Content Submission Service
 *
 * Handles user content submissions for analysis
 */

import { PrismaClient, SocialPlatform, ViralContentType } from '@prisma/client';
import { ViralAnalysisService } from './viralAnalysisService';

const prisma = new PrismaClient();

interface SubmissionInput {
  userId: string;
  platform: SocialPlatform;
  url: string;
  contentType: ViralContentType;
  yourViews?: number;
  yourLikes?: number;
  yourComments?: number;
  yourShares?: number;
  yourSaves?: number;
}

export class ContentSubmissionService {
  /**
   * Submit user's content for analysis
   */
  static async submitContent(input: SubmissionInput) {
    // Calculate engagement rate
    const engagementRate = this.calculateEngagementRate({
      views: input.yourViews,
      likes: input.yourLikes,
      comments: input.yourComments,
      shares: input.yourShares,
      saves: input.yourSaves,
    });

    const submission = await prisma.userContentSubmission.create({
      data: {
        userId: input.userId,
        platform: input.platform,
        url: input.url,
        contentType: input.contentType,
        yourViews: input.yourViews,
        yourLikes: input.yourLikes,
        yourComments: input.yourComments,
        yourShares: input.yourShares,
        yourSaves: input.yourSaves,
        yourEngagementRate: engagementRate,
        analysisRequested: true,
        analysisCompleted: false,
      },
    });

    // Trigger analysis asynchronously
    this.analyzeSubmission(submission.id).catch(err => {
      console.error('Error analyzing submission:', err);
    });

    return submission;
  }

  /**
   * Calculate engagement rate
   */
  private static calculateEngagementRate(data: {
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
   * Analyze user's submission
   */
  static async analyzeSubmission(submissionId: string) {
    const submission = await prisma.userContentSubmission.findUnique({
      where: { id: submissionId },
    });

    if (!submission) {
      throw new Error('Submission not found');
    }

    // Perform analysis using ViralAnalysisService
    const analysis = await ViralAnalysisService.analyzeUserContent(submissionId);

    return analysis;
  }

  /**
   * Get user's submissions
   */
  static async getUserSubmissions(userId: string, page = 1, limit = 20) {
    const [submissions, total] = await Promise.all([
      prisma.userContentSubmission.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.userContentSubmission.count({ where: { userId } }),
    ]);

    return {
      submissions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get submission by ID
   */
  static async getSubmissionById(id: string) {
    return await prisma.userContentSubmission.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Update submission metrics
   */
  static async updateMetrics(
    id: string,
    metrics: {
      yourViews?: number;
      yourLikes?: number;
      yourComments?: number;
      yourShares?: number;
      yourSaves?: number;
    }
  ) {
    const engagementRate = this.calculateEngagementRate(metrics);

    return await prisma.userContentSubmission.update({
      where: { id },
      data: {
        ...metrics,
        yourEngagementRate: engagementRate,
      },
    });
  }

  /**
   * Get user's content performance summary
   */
  static async getUserPerformanceSummary(userId: string) {
    const submissions = await prisma.userContentSubmission.findMany({
      where: { userId },
    });

    if (submissions.length === 0) {
      return {
        totalSubmissions: 0,
        avgEngagementRate: 0,
        bestPerforming: null,
        improvementTrend: 'N/A',
      };
    }

    const totalEngagement = submissions.reduce((sum, s) => sum + (s.yourEngagementRate || 0), 0);
    const avgEngagementRate = totalEngagement / submissions.length;

    const bestPerforming = submissions.sort((a, b) =>
      (b.yourEngagementRate || 0) - (a.yourEngagementRate || 0)
    )[0];

    // Calculate improvement trend (compare first half vs second half)
    const midpoint = Math.floor(submissions.length / 2);
    const sortedByDate = submissions.sort((a, b) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    const firstHalf = sortedByDate.slice(0, midpoint);
    const secondHalf = sortedByDate.slice(midpoint);

    const avgFirst = firstHalf.reduce((sum, s) => sum + (s.yourEngagementRate || 0), 0) / firstHalf.length || 0;
    const avgSecond = secondHalf.reduce((sum, s) => sum + (s.yourEngagementRate || 0), 0) / secondHalf.length || 0;

    const improvement = avgSecond - avgFirst;
    const improvementTrend = improvement > 5 ? 'IMPROVING' : improvement < -5 ? 'DECLINING' : 'STABLE';

    return {
      totalSubmissions: submissions.length,
      avgEngagementRate: avgEngagementRate.toFixed(2),
      bestPerforming: {
        url: bestPerforming.url,
        engagementRate: bestPerforming.yourEngagementRate?.toFixed(2),
        platform: bestPerforming.platform,
      },
      improvementTrend,
      improvementPercent: improvement.toFixed(1) + '%',
    };
  }

  /**
   * Compare submission with similar viral content
   */
  static async compareWithViral(submissionId: string) {
    const submission = await prisma.userContentSubmission.findUnique({
      where: { id: submissionId },
    });

    if (!submission) {
      throw new Error('Submission not found');
    }

    // Find similar viral content
    const similarViral = await prisma.viralContent.findFirst({
      where: {
        platform: submission.platform,
        contentType: submission.contentType,
        viralScore: { gte: 70 },
      },
      orderBy: { viralScore: 'desc' },
      include: {
        analyses: true,
      },
    });

    if (!similarViral) {
      return {
        submission,
        comparison: null,
        message: 'No similar viral content found for comparison',
      };
    }

    const comparison = await ViralAnalysisService.compareContent(submissionId, similarViral.id);

    return {
      submission,
      similarViral: {
        url: similarViral.url,
        viralScore: similarViral.viralScore,
        engagementRate: similarViral.engagementRate,
        views: similarViral.views,
        likes: similarViral.likes,
      },
      comparison,
    };
  }

  /**
   * Delete submission
   */
  static async deleteSubmission(id: string) {
    return await prisma.userContentSubmission.delete({
      where: { id },
    });
  }
}
