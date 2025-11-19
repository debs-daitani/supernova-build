import { PrismaClient } from '@prisma/client';
import { sendInstagramDM, sendInstagramQuickReply, replyToInstagramComment } from './instagramApi.js';
import { sendMessengerMessage, sendMessengerQuickReply, replyToFacebookComment } from './facebookApi.js';

const prisma = new PrismaClient();

/**
 * Process incoming social media message
 */
export async function processSocialMessage(platform, accountId, threadId, senderId, messageText) {
  try {
    // 1. Get or create conversation
    let conversation = await prisma.socialConversation.findFirst({
      where: { threadId, platform },
      include: { automation: true }
    });

    if (!conversation) {
      // New conversation - check for trigger match
      const automation = await findMatchingAutomation(accountId, messageText, platform);

      if (automation) {
        conversation = await prisma.socialConversation.create({
          data: {
            automationId: automation.id,
            platform,
            threadId,
            socialUserId: senderId,
            variables: {},
            status: 'active'
          },
          include: { automation: true }
        });
      } else {
        // No automation matches
        return null;
      }
    }

    // 2. Store user message
    await prisma.socialMessage.create({
      data: {
        conversationId: conversation.id,
        sender: 'user',
        messageText,
        messageType: 'text'
      }
    });

    // 3. Process flow step
    const result = await processFlowStep(conversation, messageText);

    // 4. Update conversation
    await prisma.socialConversation.update({
      where: { id: conversation.id },
      data: {
        currentStepId: result.nextStepId,
        variables: result.variables,
        status: result.status || 'active',
        lastMessageAt: new Date(),
        ...(result.status === 'completed' && { completedAt: new Date() }),
        ...(result.leadEmail && { leadEmail: result.leadEmail }),
        ...(result.leadName && { leadName: result.leadName })
      }
    });

    return result;
  } catch (error) {
    console.error('Error processing social message:', error);
    throw error;
  }
}

/**
 * Find automation that matches the trigger
 */
async function findMatchingAutomation(accountId, messageText, platform) {
  const automations = await prisma.socialAutomation.findMany({
    where: {
      accountId,
      active: true
    }
  });

  // Check for keyword matches
  for (const automation of automations) {
    if (automation.triggerType === 'keyword' && automation.keywords) {
      const lowerMessage = messageText.toLowerCase();
      const hasMatch = automation.keywords.some(keyword =>
        lowerMessage.includes(keyword.toLowerCase())
      );

      if (hasMatch) {
        return automation;
      }
    } else if (automation.triggerType === 'any_comment') {
      return automation;
    }
  }

  return null;
}

/**
 * Process a flow step
 */
async function processFlowStep(conversation, userMessage) {
  const flow = conversation.automation.actionFlow;
  const steps = flow.steps || [];
  const variables = conversation.variables || {};

  // Get current step
  let currentStepIndex = steps.findIndex(s => s.id === conversation.currentStepId);
  if (currentStepIndex === -1) currentStepIndex = 0;

  const currentStep = steps[currentStepIndex];
  if (!currentStep) {
    return { nextStepId: null, variables, status: 'completed' };
  }

  let nextStepId = null;
  let updatedVariables = { ...variables };
  let status = 'active';
  let leadEmail = null;
  let leadName = null;

  // Process step based on type
  switch (currentStep.type) {
    case 'send_message':
      // Send message to user
      await sendSocialMessage(
        conversation.platform,
        conversation.automation.accountId,
        conversation.threadId,
        replaceVariables(currentStep.text, updatedVariables)
      );

      // Save bot message
      await prisma.socialMessage.create({
        data: {
          conversationId: conversation.id,
          sender: 'bot',
          messageText: currentStep.text,
          messageType: 'text'
        }
      });

      // Move to next step automatically
      nextStepId = steps[currentStepIndex + 1]?.id || null;
      break;

    case 'ask_question':
      // If this is first time on this step, send the question
      if (conversation.currentStepId !== currentStep.id) {
        await sendSocialMessage(
          conversation.platform,
          conversation.automation.accountId,
          conversation.threadId,
          replaceVariables(currentStep.question, updatedVariables)
        );

        await prisma.socialMessage.create({
          data: {
            conversationId: conversation.id,
            sender: 'bot',
            messageText: currentStep.question,
            messageType: 'text'
          }
        });

        // Stay on this step waiting for answer
        nextStepId = currentStep.id;
      } else {
        // User provided answer, capture it
        const variableName = currentStep.captureAs || 'response';
        updatedVariables[variableName] = userMessage;

        // Capture email/name if specified
        if (variableName === 'email') {
          leadEmail = userMessage;
        } else if (variableName === 'name') {
          leadName = userMessage;
        }

        // Move to next step
        nextStepId = steps[currentStepIndex + 1]?.id || null;
      }
      break;

    case 'quick_reply':
      // Send quick reply buttons
      await sendSocialQuickReply(
        conversation.platform,
        conversation.automation.accountId,
        conversation.threadId,
        replaceVariables(currentStep.text, updatedVariables),
        currentStep.options || []
      );

      await prisma.socialMessage.create({
        data: {
          conversationId: conversation.id,
          sender: 'bot',
          messageText: currentStep.text,
          messageType: 'quick_reply',
          buttonOptions: currentStep.options
        }
      });

      // Wait for user selection
      if (conversation.currentStepId !== currentStep.id) {
        nextStepId = currentStep.id;
      } else {
        // User selected option
        const selectedOption = currentStep.options?.find(opt =>
          userMessage.toLowerCase().includes(opt.title.toLowerCase())
        );

        if (selectedOption && selectedOption.captureAs) {
          updatedVariables[selectedOption.captureAs] = selectedOption.title;
        }

        nextStepId = steps[currentStepIndex + 1]?.id || null;
      }
      break;

    case 'delay':
      // In real implementation, would use scheduler/queue
      // For now, just move to next step
      nextStepId = steps[currentStepIndex + 1]?.id || null;
      break;

    case 'condition':
      // Evaluate condition
      const conditionMet = evaluateCondition(
        currentStep.variable,
        currentStep.operator,
        currentStep.value,
        updatedVariables
      );

      // Branch based on condition
      const targetStepId = conditionMet ? currentStep.trueStepId : currentStep.falseStepId;
      nextStepId = steps.find(s => s.id === targetStepId)?.id || steps[currentStepIndex + 1]?.id;
      break;

    case 'add_to_crm':
      // Execute CRM action (would integrate with actual CRM)
      console.log('Add to CRM:', updatedVariables);
      nextStepId = steps[currentStepIndex + 1]?.id || null;
      break;

    case 'send_link':
      // Send link (calendar, quiz, product, etc.)
      const linkMessage = `${currentStep.text}\n\n${currentStep.url}`;
      await sendSocialMessage(
        conversation.platform,
        conversation.automation.accountId,
        conversation.threadId,
        replaceVariables(linkMessage, updatedVariables)
      );

      await prisma.socialMessage.create({
        data: {
          conversationId: conversation.id,
          sender: 'bot',
          messageText: linkMessage,
          messageType: 'text'
        }
      });

      nextStepId = steps[currentStepIndex + 1]?.id || null;
      break;

    case 'end':
      nextStepId = null;
      status = 'completed';
      break;

    default:
      nextStepId = steps[currentStepIndex + 1]?.id || null;
  }

  // If no more steps, mark as completed
  if (!nextStepId) {
    status = 'completed';
  }

  return {
    nextStepId,
    variables: updatedVariables,
    status,
    ...(leadEmail && { leadEmail }),
    ...(leadName && { leadName })
  };
}

/**
 * Send message based on platform
 */
async function sendSocialMessage(platform, accountId, recipientId, text) {
  if (platform === 'instagram') {
    return sendInstagramDM(accountId, recipientId, text);
  } else if (platform === 'facebook') {
    return sendMessengerMessage(accountId, recipientId, text);
  }
}

/**
 * Send quick reply based on platform
 */
async function sendSocialQuickReply(platform, accountId, recipientId, text, options) {
  if (platform === 'instagram') {
    return sendInstagramQuickReply(accountId, recipientId, text, options);
  } else if (platform === 'facebook') {
    return sendMessengerQuickReply(accountId, recipientId, text, options);
  }
}

/**
 * Handle comment trigger
 */
export async function handleCommentTrigger(platform, accountId, commentId, postId, userId, commentText) {
  try {
    // Find matching automation
    const account = await prisma.socialAccount.findUnique({
      where: { id: accountId },
      include: { automations: { where: { active: true } } }
    });

    if (!account) return null;

    const automation = account.automations.find(a => {
      if (a.triggerType === 'specific_post' && a.postUrl && a.postUrl.includes(postId)) {
        return true;
      }
      if (a.triggerType === 'keyword' && a.keywords) {
        return a.keywords.some(kw => commentText.toLowerCase().includes(kw.toLowerCase()));
      }
      if (a.triggerType === 'any_comment') {
        return true;
      }
      return false;
    });

    if (!automation) return null;

    // Reply to comment if configured
    const flow = automation.actionFlow;
    if (flow.commentReply) {
      if (platform === 'instagram') {
        await replyToInstagramComment(accountId, commentId, flow.commentReply);
      } else if (platform === 'facebook') {
        await replyToFacebookComment(accountId, commentId, flow.commentReply);
      }
    }

    // Start DM sequence if configured
    if (flow.startDM) {
      // Create conversation and start flow
      const conversation = await prisma.socialConversation.create({
        data: {
          automationId: automation.id,
          platform,
          threadId: userId, // Use user ID as thread ID for new DM
          socialUserId: userId,
          variables: {},
          status: 'active'
        },
        include: { automation: true }
      });

      // Process first step
      await processFlowStep(conversation, '');
    }

    return automation;
  } catch (error) {
    console.error('Error handling comment trigger:', error);
    throw error;
  }
}

/**
 * Replace variables in text
 */
function replaceVariables(text, variables) {
  if (!text) return text;

  return text.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
    return variables[varName] || match;
  });
}

/**
 * Evaluate condition
 */
function evaluateCondition(variable, operator, value, variables) {
  const varValue = variables[variable];

  switch (operator) {
    case 'equals':
      return varValue == value;
    case 'contains':
      return String(varValue).includes(value);
    case 'greater_than':
      return Number(varValue) > Number(value);
    case 'less_than':
      return Number(varValue) < Number(value);
    case 'exists':
      return varValue !== undefined && varValue !== null && varValue !== '';
    default:
      return false;
  }
}

export default {
  processSocialMessage,
  handleCommentTrigger,
};
