/**
 * Content Pattern Service
 *
 * Identifies and manages viral content patterns
 */

import { PrismaClient, SocialPlatform, ContentPatternType, Prisma } from '@prisma/client';
import OpenAI from 'openai';

const prisma = new PrismaClient();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface PatternInput {
  platform: SocialPlatform;
  patternType: ContentPatternType;
  pattern: string;
  description: string;
  howToUse: string;
}

export class ContentPatternService {
  /**
   * Discover patterns from viral content
   */
  static async discoverPatterns(platform?: SocialPlatform) {
    const where: Prisma.ViralContentWhereInput = {
      viralScore: { gte: 70 }, // Only analyze highly viral content
    };

    if (platform) {
      where.platform = platform;
    }

    const viralContent = await prisma.viralContent.findMany({
      where,
      include: {
        analyses: true,
      },
      orderBy: { viralScore: 'desc' },
      take: 100, // Analyze top 100
    });

    if (viralContent.length < 10) {
      throw new Error('Not enough viral content to identify patterns');
    }

    // Use AI to identify patterns
    const patterns = await this.identifyPatternsWithAI(viralContent);

    // Store discovered patterns
    const createdPatterns = await Promise.all(
      patterns.map(async (pattern: any) => {
        return await this.createOrUpdatePattern({
          platform: pattern.platform,
          patternType: pattern.patternType,
          pattern: pattern.pattern,
          description: pattern.description,
          howToUse: pattern.howToUse,
        });
      })
    );

    return createdPatterns;
  }

  /**
   * Use AI to identify patterns from viral content
   */
  private static async identifyPatternsWithAI(viralContent: any[]): Promise<any[]> {
    const contentSummary = viralContent.map(content => ({
      platform: content.platform,
      contentType: content.contentType,
      viralScore: content.viralScore,
      hookType: content.analyses[0]?.hookType,
      emotionalTriggers: content.analyses[0]?.emotionalTriggers,
      caption: content.caption?.substring(0, 200),
      hashtags: content.hashtags,
    }));

    const prompt = `Analyze the following ${viralContent.length} viral ${viralContent[0]?.platform || 'social media'} posts and identify common patterns that contribute to their virality.

VIRAL CONTENT SUMMARY:
${JSON.stringify(contentSummary, null, 2)}

Identify 5-10 patterns across these categories:
- HOOK patterns (how they grab attention)
- FORMAT patterns (how content is structured)
- STRUCTURE patterns (narrative flow)
- TOPIC patterns (subject matter trends)
- STYLE patterns (tone, voice, presentation)
- TIMING patterns (when they post)

For each pattern, provide:
1. Pattern type (HOOK, FORMAT, STRUCTURE, TOPIC, STYLE, or TIMING)
2. Pattern description (what the pattern is)
3. How to use it (actionable steps)
4. Example from the data

Return as JSON array with format:
[
  {
    "platform": "${viralContent[0]?.platform || 'TWITTER'}",
    "patternType": "HOOK",
    "pattern": "Question-based hooks",
    "description": "Posts that start with a compelling question get 2.5x more engagement",
    "howToUse": "Start your post with a thought-provoking question that your audience wants to answer"
  }
]`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(response.choices[0].message.content || '{"patterns": []}');
    return result.patterns || [];
  }

  /**
   * Create or update a pattern
   */
  static async createOrUpdatePattern(input: PatternInput) {
    // Check if pattern already exists
    const existing = await prisma.contentPattern.findFirst({
      where: {
        platform: input.platform,
        patternType: input.patternType,
        pattern: input.pattern,
      },
    });

    if (existing) {
      // Update existing pattern
      return await prisma.contentPattern.update({
        where: { id: existing.id },
        data: {
          description: input.description,
          howToUse: input.howToUse,
          exampleCount: { increment: 1 },
        },
      });
    }

    // Create new pattern
    return await prisma.contentPattern.create({
      data: {
        platform: input.platform,
        patternType: input.patternType,
        pattern: input.pattern,
        description: input.description,
        howToUse: input.howToUse,
        exampleCount: 1,
      },
    });
  }

  /**
   * Get all patterns
   */
  static async getPatterns(filters: {
    platform?: SocialPlatform;
    patternType?: ContentPatternType;
  } = {}) {
    const where: Prisma.ContentPatternWhereInput = {};

    if (filters.platform) {
      where.platform = filters.platform;
    }

    if (filters.patternType) {
      where.patternType = filters.patternType;
    }

    return await prisma.contentPattern.findMany({
      where,
      orderBy: [
        { avgEngagementRate: 'desc' },
        { exampleCount: 'desc' },
      ],
      include: {
        examples: {
          take: 3,
          orderBy: { viralScore: 'desc' },
        },
      },
    });
  }

  /**
   * Get pattern by ID
   */
  static async getPatternById(id: string) {
    return await prisma.contentPattern.findUnique({
      where: { id },
      include: {
        examples: {
          take: 10,
          orderBy: { viralScore: 'desc' },
        },
        contentIdeas: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  /**
   * Link viral content to pattern
   */
  static async linkContentToPattern(patternId: string, viralContentId: string) {
    const pattern = await prisma.contentPattern.findUnique({
      where: { id: patternId },
      include: { examples: true },
    });

    if (!pattern) {
      throw new Error('Pattern not found');
    }

    // Calculate average engagement rate
    const viralContent = await prisma.viralContent.findUnique({
      where: { id: viralContentId },
    });

    if (!viralContent) {
      throw new Error('Viral content not found');
    }

    // Update pattern's average engagement rate
    const currentAvg = pattern.avgEngagementRate || 0;
    const currentCount = pattern.examples.length;
    const newAvg = ((currentAvg * currentCount) + (viralContent.engagementRate || 0)) / (currentCount + 1);

    return await prisma.contentPattern.update({
      where: { id: patternId },
      data: {
        avgEngagementRate: newAvg,
        exampleCount: { increment: 1 },
        examples: {
          connect: { id: viralContentId },
        },
      },
    });
  }

  /**
   * Generate content ideas based on patterns
   */
  static async generateIdeasFromPattern(patternId: string, userId: string, count = 5) {
    const pattern = await prisma.contentPattern.findUnique({
      where: { id: patternId },
      include: {
        examples: {
          take: 3,
          orderBy: { viralScore: 'desc' },
        },
      },
    });

    if (!pattern) {
      throw new Error('Pattern not found');
    }

    const prompt = `Based on this proven viral content pattern, generate ${count} unique content ideas:

PATTERN:
- Type: ${pattern.patternType}
- Pattern: ${pattern.pattern}
- Description: ${pattern.description}
- How to Use: ${pattern.howToUse}
- Platform: ${pattern.platform}
- Avg Engagement Rate: ${pattern.avgEngagementRate}%

EXAMPLE VIRAL CONTENT:
${pattern.examples.map(ex => `- ${ex.caption?.substring(0, 100)} (Viral Score: ${ex.viralScore})`).join('\n')}

Generate ${count} content ideas that follow this pattern but with unique angles/topics.
For each idea, provide:
1. The main idea/concept
2. The hook (opening line)
3. Brief structure outline
4. Estimated viral potential (0-100)
5. Tags/topics

Return as JSON array:
[
  {
    "idea": "content idea description",
    "hook": "the opening hook",
    "structure": {
      "opening": "...",
      "body": "...",
      "closing": "..."
    },
    "estimatedViralScore": 75,
    "tags": ["tag1", "tag2"]
  }
]`;

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
        return await prisma.contentIdea.create({
          data: {
            userId,
            platform: pattern.platform,
            idea: idea.idea,
            basedOnPatternId: patternId,
            hook: idea.hook,
            structure: idea.structure,
            estimatedViralScore: idea.estimatedViralScore,
            tags: idea.tags,
          },
        });
      })
    );

    return createdIdeas;
  }

  /**
   * Update pattern engagement metrics
   */
  static async updatePatternMetrics(patternId: string) {
    const pattern = await prisma.contentPattern.findUnique({
      where: { id: patternId },
      include: {
        examples: true,
      },
    });

    if (!pattern || pattern.examples.length === 0) {
      return;
    }

    // Calculate average engagement rate from all examples
    const totalEngagement = pattern.examples.reduce((sum, content) => {
      return sum + (content.engagementRate || 0);
    }, 0);

    const avgEngagementRate = totalEngagement / pattern.examples.length;

    return await prisma.contentPattern.update({
      where: { id: patternId },
      data: {
        avgEngagementRate,
        exampleCount: pattern.examples.length,
      },
    });
  }
}
