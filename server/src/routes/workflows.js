/**
 * Workflow Routes
 * API endpoints for workflow automation
 */

const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');
const workflowEngine = require('../services/workflowEngine');
const workflowTriggers = require('../services/workflowTriggers');

const prisma = new PrismaClient();

// All routes require authentication
router.use(authenticate);

// ============================================================================
// WORKFLOW CRUD
// ============================================================================

/**
 * List all workflows for user
 * GET /api/workflows
 */
router.get('/', async (req, res) => {
  try {
    const workflows = await prisma.workflow.findMany({
      where: {
        userId: req.user.id
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        _count: {
          select: { executions: true }
        }
      }
    });

    res.json({ success: true, workflows });
  } catch (error) {
    console.error('Error listing workflows:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Get single workflow
 * GET /api/workflows/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const workflow = await prisma.workflow.findUnique({
      where: { id },
      include: {
        _count: {
          select: { executions: true }
        }
      }
    });

    if (!workflow) {
      return res.status(404).json({ success: false, error: 'Workflow not found' });
    }

    // Check ownership
    if (workflow.userId !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    res.json({ success: true, workflow });
  } catch (error) {
    console.error('Error getting workflow:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Create workflow
 * POST /api/workflows
 */
router.post('/', async (req, res) => {
  try {
    const {
      name,
      description,
      trigger,
      nodes,
      edges,
      isActive = false
    } = req.body;

    const workflow = await prisma.workflow.create({
      data: {
        userId: req.user.id,
        name,
        description,
        trigger,
        nodes: nodes || [],
        edges: edges || [],
        isActive
      }
    });

    res.json({ success: true, workflow });
  } catch (error) {
    console.error('Error creating workflow:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Update workflow
 * PATCH /api/workflows/:id
 */
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      trigger,
      nodes,
      edges,
      isActive
    } = req.body;

    // Check ownership
    const existing = await prisma.workflow.findUnique({
      where: { id }
    });

    if (!existing) {
      return res.status(404).json({ success: false, error: 'Workflow not found' });
    }

    if (existing.userId !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    // Update workflow
    const workflow = await prisma.workflow.update({
      where: { id },
      data: {
        name,
        description,
        trigger,
        nodes,
        edges,
        isActive
      }
    });

    res.json({ success: true, workflow });
  } catch (error) {
    console.error('Error updating workflow:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Delete workflow
 * DELETE /api/workflows/:id
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check ownership
    const workflow = await prisma.workflow.findUnique({
      where: { id }
    });

    if (!workflow) {
      return res.status(404).json({ success: false, error: 'Workflow not found' });
    }

    if (workflow.userId !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    // Delete workflow
    await prisma.workflow.delete({
      where: { id }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting workflow:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// WORKFLOW CONTROL
// ============================================================================

/**
 * Activate workflow
 * POST /api/workflows/:id/activate
 */
router.post('/:id/activate', async (req, res) => {
  try {
    const { id } = req.params;

    // Check ownership
    const workflow = await prisma.workflow.findUnique({
      where: { id }
    });

    if (!workflow) {
      return res.status(404).json({ success: false, error: 'Workflow not found' });
    }

    if (workflow.userId !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    // Activate
    const updated = await prisma.workflow.update({
      where: { id },
      data: { isActive: true }
    });

    res.json({ success: true, workflow: updated });
  } catch (error) {
    console.error('Error activating workflow:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Deactivate workflow
 * POST /api/workflows/:id/deactivate
 */
router.post('/:id/deactivate', async (req, res) => {
  try {
    const { id } = req.params;

    // Check ownership
    const workflow = await prisma.workflow.findUnique({
      where: { id }
    });

    if (!workflow) {
      return res.status(404).json({ success: false, error: 'Workflow not found' });
    }

    if (workflow.userId !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    // Deactivate
    const updated = await prisma.workflow.update({
      where: { id },
      data: { isActive: false }
    });

    res.json({ success: true, workflow: updated });
  } catch (error) {
    console.error('Error deactivating workflow:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Test workflow with sample data
 * POST /api/workflows/:id/test
 */
router.post('/:id/test', async (req, res) => {
  try {
    const { id } = req.params;
    const { testData } = req.body;

    // Check ownership
    const workflow = await prisma.workflow.findUnique({
      where: { id }
    });

    if (!workflow) {
      return res.status(404).json({ success: false, error: 'Workflow not found' });
    }

    if (workflow.userId !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    // Test workflow
    const result = await workflowEngine.testWorkflow(prisma, id, testData || {});

    res.json({
      success: true,
      result
    });
  } catch (error) {
    console.error('Error testing workflow:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Execute workflow manually
 * POST /api/workflows/:id/execute
 */
router.post('/:id/execute', async (req, res) => {
  try {
    const { id } = req.params;
    const { triggerData } = req.body;

    // Check ownership
    const workflow = await prisma.workflow.findUnique({
      where: { id }
    });

    if (!workflow) {
      return res.status(404).json({ success: false, error: 'Workflow not found' });
    }

    if (workflow.userId !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    // Queue workflow for execution
    const result = await workflowEngine.queueWorkflow(
      prisma,
      id,
      'manual',
      triggerData || {},
      req.user.id
    );

    res.json({
      success: true,
      queueId: result.queueId
    });
  } catch (error) {
    console.error('Error executing workflow:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// EXECUTION HISTORY
// ============================================================================

/**
 * Get workflow execution history
 * GET /api/workflows/:id/executions
 */
router.get('/:id/executions', async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    // Check ownership
    const workflow = await prisma.workflow.findUnique({
      where: { id }
    });

    if (!workflow) {
      return res.status(404).json({ success: false, error: 'Workflow not found' });
    }

    if (workflow.userId !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    // Get executions
    const executions = await prisma.workflowExecution.findMany({
      where: { workflowId: id },
      orderBy: { startedAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset)
    });

    // Get total count
    const total = await prisma.workflowExecution.count({
      where: { workflowId: id }
    });

    res.json({
      success: true,
      executions,
      total,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Error getting executions:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Get single execution details
 * GET /api/workflows/executions/:executionId
 */
router.get('/executions/:executionId', async (req, res) => {
  try {
    const { executionId } = req.params;

    const execution = await prisma.workflowExecution.findUnique({
      where: { id: executionId },
      include: {
        workflow: true
      }
    });

    if (!execution) {
      return res.status(404).json({ success: false, error: 'Execution not found' });
    }

    // Check ownership
    if (execution.workflow.userId !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    res.json({ success: true, execution });
  } catch (error) {
    console.error('Error getting execution:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// WORKFLOW TEMPLATES
// ============================================================================

/**
 * Browse workflow templates
 * GET /api/workflow-templates
 */
router.get('/templates/browse', async (req, res) => {
  try {
    const { category, featured } = req.query;

    const where = {};
    if (category) where.category = category;
    if (featured) where.isFeatured = true;

    const templates = await prisma.workflowTemplate.findMany({
      where,
      orderBy: [
        { isFeatured: 'desc' },
        { usageCount: 'desc' }
      ]
    });

    res.json({ success: true, templates });
  } catch (error) {
    console.error('Error browsing templates:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Get template details
 * GET /api/workflow-templates/:id
 */
router.get('/templates/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const template = await prisma.workflowTemplate.findUnique({
      where: { id }
    });

    if (!template) {
      return res.status(404).json({ success: false, error: 'Template not found' });
    }

    res.json({ success: true, template });
  } catch (error) {
    console.error('Error getting template:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Install template as new workflow
 * POST /api/workflow-templates/:id/install
 */
router.post('/templates/:id/install', async (req, res) => {
  try {
    const { id } = req.params;

    const template = await prisma.workflowTemplate.findUnique({
      where: { id }
    });

    if (!template) {
      return res.status(404).json({ success: false, error: 'Template not found' });
    }

    // Create workflow from template
    const workflow = await prisma.workflow.create({
      data: {
        userId: req.user.id,
        name: template.name,
        description: template.description,
        ...template.workflow,
        isActive: false // Start inactive
      }
    });

    // Increment usage count
    await prisma.workflowTemplate.update({
      where: { id },
      data: {
        usageCount: { increment: 1 }
      }
    });

    res.json({ success: true, workflow });
  } catch (error) {
    console.error('Error installing template:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// WEBHOOKS
// ============================================================================

/**
 * Create webhook for workflow
 * POST /api/workflows/:id/webhook
 */
router.post('/:id/webhook', async (req, res) => {
  try {
    const { id } = req.params;
    const { secret } = req.body;

    // Check ownership
    const workflow = await prisma.workflow.findUnique({
      where: { id }
    });

    if (!workflow) {
      return res.status(404).json({ success: false, error: 'Workflow not found' });
    }

    if (workflow.userId !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    // Create webhook
    const webhookId = generateId();
    const webhook = await prisma.workflowWebhook.create({
      data: {
        workflowId: id,
        webhookUrl: `/api/webhooks/${webhookId}`,
        secret
      }
    });

    res.json({ success: true, webhook });
  } catch (error) {
    console.error('Error creating webhook:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Trigger workflow via webhook
 * POST /api/webhooks/:webhookId
 */
router.post('/webhooks/:webhookId', async (req, res) => {
  try {
    const { webhookId } = req.params;

    // Find webhook
    const webhook = await prisma.workflowWebhook.findUnique({
      where: { webhookUrl: `/api/webhooks/${webhookId}` }
    });

    if (!webhook || !webhook.isActive) {
      return res.status(404).json({ success: false, error: 'Webhook not found' });
    }

    // Verify secret if configured
    if (webhook.secret) {
      const providedSecret = req.headers['x-webhook-secret'];
      if (providedSecret !== webhook.secret) {
        return res.status(401).json({ success: false, error: 'Invalid secret' });
      }
    }

    // Queue workflow
    await workflowEngine.queueWorkflow(
      prisma,
      webhook.workflowId,
      'webhook',
      req.body
    );

    // Update webhook stats
    await prisma.workflowWebhook.update({
      where: { id: webhook.id },
      data: {
        callCount: { increment: 1 },
        lastCalledAt: new Date()
      }
    });

    res.json({ success: true, message: 'Workflow queued' });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// HELPERS
// ============================================================================

function generateId() {
  return 'wh_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export default router;
