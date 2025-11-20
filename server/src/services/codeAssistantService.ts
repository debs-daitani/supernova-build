/**
 * Code Assistant Service
 *
 * Main orchestration service for Code Assistant feature
 */

import { PrismaClient } from '@prisma/client';
import { CodeAccessService } from './codeAccessService';
import { CodeGenerationService } from './codeGenerationService';
import { CodeDeploymentService } from './codeDeploymentService';
import { CodeTemplateService } from './codeTemplateService';

const prisma = new PrismaClient();

export class CodeAssistantService {
  /**
   * Start new code conversation
   */
  static async startConversation(userId: string, data?: {
    title?: string;
    targetPage?: string;
    projectType?: string;
  }) {
    // Check access
    const accessCheck = await CodeAccessService.checkAndUpdateAccess(userId);

    if (!accessCheck.isUnlocked) {
      throw new Error('Code Assistant is locked. Create a website to unlock!');
    }

    // Create conversation
    const conversation = await prisma.codeConversation.create({
      data: {
        userId,
        title: data?.title || 'New Code Project',
        status: 'active',
        targetPage: data?.targetPage,
        projectType: data?.projectType,
      },
    });

    // Update stats
    await CodeAccessService.updateUsageStats(userId, {
      conversationsCount: 1,
    });

    return conversation;
  }

  /**
   * Get user's conversations
   */
  static async getUserConversations(userId: string, filters?: {
    status?: string;
    search?: string;
  }) {
    const where: any = { userId };

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { projectType: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return await prisma.codeConversation.findMany({
      where,
      include: {
        _count: {
          select: {
            messages: true,
            generations: true,
          },
        },
      },
      orderBy: { lastMessageAt: 'desc' },
    });
  }

  /**
   * Get conversation details
   */
  static async getConversation(conversationId: string, userId: string) {
    const conversation = await prisma.codeConversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: {
          orderBy: { timestamp: 'asc' },
        },
        generations: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    if (conversation.userId !== userId) {
      throw new Error('Unauthorized');
    }

    return conversation;
  }

  /**
   * Send message and get AI response
   */
  static async sendMessage(
    conversationId: string,
    userId: string,
    message: string,
    context?: {
      targetPage?: string;
      brandKit?: any;
      existingCode?: string;
    }
  ) {
    // Get conversation
    const conversation = await prisma.codeConversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    if (conversation.userId !== userId) {
      throw new Error('Unauthorized');
    }

    // Save user message
    const userMessage = await prisma.codeMessage.create({
      data: {
        conversationId,
        role: 'user',
        content: message,
      },
    });

    // Generate AI response
    const generation = await CodeGenerationService.generateCode({
      userId,
      conversationId,
      userMessage: message,
      context,
    });

    // Format AI response message
    const aiResponse = this.formatAIResponse(generation);

    // Save AI message
    const aiMessage = await prisma.codeMessage.create({
      data: {
        conversationId,
        role: 'assistant',
        content: aiResponse,
        codeBlocks: [
          {
            language: generation.language,
            code: generation.code,
            fileName: generation.fileName,
          },
        ],
      },
    });

    // Update conversation
    await prisma.codeConversation.update({
      where: { id: conversationId },
      data: {
        totalMessages: { increment: 2 },
        lastMessageAt: new Date(),
      },
    });

    return {
      userMessage,
      aiMessage,
      generation,
    };
  }

  /**
   * Format AI response for display
   */
  private static formatAIResponse(generation: any): string {
    return `${generation.explanation}\n\n\`\`\`${generation.language.toLowerCase()}\n${generation.code}\n\`\`\`\n\n**Lines of Code:** ${generation.linesOfCode}\n**Complexity:** ${generation.complexity}\n${generation.fileName ? `**File Name:** ${generation.fileName}` : ''}`;
  }

  /**
   * Archive conversation
   */
  static async archiveConversation(conversationId: string, userId: string) {
    const conversation = await prisma.codeConversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    if (conversation.userId !== userId) {
      throw new Error('Unauthorized');
    }

    return await prisma.codeConversation.update({
      where: { id: conversationId },
      data: { status: 'archived' },
    });
  }

  /**
   * Delete conversation
   */
  static async deleteConversation(conversationId: string, userId: string) {
    const conversation = await prisma.codeConversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    if (conversation.userId !== userId) {
      throw new Error('Unauthorized');
    }

    return await prisma.codeConversation.delete({
      where: { id: conversationId },
    });
  }

  /**
   * Get user's dashboard data
   */
  static async getDashboard(userId: string) {
    // Check access
    const accessCheck = await CodeAccessService.checkAndUpdateAccess(userId);

    // Get usage stats
    const usageStats = await CodeAccessService.getUsageStats(userId);

    // Get recent conversations
    const recentConversations = await prisma.codeConversation.findMany({
      where: {
        userId,
        status: 'active',
      },
      orderBy: { lastMessageAt: 'desc' },
      take: 5,
      include: {
        _count: {
          select: {
            messages: true,
          },
        },
      },
    });

    // Get recent deployments
    const recentDeployments = await CodeDeploymentService.getUserDeployments(userId, {
      isActive: true,
    });

    // Get capabilities
    const capabilities = CodeAccessService.getAccessCapabilities(accessCheck.accessLevel);

    // Get featured templates
    const featuredTemplates = await CodeTemplateService.getFeaturedTemplates(userId);

    return {
      access: {
        level: accessCheck.accessLevel,
        isUnlocked: accessCheck.isUnlocked,
        capabilities,
        nextTier: accessCheck.requirementsForNextTier,
      },
      stats: {
        conversationsCount: usageStats.conversationsCount,
        deploymentsCount: usageStats.deploymentsCount,
        linesOfCodeGenerated: usageStats.linesOfCodeGenerated,
      },
      recentConversations,
      recentDeployments: recentDeployments.slice(0, 5),
      featuredTemplates: featuredTemplates.slice(0, 6),
    };
  }

  /**
   * Quick actions (simplified flows)
   */
  static async quickAction(userId: string, action: {
    type: 'calculator' | 'form' | 'timer' | 'animation' | 'integration';
    params: Record<string, any>;
  }) {
    // Start conversation
    const conversation = await this.startConversation(userId, {
      title: `${action.type.charAt(0).toUpperCase() + action.type.slice(1)} Project`,
      projectType: action.type,
    });

    // Generate prompt based on action type
    const prompt = this.generateQuickActionPrompt(action.type, action.params);

    // Send message and get code
    const result = await this.sendMessage(conversation.id, userId, prompt);

    return {
      conversation,
      ...result,
    };
  }

  /**
   * Generate prompt for quick actions
   */
  private static generateQuickActionPrompt(
    type: string,
    params: Record<string, any>
  ): string {
    const prompts: Record<string, (params: any) => string> = {
      calculator: (p) =>
        `Create a ${p.calculatorType || 'BMI'} calculator with ${p.units || 'both metric and imperial'} units.`,

      form: (p) =>
        `Create a ${p.formType || 'contact'} form with validation. Include fields: ${(p.fields || ['name', 'email', 'message']).join(', ')}.`,

      timer: (p) =>
        `Create a countdown timer to ${p.targetDate || 'a specified date'}. Display ${p.units || 'days, hours, minutes, seconds'}.`,

      animation: (p) =>
        `Create a ${p.animationType || 'fade-in'} animation for ${p.target || 'elements'}. ${p.trigger || 'Trigger on page load'}.`,

      integration: (p) =>
        `Create an integration with ${p.service || 'a third-party service'}. ${p.action || 'Handle API calls and responses'}.`,
    };

    const promptGenerator = prompts[type];
    if (!promptGenerator) {
      return `Create a ${type} component.`;
    }

    return promptGenerator(params);
  }

  /**
   * Export code (download, copy, etc.)
   */
  static async exportCode(generationId: string, userId: string, format: 'raw' | 'zip' | 'gist') {
    const generation = await prisma.codeGeneration.findUnique({
      where: { id: generationId },
      include: {
        conversation: true,
      },
    });

    if (!generation) {
      throw new Error('Code generation not found');
    }

    if (generation.conversation.userId !== userId) {
      throw new Error('Unauthorized');
    }

    // Different export formats
    switch (format) {
      case 'raw':
        return {
          code: generation.code,
          fileName: generation.fileName,
          language: generation.language,
        };

      case 'zip':
        // In production: Create ZIP file with code + README
        return {
          downloadUrl: `/api/code/export/zip/${generationId}`,
        };

      case 'gist':
        // In production: Create GitHub Gist
        return {
          gistUrl: `https://gist.github.com/placeholder/${generationId}`,
        };

      default:
        throw new Error('Invalid export format');
    }
  }

  /**
   * Regenerate code with modifications
   */
  static async regenerateCode(
    generationId: string,
    userId: string,
    modifications: string
  ) {
    const generation = await prisma.codeGeneration.findUnique({
      where: { id: generationId },
      include: {
        conversation: true,
      },
    });

    if (!generation) {
      throw new Error('Code generation not found');
    }

    if (generation.conversation.userId !== userId) {
      throw new Error('Unauthorized');
    }

    // Send modification request
    const prompt = `Please modify the previous code with these changes: ${modifications}`;

    return await this.sendMessage(generation.conversationId, userId, prompt, {
      existingCode: generation.code,
    });
  }

  /**
   * Get code analytics
   */
  static async getCodeAnalytics(generationId: string, userId: string) {
    const generation = await prisma.codeGeneration.findUnique({
      where: { id: generationId },
      include: {
        conversation: true,
        deployments: true,
      },
    });

    if (!generation) {
      throw new Error('Code generation not found');
    }

    if (generation.conversation.userId !== userId) {
      throw new Error('Unauthorized');
    }

    return {
      linesOfCode: generation.linesOfCode,
      complexity: generation.complexity,
      language: generation.language,
      deployments: generation.deployments.length,
      activeDeployments: generation.deployments.filter((d) => d.isActive).length,
      createdAt: generation.createdAt,
    };
  }
}
