# SUPERNova AI Business Advisor - Complete Implementation Guide

## Overview

The AI Business Advisor is a premium add-on (£15-20/month) that analyzes your actual business data and provides strategic, personalized recommendations. Unlike generic business advice, this system understands YOUR specific business, industry, and goals.

## Key Features

✅ **Business Health Scoring** - Real-time health score (0-100) across 6 categories
✅ **AI-Powered Insights** - Strategic recommendations based on your data
✅ **Chat with AI Advisor** - Ask questions, get personalized advice
✅ **Strategic Goal Planning** - AI-generated strategies to achieve your goals
✅ **Weekly Reports** - Automated business health reports every Monday
✅ **Competitor Analysis** - Track and compare against competitors
✅ **Scenario Planning** - Test "what-if" scenarios before making decisions

## Database Collections

### 1. BusinessProfiles
Stores business profile information and SWOT analysis.

**Key Fields:**
- `userId` - User reference
- `businessName` - Business name
- `industry` - Industry/niche
- `businessModel` - Business model (ecommerce, services, courses, etc.)
- `monthlyRevenue` - Current monthly revenue
- `targetRevenue` - Revenue goal
- `strengths`, `weaknesses`, `opportunities`, `threats` - SWOT analysis
- `goals` - Business goals
- `competitors` - Competitor list

### 2. BusinessInsights
AI-generated insights and recommendations.

**Key Fields:**
- `userId` - User reference
- `category` - Insight category (revenue, marketing, product, etc.)
- `priority` - Priority level (critical, high, medium, low)
- `title` - Insight title
- `insight` - The finding
- `recommendation` - Actionable advice
- `expectedImpact` - What happens if implemented
- `effort` - Required effort (low, medium, high)
- `estimatedRevenue` - Revenue impact estimate
- `isActioned` - Whether user has taken action

### 3. StrategicGoals
Strategic business goals with AI-generated strategies.

**Key Fields:**
- `userId` - User reference
- `goal` - Goal statement
- `category` - Goal category
- `targetValue` - Target numeric value
- `currentValue` - Current value
- `targetDate` - When to achieve by
- `progress` - Progress percentage (0-100)
- `aiStrategy` - AI-generated strategy
- `aiRecommendations` - AI recommendations
- `milestones` - Milestone tracking
- `actionItems` - Action items with completion status
- `status` - Goal status

### 4. BusinessHealthScores
Daily business health scores and trends.

**Key Fields:**
- `userId` - User reference
- `date` - Date of score
- `overallScore` - Overall health (0-100)
- `healthStatus` - Status (thriving, stable, at_risk, critical)
- `revenueScore` - Revenue health score
- `growthScore` - Growth momentum score
- `customerScore` - Customer health score
- `marketingScore` - Marketing effectiveness score
- `operationsScore` - Operational efficiency score
- `profitabilityScore` - Profitability score
- `insights` - Key insights
- `trends` - Trend indicators

### 5. AdvisorConversations
Chat conversations with the AI advisor.

**Key Fields:**
- `userId` - User reference
- `question` - User's question
- `context` - Business context included in prompt
- `response` - AI response
- `category` - Question category
- `followUpQuestions` - Suggested follow-ups
- `actionItems` - Extracted action items
- `conversationThread` - Thread ID for multi-turn conversations

## Backend Services

### 1. businessProfileService.js
**Purpose:** Manage business profiles and setup wizard

**Key Functions:**
```javascript
// Get user's business profile
getProfile(userId)

// Create new profile
createProfile(userId, profileData)

// Update profile
updateProfile(userId, updates)

// Setup wizard - save step data
saveSetupStep(userId, step, data)

// SWOT analysis
updateSWOT(userId, swot)
getSWOT(userId)

// Competitor management
addCompetitor(userId, competitor)
removeCompetitor(userId, competitorName)
getCompetitors(userId)

// Business data summary
getBusinessDataSummary(userId)
```

### 2. businessHealthService.js
**Purpose:** Calculate and track business health scores

**Key Functions:**
```javascript
// Calculate current health score
calculateHealthScore(userId, businessData)

// Get current health score
getCurrentHealthScore(userId)

// Get health score history
getHealthScoreHistory(userId, days)

// Get health score for specific date
getHealthScoreForDate(userId, date)
```

**Health Score Calculation:**

The overall health score (0-100) is a weighted average of 6 category scores:

- **Revenue Score (25% weight):** Based on revenue levels, growth, meeting targets
- **Growth Score (20% weight):** Growth rate, acceleration, momentum
- **Customer Score (20% weight):** Churn rate, LTV:CAC ratio, satisfaction
- **Marketing Score (15% weight):** Conversion rate, ROAS, audience growth
- **Operations Score (10% weight):** Support efficiency, response times
- **Profitability Score (10% weight):** Profit margins

**Health Status:**
- **Thriving (80-100):** Business is performing excellently
- **Stable (60-79):** Healthy with room for improvement
- **At Risk (40-59):** Needs attention in several areas
- **Critical (0-39):** Immediate action required

### 3. businessInsightService.js
**Purpose:** Generate AI-powered insights and recommendations

**Key Functions:**
```javascript
// Generate all insights for user
generateInsights(userId)

// Create single insight
createInsight(userId, insightData)

// Get insights with filters
getInsights(userId, filters)

// Get priority insights (top 5)
getPriorityInsights(userId)

// Mark insight as actioned
markAsActioned(insightId)

// Dismiss insight
dismissInsight(insightId)
```

**Insight Generation Logic:**

The service analyzes business data to identify:

1. **Revenue Issues:** Below target, declining trends, missed opportunities
2. **Marketing Problems:** Low conversion rates, negative ROAS, poor traffic quality
3. **Customer Issues:** High churn, poor LTV:CAC ratio, satisfaction problems
4. **Growth Opportunities:** Stagnant growth, untapped potential
5. **Anomalies:** Sudden drops, broken checkout, technical issues
6. **Opportunities:** Untapped email lists, high-performing content
7. **Risks:** Customer concentration, unsustainable economics

Each insight includes:
- **Insight:** What the data shows
- **Recommendation:** Specific actions to take
- **Expected Impact:** Quantified outcome
- **Effort Required:** Low/Medium/High
- **Priority:** Critical/High/Medium/Low

### 4. businessAdvisorService.js
**Purpose:** AI chat interface using Claude API

**Key Functions:**
```javascript
// Ask the AI advisor a question
askAdvisor(userId, question, conversationThread)

// Get conversation history
getConversationHistory(conversationThread, limit)

// Get all user conversations
getUserConversations(userId, limit)

// Mark conversation as helpful
markHelpful(conversationId, helpful)
```

**AI Context:**

When answering questions, the AI receives:
- Business profile (name, industry, revenue, goals)
- Current health score and trends
- Priority insights
- SWOT analysis
- Recent conversation history (for follow-ups)
- Key metrics (revenue, customers, traffic, conversions)

**System Prompt:**

The AI is positioned as an expert business advisor who:
- Provides specific, actionable advice (not generic)
- Quantifies impact where possible
- Considers user's constraints
- Prioritizes high-impact, low-effort opportunities
- References actual data points
- Suggests concrete next steps

### 5. businessGoalService.js
**Purpose:** Strategic goal planning and tracking

**Key Functions:**
```javascript
// Create goal with AI strategy
createGoal(userId, goalData)

// Update goal
updateGoal(goalId, updates)

// Get goals with filters
getGoals(userId, filters)

// Update progress
updateProgress(goalId, currentValue)

// Milestone management
addMilestone(goalId, milestone)
completeMilestone(goalId, milestoneIndex)

// Refresh AI strategy
refreshGoalStrategy(goalId)

// Action items
addActionItem(goalId, task)
completeActionItem(goalId, actionIndex)

// Obstacles
addObstacle(goalId, obstacle)
resolveObstacle(goalId, obstacleIndex)

// Analytics
getGoalAnalytics(userId)
```

**AI Goal Strategy:**

When you create a goal, the AI generates:

1. **Strategy Statement:** How to achieve the goal based on your data
2. **Recommendations:** 3-5 specific strategies with impact/effort ratings
3. **Action Items:** Concrete tasks to implement
4. **Projected Timeline:** When you'll likely achieve it based on current trajectory

Example for "Hit £10k/month revenue" goal:
- Analyzes your current revenue (£6,500)
- Calculates gap (£3,500 or 54% growth needed)
- Generates specific recommendations:
  - Increase prices 15% on Product A (+£975/month)
  - Launch subscription tier (+£800/month)
  - Create upsell for Product B (+£650/month)
  - Increase email frequency (+£400/month)
- Shows projected path with monthly milestones
- Tracks progress automatically

### 6. businessReportService.js
**Purpose:** Generate automated business reports

**Key Functions:**
```javascript
// Generate weekly report
generateWeeklyReport(userId)

// Generate monthly report
generateMonthlyReport(userId, month)

// Custom date range report
generateCustomReport(userId, startDate, endDate)

// Format report for email
formatReportForEmail(report)
```

**Weekly Report Contents:**

Delivered every Monday morning:

1. **This Week's Snapshot:**
   - Revenue, customers, traffic, conversions
   - Week-over-week changes
   - Health score

2. **Wins This Week:** 🎉
   - Positive developments (revenue up, health improving, etc.)

3. **Areas to Watch:** ⚠️
   - Issues needing attention (declining metrics, critical insights)

4. **This Week's Priority:**
   - Top recommended action
   - Expected impact
   - Specific steps

5. **Next Week's Forecast:**
   - Revenue projection
   - Confidence level

**Monthly Report Contents:**

1. **Monthly Summary:**
   - Total revenue, growth rate, customer metrics
   - Average health score

2. **Top Wins:**
   - Major achievements this month

3. **Improvements Needed:**
   - Areas requiring focus

4. **Goal Progress:**
   - Status of all active goals

5. **Next Month Focus:**
   - Top 3 priority areas for next month

## Implementation Examples

### Setup Business Profile

```javascript
import { createProfile, saveSetupStep, completeSetup } from 'backend/businessProfileService';

// Step 1: Basic Info
await saveSetupStep(userId, 1, {
  businessName: 'Acme Digital Products',
  industry: 'Online Courses',
  businessModel: 'ecommerce',
  yearsInBusiness: 2
});

// Step 2: Current State
await saveSetupStep(userId, 2, {
  monthlyRevenue: 6500,
  employeeCount: 1,
  mainProducts: [
    { name: 'Course A', price: 197, monthlySales: 20 },
    { name: 'Course B', price: 47, monthlySales: 45 }
  ]
});

// Step 3: Goals
await saveSetupStep(userId, 3, {
  targetRevenue: 10000,
  goals: [
    'Hit £10k/month revenue',
    'Launch membership program',
    'Build email list to 5,000'
  ],
  challenges: [
    'Low email open rates',
    'Conversion rate stuck at 2%'
  ],
  targetAudience: 'Entrepreneurs aged 30-45 looking to grow their business'
});

// Step 4: SWOT
await saveSetupStep(userId, 4, {
  strengths: ['High-quality content', 'Strong brand reputation'],
  weaknesses: ['Small email list', 'Limited marketing budget'],
  opportunities: ['Growing market demand', 'Partnership potential'],
  threats: ['Increasing competition', 'Economic uncertainty']
});

// Step 5: Complete
await completeSetup(userId);
```

### Calculate Health Score

```javascript
import { calculateHealthScore, getCurrentHealthScore } from 'backend/businessHealthService';

// Calculate new health score
const healthScore = await calculateHealthScore(userId);

console.log(healthScore);
// {
//   overallScore: 72,
//   healthStatus: 'stable',
//   revenueScore: 75,
//   growthScore: 68,
//   customerScore: 85,
//   marketingScore: 60,
//   operationsScore: 78,
//   profitabilityScore: 70,
//   strengths: [{ category: 'customer', score: 85 }],
//   weaknesses: [{ category: 'marketing', score: 60 }],
//   criticalIssues: [],
//   trends: { overall: 'improving', ... }
// }
```

### Generate Insights

```javascript
import { generateInsights, getPriorityInsights } from 'backend/businessInsightService';

// Generate all insights
const allInsights = await generateInsights(userId);

// Get top priority insights
const priorityInsights = await getPriorityInsights(userId);

console.log(priorityInsights[0]);
// {
//   category: 'marketing',
//   priority: 'high',
//   title: 'Conversion rate is low at 2.1%',
//   insight: 'Your website conversion rate of 2.1% is below the industry average of 2-3%.',
//   recommendation: 'Optimize your: 1) Landing pages (clear CTAs, better copy), 2) Checkout process...',
//   expectedImpact: 'Increasing to 3% could double your sales from the same traffic',
//   effort: 'medium',
//   estimatedRevenue: 1500
// }
```

### Chat with AI Advisor

```javascript
import { askAdvisor } from 'backend/businessAdvisorService';

// Ask a question
const conversation = await askAdvisor(
  userId,
  'Why are my sales down this month?'
);

console.log(conversation.response);
// "I analyzed your sales data and found three key factors:
//
//  1. **Traffic dropped 22%** - Your Instagram posts decreased from 5/week to 2/week
//  2. **Conversion rate stable** - Your checkout still converts at 3.2% (good!)
//  3. **Average order value increased** - Despite fewer sales, AOV rose from £45 to £52
//
//  **Recommendation:** Your product and offer are strong (rising AOV proves this).
//  The issue is traffic. Increase content frequency to at least 4-5 posts/week..."

// Ask follow-up
const followUp = await askAdvisor(
  userId,
  'What content should I post?',
  conversation.conversationThread // Same thread
);
```

### Create Strategic Goal

```javascript
import { createGoal, updateProgress } from 'backend/businessGoalService';

// Create revenue goal
const goal = await createGoal(userId, {
  goal: 'Hit £10k/month revenue',
  category: 'revenue',
  targetValue: 10000,
  currentValue: 6500,
  targetDate: new Date('2024-06-30'),
  whyImportant: 'Financial freedom and ability to hire first employee'
});

console.log(goal.aiStrategy);
// "To reach £10,000/month from £6,500/month, you need to increase revenue by
//  £3,500/month (54% growth)..."

console.log(goal.aiRecommendations);
// [
//   { title: 'Increase Average Order Value', impact: '15-30%', effort: 'Low' },
//   { title: 'Acquire More Customers', impact: 'Direct', effort: 'Medium' },
//   { title: 'Optimize Pricing', impact: '10-20%', effort: 'Low' },
//   { title: 'Launch New Product/Service', impact: 'New revenue stream', effort: 'High' }
// ]

// Update progress
await updateProgress(goal._id, 7200); // Now at £7,200/month
// Progress automatically calculated: 72%
```

### Generate Weekly Report

```javascript
import { generateWeeklyReport } from 'backend/businessReportService';

const report = await generateWeeklyReport(userId);

console.log(report);
// {
//   snapshot: {
//     revenue: 1850,
//     revenueChange: 12,
//     customers: 24,
//     websiteVisitors: 2340,
//     conversionRate: 2.1
//   },
//   wins: [
//     { title: 'Revenue increased', description: 'Revenue up 12% vs last week' },
//     { title: 'Traffic surging', description: 'Website traffic up 18%' }
//   ],
//   areasToWatch: [
//     { title: 'Low conversion rate', severity: 'medium' }
//   ],
//   priorityAction: {
//     title: 'Optimize checkout process',
//     expectedImpact: 'Could increase revenue by £400/week'
//   },
//   forecast: {
//     revenue: { projected: 2050 }
//   }
// }
```

## UI Integration

### Business Advisor Dashboard

```javascript
// Page: /advisor
import { getCurrentHealthScore } from 'backend/businessHealthService';
import { getPriorityInsights } from 'backend/businessInsightService';
import { getActiveGoals } from 'backend/businessGoalService';

$w.onReady(async function () {
  const userId = wixUsers.currentUser.id;

  // Load health score
  const healthScore = await getCurrentHealthScore(userId);
  $w('#healthScoreText').text = healthScore.overallScore;
  $w('#healthStatusText').text = healthScore.healthStatus.toUpperCase();

  // Set health color
  const color = healthScore.overallScore >= 80 ? '#00C853' :
                healthScore.overallScore >= 60 ? '#FFD600' :
                healthScore.overallScore >= 40 ? '#FF6D00' : '#D32F2F';
  $w('#healthScoreText').style.color = color;

  // Load priority insights
  const insights = await getPriorityInsights(userId);
  $w('#insightsRepeater').data = insights.map(i => ({
    _id: i._id,
    priority: i.priority,
    title: i.title,
    recommendation: i.recommendation,
    effort: i.effort
  }));

  // Load active goals
  const goals = await getActiveGoals(userId);
  $w('#goalsRepeater').data = goals.map(g => ({
    _id: g._id,
    goal: g.goal,
    progress: g.progress
  }));
});
```

### Chat Interface

```javascript
// Page: /advisor/chat
import { askAdvisor, getConversationHistory } from 'backend/businessAdvisorService';

let currentThread = null;

$w.onReady(function () {
  $w('#askButton').onClick(handleAsk);
});

async function handleAsk() {
  const question = $w('#questionInput').value;
  if (!question) return;

  // Show user message
  addMessageToChat('user', question);

  // Clear input and show loading
  $w('#questionInput').value = '';
  $w('#loadingIndicator').show();

  const userId = wixUsers.currentUser.id;

  // Ask advisor
  const conversation = await askAdvisor(userId, question, currentThread);

  // Set thread for follow-ups
  currentThread = conversation.conversationThread;

  // Hide loading and show response
  $w('#loadingIndicator').hide();
  addMessageToChat('advisor', conversation.response);

  // Show follow-up suggestions
  if (conversation.followUpQuestions) {
    showFollowUpSuggestions(conversation.followUpQuestions);
  }
}

function addMessageToChat(role, message) {
  // Add message to chat display
  const messages = $w('#chatRepeater').data;
  messages.push({
    _id: Date.now().toString(),
    role,
    message,
    timestamp: new Date()
  });
  $w('#chatRepeater').data = messages;

  // Scroll to bottom
  $w('#chatBox').scrollTo(0, $w('#chatBox').scrollHeight);
}
```

## Email Notifications

### Weekly Report Email

Set up triggered email to send every Monday at 9am:

**Subject:** Your Weekly Business Report - [Business Name]

**Template:** Include health score, wins, areas to watch, and priority action.

## Pricing & Access Control

The Business Advisor is a premium add-on (£15-20/month).

Check user access:

```javascript
import wixPaid from 'wix-paid-plans-backend';

export async function hasBusinessAdvisorAccess(userId) {
  const plans = await wixPaid.getCurrentMemberOrders();
  return plans.some(plan =>
    plan.planId === 'business-advisor-monthly' ||
    plan.planId === 'business-advisor-annual'
  );
}
```

## API Integration

### Connect Claude API

Store API key in Wix Secrets Manager:

1. Go to Wix Dashboard > Secrets Manager
2. Create new secret: `CLAUDE_API_KEY`
3. Enter your Anthropic API key

Update `businessAdvisorService.js`:

```javascript
import { getSecret } from 'wix-secrets-backend';

const CLAUDE_API_KEY = await getSecret('CLAUDE_API_KEY');
```

## Performance Optimization

### Caching

Cache health scores and insights to reduce calculations:

```javascript
// Cache health score for 1 hour
import wixData from 'wix-data';

const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

export async function getCachedHealthScore(userId) {
  const cached = await getCurrentHealthScore(userId);

  if (cached) {
    const age = Date.now() - new Date(cached.createdAt).getTime();
    if (age < CACHE_DURATION) {
      return cached;
    }
  }

  // Recalculate if cache expired
  return await calculateHealthScore(userId);
}
```

### Background Jobs

Schedule background jobs for:
- Weekly report generation (Mondays 9am)
- Daily health score calculation
- Daily insight generation

```javascript
import { jobs } from 'wix-data-backend';

jobs.schedule('generateWeeklyReports', {
  hour: 9,
  dayOfWeek: 1 // Monday
}, async () => {
  // Get all users with Business Advisor access
  // Generate and email reports
});
```

## Testing

Test the advisor with sample data:

```javascript
import { createProfile, updateProfile } from 'backend/businessProfileService';
import { calculateHealthScore } from 'backend/businessHealthService';
import { generateInsights } from 'backend/businessInsightService';

// Create test profile
const testProfile = await createProfile('test-user', {
  businessName: 'Test Business',
  industry: 'ecommerce',
  businessModel: 'ecommerce',
  monthlyRevenue: 5000,
  targetRevenue: 10000
});

// Calculate health score
const health = await calculateHealthScore('test-user');
console.log('Health Score:', health.overallScore);

// Generate insights
const insights = await generateInsights('test-user');
console.log('Generated', insights.length, 'insights');
```

## Next Steps

1. **Set up database collections** in Wix Data
2. **Add backend services** to your Wix site
3. **Create UI pages** for dashboard, chat, and reports
4. **Configure Claude API** with your API key
5. **Set up email templates** for weekly reports
6. **Configure payment plans** for Business Advisor access
7. **Test thoroughly** with sample data
8. **Launch to beta users** for feedback
9. **Iterate based on feedback**
10. **Full launch** with marketing campaign

## Support

For questions or issues:
- Check the code comments in each service file
- Review the implementation examples above
- Test with sample data first
- Monitor Claude API usage and costs

## Changelog

**v1.0.0** - Initial release
- Business profile setup
- Health score calculation
- AI insights generation
- Chat with AI advisor
- Strategic goal planning
- Weekly/monthly reports
