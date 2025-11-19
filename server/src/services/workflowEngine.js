/**
 * Workflow Execution Engine
 * Processes and executes workflows with triggers, actions, conditions, and delays
 */

const actionExecutor = require('./workflowActions');

/**
 * Execute a workflow
 */
async function executeWorkflow(prisma, workflowId, triggerData, userId = null) {
  let execution = null;

  try {
    // Get workflow
    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId }
    });

    if (!workflow) {
      throw new Error('Workflow not found');
    }

    if (!workflow.isActive) {
      console.log(`Workflow ${workflowId} is not active, skipping execution`);
      return { success: false, error: 'Workflow is not active' };
    }

    // Create execution record
    execution = await prisma.workflowExecution.create({
      data: {
        workflowId,
        userId,
        status: 'RUNNING',
        triggerData,
        executedActions: []
      }
    });

    console.log(`Starting workflow execution ${execution.id} for workflow ${workflow.name}`);

    // Execute workflow nodes
    const result = await executeNodes(prisma, workflow, triggerData, execution.id);

    // Update execution with results
    const duration = Date.now() - new Date(execution.startedAt).getTime();

    await prisma.workflowExecution.update({
      where: { id: execution.id },
      data: {
        status: result.success ? 'SUCCESS' : 'FAILED',
        executedActions: result.executedActions,
        errors: result.errors,
        output: result.output,
        completedAt: new Date(),
        duration
      }
    });

    // Update workflow stats
    await prisma.workflow.update({
      where: { id: workflowId },
      data: {
        executionCount: { increment: 1 },
        lastExecutedAt: new Date(),
        successCount: result.success ? { increment: 1 } : undefined,
        failureCount: !result.success ? { increment: 1 } : undefined
      }
    });

    console.log(`Workflow execution ${execution.id} completed with status: ${result.success ? 'SUCCESS' : 'FAILED'}`);

    return {
      success: result.success,
      executionId: execution.id,
      output: result.output,
      errors: result.errors
    };

  } catch (error) {
    console.error('Error executing workflow:', error);

    // Update execution if it was created
    if (execution) {
      await prisma.workflowExecution.update({
        where: { id: execution.id },
        data: {
          status: 'FAILED',
          errors: { error: error.message, stack: error.stack },
          completedAt: new Date()
        }
      });
    }

    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Execute workflow nodes in order
 */
async function executeNodes(prisma, workflow, triggerData, executionId) {
  const { nodes, edges } = workflow;

  if (!nodes || nodes.length === 0) {
    return {
      success: true,
      executedActions: [],
      output: triggerData
    };
  }

  // Find starting node (trigger)
  const startNode = nodes.find(n => n.type === 'trigger');

  if (!startNode) {
    throw new Error('No trigger node found');
  }

  // Execution context
  const context = {
    data: triggerData,
    executedActions: [],
    errors: []
  };

  // Execute from start node
  await executeNode(prisma, startNode, nodes, edges, context);

  return {
    success: context.errors.length === 0,
    executedActions: context.executedActions,
    errors: context.errors.length > 0 ? context.errors : null,
    output: context.data
  };
}

/**
 * Execute a single node
 */
async function executeNode(prisma, node, allNodes, allEdges, context) {
  try {
    console.log(`Executing node ${node.id} (${node.type})`);

    let shouldContinue = true;

    // Execute based on node type
    switch (node.type) {
      case 'trigger':
        // Trigger just passes data through
        break;

      case 'action':
        // Execute action
        const actionResult = await actionExecutor.executeAction(
          prisma,
          node.data.actionType,
          node.data.config,
          context.data
        );

        context.executedActions.push({
          nodeId: node.id,
          actionType: node.data.actionType,
          result: actionResult,
          timestamp: new Date()
        });

        if (!actionResult.success) {
          context.errors.push({
            nodeId: node.id,
            error: actionResult.error
          });

          // Stop execution on error (unless configured to continue)
          if (!node.data.continueOnError) {
            shouldContinue = false;
          }
        }

        // Merge action output into context
        if (actionResult.output) {
          context.data = { ...context.data, ...actionResult.output };
        }
        break;

      case 'condition':
        // Evaluate condition
        const conditionResult = evaluateCondition(node.data.condition, context.data);

        context.executedActions.push({
          nodeId: node.id,
          type: 'condition',
          result: conditionResult,
          timestamp: new Date()
        });

        // Follow appropriate branch
        const branchEdge = allEdges.find(e =>
          e.source === node.id &&
          e.sourceHandle === (conditionResult ? 'true' : 'false')
        );

        if (branchEdge) {
          const nextNode = allNodes.find(n => n.id === branchEdge.target);
          if (nextNode) {
            await executeNode(prisma, nextNode, allNodes, allEdges, context);
          }
        }

        return; // Don't continue to next node (branch handles it)

      case 'delay':
        // Wait for specified duration
        const delayMs = parseDelay(node.data.delay);
        console.log(`Delaying for ${delayMs}ms`);

        await new Promise(resolve => setTimeout(resolve, delayMs));

        context.executedActions.push({
          nodeId: node.id,
          type: 'delay',
          duration: delayMs,
          timestamp: new Date()
        });
        break;

      default:
        console.warn(`Unknown node type: ${node.type}`);
    }

    if (!shouldContinue) {
      console.log('Stopping execution due to error');
      return;
    }

    // Find next node(s)
    const outgoingEdges = allEdges.filter(e => e.source === node.id);

    for (const edge of outgoingEdges) {
      const nextNode = allNodes.find(n => n.id === edge.target);
      if (nextNode) {
        await executeNode(prisma, nextNode, allNodes, allEdges, context);
      }
    }

  } catch (error) {
    console.error(`Error executing node ${node.id}:`, error);
    context.errors.push({
      nodeId: node.id,
      error: error.message
    });
  }
}

/**
 * Evaluate a condition
 */
function evaluateCondition(condition, data) {
  try {
    const { field, operator, value } = condition;

    // Get field value from data (supports nested paths like "user.name")
    const fieldValue = getNestedValue(data, field);

    switch (operator) {
      case 'equals':
        return fieldValue == value;
      case 'not_equals':
        return fieldValue != value;
      case 'greater_than':
        return fieldValue > value;
      case 'less_than':
        return fieldValue < value;
      case 'greater_than_or_equal':
        return fieldValue >= value;
      case 'less_than_or_equal':
        return fieldValue <= value;
      case 'contains':
        return String(fieldValue).includes(value);
      case 'not_contains':
        return !String(fieldValue).includes(value);
      case 'is_empty':
        return !fieldValue || fieldValue === '';
      case 'is_not_empty':
        return !!fieldValue && fieldValue !== '';
      case 'is_true':
        return fieldValue === true;
      case 'is_false':
        return fieldValue === false;
      default:
        console.warn(`Unknown operator: ${operator}`);
        return false;
    }
  } catch (error) {
    console.error('Error evaluating condition:', error);
    return false;
  }
}

/**
 * Get nested value from object using dot notation
 */
function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

/**
 * Parse delay configuration to milliseconds
 */
function parseDelay(delay) {
  const { value, unit } = delay;

  switch (unit) {
    case 'seconds':
      return value * 1000;
    case 'minutes':
      return value * 60 * 1000;
    case 'hours':
      return value * 60 * 60 * 1000;
    case 'days':
      return value * 24 * 60 * 60 * 1000;
    default:
      return value * 1000; // Default to seconds
  }
}

/**
 * Replace variables in text with data values
 * Example: "Hello {{user.name}}" -> "Hello John"
 */
function replaceVariables(text, data) {
  if (!text) return text;

  return String(text).replace(/\{\{([^}]+)\}\}/g, (match, path) => {
    const value = getNestedValue(data, path.trim());
    return value !== undefined ? value : match;
  });
}

/**
 * Test workflow with sample data
 */
async function testWorkflow(prisma, workflowId, testData) {
  const workflow = await prisma.workflow.findUnique({
    where: { id: workflowId }
  });

  if (!workflow) {
    throw new Error('Workflow not found');
  }

  // Execute without saving to database
  const result = await executeNodes(prisma, workflow, testData, null);

  return {
    success: result.success,
    executedActions: result.executedActions,
    output: result.output,
    errors: result.errors
  };
}

/**
 * Queue workflow for execution
 */
async function queueWorkflow(prisma, workflowId, triggerType, triggerData, userId = null) {
  try {
    const queueItem = await prisma.workflowQueue.create({
      data: {
        workflowId,
        userId,
        triggerType,
        triggerData,
        status: 'PENDING'
      }
    });

    console.log(`Workflow ${workflowId} queued for execution (${queueItem.id})`);

    return { success: true, queueId: queueItem.id };
  } catch (error) {
    console.error('Error queuing workflow:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Process workflow queue
 * Should be called by background job
 */
async function processQueue(prisma) {
  try {
    // Get pending items
    const pending = await prisma.workflowQueue.findMany({
      where: {
        status: 'PENDING',
        scheduledFor: {
          lte: new Date()
        },
        attempts: {
          lt: prisma.workflowQueue.fields.maxAttempts
        }
      },
      take: 10, // Process 10 at a time
      orderBy: {
        createdAt: 'asc'
      }
    });

    console.log(`Processing ${pending.length} queued workflows`);

    for (const item of pending) {
      // Mark as processing
      await prisma.workflowQueue.update({
        where: { id: item.id },
        data: {
          status: 'PROCESSING',
          processingStarted: new Date(),
          attempts: { increment: 1 }
        }
      });

      // Execute workflow
      const result = await executeWorkflow(
        prisma,
        item.workflowId,
        item.triggerData,
        item.userId
      );

      // Update queue item
      await prisma.workflowQueue.update({
        where: { id: item.id },
        data: {
          status: result.success ? 'COMPLETED' : 'FAILED',
          processedAt: new Date(),
          lastError: result.error || null
        }
      });
    }

    return { processed: pending.length };
  } catch (error) {
    console.error('Error processing queue:', error);
    return { error: error.message };
  }
}

/**
 * Initialize background queue processor
 */
function initializeQueueProcessor(prisma) {
  console.log('📋 Initializing workflow queue processor...');

  // Process queue every 10 seconds
  setInterval(async () => {
    await processQueue(prisma);
  }, 10000);

  console.log('✓ Workflow queue processor initialized');
}

module.exports = {
  executeWorkflow,
  testWorkflow,
  queueWorkflow,
  processQueue,
  initializeQueueProcessor,
  replaceVariables,
  evaluateCondition
};
