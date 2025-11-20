/**
 * Content Processing Service
 *
 * Handles upload, transcription, and initial processing of source content
 */

import { PrismaClient, SourceContentType, ProcessingStatus } from '@prisma/client';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface UploadInput {
  userId: string;
  title: string;
  contentType: SourceContentType;
  sourceFile?: string;
  sourceUrl?: string;
  duration?: number;
  wordCount?: number;
  fileSize?: number;
}

interface TranscriptionResult {
  transcript: string;
  duration?: number;
  speakers?: any[];
}

export class ContentProcessingService {
  /**
   * Upload and create source content
   */
  static async uploadSourceContent(input: UploadInput) {
    const sourceContent = await prisma.sourceContent.create({
      data: {
        userId: input.userId,
        title: input.title,
        contentType: input.contentType,
        sourceFile: input.sourceFile,
        sourceUrl: input.sourceUrl,
        duration: input.duration,
        wordCount: input.wordCount,
        fileSize: input.fileSize,
        status: 'QUEUED',
      },
    });

    // Trigger processing asynchronously
    this.processContent(sourceContent.id).catch(err => {
      console.error('Error processing content:', err);
    });

    return sourceContent;
  }

  /**
   * Process source content (transcription + analysis)
   */
  static async processContent(sourceContentId: string) {
    try {
      // Update status to processing
      await prisma.sourceContent.update({
        where: { id: sourceContentId },
        data: { status: 'PROCESSING' },
      });

      const sourceContent = await prisma.sourceContent.findUnique({
        where: { id: sourceContentId },
      });

      if (!sourceContent) {
        throw new Error('Source content not found');
      }

      let transcript = '';

      // Process based on content type
      if (sourceContent.contentType === 'VIDEO' || sourceContent.contentType === 'PODCAST') {
        // Transcribe audio/video
        const transcriptionResult = await this.transcribeMedia(sourceContent.sourceFile || sourceContent.sourceUrl!);
        transcript = transcriptionResult.transcript;
      } else if (
        sourceContent.contentType === 'BLOG_POST' ||
        sourceContent.contentType === 'ARTICLE' ||
        sourceContent.contentType === 'EBOOK'
      ) {
        // Extract text from document or URL
        transcript = await this.extractTextContent(sourceContent.sourceFile || sourceContent.sourceUrl!);
      } else {
        // For presentations, webinars, etc., try to extract text
        transcript = await this.extractTextContent(sourceContent.sourceFile || sourceContent.sourceUrl!);
      }

      // Analyze the transcript
      const analysis = await this.analyzeTranscript(transcript, sourceContent.contentType);

      // Update source content with results
      await prisma.sourceContent.update({
        where: { id: sourceContentId },
        data: {
          transcript,
          keyTopics: analysis.keyTopics,
          keyMoments: analysis.keyMoments,
          quotes: analysis.quotes,
          speakers: analysis.speakers,
          chapters: analysis.chapters,
          sentiment: analysis.sentiment,
          status: 'READY',
          processedAt: new Date(),
        },
      });

      return { success: true };
    } catch (error: any) {
      console.error('Processing error:', error);

      await prisma.sourceContent.update({
        where: { id: sourceContentId },
        data: {
          status: 'ERROR',
          processingError: error.message,
        },
      });

      throw error;
    }
  }

  /**
   * Transcribe audio/video using OpenAI Whisper
   */
  private static async transcribeMedia(mediaPath: string): Promise<TranscriptionResult> {
    try {
      // If it's a URL, download first (simplified - in production use proper download)
      // For now, assume local file path

      // Use OpenAI Whisper API
      const file = fs.createReadStream(mediaPath);

      const transcription = await openai.audio.transcriptions.create({
        file: file,
        model: 'whisper-1',
        response_format: 'verbose_json',
        timestamp_granularities: ['segment'],
      });

      // Extract speakers (basic implementation)
      const speakers: any[] = [];
      let currentSpeaker = 'Speaker 1';
      let speakerId = 1;

      // Process segments for speaker detection (simplified)
      if (transcription.segments) {
        transcription.segments.forEach((segment: any) => {
          // Simple heuristic: change speaker on long pauses
          speakers.push({
            speaker: currentSpeaker,
            start: segment.start,
            end: segment.end,
            text: segment.text,
          });
        });
      }

      return {
        transcript: transcription.text,
        duration: transcription.duration,
        speakers,
      };
    } catch (error) {
      console.error('Transcription error:', error);
      throw new Error('Failed to transcribe media');
    }
  }

  /**
   * Extract text from document or URL
   */
  private static async extractTextContent(source: string): Promise<string> {
    try {
      // Check if it's a URL
      if (source.startsWith('http://') || source.startsWith('https://')) {
        // Fetch and parse webpage (simplified)
        // In production, use proper scraping library like cheerio
        const response = await fetch(source);
        const html = await response.text();

        // Basic HTML to text conversion (very simplified)
        let text = html.replace(/<script[^>]*>.*?<\/script>/gi, '');
        text = text.replace(/<style[^>]*>.*?<\/style>/gi, '');
        text = text.replace(/<[^>]+>/g, ' ');
        text = text.replace(/\s+/g, ' ').trim();

        return text;
      }

      // If it's a local file, read it
      if (fs.existsSync(source)) {
        const content = fs.readFileSync(source, 'utf-8');
        return content;
      }

      throw new Error('Invalid source path');
    } catch (error) {
      console.error('Text extraction error:', error);
      throw new Error('Failed to extract text content');
    }
  }

  /**
   * Analyze transcript using AI
   */
  private static async analyzeTranscript(transcript: string, contentType: SourceContentType) {
    const prompt = `Analyze this ${contentType.toLowerCase().replace('_', ' ')} transcript and provide:

TRANSCRIPT:
${transcript.substring(0, 20000)}

Provide a comprehensive analysis in JSON format:
{
  "keyTopics": ["array of main topics discussed"],
  "keyMoments": [
    {
      "timestamp": "00:05:30",
      "title": "moment title",
      "description": "what happens here",
      "importance": 0-10,
      "type": "quote|insight|story|tip|statistic"
    }
  ],
  "quotes": [
    {
      "text": "the quotable text",
      "speaker": "speaker name",
      "timestamp": "00:02:15",
      "importance": 0-10
    }
  ],
  "chapters": [
    {
      "start": "00:00:00",
      "end": "00:05:00",
      "title": "chapter title",
      "summary": "what's covered"
    }
  ],
  "speakers": ["list of speaker names if identifiable"],
  "sentiment": {
    "overall": "positive|neutral|negative",
    "bySection": []
  }
}

Return ONLY the JSON object.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    });

    return JSON.parse(response.choices[0].message.content || '{}');
  }

  /**
   * Get source content by ID
   */
  static async getSourceContent(id: string) {
    return await prisma.sourceContent.findUnique({
      where: { id },
      include: {
        repurposedContent: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
        repurposingJobs: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  /**
   * Get user's source content
   */
  static async getUserSourceContent(userId: string, page = 1, limit = 20) {
    const [content, total] = await Promise.all([
      prisma.sourceContent.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          _count: {
            select: {
              repurposedContent: true,
            },
          },
        },
      }),
      prisma.sourceContent.count({ where: { userId } }),
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
   * Delete source content
   */
  static async deleteSourceContent(id: string) {
    return await prisma.sourceContent.delete({
      where: { id },
    });
  }

  /**
   * Get processing status
   */
  static async getProcessingStatus(id: string) {
    const content = await prisma.sourceContent.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        processingError: true,
        processedAt: true,
      },
    });

    return content;
  }
}
