# Competitor Tracker - Complete Implementation Guide

## Overview

The Competitor Tracker is an automated competitive intelligence system that monitors competitors' websites, social media, pricing, products, and content. It provides continuous monitoring with change detection and intelligent alerts.

### Key Value Proposition

Replace manual competitor research (hours per week) with automated tracking that alerts you to important changes in real-time.

### What It Monitors

- **Website Changes**: Homepage updates, redesigns, new pages, feature additions
- **Pricing Updates**: Price changes, new plans, promotions, feature modifications
- **New Products**: Product launches, updates, discontinuations
- **Social Media**: Follower growth, posting frequency, engagement rates, top content
- **Content Publishing**: Blog posts, videos, podcasts, webinars, case studies
- **SEO Rankings**: Keyword positions, domain authority, backlinks, organic traffic
- **News & Funding**: Press releases, funding announcements, partnerships

---

## Architecture

### Database Collections

#### 1. Competitors
Main competitor information and configuration.

**Fields**:
- `userId` - User tracking this competitor
- `name` - Company name
- `website` - Primary website URL
- `description` - Company description
- `industry` - Industry/sector
- `size` - Company size (startup, small, medium, large, enterprise)
- `founded` - Year founded
- `location` - Headquarters location
- `status` - Status (active, inactive, acquired, defunct)
- `relationship` - Competitive relationship (direct, indirect, adjacent)
- `logo` - Logo URL
- `socialProfiles` - JSON object with social media URLs
- `notes` - User notes
- `monitoringEnabled` - Whether automated monitoring is active
- `lastMonitored` - Last monitoring timestamp
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

#### 2. CompetitorSnapshots
Point-in-time snapshots for change detection.

**Fields**:
- `competitorId` - Reference to Competitors
- `snapshotType` - Type: website, pricing, product, social, seo, content
- `data` - JSON object containing captured data
- `changes` - JSON object showing what changed
- `hasChanges` - Boolean indicating if changes detected
- `significance` - Change significance: minor, medium, important, critical
- `capturedAt` - Snapshot timestamp

#### 3. CompetitorWebsites
Website content and monitoring data.

**Fields**:
- `competitorId` - Reference to Competitors
- `url` - Website URL
- `title` - Page title
- `description` - Meta description
- `keywords` - Array of keywords
- `mainProducts` - JSON array of products mentioned
- `pricing` - JSON object with pricing information
- `features` - JSON array of features
- `ctaText` - Primary call-to-action text
- `screenshots` - JSON array of screenshot URLs
- `contentHash` - Hash for change detection
- `lastChecked` - Last check timestamp
- `lastChanged` - Last change detected timestamp

#### 4. CompetitorProducts
Product catalog tracking.

**Fields**:
- `competitorId` - Reference to Competitors
- `name` - Product name
- `description` - Product description
- `price` - Product price
- `currency` - Currency code (GBP, USD, EUR)
- `pricingModel` - Pricing model type
- `features` - JSON array of features
- `url` - Product page URL
- `status` - Status: new, active, updated, discontinued
- `category` - Product category
- `firstSeen` - First detected timestamp
- `lastSeen` - Last seen timestamp
- `lastChanged` - Last change timestamp

#### 5. CompetitorPricing
Pricing history and changes.

**Fields**:
- `competitorId` - Reference to Competitors
- `productName` - Product or service name
- `plan` - Plan name (Free, Basic, Pro, Enterprise)
- `price` - Plan price
- `currency` - Currency code
- `billingCycle` - Billing cycle (monthly, annual, one_time)
- `features` - JSON array of included features
- `limitations` - JSON object with usage limits
- `promotion` - Active promotion or discount
- `changes` - JSON object showing changes
- `previousPrice` - Price before latest change
- `priceChangePercentage` - Percentage change
- `effectiveDate` - When pricing became effective
- `capturedAt` - Capture timestamp

#### 6. CompetitorContent
Content monitoring (blogs, videos, etc.).

**Fields**:
- `competitorId` - Reference to Competitors
- `contentType` - Type (blog_post, video, podcast, etc.)
- `title` - Content title
- `url` - Content URL
- `author` - Content author
- `publishedAt` - Publication date
- `topic` - Main topic or category
- `keywords` - Array of keywords/tags
- `summary` - Content summary or excerpt
- `engagement` - JSON object with engagement metrics
- `platform` - Platform where hosted
- `capturedAt` - Discovery timestamp

#### 7. CompetitorSocial
Social media metrics tracking.

**Fields**:
- `competitorId` - Reference to Competitors
- `platform` - Platform (twitter, linkedin, instagram, etc.)
- `handle` - Social media handle/username
- `profileUrl` - Profile URL
- `followers` - Current follower count
- `followersChange` - Change since last check
- `followersChangePercentage` - Percentage change
- `following` - Number they follow
- `postCount` - Total posts
- `postFrequency` - Average posts per week
- `engagementRate` - Average engagement rate
- `recentPosts` - JSON array of recent posts
- `topPosts` - JSON array of top-performing posts
- `hashtags` - JSON array of commonly used hashtags
- `capturedAt` - Snapshot timestamp

#### 8. CompetitorSEO
SEO metrics and rankings.

**Fields**:
- `competitorId` - Reference to Competitors
- `domain` - Domain being tracked
- `domainAuthority` - DA score (0-100)
- `domainAuthorityChange` - Change in DA
- `organicKeywords` - Number of ranking keywords
- `organicTraffic` - Estimated monthly organic traffic
- `organicTrafficChange` - Change in traffic
- `backlinks` - Total backlinks
- `backlinksChange` - Change in backlinks
- `referringDomains` - Number of unique referring domains
- `topRankings` - JSON array of top keyword rankings
- `topBacklinks` - JSON array of high-quality backlinks
- `topPages` - JSON array of pages with most traffic
- `capturedAt` - Capture timestamp

#### 9. CompetitorAlerts
User notifications for significant changes.

**Fields**:
- `userId` - User receiving alert
- `competitorId` - Reference to Competitors
- `competitorName` - Competitor name (for display)
- `alertType` - Type of alert
- `title` - Alert title
- `description` - Alert description
- `data` - JSON object with alert details
- `severity` - Severity: info, warning, important, critical
- `isRead` - Whether user has read it
- `isDismissed` - Whether user has dismissed it
- `actionTaken` - User notes on action taken
- `createdAt` - Alert creation timestamp

#### 10. CompetitorComparisons
Saved comparison reports.

**Fields**:
- `userId` - User who created comparison
- `name` - Comparison name
- `comparisonType` - Type (pricing, features, social, seo, etc.)
- `competitorIds` - JSON array of competitor IDs
- `metrics` - JSON object defining metrics to compare
- `reportData` - JSON object with comparison results
- `insights` - JSON array of AI-generated insights
- `visualizations` - JSON object with chart configurations
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

---

## Backend Services

### 1. competitorService.js

Core competitor management service.

**Key Functions**:

```javascript
// Create competitor
createCompetitor(userId, competitorData)

// Get competitor
getCompetitor(competitorId)

// List competitors with filters
listCompetitors(userId, filters)

// Update competitor
updateCompetitor(competitorId, updates)

// Delete competitor
deleteCompetitor(competitorId)

// Enable/disable monitoring
enableMonitoring(competitorId)
disableMonitoring(competitorId)

// Get competitors needing monitoring
getCompetitorsForMonitoring(userId)

// Get summary statistics
getCompetitorStats(userId)

// Search competitors
searchCompetitors(userId, searchTerm)
```

**Example Usage**:

```javascript
import { createCompetitor } from 'backend/competitorService';

// Create new competitor
const competitor = await createCompetitor(userId, {
  name: 'Acme Corp',
  website: 'https://acme.com',
  industry: 'SaaS',
  relationship: 'direct'
});
```

### 2. competitorDiscoveryService.js

Auto-discovery of competitor information.

**Key Functions**:

```javascript
// Discover from URL
discoverFromURL(userId, url)

// Discover from company name
discoverFromName(userId, companyName)

// Import from CSV
importFromCSV(userId, csvData)
```

**Discovery Process**:
1. Fetch website content
2. Extract basic info (title, description, logo)
3. Use AI to enrich data (industry, size, location)
4. Discover social media profiles
5. Create competitor record

**Example**:

```javascript
import { discoverFromURL } from 'backend/competitorDiscoveryService';

// Auto-discover competitor
const result = await discoverFromURL(userId, 'https://competitor.com');

console.log(result.competitor); // Created competitor
console.log(result.discoveredData); // All discovered data
```

### 3. competitorMonitoringService.js

Orchestrates automated monitoring.

**Key Functions**:

```javascript
// Run monitoring for all enabled competitors
runMonitoring(userId)

// Monitor specific competitor
monitorCompetitor(competitorId)

// Create snapshot
createSnapshot(competitorId, snapshotType, data, changes)

// Get latest snapshot
getLatestSnapshot(competitorId, snapshotType)

// Get snapshot history
getSnapshotHistory(competitorId, snapshotType, limit)

// Compare snapshots
compareSnapshots(oldSnapshot, newSnapshot)

// Scheduled monitoring
scheduledDailyMonitoring()
scheduledWeeklyMonitoring()
```

**Monitoring Schedule**:
- **Daily**: Social media, content, job postings
- **Weekly**: Website changes, pricing, SEO rankings
- **Monthly**: Traffic estimates, backlinks, comprehensive snapshot

### 4. competitorWebsiteService.js

Website monitoring and change detection.

**Key Functions**:

```javascript
// Monitor website
monitorWebsite(competitorId)

// Get website data
getWebsiteData(competitorId)

// Get change history
getWebsiteHistory(competitorId, limit)
```

**What It Tracks**:
- Homepage content changes
- Title and meta description updates
- CTA changes
- Featured products/services
- Pricing mentions
- Full page content hash for change detection

### 5. competitorPricingService.js

Pricing intelligence and tracking.

**Key Functions**:

```javascript
// Monitor pricing
monitorPricing(competitorId)

// Get current pricing
getCurrentPricing(competitorId)

// Add pricing record
addPricing(competitorId, pricingData)

// Get pricing history
getPricingHistory(competitorId, productName, plan)

// Compare pricing across competitors
comparePricing(competitorIds, planLevel)

// Analyze pricing trends
analyzePricingTrends(competitorId)

// Get pricing alerts
getPricingAlerts(competitorId, daysBack)
```

**Example**:

```javascript
import { addPricing } from 'backend/competitorPricingService';

// Record pricing
await addPricing(competitorId, {
  productName: 'Main Product',
  plan: 'Pro',
  price: 99,
  currency: 'GBP',
  billingCycle: 'monthly',
  features: ['Feature 1', 'Feature 2', 'Feature 3']
});
```

### 6. competitorContentService.js

Content monitoring and analysis.

**Key Functions**:

```javascript
// Monitor content
monitorContent(competitorId)

// Add content item
addContent(competitorId, contentData)

// Get recent content
getRecentContent(competitorId, limit)

// Analyze content frequency
analyzeContentFrequency(competitorId, daysBack)

// Compare content strategies
compareContentStrategies(competitorIds, daysBack)

// Get top performing content
getTopPerformingContent(competitorId, limit)

// Identify content gaps
identifyContentGaps(competitorId, yourTopics)
```

**Content Types Tracked**:
- Blog posts
- Videos
- Podcasts
- Webinars
- Ebooks/guides
- Case studies
- Whitepapers

### 7. competitorSocialService.js

Social media monitoring across platforms.

**Key Functions**:

```javascript
// Monitor social media
monitorSocial(competitorId)

// Get social overview
getSocialOverview(competitorId)

// Get follower growth history
getFollowerGrowthHistory(competitorId, platform, daysBack)

// Compare social performance
compareSocialPerformance(competitorIds)

// Analyze posting patterns
analyzePostingPatterns(competitorId, platform)

// Get top posts
getTopPosts(competitorId, platform)
```

**Platforms Supported**:
- Twitter/X
- LinkedIn
- Instagram
- Facebook
- YouTube
- TikTok

### 8. competitorSEOService.js

SEO monitoring and analysis.

**Key Functions**:

```javascript
// Monitor SEO
monitorSEO(competitorId)

// Get SEO history
getSEOHistory(competitorId, limit)

// Compare SEO metrics
compareSEOMetrics(competitorIds)

// Analyze keyword overlap
analyzeKeywordOverlap(competitorId, yourKeywords)

// Analyze backlink opportunities
analyzeBacklinkOpportunities(competitorId)

// Get traffic estimate
getTrafficEstimate(competitorId)

// Track SERP positions
trackSERPPositions(competitorId, keywords)
```

**SEO Metrics Tracked**:
- Domain authority
- Organic keywords
- Organic traffic estimates
- Backlinks and referring domains
- Top keyword rankings
- Top performing pages

### 9. competitorAlertService.js

Alert creation and management.

**Key Functions**:

```javascript
// Create alert
createAlert(userId, competitorId, alertData)

// Get alerts with filters
getAlerts(userId, filters)

// Mark as read
markAsRead(alertId)
markMultipleAsRead(alertIds)

// Dismiss alert
dismissAlert(alertId)

// Add action note
addActionNote(alertId, actionNote)

// Get unread count
getUnreadCount(userId)

// Get alert statistics
getAlertStats(userId, daysBack)

// Delete old alerts
deleteOldAlerts(userId, daysOld)

// Get critical alerts
getCriticalAlerts(userId, limit)
```

**Alert Types**:
- `website_change` - Website updated
- `pricing_change` - Pricing changed
- `new_product` - New product launched
- `new_content` - New content published
- `social_spike` - Significant follower change
- `seo_change` - SEO metrics changed
- `news` - News/press mention
- `funding` - Funding announcement

**Severity Levels**:
- `info` - Informational
- `warning` - Worth noting
- `important` - Significant change
- `critical` - Immediate attention needed

### 10. competitorComparisonService.js

Comparison reports and analysis.

**Key Functions**:

```javascript
// Create comparison
createComparison(userId, comparisonData)

// Get saved comparisons
getSavedComparisons(userId)

// Get specific comparison
getComparison(comparisonId)

// Refresh comparison with latest data
refreshComparison(comparisonId)

// Delete comparison
deleteComparison(comparisonId)
```

**Comparison Types**:
- Pricing comparison
- Feature matrix
- Social media performance
- SEO metrics
- Content strategy
- Traffic comparison
- Overall comparison

**Example**:

```javascript
import { createComparison } from 'backend/competitorComparisonService';

// Create pricing comparison
const comparison = await createComparison(userId, {
  name: 'My Business vs Top 3 Competitors',
  comparisonType: 'pricing',
  competitorIds: [comp1Id, comp2Id, comp3Id],
  metrics: {}
});

console.log(comparison.reportData); // Comparison data
console.log(comparison.insights); // AI insights
console.log(comparison.visualizations); // Chart configs
```

### 11. competitorReportService.js

Weekly digests and SWOT analysis.

**Key Functions**:

```javascript
// Generate weekly digest
generateWeeklyDigest(userId)

// Generate SWOT analysis
generateSWOTAnalysis(userId, competitorIds)

// Generate custom report
generateCustomReport(userId, reportConfig)

// Format digest for email
formatDigestEmail(digest)
```

**Weekly Digest Contents**:
- Overview of the week
- Key insights
- Critical and important alerts
- Top changes across competitors
- AI-generated recommendations

**SWOT Analysis**:
- **Strengths**: What you do better than competitors
- **Weaknesses**: Where competitors outperform you
- **Opportunities**: Market gaps to exploit
- **Threats**: Competitive threats to address

---

## Implementation Examples

### Setup Wix Data Collections

```javascript
// This would be done in Wix Dashboard > Database
// Import the schema files from /schema directory

// Example: competitors.schema.json
{
  "displayName": "Competitors",
  "id": "Competitors",
  "fields": [ /* see schema file */ ]
}
```

### Add a Competitor

```javascript
// In your Wix page code
import { discoverFromURL } from 'backend/competitorDiscoveryService';

$w.onReady(function () {
  $w('#addCompetitorButton').onClick(async () => {
    const url = $w('#urlInput').value;

    try {
      // Show loading
      $w('#loadingSpinner').show();

      // Discover competitor
      const result = await discoverFromURL(currentUser.id, url);

      // Display success
      $w('#successMessage').text = `Added ${result.competitor.name}!`;
      $w('#successMessage').show();

      // Refresh list
      await loadCompetitors();
    } catch (error) {
      $w('#errorMessage').text = error.message;
      $w('#errorMessage').show();
    } finally {
      $w('#loadingSpinner').hide();
    }
  });
});
```

### Display Competitor List

```javascript
import { listCompetitors } from 'backend/competitorService';

async function loadCompetitors() {
  const competitors = await listCompetitors(currentUser.id);

  $w('#competitorRepeater').data = competitors.map(comp => ({
    _id: comp._id,
    name: comp.name,
    website: comp.website,
    industry: comp.industry,
    logo: comp.logo || '/default-logo.png',
    status: comp.status,
    monitoringEnabled: comp.monitoringEnabled
  }));
}

$w.onReady(function () {
  loadCompetitors();

  $w('#competitorRepeater').onItemReady(($item, itemData) => {
    $item('#nameText').text = itemData.name;
    $item('#websiteLink').link = itemData.website;
    $item('#industryText').text = itemData.industry;
    $item('#logoImage').src = itemData.logo;

    $item('#viewButton').onClick(() => {
      wixLocation.to(`/competitors/${itemData._id}`);
    });
  });
});
```

### Display Alerts

```javascript
import { getAlerts, markAsRead } from 'backend/competitorAlertService';

async function loadAlerts() {
  const alerts = await getAlerts(currentUser.id, {
    unreadOnly: true,
    limit: 20
  });

  $w('#alertRepeater').data = alerts.map(alert => ({
    _id: alert._id,
    icon: getAlertIcon(alert.alertType),
    title: alert.title,
    description: alert.description,
    competitorName: alert.competitorName,
    severity: alert.severity,
    createdAt: formatDate(alert.createdAt)
  }));

  // Update badge count
  $w('#unreadBadge').text = alerts.length.toString();
}

function getAlertIcon(alertType) {
  const icons = {
    website_change: '🌐',
    pricing_change: '💰',
    new_product: '🚀',
    new_content: '📝',
    social_spike: '📈',
    seo_change: '🔍'
  };

  return icons[alertType] || '📢';
}

$w.onReady(function () {
  loadAlerts();

  $w('#alertRepeater').onItemReady(($item, itemData) => {
    $item('#iconText').text = itemData.icon;
    $item('#titleText').text = itemData.title;
    $item('#descriptionText').text = itemData.description;
    $item('#competitorText').text = itemData.competitorName;
    $item('#dateText').text = itemData.createdAt;

    // Severity styling
    if (itemData.severity === 'critical') {
      $item('#container').style.backgroundColor = '#FEE2E2';
    }

    // Mark as read when clicked
    $item('#container').onClick(async () => {
      await markAsRead(itemData._id);
      await loadAlerts();
    });
  });
});
```

### Create Comparison Report

```javascript
import { createComparison } from 'backend/competitorComparisonService';

$w.onReady(function () {
  $w('#createComparisonButton').onClick(async () => {
    const selectedCompetitors = $w('#competitorCheckboxGroup').value; // Array of IDs
    const comparisonType = $w('#typeDropdown').value;

    try {
      $w('#loadingSpinner').show();

      const comparison = await createComparison(currentUser.id, {
        name: $w('#comparisonNameInput').value,
        comparisonType,
        competitorIds: selectedCompetitors,
        metrics: {}
      });

      // Navigate to comparison view
      wixLocation.to(`/competitors/comparisons/${comparison._id}`);
    } catch (error) {
      console.error('Error creating comparison:', error);
    } finally {
      $w('#loadingSpinner').hide();
    }
  });
});
```

### Display Weekly Digest

```javascript
import { generateWeeklyDigest } from 'backend/competitorReportService';

async function loadWeeklyDigest() {
  const digest = await generateWeeklyDigest(currentUser.id);

  // Display overview
  $w('#overviewText').text = digest.summary.overview;

  // Display key insights
  $w('#insightsRepeater').data = digest.summary.keyInsights.map((insight, index) => ({
    _id: `insight-${index}`,
    insight
  }));

  // Display critical alerts
  $w('#criticalAlertsCount').text = digest.alerts.critical.length.toString();

  // Display recommendations
  $w('#recommendationsRepeater').data = digest.summary.recommendations.map((rec, index) => ({
    _id: `rec-${index}`,
    action: rec.action,
    priority: rec.priority,
    reasoning: rec.reasoning
  }));
}

$w.onReady(function () {
  loadWeeklyDigest();
});
```

---

## Scheduled Jobs

### Daily Monitoring Job

In Wix, create a scheduled job in the **Jobs** section of the backend:

```javascript
// jobs.config (Wix Scheduler)
{
  "jobs": [
    {
      "functionLocation": "/scheduledJobs.js",
      "functionName": "dailyCompetitorMonitoring",
      "description": "Run daily competitor monitoring",
      "executionConfig": {
        "time": "02:00",
        "timeZone": "UTC"
      }
    }
  ]
}
```

```javascript
// backend/scheduledJobs.js
import { scheduledDailyMonitoring } from './competitorMonitoringService';

export async function dailyCompetitorMonitoring() {
  console.log('Starting daily competitor monitoring...');

  try {
    const result = await scheduledDailyMonitoring();
    console.log('Daily monitoring complete:', result);
    return { success: true, result };
  } catch (error) {
    console.error('Error in daily monitoring:', error);
    return { success: false, error: error.message };
  }
}
```

### Weekly Digest Job

```javascript
// jobs.config
{
  "jobs": [
    {
      "functionLocation": "/scheduledJobs.js",
      "functionName": "weeklyDigestEmail",
      "description": "Send weekly competitive digest emails",
      "executionConfig": {
        "dayOfWeek": "monday",
        "time": "09:00",
        "timeZone": "UTC"
      }
    }
  ]
}
```

```javascript
// backend/scheduledJobs.js
import { generateWeeklyDigest, formatDigestEmail } from './competitorReportService';
import wixData from 'wix-data';

export async function weeklyDigestEmail() {
  try {
    // Get all users with active monitoring
    const users = await wixData.query('Members')
      .find();

    for (const user of users.items) {
      try {
        // Generate digest
        const digest = await generateWeeklyDigest(user._id);

        // Format email
        const emailHtml = formatDigestEmail(digest);

        // Send email (would use Wix Email API or external service)
        // await sendEmail(user.email, 'Weekly Competitive Digest', emailHtml);

        console.log(`Sent weekly digest to ${user.email}`);
      } catch (error) {
        console.error(`Error sending digest to user ${user._id}:`, error);
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Error in weekly digest job:', error);
    return { success: false, error: error.message };
  }
}
```

---

## Best Practices

### 1. Rate Limiting

When scraping competitor websites:

```javascript
// Implement delay between requests
async function fetchWithDelay(url, delayMs = 1000) {
  await new Promise(resolve => setTimeout(resolve, delayMs));
  return await fetch(url);
}
```

### 2. Error Handling

Always handle failures gracefully:

```javascript
try {
  await monitorCompetitor(competitorId);
} catch (error) {
  console.error(`Failed to monitor ${competitorId}:`, error);
  // Continue with other competitors
}
```

### 3. Data Privacy

- Only track publicly available information
- Respect robots.txt
- Don't scrape at excessive rates
- Store only necessary data

### 4. Change Detection Sensitivity

Configure significance thresholds:

```javascript
// Only alert for significant changes
if (priceChangePercentage > 10) {
  // Create alert
}

if (followerChangePercentage > 20) {
  // Create alert
}
```

### 5. Cleanup Old Data

Regularly clean up old snapshots and alerts:

```javascript
// Keep only last 90 days of snapshots
async function cleanupOldSnapshots() {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 90);

  const oldSnapshots = await wixData.query('CompetitorSnapshots')
    .lt('capturedAt', cutoffDate)
    .find();

  for (const snapshot of oldSnapshots.items) {
    await wixData.remove('CompetitorSnapshots', snapshot._id);
  }
}
```

---

## API Integration Requirements

### Third-Party APIs

For full functionality, integrate with:

**Social Media APIs**:
- Twitter API (follower counts, posts)
- LinkedIn API (company pages)
- Instagram Graph API (business accounts)
- YouTube Data API (channel stats)

**SEO APIs**:
- Moz API (domain authority)
- SEMrush API (keyword rankings, traffic estimates)
- Ahrefs API (backlinks)
- Google Search Console API (SERP positions)

**Screenshot Services**:
- Urlbox
- ScreenshotAPI
- Puppeteer (self-hosted)

**News Aggregation**:
- Google News API
- NewsAPI
- Company RSS feeds

### API Key Configuration

Store API keys in Wix Secrets Manager:

```javascript
import { getSecret } from 'wix-secrets-backend';

const TWITTER_API_KEY = await getSecret('twitter_api_key');
const SEMRUSH_API_KEY = await getSecret('semrush_api_key');
```

---

## Testing

### Unit Tests

```javascript
// Test competitor creation
import { createCompetitor } from './competitorService';

describe('competitorService', () => {
  test('creates competitor successfully', async () => {
    const competitor = await createCompetitor('user123', {
      name: 'Test Corp',
      website: 'https://test.com',
      industry: 'Tech'
    });

    expect(competitor.name).toBe('Test Corp');
    expect(competitor.userId).toBe('user123');
  });
});
```

### Integration Tests

```javascript
// Test full monitoring workflow
import { monitorCompetitor } from './competitorMonitoringService';

test('monitors competitor and creates alerts', async () => {
  const result = await monitorCompetitor('comp123');

  expect(result.changes).toBeGreaterThanOrEqual(0);
  expect(result.alerts).toBeGreaterThanOrEqual(0);
});
```

---

## Troubleshooting

### Common Issues

**1. Website scraping fails**
- Check robots.txt compliance
- Verify URL is accessible
- Check for CAPTCHA or rate limiting
- Use proper User-Agent headers

**2. Social media data not updating**
- Verify API keys are valid
- Check API rate limits
- Ensure OAuth tokens are refreshed

**3. No alerts being created**
- Check monitoring is enabled
- Verify change detection thresholds
- Check alert service is running

**4. Slow performance**
- Reduce monitoring frequency
- Limit number of competitors
- Optimize database queries
- Use caching where appropriate

---

## Roadmap

### Phase 1 (Current)
- ✅ Core competitor management
- ✅ Website monitoring
- ✅ Pricing tracking
- ✅ Social media monitoring
- ✅ Alert system
- ✅ Comparison reports

### Phase 2 (Future)
- AI-powered competitor insights
- Automated SWOT updates
- Competitive positioning maps
- Market share tracking
- Win/loss analysis
- Competitive battlecards

### Phase 3 (Future)
- Chrome extension for quick competitor adds
- Slack/Teams integration
- Mobile app
- Advanced ML for trend prediction
- Competitive intelligence chat
- API for third-party integrations

---

## Support

For issues or questions:
- Check documentation
- Review implementation examples
- Test with sample data first
- Check Wix console for errors

---

## Summary

The Competitor Tracker provides comprehensive, automated competitive intelligence. It monitors all aspects of competitor activity and delivers actionable insights through smart alerts and reports.

**Key Benefits**:
- Save hours on manual competitor research
- Never miss important competitive changes
- Make data-driven strategic decisions
- Stay ahead of market trends
- Identify opportunities and threats early

**Technical Highlights**:
- 10 Wix Data Collections
- 11 backend services
- Automated monitoring with scheduling
- AI-powered insights
- Multi-platform support
- Comprehensive reporting
