/**
 * Code Assistant Routes
 *
 * API endpoints for Code Assistant (Integrated AI Developer) feature
 */

import { Router } from 'express';
import { CodeAccessService } from '../services/codeAccessService';
import { CodeAssistantService } from '../services/codeAssistantService';
import { CodeGenerationService } from '../services/codeGenerationService';
import { CodeDeploymentService } from '../services/codeDeploymentService';
import { CodeTemplateService } from '../services/codeTemplateService';

const router = Router();

// ============================================
// ACCESS MANAGEMENT
// ============================================

/**
 * GET /api/code/access
 * Check user's access level and unlock status
 */
router.get('/access', async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required',
      });
    }

    const accessCheck = await CodeAccessService.checkAndUpdateAccess(userId as string);

    res.json({
      success: true,
      data: accessCheck,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/code/access/capabilities
 * Get capabilities for user's current tier
 */
router.get('/access/capabilities', async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required',
      });
    }

    const accessCheck = await CodeAccessService.checkAndUpdateAccess(userId as string);
    const capabilities = CodeAccessService.getAccessCapabilities(accessCheck.accessLevel);

    res.json({
      success: true,
      data: {
        level: accessCheck.accessLevel,
        capabilities,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/code/access/stats
 * Get user's usage statistics
 */
router.get('/access/stats', async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required',
      });
    }

    const stats = await CodeAccessService.getUsageStats(userId as string);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ============================================
// DASHBOARD
// ============================================

/**
 * GET /api/code/dashboard
 * Get dashboard data (access, stats, recent items)
 */
router.get('/dashboard', async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required',
      });
    }

    const dashboard = await CodeAssistantService.getDashboard(userId as string);

    res.json({
      success: true,
      data: dashboard,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ============================================
// CONVERSATIONS
// ============================================

/**
 * POST /api/code/conversations
 * Start new code conversation
 */
router.post('/conversations', async (req, res) => {
  try {
    const { userId, title, targetPage, projectType } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required',
      });
    }

    const conversation = await CodeAssistantService.startConversation(userId, {
      title,
      targetPage,
      projectType,
    });

    res.json({
      success: true,
      data: conversation,
      message: 'Conversation started',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/code/conversations
 * List user's conversations
 */
router.get('/conversations', async (req, res) => {
  try {
    const { userId, status, search } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required',
      });
    }

    const conversations = await CodeAssistantService.getUserConversations(userId as string, {
      status: status as string,
      search: search as string,
    });

    res.json({
      success: true,
      data: conversations,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/code/conversations/:id
 * Get conversation details with messages
 */
router.get('/conversations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required',
      });
    }

    const conversation = await CodeAssistantService.getConversation(id, userId as string);

    res.json({
      success: true,
      data: conversation,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * PATCH /api/code/conversations/:id/archive
 * Archive conversation
 */
router.patch('/conversations/:id/archive', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required',
      });
    }

    const conversation = await CodeAssistantService.archiveConversation(id, userId);

    res.json({
      success: true,
      data: conversation,
      message: 'Conversation archived',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * DELETE /api/code/conversations/:id
 * Delete conversation
 */
router.delete('/conversations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required',
      });
    }

    await CodeAssistantService.deleteConversation(id, userId as string);

    res.json({
      success: true,
      message: 'Conversation deleted',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ============================================
// MESSAGES & CODE GENERATION
// ============================================

/**
 * POST /api/code/conversations/:id/messages
 * Send message and generate code
 */
router.post('/conversations/:id/messages', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, message, context } = req.body;

    if (!userId || !message) {
      return res.status(400).json({
        success: false,
        error: 'userId and message are required',
      });
    }

    const result = await CodeAssistantService.sendMessage(id, userId, message, context);

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/code/explain
 * Explain existing code
 */
router.post('/explain', async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        error: 'code is required',
      });
    }

    const explanation = await CodeGenerationService.explainCode(code);

    res.json({
      success: true,
      data: { explanation },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/code/debug
 * Debug code issue
 */
router.post('/debug', async (req, res) => {
  try {
    const { code, errorDescription } = req.body;

    if (!code || !errorDescription) {
      return res.status(400).json({
        success: false,
        error: 'code and errorDescription are required',
      });
    }

    const result = await CodeGenerationService.debugCode(code, errorDescription);

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/code/optimize
 * Optimize code for performance
 */
router.post('/optimize', async (req, res) => {
  try {
    const { code, language } = req.body;

    if (!code || !language) {
      return res.status(400).json({
        success: false,
        error: 'code and language are required',
      });
    }

    const result = await CodeGenerationService.optimizeCode(code, language);

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/code/regenerate/:id
 * Regenerate code with modifications
 */
router.post('/regenerate/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, modifications } = req.body;

    if (!userId || !modifications) {
      return res.status(400).json({
        success: false,
        error: 'userId and modifications are required',
      });
    }

    const result = await CodeAssistantService.regenerateCode(id, userId, modifications);

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ============================================
// DEPLOYMENTS
// ============================================

/**
 * POST /api/code/deploy
 * Deploy code to website
 */
router.post('/deploy', async (req, res) => {
  try {
    const { userId, generationId, deploymentType, targetPage, targetSection } = req.body;

    if (!userId || !generationId || !deploymentType) {
      return res.status(400).json({
        success: false,
        error: 'userId, generationId, and deploymentType are required',
      });
    }

    const result = await CodeDeploymentService.deployCode({
      userId,
      generationId,
      deploymentType,
      targetPage,
      targetSection,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/code/deployments
 * List user's deployments
 */
router.get('/deployments', async (req, res) => {
  try {
    const { userId, targetPage, isActive, deploymentType } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required',
      });
    }

    const deployments = await CodeDeploymentService.getUserDeployments(userId as string, {
      targetPage: targetPage as string,
      isActive: isActive ? isActive === 'true' : undefined,
      deploymentType: deploymentType as any,
    });

    res.json({
      success: true,
      data: deployments,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/code/deployments/:id
 * Get deployment details
 */
router.get('/deployments/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const deployment = await CodeDeploymentService.getDeployment(id);

    if (!deployment) {
      return res.status(404).json({
        success: false,
        error: 'Deployment not found',
      });
    }

    res.json({
      success: true,
      data: deployment,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * PATCH /api/code/deployments/:id/deactivate
 * Deactivate deployment
 */
router.patch('/deployments/:id/deactivate', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required',
      });
    }

    const deployment = await CodeDeploymentService.deactivateDeployment(id, userId);

    res.json({
      success: true,
      data: deployment,
      message: 'Deployment deactivated',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * DELETE /api/code/deployments/:id
 * Delete deployment
 */
router.delete('/deployments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required',
      });
    }

    await CodeDeploymentService.deleteDeployment(id, userId as string);

    res.json({
      success: true,
      message: 'Deployment deleted',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/code/deployments/rollback
 * Rollback to previous version
 */
router.post('/deployments/rollback', async (req, res) => {
  try {
    const { userId, targetPage, targetSection } = req.body;

    if (!userId || !targetPage) {
      return res.status(400).json({
        success: false,
        error: 'userId and targetPage are required',
      });
    }

    const deployment = await CodeDeploymentService.rollbackDeployment(
      userId,
      targetPage,
      targetSection
    );

    res.json({
      success: true,
      data: deployment,
      message: 'Rolled back to previous version',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/code/deployments/history
 * Get deployment history for location
 */
router.get('/deployments/history', async (req, res) => {
  try {
    const { userId, targetPage, targetSection } = req.query;

    if (!userId || !targetPage) {
      return res.status(400).json({
        success: false,
        error: 'userId and targetPage are required',
      });
    }

    const history = await CodeDeploymentService.getDeploymentHistory(
      userId as string,
      targetPage as string,
      targetSection as string
    );

    res.json({
      success: true,
      data: history,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/code/preview/:id
 * Preview deployment
 */
router.get('/preview/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required',
      });
    }

    const previewUrl = await CodeDeploymentService.previewDeployment(id, userId as string);

    res.json({
      success: true,
      data: { previewUrl },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/code/test/:id
 * Test deployment in sandbox
 */
router.post('/test/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required',
      });
    }

    const testResult = await CodeDeploymentService.testDeployment(id, userId);

    res.json({
      success: true,
      data: testResult,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ============================================
// TEMPLATES
// ============================================

/**
 * GET /api/code/templates
 * Get available templates for user
 */
router.get('/templates', async (req, res) => {
  try {
    const { userId, category, difficulty, search } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required',
      });
    }

    const templates = await CodeTemplateService.getTemplatesForUser(userId as string, {
      category: category as any,
      difficulty: difficulty as any,
      search: search as string,
    });

    res.json({
      success: true,
      data: templates,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/code/templates/featured
 * Get featured templates
 */
router.get('/templates/featured', async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required',
      });
    }

    const templates = await CodeTemplateService.getFeaturedTemplates(userId as string);

    res.json({
      success: true,
      data: templates,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/code/templates/:id
 * Get template details
 */
router.get('/templates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required',
      });
    }

    const template = await CodeTemplateService.getTemplate(id, userId as string);

    res.json({
      success: true,
      data: template,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/code/templates/:id/use
 * Use template with customization
 */
router.post('/templates/:id/use', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, variables } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required',
      });
    }

    const result = await CodeTemplateService.useTemplate(id, userId, variables);

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ============================================
// SNIPPETS (Personal Library)
// ============================================

/**
 * POST /api/code/snippets
 * Save code as snippet
 */
router.post('/snippets', async (req, res) => {
  try {
    const { userId, generationId, title, description, code, language, category, tags, isPublic } =
      req.body;

    if (!userId || !title || !code || !language || !category) {
      return res.status(400).json({
        success: false,
        error: 'userId, title, code, language, and category are required',
      });
    }

    const snippet = await CodeTemplateService.saveSnippet(userId, {
      generationId,
      title,
      description,
      code,
      language,
      category,
      tags,
      isPublic,
    });

    res.json({
      success: true,
      data: snippet,
      message: 'Snippet saved',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/code/snippets
 * Get user's snippets
 */
router.get('/snippets', async (req, res) => {
  try {
    const { userId, category, isFavorite, search } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required',
      });
    }

    const snippets = await CodeTemplateService.getUserSnippets(userId as string, {
      category: category as any,
      isFavorite: isFavorite ? isFavorite === 'true' : undefined,
      search: search as string,
    });

    res.json({
      success: true,
      data: snippets,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/code/snippets/public
 * Get public snippets (community)
 */
router.get('/snippets/public', async (req, res) => {
  try {
    const { category, search, language } = req.query;

    const snippets = await CodeTemplateService.getPublicSnippets({
      category: category as any,
      search: search as string,
      language: language as any,
    });

    res.json({
      success: true,
      data: snippets,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/code/snippets/:id
 * Get snippet details
 */
router.get('/snippets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required',
      });
    }

    const snippet = await CodeTemplateService.getSnippet(id, userId as string);

    res.json({
      success: true,
      data: snippet,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * PATCH /api/code/snippets/:id
 * Update snippet
 */
router.patch('/snippets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, ...updates } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required',
      });
    }

    const snippet = await CodeTemplateService.updateSnippet(id, userId, updates);

    res.json({
      success: true,
      data: snippet,
      message: 'Snippet updated',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * DELETE /api/code/snippets/:id
 * Delete snippet
 */
router.delete('/snippets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required',
      });
    }

    await CodeTemplateService.deleteSnippet(id, userId as string);

    res.json({
      success: true,
      message: 'Snippet deleted',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/code/snippets/:id/use
 * Use snippet (track usage)
 */
router.post('/snippets/:id/use', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required',
      });
    }

    const snippet = await CodeTemplateService.useSnippet(id, userId);

    res.json({
      success: true,
      data: snippet,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ============================================
// QUICK ACTIONS
// ============================================

/**
 * POST /api/code/quick-action
 * Perform quick action (calculator, form, timer, etc.)
 */
router.post('/quick-action', async (req, res) => {
  try {
    const { userId, type, params } = req.body;

    if (!userId || !type) {
      return res.status(400).json({
        success: false,
        error: 'userId and type are required',
      });
    }

    const result = await CodeAssistantService.quickAction(userId, {
      type,
      params: params || {},
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ============================================
// EXPORT & ANALYTICS
// ============================================

/**
 * POST /api/code/export/:id
 * Export code in various formats
 */
router.post('/export/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, format } = req.body;

    if (!userId || !format) {
      return res.status(400).json({
        success: false,
        error: 'userId and format are required',
      });
    }

    const result = await CodeAssistantService.exportCode(id, userId, format);

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/code/analytics/:id
 * Get code analytics
 */
router.get('/analytics/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required',
      });
    }

    const analytics = await CodeAssistantService.getCodeAnalytics(id, userId as string);

    res.json({
      success: true,
      data: analytics,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
