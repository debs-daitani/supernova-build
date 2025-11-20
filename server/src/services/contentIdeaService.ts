/**
 * Content Idea Service
 *
 * Generates and manages content ideas based on viral patterns
 */

import { PrismaClient, SocialPlatform, ContentIdeaStatus, Prisma } from '@prisma/client';
import OpenAI from 'openai';

const prisma = new PrismaClient();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface ContentIdeaInput {
  userId: string;
  platform: SocialPlatform;
  idea: string;
  basedOnPatternId?: string;
  hook?: string;
  structure?: any;
  tags?: string[];
}

interface BuilderInput {
  userId: string;
  platform: SocialPlatform;
  topic?: string;
  templateType?: string;
  targetAudience?: string;
  contentGoal?: string;
}

export class ContentIdeaService {
  /**
   * Create a content idea
   */
  static async createContentIdea(input: ContentIdeaInput) {
    // Predict viral score for the idea
    const viralScore = await this.predictViralScore({
      platform: input.platform,
      idea: input.idea,
      hook: input.hook,
    });

    return await prisma.contentIdea.create({
      data: {
        userId: input.userId,
        platform: input.platform,
        idea: input.idea,
        basedOnPatternId: input.basedOnPatternId,
        hook: input.hook,
        structure: input.structure,
        estimatedViralScore: viralScore,
        tags: input.tags || [],
      },
      include: {
        basedOnPattern: true,
      },
    });
  }

  /**
   * Get user's content ideas
   */
  static async getUserContentIdeas(
    userId: string,
    filters: {
      platform?: SocialPlatform;
      status?: ContentIdeaStatus;
    } = {},
    page = 1,
    limit = 20
  ) {
    const where: Prisma.ContentIdeaWhereInput = { userId };

    if (filters.platform) {
      where.platform = filters.platform;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    const [ideas, total] = await Promise.all([
      prisma.contentIdea.findMany({
        where,
        orderBy: [
          { estimatedViralScore: 'desc' },
          { createdAt: 'desc' },
        ],
        skip: (page - 1) * limit,
        take: limit,
        include: {
          basedOnPattern: true,
        },
      }),
      prisma.contentIdea.count({ where }),
    ]);

    return {
      ideas,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Generate content ideas for user based on their interests
   */
  static async generateIdeas(input: {
    userId: string;
    platform: SocialPlatform;
    topic?: string;
    industry?: string;
    count?: number;
  }) {
    const count = input.count || 10;

    // Get relevant patterns
    const patterns = await prisma.contentPattern.findMany({
      where: {
        platform: input.platform,
      },
      orderBy: {
        avgEngagementRate: 'desc',
      },
      take: 5,
      include: {
        examples: {
          take: 2,
          orderBy: { viralScore: 'desc' },
        },
      },
    });

    if (patterns.length === 0) {
      throw new Error('No patterns available for this platform');
    }

    // Get user's previous successful content
    const userPreviousIdeas = await prisma.contentIdea.findMany({
      where: {
        userId: input.userId,
        status: 'PUBLISHED',
        actualViralScore: { gte: 60 },
      },
      orderBy: { actualViralScore: 'desc' },
      take: 5,
    });

    const prompt = `Generate ${count} unique, high-potential content ideas for ${input.platform}.

CONTEXT:
${input.topic ? `- Topic/Niche: ${input.topic}` : ''}
${input.industry ? `- Industry: ${input.industry}` : ''}

PROVEN PATTERNS ON THIS PLATFORM:
${patterns.map(p => `- ${p.pattern}: ${p.description} (Avg engagement: ${p.avgEngagementRate?.toFixed(1)}%)`).join('\n')}

${userPreviousIdeas.length > 0 ? `USER'S PREVIOUS SUCCESSES:
${userPreviousIdeas.map(i => `- ${i.idea.substring(0, 100)} (Viral score: ${i.actualViralScore})`).join('\n')}` : ''}

Generate ${count} content ideas that:
1. Follow proven viral patterns
2. Are unique and not generic
3. Are specific to the user's niche/industry
4. Have high viral potential
5. Include a strong hook

For each idea, provide:
{
  "idea": "Full content idea description",
  "hook": "Attention-grabbing opening line/hook",
  "structure": {
    "opening": "How to start",
    "body": "Main points",
    "closing": "How to end/CTA"
  },
  "estimatedViralScore": 0-100,
  "tags": ["relevant", "tags"],
  "basedOnPattern": "which pattern from the list above"
}

Return as JSON array.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(response.choices[0].message.content || '{"ideas": []}');
    const ideas = result.ideas || [];

    // Save ideas to database
    const createdIdeas = await Promise.all(
      ideas.map(async (idea: any) => {
        // Find matching pattern
        const matchingPattern = patterns.find(p =>
          idea.basedOnPattern?.toLowerCase().includes(p.pattern.toLowerCase())
        );

        return await prisma.contentIdea.create({
          data: {
            userId: input.userId,
            platform: input.platform,
            idea: idea.idea,
            hook: idea.hook,
            structure: idea.structure,
            estimatedViralScore: idea.estimatedViralScore,
            tags: idea.tags || [],
            basedOnPatternId: matchingPattern?.id,
          },
          include: {
            basedOnPattern: true,
          },
        });
      })
    );

    return createdIdeas;
  }

  /**
   * Build content step-by-step with AI guidance
   */
  static async buildContent(input: BuilderInput) {
    const prompt = `You are a viral content strategist. Help create a ${input.platform} post that has high viral potential.

USER REQUIREMENTS:
- Platform: ${input.platform}
${input.topic ? `- Topic: ${input.topic}` : ''}
${input.templateType ? `- Template: ${input.templateType}` : ''}
${input.targetAudience ? `- Target Audience: ${input.targetAudience}` : ''}
${input.contentGoal ? `- Goal: ${input.contentGoal}` : ''}

Provide a complete content build guide with:
1. Hook options (3 different hooks to choose from)
2. Content structure (step-by-step outline)
3. Main points to include
4. Visual suggestions
5. Hashtag recommendations
6. Call-to-action options
7. Posting time recommendation
8. Estimated viral score

Return as JSON:
{
  "hookOptions": [
    {
      "hook": "hook text",
      "type": "QUESTION | BOLD_CLAIM | etc",
      "whyItWorks": "explanation"
    }
  ],
  "structure": {
    "opening": "...",
    "body": ["point 1", "point 2", "point 3"],
    "closing": "..."
  },
  "mainPoints": ["key point 1", "key point 2"],
  "visualSuggestions": {
    "style": "...",
    "colors": "...",
    "elements": "..."
  },
  "hashtags": ["hashtag1", "hashtag2"],
  "ctaOptions": ["cta option 1", "cta option 2"],
  "postingTimeRecommendation": "Tuesday 9-10am",
  "estimatedViralScore": 75
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    });

    return JSON.parse(response.choices[0].message.content || '{}');
  }

  /**
   * Predict viral score for content draft
   */
  static async predictViralScore(input: {
    platform: SocialPlatform;
    idea?: string;
    hook?: string;
    content?: string;
    hashtags?: string[];
  }): Promise<number> {
    const contentText = [input.idea, input.hook, input.content].filter(Boolean).join('\n');

    if (!contentText) {
      return 50; // Default neutral score
    }

    // Get successful content benchmarks for this platform
    const benchmarks = await prisma.viralContent.findMany({
      where: {
        platform: input.platform,
        viralScore: { gte: 70 },
      },
      select: {
        caption: true,
        hashtags: true,
        viralScore: true,
      },
      take: 10,
      orderBy: { viralScore: 'desc' },
    });

    const prompt = `As a viral content expert, predict the viral potential of this content.

PLATFORM: ${input.platform}

CONTENT TO ANALYZE:
${contentText}

${input.hashtags ? `HASHTAGS: ${input.hashtags.join(', ')}` : ''}

SUCCESSFUL BENCHMARKS ON THIS PLATFORM:
${benchmarks.map(b => `- ${b.caption?.substring(0, 100)} (Score: ${b.viralScore})`).join('\n')}

Based on:
1. Hook strength
2. Engagement potential
3. Shareability
4. Emotional impact
5. Value provided
6. Alignment with platform best practices

Provide a viral score prediction (0-100) and brief explanation.

Return as JSON:
{
  "viralScore": 75,
  "explanation": "Strong hook with curiosity gap...",
  "strengths": ["strong hook", "relatable topic"],
  "weaknesses": ["could be more specific", "add statistics"],
  "improvements": ["Add a question at the end", "Include specific numbers"]
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(response.choices[0].message.content || '{"viralScore": 50}');
    return result.viralScore || 50;
  }

  /**
   * Update content idea
   */
  static async updateContentIdea(
    id: string,
    updates: {
      idea?: string;
      hook?: string;
      structure?: any;
      tags?: string[];
      status?: ContentIdeaStatus;
      draftContent?: string;
      scheduledFor?: Date;
      publishedAt?: Date;
      publishedUrl?: string;
      actualViralScore?: number;
      actualEngagement?: any;
    }
  ) {
    return await prisma.contentIdea.update({
      where: { id },
      data: updates,
    });
  }

  /**
   * Get content idea by ID
   */
  static async getContentIdeaById(id: string) {
    return await prisma.contentIdea.findUnique({
      where: { id },
      include: {
        basedOnPattern: {
          include: {
            examples: {
              take: 3,
              orderBy: { viralScore: 'desc' },
            },
          },
        },
      },
    });
  }

  /**
   * Delete content idea
   */
  static async deleteContentIdea(id: string) {
    return await prisma.contentIdea.delete({
      where: { id },
    });
  }

  /**
   * Track published content performance
   */
  static async trackPerformance(
    id: string,
    performance: {
      publishedUrl: string;
      actualViralScore: number;
      actualEngagement: any;
    }
  ) {
    const idea = await prisma.contentIdea.update({
      where: { id },
      data: {
        publishedUrl: performance.publishedUrl,
        actualViralScore: performance.actualViralScore,
        actualEngagement: performance.actualEngagement,
        publishedAt: new Date(),
        status: 'PUBLISHED',
      },
    });

    // Compare predicted vs actual
    const prediction = idea.estimatedViralScore || 0;
    const actual = performance.actualViralScore;
    const accuracy = 100 - Math.abs(prediction - actual);

    return {
      ...idea,
      predictionAccuracy: accuracy.toFixed(1) + '%',
      performance: accuracy >= 80 ? 'EXCELLENT' : accuracy >= 60 ? 'GOOD' : 'NEEDS_IMPROVEMENT',
    };
  }

  /**
   * Get user's content performance stats
   */
  static async getUserStats(userId: string) {
    const ideas = await prisma.contentIdea.findMany({
      where: { userId },
    });

    const published = ideas.filter(i => i.status === 'PUBLISHED');
    const avgPredicted = ideas.reduce((sum, i) => sum + (i.estimatedViralScore || 0), 0) / ideas.length || 0;
    const avgActual = published.reduce((sum, i) => sum + (i.actualViralScore || 0), 0) / published.length || 0;

    const byStatus = {
      idea: ideas.filter(i => i.status === 'IDEA').length,
      drafted: ideas.filter(i => i.status === 'DRAFTED').length,
      scheduled: ideas.filter(i => i.status === 'SCHEDULED').length,
      published: published.length,
    };

    return {
      totalIdeas: ideas.length,
      byStatus,
      avgPredictedScore: avgPredicted.toFixed(1),
      avgActualScore: avgActual.toFixed(1),
      topPerformingIdea: published.sort((a, b) => (b.actualViralScore || 0) - (a.actualViralScore || 0))[0],
    };
  }
}
