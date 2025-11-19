/**
 * Workflow Trigger System
 * Listens for events and triggers workflows
 */

const { queueWorkflow } = require('./workflowEngine');

/**
 * Trigger workflows based on an event
 */
async function triggerWorkflows(prisma, triggerType, triggerData) {
  try {
    console.log(`Trigger fired: ${triggerType}`);

    // Find all active workflows with this trigger
    const workflows = await prisma.workflow.findMany({
      where: {
        isActive: true,
        trigger: {
          path: ['type'],
          equals: triggerType
        }
      }
    });

    console.log(`Found ${workflows.length} workflows for trigger ${triggerType}`);

    // Queue each workflow for execution
    for (const workflow of workflows) {
      // Check if trigger conditions match
      if (matchesTriggerConditions(workflow.trigger, triggerData)) {
        await queueWorkflow(
          prisma,
          workflow.id,
          triggerType,
          triggerData,
          triggerData.userId || null
        );
      }
    }

    return {
      success: true,
      triggered: workflows.length
    };
  } catch (error) {
    console.error('Error triggering workflows:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Check if trigger data matches trigger conditions
 */
function matchesTriggerConditions(trigger, data) {
  // If no conditions, always match
  if (!trigger.conditions || trigger.conditions.length === 0) {
    return true;
  }

  // Evaluate all conditions
  for (const condition of trigger.conditions) {
    const { field, operator, value } = condition;
    const fieldValue = getNestedValue(data, field);

    if (!evaluateCondition(fieldValue, operator, value)) {
      return false;
    }
  }

  return true;
}

/**
 * Evaluate a single condition
 */
function evaluateCondition(fieldValue, operator, value) {
  switch (operator) {
    case 'equals':
      return fieldValue == value;
    case 'not_equals':
      return fieldValue != value;
    case 'greater_than':
      return fieldValue > value;
    case 'less_than':
      return fieldValue < value;
    case 'contains':
      return String(fieldValue).includes(value);
    default:
      return true;
  }
}

/**
 * Get nested value from object
 */
function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

// ============================================================================
// SPECIFIC TRIGGER HELPERS
// ============================================================================

/**
 * Trigger: User Signup
 */
async function triggerUserSignup(prisma, user) {
  return await triggerWorkflows(prisma, 'user_signup', {
    userId: user.id,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt
    }
  });
}

/**
 * Trigger: Purchase Complete
 */
async function triggerPurchaseComplete(prisma, order, user, items) {
  return await triggerWorkflows(prisma, 'purchase_complete', {
    userId: user.id,
    order: {
      id: order.id,
      total: order.total,
      status: order.status,
      createdAt: order.createdAt
    },
    user: {
      id: user.id,
      email: user.email,
      name: user.name
    },
    items
  });
}

/**
 * Trigger: Email Opened
 */
async function triggerEmailOpened(prisma, emailId, userId) {
  return await triggerWorkflows(prisma, 'email_opened', {
    emailId,
    userId,
    openedAt: new Date()
  });
}

/**
 * Trigger: Form Submitted
 */
async function triggerFormSubmitted(prisma, formId, formData, userId = null) {
  return await triggerWorkflows(prisma, 'form_submitted', {
    formId,
    formData,
    userId,
    submittedAt: new Date()
  });
}

/**
 * Trigger: Course Completed
 */
async function triggerCourseCompleted(prisma, userId, courseId) {
  const [user, course] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.course.findUnique({ where: { id: courseId } })
  ]);

  return await triggerWorkflows(prisma, 'course_completed', {
    userId,
    courseId,
    user: {
      id: user.id,
      email: user.email,
      name: user.name
    },
    course: {
      id: course.id,
      title: course.title
    },
    completedAt: new Date()
  });
}

/**
 * Trigger: Course Enrolled
 */
async function triggerCourseEnrolled(prisma, userId, courseId) {
  const [user, course] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.course.findUnique({ where: { id: courseId } })
  ]);

  return await triggerWorkflows(prisma, 'course_enrolled', {
    userId,
    courseId,
    user: {
      id: user.id,
      email: user.email,
      name: user.name
    },
    course: {
      id: course.id,
      title: course.title
    },
    enrolledAt: new Date()
  });
}

/**
 * Trigger: Support Ticket Created
 */
async function triggerTicketCreated(prisma, ticket, user) {
  return await triggerWorkflows(prisma, 'ticket_created', {
    ticketId: ticket.id,
    userId: user.id,
    ticket: {
      id: ticket.id,
      subject: ticket.subject,
      status: ticket.status,
      priority: ticket.priority
    },
    user: {
      id: user.id,
      email: user.email,
      name: user.name
    },
    createdAt: new Date()
  });
}

/**
 * Trigger: Page Viewed
 */
async function triggerPageViewed(prisma, userId, pagePath, metadata = {}) {
  return await triggerWorkflows(prisma, 'page_viewed', {
    userId,
    pagePath,
    metadata,
    viewedAt: new Date()
  });
}

/**
 * Trigger: Product Added to Cart
 */
async function triggerProductAddedToCart(prisma, userId, productId, quantity) {
  const [user, product] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.product.findUnique({ where: { id: productId } })
  ]);

  return await triggerWorkflows(prisma, 'product_added_to_cart', {
    userId,
    productId,
    quantity,
    user: {
      id: user.id,
      email: user.email,
      name: user.name
    },
    product: {
      id: product.id,
      name: product.name,
      price: product.price
    },
    addedAt: new Date()
  });
}

/**
 * Trigger: Blog Post Published
 */
async function triggerBlogPostPublished(prisma, postId, authorId) {
  const [post, author] = await Promise.all([
    prisma.blogPost.findUnique({ where: { id: postId } }),
    prisma.user.findUnique({ where: { id: authorId } })
  ]);

  return await triggerWorkflows(prisma, 'blog_post_published', {
    postId,
    authorId,
    post: {
      id: post.id,
      title: post.title,
      slug: post.slug
    },
    author: {
      id: author.id,
      name: author.name
    },
    publishedAt: new Date()
  });
}

// ============================================================================
// SCHEDULE PROCESSING
// ============================================================================

/**
 * Process scheduled workflows
 * Should be called by cron job every minute
 */
async function processScheduledWorkflows(prisma) {
  try {
    const now = new Date();

    // Find workflows due to run
    const scheduled = await prisma.scheduledWorkflow.findMany({
      where: {
        isActive: true,
        nextRunAt: {
          lte: now
        }
      }
    });

    console.log(`Processing ${scheduled.length} scheduled workflows`);

    for (const schedule of scheduled) {
      // Queue workflow
      await queueWorkflow(
        prisma,
        schedule.workflowId,
        'schedule',
        {
          scheduleId: schedule.id,
          scheduledTime: schedule.nextRunAt
        }
      );

      // Calculate next run time
      const nextRun = calculateNextRun(schedule);

      // Update schedule
      await prisma.scheduledWorkflow.update({
        where: { id: schedule.id },
        data: {
          lastRunAt: now,
          nextRunAt: nextRun
        }
      });
    }

    return {
      success: true,
      processed: scheduled.length
    };
  } catch (error) {
    console.error('Error processing scheduled workflows:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Calculate next run time based on schedule type
 */
function calculateNextRun(schedule) {
  const now = new Date();
  const config = schedule.scheduleConfig;

  switch (schedule.scheduleType) {
    case 'ONCE':
      // One-time schedule, disable it
      return null;

    case 'HOURLY':
      return new Date(now.getTime() + 60 * 60 * 1000);

    case 'DAILY':
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(config.hour || 0, config.minute || 0, 0, 0);
      return tomorrow;

    case 'WEEKLY':
      const nextWeek = new Date(now);
      const daysUntilTarget = (config.dayOfWeek - now.getDay() + 7) % 7;
      nextWeek.setDate(nextWeek.getDate() + daysUntilTarget + 7);
      nextWeek.setHours(config.hour || 0, config.minute || 0, 0, 0);
      return nextWeek;

    case 'MONTHLY':
      const nextMonth = new Date(now);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      nextMonth.setDate(config.dayOfMonth || 1);
      nextMonth.setHours(config.hour || 0, config.minute || 0, 0, 0);
      return nextMonth;

    case 'CRON':
      // TODO: Parse cron expression
      // For now, default to daily
      return new Date(now.getTime() + 24 * 60 * 60 * 1000);

    default:
      return new Date(now.getTime() + 24 * 60 * 60 * 1000);
  }
}

/**
 * Initialize schedule processor
 */
function initializeScheduleProcessor(prisma) {
  console.log('⏰ Initializing workflow schedule processor...');

  // Process schedules every minute
  setInterval(async () => {
    await processScheduledWorkflows(prisma);
  }, 60000);

  console.log('✓ Workflow schedule processor initialized');
}

module.exports = {
  triggerWorkflows,
  triggerUserSignup,
  triggerPurchaseComplete,
  triggerEmailOpened,
  triggerFormSubmitted,
  triggerCourseCompleted,
  triggerCourseEnrolled,
  triggerTicketCreated,
  triggerPageViewed,
  triggerProductAddedToCart,
  triggerBlogPostPublished,
  processScheduledWorkflows,
  initializeScheduleProcessor
};
