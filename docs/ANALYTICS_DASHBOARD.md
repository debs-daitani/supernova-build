# Analytics Dashboard System

Comprehensive analytics tracking and reporting system for the dAItaniverse platform.

## Overview

The Analytics Dashboard provides deep insights into user behavior, feature usage, revenue metrics, and traffic patterns. It includes real-time tracking, privacy controls, GDPR compliance, and custom report generation.

## Features

### 1. Event Tracking
- **Page Views**: Track all page visits with referrer data
- **Feature Usage**: Monitor usage of all platform features
- **Conversions**: Track signups, subscriptions, upgrades
- **Engagement**: Session tracking, button clicks, form submissions
- **Revenue**: Payment events, refunds, subscription changes

### 2. Session Management
- Automatic session detection and tracking
- Session duration calculation
- Device type, browser, and OS detection
- Entry and exit page tracking
- Unique visitor identification

### 3. Metrics Aggregation
Daily calculation of key metrics:
- **DAU** (Daily Active Users)
- **WAU** (Weekly Active Users - last 7 days)
- **MAU** (Monthly Active Users - last 30 days)
- **New Users** (Daily signups)
- **Revenue** (Daily revenue)
- **MRR** (Monthly Recurring Revenue)
- **Average Session Duration**
- **Page Views**
- **Conversion Rate**
- **Retention Rate**
- **Churn Rate**

### 4. Analytics Pages

#### Overview Dashboard (`/analytics`)
- Key metrics at a glance
- Trend indicators (up/down percentages)
- Quick links to detailed analytics
- Privacy & compliance information

#### Users Analytics (`/analytics/users`)
- DAU, WAU, MAU tracking
- New user signups
- Retention and churn rates
- User segmentation by tier (BRAVE, BOLD, BADASS)
- User growth trends

#### Features Analytics (`/analytics/features`)
- Feature usage breakdown by category
- Website Builder, Design Tools, AI Images, Video Editor
- Usage counts and unique users per feature
- Average usage per user
- Trend analysis

#### Revenue Analytics (`/analytics/revenue`)
- Total revenue tracking
- Monthly Recurring Revenue (MRR)
- Average Revenue Per User (ARPU)
- Lifetime Value (LTV)
- Subscription tier breakdown
- Revenue events (payments, renewals, failures)
- Churn analysis

#### Traffic Analytics (`/analytics/traffic`)
- Traffic sources (UTM tracking)
- Device breakdown (desktop, mobile, tablet)
- Browser statistics
- Geographic data (with IP geolocation)
- Referrer tracking

#### Content Analytics (`/analytics/content`)
- Performance of created content
- Website, design, image, video metrics
- View and download tracking
- Most popular content

#### Real-time Analytics (`/analytics/realtime`)
- Live user activity (updates every 5 seconds)
- Active users and sessions
- Recent events feed
- Current page views
- Active pages map

#### Custom Reports (`/analytics/reports`)
- Date range selection
- Report type selection (users, features, revenue, traffic)
- CSV export
- JSON export
- PDF export (coming soon)
- Quick report templates

### 5. Privacy & Compliance

#### GDPR Compliance
- IP address anonymization
- Cookie consent management
- Right to be forgotten (data deletion)
- Data portability (export user data)
- Do Not Track support

#### Privacy Controls
- User opt-out mechanism
- Analytics preferences storage
- Transparent data collection

## Database Schema

### AnalyticsEvent
Stores raw analytics events with flexible JSON storage.

```prisma
model AnalyticsEvent {
  id              String   @id @default(cuid())
  userId          String?
  eventType       String
  eventCategory   String   // PAGE_VIEW, FEATURE_USE, CONVERSION, ENGAGEMENT, REVENUE
  eventData       Json?
  sessionId       String
  deviceType      String?
  browser         String?
  os              String?
  ipAddress       String?
  country         String?
  city            String?
  referrer        String?
  utmSource       String?
  utmMedium       String?
  utmCampaign     String?
  createdAt       DateTime @default(now())
}
```

### AnalyticsSession
Tracks user sessions with timing and device information.

```prisma
model AnalyticsSession {
  id              String   @id @default(cuid())
  userId          String?
  sessionId       String   @unique
  startedAt       DateTime @default(now())
  endedAt         DateTime?
  duration        Int?
  pageViews       Int      @default(0)
  eventsCount     Int      @default(0)
  deviceType      String?
  browser         String?
  os              String?
  entryPage       String?
  exitPage        String?
}
```

### AnalyticsMetric
Stores aggregated daily metrics for performance.

```prisma
model AnalyticsMetric {
  id              String   @id @default(cuid())
  date            DateTime @db.Date
  metricType      String   // dau, wau, mau, revenue, etc.
  metricValue     Float
  metadata        Json?
  @@unique([date, metricType])
}
```

### UserActivity
Daily summary of user activity.

```prisma
model UserActivity {
  id              String   @id @default(cuid())
  userId          String
  date            DateTime @db.Date
  loginCount      Int      @default(0)
  featuresUsed    String[] @default([])
  timeSpent       Int      @default(0)
  actionsCount    Int      @default(0)
  @@unique([userId, date])
}
```

## API Routes

### POST /api/analytics/events
Track an analytics event.

**Request Body:**
```json
{
  "userId": "user_123",
  "eventType": "website_created",
  "eventCategory": "FEATURE_USE",
  "eventData": {
    "websiteId": "website_456"
  },
  "sessionId": "session_789",
  "deviceType": "desktop",
  "browser": "Chrome",
  "os": "macOS"
}
```

**Response:**
```json
{
  "tracked": true,
  "eventId": "event_123"
}
```

### GET /api/analytics/events
Fetch analytics events.

**Query Parameters:**
- `userId` - Filter by user ID
- `eventCategory` - Filter by event category
- `startDate` - ISO date string
- `endDate` - ISO date string
- `limit` - Number of events to return (default: 100)

### GET /api/analytics/metrics
Fetch aggregated metrics.

**Query Parameters:**
- `metricType` - Metric type (dau, wau, mau, revenue, etc.)
- `startDate` - ISO date string
- `endDate` - ISO date string

### POST /api/analytics/metrics
Create or update a metric.

**Request Body:**
```json
{
  "date": "2025-01-15",
  "metricType": "dau",
  "metricValue": 150,
  "metadata": {}
}
```

### PUT /api/analytics/metrics?date=2025-01-15
Calculate and aggregate all metrics for a specific date.

**Response:**
```json
{
  "success": true,
  "date": "2025-01-15T00:00:00.000Z",
  "metrics": {
    "dau": 150,
    "wau": 450,
    "mau": 1200,
    "new_users": 25,
    "revenue": 520.50,
    "avg_session_duration": 180,
    "page_views": 3400,
    "conversion_rate": 0.05
  }
}
```

### GET /api/analytics/sessions
Fetch user sessions.

**Query Parameters:**
- `userId` - Filter by user ID
- `startDate` - ISO date string
- `endDate` - ISO date string
- `limit` - Number of sessions to return (default: 100)

### DELETE /api/analytics/user/:userId
Delete all analytics data for a user (GDPR right to be forgotten).

### GET /api/analytics/user/:userId/export
Export all analytics data for a user (GDPR data portability).

**Response:**
```json
{
  "userId": "user_123",
  "exportDate": "2025-01-15T10:30:00.000Z",
  "events": [...],
  "sessions": [...],
  "activities": [...],
  "summary": {
    "totalEvents": 1250,
    "totalSessions": 45,
    "totalActivityDays": 30,
    "dateRange": {
      "first": "2024-12-15T00:00:00.000Z",
      "last": "2025-01-15T00:00:00.000Z"
    }
  }
}
```

## Client-Side Tracking

### Initialize Tracker

```typescript
import { AnalyticsTracker } from '@/lib/analytics-tracking'

// Initialize tracker
const tracker = new AnalyticsTracker('user_123')

// Track page view
await tracker.trackPageView('/analytics', 'Analytics Dashboard')

// Track feature usage
await tracker.trackFeatureUse('website_created', {
  websiteId: 'website_456',
  template: 'business',
})

// Track conversion
await tracker.trackConversion('subscription_started', 26, {
  tier: 'BOLD',
  billingPeriod: 'monthly',
})

// Track revenue
await tracker.trackRevenue(26, 'GBP', {
  subscriptionId: 'sub_123',
  tier: 'BOLD',
})

// End session
await tracker.endSession()
```

### Feature Tracking Helpers

```typescript
import { trackFeature } from '@/lib/analytics-tracking'

// Track website created
trackFeature.websiteCreated('website_123')

// Track website published
trackFeature.websitePublished('website_123', 'example.com')

// Track design created
trackFeature.designCreated('design_456', 'social-media-post')

// Track design exported
trackFeature.designExported('design_456', 'png')

// Track AI image generated
trackFeature.aiImageGenerated('image_789', 'DALLE3')

// Track video uploaded
trackFeature.videoUploaded('video_123', 120)

// Track video clip created
trackFeature.videoClipCreated('clip_456', 'YOUTUBE_SHORT')
```

### Privacy Controls

```typescript
import { AnalyticsPrivacy } from '@/lib/analytics-tracking'

// Check if tracking is allowed
const canTrack = AnalyticsPrivacy.isTrackingAllowed('user_123')

// Get consent status
const consent = AnalyticsPrivacy.getConsentStatus()
// Returns: { analytics: boolean, marketing: boolean, necessary: boolean }

// Set consent preferences
AnalyticsPrivacy.setConsent({
  analytics: true,
  marketing: false,
  necessary: true,
})

// Delete user data (GDPR)
await AnalyticsPrivacy.deleteUserData('user_123')

// Export user data (GDPR)
const userData = await AnalyticsPrivacy.exportUserData('user_123')
```

## Real-time Analytics

### WebSocket Connection (Planned)

```typescript
import { RealtimeAnalytics } from '@/lib/analytics-tracking'

const realtime = new RealtimeAnalytics()

// Connect to WebSocket
realtime.connect('user_123')

// Listen for updates
window.addEventListener('analytics-update', (event) => {
  const data = event.detail
  console.log('Analytics update:', data)
})

// Disconnect
realtime.disconnect()
```

## Metrics Calculation

### Daily Metrics Aggregation

Run this as a cron job daily to calculate metrics:

```bash
# Calculate metrics for today
curl -X PUT "https://yourdomain.com/api/analytics/metrics?date=2025-01-15"

# Calculate metrics for specific date
curl -X PUT "https://yourdomain.com/api/analytics/metrics?date=2025-01-01"
```

### Cron Job Setup

Add to your cron scheduler:

```bash
# Run daily at 1 AM UTC
0 1 * * * curl -X PUT "https://yourdomain.com/api/analytics/metrics?date=$(date -u +\%Y-\%m-\%d)"
```

Or use Vercel Cron:

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/analytics/metrics",
      "schedule": "0 1 * * *"
    }
  ]
}
```

## Chart Components

### LineChart

```typescript
import { LineChart } from '@/components/analytics'

const data = [
  { label: 'Jan 1', value: 100 },
  { label: 'Jan 2', value: 150 },
  { label: 'Jan 3', value: 130 },
]

<LineChart data={data} height={200} color="#EC4899" />
```

### BarChart

```typescript
import { BarChart } from '@/components/analytics'

const data = [
  { label: 'Websites', value: 45, color: '#EC4899' },
  { label: 'Designs', value: 120, color: '#A855F7' },
  { label: 'Images', value: 80, color: '#F97316' },
]

<BarChart data={data} height={300} />
```

### PieChart

```typescript
import { PieChart } from '@/components/analytics'

const data = [
  { label: 'Desktop', value: 60 },
  { label: 'Mobile', value: 35 },
  { label: 'Tablet', value: 5 },
]

<PieChart data={data} size={200} />
```

### AreaChart

```typescript
import { AreaChart } from '@/components/analytics'

const data = [
  { label: 'Week 1', value: 1000 },
  { label: 'Week 2', value: 1200 },
  { label: 'Week 3', value: 1100 },
]

<AreaChart data={data} height={200} color="#EC4899" gradient={true} />
```

### MetricCard

```typescript
import { MetricCard } from '@/components/analytics'
import { Users } from 'lucide-react'

<MetricCard
  title="Daily Active Users"
  value={150}
  change={12.5}
  icon={Users}
  color="from-blue-500 to-cyan-500"
/>
```

## Event Types

### Page View Events
- `page_view` - User viewed a page
- `page_exit` - User left a page

### Feature Usage Events
- `website_created` - User created a website
- `website_published` - User published a website
- `design_created` - User created a design
- `design_exported` - User exported a design
- `ai_image_generated` - User generated an AI image
- `video_uploaded` - User uploaded a video
- `video_clip_created` - User created a video clip

### Conversion Events
- `signup` - User signed up
- `subscription_started` - User started subscription
- `subscription_upgraded` - User upgraded subscription
- `subscription_cancelled` - User cancelled subscription

### Engagement Events
- `session_start` - User session started
- `session_end` - User session ended
- `button_click` - User clicked a button
- `form_submit` - User submitted a form

### Revenue Events
- `payment_success` - Payment successful
- `payment_failed` - Payment failed
- `refund_processed` - Refund processed

## Best Practices

### 1. Event Tracking
- Track events asynchronously to avoid blocking UI
- Use descriptive event names
- Include relevant metadata in `eventData`
- Respect user privacy preferences

### 2. Performance
- Use metrics aggregation for historical data
- Implement pagination for large result sets
- Cache frequently accessed metrics
- Use database indexes on commonly queried fields

### 3. Privacy
- Always anonymize IP addresses
- Respect Do Not Track headers
- Implement cookie consent
- Provide data export and deletion

### 4. Data Retention
- Archive old events after 90 days
- Keep aggregated metrics indefinitely
- Implement data cleanup cron jobs

## Troubleshooting

### Events Not Tracking
1. Check if tracking is allowed: `AnalyticsPrivacy.isTrackingAllowed()`
2. Verify API endpoint is accessible
3. Check browser console for errors
4. Ensure session ID is being generated

### Metrics Not Calculating
1. Run manual metrics calculation: `PUT /api/analytics/metrics?date=YYYY-MM-DD`
2. Check database for raw events
3. Verify date format is correct
4. Check server logs for errors

### Real-time Updates Not Working
1. Verify WebSocket connection
2. Check network tab for WebSocket errors
3. Ensure proper authentication
4. Check firewall/proxy settings

## Future Enhancements

- [ ] Funnel analysis
- [ ] A/B testing framework
- [ ] Cohort analysis
- [ ] Geographic heatmaps
- [ ] Custom event definitions
- [ ] Automated anomaly detection
- [ ] Predictive analytics
- [ ] Integration with third-party analytics
- [ ] Mobile app analytics
- [ ] Advanced segmentation

## Related Documentation

- [Website Builder System](./WEBSITE_BUILDER.md)
- [Design Tools](./DESIGN_TOOLS.md)
- [AI Image Generation](./AI_IMAGE_GENERATION.md)
- [Video Editor](./VIDEO_EDITOR.md)
- [Settings Pages](./SETTINGS.md)
