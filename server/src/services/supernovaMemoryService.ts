/**
 * SUPERNova Memory Service
 *
 * Manages user memories with natural, context-aware retrieval
 */

import { PrismaClient, MemoryType } from '@prisma/client';

const prisma = new PrismaClient();

interface MemoryInput {
  userId: string;
  category: string;
  key: string;
  value: string;
  content: string;
  importance?: 'low' | 'medium' | 'high' | 'critical';
  memoryType?: MemoryType;
  sourceConversationId?: string;
  context?: any;
}

export class SupernovaMemoryService {
  /**
   * Store a new memory
   */
  static async storeMemory(input: MemoryInput) {
    const importanceScore = this.getImportanceScore(input.importance || 'medium');

    return await prisma.userMemory.create({
      data: {
        userId: input.userId,
        memoryType: input.memoryType || 'FACT',
        content: input.content,
        category: input.category,
        key: input.key,
        value: input.value,
        context: input.context || {},
        importanceScore: importanceScore,
        sourceConversationId: input.sourceConversationId,
        useCount: 0,
      },
    });
  }

  /**
   * Get relevant memories for conversation context
   */
  static async getRelevantMemories(userId: string, conversationContext?: string) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get high-importance and recently used memories
    return await prisma.userMemory.findMany({
      where: {
        userId,
        OR: [
          { importanceScore: { gte: 0.7 } }, // High or critical importance
          { lastUsed: { gte: thirtyDaysAgo } }, // Used in last 30 days
        ],
      },
      orderBy: [
        { importanceScore: 'desc' },
        { lastUsed: 'desc' },
        { useCount: 'desc' },
      ],
      take: 20, // Limit to most relevant
    });
  }

  /**
   * Get memory by key
   */
  static async getMemoryByKey(userId: string, key: string) {
    const memory = await prisma.userMemory.findFirst({
      where: {
        userId,
        key,
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Update usage tracking
    if (memory) {
      await this.recordMemoryUse(memory.id);
    }

    return memory;
  }

  /**
   * Get memories by category
   */
  static async getMemoriesByCategory(userId: string, category: string) {
    return await prisma.userMemory.findMany({
      where: {
        userId,
        category,
      },
      orderBy: [
        { importanceScore: 'desc' },
        { updatedAt: 'desc' },
      ],
    });
  }

  /**
   * Update existing memory
   */
  static async updateMemory(
    memoryId: string,
    updates: {
      value?: string;
      content?: string;
      importance?: 'low' | 'medium' | 'high' | 'critical';
      context?: any;
    }
  ) {
    const data: any = { ...updates };

    if (updates.importance) {
      data.importanceScore = this.getImportanceScore(updates.importance);
      delete data.importance;
    }

    return await prisma.userMemory.update({
      where: { id: memoryId },
      data,
    });
  }

  /**
   * Upsert memory (update if exists, create if not)
   */
  static async upsertMemory(input: MemoryInput) {
    const existing = await this.getMemoryByKey(input.userId, input.key);

    if (existing) {
      return await this.updateMemory(existing.id, {
        value: input.value,
        content: input.content,
        importance: input.importance,
        context: input.context,
      });
    }

    return await this.storeMemory(input);
  }

  /**
   * Record memory usage
   */
  static async recordMemoryUse(memoryId: string) {
    await prisma.userMemory.update({
      where: { id: memoryId },
      data: {
        lastUsed: new Date(),
        useCount: { increment: 1 },
      },
    });
  }

  /**
   * Search memories
   */
  static async searchMemories(userId: string, query: string) {
    return await prisma.userMemory.findMany({
      where: {
        userId,
        OR: [
          { content: { contains: query, mode: 'insensitive' } },
          { value: { contains: query, mode: 'insensitive' } },
          { key: { contains: query, mode: 'insensitive' } },
        ],
      },
      orderBy: [
        { importanceScore: 'desc' },
        { useCount: 'desc' },
      ],
      take: 10,
    });
  }

  /**
   * Delete memory
   */
  static async deleteMemory(memoryId: string) {
    return await prisma.userMemory.delete({
      where: { id: memoryId },
    });
  }

  /**
   * Get all memories for user
   */
  static async getUserMemories(userId: string, filters?: {
    category?: string;
    memoryType?: MemoryType;
    minImportance?: number;
  }) {
    const where: any = { userId };

    if (filters?.category) {
      where.category = filters.category;
    }

    if (filters?.memoryType) {
      where.memoryType = filters.memoryType;
    }

    if (filters?.minImportance !== undefined) {
      where.importanceScore = { gte: filters.minImportance };
    }

    return await prisma.userMemory.findMany({
      where,
      orderBy: [
        { importanceScore: 'desc' },
        { updatedAt: 'desc' },
      ],
    });
  }

  /**
   * Format memories for AI context (natural language)
   */
  static formatMemoriesForAI(memories: any[]): string {
    if (memories.length === 0) return '';

    const sections: Record<string, string[]> = {
      personal: [],
      business: [],
      preferences: [],
      goals: [],
      challenges: [],
      wins: [],
    };

    memories.forEach((memory) => {
      const category = memory.category || 'personal';
      if (sections[category]) {
        // Format as natural language, not structured data
        if (memory.key && memory.value) {
          sections[category].push(`${memory.key}: ${memory.value}`);
        } else {
          sections[category].push(memory.content);
        }
      }
    });

    let contextText = '';

    if (sections.business.length > 0) {
      contextText += `BUSINESS:\n${sections.business.join('\n')}\n\n`;
    }

    if (sections.personal.length > 0) {
      contextText += `PERSONAL:\n${sections.personal.join('\n')}\n\n`;
    }

    if (sections.goals.length > 0) {
      contextText += `GOALS:\n${sections.goals.join('\n')}\n\n`;
    }

    if (sections.challenges.length > 0) {
      contextText += `CHALLENGES:\n${sections.challenges.join('\n')}\n\n`;
    }

    if (sections.preferences.length > 0) {
      contextText += `PREFERENCES:\n${sections.preferences.join('\n')}\n\n`;
    }

    return contextText.trim();
  }

  /**
   * Convert importance level to score
   */
  private static getImportanceScore(importance: string): number {
    const scores: Record<string, number> = {
      low: 0.25,
      medium: 0.5,
      high: 0.75,
      critical: 1.0,
    };

    return scores[importance] || 0.5;
  }

  /**
   * Extract memories from conversation
   * (This would use AI to identify important facts to remember)
   */
  static async extractMemoriesFromConversation(
    userId: string,
    conversationId: string,
    messages: any[]
  ): Promise<any[]> {
    // In production, this would use AI to analyze messages
    // and extract important facts to remember
    // For now, we'll return a placeholder

    const extractedMemories: any[] = [];

    // Example: Look for patterns like "My business is..." or "I want to..."
    // This would be done by AI in production

    return extractedMemories;
  }
}
