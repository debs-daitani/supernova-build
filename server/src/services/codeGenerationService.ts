/**
 * Code Generation Service
 *
 * AI-powered code generation using Claude API
 */

import Anthropic from '@anthropic-ai/sdk';
import { PrismaClient, CodeLanguage, CodeAssistantLevel } from '@prisma/client';
import { CodeAccessService } from './codeAccessService';

const prisma = new PrismaClient();
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface GenerationRequest {
  userId: string;
  conversationId: string;
  userMessage: string;
  context?: {
    targetPage?: string;
    brandKit?: {
      colors?: string[];
      fonts?: string[];
      logo?: string;
    };
    existingCode?: string;
  };
}

interface GenerationResult {
  code: string;
  language: CodeLanguage;
  explanation: string;
  fileName?: string;
  linesOfCode: number;
  complexity: 'basic' | 'intermediate' | 'advanced';
  dependencies?: string[];
  securityNotes?: string[];
}

export class CodeGenerationService {
  /**
   * Generate code from user prompt
   */
  static async generateCode(request: GenerationRequest): Promise<GenerationResult> {
    // Check user's access level
    const accessCheck = await CodeAccessService.checkAndUpdateAccess(request.userId);

    if (!accessCheck.isUnlocked) {
      throw new Error('Code Assistant is locked. Please create a website to unlock!');
    }

    // Get conversation context
    const conversation = await prisma.codeConversation.findUnique({
      where: { id: request.conversationId },
      include: {
        messages: {
          orderBy: { timestamp: 'desc' },
          take: 10, // Last 10 messages for context
        },
      },
    });

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    // Build system prompt
    const systemPrompt = this.buildSystemPrompt(accessCheck.accessLevel, request.context);

    // Build conversation history
    const messages = this.buildConversationHistory(conversation.messages, request.userMessage);

    // Call Claude API
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      system: systemPrompt,
      messages: messages,
    });

    // Parse response
    const result = this.parseCodeResponse(response);

    // Validate against user's tier limits
    const capabilities = CodeAccessService.getAccessCapabilities(accessCheck.accessLevel);
    if (
      capabilities.maxLinesOfCode !== null &&
      result.linesOfCode > capabilities.maxLinesOfCode
    ) {
      throw new Error(
        `Generated code exceeds your tier limit (${result.linesOfCode} > ${capabilities.maxLinesOfCode} lines). Please upgrade to continue.`
      );
    }

    // Save the generation
    const generation = await prisma.codeGeneration.create({
      data: {
        conversationId: request.conversationId,
        language: result.language,
        code: result.code,
        explanation: result.explanation,
        fileName: result.fileName,
        linesOfCode: result.linesOfCode,
        complexity: result.complexity,
        status: 'DRAFT',
      },
    });

    // Update user stats
    await CodeAccessService.updateUsageStats(request.userId, {
      linesOfCodeGenerated: result.linesOfCode,
    });

    return result;
  }

  /**
   * Build system prompt based on access level and context
   */
  private static buildSystemPrompt(
    accessLevel: CodeAssistantLevel,
    context?: GenerationRequest['context']
  ): string {
    const capabilities = CodeAccessService.getAccessCapabilities(accessLevel);

    let prompt = `You are an expert full-stack developer and code assistant integrated into the dAItaniverse platform.

Your role is to:
- Write clean, production-ready code
- Explain your code clearly and educationally
- Follow security best practices
- Ensure accessibility (ARIA, keyboard navigation)
- Optimize for performance
- Write responsive, mobile-friendly code
- Be patient and helpful

USER'S ACCESS TIER: ${capabilities.name}

CAPABILITIES:
${capabilities.features.map(f => `- ${f}`).join('\n')}

CODE LIMITS:
- Maximum lines of code: ${capabilities.maxLinesOfCode || 'Unlimited'}
- API access: ${capabilities.canUseAPIs ? 'Yes' : 'No'}
- Database access: ${capabilities.canUseDatabase ? 'Yes' : 'No'}

IMPORTANT RULES:
1. ALWAYS include security measures (input validation, XSS prevention, CSRF protection)
2. ALWAYS write accessible code (ARIA labels, keyboard navigation)
3. ALWAYS optimize for performance (minimal file size, efficient algorithms)
4. NEVER include secrets or API keys directly in code (use environment variables)
5. NEVER generate malicious or harmful code
6. Stay within the user's tier limits
7. If user requests something beyond their tier, politely suggest upgrading

CODE FORMATTING:
- Use clear, descriptive variable names
- Add comments for complex logic
- Follow consistent code style
- Include error handling

RESPONSE FORMAT:
Provide your response in this structure:
1. Brief explanation of what you're building
2. The code (properly formatted with syntax highlighting)
3. Detailed explanation of how it works
4. Any dependencies needed
5. Security considerations
6. How to use/deploy it

If the user asks about something beyond their tier, explain what tier is needed and why.
`;

    // Add brand kit context if provided
    if (context?.brandKit) {
      prompt += `\n\nBRAND KIT:
Colors: ${context.brandKit.colors?.join(', ') || 'Not specified'}
Fonts: ${context.brandKit.fonts?.join(', ') || 'Not specified'}
Logo: ${context.brandKit.logo || 'Not specified'}

Use these brand colors and fonts in your generated code when styling.
`;
    }

    // Add target page context
    if (context?.targetPage) {
      prompt += `\n\nTARGET PAGE: ${context.targetPage}
This code will be deployed to this page.
`;
    }

    // Add existing code context
    if (context?.existingCode) {
      prompt += `\n\nEXISTING CODE ON PAGE:
\`\`\`
${context.existingCode.substring(0, 1000)}
\`\`\`

Make sure your code integrates well with existing code.
`;
    }

    return prompt;
  }

  /**
   * Build conversation history for Claude API
   */
  private static buildConversationHistory(
    pastMessages: any[],
    currentMessage: string
  ): Anthropic.MessageParam[] {
    const messages: Anthropic.MessageParam[] = [];

    // Add past messages (reversed to get chronological order)
    pastMessages
      .reverse()
      .forEach((msg) => {
        messages.push({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content,
        });
      });

    // Add current message
    messages.push({
      role: 'user',
      content: currentMessage,
    });

    return messages;
  }

  /**
   * Parse Claude's response to extract code and metadata
   */
  private static parseCodeResponse(response: Anthropic.Message): GenerationResult {
    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    const text = content.text;

    // Extract code blocks using regex
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const matches = [...text.matchAll(codeBlockRegex)];

    if (matches.length === 0) {
      throw new Error('No code block found in response');
    }

    // Get the main code block (usually the first one)
    const mainCodeBlock = matches[0];
    const language = this.detectLanguage(mainCodeBlock[1] || 'javascript');
    const code = mainCodeBlock[2].trim();

    // Count lines of code
    const linesOfCode = code.split('\n').length;

    // Determine complexity
    const complexity = this.determineComplexity(code, linesOfCode);

    // Extract explanation (text before or after code blocks)
    const explanation = text.replace(codeBlockRegex, '').trim();

    // Extract dependencies
    const dependencies = this.extractDependencies(code, language);

    // Extract security notes
    const securityNotes = this.extractSecurityNotes(explanation);

    // Try to determine file name
    const fileName = this.suggestFileName(code, language);

    return {
      code,
      language,
      explanation,
      fileName,
      linesOfCode,
      complexity,
      dependencies,
      securityNotes,
    };
  }

  /**
   * Detect code language
   */
  private static detectLanguage(languageHint: string): CodeLanguage {
    const normalized = languageHint.toLowerCase();

    const languageMap: Record<string, CodeLanguage> = {
      javascript: 'JAVASCRIPT',
      js: 'JAVASCRIPT',
      typescript: 'TYPESCRIPT',
      ts: 'TYPESCRIPT',
      html: 'HTML',
      css: 'CSS',
      python: 'PYTHON',
      py: 'PYTHON',
      sql: 'SQL',
      json: 'JSON',
    };

    return languageMap[normalized] || 'JAVASCRIPT';
  }

  /**
   * Determine code complexity
   */
  private static determineComplexity(
    code: string,
    linesOfCode: number
  ): 'basic' | 'intermediate' | 'advanced' {
    // Basic heuristics
    if (linesOfCode < 50) return 'basic';
    if (linesOfCode < 200) return 'intermediate';

    // Check for advanced patterns
    const hasAsyncAwait = /async|await/.test(code);
    const hasPromises = /Promise|\.then|\.catch/.test(code);
    const hasClasses = /class\s+\w+/.test(code);
    const hasComplexLogic = /switch|while|for.*for/.test(code);

    if (hasAsyncAwait || hasPromises || hasClasses || hasComplexLogic) {
      return 'advanced';
    }

    return 'intermediate';
  }

  /**
   * Extract dependencies from code
   */
  private static extractDependencies(code: string, language: CodeLanguage): string[] {
    const dependencies: string[] = [];

    if (language === 'JAVASCRIPT' || language === 'TYPESCRIPT') {
      // Look for imports
      const importRegex = /import\s+.*\s+from\s+['"]([^'"]+)['"]/g;
      const requireRegex = /require\(['"]([^'"]+)['"]\)/g;

      let match;
      while ((match = importRegex.exec(code)) !== null) {
        dependencies.push(match[1]);
      }
      while ((match = requireRegex.exec(code)) !== null) {
        dependencies.push(match[1]);
      }
    }

    if (language === 'PYTHON') {
      // Look for imports
      const importRegex = /import\s+(\w+)|from\s+(\w+)\s+import/g;
      let match;
      while ((match = importRegex.exec(code)) !== null) {
        dependencies.push(match[1] || match[2]);
      }
    }

    return [...new Set(dependencies)]; // Remove duplicates
  }

  /**
   * Extract security notes from explanation
   */
  private static extractSecurityNotes(explanation: string): string[] {
    const notes: string[] = [];

    const securityKeywords = [
      'security',
      'validation',
      'sanitize',
      'XSS',
      'CSRF',
      'SQL injection',
      'authentication',
      'authorization',
      'encryption',
    ];

    securityKeywords.forEach((keyword) => {
      if (explanation.toLowerCase().includes(keyword.toLowerCase())) {
        // Extract sentence containing the keyword
        const sentences = explanation.split(/[.!?]+/);
        sentences.forEach((sentence) => {
          if (sentence.toLowerCase().includes(keyword.toLowerCase())) {
            notes.push(sentence.trim());
          }
        });
      }
    });

    return [...new Set(notes)]; // Remove duplicates
  }

  /**
   * Suggest file name based on code content
   */
  private static suggestFileName(code: string, language: CodeLanguage): string {
    // Look for function names, class names, etc.
    const functionMatch = code.match(/function\s+(\w+)/);
    const classMatch = code.match(/class\s+(\w+)/);
    const componentMatch = code.match(/const\s+(\w+)\s*=/);

    let baseName = 'code';

    if (classMatch) {
      baseName = classMatch[1];
    } else if (functionMatch) {
      baseName = functionMatch[1];
    } else if (componentMatch) {
      baseName = componentMatch[1];
    }

    const extensions: Record<CodeLanguage, string> = {
      JAVASCRIPT: 'js',
      TYPESCRIPT: 'ts',
      HTML: 'html',
      CSS: 'css',
      PYTHON: 'py',
      SQL: 'sql',
      JSON: 'json',
    };

    return `${baseName}.${extensions[language]}`;
  }

  /**
   * Explain existing code
   */
  static async explainCode(code: string): Promise<string> {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: `Please explain this code in detail. Be clear and educational.\n\n\`\`\`\n${code}\n\`\`\``,
        },
      ],
    });

    const content = response.content[0];
    if (content.type === 'text') {
      return content.text;
    }

    return 'Unable to generate explanation';
  }

  /**
   * Debug code issue
   */
  static async debugCode(code: string, errorDescription: string): Promise<{
    diagnosis: string;
    fix: string;
    explanation: string;
  }> {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 3072,
      messages: [
        {
          role: 'user',
          content: `I'm having an issue with this code. The error is: "${errorDescription}"

\`\`\`
${code}
\`\`\`

Please:
1. Diagnose the problem
2. Provide the fixed code
3. Explain what was wrong and how you fixed it`,
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type');
    }

    const text = content.text;

    // Extract fixed code
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/;
    const match = text.match(codeBlockRegex);
    const fixedCode = match ? match[2].trim() : code;

    return {
      diagnosis: text.split('```')[0].trim(),
      fix: fixedCode,
      explanation: text,
    };
  }

  /**
   * Optimize code for performance
   */
  static async optimizeCode(code: string, language: CodeLanguage): Promise<{
    optimizedCode: string;
    improvements: string[];
    performanceGains: string;
  }> {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 3072,
      messages: [
        {
          role: 'user',
          content: `Please optimize this ${language} code for performance:

\`\`\`${language.toLowerCase()}
${code}
\`\`\`

Provide:
1. The optimized code
2. List of improvements made
3. Expected performance gains`,
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type');
    }

    const text = content.text;

    // Extract optimized code
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/;
    const match = text.match(codeBlockRegex);
    const optimizedCode = match ? match[2].trim() : code;

    // Extract improvements (look for numbered or bulleted lists)
    const improvements: string[] = [];
    const improvementRegex = /[-•\d.]\s+(.+)/g;
    let improvementMatch;
    while ((improvementMatch = improvementRegex.exec(text)) !== null) {
      improvements.push(improvementMatch[1].trim());
    }

    return {
      optimizedCode,
      improvements,
      performanceGains: text,
    };
  }
}
