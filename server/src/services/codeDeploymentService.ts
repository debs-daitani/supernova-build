/**
 * Code Deployment Service
 *
 * Handles deployment of generated code to user's websites
 */

import { PrismaClient, CodeDeploymentType } from '@prisma/client';
import { CodeAccessService } from './codeAccessService';

const prisma = new PrismaClient();

interface DeploymentRequest {
  userId: string;
  generationId: string;
  deploymentType: CodeDeploymentType;
  targetPage?: string;
  targetSection?: string;
}

interface DeploymentResult {
  deploymentId: string;
  success: boolean;
  message: string;
  previewUrl?: string;
}

export class CodeDeploymentService {
  /**
   * Deploy code to user's website
   */
  static async deployCode(request: DeploymentRequest): Promise<DeploymentResult> {
    // Get the code generation
    const generation = await prisma.codeGeneration.findUnique({
      where: { id: request.generationId },
      include: {
        conversation: true,
      },
    });

    if (!generation) {
      throw new Error('Code generation not found');
    }

    // Verify user owns this generation
    if (generation.conversation.userId !== request.userId) {
      throw new Error('Unauthorized');
    }

    // Check if deployment is allowed
    const canDeploy = await CodeAccessService.canPerformAction(request.userId, {
      type: 'deploy',
      linesOfCode: generation.linesOfCode || 0,
    });

    if (!canDeploy.allowed) {
      throw new Error(canDeploy.reason || 'Cannot deploy code');
    }

    // Check if already deployed to this location
    const existingDeployment = await prisma.codeDeployment.findFirst({
      where: {
        userId: request.userId,
        targetPage: request.targetPage,
        targetSection: request.targetSection,
        isActive: true,
      },
    });

    // If exists, deactivate it (version control)
    if (existingDeployment) {
      await prisma.codeDeployment.update({
        where: { id: existingDeployment.id },
        data: { isActive: false },
      });
    }

    // Create deployment record
    const deployment = await prisma.codeDeployment.create({
      data: {
        userId: request.userId,
        generationId: request.generationId,
        deploymentType: request.deploymentType,
        targetPage: request.targetPage,
        targetSection: request.targetSection,
        isActive: true,
        version: existingDeployment ? existingDeployment.version + 1 : 1,
      },
    });

    // Update code generation status
    await prisma.codeGeneration.update({
      where: { id: request.generationId },
      data: { status: 'DEPLOYED' },
    });

    // In a real implementation, this would:
    // 1. Inject the code into the user's website
    // 2. Update the website's files/database
    // 3. Trigger a rebuild/republish
    // 4. Return a preview URL

    const deploymentResult = await this.performActualDeployment(
      generation.code,
      generation.language,
      request
    );

    // Update user stats
    await CodeAccessService.updateUsageStats(request.userId, {
      deploymentsCount: 1,
    });

    return {
      deploymentId: deployment.id,
      success: deploymentResult.success,
      message: deploymentResult.message,
      previewUrl: deploymentResult.previewUrl,
    };
  }

  /**
   * Perform actual deployment (platform-specific logic)
   */
  private static async performActualDeployment(
    code: string,
    language: string,
    request: DeploymentRequest
  ): Promise<{
    success: boolean;
    message: string;
    previewUrl?: string;
  }> {
    // In production, this would integrate with the website builder
    // For now, we'll simulate the deployment

    try {
      // Different deployment strategies based on type
      switch (request.deploymentType) {
        case 'WIDGET':
          return this.deployWidget(code, request);

        case 'PAGE':
          return this.deployPage(code, request);

        case 'INTEGRATION':
          return this.deployIntegration(code, request);

        case 'COMPONENT':
          return this.deployComponent(code, request);

        case 'SCRIPT':
          return this.deployScript(code, request);

        case 'STYLE':
          return this.deployStyle(code, request);

        default:
          throw new Error('Unknown deployment type');
      }
    } catch (error: any) {
      return {
        success: false,
        message: `Deployment failed: ${error.message}`,
      };
    }
  }

  /**
   * Deploy as widget (embedded component)
   */
  private static async deployWidget(
    code: string,
    request: DeploymentRequest
  ): Promise<{
    success: boolean;
    message: string;
    previewUrl?: string;
  }> {
    // In production: Create widget instance in website builder
    // Assign it to the specified section
    // Generate widget ID and embed code

    return {
      success: true,
      message: `Widget deployed successfully to ${request.targetPage || 'website'}`,
      previewUrl: `/preview/widget/${request.generationId}`,
    };
  }

  /**
   * Deploy as full page
   */
  private static async deployPage(
    code: string,
    request: DeploymentRequest
  ): Promise<{
    success: boolean;
    message: string;
    previewUrl?: string;
  }> {
    // In production: Create new page in website
    // Or update existing page
    // Publish changes

    return {
      success: true,
      message: `Page deployed successfully`,
      previewUrl: `/preview/page/${request.generationId}`,
    };
  }

  /**
   * Deploy as integration (API connection, etc.)
   */
  private static async deployIntegration(
    code: string,
    request: DeploymentRequest
  ): Promise<{
    success: boolean;
    message: string;
    previewUrl?: string;
  }> {
    // In production: Set up backend integration
    // Configure webhooks, API endpoints, etc.

    return {
      success: true,
      message: `Integration deployed successfully`,
      previewUrl: undefined, // Integrations don't have preview URLs
    };
  }

  /**
   * Deploy as reusable component
   */
  private static async deployComponent(
    code: string,
    request: DeploymentRequest
  ): Promise<{
    success: boolean;
    message: string;
    previewUrl?: string;
  }> {
    // In production: Add component to component library
    // Make it available for use across pages

    return {
      success: true,
      message: `Component added to your library`,
      previewUrl: `/preview/component/${request.generationId}`,
    };
  }

  /**
   * Deploy as script (JavaScript file)
   */
  private static async deployScript(
    code: string,
    request: DeploymentRequest
  ): Promise<{
    success: boolean;
    message: string;
    previewUrl?: string;
  }> {
    // In production: Add script to website's script bundle
    // Or inject as inline script

    return {
      success: true,
      message: `Script deployed to ${request.targetSection || 'site-wide'}`,
      previewUrl: undefined,
    };
  }

  /**
   * Deploy as stylesheet (CSS file)
   */
  private static async deployStyle(
    code: string,
    request: DeploymentRequest
  ): Promise<{
    success: boolean;
    message: string;
    previewUrl?: string;
  }> {
    // In production: Add CSS to website's stylesheet
    // Or inject as inline styles

    return {
      success: true,
      message: `Styles deployed to ${request.targetSection || 'site-wide'}`,
      previewUrl: undefined,
    };
  }

  /**
   * Get user's deployments
   */
  static async getUserDeployments(userId: string, filters?: {
    targetPage?: string;
    isActive?: boolean;
    deploymentType?: CodeDeploymentType;
  }) {
    const where: any = { userId };

    if (filters?.targetPage) {
      where.targetPage = filters.targetPage;
    }

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters?.deploymentType) {
      where.deploymentType = filters.deploymentType;
    }

    return await prisma.codeDeployment.findMany({
      where,
      include: {
        generation: {
          include: {
            conversation: true,
          },
        },
      },
      orderBy: { deployedAt: 'desc' },
    });
  }

  /**
   * Get deployment details
   */
  static async getDeployment(deploymentId: string) {
    return await prisma.codeDeployment.findUnique({
      where: { id: deploymentId },
      include: {
        generation: {
          include: {
            conversation: true,
          },
        },
      },
    });
  }

  /**
   * Deactivate deployment
   */
  static async deactivateDeployment(deploymentId: string, userId: string) {
    const deployment = await prisma.codeDeployment.findUnique({
      where: { id: deploymentId },
    });

    if (!deployment) {
      throw new Error('Deployment not found');
    }

    if (deployment.userId !== userId) {
      throw new Error('Unauthorized');
    }

    return await prisma.codeDeployment.update({
      where: { id: deploymentId },
      data: { isActive: false },
    });
  }

  /**
   * Rollback to previous version
   */
  static async rollbackDeployment(
    userId: string,
    targetPage: string,
    targetSection?: string
  ) {
    // Get current active deployment
    const currentDeployment = await prisma.codeDeployment.findFirst({
      where: {
        userId,
        targetPage,
        targetSection,
        isActive: true,
      },
    });

    if (!currentDeployment) {
      throw new Error('No active deployment found');
    }

    // Get previous version
    const previousDeployment = await prisma.codeDeployment.findFirst({
      where: {
        userId,
        targetPage,
        targetSection,
        version: currentDeployment.version - 1,
      },
    });

    if (!previousDeployment) {
      throw new Error('No previous version found');
    }

    // Deactivate current
    await prisma.codeDeployment.update({
      where: { id: currentDeployment.id },
      data: { isActive: false },
    });

    // Activate previous
    await prisma.codeDeployment.update({
      where: { id: previousDeployment.id },
      data: { isActive: true },
    });

    return previousDeployment;
  }

  /**
   * Get deployment history for a location
   */
  static async getDeploymentHistory(
    userId: string,
    targetPage: string,
    targetSection?: string
  ) {
    return await prisma.codeDeployment.findMany({
      where: {
        userId,
        targetPage,
        targetSection,
      },
      include: {
        generation: true,
      },
      orderBy: { version: 'desc' },
    });
  }

  /**
   * Delete deployment
   */
  static async deleteDeployment(deploymentId: string, userId: string) {
    const deployment = await prisma.codeDeployment.findUnique({
      where: { id: deploymentId },
    });

    if (!deployment) {
      throw new Error('Deployment not found');
    }

    if (deployment.userId !== userId) {
      throw new Error('Unauthorized');
    }

    // In production, this would also remove the code from the website

    return await prisma.codeDeployment.delete({
      where: { id: deploymentId },
    });
  }

  /**
   * Preview deployment before going live
   */
  static async previewDeployment(generationId: string, userId: string): Promise<string> {
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

    // In production: Generate temporary preview URL
    // Render code in isolated environment
    // Return preview URL

    const previewUrl = `/api/code/preview/${generationId}`;

    return previewUrl;
  }

  /**
   * Test deployment (run code in sandbox)
   */
  static async testDeployment(generationId: string, userId: string): Promise<{
    success: boolean;
    errors: string[];
    warnings: string[];
    performance: {
      loadTime: number;
      size: number;
    };
  }> {
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

    // In production: Run code in sandbox
    // Check for errors, security issues
    // Measure performance

    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic syntax check (simplified)
    try {
      // In production: Use proper linting/testing tools
      // For now, just basic validation

      if (generation.code.includes('eval(')) {
        warnings.push('Use of eval() detected - potential security risk');
      }

      if (generation.code.includes('innerHTML')) {
        warnings.push('Use of innerHTML detected - ensure proper sanitization');
      }
    } catch (error: any) {
      errors.push(error.message);
    }

    return {
      success: errors.length === 0,
      errors,
      warnings,
      performance: {
        loadTime: Math.random() * 100, // Simulated
        size: generation.code.length,
      },
    };
  }
}
