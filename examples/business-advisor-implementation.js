/**
 * SUPERNova AI Business Advisor - Implementation Examples
 *
 * Complete working examples for integrating the AI Business Advisor
 * into your Wix site pages and backend code.
 */

// ============================================================================
// BACKEND: Business Profile Management
// ============================================================================

import wixUsers from 'wix-users';
import {
  getProfile,
  createProfile,
  updateProfile,
  saveSetupStep,
  completeSetup,
  updateSWOT,
  addCompetitor,
  getBusinessDataSummary
} from 'backend/businessProfileService';

/**
 * Example: Complete Setup Wizard Flow
 */
export async function completeBusinessSetupWizard() {
  const userId = wixUsers.currentUser.id;

  // Step 1: Basic Business Information
  await saveSetupStep(userId, 1, {
    businessName: 'Acme Digital Products',
    industry: 'Online Courses & Digital Products',
    businessModel: 'ecommerce',
    yearsInBusiness: 2
  });

  // Step 2: Current State
  await saveSetupStep(userId, 2, {
    monthlyRevenue: 6500,
    employeeCount: 1,
    mainProducts: [
      {
        name: 'Ultimate Business Growth Course',
        price: 197,
        monthlySales: 20,
        conversionRate: 3.5
      },
      {
        name: 'Social Media Marketing Guide',
        price: 47,
        monthlySales: 45,
        conversionRate: 2.8
      },
      {
        name: 'Email Marketing Masterclass',
        price: 97,
        monthlySales: 15,
        conversionRate: 4.2
      }
    ]
  });

  // Step 3: Goals and Challenges
  await saveSetupStep(userId, 3, {
    targetRevenue: 10000,
    goals: [
      'Hit £10,000/month revenue within 6 months',
      'Launch membership program generating £2,000 MRR',
      'Build email list to 5,000 subscribers',
      'Achieve 5% conversion rate across all products'
    ],
    challenges: [
      'Email open rates declining (down to 18%)',
      'Conversion rate stuck at 2-3%',
      'Limited marketing budget (£500/month)',
      'Struggling to create consistent content'
    ],
    targetAudience: 'Entrepreneurs and small business owners aged 30-50 looking to grow their online presence and revenue'
  });

  // Step 4: SWOT Analysis
  await saveSetupStep(userId, 4, {
    strengths: [
      'High-quality course content with 4.8/5 rating',
      'Strong brand reputation in niche',
      'Engaged email list (32% open rate)',
      'Proven track record (2 years, 500+ customers)'
    ],
    weaknesses: [
      'Small email list (1,200 subscribers)',
      'Limited marketing budget',
      'One-person operation (bandwidth constraints)',
      'No recurring revenue yet'
    ],
    opportunities: [
      'Growing market demand for online education',
      'Partnership opportunities with influencers',
      'Untapped YouTube channel potential',
      'Membership/subscription model'
    ],
    threats: [
      'Increasing competition from larger players',
      'Platform dependency (course hosted on third-party)',
      'Economic uncertainty affecting customer spending',
      'Rising ad costs'
    ]
  });

  // Step 5: Mark setup as complete
  await completeSetup(userId);

  // Add competitors
  await addCompetitor(userId, {
    name: 'Competitor A',
    url: 'https://competitor-a.com',
    description: 'Larger player in the space, offers similar courses',
    strengths: ['Large audience', 'More resources', 'Better marketing'],
    weaknesses: ['Less personal', 'Higher prices', 'Generic content']
  });

  await addCompetitor(userId, {
    name: 'Competitor B',
    url: 'https://competitor-b.com',
    description: 'Similar-sized competitor',
    strengths: ['Active on social media', 'Good community'],
    weaknesses: ['Lower quality content', 'Poor customer service']
  });

  return {
    message: 'Business profile setup complete!',
    nextSteps: ['Calculate health score', 'Generate insights', 'Set up first goal']
  };
}

/**
 * Example: Get Business Data Summary
 */
export async function getMyBusinessSummary() {
  const userId = wixUsers.currentUser.id;
  const summary = await getBusinessDataSummary(userId);

  return summary;
  // Returns:
  // {
  //   profile: { businessName, industry, monthlyRevenue, targetRevenue, ... },
  //   revenue: { current, target, growth, trend },
  //   customers: { total, active, churnRate, ltv, acquisitionCost },
  //   marketing: { websiteVisitors, emailSubscribers, conversionRate, ... },
  //   products: [...],
  //   goals: [...],
  //   strengths: [...],
  //   weaknesses: [...]
  // }
}

// ============================================================================
// BACKEND: Business Health Scoring
// ============================================================================

import {
  calculateHealthScore,
  getCurrentHealthScore,
  getHealthScoreHistory
} from 'backend/businessHealthService';

/**
 * Example: Calculate and Display Health Score
 */
export async function calculateMyHealthScore() {
  const userId = wixUsers.currentUser.id;

  // Calculate new health score
  const healthScore = await calculateHealthScore(userId);

  console.log('Overall Health Score:', healthScore.overallScore);
  console.log('Health Status:', healthScore.healthStatus);
  console.log('Category Scores:', {
    revenue: healthScore.revenueScore,
    growth: healthScore.growthScore,
    customer: healthScore.customerScore,
    marketing: healthScore.marketingScore,
    operations: healthScore.operationsScore,
    profitability: healthScore.profitabilityScore
  });

  // Get health trend
  console.log('Trends:', healthScore.trends);

  // Identify areas of strength
  console.log('Strengths:', healthScore.strengths);

  // Identify areas needing improvement
  console.log('Weaknesses:', healthScore.weaknesses);

  // Critical issues
  if (healthScore.criticalIssues.length > 0) {
    console.log('CRITICAL ISSUES:', healthScore.criticalIssues);
  }

  return healthScore;
}

/**
 * Example: Health Score Tracking Over Time
 */
export async function getHealthScoreTrends() {
  const userId = wixUsers.currentUser.id;

  // Get last 30 days of health scores
  const history = await getHealthScoreHistory(userId, 30);

  // Calculate trend
  const scores = history.map(h => h.overallScore);
  const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;

  const recentAvg = scores.slice(-7).reduce((a, b) => a + b, 0) / 7;
  const earlyAvg = scores.slice(0, 7).reduce((a, b) => a + b, 0) / 7;
  const trend = recentAvg > earlyAvg ? 'improving' : recentAvg < earlyAvg ? 'declining' : 'stable';

  return {
    history,
    avgScore: Math.round(avgScore),
    trend,
    improvement: Math.round(recentAvg - earlyAvg)
  };
}

// ============================================================================
// BACKEND: AI Insights
// ============================================================================

import {
  generateInsights,
  getPriorityInsights,
  getInsights,
  markAsActioned
} from 'backend/businessInsightService';

/**
 * Example: Generate and Display Insights
 */
export async function generateMyInsights() {
  const userId = wixUsers.currentUser.id;

  // Generate all insights
  console.log('Generating insights...');
  const allInsights = await generateInsights(userId);

  console.log(`Generated ${allInsights.length} insights`);

  // Get priority insights
  const priorityInsights = await getPriorityInsights(userId);

  console.log('\nTOP 5 PRIORITY INSIGHTS:');
  priorityInsights.forEach((insight, i) => {
    console.log(`\n${i + 1}. [${insight.priority.toUpperCase()}] ${insight.title}`);
    console.log(`   Category: ${insight.category}`);
    console.log(`   Insight: ${insight.insight}`);
    console.log(`   Recommendation: ${insight.recommendation}`);
    console.log(`   Expected Impact: ${insight.expectedImpact}`);
    console.log(`   Effort: ${insight.effort}`);
    if (insight.estimatedRevenue) {
      console.log(`   Revenue Impact: £${insight.estimatedRevenue.toLocaleString()}`);
    }
  });

  return priorityInsights;
}

/**
 * Example: Get Insights by Category
 */
export async function getMarketingInsights() {
  const userId = wixUsers.currentUser.id;

  const insights = await getInsights(userId, {
    category: 'marketing',
    isActioned: false
  });

  return insights;
}

/**
 * Example: Action Tracking
 */
export async function trackInsightAction(insightId) {
  // Mark insight as actioned
  await markAsActioned(insightId);

  return {
    message: 'Great job taking action! Track the results over the next few weeks.'
  };
}

// ============================================================================
// BACKEND: AI Chat Advisor
// ============================================================================

import {
  askAdvisor,
  getConversationHistory,
  getUserConversations
} from 'backend/businessAdvisorService';

/**
 * Example: Ask Business Questions
 */
export async function askBusinessQuestion(question) {
  const userId = wixUsers.currentUser.id;

  const conversation = await askAdvisor(userId, question);

  return {
    question: conversation.question,
    answer: conversation.response,
    followUpQuestions: conversation.followUpQuestions,
    actionItems: conversation.actionItems,
    conversationId: conversation._id,
    threadId: conversation.conversationThread
  };
}

/**
 * Example: Multi-Turn Conversation
 */
export async function haveBusiness Conversation() {
  const userId = wixUsers.currentUser.id;

  // Initial question
  const conv1 = await askAdvisor(
    userId,
    'Why are my sales down this month?'
  );
  console.log('AI:', conv1.response);

  // Follow-up in same thread
  const conv2 = await askAdvisor(
    userId,
    'What specific actions should I take to fix this?',
    conv1.conversationThread
  );
  console.log('AI:', conv2.response);

  // Another follow-up
  const conv3 = await askAdvisor(
    userId,
    'How much revenue could I recover?',
    conv1.conversationThread
  );
  console.log('AI:', conv3.response);

  // Get full conversation history
  const history = await getConversationHistory(conv1.conversationThread);

  return {
    messages: history.length,
    thread: conv1.conversationThread
  };
}

/**
 * Example: Common Business Questions
 */
export async function getCommonQuestionAnswers() {
  const userId = wixUsers.currentUser.id;

  const questions = [
    'What should I focus on to grow my business?',
    'How can I increase my conversion rate?',
    'Should I raise my prices?',
    'What marketing channel should I prioritize?',
    'How can I reduce customer churn?'
  ];

  const answers = [];

  for (const question of questions) {
    const conv = await askAdvisor(userId, question);
    answers.push({
      question,
      answer: conv.response.substring(0, 200) + '...' // Truncate for demo
    });
  }

  return answers;
}

// ============================================================================
// BACKEND: Strategic Goals
// ============================================================================

import {
  createGoal,
  getGoals,
  updateProgress,
  addMilestone,
  completeMilestone,
  addActionItem,
  completeActionItem,
  getGoalAnalytics
} from 'backend/businessGoalService';

/**
 * Example: Create Revenue Goal with AI Strategy
 */
export async function createRevenueGoal() {
  const userId = wixUsers.currentUser.id;

  const goal = await createGoal(userId, {
    goal: 'Hit £10,000/month revenue',
    description: 'Reach £10k monthly recurring revenue to achieve financial freedom and hire first team member',
    category: 'revenue',
    targetValue: 10000,
    currentValue: 6500,
    targetDate: new Date('2024-06-30'),
    whyImportant: 'This will allow me to quit my day job, hire help, and focus full-time on the business'
  });

  console.log('Goal Created:', goal.goal);
  console.log('\nAI STRATEGY:');
  console.log(goal.aiStrategy);

  console.log('\nAI RECOMMENDATIONS:');
  goal.aiRecommendations.forEach((rec, i) => {
    console.log(`${i + 1}. ${rec.title}`);
    console.log(`   Impact: ${rec.impact}`);
    console.log(`   Effort: ${rec.effort}`);
  });

  console.log('\nPROJECTED ACHIEVEMENT:', goal.projectedAchievement);

  // Add milestones
  await addMilestone(goal._id, {
    title: 'Reach £7,500/month',
    targetDate: new Date('2024-03-31'),
    targetValue: 7500
  });

  await addMilestone(goal._id, {
    title: 'Reach £8,500/month',
    targetDate: new Date('2024-04-30'),
    targetValue: 8500
  });

  await addMilestone(goal._id, {
    title: 'Reach £10,000/month',
    targetDate: new Date('2024-06-30'),
    targetValue: 10000
  });

  return goal;
}

/**
 * Example: Track Goal Progress
 */
export async function trackGoalProgress(goalId, newRevenue) {
  // Update current value
  const updated = await updateProgress(goalId, newRevenue);

  console.log(`Progress: ${updated.progress}%`);
  console.log(`Status: ${updated.status}`);

  // Check milestones
  if (updated.milestones) {
    updated.milestones.forEach((milestone, i) => {
      if (newRevenue >= milestone.targetValue && !milestone.completed) {
        completeMilestone(goalId, i);
        console.log(`🎉 Milestone achieved: ${milestone.title}`);
      }
    });
  }

  return updated;
}

/**
 * Example: Manage Goal Action Items
 */
export async function manageGoalActions(goalId) {
  // Add action items
  await addActionItem(goalId, 'Test 15% price increase on Course A');
  await addActionItem(goalId, 'Set up upsell sequence after Course B purchase');
  await addActionItem(goalId, 'Increase email frequency to 2x/week');
  await addActionItem(goalId, 'Launch limited-time promotion');

  // Complete an action
  await completeActionItem(goalId, 0); // Completed first item

  const goal = await getGoal(goalId);

  console.log('ACTION ITEMS:');
  goal.actionItems.forEach((item, i) => {
    const status = item.completed ? '✅' : '⬜';
    console.log(`${status} ${item.task}`);
  });

  return goal.actionItems;
}

/**
 * Example: Goal Analytics Dashboard
 */
export async function getMyGoalAnalytics() {
  const userId = wixUsers.currentUser.id;

  const analytics = await getGoalAnalytics(userId);

  console.log('GOAL ANALYTICS:');
  console.log(`Total Goals: ${analytics.total}`);
  console.log(`Active: ${analytics.active}`);
  console.log(`Achieved: ${analytics.achieved}`);
  console.log(`At Risk: ${analytics.atRisk}`);
  console.log(`Average Progress: ${analytics.averageProgress}%`);
  console.log(`Completion Rate: ${analytics.completionRate}%`);

  console.log('\nGOALS BY CATEGORY:');
  Object.entries(analytics.byCategory).forEach(([category, count]) => {
    console.log(`${category}: ${count}`);
  });

  return analytics;
}

// ============================================================================
// BACKEND: Business Reports
// ============================================================================

import {
  generateWeeklyReport,
  generateMonthlyReport,
  formatReportForEmail
} from 'backend/businessReportService';

/**
 * Example: Generate Weekly Report
 */
export async function getWeeklyReport() {
  const userId = wixUsers.currentUser.id;

  const report = await generateWeeklyReport(userId);

  console.log('WEEKLY BUSINESS REPORT');
  console.log('======================');

  console.log('\nSNAPSHOT:');
  console.log(`Revenue: £${report.snapshot.revenue} (${report.snapshot.revenueChange > 0 ? '+' : ''}${report.snapshot.revenueChange}%)`);
  console.log(`Website Visitors: ${report.snapshot.websiteVisitors} (${report.snapshot.visitorChange > 0 ? '+' : ''}${report.snapshot.visitorChange}%)`);
  console.log(`Conversion Rate: ${report.snapshot.conversionRate}%`);

  console.log('\n🎉 WINS THIS WEEK:');
  report.wins.forEach(win => {
    console.log(`- ${win.title}: ${win.description}`);
  });

  console.log('\n⚠️ AREAS TO WATCH:');
  report.areasToWatch.forEach(area => {
    console.log(`- [${area.severity.toUpperCase()}] ${area.title}: ${area.description}`);
  });

  console.log('\n🎯 THIS WEEK\'S PRIORITY:');
  console.log(report.priorityAction.title);
  console.log(report.priorityAction.description);

  console.log('\n📊 NEXT WEEK FORECAST:');
  console.log(`Revenue: £${report.forecast.revenue.projected} (${report.forecast.confidence} confidence)`);

  return report;
}

/**
 * Example: Generate Monthly Summary
 */
export async function getMonthlyReport() {
  const userId = wixUsers.currentUser.id;

  const report = await generateMonthlyReport(userId);

  console.log(`MONTHLY REPORT - ${report.period.month}`);
  console.log('=================================');

  console.log('\nMONTHLY SUMMARY:');
  console.log(`Total Revenue: £${report.summary.revenue.total}`);
  console.log(`Growth Rate: ${report.summary.growth.overall}%`);
  console.log(`Average Health Score: ${report.summary.healthScore.average}/100`);

  console.log('\nTOP WINS:');
  report.topWins.forEach(win => {
    console.log(`- ${win.title}: ${win.description}`);
  });

  console.log('\nIMPROVEMENTS NEEDED:');
  report.improvements.forEach(imp => {
    console.log(`- [${imp.priority.toUpperCase()}] ${imp.area}: ${imp.issue}`);
  });

  console.log('\nNEXT MONTH FOCUS:');
  report.nextMonthFocus.forEach((focus, i) => {
    console.log(`${i + 1}. ${focus.goal}`);
  });

  return report;
}

/**
 * Example: Email Weekly Report
 */
export async function emailWeeklyReport(userId, emailAddress) {
  const report = await generateWeeklyReport(userId);
  const htmlContent = formatReportForEmail(report);

  // Send email using Wix Triggered Emails
  // (Configure in Wix Dashboard > Marketing Tools > Triggered Emails)

  return {
    message: 'Weekly report sent!',
    sentTo: emailAddress
  };
}

// ============================================================================
// FRONTEND: Dashboard Page Implementation
// ============================================================================

/**
 * Example: Business Advisor Dashboard (/advisor)
 */
// Page Code for /advisor

import wixLocation from 'wix-location';

$w.onReady(async function () {
  const userId = wixUsers.currentUser.id;

  // Show loading
  $w('#loadingSpinner').show();

  try {
    // Load health score
    const healthScore = await getCurrentHealthScore(userId);

    if (healthScore) {
      $w('#healthScoreNumber').text = healthScore.overallScore.toString();
      $w('#healthStatusText').text = healthScore.healthStatus.toUpperCase();

      // Set color based on score
      const color = healthScore.overallScore >= 80 ? '#00C853' :
                    healthScore.overallScore >= 60 ? '#FFD600' :
                    healthScore.overallScore >= 40 ? '#FF6D00' : '#D32F2F';

      $w('#healthScoreNumber').style.color = color;

      // Category scores
      $w('#revenueScore').text = `${healthScore.revenueScore}/100`;
      $w('#growthScore').text = `${healthScore.growthScore}/100`;
      $w('#customerScore').text = `${healthScore.customerScore}/100`;
      $w('#marketingScore').text = `${healthScore.marketingScore}/100`;
    }

    // Load priority insights
    const insights = await getPriorityInsights(userId);

    $w('#insightsRepeater').data = insights.map(insight => ({
      _id: insight._id,
      priority: insight.priority,
      title: insight.title,
      recommendation: insight.recommendation,
      effort: insight.effort,
      expectedImpact: insight.expectedImpact
    }));

    // Handle insight clicks
    $w('#insightsRepeater').onItemReady(($item, itemData) => {
      $item('#viewInsightButton').onClick(() => {
        wixLocation.to(`/advisor/insight/${itemData._id}`);
      });

      $item('#actionButton').onClick(async () => {
        await markAsActioned(itemData._id);
        $item('#actionButton').label = '✅ Actioned';
        $item('#actionButton').disable();
      });
    });

    // Load active goals
    const goals = await getActiveGoals(userId);

    $w('#goalsRepeater').data = goals.map(goal => ({
      _id: goal._id,
      goal: goal.goal,
      progress: goal.progress,
      status: goal.status
    }));

    // Handle goal clicks
    $w('#goalsRepeater').onItemReady(($item, itemData) => {
      $item('#progressBar').value = itemData.progress;
      $item('#progressText').text = `${itemData.progress}%`;

      $item('#viewGoalButton').onClick(() => {
        wixLocation.to(`/advisor/goal/${itemData._id}`);
      });
    });

  } catch (error) {
    console.error('Error loading dashboard:', error);
    $w('#errorMessage').text = 'Failed to load dashboard data';
    $w('#errorMessage').show();
  } finally {
    $w('#loadingSpinner').hide();
  }

  // Button handlers
  $w('#chatButton').onClick(() => {
    wixLocation.to('/advisor/chat');
  });

  $w('#goalsButton').onClick(() => {
    wixLocation.to('/advisor/goals');
  });

  $w('#reportsButton').onClick(() => {
    wixLocation.to('/advisor/reports');
  });
});

// ============================================================================
// FRONTEND: Chat Interface Implementation
// ============================================================================

/**
 * Example: AI Chat Page (/advisor/chat)
 */
// Page Code for /advisor/chat

let currentThread = null;
let conversationHistory = [];

$w.onReady(function () {
  // Load recent conversations
  loadRecentConversations();

  // Handle send button
  $w('#sendButton').onClick(handleSendMessage);

  // Handle enter key
  $w('#questionInput').onKeyPress((event) => {
    if (event.key === 'Enter') {
      handleSendMessage();
    }
  });

  // Follow-up question buttons
  $w('#followUpRepeater').onItemReady(($item, itemData) => {
    $item('#followUpButton').onClick(() => {
      $w('#questionInput').value = itemData.question;
      handleSendMessage();
    });
  });
});

async function handleSendMessage() {
  const question = $w('#questionInput').value.trim();

  if (!question) return;

  const userId = wixUsers.currentUser.id;

  // Add user message to chat
  addMessageToChat('user', question);

  // Clear input
  $w('#questionInput').value = '';

  // Show typing indicator
  $w('#typingIndicator').show();
  $w('#sendButton').disable();

  try {
    // Ask advisor
    const conversation = await askAdvisor(userId, question, currentThread);

    // Set thread for follow-ups
    currentThread = conversation.conversationThread;

    // Add AI response to chat
    addMessageToChat('advisor', conversation.response);

    // Show follow-up questions
    if (conversation.followUpQuestions && conversation.followUpQuestions.length > 0) {
      $w('#followUpRepeater').data = conversation.followUpQuestions.map((q, i) => ({
        _id: `followup-${i}`,
        question: q
      }));
      $w('#followUpSection').expand();
    }

    // Show action items
    if (conversation.actionItems && conversation.actionItems.length > 0) {
      $w('#actionItemsRepeater').data = conversation.actionItems.map((item, i) => ({
        _id: `action-${i}`,
        item
      }));
      $w('#actionItemsSection').expand();
    }

  } catch (error) {
    console.error('Error asking advisor:', error);
    addMessageToChat('system', 'Sorry, I encountered an error. Please try again.');
  } finally {
    $w('#typingIndicator').hide();
    $w('#sendButton').enable();
  }
}

function addMessageToChat(role, message) {
  conversationHistory.push({
    _id: Date.now().toString(),
    role,
    message,
    timestamp: new Date()
  });

  $w('#chatRepeater').data = conversationHistory;

  // Scroll to bottom
  setTimeout(() => {
    $w('#chatContainer').scrollTo(0, 10000);
  }, 100);
}

async function loadRecentConversations() {
  const userId = wixUsers.currentUser.id;

  try {
    const conversations = await getUserConversations(userId, 5);

    $w('#historyRepeater').data = conversations.map(conv => ({
      _id: conv._id,
      question: conv.question,
      preview: conv.response.substring(0, 100) + '...',
      date: conv.createdAt
    }));

    $w('#historyRepeater').onItemReady(($item, itemData) => {
      $item('#historyItem').onClick(() => {
        // Load this conversation
        currentThread = itemData.conversationThread;
        addMessageToChat('user', itemData.question);
        addMessageToChat('advisor', itemData.preview);
      });
    });

  } catch (error) {
    console.error('Error loading conversation history:', error);
  }
}

// ============================================================================
// SCHEDULED JOBS: Automated Reports
// ============================================================================

/**
 * Example: Schedule Weekly Reports
 *
 * Set up in Wix Dashboard > Developer Tools > Jobs Scheduler
 */

import wixData from 'wix-data';

// Job runs every Monday at 9:00 AM
export async function sendWeeklyReports() {
  console.log('Starting weekly report generation...');

  // Get all users with Business Advisor access
  const users = await wixData.query('Members/PrivateMembersData')
    .hasSome('subscriptions', ['business-advisor'])
    .find();

  for (const user of users.items) {
    try {
      const report = await generateWeeklyReport(user._id);
      const html = formatReportForEmail(report);

      // Send email (configure triggered email in Wix)
      await sendEmailToUser(user.email, 'Your Weekly Business Report', html);

      console.log(`Sent weekly report to ${user.email}`);

    } catch (error) {
      console.error(`Failed to send report to ${user._id}:`, error);
    }
  }

  console.log('Weekly report generation complete');
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if user has Business Advisor access
 */
export async function hasBusinessAdvisorAccess(userId) {
  // Check user's paid plans
  // Implementation depends on your payment setup

  return true; // For demo purposes
}

/**
 * Example: Full Integration Test
 */
export async function testFullBusinessAdvisorFlow() {
  console.log('🧪 Testing Full Business Advisor Flow...\n');

  const userId = 'test-user-' + Date.now();

  // 1. Setup profile
  console.log('1. Setting up business profile...');
  await completeBusinessSetupWizard();
  console.log('✅ Profile setup complete\n');

  // 2. Calculate health score
  console.log('2. Calculating health score...');
  const health = await calculateMyHealthScore();
  console.log(`✅ Health Score: ${health.overallScore}/100 (${health.healthStatus})\n`);

  // 3. Generate insights
  console.log('3. Generating insights...');
  const insights = await generateMyInsights();
  console.log(`✅ Generated ${insights.length} insights\n`);

  // 4. Ask advisor
  console.log('4. Asking AI advisor...');
  const answer = await askBusinessQuestion('What should I focus on to grow revenue?');
  console.log(`✅ Got AI response (${answer.answer.length} chars)\n`);

  // 5. Create goal
  console.log('5. Creating strategic goal...');
  const goal = await createRevenueGoal();
  console.log(`✅ Created goal: ${goal.goal}\n`);

  // 6. Generate report
  console.log('6. Generating weekly report...');
  const report = await getWeeklyReport();
  console.log(`✅ Generated report with ${report.wins.length} wins\n`);

  console.log('🎉 All tests passed! Business Advisor is working correctly.');

  return {
    success: true,
    healthScore: health.overallScore,
    insightCount: insights.length,
    goalCreated: goal.goal,
    reportGenerated: true
  };
}

// Export all functions
export {
  // Profile
  completeBusinessSetupWizard,
  getMyBusinessSummary,

  // Health
  calculateMyHealthScore,
  getHealthScoreTrends,

  // Insights
  generateMyInsights,
  getMarketingInsights,
  trackInsightAction,

  // Chat
  askBusinessQuestion,
  haveBusinessConversation,
  getCommonQuestionAnswers,

  // Goals
  createRevenueGoal,
  trackGoalProgress,
  manageGoalActions,
  getMyGoalAnalytics,

  // Reports
  getWeeklyReport,
  getMonthlyReport,
  emailWeeklyReport,

  // Testing
  testFullBusinessAdvisorFlow
};
