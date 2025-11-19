/**
 * SUPERNova AI Business Advisor - Advisor Chat Service
 *
 * Manages AI advisor chat:
 * - AI-powered business advice using Claude
 * - Context-aware responses
 * - Conversation history
 * - Follow-up suggestions
 * - Action item extraction
 */

import wixData from 'wix-data';
import { fetch } from 'wix-fetch';
import { getBusinessDataSummary } from './businessProfileService';
import { getCurrentHealthScore } from './businessHealthService';
import { getPriorityInsights } from './businessInsightService';

// ============================================================================
// Configuration
// ============================================================================

const COLLECTIONS = {
  ADVISOR_CONVERSATIONS: 'AdvisorConversations'
};

// Claude API configuration
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const CLAUDE_API_KEY = 'YOUR_ANTHROPIC_API_KEY'; // Store in Wix Secrets
const CLAUDE_MODEL = 'claude-3-5-sonnet-20241022';

// ============================================================================
// AI Chat
// ============================================================================

/**
 * Ask the AI advisor a question
 * @param {string} userId - User ID
 * @param {string} question - User's question
 * @param {string} conversationThread - Optional thread ID for follow-ups
 * @returns {Promise<Object>} Conversation record with AI response
 */
export async function askAdvisor(userId, question, conversationThread = null) {
  try {
    const startTime = Date.now();

    // Gather context for the AI
    const context = await gatherContext(userId, conversationThread);

    // Build the prompt
    const systemPrompt = buildSystemPrompt();
    const userPrompt = buildUserPrompt(question, context);

    // Call Claude API
    const response = await callClaudeAPI(systemPrompt, userPrompt);

    const responseTime = Date.now() - startTime;

    // Extract action items and follow-up questions
    const actionItems = extractActionItems(response.content);
    const followUpQuestions = generateFollowUpQuestions(question, response.content, context);

    // Categorize the question
    const category = categorizeQuestion(question);

    // Create conversation record
    const threadId = conversationThread || generateThreadId();

    const conversation = {
      userId,
      question,
      context,
      response: response.content,
      category,
      followUpQuestions,
      actionItems,
      dataSources: context.dataSources,
      helpful: null,
      followedUp: false,
      conversationThread: threadId,
      tokensUsed: response.usage?.total_tokens || 0,
      responseTime,
      createdAt: new Date()
    };

    const saved = await wixData.insert(COLLECTIONS.ADVISOR_CONVERSATIONS, conversation);

    return saved;
  } catch (error) {
    console.error('Error asking advisor:', error);
    throw new Error(`Failed to get advisor response: ${error.message}`);
  }
}

/**
 * Gather business context for AI
 * @param {string} userId - User ID
 * @param {string} conversationThread - Conversation thread ID
 * @returns {Promise<Object>} Context object
 */
async function gatherContext(userId, conversationThread) {
  try {
    const context = {
      dataSources: []
    };

    // Get business profile
    const businessData = await getBusinessDataSummary(userId);
    if (businessData) {
      context.business = {
        name: businessData.profile?.businessName,
        industry: businessData.profile?.industry,
        model: businessData.profile?.businessModel,
        monthlyRevenue: businessData.profile?.monthlyRevenue,
        targetRevenue: businessData.profile?.targetRevenue,
        yearsInBusiness: businessData.profile?.yearsInBusiness,
        employeeCount: businessData.profile?.employeeCount
      };
      context.revenue = businessData.revenue;
      context.customers = businessData.customers;
      context.marketing = businessData.marketing;
      context.products = businessData.products;
      context.goals = businessData.goals;
      context.strengths = businessData.strengths;
      context.weaknesses = businessData.weaknesses;
      context.opportunities = businessData.opportunities;
      context.threats = businessData.threats;
      context.dataSources.push('Business Profile');
    }

    // Get health score
    const healthScore = await getCurrentHealthScore(userId);
    if (healthScore) {
      context.health = {
        overall: healthScore.overallScore,
        status: healthScore.healthStatus,
        revenue: healthScore.revenueScore,
        growth: healthScore.growthScore,
        customer: healthScore.customerScore,
        marketing: healthScore.marketingScore,
        operations: healthScore.operationsScore,
        profitability: healthScore.profitabilityScore
      };
      context.dataSources.push('Health Score');
    }

    // Get priority insights
    const insights = await getPriorityInsights(userId);
    if (insights && insights.length > 0) {
      context.insights = insights.map(i => ({
        category: i.category,
        priority: i.priority,
        title: i.title,
        insight: i.insight,
        recommendation: i.recommendation
      }));
      context.dataSources.push('Business Insights');
    }

    // Get conversation history if in a thread
    if (conversationThread) {
      const history = await getConversationHistory(conversationThread, 5);
      if (history.length > 0) {
        context.conversationHistory = history.map(c => ({
          question: c.question,
          response: c.response
        }));
        context.dataSources.push('Conversation History');
      }
    }

    return context;
  } catch (error) {
    console.error('Error gathering context:', error);
    return { dataSources: [] };
  }
}

/**
 * Build system prompt for Claude
 * @returns {string} System prompt
 */
function buildSystemPrompt() {
  return `You are an expert business advisor with deep expertise in:
- Business strategy and growth
- Marketing and customer acquisition
- Revenue optimization
- Operations and efficiency
- Financial management
- Product development
- Competitive analysis

Your role is to provide strategic, actionable business advice to entrepreneurs and business owners.

IMPORTANT GUIDELINES:
1. Always base advice on the user's actual business data when available
2. Be specific and actionable - no generic advice
3. Quantify impact where possible (e.g., "could increase revenue by £X")
4. Consider the user's constraints (time, budget, resources)
5. Prioritize high-impact, low-effort opportunities
6. Be direct and honest - point out risks and problems clearly
7. Ask clarifying questions when you need more information
8. Reference specific data points from their business
9. Suggest concrete next steps
10. Balance growth with sustainability

Keep responses concise but comprehensive. Use clear structure (headings, bullet points) for readability.`;
}

/**
 * Build user prompt with context
 * @param {string} question - User's question
 * @param {Object} context - Business context
 * @returns {string} User prompt
 */
function buildUserPrompt(question, context) {
  let prompt = `BUSINESS CONTEXT:\n\n`;

  // Business info
  if (context.business) {
    prompt += `Business: ${context.business.name}\n`;
    prompt += `Industry: ${context.business.industry}\n`;
    prompt += `Model: ${context.business.model}\n`;
    prompt += `Monthly Revenue: £${context.business.monthlyRevenue?.toLocaleString() || 0}\n`;
    prompt += `Target Revenue: £${context.business.targetRevenue?.toLocaleString() || 0}\n`;
    prompt += `Years in Business: ${context.business.yearsInBusiness || 0}\n`;
    prompt += `Team Size: ${context.business.employeeCount || 0}\n\n`;
  }

  // Health score
  if (context.health) {
    prompt += `BUSINESS HEALTH SCORE:\n`;
    prompt += `Overall: ${context.health.overall}/100 (${context.health.status})\n`;
    prompt += `Revenue: ${context.health.revenue}/100\n`;
    prompt += `Growth: ${context.health.growth}/100\n`;
    prompt += `Customer: ${context.health.customer}/100\n`;
    prompt += `Marketing: ${context.health.marketing}/100\n\n`;
  }

  // Key metrics
  if (context.revenue || context.customers || context.marketing) {
    prompt += `KEY METRICS:\n`;
    if (context.revenue) {
      prompt += `Revenue Trend: ${context.revenue.trend || 'unknown'}\n`;
      prompt += `Growth Rate: ${context.revenue.growth || 0}%\n`;
    }
    if (context.customers) {
      prompt += `Total Customers: ${context.customers.total || 0}\n`;
      prompt += `Churn Rate: ${context.customers.churnRate || 0}%\n`;
    }
    if (context.marketing) {
      prompt += `Conversion Rate: ${context.marketing.conversionRate || 0}%\n`;
      prompt += `Website Visitors: ${context.marketing.websiteVisitors || 0}/month\n`;
    }
    prompt += `\n`;
  }

  // Priority insights
  if (context.insights && context.insights.length > 0) {
    prompt += `CURRENT PRIORITY INSIGHTS:\n`;
    context.insights.slice(0, 3).forEach((insight, i) => {
      prompt += `${i + 1}. [${insight.priority.toUpperCase()}] ${insight.title}\n`;
      prompt += `   ${insight.insight}\n\n`;
    });
  }

  // SWOT
  if (context.strengths || context.weaknesses || context.opportunities || context.threats) {
    prompt += `SWOT ANALYSIS:\n`;
    if (context.strengths?.length > 0) {
      prompt += `Strengths: ${context.strengths.join(', ')}\n`;
    }
    if (context.weaknesses?.length > 0) {
      prompt += `Weaknesses: ${context.weaknesses.join(', ')}\n`;
    }
    if (context.opportunities?.length > 0) {
      prompt += `Opportunities: ${context.opportunities.join(', ')}\n`;
    }
    if (context.threats?.length > 0) {
      prompt += `Threats: ${context.threats.join(', ')}\n`;
    }
    prompt += `\n`;
  }

  // Goals
  if (context.goals && context.goals.length > 0) {
    prompt += `GOALS:\n`;
    context.goals.forEach(goal => {
      prompt += `- ${goal}\n`;
    });
    prompt += `\n`;
  }

  // Conversation history
  if (context.conversationHistory && context.conversationHistory.length > 0) {
    prompt += `RECENT CONVERSATION:\n`;
    context.conversationHistory.forEach(conv => {
      prompt += `User: ${conv.question}\n`;
      prompt += `Advisor: ${conv.response}\n\n`;
    });
  }

  prompt += `USER QUESTION:\n${question}`;

  return prompt;
}

/**
 * Call Claude API
 * @param {string} systemPrompt - System prompt
 * @param {string} userPrompt - User prompt
 * @returns {Promise<Object>} API response
 */
async function callClaudeAPI(systemPrompt, userPrompt) {
  try {
    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 2048,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status}`);
    }

    const data = await response.json();

    return {
      content: data.content[0].text,
      usage: data.usage
    };
  } catch (error) {
    console.error('Error calling Claude API:', error);
    throw new Error(`Failed to get AI response: ${error.message}`);
  }
}

/**
 * Extract action items from AI response
 * @param {string} response - AI response text
 * @returns {Array} Action items
 */
function extractActionItems(response) {
  const actionItems = [];

  // Look for numbered lists, bullet points, or "action" sections
  const lines = response.split('\n');

  lines.forEach(line => {
    const trimmed = line.trim();

    // Match numbered items (1., 2., etc.)
    if (/^\d+\.\s/.test(trimmed)) {
      const item = trimmed.replace(/^\d+\.\s/, '').trim();
      if (item.length > 10 && item.length < 200) {
        actionItems.push(item);
      }
    }

    // Match bullet points
    if (/^[-•*]\s/.test(trimmed)) {
      const item = trimmed.replace(/^[-•*]\s/, '').trim();
      if (item.length > 10 && item.length < 200) {
        actionItems.push(item);
      }
    }
  });

  return actionItems.slice(0, 10); // Max 10 action items
}

/**
 * Generate follow-up questions
 * @param {string} question - Original question
 * @param {string} response - AI response
 * @param {Object} context - Business context
 * @returns {Array} Follow-up questions
 */
function generateFollowUpQuestions(question, response, context) {
  const followUps = [];

  // Generic follow-ups based on question type
  if (question.toLowerCase().includes('revenue') || question.toLowerCase().includes('sales')) {
    followUps.push('What are my best-performing products?');
    followUps.push('How can I increase my average order value?');
    followUps.push('Should I raise my prices?');
  }

  if (question.toLowerCase().includes('marketing') || question.toLowerCase().includes('traffic')) {
    followUps.push('Which marketing channel should I focus on?');
    followUps.push('How can I improve my conversion rate?');
    followUps.push('What content should I create?');
  }

  if (question.toLowerCase().includes('grow') || question.toLowerCase().includes('scale')) {
    followUps.push('What should I focus on first?');
    followUps.push('Do I need to hire anyone?');
    followUps.push('Should I launch new products?');
  }

  // Generic helpful follow-ups
  if (followUps.length === 0) {
    followUps.push('Can you explain this in more detail?');
    followUps.push('What should I do first?');
    followUps.push('What are the risks?');
  }

  return followUps.slice(0, 3);
}

/**
 * Categorize question
 * @param {string} question - User's question
 * @returns {string} Category
 */
function categorizeQuestion(question) {
  const lower = question.toLowerCase();

  if (lower.includes('revenue') || lower.includes('sales') || lower.includes('money')) {
    return 'revenue';
  }
  if (lower.includes('marketing') || lower.includes('traffic') || lower.includes('ads')) {
    return 'marketing';
  }
  if (lower.includes('product') || lower.includes('service') || lower.includes('offer')) {
    return 'product';
  }
  if (lower.includes('customer') || lower.includes('client') || lower.includes('retention')) {
    return 'customer';
  }
  if (lower.includes('grow') || lower.includes('scale') || lower.includes('expand')) {
    return 'strategy';
  }
  if (lower.includes('team') || lower.includes('hire') || lower.includes('process')) {
    return 'operations';
  }

  return 'general';
}

/**
 * Generate thread ID
 * @returns {string} Thread ID
 */
function generateThreadId() {
  return `thread_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// ============================================================================
// Conversation Management
// ============================================================================

/**
 * Get conversation history
 * @param {string} conversationThread - Thread ID
 * @param {number} limit - Number of messages to retrieve
 * @returns {Promise<Array>} Conversation history
 */
export async function getConversationHistory(conversationThread, limit = 10) {
  try {
    const results = await wixData.query(COLLECTIONS.ADVISOR_CONVERSATIONS)
      .eq('conversationThread', conversationThread)
      .descending('createdAt')
      .limit(limit)
      .find();

    return results.items.reverse(); // Chronological order
  } catch (error) {
    console.error('Error getting conversation history:', error);
    throw error;
  }
}

/**
 * Get all conversations for user
 * @param {string} userId - User ID
 * @param {number} limit - Number of conversations to retrieve
 * @returns {Promise<Array>} Conversations
 */
export async function getUserConversations(userId, limit = 50) {
  try {
    const results = await wixData.query(COLLECTIONS.ADVISOR_CONVERSATIONS)
      .eq('userId', userId)
      .descending('createdAt')
      .limit(limit)
      .find();

    return results.items;
  } catch (error) {
    console.error('Error getting user conversations:', error);
    throw error;
  }
}

/**
 * Mark conversation as helpful/not helpful
 * @param {string} conversationId - Conversation ID
 * @param {boolean} helpful - Was it helpful?
 * @returns {Promise<Object>} Updated conversation
 */
export async function markHelpful(conversationId, helpful) {
  try {
    const conversation = await wixData.get(COLLECTIONS.ADVISOR_CONVERSATIONS, conversationId);
    conversation.helpful = helpful;

    const updated = await wixData.update(COLLECTIONS.ADVISOR_CONVERSATIONS, conversation);
    return updated;
  } catch (error) {
    console.error('Error marking conversation helpful:', error);
    throw error;
  }
}

/**
 * Delete conversation
 * @param {string} conversationId - Conversation ID
 * @returns {Promise<void>}
 */
export async function deleteConversation(conversationId) {
  try {
    await wixData.remove(COLLECTIONS.ADVISOR_CONVERSATIONS, conversationId);
  } catch (error) {
    console.error('Error deleting conversation:', error);
    throw error;
  }
}

export default {
  askAdvisor,
  getConversationHistory,
  getUserConversations,
  markHelpful,
  deleteConversation
};
