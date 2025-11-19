import openai from '../config/openai.js';
import prisma from '../config/database.js';
import { getSupernovaSystemPrompt } from '../prompts/supernovaSystemPrompt.js';

/**
 * Get user's memories for context
 */
const getUserMemories = async (userId) => {
  return await prisma.memory.findMany({
    where: { userId },
    orderBy: { importance: 'desc' },
    take: 20, // Get top 20 most important memories
  });
};

/**
 * Get recent conversation history
 */
const getConversationHistory = async (conversationId, limit = 20) => {
  return await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: {
      role: true,
      content: true,
      createdAt: true,
    },
  });
};

/**
 * Store a new memory
 */
export const storeMemory = async (userId, { type, key, value, context, importance = 5 }) => {
  return await prisma.memory.upsert({
    where: {
      userId_key: { userId, key },
    },
    update: {
      value,
      context,
      importance,
      updatedAt: new Date(),
    },
    create: {
      userId,
      type,
      key,
      value,
      context,
      importance,
    },
  });
};

/**
 * Extract and store memories from conversation
 */
const extractMemories = async (userId, userMessage, assistantMessage) => {
  // Simple keyword-based memory extraction
  // In production, you'd use more sophisticated NLP

  const content = `${userMessage} ${assistantMessage}`.toLowerCase();

  // Extract goals
  if (content.includes('goal') || content.includes('want to') || content.includes('trying to')) {
    const goalMatch = content.match(/(?:goal|want to|trying to)\s+(.{10,100})/i);
    if (goalMatch) {
      await storeMemory(userId, {
        type: 'GOAL',
        key: 'recent_goal',
        value: goalMatch[1].trim(),
        importance: 8,
      });
    }
  }

  // Extract challenges
  if (content.includes('struggling') || content.includes('difficult') || content.includes('challenge')) {
    const challengeMatch = content.match(/(?:struggling|difficult|challenge)\s+(?:with\s+)?(.{10,100})/i);
    if (challengeMatch) {
      await storeMemory(userId, {
        type: 'CHALLENGE',
        key: 'recent_challenge',
        value: challengeMatch[1].trim(),
        importance: 7,
      });
    }
  }

  // Extract preferences (name they prefer to be called)
  if (content.includes('call me') || content.includes('prefer to be called')) {
    const nameMatch = content.match(/(?:call me|prefer to be called)\s+(\w+)/i);
    if (nameMatch) {
      await storeMemory(userId, {
        type: 'PREFERENCE',
        key: 'preferred_name',
        value: nameMatch[1],
        importance: 9,
      });
    }
  }
};

/**
 * Generate AI response using OpenAI
 */
export const generateSupernovaResponse = async (userId, conversationId, userMessage) => {
  try {
    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        accountType: true,
        quizResult: true,
      },
    });

    // Get memories and conversation history
    const [memories, history] = await Promise.all([
      getUserMemories(userId),
      getConversationHistory(conversationId),
    ]);

    // Build system prompt with user context
    const systemPrompt = getSupernovaSystemPrompt(user, memories, user.quizResult);

    // Build messages array for OpenAI
    const messages = [
      { role: 'system', content: systemPrompt },
      // Add conversation history (reversed to chronological order)
      ...history.reverse().map(msg => ({
        role: msg.role.toLowerCase(),
        content: msg.content,
      })),
      // Add new user message
      { role: 'user', content: userMessage },
    ];

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages,
      temperature: 0.8,
      max_tokens: 800,
      stream: false,
    });

    const assistantMessage = completion.choices[0].message.content;

    // Extract and store memories (background task)
    extractMemories(userId, userMessage, assistantMessage).catch(err => {
      console.error('Memory extraction error:', err);
    });

    return {
      message: assistantMessage,
      tokenCount: completion.usage.total_tokens,
      model: completion.model,
    };
  } catch (error) {
    console.error('SUPERNova AI error:', error);
    throw new Error('Failed to generate response');
  }
};

/**
 * Generate streaming AI response
 */
export const generateSupernovaResponseStream = async (userId, conversationId, userMessage) => {
  try {
    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        accountType: true,
        quizResult: true,
      },
    });

    // Get memories and conversation history
    const [memories, history] = await Promise.all([
      getUserMemories(userId),
      getConversationHistory(conversationId),
    ]);

    // Build system prompt with user context
    const systemPrompt = getSupernovaSystemPrompt(user, memories, user.quizResult);

    // Build messages array for OpenAI
    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.reverse().map(msg => ({
        role: msg.role.toLowerCase(),
        content: msg.content,
      })),
      { role: 'user', content: userMessage },
    ];

    // Call OpenAI with streaming
    const stream = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages,
      temperature: 0.8,
      max_tokens: 800,
      stream: true,
    });

    return stream;
  } catch (error) {
    console.error('SUPERNova streaming error:', error);
    throw new Error('Failed to generate streaming response');
  }
};

/**
 * Generate conversation title from first message
 */
export const generateConversationTitle = async (firstMessage) => {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'Generate a short 3-5 word title for this conversation. Just return the title, nothing else.',
        },
        { role: 'user', content: firstMessage },
      ],
      temperature: 0.7,
      max_tokens: 20,
    });

    return completion.choices[0].message.content.replace(/['"]/g, '');
  } catch (error) {
    return 'New Conversation';
  }
};

export default {
  generateSupernovaResponse,
  generateSupernovaResponseStream,
  generateConversationTitle,
  storeMemory,
};
