# SUPERNova AI Memory System - Implementation Plan

## Overview

This document provides a comprehensive step-by-step implementation plan for deploying the SUPERNova AI Memory System on the Wix platform.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Phase 1: Database Setup](#phase-1-database-setup)
3. [Phase 2: Backend Services](#phase-2-backend-services)
4. [Phase 3: Memory Manager](#phase-3-memory-manager)
5. [Phase 4: Frontend Integration](#phase-4-frontend-integration)
6. [Phase 5: Testing & Optimization](#phase-5-testing--optimization)
7. [Phase 6: Deployment](#phase-6-deployment)
8. [Maintenance & Monitoring](#maintenance--monitoring)

---

## Prerequisites

### Required Accounts & Access

- [ ] Wix account with Premium plan
- [ ] Wix Editor access (Editor X recommended for better development experience)
- [ ] Wix Data Collections enabled
- [ ] Developer Mode enabled in Wix Editor

### Required Knowledge

- JavaScript/TypeScript
- Wix Velo API
- Wix Data Collections
- Basic database concepts
- REST API design

### Development Tools

- Code editor (VS Code recommended)
- Wix CLI (optional, for local development)
- Git for version control
- Postman or similar for API testing

---

## Phase 1: Database Setup

**Duration**: 1-2 days

### Step 1.1: Create Wix Data Collections

For each collection, follow these steps in the Wix Editor:

1. Open your Wix site in the Editor
2. Go to **CMS** → **Add a New Collection**
3. Use the schema files in `/schema` as reference

#### Collections to Create:

**A. SupernovaUsers Collection**
```
Name: SupernovaUsers
Permissions:
  - Read: Anyone
  - Create: Admin
  - Update: Admin
  - Delete: Admin

Fields:
1. userId (Text, Required, Unique)
2. email (Text)
3. displayName (Text)
4. firstName (Text)
5. lastName (Text)
6. createdAt (Date & Time, Required)
7. lastActiveAt (Date & Time, Required)
8. totalConversations (Number, Required, Default: 0)
9. totalMessages (Number, Required, Default: 0)
10. preferences (Object)
11. metadata (Object)
12. status (Text, Required, Default: "active")
```

**B. SupernovaConversations Collection**
```
Name: SupernovaConversations
Permissions: Read: Anyone, Create/Update/Delete: Admin

Fields:
1. conversationId (Text, Required, Unique)
2. userId (Text, Required) [Reference to SupernovaUsers]
3. title (Text)
4. summary (Text, Large)
5. startedAt (Date & Time, Required)
6. lastMessageAt (Date & Time, Required)
7. endedAt (Date & Time)
8. messageCount (Number, Required, Default: 0)
9. status (Text, Required, Default: "active")
10. tags (Tags)
11. sentiment (Text)
12. metadata (Object)
13. context (Text, Large)
14. isArchived (Boolean, Default: false)
```

**C. SupernovaMessages Collection**
```
Name: SupernovaMessages
Permissions: Read: Anyone, Create/Update/Delete: Admin

Fields:
1. messageId (Text, Required, Unique)
2. conversationId (Text, Required) [Reference to SupernovaConversations]
3. userId (Text, Required) [Reference to SupernovaUsers]
4. role (Text, Required) [user, assistant, system]
5. content (Text, Large, Required)
6. timestamp (Date & Time, Required)
7. tokenCount (Number)
8. metadata (Object)
9. embedding (Object) [Array stored as object]
10. attachments (Object)
11. inReplyTo (Text) [Reference to another message]
12. edited (Boolean, Default: false)
13. editedAt (Date & Time)
```

**D. SupernovaSessions Collection**
```
Name: SupernovaSessions
Permissions: Read: Anyone, Create/Update/Delete: Admin

Fields:
1. sessionId (Text, Required, Unique)
2. userId (Text, Required) [Reference to SupernovaUsers]
3. conversationId (Text) [Reference to SupernovaConversations]
4. startedAt (Date & Time, Required)
5. lastActivityAt (Date & Time, Required)
6. expiresAt (Date & Time, Required)
7. status (Text, Required, Default: "active")
8. deviceInfo (Object)
9. workingMemory (Object)
10. contextWindow (Object)
11. state (Object)
12. metadata (Object)
```

**E. SupernovaPreferences Collection**
```
Name: SupernovaPreferences
Permissions: Read: Anyone, Create/Update: Anyone, Delete: Admin

Fields:
1. userId (Text, Required, Unique) [Reference to SupernovaUsers]
2. language (Text, Default: "en")
3. timezone (Text)
4. notificationsEnabled (Boolean, Default: true)
5. emailNotifications (Boolean, Default: false)
6. theme (Text, Default: "auto")
7. conversationStyle (Text, Default: "casual")
8. responseLength (Text, Default: "medium")
9. memoryRetention (Number, Default: 90)
10. personalInfo (Object)
11. customSettings (Object)
12. updatedAt (Date & Time, Required)
```

**F. SupernovaKnowledge Collection**
```
Name: SupernovaKnowledge
Permissions: Read: Anyone, Create/Update/Delete: Admin

Fields:
1. knowledgeId (Text, Required, Unique)
2. userId (Text, Required) [Reference to SupernovaUsers]
3. category (Text, Required)
4. key (Text, Required)
5. value (Text, Large, Required)
6. confidence (Number, Range: 0-1)
7. source (Text)
8. learnedAt (Date & Time, Required)
9. lastConfirmedAt (Date & Time)
10. expiresAt (Date & Time)
11. metadata (Object)
12. tags (Tags)
```

**G. SupernovaContext Collection**
```
Name: SupernovaContext
Permissions: Read/Write/Delete: Admin

Fields:
1. contextId (Text, Required, Unique)
2. conversationId (Text, Required) [Reference to SupernovaConversations]
3. userId (Text, Required) [Reference to SupernovaUsers]
4. messageIds (Object) [Array]
5. summary (Text, Large)
6. entities (Object)
7. topics (Tags)
8. sentiment (Text)
9. createdAt (Date & Time, Required)
10. expiresAt (Date & Time, Required)
11. tokenCount (Number)
12. metadata (Object)
```

**H. SupernovaMetadata Collection**
```
Name: SupernovaMetadata
Permissions: Read/Write/Delete: Admin

Fields:
1. metadataId (Text, Required, Unique)
2. type (Text, Required)
3. entityType (Text, Required)
4. entityId (Text)
5. userId (Text)
6. data (Object, Required)
7. createdAt (Date & Time, Required)
8. updatedAt (Date & Time)
9. expiresAt (Date & Time)
```

### Step 1.2: Configure Collection Indexes

In the Wix Data Collection settings, add the following indexes for performance:

**SupernovaUsers**:
- Index on: `userId` (unique)
- Index on: `email`
- Index on: `lastActiveAt`
- Index on: `status`

**SupernovaConversations**:
- Index on: `conversationId` (unique)
- Index on: `userId`
- Index on: `lastMessageAt`
- Index on: `status`
- Composite index: `userId` + `lastMessageAt`

**SupernovaMessages**:
- Index on: `messageId` (unique)
- Index on: `conversationId`
- Index on: `timestamp`
- Composite index: `conversationId` + `timestamp`

**SupernovaSessions**:
- Index on: `sessionId` (unique)
- Index on: `userId`
- Index on: `expiresAt`

### Step 1.3: Set Up Data Hooks (Optional)

Create data hooks for automatic operations:

```javascript
// In Backend/data.js
import wixData from 'wix-data';

export function SupernovaMessages_beforeInsert(item) {
  // Auto-generate messageId if not provided
  if (!item.messageId) {
    item.messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  // Set timestamp if not provided
  if (!item.timestamp) {
    item.timestamp = new Date();
  }
  return item;
}

export function SupernovaMessages_afterInsert(item) {
  // Update conversation message count
  wixData.query("SupernovaConversations")
    .eq("conversationId", item.conversationId)
    .find()
    .then((results) => {
      if (results.items.length > 0) {
        const conversation = results.items[0];
        wixData.update("SupernovaConversations", {
          _id: conversation._id,
          messageCount: (conversation.messageCount || 0) + 1,
          lastMessageAt: item.timestamp
        });
      }
    });

  return item;
}
```

---

## Phase 2: Backend Services

**Duration**: 3-4 days

### Step 2.1: Set Up Backend File Structure

In Wix Editor, enable Developer Mode and create the following file structure:

```
Backend/
├── http-functions.js        # HTTP endpoints
├── data.js                  # Data hooks
├── jobs.config              # Scheduled jobs
└── services/
    ├── memoryService.jsw    # Memory operations
    ├── sessionService.jsw   # Session management
    ├── userService.jsw      # User management
    ├── contextService.jsw   # Context operations
    └── utils.jsw            # Utility functions
```

### Step 2.2: Implement Core Services

Copy the implementation files from `/src/services` to your Wix Backend:

**A. utils.jsw** - Utility functions

```javascript
// Backend/services/utils.jsw
import { v4 as uuidv4 } from 'uuid'; // Note: Add via package manager

export function generateId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function generateUserId() {
  return generateId('user');
}

export function generateConversationId() {
  return generateId('conv');
}

export function generateMessageId() {
  return generateId('msg');
}

export function generateSessionId() {
  return generateId('sess');
}

export function generateKnowledgeId() {
  return generateId('know');
}

export function generateContextId() {
  return generateId('ctx');
}

export function generateMetadataId() {
  return generateId('meta');
}

export function estimateTokenCount(text) {
  // Rough estimation: ~4 characters per token
  return Math.ceil(text.length / 4);
}

export function getSessionExpiry(hours = 24) {
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + hours);
  return expiry;
}
```

**B. userService.jsw** - User management

```javascript
// Backend/services/userService.jsw
import wixData from 'wix-data';
import { generateUserId } from './utils.jsw';

export async function createUser(userInput) {
  const user = {
    userId: userInput.userId || generateUserId(),
    email: userInput.email,
    displayName: userInput.displayName,
    firstName: userInput.firstName,
    lastName: userInput.lastName,
    createdAt: new Date(),
    lastActiveAt: new Date(),
    totalConversations: 0,
    totalMessages: 0,
    preferences: userInput.preferences || {},
    metadata: userInput.metadata || {},
    status: 'active'
  };

  return await wixData.insert('SupernovaUsers', user);
}

export async function getUser(userId) {
  const results = await wixData.query('SupernovaUsers')
    .eq('userId', userId)
    .find();

  return results.items.length > 0 ? results.items[0] : null;
}

export async function updateUser(userId, updates) {
  const user = await getUser(userId);
  if (!user) {
    throw new Error('User not found');
  }

  return await wixData.update('SupernovaUsers', {
    _id: user._id,
    ...updates
  });
}

export async function updateUserActivity(userId) {
  return await updateUser(userId, {
    lastActiveAt: new Date()
  });
}
```

**C. sessionService.jsw** - Session management

See `/src/services/sessionService.js` for full implementation.

**D. memoryService.jsw** - Memory operations

See `/src/services/memoryService.js` for full implementation.

### Step 2.3: Create HTTP Endpoints

In `Backend/http-functions.js`:

```javascript
import wixData from 'wix-data';
import { ok, badRequest, serverError } from 'wix-http-functions';
import { createSession, getActiveSession } from './services/sessionService.jsw';
import { storeMessage, getRecentMessages } from './services/memoryService.jsw';

// POST /api/sessions
export function post_createSession(request) {
  return request.body.json()
    .then(body => createSession(body))
    .then(session => ok({ body: JSON.stringify({ success: true, data: session }) }))
    .catch(error => serverError({ body: JSON.stringify({ success: false, error: error.message }) }));
}

// POST /api/messages
export function post_storeMessage(request) {
  return request.body.json()
    .then(body => storeMessage(body))
    .then(message => ok({ body: JSON.stringify({ success: true, data: message }) }))
    .catch(error => serverError({ body: JSON.stringify({ success: false, error: error.message }) }));
}

// GET /api/messages/{conversationId}
export function get_getMessages(request) {
  const conversationId = request.path[0];
  const limit = parseInt(request.query.limit) || 50;

  return getRecentMessages(conversationId, limit)
    .then(messages => ok({ body: JSON.stringify({ success: true, data: messages }) }))
    .catch(error => serverError({ body: JSON.stringify({ success: false, error: error.message }) }));
}
```

### Step 2.4: Set Up Scheduled Jobs

Create `Backend/jobs.config`:

```json
{
  "jobs": [
    {
      "functionLocation": "/cleanupExpiredSessions.js",
      "description": "Clean up expired sessions",
      "executionConfig": {
        "cronExpression": "0 0 * * *"
      }
    },
    {
      "functionLocation": "/cleanupOldContext.js",
      "description": "Clean up old context snapshots",
      "executionConfig": {
        "cronExpression": "0 2 * * *"
      }
    }
  ]
}
```

---

## Phase 3: Memory Manager

**Duration**: 2-3 days

### Step 3.1: Implement Memory Manager Core

Copy `/src/memory/memoryManager.js` to your Wix Backend.

Key features to implement:
- Context assembly from multiple sources
- Memory retrieval optimization
- Caching layer for frequently accessed data
- Memory pruning for old conversations

### Step 3.2: Implement Context Builder

Create context building logic that combines:
- Recent messages from current conversation
- User preferences
- Relevant knowledge base items
- Session state

### Step 3.3: Add Caching Layer

Implement in-memory caching for:
- Active sessions (5-minute TTL)
- User preferences (5-minute TTL)
- Recent conversations (2-minute TTL)

---

## Phase 4: Frontend Integration

**Duration**: 2-3 days

### Step 4.1: Create Chat Widget

In Wix Editor, create a custom chat widget:

1. Add a custom element or use Wix's built-in chat
2. Create event handlers for:
   - Message send
   - Session initialization
   - Message display

### Step 4.2: Implement Frontend Logic

In `Public/pages/[PageName].js`:

```javascript
import wixData from 'wix-data';
import { currentMember } from 'wix-members';

$w.onReady(function () {
  initializeChat();
});

async function initializeChat() {
  const member = await currentMember.getMember();
  const userId = member._id;

  // Initialize or resume session
  const session = await createOrResumeSession(userId);

  // Load recent messages
  const messages = await loadMessages(session.conversationId);
  displayMessages(messages);
}

async function sendMessage(content) {
  const member = await currentMember.getMember();

  const message = {
    userId: member._id,
    conversationId: getCurrentConversationId(),
    role: 'user',
    content: content
  };

  // Store message
  await wixData.insert('SupernovaMessages', message);

  // Get AI response (call your AI service)
  const response = await getAIResponse(message);

  // Store AI response
  await wixData.insert('SupernovaMessages', response);

  // Display both messages
  displayMessage(message);
  displayMessage(response);
}
```

### Step 4.3: Add User Preferences UI

Create a settings page where users can:
- View their conversation history
- Adjust preferences
- Delete conversations
- Export their data

---

## Phase 5: Testing & Optimization

**Duration**: 2-3 days

### Step 5.1: Unit Testing

Test each service function:
- User creation and retrieval
- Session management
- Message storage and retrieval
- Context assembly

### Step 5.2: Integration Testing

Test end-to-end workflows:
- Complete conversation flow
- Session resumption
- Context retrieval
- Preference updates

### Step 5.3: Performance Testing

Monitor and optimize:
- Query response times
- Collection size growth
- Cache hit rates
- Memory usage

### Step 5.4: Load Testing

Simulate multiple concurrent users:
- 10 concurrent users
- 50 concurrent users
- 100 concurrent users

Identify and fix bottlenecks.

---

## Phase 6: Deployment

**Duration**: 1 day

### Step 6.1: Pre-Deployment Checklist

- [ ] All collections created and indexed
- [ ] All backend services implemented
- [ ] HTTP endpoints configured
- [ ] Scheduled jobs set up
- [ ] Frontend integration complete
- [ ] Testing complete
- [ ] Error handling implemented
- [ ] Logging configured

### Step 6.2: Deploy to Production

1. Publish your Wix site
2. Monitor initial usage
3. Check error logs
4. Verify all features working

### Step 6.3: Post-Deployment Monitoring

Monitor for first 48 hours:
- Error rates
- Response times
- User engagement
- Storage growth

---

## Maintenance & Monitoring

### Daily Tasks

- [ ] Review error logs
- [ ] Check system health metrics
- [ ] Monitor storage usage

### Weekly Tasks

- [ ] Review performance metrics
- [ ] Analyze usage patterns
- [ ] Optimize slow queries
- [ ] Review and archive old conversations

### Monthly Tasks

- [ ] Generate usage reports
- [ ] Review and update retention policies
- [ ] Performance audit
- [ ] Backup verification

### Monitoring Metrics

Set up monitoring for:

1. **Performance Metrics**:
   - Average query response time
   - P95/P99 latency
   - Cache hit rate
   - API endpoint performance

2. **Usage Metrics**:
   - Active users
   - Messages per day
   - Average session duration
   - Conversation completion rate

3. **System Health**:
   - Error rate
   - Storage utilization
   - Collection sizes
   - Memory usage

4. **Business Metrics**:
   - User engagement
   - Conversation quality
   - User satisfaction
   - Feature adoption

---

## Troubleshooting

### Common Issues

**Issue: Slow query performance**
- Solution: Add appropriate indexes
- Check query patterns and optimize
- Implement caching

**Issue: Session expires too quickly**
- Solution: Adjust expiry time in session creation
- Implement session refresh on activity

**Issue: Context too large**
- Solution: Implement context summarization
- Limit context window size
- Prune old context data

**Issue: Storage quota exceeded**
- Solution: Archive old conversations
- Implement data retention policies
- Summarize long conversations

---

## Cost Estimation

### Wix Plan Requirements

- **Minimum**: Business Premium ($27/month)
- **Recommended**: Business VIP ($49/month) for higher quotas

### Storage Estimates

- Average user: ~10 MB/year
- 100 users: ~1 GB/year
- 1000 users: ~10 GB/year

### Additional Costs

- External AI API (OpenAI, etc.): Variable based on usage
- Vector database (if implementing semantic search): $20-100/month
- Backup storage: $5-20/month

---

## Next Steps

After successful deployment:

1. **Enhance AI Capabilities**:
   - Implement semantic search
   - Add conversation summarization
   - Improve context relevance

2. **Add Analytics**:
   - User engagement tracking
   - Conversation quality metrics
   - Performance dashboards

3. **Expand Features**:
   - Multi-language support
   - Voice input/output
   - File attachments
   - Conversation sharing

4. **Scale Infrastructure**:
   - Implement CDN for static assets
   - Add load balancing
   - Set up monitoring and alerts

---

## Support & Resources

- **Wix Velo Documentation**: https://www.wix.com/velo
- **Wix Data API**: https://www.wix.com/velo/reference/wix-data
- **Wix Forum**: https://www.wix.com/velo/forum
- **This Project Documentation**: See `/docs` folder

For issues or questions, refer to the architecture and schema documentation.
