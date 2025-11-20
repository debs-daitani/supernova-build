/**
 * Viral Analysis Service
 *
 * AI-powered deep analysis of viral content
 */

import { PrismaClient, HookType, EmotionalTrigger } from '@prisma/client';
import OpenAI from 'openai';

const prisma = new PrismaClient();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface AnalysisResult {
  hookAnalysis: {
    hookType: HookType | null;
    hookText: string | null;
    hookEffectivenessScore: number | null;
    hookExplanation: string;
  };
  emotionalTriggers: {
    triggers: EmotionalTrigger[];
    explanation: string;
  };
  structuralElements: {
    length: string;
    format: string;
    pacing: string;
    storyStructure: string;
  };
  lengthAnalysis: {
    characterCount: number;
    wordCount: number;
    optimalForPlatform: boolean;
    recommendation: string;
  };
  timingAnalysis: {
    dayOfWeek: string | null;
    timeOfDay: string | null;
    isOptimalTiming: boolean;
    recommendation: string;
  };
  visualElements: {
    hasThumbnail: boolean;
    hasTextOverlay: boolean;
    colorScheme: string;
    visualHook: string;
  };
  callToAction: string | null;
  engagementDrivers: {
    primary: string[];
    secondary: string[];
    explanation: string;
  };
  psychologicalPrinciples: string[];
  recommendations: {
    whatWorked: string[];
    howToReplicate: string[];
    keyTakeaways: string[];
  };
}

export class ViralAnalysisService {
  /**
   * Perform deep AI analysis of viral content
   */
  static async analyzeViralContent(viralContentId: string): Promise<AnalysisResult> {
    const content = await prisma.viralContent.findUnique({
      where: { id: viralContentId },
    });

    if (!content) {
      throw new Error('Viral content not found');
    }

    // Prepare content for analysis
    const contentText = [
      content.title,
      content.caption,
      content.transcript,
    ].filter(Boolean).join('\n\n');

    const metadata = {
      platform: content.platform,
      contentType: content.contentType,
      views: content.views,
      likes: content.likes,
      comments: content.comments,
      shares: content.shares,
      saves: content.saves,
      engagementRate: content.engagementRate,
      viralScore: content.viralScore,
      hashtags: content.hashtags,
      publishedAt: content.publishedAt,
    };

    // Call OpenAI for deep analysis
    const analysis = await this.performAIAnalysis(contentText, metadata);

    // Store analysis in database
    await prisma.viralAnalysis.create({
      data: {
        viralContentId,
        hookType: analysis.hookAnalysis.hookType,
        hookText: analysis.hookAnalysis.hookText,
        hookEffectivenessScore: analysis.hookAnalysis.hookEffectivenessScore,
        emotionalTriggers: analysis.emotionalTriggers.triggers,
        structuralElements: analysis.structuralElements,
        lengthAnalysis: analysis.lengthAnalysis,
        timingAnalysis: analysis.timingAnalysis,
        visualElements: analysis.visualElements,
        callToAction: analysis.callToAction,
        engagementDrivers: analysis.engagementDrivers,
        psychologicalPrinciples: analysis.psychologicalPrinciples,
        recommendations: analysis.recommendations,
      },
    });

    return analysis;
  }

  /**
   * Perform AI analysis using OpenAI
   */
  private static async performAIAnalysis(contentText: string, metadata: any): Promise<AnalysisResult> {
    const prompt = `You are an expert in viral content analysis. Analyze the following ${metadata.platform} ${metadata.contentType} that achieved significant virality.

CONTENT:
${contentText}

METRICS:
- Views: ${metadata.views || 'N/A'}
- Likes: ${metadata.likes || 'N/A'}
- Comments: ${metadata.comments || 'N/A'}
- Shares: ${metadata.shares || 'N/A'}
- Saves: ${metadata.saves || 'N/A'}
- Engagement Rate: ${metadata.engagementRate ? metadata.engagementRate.toFixed(2) + '%' : 'N/A'}
- Viral Score: ${metadata.viralScore}/100
- Hashtags: ${metadata.hashtags?.join(', ') || 'None'}
- Published: ${metadata.publishedAt ? new Date(metadata.publishedAt).toLocaleString() : 'N/A'}

Provide a comprehensive analysis in JSON format with the following structure:
{
  "hookAnalysis": {
    "hookType": "one of: QUESTION, BOLD_CLAIM, STORY, STATISTIC, CONTROVERSY, CURIOSITY_GAP, PATTERN_INTERRUPT, PERSONAL_EXPERIENCE, LISTICLE, HOW_TO",
    "hookText": "the actual hook (first line/3 seconds)",
    "hookEffectivenessScore": "score from 0-100",
    "hookExplanation": "why this hook works"
  },
  "emotionalTriggers": {
    "triggers": ["array of: SURPRISE, ANGER, JOY, FEAR, INSPIRATION, NOSTALGIA, FOMO, VALIDATION, CURIOSITY, EMPATHY"],
    "explanation": "why these emotions are triggered"
  },
  "structuralElements": {
    "length": "description of content length",
    "format": "how content is formatted",
    "pacing": "pacing analysis",
    "storyStructure": "narrative structure if applicable"
  },
  "lengthAnalysis": {
    "characterCount": number,
    "wordCount": number,
    "optimalForPlatform": boolean,
    "recommendation": "length recommendation"
  },
  "timingAnalysis": {
    "dayOfWeek": "day name or null",
    "timeOfDay": "morning/afternoon/evening or null",
    "isOptimalTiming": boolean,
    "recommendation": "timing recommendation"
  },
  "visualElements": {
    "hasThumbnail": boolean,
    "hasTextOverlay": boolean,
    "colorScheme": "description",
    "visualHook": "what grabs attention visually"
  },
  "callToAction": "the CTA or null",
  "engagementDrivers": {
    "primary": ["main reasons for engagement"],
    "secondary": ["secondary engagement factors"],
    "explanation": "why people engaged"
  },
  "psychologicalPrinciples": ["list of psychology tactics used"],
  "recommendations": {
    "whatWorked": ["specific elements that worked"],
    "howToReplicate": ["actionable steps to replicate success"],
    "keyTakeaways": ["main lessons learned"]
  }
}

Return ONLY the JSON object, no additional text.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });

    const analysisText = response.choices[0].message.content;
    if (!analysisText) {
      throw new Error('No analysis returned from AI');
    }

    return JSON.parse(analysisText);
  }

  /**
   * Compare user's content with similar viral content
   */
  static async compareContent(
    userContentId: string,
    similarViralContentId: string
  ): Promise<{
    yourContent: any;
    viralContent: any;
    comparison: any;
    recommendations: string[];
  }> {
    const [userContent, viralContent] = await Promise.all([
      prisma.userContentSubmission.findUnique({
        where: { id: userContentId },
        include: { user: true },
      }),
      prisma.viralContent.findUnique({
        where: { id: similarViralContentId },
        include: { analyses: true },
      }),
    ]);

    if (!userContent || !viralContent) {
      throw new Error('Content not found');
    }

    // Calculate performance gap
    const userEngagementRate = userContent.yourEngagementRate || 0;
    const viralEngagementRate = viralContent.engagementRate || 0;
    const performanceGap = ((viralEngagementRate - userEngagementRate) / userEngagementRate) * 100;

    // AI-powered comparison
    const comparisonPrompt = `Compare these two pieces of content and explain what made the viral one successful:

USER'S CONTENT:
- Platform: ${userContent.platform}
- Views: ${userContent.yourViews || 0}
- Likes: ${userContent.yourLikes || 0}
- Engagement Rate: ${userEngagementRate.toFixed(2)}%

VIRAL CONTENT:
- Platform: ${viralContent.platform}
- Views: ${viralContent.views || 0}
- Likes: ${viralContent.likes || 0}
- Engagement Rate: ${viralEngagementRate.toFixed(2)}%
- Viral Score: ${viralContent.viralScore}/100

Provide 5-7 specific, actionable recommendations for what the user should do differently next time.
Focus on concrete differences that drove the viral content's success.
Format as a JSON array of strings.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: comparisonPrompt }],
      response_format: { type: 'json_object' },
    });

    const recommendationsData = JSON.parse(response.choices[0].message.content || '{"recommendations": []}');

    return {
      yourContent: {
        views: userContent.yourViews,
        likes: userContent.yourLikes,
        comments: userContent.yourComments,
        shares: userContent.yourShares,
        engagementRate: userEngagementRate,
      },
      viralContent: {
        views: viralContent.views,
        likes: viralContent.likes,
        comments: viralContent.comments,
        shares: viralContent.shares,
        engagementRate: viralEngagementRate,
        viralScore: viralContent.viralScore,
      },
      comparison: {
        performanceGap: performanceGap.toFixed(1) + '%',
        viewsMultiplier: viralContent.views && userContent.yourViews
          ? (viralContent.views / userContent.yourViews).toFixed(1) + 'x'
          : 'N/A',
        engagementGap: (viralEngagementRate - userEngagementRate).toFixed(2) + '%',
      },
      recommendations: recommendationsData.recommendations || [],
    };
  }

  /**
   * Get analysis by viral content ID
   */
  static async getAnalysis(viralContentId: string) {
    return await prisma.viralAnalysis.findFirst({
      where: { viralContentId },
      orderBy: { createdAt: 'desc' },
      include: {
        viralContent: true,
      },
    });
  }

  /**
   * Analyze user's submitted content
   */
  static async analyzeUserContent(submissionId: string) {
    const submission = await prisma.userContentSubmission.findUnique({
      where: { id: submissionId },
    });

    if (!submission) {
      throw new Error('Submission not found');
    }

    // Find similar viral content for comparison
    const similarContent = await prisma.viralContent.findFirst({
      where: {
        platform: submission.platform,
        contentType: submission.contentType,
      },
      orderBy: { viralScore: 'desc' },
      include: { analyses: true },
    });

    let analysis: any = {
      performance: {
        views: submission.yourViews || 0,
        likes: submission.yourLikes || 0,
        comments: submission.yourComments || 0,
        shares: submission.yourShares || 0,
        engagementRate: submission.yourEngagementRate || 0,
      },
      strengths: [],
      improvements: [],
      recommendations: [],
    };

    if (similarContent) {
      const comparison = await this.compareContent(submissionId, similarContent.id);
      analysis.recommendations = comparison.recommendations;
      analysis.comparisonData = comparison;
    }

    // Update submission with analysis
    await prisma.userContentSubmission.update({
      where: { id: submissionId },
      data: {
        analysisCompleted: true,
        analysis: analysis,
      },
    });

    return analysis;
  }
}
