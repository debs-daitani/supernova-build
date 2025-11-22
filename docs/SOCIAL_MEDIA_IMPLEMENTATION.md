# Social Media Management System - Implementation Guide

## Overview

The Social Media Management System for The dAItaniverse platform allows users to connect multiple social media platforms, compose posts, schedule content, and track engagement across Twitter/X, LinkedIn, Instagram, Facebook, and TikTok.

**Current Status**: ~50% Complete (Infrastructure + Core Features)

---

## ✅ What's Been Built

### 1. Database Schema (100% Complete)

**Location**: `prisma/schema.prisma`

#### Enums Created:
```prisma
enum SocialPlatformType {
  TWITTER
  LINKEDIN
  INSTAGRAM
  FACEBOOK
  TIKTOK
}

enum SocialPostStatus {
  DRAFT
  SCHEDULED
  PUBLISHING
  PUBLISHED
  FAILED
}

enum SocialQueueStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
}
```

#### Models Created:

**SocialPlatform** - Stores OAuth connections to social platforms
- Fields: platform, isConnected, accessToken, refreshToken, tokenExpiresAt, platformUserId, platformUsername
- Relations: User, posts through SocialPostPlatform
- Indexes: userId_platform (unique)

**SocialPost** - Main post content and scheduling
- Fields: content, mediaUrls (JSON), platforms (String[]), status, scheduledFor, publishedAt, engagementStats (JSON)
- Relations: User, platformPosts, queue entries
- Supports: Multi-platform posting, scheduling, engagement tracking

**SocialPostPlatform** - Platform-specific post instances
- Fields: platform, status, platformPostId, error, publishedAt, engagementStats (JSON)
- Relations: SocialPost, SocialPlatform
- Tracks: Per-platform publishing status and engagement

**SocialMediaQueue** - Scheduling and retry queue
- Fields: scheduledFor, status, attempts, lastAttemptAt, error
- Relations: User, SocialPost
- Enables: Scheduled publishing, retry logic

### 2. Utility Library (100% Complete)

**Location**: `src/lib/social-media.ts` (553 lines)

#### Tier-Based Limits:
```typescript
SOCIAL_LIMITS = {
  FREE: { platforms: 0, postsPerMonth: 0 },
  UPGRADE: { platforms: 1, postsPerMonth: 20 },     // BRAVE
  MEMBER: { platforms: Infinity, postsPerMonth: 60 }, // BOLD
  ADMIN: { platforms: Infinity, postsPerMonth: Infinity }, // BADASS
}
```

#### Platform Character Limits:
```typescript
CHARACTER_LIMITS = {
  TWITTER: 280,
  LINKEDIN: 3000,
  INSTAGRAM: 2200,
  FACEBOOK: 63206,
  TIKTOK: 2200,
}
```

#### Core Functions:
- ✅ `canConnectPlatform()` - Check platform quota
- ✅ `canSchedulePost()` - Check monthly post quota
- ✅ `connectPlatform()` - Save OAuth connection
- ✅ `disconnectPlatform()` - Remove platform connection
- ✅ `getConnectedPlatforms()` - List user's platforms
- ✅ `createSocialPost()` - Create post with validation
- ✅ `updateSocialPost()` - Edit draft/scheduled posts
- ✅ `deleteSocialPost()` - Delete non-published posts
- ✅ `duplicateSocialPost()` - Clone existing post
- ✅ `getUserPosts()` - List posts with filters
- ✅ `validateCharacterCount()` - Per-platform validation
- ✅ `validatePostForPlatforms()` - Multi-platform validation
- ✅ `getSocialAnalytics()` - Calculate engagement stats
- ✅ `needsTokenRefresh()` - Check token expiry

### 3. API Routes (100% Complete)

#### Platform Management:
- ✅ `GET /api/social/platforms` - List connected platforms + quota
- ✅ `POST /api/social/platforms` - Connect new platform (OAuth callback target)
- ✅ `DELETE /api/social/platforms/[id]` - Disconnect platform

#### Post Management:
- ✅ `GET /api/social/posts` - List posts with filters (status, platform, date range)
- ✅ `POST /api/social/posts` - Create new post (draft or scheduled)
- ✅ `GET /api/social/posts/[id]` - Get post details with platform posts
- ✅ `PATCH /api/social/posts/[id]` - Update draft/scheduled post
- ✅ `DELETE /api/social/posts/[id]` - Delete draft/scheduled post
- ✅ `POST /api/social/posts/[id]/duplicate` - Clone post as draft

#### Analytics:
- ✅ `GET /api/social/analytics` - Get engagement stats (default 30 days)

### 4. Frontend Pages (60% Complete)

#### Platforms Connection Page (100% Complete)
**Location**: `src/app/social/platforms/page.tsx`

Features:
- ✅ Grid display of all 5 platforms with icons/colors
- ✅ Connection status indicators
- ✅ Platform quota tracking with progress bar
- ✅ Token expiry warnings (expiring soon / expired)
- ✅ Connect/Disconnect buttons
- ✅ OAuth integration placeholder (needs platform-specific setup)
- ✅ Responsive design

#### Post Composer Page (100% Complete)
**Location**: `src/app/social/compose/page.tsx`

Features:
- ✅ Platform selection (multi-select with visual feedback)
- ✅ Content textarea with character counter
- ✅ Real-time character validation per platform
- ✅ Platform-specific limit warnings
- ✅ Schedule date/time picker
- ✅ Media upload placeholder (UI only)
- ✅ Save as draft / Schedule actions
- ✅ No platforms warning with redirect

#### Posts List Page (100% Complete)
**Location**: `src/app/social/posts/page.tsx`

Features:
- ✅ Grid view of all posts
- ✅ Status filters (All, Draft, Scheduled, Published)
- ✅ Status badges with icons
- ✅ Platform icons per post
- ✅ Content preview (line-clamp-4)
- ✅ Scheduled date display
- ✅ Published date display
- ✅ Engagement stats for published posts
- ✅ Duplicate action
- ✅ Delete action (draft/scheduled only)
- ✅ Empty state

---

## ⏳ What Remains To Be Built

### 1. OAuth Integration (CRITICAL - Required for Production)

**Estimated Time**: 24-32 hours

Each platform requires separate OAuth 2.0 setup:

#### Twitter/X OAuth 2.0 with PKCE
**Reference**: https://developer.twitter.com/en/docs/authentication/oauth-2-0

Setup Steps:
1. Create app at https://developer.twitter.com/en/portal/dashboard
2. Enable OAuth 2.0 with PKCE
3. Set callback URL: `https://yourdomain.com/api/social/auth/twitter/callback`
4. Required scopes: `tweet.read`, `tweet.write`, `users.read`, `offline.access`
5. Store credentials in env: `TWITTER_CLIENT_ID`, `TWITTER_CLIENT_SECRET`

Implementation:
```typescript
// src/app/api/social/auth/twitter/route.ts
export async function GET() {
  const authUrl = new URL('https://twitter.com/i/oauth2/authorize')
  authUrl.searchParams.set('response_type', 'code')
  authUrl.searchParams.set('client_id', process.env.TWITTER_CLIENT_ID!)
  authUrl.searchParams.set('redirect_uri', `${process.env.NEXTAUTH_URL}/api/social/auth/twitter/callback`)
  authUrl.searchParams.set('scope', 'tweet.read tweet.write users.read offline.access')
  authUrl.searchParams.set('state', generateRandomState())
  authUrl.searchParams.set('code_challenge', generatePKCEChallenge())
  authUrl.searchParams.set('code_challenge_method', 'S256')

  return NextResponse.redirect(authUrl.toString())
}

// src/app/api/social/auth/twitter/callback/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')

  // Exchange code for access token
  const tokenResponse = await fetch('https://api.twitter.com/2/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code: code!,
      grant_type: 'authorization_code',
      client_id: process.env.TWITTER_CLIENT_ID!,
      redirect_uri: `${process.env.NEXTAUTH_URL}/api/social/auth/twitter/callback`,
      code_verifier: getPKCEVerifier(), // Stored in session
    }),
  })

  const tokens = await tokenResponse.json()

  // Get user info
  const userResponse = await fetch('https://api.twitter.com/2/users/me', {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  })
  const userData = await userResponse.json()

  // Save to database using connectPlatform()
  await connectPlatform(userId, 'TWITTER', {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    tokenExpiresAt: new Date(Date.now() + tokens.expires_in * 1000),
    platformUserId: userData.data.id,
    platformUsername: userData.data.username,
  })

  return NextResponse.redirect('/social/platforms')
}
```

#### LinkedIn OAuth 2.0
**Reference**: https://learn.microsoft.com/en-us/linkedin/shared/authentication/authentication

Setup Steps:
1. Create app at https://www.linkedin.com/developers/apps
2. Request `w_member_social` product access
3. Set callback URL: `https://yourdomain.com/api/social/auth/linkedin/callback`
4. Required scopes: `openid`, `profile`, `w_member_social`
5. Store credentials: `LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET`

Implementation Pattern:
```typescript
// Similar to Twitter but using LinkedIn API endpoints
// Auth URL: https://www.linkedin.com/oauth/v2/authorization
// Token URL: https://www.linkedin.com/oauth/v2/accessToken
// User API: https://api.linkedin.com/v2/userinfo
// Post API: https://api.linkedin.com/v2/ugcPosts
```

#### Instagram via Facebook Graph API
**Reference**: https://developers.facebook.com/docs/instagram-api

Setup Steps:
1. Create app at https://developers.facebook.com
2. Add Instagram Graph API product
3. Requires Instagram Business Account connected to Facebook Page
4. Set callback URL: `https://yourdomain.com/api/social/auth/instagram/callback`
5. Required permissions: `instagram_basic`, `instagram_content_publish`, `pages_read_engagement`
6. Store credentials: `FACEBOOK_APP_ID`, `FACEBOOK_APP_SECRET`

Note: Instagram API uses Facebook's OAuth flow

#### Facebook Graph API
**Reference**: https://developers.facebook.com/docs/facebook-login

Setup Steps:
1. Same app as Instagram (Meta for Developers)
2. Add Facebook Login product
3. Required permissions: `pages_show_list`, `pages_read_engagement`, `pages_manage_posts`, `publish_to_groups`
4. Store credentials: `FACEBOOK_APP_ID`, `FACEBOOK_APP_SECRET`

#### TikTok for Developers
**Reference**: https://developers.tiktok.com/doc/login-kit-web

Setup Steps:
1. Apply for TikTok Developer account
2. Create app at https://developers.tiktok.com
3. Request `video.upload` and `user.info.basic` scopes
4. Set callback URL: `https://yourdomain.com/api/social/auth/tiktok/callback`
5. Store credentials: `TIKTOK_CLIENT_KEY`, `TIKTOK_CLIENT_SECRET`

### 2. Publishing Service (CRITICAL)

**Estimated Time**: 16-24 hours

Create background worker to process scheduled posts:

```typescript
// src/lib/social-publisher.ts

export async function processQueuedPosts() {
  const now = new Date()

  // Get pending posts scheduled for now or earlier
  const queueItems = await prisma.socialMediaQueue.findMany({
    where: {
      status: 'PENDING',
      scheduledFor: { lte: now },
    },
    include: {
      socialPost: {
        include: {
          platformPosts: {
            include: { platform: true },
          },
        },
      },
    },
    take: 10, // Process 10 at a time
  })

  for (const item of queueItems) {
    await publishPost(item.socialPost)
  }
}

async function publishPost(post: SocialPost) {
  // Update post status
  await prisma.socialPost.update({
    where: { id: post.id },
    data: { status: 'PUBLISHING' },
  })

  // Publish to each platform
  for (const platformPost of post.platformPosts) {
    try {
      const result = await publishToPlatform(
        platformPost.platform.platform,
        platformPost.platform.accessToken,
        post.content,
        post.mediaUrls
      )

      // Update platform post
      await prisma.socialPostPlatform.update({
        where: { id: platformPost.id },
        data: {
          status: 'PUBLISHED',
          platformPostId: result.id,
          publishedAt: new Date(),
        },
      })
    } catch (error) {
      // Log error
      await prisma.socialPostPlatform.update({
        where: { id: platformPost.id },
        data: {
          status: 'FAILED',
          error: error.message,
        },
      })
    }
  }

  // Update main post status
  const allPublished = post.platformPosts.every(p => p.status === 'PUBLISHED')
  await prisma.socialPost.update({
    where: { id: post.id },
    data: {
      status: allPublished ? 'PUBLISHED' : 'FAILED',
      publishedAt: allPublished ? new Date() : null,
    },
  })

  // Update queue
  await prisma.socialMediaQueue.update({
    where: { id: item.id },
    data: { status: 'COMPLETED' },
  })
}

async function publishToPlatform(platform: string, token: string, content: string, media?: any) {
  switch (platform) {
    case 'TWITTER':
      return await publishToTwitter(token, content, media)
    case 'LINKEDIN':
      return await publishToLinkedIn(token, content, media)
    case 'INSTAGRAM':
      return await publishToInstagram(token, content, media)
    case 'FACEBOOK':
      return await publishToFacebook(token, content, media)
    case 'TIKTOK':
      return await publishToTikTok(token, content, media)
  }
}

async function publishToTwitter(token: string, content: string, media?: any) {
  // Upload media if present
  let mediaIds: string[] = []
  if (media && media.length > 0) {
    for (const mediaUrl of media) {
      const upload = await fetch('https://upload.twitter.com/1.1/media/upload.json', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: /* media data */,
      })
      const { media_id_string } = await upload.json()
      mediaIds.push(media_id_string)
    }
  }

  // Create tweet
  const response = await fetch('https://api.twitter.com/2/tweets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: content,
      media: mediaIds.length > 0 ? { media_ids: mediaIds } : undefined,
    }),
  })

  const data = await response.json()
  return { id: data.data.id }
}

// Similar implementations for other platforms...
```

Cron Job Setup:
```typescript
// src/app/api/cron/social-queue/route.ts
import { processQueuedPosts } from '@/lib/social-publisher'

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  await processQueuedPosts()

  return Response.json({ success: true })
}
```

Vercel Cron Configuration (`vercel.json`):
```json
{
  "crons": [{
    "path": "/api/cron/social-queue",
    "schedule": "*/5 * * * *"
  }]
}
```

### 3. Media Upload (HIGH PRIORITY)

**Estimated Time**: 8-12 hours

Implement file upload for images/videos:

```typescript
// src/app/api/social/media/upload/route.ts
import { put } from '@vercel/blob'

export async function POST(request: Request) {
  const formData = await request.formData()
  const file = formData.get('file') as File

  // Validate file type and size
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/quicktime']
  if (!allowedTypes.includes(file.type)) {
    return Response.json({ error: 'Invalid file type' }, { status: 400 })
  }

  const maxSize = 100 * 1024 * 1024 // 100MB
  if (file.size > maxSize) {
    return Response.json({ error: 'File too large' }, { status: 400 })
  }

  // Upload to Vercel Blob Storage
  const blob = await put(file.name, file, { access: 'public' })

  return Response.json({ url: blob.url })
}
```

Update Composer:
```typescript
// In src/app/social/compose/page.tsx
const [uploading, setUploading] = useState(false)

const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = Array.from(e.target.files || [])
  setUploading(true)

  const uploadedUrls: string[] = []
  for (const file of files) {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('/api/social/media/upload', {
      method: 'POST',
      body: formData,
    })

    const { url } = await response.json()
    uploadedUrls.push(url)
  }

  setFormData(prev => ({
    ...prev,
    mediaUrls: [...prev.mediaUrls, ...uploadedUrls],
  }))
  setUploading(false)
}
```

### 4. Additional Frontend Pages (MEDIUM PRIORITY)

**Estimated Time**: 12-16 hours

#### Calendar View (`src/app/social/calendar/page.tsx`)
- Monthly calendar with scheduled posts
- Drag-and-drop to reschedule
- Day view with all posts
- Filter by platform
- Quick edit/delete actions

Implementation Suggestion:
```typescript
import { Calendar as BigCalendar } from 'react-big-calendar'

export default function CalendarPage() {
  const [events, setEvents] = useState([])

  useEffect(() => {
    // Fetch scheduled posts
    fetch('/api/social/posts?status=SCHEDULED')
      .then(r => r.json())
      .then(posts => {
        const events = posts.map(post => ({
          id: post.id,
          title: post.content.substring(0, 50),
          start: new Date(post.scheduledFor),
          end: new Date(post.scheduledFor),
          resource: post,
        }))
        setEvents(events)
      })
  }, [])

  const handleEventDrop = async ({ event, start }) => {
    await fetch(`/api/social/posts/${event.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scheduledFor: start }),
    })
    // Refresh events
  }

  return (
    <BigCalendar
      events={events}
      onEventDrop={handleEventDrop}
      // ... other props
    />
  )
}
```

#### Analytics Dashboard (`src/app/social/analytics/page.tsx`)
- Total posts per platform
- Engagement metrics (likes, comments, shares)
- Best performing posts
- Posting frequency chart
- Platform comparison

Implementation:
```typescript
export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState(null)
  const [days, setDays] = useState(30)

  useEffect(() => {
    fetch(`/api/social/analytics?days=${days}`)
      .then(r => r.json())
      .then(setAnalytics)
  }, [days])

  return (
    // Stats cards + charts using recharts or similar
  )
}
```

#### Queue Management (`src/app/admin/social/queue/page.tsx`)
- Admin-only page
- View all queued posts
- Retry failed posts
- Manual trigger
- View errors

### 5. Token Refresh System (CRITICAL)

**Estimated Time**: 6-8 hours

Implement automatic token refresh before expiry:

```typescript
// src/lib/social-token-refresh.ts

export async function refreshPlatformToken(platform: SocialPlatform) {
  switch (platform.platform) {
    case 'TWITTER':
      return await refreshTwitterToken(platform)
    case 'LINKEDIN':
      return await refreshLinkedInToken(platform)
    // ... other platforms
  }
}

async function refreshTwitterToken(platform: SocialPlatform) {
  const response = await fetch('https://api.twitter.com/2/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: platform.refreshToken!,
      client_id: process.env.TWITTER_CLIENT_ID!,
    }),
  })

  const tokens = await response.json()

  // Update platform
  await prisma.socialPlatform.update({
    where: { id: platform.id },
    data: {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      tokenExpiresAt: new Date(Date.now() + tokens.expires_in * 1000),
    },
  })

  return tokens.access_token
}

// Cron job to check and refresh expiring tokens
export async function checkAndRefreshTokens() {
  const expiringPlatforms = await prisma.socialPlatform.findMany({
    where: {
      isConnected: true,
      tokenExpiresAt: {
        lte: new Date(Date.now() + 24 * 60 * 60 * 1000), // Expiring within 24 hours
        gt: new Date(),
      },
    },
  })

  for (const platform of expiringPlatforms) {
    try {
      await refreshPlatformToken(platform)
    } catch (error) {
      console.error(`Failed to refresh token for platform ${platform.id}:`, error)
    }
  }
}
```

### 6. Engagement Tracking (MEDIUM PRIORITY)

**Estimated Time**: 8-12 hours

Fetch engagement stats from platforms:

```typescript
// src/lib/social-engagement.ts

export async function updateEngagementStats(post: SocialPost) {
  for (const platformPost of post.platformPosts) {
    if (!platformPost.platformPostId) continue

    const stats = await fetchEngagementFromPlatform(
      platformPost.platform.platform,
      platformPost.platform.accessToken,
      platformPost.platformPostId
    )

    await prisma.socialPostPlatform.update({
      where: { id: platformPost.id },
      data: { engagementStats: stats },
    })
  }

  // Aggregate to main post
  const totalStats = aggregateEngagement(post.platformPosts)
  await prisma.socialPost.update({
    where: { id: post.id },
    data: { engagementStats: totalStats },
  })
}

async function fetchEngagementFromPlatform(platform: string, token: string, postId: string) {
  switch (platform) {
    case 'TWITTER':
      const response = await fetch(`https://api.twitter.com/2/tweets/${postId}?tweet.fields=public_metrics`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      return {
        likes: data.data.public_metrics.like_count,
        comments: data.data.public_metrics.reply_count,
        shares: data.data.public_metrics.retweet_count,
        impressions: data.data.public_metrics.impression_count,
      }
    // ... other platforms
  }
}

// Cron job to update engagement stats
export async function updateAllEngagementStats() {
  const recentPosts = await prisma.socialPost.findMany({
    where: {
      status: 'PUBLISHED',
      publishedAt: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
      },
    },
    include: { platformPosts: { include: { platform: true } } },
  })

  for (const post of recentPosts) {
    await updateEngagementStats(post)
  }
}
```

### 7. Error Handling & Retry Logic (MEDIUM PRIORITY)

**Estimated Time**: 4-6 hours

Implement retry mechanism for failed posts:

```typescript
// src/lib/social-retry.ts

export async function retryFailedPost(queueItemId: string) {
  const queueItem = await prisma.socialMediaQueue.findUnique({
    where: { id: queueItemId },
    include: { socialPost: true },
  })

  if (!queueItem || queueItem.attempts >= 3) {
    throw new Error('Max retry attempts reached')
  }

  // Update attempts
  await prisma.socialMediaQueue.update({
    where: { id: queueItemId },
    data: {
      attempts: queueItem.attempts + 1,
      lastAttemptAt: new Date(),
      status: 'PENDING',
    },
  })

  // Process the post
  await publishPost(queueItem.socialPost)
}
```

---

## 🔐 Security Considerations

### 1. Token Storage
**Current**: Access tokens stored in plain text (TODO comment added)

**Required**:
```typescript
import crypto from 'crypto'

const ENCRYPTION_KEY = process.env.TOKEN_ENCRYPTION_KEY! // 32 bytes
const IV_LENGTH = 16

function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv)
  let encrypted = cipher.update(text)
  encrypted = Buffer.concat([encrypted, cipher.final()])
  return iv.toString('hex') + ':' + encrypted.toString('hex')
}

function decrypt(text: string): string {
  const textParts = text.split(':')
  const iv = Buffer.from(textParts.shift()!, 'hex')
  const encryptedText = Buffer.from(textParts.join(':'), 'hex')
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv)
  let decrypted = decipher.update(encryptedText)
  decrypted = Buffer.concat([decrypted, decipher.final()])
  return decrypted.toString()
}

// Update connectPlatform() to encrypt tokens before saving
```

### 2. OAuth State Validation
- Generate random state parameter for each OAuth flow
- Store in session and validate on callback
- Prevents CSRF attacks

### 3. Rate Limiting
- Implement rate limiting on API routes
- Respect platform API rate limits
- Queue posts when approaching limits

---

## 📊 Completion Estimates

| Component | Status | Remaining Time |
|-----------|--------|----------------|
| Database Schema | ✅ 100% | 0 hours |
| Utility Library | ✅ 100% | 0 hours |
| API Routes | ✅ 100% | 0 hours |
| Platforms Page | ✅ 100% | 0 hours |
| Composer Page | ✅ 100% | 0 hours |
| Posts List Page | ✅ 100% | 0 hours |
| OAuth Integration | ⏳ 0% | 24-32 hours |
| Publishing Service | ⏳ 0% | 16-24 hours |
| Media Upload | ⏳ 0% | 8-12 hours |
| Calendar View | ⏳ 0% | 6-8 hours |
| Analytics Page | ⏳ 0% | 6-8 hours |
| Queue Management | ⏳ 0% | 4-6 hours |
| Token Refresh | ⏳ 0% | 6-8 hours |
| Engagement Tracking | ⏳ 0% | 8-12 hours |
| Error Handling | ⏳ 0% | 4-6 hours |
| Security Hardening | ⏳ 0% | 4-6 hours |

**Total Remaining**: ~86-122 hours (11-15 business days)

**Priority Order for Production**:
1. OAuth Integration (CRITICAL - 24-32h)
2. Publishing Service (CRITICAL - 16-24h)
3. Token Refresh (CRITICAL - 6-8h)
4. Security Hardening (HIGH - 4-6h)
5. Media Upload (HIGH - 8-12h)
6. Error Handling (MEDIUM - 4-6h)
7. Engagement Tracking (MEDIUM - 8-12h)
8. Calendar View (MEDIUM - 6-8h)
9. Analytics Page (MEDIUM - 6-8h)
10. Queue Management (LOW - 4-6h)

---

## 🧪 Testing Strategy

### 1. OAuth Flow Testing
- Test each platform's OAuth flow in development
- Verify token storage and refresh
- Test connection/disconnection

### 2. Publishing Testing
- Test draft creation
- Test scheduling future posts
- Test immediate publishing (when implemented)
- Test multi-platform posts
- Test character limit validation

### 3. Queue Processing Testing
- Test cron job execution
- Test retry logic for failures
- Test concurrent post processing
- Test platform API error handling

### 4. Engagement Tracking Testing
- Verify stats fetching from each platform
- Test aggregation accuracy
- Test update frequency

---

## 📝 Environment Variables Required

```bash
# OAuth Credentials
TWITTER_CLIENT_ID=
TWITTER_CLIENT_SECRET=
LINKEDIN_CLIENT_ID=
LINKEDIN_CLIENT_SECRET=
FACEBOOK_APP_ID=
FACEBOOK_APP_SECRET=
TIKTOK_CLIENT_KEY=
TIKTOK_CLIENT_SECRET=

# Token Encryption
TOKEN_ENCRYPTION_KEY= # 32-byte hex string

# Cron Security
CRON_SECRET= # Random string for cron authentication

# Application URL
NEXTAUTH_URL=https://yourdomain.com
```

---

## 🚀 Deployment Checklist

- [ ] Set up OAuth apps for all platforms
- [ ] Configure callback URLs in platform developer portals
- [ ] Add all environment variables to Vercel
- [ ] Set up Vercel Blob Storage for media uploads
- [ ] Configure Vercel Cron jobs
- [ ] Test OAuth flow in production
- [ ] Test post scheduling
- [ ] Monitor queue processing
- [ ] Set up error alerting (Sentry, etc.)
- [ ] Document user-facing OAuth setup guide

---

## 📚 Additional Resources

- [Twitter API v2 Documentation](https://developer.twitter.com/en/docs/twitter-api)
- [LinkedIn API Documentation](https://learn.microsoft.com/en-us/linkedin/shared/api-guide/concepts)
- [Instagram Graph API Documentation](https://developers.facebook.com/docs/instagram-api)
- [Facebook Graph API Documentation](https://developers.facebook.com/docs/graph-api)
- [TikTok API Documentation](https://developers.tiktok.com/doc/overview)

---

**Built By**: Claude (Anthropic AI)
**Date**: November 22, 2025
**Version**: 1.0
**Status**: Infrastructure Complete (50%) - OAuth & Publishing Required for Production
