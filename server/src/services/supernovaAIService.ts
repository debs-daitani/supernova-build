/**
 * SUPERNova AI Service
 *
 * Main AI orchestrator with Claude integration, personality, and platform awareness
 */

import Anthropic from '@anthropic-ai/sdk';
import { PrismaClient } from '@prisma/client';
import { SupernovaMemoryService } from './supernovaMemoryService';
import { SupernovaConversationService } from './supernovaConversationService';

const prisma = new PrismaClient();
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export class SupernovaAIService {
  /**
   * Send message and get AI response
   */
  static async chat(userId: string, conversationId: string, userMessage: string) {
    // Get user profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Get conversation
    const conversation = await SupernovaConversationService.getConversation(conversationId);

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    // Save user message
    await SupernovaConversationService.addMessage(conversationId, userId, 'user', userMessage);

    // Get relevant memories
    const memories = await SupernovaMemoryService.getRelevantMemories(userId, userMessage);

    // Build system prompt
    const systemPrompt = this.buildSystemPrompt(user, conversation.mode || 'general', memories);

    // Get conversation history
    const messages = SupernovaConversationService.formatConversationForAI(conversation.messages || []);
    messages.push({ role: 'user', content: userMessage });

    // Call Claude API
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      system: systemPrompt,
      messages: messages,
    });

    const assistantMessage = response.content[0];
    const assistantText = assistantMessage.type === 'text' ? assistantMessage.text : '';

    // Save assistant response
    await SupernovaConversationService.addMessage(
      conversationId,
      userId,
      'assistant',
      assistantText,
      {
        model: 'claude-sonnet-4',
        tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
        memoriesReferenced: memories.length,
      }
    );

    return {
      message: assistantText,
      conversation,
      tokensUsed: response.usage,
    };
  }

  /**
   * Build system prompt with personality and context
   */
  private static buildSystemPrompt(user: any, mode: string, memories: any[]): string {
    const preferredName = user.preferredName || user.name || 'there';
    const pronouns = user.pronouns || 'they/them';

    let prompt = `You are SUPERNova, the AI assistant for The dAItaniverse platform.

PERSONALITY:
- Bold, direct, authentic
- Anti-BS, anti-guru culture
- Supportive but honest
- Rock and roll energy
- Neurodivergent-friendly
- LGBTQ+ inclusive

USER INFO:
Name: ${preferredName}
Pronouns: ${pronouns}
`;

    // Add mode-specific instructions
    if (mode === 'body') {
      prompt += `\nCURRENT MODE: Confident Body 🔥
Focus on: Body confidence, health, wellness, energy management, self-care
Approach: Empowering, body-positive, anti-diet culture, practical`;
    } else if (mode === 'brain') {
      prompt += `\nCURRENT MODE: Confident Brain 🧠
Focus on: Mindset, ADHD support, imposter syndrome, anxiety, mental health
Approach: Understanding, patient, neurodivergent-friendly, anti-toxic positivity`;
    } else if (mode === 'business') {
      prompt += `\nCURRENT MODE: Confident Business 💼
Focus on: Strategy, marketing, sales, scaling, platform features
Approach: Strategic, data-driven, anti-guru, accessible pricing philosophy`;
    } else {
      prompt += `\nCURRENT MODE: General
Adapt to the topic and suggest switching modes if appropriate`;
    }

    // Add memories if available
    if (memories.length > 0) {
      const memoriesText = SupernovaMemoryService.formatMemoriesForAI(memories);
      if (memoriesText) {
        prompt += `\n\nWHAT YOU KNOW ABOUT ${preferredName.toUpperCase()}:\n${memoriesText}`;
      }
    }

    prompt += `\n\nINSTRUCTIONS:
- ALWAYS use ${preferredName} and ${pronouns} consistently
- Reference memories naturally, never robotically
- Be specific and actionable, not generic
- Validate feelings before solving problems
- Adapt to the user's needs and mood
- Use British English (£, colour, etc.)
- Swear occasionally but appropriately
- Short paragraphs, conversational tone
- Question to engage, don't lecture

WHAT YOU NEVER DO:
- Fake positivity or toxic hustle
- Shame or judgment
- Generic advice
- Diet culture or body shaming
- Ableist language
- Gendered assumptions

RESPOND AS SUPERNOVA (conversational, authentic, direct):`;

    return prompt;
  }

  /**
   * Handle first interaction (onboarding)
   */
  static async handleFirstInteraction(userId: string): Promise<{
    conversationId: string;
    message: string;
  }> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Check if already onboarded
    if (user.onboardingCompleted) {
      // Welcome back
      const conversation = await SupernovaConversationService.createConversation(userId, 'general');
      const preferredName = user.preferredName || user.name || 'there';

      const welcomeMessage = `Hey ${preferredName}! 🤘 Good to see you again. What's on your mind today?`;

      await SupernovaConversationService.addMessage(
        conversation.id,
        userId,
        'assistant',
        welcomeMessage
      );

      return {
        conversationId: conversation.id,
        message: welcomeMessage,
      };
    }

    // First time - start onboarding
    const conversation = await SupernovaConversationService.createConversation(userId, 'general');

    const onboardingMessage = `Hey there! 🤘 I'm SUPERNova, and I'm here to help you build your boldest, most authentic business.

Before we dive in, I'd love to know a bit about YOU. What's your name?`;

    await SupernovaConversationService.addMessage(
      conversation.id,
      userId,
      'assistant',
      onboardingMessage
    );

    return {
      conversationId: conversation.id,
      message: onboardingMessage,
    };
  }

  /**
   * Complete onboarding
   */
  static async completeOnboarding(userId: string, data: {
    preferredName: string;
    pronouns: string;
    communicationStyle?: string;
  }) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        preferredName: data.preferredName,
        pronouns: data.pronouns,
        communicationStyle: data.communicationStyle,
        onboardingCompleted: true,
        firstInteractionAt: new Date(),
      },
    });

    // Store memories
    await SupernovaMemoryService.storeMemory({
      userId,
      category: 'personal',
      key: 'preferred_name',
      value: data.preferredName,
      content: `Prefers to be called ${data.preferredName}`,
      importance: 'critical',
    });

    await SupernovaMemoryService.storeMemory({
      userId,
      category: 'personal',
      key: 'pronouns',
      value: data.pronouns,
      content: `Uses ${data.pronouns} pronouns`,
      importance: 'critical',
    });
  }
}
