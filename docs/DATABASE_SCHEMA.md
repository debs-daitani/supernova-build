# SUPERNova AI Database Schema

## Overview

This document describes the complete database schema for the SUPERNova AI Memory System using Wix Data Collections.

## Collections Overview

| Collection Name | Purpose | Estimated Size | Retention |
|----------------|---------|----------------|-----------|
| Users | User profiles and metadata | 1 row/user | Indefinite |
| Conversations | Conversation sessions | ~10-100/user | 90 days |
| Messages | Individual messages | ~1000s/user | 90 days |
| Sessions | Active session tracking | 1-5/user | 24 hours |
| Preferences | User preferences | 1 row/user | Indefinite |
| Knowledge | Learned facts/knowledge | ~100s/user | Indefinite |
| Context | Conversation context snapshots | ~10/conversation | 7 days |
| Metadata | System metadata and summaries | Variable | Variable |

## Detailed Schema

### 1. Users Collection

**Collection ID**: `SupernovaUsers`

**Purpose**: Store user profiles and account information

| Field Name | Type | Required | Index | Description |
|------------|------|----------|-------|-------------|
| _id | Text | Yes | Primary | Wix auto-generated ID |
| userId | Text | Yes | Unique | Wix member ID or custom user identifier |
| email | Text | No | Yes | User email address |
| displayName | Text | No | No | User display name |
| firstName | Text | No | No | User first name |
| lastName | Text | No | No | User last name |
| createdAt | Date | Yes | Yes | Account creation timestamp |
| lastActiveAt | Date | Yes | Yes | Last activity timestamp |
| totalConversations | Number | Yes | No | Total number of conversations |
| totalMessages | Number | Yes | No | Total number of messages |
| preferences | Object | No | No | Quick access user preferences |
| metadata | Object | No | No | Additional user metadata |
| status | Text | Yes | Yes | User status (active, inactive, suspended) |

**Indexes**:
- Primary: `_id`
- Unique: `userId`
- Index: `email`, `lastActiveAt`, `status`, `createdAt`

**Permissions**:
- Read: User (own data only)
- Write: Backend only
- Delete: Backend only

---

### 2. Conversations Collection

**Collection ID**: `SupernovaConversations`

**Purpose**: Store conversation metadata and summaries

| Field Name | Type | Required | Index | Description |
|------------|------|----------|-------|-------------|
| _id | Text | Yes | Primary | Wix auto-generated ID |
| conversationId | Text | Yes | Unique | Custom conversation identifier |
| userId | Text | Yes | Yes | Reference to Users.userId |
| title | Text | No | No | Conversation title (auto or manual) |
| summary | Text | No | No | AI-generated conversation summary |
| startedAt | Date | Yes | Yes | Conversation start timestamp |
| lastMessageAt | Date | Yes | Yes | Last message timestamp |
| endedAt | Date | No | Yes | Conversation end timestamp (null if active) |
| messageCount | Number | Yes | No | Total number of messages |
| status | Text | Yes | Yes | Status (active, paused, ended, archived) |
| tags | Array | No | No | Conversation tags/categories |
| sentiment | Text | No | No | Overall sentiment (positive, neutral, negative) |
| metadata | Object | No | No | Additional conversation metadata |
| context | Text | No | No | Current conversation context (summary) |
| isArchived | Boolean | Yes | Yes | Archive flag |

**Indexes**:
- Primary: `_id`
- Unique: `conversationId`
- Index: `userId`, `startedAt`, `lastMessageAt`, `status`, `isArchived`
- Composite: `(userId, lastMessageAt)`, `(userId, status)`

**Permissions**:
- Read: User (own data only)
- Write: Backend only
- Delete: Backend only

---

### 3. Messages Collection

**Collection ID**: `SupernovaMessages`

**Purpose**: Store individual messages in conversations

| Field Name | Type | Required | Index | Description |
|------------|------|----------|-------|-------------|
| _id | Text | Yes | Primary | Wix auto-generated ID |
| messageId | Text | Yes | Unique | Custom message identifier |
| conversationId | Text | Yes | Yes | Reference to Conversations.conversationId |
| userId | Text | Yes | Yes | Reference to Users.userId |
| role | Text | Yes | Yes | Message role (user, assistant, system) |
| content | Text | Yes | No | Message content |
| timestamp | Date | Yes | Yes | Message timestamp |
| tokenCount | Number | No | No | Approximate token count |
| metadata | Object | No | No | Additional message metadata |
| embedding | Array | No | No | Vector embedding (for semantic search) |
| attachments | Array | No | No | File attachments or references |
| inReplyTo | Text | No | No | Reference to parent message (threading) |
| edited | Boolean | No | No | Whether message was edited |
| editedAt | Date | No | No | Edit timestamp |

**Indexes**:
- Primary: `_id`
- Unique: `messageId`
- Index: `conversationId`, `userId`, `timestamp`, `role`
- Composite: `(conversationId, timestamp)`, `(userId, timestamp)`
- Full-text: `content` (for search)

**Permissions**:
- Read: User (own data only)
- Write: Backend only
- Delete: Backend only

---

### 4. Sessions Collection

**Collection ID**: `SupernovaSessions`

**Purpose**: Track active user sessions and state

| Field Name | Type | Required | Index | Description |
|------------|------|----------|-------|-------------|
| _id | Text | Yes | Primary | Wix auto-generated ID |
| sessionId | Text | Yes | Unique | Custom session identifier |
| userId | Text | Yes | Yes | Reference to Users.userId |
| conversationId | Text | No | Yes | Current conversation ID |
| startedAt | Date | Yes | Yes | Session start timestamp |
| lastActivityAt | Date | Yes | Yes | Last activity timestamp |
| expiresAt | Date | Yes | Yes | Session expiration timestamp |
| status | Text | Yes | Yes | Status (active, expired, ended) |
| deviceInfo | Object | No | No | Device/browser information |
| workingMemory | Array | No | No | Current working memory (recent messages) |
| contextWindow | Array | No | No | Active context message IDs |
| state | Object | No | No | Session state data |
| metadata | Object | No | No | Additional session metadata |

**Indexes**:
- Primary: `_id`
- Unique: `sessionId`
- Index: `userId`, `conversationId`, `lastActivityAt`, `expiresAt`, `status`
- Composite: `(userId, status)`

**Permissions**:
- Read: User (own data only)
- Write: Backend only
- Delete: Backend only

**Cleanup**: Automated job to remove sessions where `expiresAt` < current time

---

### 5. Preferences Collection

**Collection ID**: `SupernovaPreferences`

**Purpose**: Store user preferences and settings

| Field Name | Type | Required | Index | Description |
|------------|------|----------|-------|-------------|
| _id | Text | Yes | Primary | Wix auto-generated ID |
| userId | Text | Yes | Unique | Reference to Users.userId |
| language | Text | No | No | Preferred language (e.g., "en", "es") |
| timezone | Text | No | No | User timezone |
| notificationsEnabled | Boolean | No | No | Enable notifications |
| emailNotifications | Boolean | No | No | Enable email notifications |
| theme | Text | No | No | UI theme preference (light, dark, auto) |
| conversationStyle | Text | No | No | AI response style (formal, casual, technical) |
| responseLength | Text | No | No | Preferred response length (short, medium, long) |
| memoryRetention | Number | No | No | Memory retention days (30, 60, 90, 365) |
| personalInfo | Object | No | No | Stored personal information |
| customSettings | Object | No | No | Custom preference key-value pairs |
| updatedAt | Date | Yes | Yes | Last update timestamp |

**Indexes**:
- Primary: `_id`
- Unique: `userId`
- Index: `updatedAt`

**Permissions**:
- Read: User (own data only)
- Write: User (own data only) + Backend
- Delete: Backend only

---

### 6. Knowledge Collection

**Collection ID**: `SupernovaKnowledge`

**Purpose**: Store learned facts and knowledge about users

| Field Name | Type | Required | Index | Description |
|------------|------|----------|-------|-------------|
| _id | Text | Yes | Primary | Wix auto-generated ID |
| knowledgeId | Text | Yes | Unique | Custom knowledge identifier |
| userId | Text | Yes | Yes | Reference to Users.userId |
| category | Text | Yes | Yes | Knowledge category (fact, preference, goal, etc.) |
| key | Text | Yes | Yes | Knowledge key/identifier |
| value | Text | Yes | No | Knowledge value/content |
| confidence | Number | No | No | Confidence score (0-1) |
| source | Text | No | No | Source (conversation ID or manual) |
| learnedAt | Date | Yes | Yes | When knowledge was acquired |
| lastConfirmedAt | Date | No | No | Last confirmation timestamp |
| expiresAt | Date | No | Yes | Expiration date (for temporary knowledge) |
| metadata | Object | No | No | Additional knowledge metadata |
| tags | Array | No | No | Knowledge tags for categorization |

**Indexes**:
- Primary: `_id`
- Unique: `knowledgeId`
- Index: `userId`, `category`, `key`, `learnedAt`, `expiresAt`
- Composite: `(userId, category)`, `(userId, key)`

**Permissions**:
- Read: User (own data only)
- Write: Backend only
- Delete: Backend only

---

### 7. Context Collection

**Collection ID**: `SupernovaContext`

**Purpose**: Store conversation context snapshots for quick retrieval

| Field Name | Type | Required | Index | Description |
|------------|------|----------|-------|-------------|
| _id | Text | Yes | Primary | Wix auto-generated ID |
| contextId | Text | Yes | Unique | Custom context identifier |
| conversationId | Text | Yes | Yes | Reference to Conversations.conversationId |
| userId | Text | Yes | Yes | Reference to Users.userId |
| messageIds | Array | Yes | No | Array of message IDs in context |
| summary | Text | No | No | Context summary |
| entities | Array | No | No | Extracted entities (people, places, etc.) |
| topics | Array | No | No | Conversation topics |
| sentiment | Text | No | No | Context sentiment |
| createdAt | Date | Yes | Yes | Context creation timestamp |
| expiresAt | Date | Yes | Yes | Expiration timestamp |
| tokenCount | Number | No | No | Total tokens in context |
| metadata | Object | No | No | Additional context metadata |

**Indexes**:
- Primary: `_id`
- Unique: `contextId`
- Index: `conversationId`, `userId`, `createdAt`, `expiresAt`
- Composite: `(conversationId, createdAt)`

**Permissions**:
- Read: Backend only
- Write: Backend only
- Delete: Backend only

**Cleanup**: Automated job to remove expired contexts

---

### 8. Metadata Collection

**Collection ID**: `SupernovaMetadata`

**Purpose**: Store system metadata, analytics, and summaries

| Field Name | Type | Required | Index | Description |
|------------|------|----------|-------|-------------|
| _id | Text | Yes | Primary | Wix auto-generated ID |
| metadataId | Text | Yes | Unique | Custom metadata identifier |
| type | Text | Yes | Yes | Metadata type (summary, analytics, system) |
| entityType | Text | Yes | Yes | Related entity (user, conversation, message) |
| entityId | Text | No | Yes | Related entity ID |
| userId | Text | No | Yes | Related user ID (if applicable) |
| data | Object | Yes | No | Metadata payload |
| createdAt | Date | Yes | Yes | Creation timestamp |
| updatedAt | Date | No | No | Last update timestamp |
| expiresAt | Date | No | Yes | Expiration timestamp (if applicable) |

**Indexes**:
- Primary: `_id`
- Unique: `metadataId`
- Index: `type`, `entityType`, `entityId`, `userId`, `createdAt`, `expiresAt`
- Composite: `(entityType, entityId)`, `(userId, type)`

**Permissions**:
- Read: Backend only
- Write: Backend only
- Delete: Backend only

## Relationships

```
Users (1) ──< (Many) Conversations
Users (1) ──< (Many) Messages
Users (1) ──< (Many) Sessions
Users (1) ─── (1) Preferences
Users (1) ──< (Many) Knowledge

Conversations (1) ──< (Many) Messages
Conversations (1) ──< (Many) Context
Conversations (1) ─── (0-1) Sessions (active)

Messages (1) ─── (0-1) Messages (threading via inReplyTo)
```

## Query Patterns

### Common Queries

1. **Get User's Active Conversations**
```javascript
// Query: userId = {userId} AND status = "active"
// Sort: lastMessageAt DESC
// Limit: 20
```

2. **Get Conversation Messages**
```javascript
// Query: conversationId = {conversationId}
// Sort: timestamp ASC
// Pagination: cursor-based or offset
```

3. **Get Recent Context**
```javascript
// Query: conversationId = {conversationId}
// Sort: timestamp DESC
// Limit: 20
```

4. **Search User Messages**
```javascript
// Query: userId = {userId} AND content contains {searchTerm}
// Sort: timestamp DESC
// Limit: 50
```

5. **Get User Preferences**
```javascript
// Query: userId = {userId}
// Returns: Single row
```

6. **Get Active Session**
```javascript
// Query: userId = {userId} AND status = "active"
// Sort: lastActivityAt DESC
// Limit: 1
```

7. **Get User Knowledge by Category**
```javascript
// Query: userId = {userId} AND category = {category}
// Sort: learnedAt DESC
```

## Data Retention Policies

| Collection | Retention Period | Archive Strategy |
|------------|-----------------|------------------|
| Users | Indefinite | Soft delete (status flag) |
| Conversations | 90 days | Move to archive collection |
| Messages | 90 days | Move to archive collection |
| Sessions | 24 hours after expiry | Hard delete |
| Preferences | Indefinite | Keep with user |
| Knowledge | Indefinite | User-controlled delete |
| Context | 7 days | Hard delete |
| Metadata | Variable | Per metadata type |

## Migration Scripts

See `/schema/migrations/` for version-controlled schema updates.

## Backup Strategy

- **Daily**: Automated Wix Data backup
- **Weekly**: Full export to external storage
- **Monthly**: Long-term archival backup

## Performance Optimization

### Index Strategy
- All foreign keys indexed
- Timestamp fields indexed for chronological queries
- Status fields indexed for filtering
- Composite indexes for common query patterns

### Partition Strategy
- Shard by userId for even distribution
- Time-based partitioning for historical data (future enhancement)

### Caching Strategy
- Cache active sessions (5-minute TTL)
- Cache user preferences (5-minute TTL)
- Cache recent conversations (2-minute TTL)

## Monitoring

### Metrics to Track
- Collection sizes
- Query performance (P50, P95, P99)
- Write throughput
- Cache hit rates
- Storage utilization

### Alerts
- Collection size > 80% quota
- Query latency > 500ms
- Error rate > 1%
- Cache miss rate > 50%
