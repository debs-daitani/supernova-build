# Community & Forum System

Comprehensive community forum for midlife entrepreneurs to connect, share, and support each other.

## Overview

The Community & Forum System replaces third-party platforms like Circle, Mighty Networks, or Discourse with an integrated forum built specifically for the dAItaniverse platform. It enables users to ask questions, share wins, discuss strategies, and build connections.

## Features

### Forum Structure
- **6 Default Categories**:
  - Getting Started
  - Business Building
  - Neurodivergent Entrepreneurs
  - Wins & Celebrations
  - Tools & Resources
  - Off-Topic

### Thread Management
- Create, view, edit, and delete threads
- Pin threads (stay at top)
- Lock threads (prevent replies)
- Feature threads (highlight on home)
- Tag system for organization
- View and reply counts
- Thread slugs for SEO-friendly URLs

### Posting
- Rich text content support
- Edit own posts (with edited timestamp)
- Delete own posts
- Mention users with @ symbol
- Quote previous posts
- Upload images/files (planned)

### Reactions
- 5 reaction types:
  - 👍 Helpful (+5 points)
  - ❤️ Love (+2 points)
  - 🎉 Celebrate (+3 points)
  - ✨ Spark (+3 points)
  - 💎 Rockstar (+5 points)
- Track who reacted
- Toggle reactions on/off

### Reputation System
- **Points earned for**:
  - Creating thread: +5 points
  - Posting reply: +2 points
  - Receiving "Helpful" reaction: +5 points
  - Thread pinned by admin: +50 points
  - Thread featured: +25 points

- **Reputation Levels**:
  - 0-50: Newbie
  - 51-200: Contributor
  - 201-500: Expert
  - 501+: Rockstar

- **8 Badges**:
  - First Post
  - Conversation Starter (10 threads)
  - Helpful Helper (50 helpful reactions)
  - Thread Champion (thread with 100+ replies)
  - Community Builder (500+ points)
  - Early Adopter (joined in first month)
  - Rockstar (1000+ points)
  - Super Supporter (100+ helpful reactions)

### User Profiles
- Display name, bio, join date
- Reputation level and points
- Badges earned
- Stats: threads, posts, helpful count
- Recent activity
- Social links

### Subscriptions
- Subscribe to threads (get notified of replies)
- Subscribe to categories (get notified of new threads)
- Email notifications (configurable)
- In-app notifications

### Moderation
- **Admin Actions**:
  - Pin/unpin threads
  - Lock/unlock threads
  - Feature/unfeature threads
  - Delete threads and posts
  - Edit posts (shows "edited by admin")
  - Ban users (planned)
  - Warn users (planned)

- **Reporting**:
  - Report posts for: Spam, Inappropriate, Off-Topic, Harassment
  - Admin review queue
  - Action or dismiss reports

- **Auto-Moderation**:
  - Spam keyword detection
  - Flag posts from new users
  - Flag posts with multiple reports

### Search & Filtering
- Search threads by keyword
- Filter by category
- Filter by tags
- Sort: Recent, Popular, Most Replies
- Full-text search on titles and content

## Database Schema

### ForumCategory
```prisma
model ForumCategory {
  id              String   @id @default(cuid())
  name            String
  slug            String   @unique
  description     String?  @db.Text
  icon            String?
  color           String?
  order           Int      @default(0)
  isLocked        Boolean  @default(false)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  threads         ForumThread[]
  subscriptions   ForumSubscription[]
}
```

### ForumThread
```prisma
model ForumThread {
  id              String   @id @default(cuid())
  categoryId      String
  userId          String
  title           String
  slug            String   @unique
  isPinned        Boolean  @default(false)
  isLocked        Boolean  @default(false)
  isFeatured      Boolean  @default(false)
  viewCount       Int      @default(0)
  replyCount      Int      @default(0)
  lastActivityAt  DateTime @default(now())
  lastReplyUserId String?
  tags            String[] @default([])
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  category        ForumCategory
  user            User
  posts           ForumPost[]
  subscriptions   ForumSubscription[]
}
```

### ForumPost
```prisma
model ForumPost {
  id              String   @id @default(cuid())
  threadId        String
  userId          String
  content         String   @db.Text
  isFirstPost     Boolean  @default(false)
  editedAt        DateTime?
  editedByUserId  String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  thread          ForumThread
  user            User
  reactions       ForumReaction[]
  reports         ForumReport[]
}
```

### ForumReaction
```prisma
model ForumReaction {
  id              String   @id @default(cuid())
  postId          String
  userId          String
  reactionType    String   // HELPFUL, LOVE, CELEBRATE, SPARK, ROCKSTAR
  createdAt       DateTime @default(now())
  post            ForumPost
  user            User
  @@unique([postId, userId, reactionType])
}
```

### UserReputation
```prisma
model UserReputation {
  id              String   @id @default(cuid())
  userId          String   @unique
  points          Int      @default(0)
  level           String   @default("NEWBIE")
  postsCount      Int      @default(0)
  threadsCount    Int      @default(0)
  helpfulCount    Int      @default(0)
  badges          String[] @default([])
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  user            User
}
```

### ForumSubscription
```prisma
model ForumSubscription {
  id              String   @id @default(cuid())
  userId          String
  threadId        String?
  categoryId      String?
  subscriptionType String  // THREAD or CATEGORY
  createdAt       DateTime @default(now())
  user            User
  thread          ForumThread?
  category        ForumCategory?
  @@unique([userId, threadId])
  @@unique([userId, categoryId])
}
```

### ForumReport
```prisma
model ForumReport {
  id              String   @id @default(cuid())
  postId          String
  reportedByUserId String
  reason          String
  details         String?  @db.Text
  status          String   @default("PENDING")
  reviewedByAdminId String?
  reviewedAt      DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  post            ForumPost
  reportedBy      User
}
```

## API Routes

### GET /api/forum/categories
Fetch all forum categories with stats.

**Response:**
```json
[
  {
    "id": "cat_123",
    "name": "Getting Started",
    "slug": "getting-started",
    "description": "New to dAItaniverse? Start here!",
    "icon": "Rocket",
    "color": "#3B82F6",
    "threadCount": 25,
    "postCount": 150,
    "latestThread": {
      "id": "thread_456",
      "title": "Welcome!",
      "user": {...},
      "lastActivityAt": "2025-01-15T10:00:00.000Z"
    }
  }
]
```

### POST /api/forum/categories
Create a new category (admin only).

**Request Body:**
```json
{
  "name": "New Category",
  "slug": "new-category",
  "description": "Category description",
  "icon": "MessageSquare",
  "color": "#8B5CF6",
  "order": 7
}
```

### GET /api/forum/threads
Fetch threads with filtering and sorting.

**Query Parameters:**
- `categoryId` - Filter by category
- `userId` - Filter by user
- `featured` - Filter featured threads
- `sort` - Sort order: recent, popular, replies
- `page` - Page number (default: 1)
- `limit` - Results per page (default: 20)
- `search` - Search keyword

**Response:**
```json
{
  "threads": [...],
  "total": 100,
  "page": 1,
  "limit": 20,
  "pages": 5
}
```

### POST /api/forum/threads
Create a new thread.

**Request Body:**
```json
{
  "title": "Thread title",
  "content": "Thread content (HTML)",
  "categoryId": "cat_123",
  "tags": ["adhd", "marketing"]
}
```

### GET /api/forum/threads/:id
Fetch thread with all posts.

### PATCH /api/forum/threads/:id
Update thread (admin actions).

**Request Body:**
```json
{
  "isPinned": true,
  "isLocked": false,
  "isFeatured": true
}
```

### DELETE /api/forum/threads/:id
Delete thread (owner or admin).

### POST /api/forum/posts
Create a post (reply to thread).

**Request Body:**
```json
{
  "threadId": "thread_123",
  "content": "Post content (HTML)"
}
```

### PATCH /api/forum/posts/:id
Edit post (owner only).

### DELETE /api/forum/posts/:id
Delete post (owner or admin).

### POST /api/forum/reactions
Add or remove reaction.

**Request Body:**
```json
{
  "postId": "post_123",
  "reactionType": "HELPFUL"
}
```

### GET /api/forum/reputation/:userId
Fetch user reputation and badges.

**Response:**
```json
{
  "id": "rep_123",
  "userId": "user_123",
  "points": 250,
  "level": "CONTRIBUTOR",
  "postsCount": 50,
  "threadsCount": 10,
  "helpfulCount": 25,
  "badges": ["first-post", "conversation-starter"],
  "levelInfo": {
    "level": "CONTRIBUTOR",
    "label": "Contributor",
    "icon": "User",
    "color": "#3B82F6",
    "nextLevel": "EXPERT",
    "pointsToNext": 51
  }
}
```

### GET /api/forum/subscriptions
Fetch user subscriptions.

**Query Parameters:**
- `type` - THREAD or CATEGORY

### POST /api/forum/subscriptions
Subscribe/unsubscribe to thread or category.

**Request Body:**
```json
{
  "threadId": "thread_123",
  "subscriptionType": "THREAD"
}
```

### GET /api/forum/reports
Fetch reports (admin only).

**Query Parameters:**
- `status` - PENDING, REVIEWED, ACTIONED, DISMISSED

### POST /api/forum/reports
Report a post.

**Request Body:**
```json
{
  "postId": "post_123",
  "reason": "SPAM",
  "details": "This post is advertising unrelated products"
}
```

## Pages

### Forum Home (`/community`)
- Lists all categories
- Shows thread/post counts
- Displays latest activity per category
- Stats dashboard
- Create thread button

### Category View (`/community/[category]`)
- Lists threads in category
- Pinned threads at top
- Filter and sort options
- Thread cards with stats
- Create thread button

### Thread View (`/community/[category]/[thread]`)
- Thread title and tags
- Original post
- All replies
- Reaction buttons
- Reply editor
- Subscribe button
- Report button
- Breadcrumb navigation

### Create Thread (`/community/new`)
- Category selector
- Title input (10-200 characters)
- Content editor
- Tags input
- Preview (planned)
- Save draft (planned)

### User Profile (`/community/user/[id]`)
- User info (name, bio, join date)
- Reputation level and points
- Badges display
- Stats (threads, posts, helpful)
- Recent threads
- Recent posts

### My Activity (`/community/my-activity`)
- Tabs: My Threads, My Posts, Subscriptions
- Manage own content
- Edit/delete threads and posts
- Manage subscriptions

### Moderation Dashboard (`/admin/community`)
- Reports queue
- All threads list
- Pin/Lock/Feature/Delete actions
- User management (planned)
- Analytics (planned)

## Utility Functions

### Slug Generation
```typescript
import { generateSlug, makeUniqueSlug } from '@/lib/forum-utils'

const slug = generateSlug("My Thread Title")
// Returns: "my-thread-title"

const uniqueSlug = makeUniqueSlug(slug, existingSlugs)
// Returns: "my-thread-title-2" if slug exists
```

### Reputation Calculation
```typescript
import { getReputationLevel, calculatePoints } from '@/lib/forum-utils'

const levelInfo = getReputationLevel(250)
// Returns: { level: "CONTRIBUTOR", label: "Contributor", ... }

const points = calculatePoints({ type: 'CREATE_THREAD' })
// Returns: 5
```

### Badge Checking
```typescript
import { checkBadgesEarned } from '@/lib/forum-utils'

const newBadges = checkBadgesEarned({
  postsCount: 10,
  threadsCount: 5,
  helpfulCount: 20,
  points: 100,
  joinedAt: new Date('2025-01-01'),
  currentBadges: ['first-post']
})
// Returns: ['conversation-starter'] (if criteria met)
```

### Time Formatting
```typescript
import { formatTimeAgo } from '@/lib/forum-utils'

const timeAgo = formatTimeAgo(new Date('2025-01-14T10:00:00Z'))
// Returns: "2 hours ago"
```

### Validation
```typescript
import { validateThreadTitle, validatePostContent } from '@/lib/forum-utils'

const titleCheck = validateThreadTitle("Too short")
// Returns: { valid: false, error: "Title must be at least 10 characters" }

const contentCheck = validatePostContent("Valid content here...")
// Returns: { valid: true }
```

### Spam Detection
```typescript
import { containsSpam } from '@/lib/forum-utils'

const isSpam = containsSpam("Buy viagra now!")
// Returns: true
```

## Rate Limiting

Default limits (configurable):
- Threads: 5 per hour
- Posts: 20 per hour
- Reactions: 100 per hour

```typescript
import { canPerformAction, RATE_LIMITS } from '@/lib/forum-utils'

const check = canPerformAction('thread', recentThreads, RATE_LIMITS)
// Returns: { allowed: true } or { allowed: false, resetIn: 1800 }
```

## Notifications (Planned)

### Email Notifications
- Thread reply (if subscribed)
- Mention in post
- Daily/weekly digest
- Moderation actions

### In-App Notifications
- Real-time notification badge
- Notification dropdown
- Mark as read
- Notification preferences

## Security

### Content Security
- HTML sanitization (basic - use DOMPurify in production)
- XSS prevention
- SQL injection prevention (Prisma)
- CSRF protection (Next.js)

### User Privacy
- IP address not stored
- Email visible only to admins
- Optional profile visibility
- Data export (GDPR)

### Spam Prevention
- Keyword filtering
- Rate limiting
- New user flagging
- Multiple report flagging

## Performance

### Optimization
- Database indexes on:
  - threadId, userId, categoryId
  - slug fields
  - createdAt, lastActivityAt
  - isPinned, isFeatured
- Pagination (20 items per page)
- Lazy loading posts
- Cache popular threads (planned)

### Database Queries
- Use Prisma includes for relations
- Select only needed fields
- Implement cursor-based pagination for large datasets
- Use transactions for multi-step operations

## Future Enhancements

- [ ] Rich text editor (TipTap/Lexical)
- [ ] Image uploads
- [ ] File attachments
- [ ] Nested replies (1 level deep)
- [ ] Quote previous posts
- [ ] User mentions autocomplete
- [ ] Search autocomplete
- [ ] Markdown support
- [ ] Code syntax highlighting
- [ ] Polls and surveys
- [ ] Direct messages
- [ ] User blocking
- [ ] Thread bookmarking
- [ ] Thread watching
- [ ] RSS feeds per category
- [ ] Email digest subscriptions
- [ ] Mobile app integration
- [ ] Progressive Web App (PWA)

## Related Documentation

- [Website Builder System](./WEBSITE_BUILDER.md)
- [Design Tools](./DESIGN_TOOLS.md)
- [AI Image Generation](./AI_IMAGE_GENERATION.md)
- [Video Editor](./VIDEO_EDITOR.md)
- [Analytics Dashboard](./ANALYTICS_DASHBOARD.md)
- [Settings Pages](./SETTINGS.md)
