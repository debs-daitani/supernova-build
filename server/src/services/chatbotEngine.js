import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Process user message and determine bot response based on flow logic
 */
export async function processUserMessage(conversationId, userMessage, buttonId = null) {
  try {
    // Get conversation with current flow
    const conversation = await prisma.chatbotConversation.findUnique({
      where: { id: conversationId },
      include: {
        chatbot: {
          include: {
            flows: true
          }
        }
      }
    });

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    // Get current flow
    const currentFlow = conversation.chatbot.flows.find(f => f.id === conversation.currentFlowId);

    if (!currentFlow) {
      // No flow configured, send default response
      const message = await prisma.chatbotMessage.create({
        data: {
          conversationId,
          sender: 'bot',
          messageType: 'text',
          content: "I'm not sure how to respond to that. Would you like to speak with a human?"
        }
      });

      return {
        messages: [message],
        variables: conversation.variables,
        status: conversation.status
      };
    }

    // Parse flow data
    const flowData = currentFlow.flowData;
    const nodes = flowData.nodes || [];
    const edges = flowData.edges || [];

    // Get current node
    let currentNode = nodes.find(n => n.id === conversation.currentNodeId);

    // If no current node, start from first node
    if (!currentNode && nodes.length > 0) {
      currentNode = nodes[0];
    }

    // Process current node and get next response
    const result = await executeNode(currentNode, conversation, userMessage, buttonId, nodes, edges);

    return result;
  } catch (error) {
    console.error('Error processing message:', error);

    // Send error response
    const message = await prisma.chatbotMessage.create({
      data: {
        conversationId,
        sender: 'bot',
        messageType: 'text',
        content: "Sorry, something went wrong. Please try again."
      }
    });

    return {
      messages: [message],
      variables: {},
      status: 'active'
    };
  }
}

/**
 * Execute a flow node and return bot response
 */
async function executeNode(node, conversation, userInput, buttonId, nodes, edges) {
  const messages = [];
  let variables = conversation.variables || {};
  let status = conversation.status;
  let nextNodeId = null;

  if (!node) {
    // End of flow
    const endMessage = await prisma.chatbotMessage.create({
      data: {
        conversationId: conversation.id,
        sender: 'bot',
        messageType: 'text',
        content: "Thanks for chatting! Have a great day! 👋"
      }
    });

    await prisma.chatbotConversation.update({
      where: { id: conversation.id },
      data: {
        status: 'completed',
        completedAt: new Date()
      }
    });

    return {
      messages: [endMessage],
      variables,
      status: 'completed'
    };
  }

  const nodeType = node.type || node.data?.type;
  const nodeData = node.data || {};

  switch (nodeType) {
    case 'text_message':
      // Send text message
      const textContent = replaceVariables(nodeData.content || nodeData.message, variables);
      const textMessage = await prisma.chatbotMessage.create({
        data: {
          conversationId: conversation.id,
          sender: 'bot',
          messageType: 'text',
          content: textContent
        }
      });
      messages.push(textMessage);
      nextNodeId = getNextNodeId(node.id, edges);
      break;

    case 'quick_reply':
      // Send quick reply buttons
      const buttonsContent = replaceVariables(nodeData.content || nodeData.message, variables);
      const buttonsMessage = await prisma.chatbotMessage.create({
        data: {
          conversationId: conversation.id,
          sender: 'bot',
          messageType: 'button',
          content: buttonsContent,
          buttonOptions: nodeData.buttons || []
        }
      });
      messages.push(buttonsMessage);

      // If user clicked a button, find the next node
      if (buttonId) {
        const selectedButton = nodeData.buttons?.find(b => b.id === buttonId);
        if (selectedButton) {
          nextNodeId = selectedButton.nextNodeId;

          // Store button value if variable is set
          if (selectedButton.variable) {
            variables[selectedButton.variable] = selectedButton.value || selectedButton.label;
          }
        }
      } else {
        // Wait for user to click button
        nextNodeId = conversation.currentNodeId;
      }
      break;

    case 'ask_input':
      // Ask for user input
      if (!userInput && conversation.currentNodeId === node.id) {
        // Still waiting for input, send prompt again
        const promptMessage = await prisma.chatbotMessage.create({
          data: {
            conversationId: conversation.id,
            sender: 'bot',
            messageType: 'text',
            content: replaceVariables(nodeData.question || nodeData.content, variables)
          }
        });
        messages.push(promptMessage);
        nextNodeId = node.id; // Stay on this node
      } else {
        // Input received, validate and store
        const validationType = nodeData.validationType || 'text';
        const isValid = validateInput(userInput, validationType);

        if (!isValid) {
          // Send error message
          const errorMessage = await prisma.chatbotMessage.create({
            data: {
              conversationId: conversation.id,
              sender: 'bot',
              messageType: 'text',
              content: nodeData.errorMessage || 'Invalid input. Please try again.'
            }
          });
          messages.push(errorMessage);
          nextNodeId = node.id; // Stay on this node
        } else {
          // Store variable
          const variableName = nodeData.variableName || 'input';
          variables[variableName] = userInput;

          // Send confirmation if configured
          if (nodeData.confirmationMessage) {
            const confirmMessage = await prisma.chatbotMessage.create({
              data: {
                conversationId: conversation.id,
                sender: 'bot',
                messageType: 'text',
                content: replaceVariables(nodeData.confirmationMessage, variables)
              }
            });
            messages.push(confirmMessage);
          }

          nextNodeId = getNextNodeId(node.id, edges);
        }
      }
      break;

    case 'condition':
      // Evaluate condition and branch
      const variable = nodeData.variable;
      const operator = nodeData.operator || 'equals';
      const value = nodeData.value;
      const variableValue = variables[variable];

      let conditionMet = false;

      switch (operator) {
        case 'equals':
          conditionMet = variableValue == value;
          break;
        case 'contains':
          conditionMet = String(variableValue).includes(value);
          break;
        case 'greater_than':
          conditionMet = Number(variableValue) > Number(value);
          break;
        case 'less_than':
          conditionMet = Number(variableValue) < Number(value);
          break;
        case 'exists':
          conditionMet = variableValue !== undefined && variableValue !== null && variableValue !== '';
          break;
      }

      nextNodeId = conditionMet ? nodeData.trueNodeId : nodeData.falseNodeId;
      break;

    case 'delay':
      // Simulate delay (in real implementation, would use queue/scheduler)
      const delayMessage = await prisma.chatbotMessage.create({
        data: {
          conversationId: conversation.id,
          sender: 'bot',
          messageType: 'delay',
          content: `⏳ ${nodeData.seconds || 2}s`
        }
      });
      messages.push(delayMessage);
      nextNodeId = getNextNodeId(node.id, edges);
      break;

    case 'image':
      // Send image
      const imageMessage = await prisma.chatbotMessage.create({
        data: {
          conversationId: conversation.id,
          sender: 'bot',
          messageType: 'image',
          content: nodeData.imageUrl
        }
      });
      messages.push(imageMessage);
      nextNodeId = getNextNodeId(node.id, edges);
      break;

    case 'action_add_to_crm':
      // Add contact to CRM (would integrate with actual CRM in real implementation)
      // For now, just proceed to next node
      nextNodeId = getNextNodeId(node.id, edges);
      break;

    case 'action_send_email':
      // Send email (would integrate with email service in real implementation)
      // For now, just proceed to next node
      nextNodeId = getNextNodeId(node.id, edges);
      break;

    case 'action_handoff_ai':
      // Hand off to SUPERNova AI
      const handoffMessage = await prisma.chatbotMessage.create({
        data: {
          conversationId: conversation.id,
          sender: 'bot',
          messageType: 'text',
          content: '🤖 Let me connect you with SUPERNova AI for personalized assistance...'
        }
      });
      messages.push(handoffMessage);
      status = 'handed_off_to_ai';
      nextNodeId = null;
      break;

    case 'end':
      // End conversation
      const endMessage = await prisma.chatbotMessage.create({
        data: {
          conversationId: conversation.id,
          sender: 'bot',
          messageType: 'text',
          content: nodeData.message || "Thanks for chatting! 👋"
        }
      });
      messages.push(endMessage);
      status = 'completed';
      nextNodeId = null;
      break;

    default:
      // Unknown node type, just move to next
      nextNodeId = getNextNodeId(node.id, edges);
  }

  // Update conversation with new state
  await prisma.chatbotConversation.update({
    where: { id: conversation.id },
    data: {
      currentNodeId: nextNodeId,
      variables,
      status,
      ...(status === 'completed' && { completedAt: new Date() })
    }
  });

  // If there's a next node and it's not waiting for input, execute it
  if (nextNodeId && nextNodeId !== conversation.currentNodeId) {
    const nextNode = nodes.find(n => n.id === nextNodeId);
    const nextResult = await executeNode(nextNode, { ...conversation, currentNodeId: nextNodeId, variables }, '', null, nodes, edges);

    return {
      messages: [...messages, ...nextResult.messages],
      variables: nextResult.variables,
      status: nextResult.status
    };
  }

  return {
    messages,
    variables,
    status
  };
}

/**
 * Replace {{variable}} placeholders with actual values
 */
function replaceVariables(text, variables) {
  if (!text) return text;

  return text.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
    return variables[varName] || match;
  });
}

/**
 * Validate user input based on type
 */
function validateInput(input, type) {
  if (!input || input.trim() === '') return false;

  switch (type) {
    case 'email':
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(input);

    case 'phone':
      const phoneRegex = /^[\d\s\-\+\(\)]+$/;
      return phoneRegex.test(input) && input.replace(/\D/g, '').length >= 10;

    case 'number':
      return !isNaN(input) && input.trim() !== '';

    case 'text':
    default:
      return input.trim().length > 0;
  }
}

/**
 * Get the next node ID from edges
 */
function getNextNodeId(currentNodeId, edges) {
  const edge = edges.find(e => e.source === currentNodeId);
  return edge ? edge.target : null;
}

export default {
  processUserMessage
};
