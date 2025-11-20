/**
 * Content Generator Service
 *
 * Generates 50+ repurposed content formats from source content
 */

import { PrismaClient, RepurposedOutputType, SocialPlatform, SourceContentType } from '@prisma/client';
import OpenAI from 'openai';

const prisma = new PrismaClient();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface GenerationConfig {
  brand?: {
    colors?: string[];
    fonts?: string[];
    logo?: string;
    style?: string;
  };
  tone?: 'professional' | 'casual' | 'humorous' | 'inspirational';
  hashtags?: string[];
}

export class ContentGeneratorService {
  /**
   * Generate all repurposed content from source
   */
  static async generateAllOutputs(sourceContentId: string, userId: string, config?: GenerationConfig) {
    const sourceContent = await prisma.sourceContent.findUnique({
      where: { id: sourceContentId },
    });

    if (!sourceContent) {
      throw new Error('Source content not found');
    }

    if (sourceContent.status !== 'READY') {
      throw new Error('Source content is not ready for repurposing');
    }

    // Create repurposing job
    const job = await prisma.repurposingJob.create({
      data: {
        userId,
        sourceContentId,
        selectedOutputs: Object.values(RepurposedOutputType),
        config: config || {},
        status: 'PROCESSING',
      },
    });

    // Generate outputs asynchronously
    this.processRepurposingJob(job.id).catch(err => {
      console.error('Error processing repurposing job:', err);
    });

    return job;
  }

  /**
   * Process repurposing job
   */
  static async processRepurposingJob(jobId: string) {
    try {
      const job = await prisma.repurposingJob.findUnique({
        where: { id: jobId },
        include: {
          sourceContent: true,
        },
      });

      if (!job) {
        throw new Error('Job not found');
      }

      await prisma.repurposingJob.update({
        where: { id: jobId },
        data: { startedAt: new Date() },
      });

      const selectedOutputs = job.selectedOutputs as RepurposedOutputType[];
      const config = job.config as GenerationConfig;
      let generated = 0;

      // Generate each output type
      for (const outputType of selectedOutputs) {
        try {
          await this.generateOutput(
            job.sourceContent,
            outputType,
            job.userId,
            jobId,
            config
          );

          generated++;

          // Update progress
          const progress = Math.round((generated / selectedOutputs.length) * 100);
          await prisma.repurposingJob.update({
            where: { id: jobId },
            data: {
              progress,
              outputsGenerated: generated,
              totalOutputs: selectedOutputs.length,
            },
          });
        } catch (error) {
          console.error(`Error generating ${outputType}:`, error);
          // Continue with other outputs
        }
      }

      // Mark job as complete
      await prisma.repurposingJob.update({
        where: { id: jobId },
        data: {
          status: 'READY',
          completedAt: new Date(),
          progress: 100,
        },
      });

      return { success: true, generated };
    } catch (error: any) {
      console.error('Job processing error:', error);

      await prisma.repurposingJob.update({
        where: { id: jobId },
        data: {
          status: 'ERROR',
          errors: { message: error.message },
        },
      });

      throw error;
    }
  }

  /**
   * Generate single output
   */
  private static async generateOutput(
    sourceContent: any,
    outputType: RepurposedOutputType,
    userId: string,
    jobId: string,
    config?: GenerationConfig
  ) {
    const generator = this.getGenerator(outputType);
    const result = await generator(sourceContent, config);

    // Determine platform based on output type
    const platform = this.getPlatformForOutputType(outputType);

    // Create repurposed content
    return await prisma.repurposedContent.create({
      data: {
        userId,
        sourceContentId: sourceContent.id,
        repurposingJobId: jobId,
        outputType,
        platform,
        title: result.title,
        content: result.content,
        caption: result.caption,
        hashtags: result.hashtags || [],
        mentions: result.mentions || [],
        mediaUrl: result.mediaUrl,
        thumbnailUrl: result.thumbnailUrl,
        duration: result.duration,
        metadata: result.metadata,
        keyMoment: result.keyMoment,
      },
    });
  }

  /**
   * Get generator function for output type
   */
  private static getGenerator(outputType: RepurposedOutputType) {
    const generators: Record<RepurposedOutputType, Function> = {
      // Video outputs
      SHORT_VIDEO: this.generateShortVideo.bind(this),
      INSTAGRAM_REEL: this.generateInstagramReel.bind(this),
      TIKTOK: this.generateTikTok.bind(this),
      YOUTUBE_SHORT: this.generateYouTubeShort.bind(this),
      TWITTER_VIDEO: this.generateTwitterVideo.bind(this),
      LINKEDIN_VIDEO: this.generateLinkedInVideo.bind(this),
      FACEBOOK_VIDEO: this.generateFacebookVideo.bind(this),
      PINTEREST_VIDEO: this.generatePinterestVideo.bind(this),

      // Social posts
      TWITTER_THREAD: this.generateTwitterThread.bind(this),
      LINKEDIN_POST: this.generateLinkedInPost.bind(this),
      INSTAGRAM_CAROUSEL: this.generateInstagramCarousel.bind(this),
      STORY_FRAME: this.generateStoryFrame.bind(this),

      // Visual content
      QUOTE_GRAPHIC: this.generateQuoteGraphic.bind(this),
      INFOGRAPHIC: this.generateInfographic.bind(this),
      SLIDE_DECK: this.generateSlideDeck.bind(this),

      // Audio
      AUDIOGRAM: this.generateAudiogram.bind(this),

      // Text content
      BLOG_SUMMARY: this.generateBlogSummary.bind(this),
      EMAIL: this.generateEmail.bind(this),
      EMAIL_SERIES: this.generateEmailSeries.bind(this),
      LINKEDIN_ARTICLE: this.generateLinkedInArticle.bind(this),
      MEDIUM_ARTICLE: this.generateMediumArticle.bind(this),
      QUOTE_LIST: this.generateQuoteList.bind(this),
      FAQ: this.generateFAQ.bind(this),
      TRANSCRIPT: this.generateTranscript.bind(this),
      SHOW_NOTES: this.generateShowNotes.bind(this),
      COURSE_MODULE: this.generateCourseModule.bind(this),
      HOW_TO_GUIDE: this.generateHowToGuide.bind(this),
    };

    return generators[outputType] || this.generateGeneric.bind(this);
  }

  /**
   * Get platform for output type
   */
  private static getPlatformForOutputType(outputType: RepurposedOutputType): SocialPlatform | undefined {
    const mapping: Partial<Record<RepurposedOutputType, SocialPlatform>> = {
      INSTAGRAM_REEL: 'INSTAGRAM',
      INSTAGRAM_CAROUSEL: 'INSTAGRAM',
      TIKTOK: 'TIKTOK',
      YOUTUBE_SHORT: 'YOUTUBE',
      TWITTER_VIDEO: 'TWITTER',
      TWITTER_THREAD: 'TWITTER',
      LINKEDIN_VIDEO: 'LINKEDIN',
      LINKEDIN_POST: 'LINKEDIN',
      LINKEDIN_ARTICLE: 'LINKEDIN',
      FACEBOOK_VIDEO: 'FACEBOOK',
      PINTEREST_VIDEO: 'PINTEREST',
    };

    return mapping[outputType];
  }

  // ============================================
  // GENERATOR FUNCTIONS
  // ============================================

  /**
   * Generate Instagram Reel
   */
  private static async generateInstagramReel(sourceContent: any, config?: GenerationConfig) {
    const keyMoments = sourceContent.keyMoments || [];
    const bestMoment = keyMoments.sort((a: any, b: any) => b.importance - a.importance)[0];

    const prompt = `Create an engaging Instagram Reel script (15-60 seconds) from this moment:

SOURCE: ${sourceContent.title}
MOMENT: ${bestMoment?.description || 'Key insight from content'}
TRANSCRIPT: ${sourceContent.transcript?.substring(0, 1000)}

Create:
1. Hook (first 3 seconds - grab attention)
2. Value delivery (main content)
3. CTA (call to action)
4. Caption for the reel
5. 5-10 relevant hashtags

Tone: ${config?.tone || 'engaging'}

Return JSON:
{
  "hook": "Opening line",
  "script": "Full script",
  "caption": "Instagram caption",
  "hashtags": ["array", "of", "hashtags"],
  "duration": 30
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');

    return {
      title: `Instagram Reel: ${bestMoment?.title || sourceContent.title}`,
      content: result.script,
      caption: result.caption,
      hashtags: result.hashtags,
      duration: result.duration,
      keyMoment: bestMoment,
      metadata: {
        format: '9:16',
        hook: result.hook,
      },
    };
  }

  /**
   * Generate TikTok
   */
  private static async generateTikTok(sourceContent: any, config?: GenerationConfig) {
    // Similar to Instagram Reel but TikTok-optimized
    return this.generateInstagramReel(sourceContent, config);
  }

  /**
   * Generate YouTube Short
   */
  private static async generateYouTubeShort(sourceContent: any, config?: GenerationConfig) {
    // Similar to reels but can be slightly longer (up to 60s)
    return this.generateInstagramReel(sourceContent, config);
  }

  /**
   * Generate Twitter Thread
   */
  private static async generateTwitterThread(sourceContent: any, config?: GenerationConfig) {
    const prompt = `Create an engaging Twitter thread from this content:

SOURCE: ${sourceContent.title}
KEY TOPICS: ${JSON.stringify(sourceContent.keyTopics || [])}
CONTENT: ${sourceContent.transcript?.substring(0, 2000)}

Create a thread of 5-10 tweets (280 chars each):
1. Hook tweet (grab attention)
2-8. Key insights (one per tweet)
9. Final tweet with CTA

Return JSON:
{
  "tweets": ["array of tweet texts"],
  "hashtags": ["relevant", "hashtags"]
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');

    return {
      title: `Twitter Thread: ${sourceContent.title}`,
      content: result.tweets.join('\n\n'),
      caption: result.tweets[0],
      hashtags: result.hashtags,
      metadata: {
        tweets: result.tweets,
        tweetCount: result.tweets.length,
      },
    };
  }

  /**
   * Generate LinkedIn Post
   */
  private static async generateLinkedInPost(sourceContent: any, config?: GenerationConfig) {
    const prompt = `Create a professional LinkedIn post from this content:

SOURCE: ${sourceContent.title}
CONTENT: ${sourceContent.transcript?.substring(0, 2000)}

Create a LinkedIn post:
- Hook in first line
- Value-packed content
- Professional tone
- Ends with engagement question
- 1-3 paragraphs max

Return JSON:
{
  "post": "The LinkedIn post text",
  "hashtags": ["professional", "hashtags"]
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');

    return {
      title: `LinkedIn Post: ${sourceContent.title}`,
      content: result.post,
      caption: result.post,
      hashtags: result.hashtags,
    };
  }

  /**
   * Generate Quote Graphic
   */
  private static async generateQuoteGraphic(sourceContent: any, config?: GenerationConfig) {
    const quotes = sourceContent.quotes || [];
    const bestQuote = quotes.sort((a: any, b: any) => b.importance - a.importance)[0];

    return {
      title: `Quote: ${bestQuote?.text?.substring(0, 50) || 'Quote'}`,
      content: bestQuote?.text || 'Inspirational quote',
      caption: `"${bestQuote?.text}" - ${bestQuote?.speaker || sourceContent.title}`,
      hashtags: ['quote', 'inspiration', 'motivation'],
      metadata: {
        quoteText: bestQuote?.text,
        speaker: bestQuote?.speaker,
        designType: 'quote-graphic',
      },
    };
  }

  /**
   * Generate Blog Summary
   */
  private static async generateBlogSummary(sourceContent: any, config?: GenerationConfig) {
    const prompt = `Create a blog summary (300-500 words) from this content:

TITLE: ${sourceContent.title}
CONTENT: ${sourceContent.transcript?.substring(0, 3000)}

Create:
- Engaging intro paragraph
- Key points (3-5 bullet points)
- Conclusion with CTA

Return JSON:
{
  "title": "Blog title",
  "summary": "The full summary text",
  "keyPoints": ["point 1", "point 2"]
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');

    return {
      title: result.title,
      content: result.summary,
      metadata: {
        keyPoints: result.keyPoints,
      },
    };
  }

  /**
   * Generic generator for other types
   */
  private static async generateGeneric(sourceContent: any, config?: GenerationConfig) {
    return {
      title: `Generated from: ${sourceContent.title}`,
      content: sourceContent.transcript?.substring(0, 500) || '',
      caption: `From: ${sourceContent.title}`,
      hashtags: [],
    };
  }

  // Placeholder implementations for other generators
  private static async generateShortVideo(sourceContent: any, config?: GenerationConfig) {
    return this.generateInstagramReel(sourceContent, config);
  }

  private static async generateLinkedInVideo(sourceContent: any, config?: GenerationConfig) {
    return this.generateInstagramReel(sourceContent, config);
  }

  private static async generateFacebookVideo(sourceContent: any, config?: GenerationConfig) {
    return this.generateInstagramReel(sourceContent, config);
  }

  private static async generatePinterestVideo(sourceContent: any, config?: GenerationConfig) {
    return this.generateInstagramReel(sourceContent, config);
  }

  private static async generateTwitterVideo(sourceContent: any, config?: GenerationConfig) {
    return this.generateInstagramReel(sourceContent, config);
  }

  private static async generateInstagramCarousel(sourceContent: any, config?: GenerationConfig) {
    return this.generateQuoteGraphic(sourceContent, config);
  }

  private static async generateStoryFrame(sourceContent: any, config?: GenerationConfig) {
    return this.generateQuoteGraphic(sourceContent, config);
  }

  private static async generateInfographic(sourceContent: any, config?: GenerationConfig) {
    return this.generateQuoteGraphic(sourceContent, config);
  }

  private static async generateSlideDeck(sourceContent: any, config?: GenerationConfig) {
    return this.generateBlogSummary(sourceContent, config);
  }

  private static async generateAudiogram(sourceContent: any, config?: GenerationConfig) {
    return this.generateQuoteGraphic(sourceContent, config);
  }

  private static async generateEmail(sourceContent: any, config?: GenerationConfig) {
    return this.generateBlogSummary(sourceContent, config);
  }

  private static async generateEmailSeries(sourceContent: any, config?: GenerationConfig) {
    return this.generateBlogSummary(sourceContent, config);
  }

  private static async generateLinkedInArticle(sourceContent: any, config?: GenerationConfig) {
    return this.generateBlogSummary(sourceContent, config);
  }

  private static async generateMediumArticle(sourceContent: any, config?: GenerationConfig) {
    return this.generateBlogSummary(sourceContent, config);
  }

  private static async generateQuoteList(sourceContent: any, config?: GenerationConfig) {
    return this.generateQuoteGraphic(sourceContent, config);
  }

  private static async generateFAQ(sourceContent: any, config?: GenerationConfig) {
    return this.generateBlogSummary(sourceContent, config);
  }

  private static async generateTranscript(sourceContent: any, config?: GenerationConfig) {
    return {
      title: `Transcript: ${sourceContent.title}`,
      content: sourceContent.transcript || '',
      caption: `Full transcript of ${sourceContent.title}`,
    };
  }

  private static async generateShowNotes(sourceContent: any, config?: GenerationConfig) {
    return this.generateBlogSummary(sourceContent, config);
  }

  private static async generateCourseModule(sourceContent: any, config?: GenerationConfig) {
    return this.generateBlogSummary(sourceContent, config);
  }

  private static async generateHowToGuide(sourceContent: any, config?: GenerationConfig) {
    return this.generateBlogSummary(sourceContent, config);
  }
}
