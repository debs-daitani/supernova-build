import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, UserTier, AIMode, MessageRole } from '@prisma/client';
import { z } from 'zod';

// ============================
// INITIALIZATION & ENV CHECKS
// ============================
console.log('🚀 SUPERNova API Route Loading...');
console.log('📋 Environment Check:');
console.log('  - ANTHROPIC_API_KEY:', process.env.ANTHROPIC_API_KEY ? '✅ Set' : '❌ MISSING');
console.log('  - DATABASE_URL:', process.env.DATABASE_URL ? '✅ Set' : '❌ MISSING');

const prisma = new PrismaClient();

if (!process.env.ANTHROPIC_API_KEY) {
  console.error('❌ CRITICAL: ANTHROPIC_API_KEY not set in environment variables!');
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Correct model name - CRITICAL FIX
const CLAUDE_MODEL = 'claude-sonnet-4-20250514';
console.log('  - Using Claude Model:', CLAUDE_MODEL);

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
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`🎯 [${requestId}] SUPERNova API Route Hit`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    // Parse and validate request
    console.log(`📥 [${requestId}] Parsing request body...`);
    const body = await req.json();
    console.log(`✅ [${requestId}] Request body parsed:`, {
      hasMessage: !!body.message,
      messageLength: body.message?.length,
      userId: body.userId,
      conversationId: body.conversationId || 'NEW',
      mode: body.mode || 'BRAIN',
    });

    const { message, userId, conversationId, mode } = requestSchema.parse(body);
    console.log(`✅ [${requestId}] Request validated successfully`);

    // Get or create user
    console.log(`🔍 [${requestId}] Looking up user: ${userId}`);
    let user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      console.error(`❌ [${requestId}] User not found: ${userId}`);
      return NextResponse.json(
        { error: 'User not found. Please authenticate first.' },
        { status: 401 }
      );
    }

    console.log(`✅ [${requestId}] User authenticated:`, {
      userId: user.id,
      email: user.email,
      tier: user.tier,
    });

    // ============================
    // TIER ENFORCEMENT - CRITICAL
    // ============================
    console.log(`🔐 [${requestId}] Checking tier access: ${user.tier}`);
    if (user.tier === UserTier.FREE) {
      console.log(`⛔ [${requestId}] Access denied - FREE tier blocked`);
      return NextResponse.json(
        {
          error: 'SUPERNova AI is available for UPGRADE tier and above.',
          upgrade: true,
          message: '🚀 Upgrade to access SUPERNova AI - your personal business coach!',
        },
        { status: 403 }
      );
    }
    console.log(`✅ [${requestId}] Tier access granted: ${user.tier}`);

    // Get or create usage tracking
    console.log(`📊 [${requestId}] Fetching usage tracking...`);
    let usage = await prisma.usageTracking.findUnique({ where: { userId } });
    if (!usage) {
      console.log(`📝 [${requestId}] Creating new usage tracking record...`);
      usage = await prisma.usageTracking.create({
        data: {
          userId,
          supernovaMessages: 0,
          totalMessages: 0,
          totalTokens: 0,
          currentMonth: new Date(),
        },
      });
      console.log(`✅ [${requestId}] Usage tracking created`);
    } else {
      console.log(`✅ [${requestId}] Usage tracking found:`, {
        supernovaMessages: usage.supernovaMessages,
        totalMessages: usage.totalMessages,
        totalTokens: usage.totalTokens,
      });
    }

    // Check if we need to reset monthly counter
    const now = new Date();
    const currentMonth = new Date(usage.currentMonth);
    if (
      now.getMonth() !== currentMonth.getMonth() ||
      now.getFullYear() !== currentMonth.getFullYear()
    ) {
      console.log(`🔄 [${requestId}] Resetting monthly counter (new month)`);
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
    console.log(`📈 [${requestId}] Quota check: ${usage.supernovaMessages}/${limit}`);

    if (usage.supernovaMessages >= limit) {
      console.log(`⛔ [${requestId}] Quota limit reached!`);
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
    console.log(`✅ [${requestId}] Quota check passed - ${limit - usage.supernovaMessages} messages remaining`);

    // ============================
    // GET OR CREATE CONVERSATION
    // ============================
    let conversation;
    if (conversationId) {
      console.log(`💬 [${requestId}] Loading existing conversation: ${conversationId}`);
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
        console.error(`❌ [${requestId}] Conversation not found or unauthorized`);
        return NextResponse.json(
          { error: 'Conversation not found or unauthorized.' },
          { status: 404 }
        );
      }
      console.log(`✅ [${requestId}] Conversation loaded - ${conversation.messages.length} messages in history`);
    } else {
      console.log(`💬 [${requestId}] Creating new conversation in ${mode} mode`);
      conversation = await prisma.conversation.create({
        data: {
          userId,
          mode: mode as AIMode,
          title: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
        },
        include: { messages: true },
      });
      console.log(`✅ [${requestId}] New conversation created: ${conversation.id}`);
    }

    // ============================
    // SAVE USER MESSAGE TO DATABASE
    // ============================
    console.log(`💾 [${requestId}] Saving user message to database...`);
    const userMessage = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        userId,
        role: MessageRole.USER,
        content: message,
      },
    });
    console.log(`✅ [${requestId}] User message saved: ${userMessage.id}`);

    // ============================
    // BUILD CONTEXT FOR CLAUDE
    // ============================
    console.log(`🧠 [${requestId}] Building conversation context...`);
    const conversationHistory = conversation.messages.map((msg) => ({
      role: msg.role === MessageRole.USER ? 'user' : 'assistant',
      content: msg.content,
    })) as Array<{ role: 'user' | 'assistant'; content: string }>;

    // Add current message
    conversationHistory.push({
      role: 'user',
      content: message,
    });
    console.log(`✅ [${requestId}] Context built with ${conversationHistory.length} messages`);

    // ============================
    // CALL CLAUDE API WITH STREAMING
    // ============================
    const systemPrompt = SYSTEM_PROMPTS[mode as keyof typeof SYSTEM_PROMPTS];
    console.log(`\n🤖 [${requestId}] Calling Anthropic API...`);
    console.log(`  - Model: ${CLAUDE_MODEL}`);
    console.log(`  - Mode: ${mode}`);
    console.log(`  - System prompt length: ${systemPrompt.length} chars`);
    console.log(`  - Messages in context: ${conversationHistory.length}`);

    try {
      const stream = await anthropic.messages.stream({
        model: CLAUDE_MODEL,
        max_tokens: 4096,
        system: systemPrompt,
        messages: conversationHistory,
      });
      console.log(`✅ [${requestId}] Anthropic API stream started successfully`);

      // Collect the full response and track tokens
      let fullResponse = '';
      let inputTokens = 0;
      let outputTokens = 0;

      // Create readable stream for client
      const encoder = new TextEncoder();
      const readableStream = new ReadableStream({
        async start(controller) {
          try {
            console.log(`🌊 [${requestId}] Starting stream processing...`);
            let chunkCount = 0;

            for await (const chunk of stream) {
              chunkCount++;

              if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
                const text = chunk.delta.text;
                fullResponse += text;
                // Send to client in the format: { text: "..." }
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
              }

              if (chunk.type === 'message_start') {
                inputTokens = chunk.message.usage.input_tokens;
                console.log(`📊 [${requestId}] Input tokens: ${inputTokens}`);
              }

              if (chunk.type === 'message_delta') {
                outputTokens = chunk.usage.output_tokens;
                console.log(`📊 [${requestId}] Output tokens: ${outputTokens}`);
              }
            }

            console.log(`✅ [${requestId}] Stream completed - ${chunkCount} chunks, ${fullResponse.length} chars`);

            // Stream complete - save assistant message to database
            const totalTokens = inputTokens + outputTokens;
            console.log(`💾 [${requestId}] Saving assistant message (${totalTokens} tokens)...`);

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
            console.log(`✅ [${requestId}] Assistant message saved`);

            // Update usage tracking
            console.log(`📊 [${requestId}] Updating usage tracking...`);
            await prisma.usageTracking.update({
              where: { userId },
              data: {
                supernovaMessages: { increment: 1 },
                totalMessages: { increment: 1 },
                totalTokens: { increment: totalTokens },
              },
            });
            console.log(`✅ [${requestId}] Usage tracking updated`);

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

            console.log(`✅ [${requestId}] Request completed successfully`);
            console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
            controller.close();
          } catch (error) {
            console.error(`❌ [${requestId}] Stream error:`, error);
            console.error(`❌ [${requestId}] Error stack:`, error instanceof Error ? error.stack : 'No stack trace');
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
    } catch (anthropicError) {
      console.error(`❌ [${requestId}] Anthropic API error:`, anthropicError);
      console.error(`❌ [${requestId}] Error type:`, anthropicError instanceof Error ? anthropicError.constructor.name : typeof anthropicError);
      console.error(`❌ [${requestId}] Error message:`, anthropicError instanceof Error ? anthropicError.message : String(anthropicError));
      console.error(`❌ [${requestId}] Error stack:`, anthropicError instanceof Error ? anthropicError.stack : 'No stack trace');

      throw anthropicError;
    }
  } catch (error) {
    console.error('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error(`❌ [${requestId}] FATAL ERROR in SUPERNova API`);
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error(`Error type: ${error instanceof Error ? error.constructor.name : typeof error}`);
    console.error(`Error message: ${error instanceof Error ? error.message : String(error)}`);

    if (error instanceof Error && error.stack) {
      console.error(`Stack trace:\n${error.stack}`);
    }

    // Log full error object for debugging
    console.error('Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (error instanceof z.ZodError) {
      console.error(`❌ [${requestId}] Validation error:`, error.errors);
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: error.errors,
          requestId,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
        type: error instanceof Error ? error.constructor.name : typeof error,
        requestId,
        // Include stack trace in development
        ...(process.env.NODE_ENV === 'development' && {
          stack: error instanceof Error ? error.stack : undefined,
        }),
      },
      { status: 500 }
    );
  }
}
