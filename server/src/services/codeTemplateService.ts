/**
 * Code Template Service
 *
 * Manages pre-built code templates and snippets
 */

import { PrismaClient, CodeSnippetCategory, CodeTemplateDifficulty, CodeAssistantLevel, CodeLanguage } from '@prisma/client';
import { CodeAccessService } from './codeAccessService';

const prisma = new PrismaClient();

export class CodeTemplateService {
  /**
   * Get available templates for user
   */
  static async getTemplatesForUser(userId: string, filters?: {
    category?: CodeSnippetCategory;
    difficulty?: CodeTemplateDifficulty;
    search?: string;
  }) {
    // Check user's access level
    const accessCheck = await CodeAccessService.checkAndUpdateAccess(userId);

    // Build where clause
    const where: any = {
      isActive: true,
      accessLevel: {
        in: this.getAllowedTiers(accessCheck.accessLevel),
      },
    };

    if (filters?.category) {
      where.category = filters.category;
    }

    if (filters?.difficulty) {
      where.difficulty = filters.difficulty;
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const templates = await prisma.codeTemplate.findMany({
      where,
      orderBy: [
        { isFeatured: 'desc' },
        { usageCount: 'desc' },
        { name: 'asc' },
      ],
    });

    return templates;
  }

  /**
   * Get tiers that user has access to
   */
  private static getAllowedTiers(userLevel: CodeAssistantLevel): CodeAssistantLevel[] {
    const tierHierarchy: CodeAssistantLevel[] = [
      'LANDING_PAGE',
      'MULTI_PAGE',
      'FULL_BUSINESS',
      'ALL_IN_ROCKSTAR',
    ];

    const userIndex = tierHierarchy.indexOf(userLevel);
    if (userIndex === -1) return [];

    return tierHierarchy.slice(0, userIndex + 1);
  }

  /**
   * Get template by ID
   */
  static async getTemplate(templateId: string, userId: string) {
    const template = await prisma.codeTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      throw new Error('Template not found');
    }

    // Check if user has access
    const accessCheck = await CodeAccessService.checkAndUpdateAccess(userId);
    const allowedTiers = this.getAllowedTiers(accessCheck.accessLevel);

    if (!allowedTiers.includes(template.accessLevel)) {
      throw new Error('This template requires a higher access tier');
    }

    return template;
  }

  /**
   * Use template (customize and generate)
   */
  static async useTemplate(
    templateId: string,
    userId: string,
    variables?: Record<string, any>
  ): Promise<{
    code: string;
    language: CodeLanguage;
    fileName: string;
  }> {
    const template = await this.getTemplate(templateId, userId);

    // Apply variable substitutions
    let code = template.code;
    const templateVars = template.variables as Record<string, any> || {};

    if (variables) {
      Object.entries(variables).forEach(([key, value]) => {
        // Replace {{variable}} placeholders
        const placeholder = `{{${key}}}`;
        code = code.replace(new RegExp(placeholder, 'g'), String(value));
      });
    }

    // Increment usage count
    await prisma.codeTemplate.update({
      where: { id: templateId },
      data: {
        usageCount: { increment: 1 },
      },
    });

    return {
      code,
      language: template.language,
      fileName: `${template.name.toLowerCase().replace(/\s+/g, '-')}.${this.getFileExtension(template.language)}`,
    };
  }

  /**
   * Get file extension for language
   */
  private static getFileExtension(language: CodeLanguage): string {
    const extensions: Record<CodeLanguage, string> = {
      JAVASCRIPT: 'js',
      TYPESCRIPT: 'ts',
      HTML: 'html',
      CSS: 'css',
      PYTHON: 'py',
      SQL: 'sql',
      JSON: 'json',
    };

    return extensions[language];
  }

  /**
   * Create template (admin only)
   */
  static async createTemplate(data: {
    name: string;
    description?: string;
    category: CodeSnippetCategory;
    code: string;
    language: CodeLanguage;
    variables?: Record<string, any>;
    difficulty: CodeTemplateDifficulty;
    accessLevel: CodeAssistantLevel;
    exampleUrl?: string;
    previewImage?: string;
  }) {
    return await prisma.codeTemplate.create({
      data: {
        name: data.name,
        description: data.description,
        category: data.category,
        code: data.code,
        language: data.language,
        variables: data.variables || {},
        difficulty: data.difficulty,
        accessLevel: data.accessLevel,
        exampleUrl: data.exampleUrl,
        previewImage: data.previewImage,
        isActive: true,
        isFeatured: false,
        usageCount: 0,
      },
    });
  }

  /**
   * Get featured templates
   */
  static async getFeaturedTemplates(userId: string) {
    const accessCheck = await CodeAccessService.checkAndUpdateAccess(userId);
    const allowedTiers = this.getAllowedTiers(accessCheck.accessLevel);

    return await prisma.codeTemplate.findMany({
      where: {
        isFeatured: true,
        isActive: true,
        accessLevel: {
          in: allowedTiers,
        },
      },
      orderBy: { usageCount: 'desc' },
      take: 10,
    });
  }

  /**
   * Get templates by category
   */
  static async getTemplatesByCategory(userId: string, category: CodeSnippetCategory) {
    const accessCheck = await CodeAccessService.checkAndUpdateAccess(userId);
    const allowedTiers = this.getAllowedTiers(accessCheck.accessLevel);

    return await prisma.codeTemplate.findMany({
      where: {
        category,
        isActive: true,
        accessLevel: {
          in: allowedTiers,
        },
      },
      orderBy: { usageCount: 'desc' },
    });
  }

  /**
   * Search templates
   */
  static async searchTemplates(userId: string, query: string) {
    const accessCheck = await CodeAccessService.checkAndUpdateAccess(userId);
    const allowedTiers = this.getAllowedTiers(accessCheck.accessLevel);

    return await prisma.codeTemplate.findMany({
      where: {
        isActive: true,
        accessLevel: {
          in: allowedTiers,
        },
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      },
      orderBy: { usageCount: 'desc' },
    });
  }

  /**
   * Save user's code as snippet
   */
  static async saveSnippet(userId: string, data: {
    generationId?: string;
    title: string;
    description?: string;
    code: string;
    language: CodeLanguage;
    category: CodeSnippetCategory;
    tags?: string[];
    isPublic?: boolean;
  }) {
    const snippet = await prisma.codeSnippet.create({
      data: {
        userId,
        generationId: data.generationId,
        title: data.title,
        description: data.description,
        code: data.code,
        language: data.language,
        category: data.category,
        tags: data.tags || [],
        isPublic: data.isPublic || false,
        isFavorite: false,
        uses: 0,
      },
    });

    return snippet;
  }

  /**
   * Get user's snippets
   */
  static async getUserSnippets(userId: string, filters?: {
    category?: CodeSnippetCategory;
    isFavorite?: boolean;
    search?: string;
  }) {
    const where: any = { userId };

    if (filters?.category) {
      where.category = filters.category;
    }

    if (filters?.isFavorite !== undefined) {
      where.isFavorite = filters.isFavorite;
    }

    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { tags: { has: filters.search } },
      ];
    }

    return await prisma.codeSnippet.findMany({
      where,
      orderBy: [
        { isFavorite: 'desc' },
        { lastUsedAt: 'desc' },
        { createdAt: 'desc' },
      ],
    });
  }

  /**
   * Get snippet by ID
   */
  static async getSnippet(snippetId: string, userId: string) {
    const snippet = await prisma.codeSnippet.findUnique({
      where: { id: snippetId },
    });

    if (!snippet) {
      throw new Error('Snippet not found');
    }

    // Check access (must be owner or public)
    if (snippet.userId !== userId && !snippet.isPublic) {
      throw new Error('Unauthorized');
    }

    return snippet;
  }

  /**
   * Update snippet
   */
  static async updateSnippet(
    snippetId: string,
    userId: string,
    updates: {
      title?: string;
      description?: string;
      code?: string;
      tags?: string[];
      isFavorite?: boolean;
      isPublic?: boolean;
    }
  ) {
    const snippet = await prisma.codeSnippet.findUnique({
      where: { id: snippetId },
    });

    if (!snippet) {
      throw new Error('Snippet not found');
    }

    if (snippet.userId !== userId) {
      throw new Error('Unauthorized');
    }

    return await prisma.codeSnippet.update({
      where: { id: snippetId },
      data: updates,
    });
  }

  /**
   * Delete snippet
   */
  static async deleteSnippet(snippetId: string, userId: string) {
    const snippet = await prisma.codeSnippet.findUnique({
      where: { id: snippetId },
    });

    if (!snippet) {
      throw new Error('Snippet not found');
    }

    if (snippet.userId !== userId) {
      throw new Error('Unauthorized');
    }

    return await prisma.codeSnippet.delete({
      where: { id: snippetId },
    });
  }

  /**
   * Use snippet (track usage)
   */
  static async useSnippet(snippetId: string, userId: string) {
    const snippet = await this.getSnippet(snippetId, userId);

    // Increment usage count
    await prisma.codeSnippet.update({
      where: { id: snippetId },
      data: {
        uses: { increment: 1 },
        lastUsedAt: new Date(),
      },
    });

    return snippet;
  }

  /**
   * Get public snippets (community sharing)
   */
  static async getPublicSnippets(filters?: {
    category?: CodeSnippetCategory;
    search?: string;
    language?: CodeLanguage;
  }) {
    const where: any = {
      isPublic: true,
    };

    if (filters?.category) {
      where.category = filters.category;
    }

    if (filters?.language) {
      where.language = filters.language;
    }

    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { tags: { has: filters.search } },
      ];
    }

    return await prisma.codeSnippet.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: { uses: 'desc' },
      take: 50,
    });
  }

  /**
   * Initialize default templates (run on first setup)
   */
  static async initializeDefaultTemplates() {
    const defaultTemplates = [
      {
        name: 'Countdown Timer',
        description: 'Customizable countdown timer with days, hours, minutes, and seconds',
        category: 'TIMER' as CodeSnippetCategory,
        language: 'JAVASCRIPT' as CodeLanguage,
        code: `// Countdown Timer
function initCountdown(targetDate) {
  function updateCountdown() {
    const now = new Date();
    const diff = new Date(targetDate) - now;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    document.getElementById('countdown').innerHTML = \`
      <div class="countdown-timer">
        <div class="time-unit"><span class="number">\${days}</span><span class="label">Days</span></div>
        <div class="time-unit"><span class="number">\${hours}</span><span class="label">Hours</span></div>
        <div class="time-unit"><span class="number">\${minutes}</span><span class="label">Minutes</span></div>
        <div class="time-unit"><span class="number">\${seconds}</span><span class="label">Seconds</span></div>
      </div>
    \`;
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);
}

// Usage: initCountdown('2026-01-26T00:00:00');`,
        variables: {
          targetDate: '2026-01-26T00:00:00',
        },
        difficulty: 'BASIC' as CodeTemplateDifficulty,
        accessLevel: 'LANDING_PAGE' as CodeAssistantLevel,
      },
      {
        name: 'Contact Form with Validation',
        description: 'Contact form with client-side validation and email submission',
        category: 'FORM' as CodeSnippetCategory,
        language: 'JAVASCRIPT' as CodeLanguage,
        code: `// Contact Form Validation
function setupContactForm() {
  const form = document.getElementById('contact-form');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();

    // Validation
    const errors = [];
    if (!name) errors.push('Name is required');
    if (!email || !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)) errors.push('Valid email is required');
    if (!message) errors.push('Message is required');

    if (errors.length > 0) {
      alert(errors.join('\\n'));
      return;
    }

    // Submit form (replace with your API endpoint)
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      });

      if (response.ok) {
        alert('Message sent successfully!');
        form.reset();
      } else {
        alert('Failed to send message. Please try again.');
      }
    } catch (error) {
      alert('An error occurred. Please try again.');
    }
  });
}

document.addEventListener('DOMContentLoaded', setupContactForm);`,
        difficulty: 'BASIC' as CodeTemplateDifficulty,
        accessLevel: 'LANDING_PAGE' as CodeAssistantLevel,
      },
      {
        name: 'BMI Calculator',
        description: 'Body Mass Index calculator with imperial and metric units',
        category: 'CALCULATOR' as CodeSnippetCategory,
        language: 'JAVASCRIPT' as CodeLanguage,
        code: `// BMI Calculator
function calculateBMI() {
  const weight = parseFloat(document.getElementById('weight').value);
  const height = parseFloat(document.getElementById('height').value);
  const unit = document.getElementById('unit').value;

  let bmi;
  if (unit === 'metric') {
    bmi = weight / ((height / 100) ** 2);
  } else {
    bmi = (weight / (height ** 2)) * 703;
  }

  let category = '';
  if (bmi < 18.5) category = 'Underweight';
  else if (bmi < 25) category = 'Normal weight';
  else if (bmi < 30) category = 'Overweight';
  else category = 'Obese';

  document.getElementById('result').innerHTML = \`
    <p>Your BMI: <strong>\${bmi.toFixed(1)}</strong></p>
    <p>Category: <strong>\${category}</strong></p>
  \`;
}`,
        difficulty: 'BASIC' as CodeTemplateDifficulty,
        accessLevel: 'LANDING_PAGE' as CodeAssistantLevel,
      },
    ];

    // Create templates if they don't exist
    for (const template of defaultTemplates) {
      const existing = await prisma.codeTemplate.findFirst({
        where: { name: template.name },
      });

      if (!existing) {
        await this.createTemplate(template);
      }
    }
  }
}
