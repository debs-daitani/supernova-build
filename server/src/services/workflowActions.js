/**
 * Workflow Action Executor
 * Executes different action types in workflows
 */

const { replaceVariables } = require('./workflowEngine');

/**
 * Execute an action
 */
async function executeAction(prisma, actionType, config, data) {
  try {
    console.log(`Executing action: ${actionType}`);

    // Replace variables in config
    const processedConfig = replaceConfigVariables(config, data);

    switch (actionType) {
      // COMMUNICATION ACTIONS
      case 'send_email':
        return await sendEmail(prisma, processedConfig, data);

      case 'send_sms':
        return await sendSMS(prisma, processedConfig, data);

      case 'send_notification':
        return await sendNotification(prisma, processedConfig, data);

      // CRM ACTIONS
      case 'create_contact':
        return await createContact(prisma, processedConfig, data);

      case 'update_contact':
        return await updateContact(prisma, processedConfig, data);

      case 'add_tag':
        return await addTag(prisma, processedConfig, data);

      case 'remove_tag':
        return await removeTag(prisma, processedConfig, data);

      case 'add_to_list':
        return await addToList(prisma, processedConfig, data);

      // COURSE ACTIONS
      case 'grant_course_access':
        return await grantCourseAccess(prisma, processedConfig, data);

      case 'revoke_course_access':
        return await revokeCourseAccess(prisma, processedConfig, data);

      case 'award_certificate':
        return await awardCertificate(prisma, processedConfig, data);

      // ECOMMERCE ACTIONS
      case 'create_order':
        return await createOrder(prisma, processedConfig, data);

      case 'update_order_status':
        return await updateOrderStatus(prisma, processedConfig, data);

      case 'generate_coupon':
        return await generateCoupon(prisma, processedConfig, data);

      // DATA ACTIONS
      case 'update_user_field':
        return await updateUserField(prisma, processedConfig, data);

      case 'make_http_request':
        return await makeHTTPRequest(processedConfig, data);

      case 'run_query':
        return await runQuery(prisma, processedConfig, data);

      // SYSTEM ACTIONS
      case 'log_message':
        return await logMessage(processedConfig, data);

      default:
        console.warn(`Unknown action type: ${actionType}`);
        return {
          success: false,
          error: `Unknown action type: ${actionType}`
        };
    }
  } catch (error) {
    console.error(`Error executing action ${actionType}:`, error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Replace variables in config object
 */
function replaceConfigVariables(config, data) {
  const processed = {};

  for (const [key, value] of Object.entries(config)) {
    if (typeof value === 'string') {
      processed[key] = replaceVariables(value, data);
    } else if (typeof value === 'object' && value !== null) {
      processed[key] = replaceConfigVariables(value, data);
    } else {
      processed[key] = value;
    }
  }

  return processed;
}

// ============================================================================
// COMMUNICATION ACTIONS
// ============================================================================

async function sendEmail(prisma, config, data) {
  const { to, subject, body, from } = config;

  // TODO: Integrate with email service
  console.log(`Sending email to ${to}: ${subject}`);

  // Placeholder - in production, use email service
  return {
    success: true,
    output: {
      emailSent: true,
      to,
      subject
    }
  };
}

async function sendSMS(prisma, config, data) {
  const { to, message } = config;

  // TODO: Integrate with SMS service (Twilio, etc.)
  console.log(`Sending SMS to ${to}: ${message}`);

  return {
    success: true,
    output: {
      smsSent: true,
      to
    }
  };
}

async function sendNotification(prisma, config, data) {
  const { userId, title, message, type } = config;

  // Create notification in database
  // TODO: Integrate with notification system

  console.log(`Sending notification to user ${userId}: ${title}`);

  return {
    success: true,
    output: {
      notificationSent: true,
      userId
    }
  };
}

// ============================================================================
// CRM ACTIONS
// ============================================================================

async function createContact(prisma, config, data) {
  const { email, name, metadata } = config;

  // TODO: Create contact in CRM
  console.log(`Creating contact: ${name} (${email})`);

  return {
    success: true,
    output: {
      contactId: 'contact_' + Date.now(),
      email,
      name
    }
  };
}

async function updateContact(prisma, config, data) {
  const { contactId, updates } = config;

  // TODO: Update contact in CRM
  console.log(`Updating contact ${contactId}`);

  return {
    success: true,
    output: {
      contactId,
      updated: true
    }
  };
}

async function addTag(prisma, config, data) {
  const { userId, tag } = config;

  // TODO: Add tag to user
  console.log(`Adding tag "${tag}" to user ${userId}`);

  return {
    success: true,
    output: {
      userId,
      tag,
      added: true
    }
  };
}

async function removeTag(prisma, config, data) {
  const { userId, tag } = config;

  // TODO: Remove tag from user
  console.log(`Removing tag "${tag}" from user ${userId}`);

  return {
    success: true,
    output: {
      userId,
      tag,
      removed: true
    }
  };
}

async function addToList(prisma, config, data) {
  const { userId, listId } = config;

  // TODO: Add user to email list
  console.log(`Adding user ${userId} to list ${listId}`);

  return {
    success: true,
    output: {
      userId,
      listId,
      added: true
    }
  };
}

// ============================================================================
// COURSE ACTIONS
// ============================================================================

async function grantCourseAccess(prisma, config, data) {
  const { userId, courseId } = config;

  try {
    // Grant course access
    await prisma.courseEnrollment.create({
      data: {
        userId,
        courseId,
        status: 'ACTIVE'
      }
    });

    console.log(`Granted course ${courseId} access to user ${userId}`);

    return {
      success: true,
      output: {
        userId,
        courseId,
        accessGranted: true
      }
    };
  } catch (error) {
    // Handle if already enrolled
    if (error.code === 'P2002') {
      return {
        success: true,
        output: {
          userId,
          courseId,
          accessGranted: false,
          reason: 'Already enrolled'
        }
      };
    }

    throw error;
  }
}

async function revokeCourseAccess(prisma, config, data) {
  const { userId, courseId } = config;

  await prisma.courseEnrollment.deleteMany({
    where: {
      userId,
      courseId
    }
  });

  console.log(`Revoked course ${courseId} access from user ${userId}`);

  return {
    success: true,
    output: {
      userId,
      courseId,
      accessRevoked: true
    }
  };
}

async function awardCertificate(prisma, config, data) {
  const { userId, courseId, templateId } = config;

  // TODO: Generate and award certificate
  console.log(`Awarding certificate to user ${userId} for course ${courseId}`);

  return {
    success: true,
    output: {
      userId,
      courseId,
      certificateId: 'cert_' + Date.now(),
      awarded: true
    }
  };
}

// ============================================================================
// ECOMMERCE ACTIONS
// ============================================================================

async function createOrder(prisma, config, data) {
  const { userId, items, total } = config;

  // TODO: Create order
  console.log(`Creating order for user ${userId}, total: ${total}`);

  return {
    success: true,
    output: {
      orderId: 'order_' + Date.now(),
      userId,
      total
    }
  };
}

async function updateOrderStatus(prisma, config, data) {
  const { orderId, status } = config;

  // TODO: Update order status
  console.log(`Updating order ${orderId} to status ${status}`);

  return {
    success: true,
    output: {
      orderId,
      status,
      updated: true
    }
  };
}

async function generateCoupon(prisma, config, data) {
  const { code, discount, expiresAt } = config;

  // TODO: Create coupon
  console.log(`Generating coupon ${code} with ${discount}% discount`);

  return {
    success: true,
    output: {
      couponCode: code,
      discount,
      expiresAt
    }
  };
}

// ============================================================================
// DATA ACTIONS
// ============================================================================

async function updateUserField(prisma, config, data) {
  const { userId, field, value } = config;

  try {
    // Update user field
    const updateData = {};
    updateData[field] = value;

    await prisma.user.update({
      where: { id: userId },
      data: updateData
    });

    console.log(`Updated user ${userId} field ${field} to ${value}`);

    return {
      success: true,
      output: {
        userId,
        field,
        value,
        updated: true
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

async function makeHTTPRequest(config, data) {
  const { method, url, headers, body } = config;

  try {
    const response = await fetch(url, {
      method,
      headers: headers || {},
      body: body ? JSON.stringify(body) : undefined
    });

    const responseData = await response.json();

    console.log(`HTTP ${method} request to ${url} completed`);

    return {
      success: response.ok,
      output: {
        status: response.status,
        data: responseData
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

async function runQuery(prisma, config, data) {
  const { model, operation, where, data: queryData } = config;

  try {
    // Execute database query
    // WARNING: This is powerful and should be restricted to admin users only
    const result = await prisma[model][operation]({
      where,
      data: queryData
    });

    console.log(`Executed ${operation} on ${model}`);

    return {
      success: true,
      output: {
        result
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// ============================================================================
// SYSTEM ACTIONS
// ============================================================================

async function logMessage(config, data) {
  const { message, level } = config;

  const logFn = console[level] || console.log;
  logFn(`[Workflow] ${message}`);

  return {
    success: true,
    output: {
      logged: true,
      message
    }
  };
}

module.exports = {
  executeAction
};
