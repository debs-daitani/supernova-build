/**
 * SUPERNova Conversation Service
 *
 * Manages conversations and messages for SUPERNova AI
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class SupernovaConversationService {
  /**
   * Create new conversation
   */
  static async createConversation(userId: string, mode: string = 'general') {
    return await prisma.conversation.create({
      data: {
        userId,
        mode,
        status: 'active',
        messageCount: 0,
        title: 'New Conversation',
      },
    });
  }

  /**
   * Get conversation by ID
   */
  static async getConversation(conversationId: string) {
    return await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  /**
   * List user's conversations
   */
  static async listConversations(userId: string, filters?: {
    mode?: string;
    status?: string;
    archived?: boolean;
  }) {
    const where: any = { userId };

    if (filters?.mode) {
      where.mode = filters.mode;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.archived !== undefined) {
      where.archived = filters.archived;
    }

    return await prisma.conversation.findMany({
      where,
      orderBy: { lastMessageAt: 'desc' },
      include: {
        _count: {
          select: { messages: true },
        },
      },
    });
  }

  /**
   * Add message to conversation
   */
  static async addMessage(
    conversationId: string,
    userId: string,
    role: string,
    content: string,
    metadata?: any
  ) {
    const message = await prisma.message.create({
      data: {
        conversationId,
        userId,
        role,
        content,
        metadata,
      },
    });

    // Update conversation
    await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        messageCount: { increment: 1 },
        lastMessageAt: new Date(),
      },
    });

    // Auto-generate title if this is the second message (first user message)
    const conversation = await this.getConversation(conversationId);
    if (conversation && conversation.messageCount === 2 && conversation.title === 'New Conversation') {
      await this.generateTitle(conversationId);
    }

    return message;
  }

  /**
   * Get conversation messages
   */
  static async getMessages(conversationId: string, limit?: number, offset?: number) {
    return await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      take: limit,
      skip: offset,
    });
  }

  /**
   * Auto-generate conversation title from first messages
   */
  static async generateTitle(conversationId: string) {
    const messages = await this.getMessages(conversationId, 3);

    if (messages.length === 0) return;

    // Simple title generation from first user message
    const firstUserMessage = messages.find(m => m.role === 'user');
    if (firstUserMessage) {
      const title = firstUserMessage.content
        .substring(0, 50)
        .trim()
        .replace(/\n/g, ' ') + (firstUserMessage.content.length > 50 ? '...' : '');

      await prisma.conversation.update({
        where: { id: conversationId },
        data: { title },
      });
    }
  }

  /**
   * Update conversation
   */
  static async updateConversation(conversationId: string, updates: {
    title?: string;
    mode?: string;
    status?: string;
    archived?: boolean;
  }) {
    return await prisma.conversation.update({
      where: { id: conversationId },
      data: updates,
    });
  }

  /**
   * Archive conversation
   */
  static async archiveConversation(conversationId: string) {
    return await this.updateConversation(conversationId, {
      archived: true,
      status: 'archived',
    });
  }

  /**
   * Delete conversation
   */
  static async deleteConversation(conversationId: string) {
    return await prisma.conversation.delete({
      where: { id: conversationId },
    });
  }

  /**
   * Switch conversation mode
   */
  static async switchMode(conversationId: string, newMode: string) {
    return await this.updateConversation(conversationId, { mode: newMode });
  }

  /**
   * Get conversation history formatted for AI
   */
  static formatConversationForAI(messages: any[]): any[] {
    return messages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content,
    }));
  }
}
