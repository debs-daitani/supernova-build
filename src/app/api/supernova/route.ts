import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, UserTier, AIMode, MessageRole } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Correct model name - CRITICAL FIX
const CLAUDE_MODEL = 'claude-sonnet-4-20250514';

// Tier limits (messages per month)
const TIER_LIMITS = {
  FREE: 0, // Blocked entirely
  UPGRADE: 100,
  MEMBER: 300,
  ADMIN: Infinity,
};

// Debs's personality system prompts for each mode
const SYSTEM_PROMPTS = {
  BODY: `You are SUPERNova Body - helping midlife women navigate menopause, perimenopause, and physical confidence. You're direct, honest, sweary when appropriate, and anti-bullshit. You understand ADHD bodies, sensory sensitivities, and the unique challenges of building a business while your hormones are doing the fucking macarena. Use rock music metaphors. Never use corporate jargon or 'hey girl' terminology. British English.`,

  BRAIN: `You are SUPERNova Brain - coaching neurodivergent entrepreneurs (especially ADHD) on mental health, time blindness, executive dysfunction, and building businesses that work WITH their brains, not against them. You're direct, profanity-friendly, anti-establishment, and anti-guru. You get that some days the brain just isn't braining. Use rock music metaphors. British English, no corporate waffle.`,

  BUSINESS: `You are SUPERNova Business - a business strategist for midlife female entrepreneurs who refuse to follow the bro-marketing playbook. You teach Anti-Branding (fuck the personal brand rules), Menopreneur strategies (business models for women 40+), and ADHD-friendly systems. You're direct, sweary, anti-gatekeeping, and anti-corporate bullshit. Use rock music metaphors ('rockstar', 'stage', 'encore', 'setlist'). British English. Never say 'slay' or 'hey girl' or any naff Americanised terminology.`,
};

// Request validation schema
const requestSchema = z.object({
  message: z.string().min(1).max(5000),
  userId: z.string(),
  conversationId: z.string().optional(),
  mode: z.enum(['BODY', 'BRAIN', 'BUSINESS']).default('BRAIN'),
});

export async function POST(req: NextRequest) {
  try {
    // Parse and validate request
    const body = await req.json();
    const { message, userId, conversationId, mode } = requestSchema.parse(body);

    // Get or create user
    let user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found. Please authenticate first.' },
        { status: 401 }
      );
    }

    // ============================
    // TIER ENFORCEMENT - CRITICAL
    // ============================
    if (user.tier === UserTier.FREE) {
      return NextResponse.json(
        {
          error: 'SUPERNova AI is available for UPGRADE tier and above.',
          upgrade: true,
          message: '🚀 Upgrade to access SUPERNova AI - your personal business coach!',
        },
        { status: 403 }
      );
    }

    // Get or create usage tracking
    let usage = await prisma.usageTracking.findUnique({ where: { userId } });
    if (!usage) {
      usage = await prisma.usageTracking.create({
        data: {
          userId,
          supernovaMessages: 0,
          totalMessages: 0,
          totalTokens: 0,
          currentMonth: new Date(),
        },
      });
    }

    // Check if we need to reset monthly counter
    const now = new Date();
    const currentMonth = new Date(usage.currentMonth);
    if (
      now.getMonth() !== currentMonth.getMonth() ||
      now.getFullYear() !== currentMonth.getFullYear()
    ) {
      usage = await prisma.usageTracking.update({
        where: { userId },
        data: {
          supernovaMessages: 0,
          currentMonth: now,
        },
      });
    }

    // ============================
    // USAGE QUOTA ENFORCEMENT
    // ============================
    const limit = TIER_LIMITS[user.tier];
    if (usage.supernovaMessages >= limit) {
      return NextResponse.json(
        {
          error: 'Monthly message limit reached.',
          limit,
          used: usage.supernovaMessages,
          upgrade: user.tier === UserTier.UPGRADE,
          message:
            user.tier === UserTier.UPGRADE
              ? `You've used all ${limit} messages this month. Upgrade to MEMBER for 300 messages/month!`
              : `You've reached your ${limit} message limit for this month.`,
        },
        { status: 429 }
      );
    }

    // ============================
    // GET OR CREATE CONVERSATION
    // ============================
    let conversation;
    if (conversationId) {
      conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
            take: 50, // Last 50 messages for context
          },
        },
      });

      if (!conversation || conversation.userId !== userId) {
        return NextResponse.json(
          { error: 'Conversation not found or unauthorized.' },
          { status: 404 }
        );
      }
    } else {
      // Create new conversation
      conversation = await prisma.conversation.create({
        data: {
          userId,
          mode: mode as AIMode,
          title: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
        },
        include: { messages: true },
      });
    }

    // ============================
    // SAVE USER MESSAGE TO DATABASE
    // ============================
    const userMessage = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        userId,
        role: MessageRole.USER,
        content: message,
      },
    });

    // ============================
    // BUILD CONTEXT FOR CLAUDE
    // ============================
    const conversationHistory = conversation.messages.map((msg) => ({
      role: msg.role === MessageRole.USER ? 'user' : 'assistant',
      content: msg.content,
    })) as Array<{ role: 'user' | 'assistant'; content: string }>;

    // Add current message
    conversationHistory.push({
      role: 'user',
      content: message,
    });

    // ============================
    // CALL CLAUDE API WITH STREAMING
    // ============================
    const systemPrompt = SYSTEM_PROMPTS[mode as keyof typeof SYSTEM_PROMPTS];

    const stream = await anthropic.messages.stream({
      model: CLAUDE_MODEL,
      max_tokens: 4096,
      system: systemPrompt,
      messages: conversationHistory,
    });

    // Collect the full response and track tokens
    let fullResponse = '';
    let inputTokens = 0;
    let outputTokens = 0;

    // Create readable stream for client
    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
              const text = chunk.delta.text;
              fullResponse += text;
              // Send to client in the format: { text: "..." }
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
            }

            if (chunk.type === 'message_start') {
              inputTokens = chunk.message.usage.input_tokens;
            }

            if (chunk.type === 'message_delta') {
              outputTokens = chunk.usage.output_tokens;
            }
          }

          // Stream complete - save assistant message to database
          const totalTokens = inputTokens + outputTokens;

          await prisma.message.create({
            data: {
              conversationId: conversation.id,
              userId,
              role: MessageRole.ASSISTANT,
              content: fullResponse,
              tokensUsed: totalTokens,
              modelUsed: CLAUDE_MODEL,
            },
          });

          // Update usage tracking
          await prisma.usageTracking.update({
            where: { userId },
            data: {
              supernovaMessages: { increment: 1 },
              totalMessages: { increment: 1 },
              totalTokens: { increment: totalTokens },
            },
          });

          // Send final metadata
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                done: true,
                conversationId: conversation.id,
                tokensUsed: totalTokens,
                usage: {
                  used: usage.supernovaMessages + 1,
                  limit,
                },
              })}\n\n`
            )
          );

          controller.close();
        } catch (error) {
          console.error('Stream error:', error);
          controller.error(error);
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('SUPERNova API error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
