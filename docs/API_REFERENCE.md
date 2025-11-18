# SUPERNova AI Memory System - API Reference

## Overview

This document provides a complete reference for all API functions in the SUPERNova AI Memory System.

## Table of Contents

1. [Memory Service](#memory-service)
2. [Session Service](#session-service)
3. [Conversation Service](#conversation-service)
4. [Utility Functions](#utility-functions)
5. [Error Handling](#error-handling)
6. [Response Formats](#response-formats)

---

## Memory Service

### storeMessage(messageInput)

Store a new message in the conversation.

**Parameters:**
- `messageInput` (Object):
  - `conversationId` (string, required): Conversation ID
  - `userId` (string, required): User ID
  - `role` (string, required): Message role ('user', 'assistant', 'system')
  - `content` (string, required): Message content
  - `messageId` (string, optional): Custom message ID
  - `timestamp` (Date, optional): Message timestamp
  - `tokenCount` (number, optional): Token count
  - `metadata` (Object, optional): Additional metadata
  - `attachments` (Array, optional): File attachments
  - `inReplyTo` (string, optional): Parent message ID

**Returns:** `Promise<Object>` - Stored message object

**Example:**
```javascript
const message = await storeMessage({
  conversationId: 'conv_123',
  userId: 'user_456',
  role: 'user',
  content: 'Hello, how are you?'
});
```

---

### getRecentMessages(conversationId, limit)

Get recent messages from a conversation.

**Parameters:**
- `conversationId` (string, required): Conversation ID
- `limit` (number, optional): Number of messages (default: 20)

**Returns:** `Promise<Array>` - Array of messages in chronological order

**Example:**
```javascript
const messages = await getRecentMessages('conv_123', 10);
```

---

### searchMessages(userId, searchQuery, options)

Search messages by content.

**Parameters:**
- `userId` (string, required): User ID
- `searchQuery` (string, required): Search query
- `options` (Object, optional):
  - `conversationId` (string): Filter by conversation
  - `role` (string): Filter by role
  - `startDate` (Date): Start date filter
  - `endDate` (Date): End date filter
  - `limit` (number): Result limit (default: 100)

**Returns:** `Promise<Array>` - Array of matching messages

**Example:**
```javascript
const results = await searchMessages('user_456', 'python', {
  conversationId: 'conv_123',
  limit: 50
});
```

---

### buildConversationContext(userId, conversationId, options)

Build conversation context for AI processing.

**Parameters:**
- `userId` (string, required): User ID
- `conversationId` (string, required): Conversation ID
- `options` (Object, optional):
  - `limit` (number): Number of messages (default: 50)
  - `knowledgeCategories` (Array): Knowledge categories to include
  - `saveSnapshot` (boolean): Save context snapshot

**Returns:** `Promise<Object>` - Assembled context object

**Example:**
```javascript
const context = await buildConversationContext('user_456', 'conv_123', {
  limit: 30,
  knowledgeCategories: ['fact', 'preference'],
  saveSnapshot: true
});
```

---

### optimizeContext(context, maxTokens)

Optimize context to fit within token limit.

**Parameters:**
- `context` (Object, required): Full context object
- `maxTokens` (number, optional): Maximum tokens (default: 8000)

**Returns:** `Object` - Optimized context

**Example:**
```javascript
const optimized = optimizeContext(context, 4000);
```

---

### getMemoryStats(userId)

Get memory statistics for a user.

**Parameters:**
- `userId` (string, required): User ID

**Returns:** `Promise<Object>` - Memory statistics

**Example:**
```javascript
const stats = await getMemoryStats('user_456');
// Returns: { totalConversations, totalMessages, totalKnowledge, ... }
```

---

## Session Service

### createSession(sessionInput)

Create a new session.

**Parameters:**
- `sessionInput` (Object):
  - `userId` (string, required): User ID
  - `conversationId` (string, optional): Initial conversation ID
  - `sessionId` (string, optional): Custom session ID
  - `expiryHours` (number, optional): Expiry hours (default: 24)
  - `deviceInfo` (Object, optional): Device information
  - `state` (Object, optional): Initial state
  - `metadata` (Object, optional): Additional metadata

**Returns:** `Promise<Object>` - Created session

**Example:**
```javascript
const session = await createSession({
  userId: 'user_456',
  conversationId: 'conv_123',
  deviceInfo: {
    browser: 'Chrome',
    os: 'Windows'
  }
});
```

---

### getActiveSession(userId)

Get active session for a user.

**Parameters:**
- `userId` (string, required): User ID

**Returns:** `Promise<Object|null>` - Active session or null

**Example:**
```javascript
const session = await getActiveSession('user_456');
```

---

### getOrCreateSession(userId, sessionInput)

Get existing active session or create new one.

**Parameters:**
- `userId` (string, required): User ID
- `sessionInput` (Object, optional): Session creation data

**Returns:** `Promise<Object>` - Session object

**Example:**
```javascript
const session = await getOrCreateSession('user_456', {
  conversationId: 'conv_123'
});
```

---

### updateSessionActivity(sessionId, updates)

Update session activity and optionally extend expiration.

**Parameters:**
- `sessionId` (string, required): Session ID
- `updates` (Object, optional): Additional updates

**Returns:** `Promise<Object>` - Updated session

**Example:**
```javascript
const session = await updateSessionActivity('sess_789');
```

---

### addToWorkingMemory(sessionId, message)

Add message to session's working memory.

**Parameters:**
- `sessionId` (string, required): Session ID
- `message` (Object, required): Message object

**Returns:** `Promise<Object>` - Updated session

**Example:**
```javascript
const session = await addToWorkingMemory('sess_789', message);
```

---

### updateSessionState(sessionId, stateUpdates)

Update session state.

**Parameters:**
- `sessionId` (string, required): Session ID
- `stateUpdates` (Object, required): State updates

**Returns:** `Promise<Object>` - Updated session

**Example:**
```javascript
const session = await updateSessionState('sess_789', {
  currentStep: 2,
  completed: true
});
```

---

### endSession(sessionId)

End a session.

**Parameters:**
- `sessionId` (string, required): Session ID

**Returns:** `Promise<Object>` - Updated session

**Example:**
```javascript
await endSession('sess_789');
```

---

## Conversation Service

### createConversation(conversationInput)

Create a new conversation.

**Parameters:**
- `conversationInput` (Object):
  - `userId` (string, required): User ID
  - `conversationId` (string, optional): Custom conversation ID
  - `title` (string, optional): Conversation title
  - `tags` (Array, optional): Initial tags
  - `metadata` (Object, optional): Additional metadata

**Returns:** `Promise<Object>` - Created conversation

**Example:**
```javascript
const conversation = await createConversation({
  userId: 'user_456',
  title: 'Python Tutorial',
  tags: ['programming', 'python']
});
```

---

### getConversation(conversationId)

Get conversation by ID.

**Parameters:**
- `conversationId` (string, required): Conversation ID

**Returns:** `Promise<Object|null>` - Conversation object

**Example:**
```javascript
const conversation = await getConversation('conv_123');
```

---

### getUserConversations(userId, options)

Get user's conversations.

**Parameters:**
- `userId` (string, required): User ID
- `options` (Object, optional):
  - `status` (string): Filter by status
  - `includeArchived` (boolean): Include archived (default: true)
  - `tags` (Array): Filter by tags
  - `startDate` (Date): Start date filter
  - `endDate` (Date): End date filter
  - `limit` (number): Result limit (default: 50)

**Returns:** `Promise<Array>` - Array of conversations

**Example:**
```javascript
const conversations = await getUserConversations('user_456', {
  status: 'active',
  includeArchived: false,
  limit: 20
});
```

---

### searchConversations(userId, searchQuery, options)

Search conversations.

**Parameters:**
- `userId` (string, required): User ID
- `searchQuery` (string, required): Search query
- `options` (Object, optional): Same as getUserConversations

**Returns:** `Promise<Array>` - Array of matching conversations

**Example:**
```javascript
const results = await searchConversations('user_456', 'python tutorial', {
  tags: ['programming']
});
```

---

### updateConversation(conversationId, updates)

Update conversation.

**Parameters:**
- `conversationId` (string, required): Conversation ID
- `updates` (Object, required): Fields to update

**Returns:** `Promise<Object>` - Updated conversation

**Example:**
```javascript
const conversation = await updateConversation('conv_123', {
  title: 'Advanced Python',
  tags: ['programming', 'python', 'advanced']
});
```

---

### archiveConversation(conversationId)

Archive a conversation.

**Parameters:**
- `conversationId` (string, required): Conversation ID

**Returns:** `Promise<Object>` - Updated conversation

**Example:**
```javascript
await archiveConversation('conv_123');
```

---

### deleteConversation(conversationId)

Delete a conversation and all its messages.

**Parameters:**
- `conversationId` (string, required): Conversation ID

**Returns:** `Promise<Object>` - Deletion result

**Example:**
```javascript
const result = await deleteConversation('conv_123');
// Returns: { conversationId, deletedMessages, success }
```

---

### generateConversationTitle(conversationId)

Generate conversation title from first message.

**Parameters:**
- `conversationId` (string, required): Conversation ID

**Returns:** `Promise<string>` - Generated title

**Example:**
```javascript
const title = await generateConversationTitle('conv_123');
```

---

### addConversationTags(conversationId, newTags)

Add tags to conversation.

**Parameters:**
- `conversationId` (string, required): Conversation ID
- `newTags` (Array, required): Tags to add

**Returns:** `Promise<Object>` - Updated conversation

**Example:**
```javascript
await addConversationTags('conv_123', ['tutorial', 'beginner']);
```

---

### getConversationStats(conversationId)

Get conversation statistics.

**Parameters:**
- `conversationId` (string, required): Conversation ID

**Returns:** `Promise<Object>` - Conversation statistics

**Example:**
```javascript
const stats = await getConversationStats('conv_123');
// Returns: { totalMessages, userMessages, assistantMessages, ... }
```

---

## Utility Functions

### generateId(prefix)

Generate a unique ID with prefix.

**Parameters:**
- `prefix` (string, required): ID prefix

**Returns:** `string` - Generated ID

**Example:**
```javascript
const id = generateId('custom');
// Returns: 'custom_1234567890_abc123def'
```

---

### estimateTokenCount(text)

Estimate token count for text.

**Parameters:**
- `text` (string, required): Text to count

**Returns:** `number` - Estimated token count

**Example:**
```javascript
const tokens = estimateTokenCount('Hello, how are you?');
```

---

### validateMessageContent(content)

Validate message content.

**Parameters:**
- `content` (string, required): Content to validate

**Returns:** `Object` - Validation result

**Example:**
```javascript
const result = validateMessageContent('Hello');
// Returns: { valid: true } or { valid: false, error: 'Error message' }
```

---

### truncateText(text, maxLength, suffix)

Truncate text to specified length.

**Parameters:**
- `text` (string, required): Text to truncate
- `maxLength` (number, optional): Maximum length (default: 100)
- `suffix` (string, optional): Suffix to add (default: '...')

**Returns:** `string` - Truncated text

**Example:**
```javascript
const short = truncateText('This is a long text...', 20);
```

---

## Error Handling

All API functions follow a consistent error handling pattern:

**Success Response:**
```javascript
{
  success: true,
  data: { ... },
  metadata: {
    timestamp: Date,
    requestId: 'optional'
  }
}
```

**Error Response:**
```javascript
{
  success: false,
  error: {
    code: 'ERROR_CODE',
    message: 'Human-readable error message',
    details: { ... }
  }
}
```

**Error Codes:**

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Input validation failed |
| `NOT_FOUND` | Resource not found |
| `UNAUTHORIZED` | User not authorized |
| `LIMIT_EXCEEDED` | Rate or quota limit exceeded |
| `DATABASE_ERROR` | Database operation failed |
| `INTERNAL_ERROR` | Unexpected internal error |

---

## Response Formats

### Message Object

```javascript
{
  _id: 'wix_generated_id',
  messageId: 'msg_1234567890_abc',
  conversationId: 'conv_1234567890_xyz',
  userId: 'user_1234567890_def',
  role: 'user', // 'user', 'assistant', or 'system'
  content: 'Message content',
  timestamp: Date,
  tokenCount: 25,
  metadata: {},
  attachments: [],
  inReplyTo: null,
  edited: false,
  editedAt: null
}
```

### Conversation Object

```javascript
{
  _id: 'wix_generated_id',
  conversationId: 'conv_1234567890_xyz',
  userId: 'user_1234567890_def',
  title: 'Conversation Title',
  summary: 'AI-generated summary',
  startedAt: Date,
  lastMessageAt: Date,
  endedAt: null,
  messageCount: 15,
  status: 'active', // 'active', 'paused', 'ended', 'archived'
  tags: ['tag1', 'tag2'],
  sentiment: 'positive',
  metadata: {},
  context: 'Current context summary',
  isArchived: false
}
```

### Session Object

```javascript
{
  _id: 'wix_generated_id',
  sessionId: 'sess_1234567890_abc',
  userId: 'user_1234567890_def',
  conversationId: 'conv_1234567890_xyz',
  startedAt: Date,
  lastActivityAt: Date,
  expiresAt: Date,
  status: 'active', // 'active', 'expired', 'ended'
  deviceInfo: {
    browser: 'Chrome',
    os: 'Windows'
  },
  workingMemory: [ /* recent messages */ ],
  contextWindow: [ /* message IDs */ ],
  state: {},
  metadata: {}
}
```

### Context Object

```javascript
{
  conversationId: 'conv_1234567890_xyz',
  userId: 'user_1234567890_def',
  recentMessages: [ /* array of messages */ ],
  messageCount: 20,
  totalTokens: 1250,
  preferences: { /* user preferences */ },
  knowledge: [ /* relevant knowledge items */ ],
  conversationSummary: 'Summary text',
  conversationContext: 'Context text',
  metadata: {
    assembledAt: Date,
    tokenLimit: 8000,
    withinLimit: true
  }
}
```

---

## Rate Limits

| Endpoint Type | Limit | Window |
|---------------|-------|--------|
| Read Operations | 100 requests | 1 minute |
| Write Operations | 50 requests | 1 minute |
| Search Operations | 30 requests | 1 minute |
| Bulk Operations | 10 requests | 1 minute |

---

## Best Practices

1. **Always validate input** before calling API functions
2. **Handle errors gracefully** with try-catch blocks
3. **Use pagination** for large result sets
4. **Cache frequently accessed data** (preferences, sessions)
5. **Cleanup old data** regularly to maintain performance
6. **Monitor token counts** to stay within limits
7. **Use indexes** for efficient queries
8. **Batch operations** when possible to reduce API calls

---

## Examples

### Complete Conversation Flow

```javascript
// 1. Create or get session
const session = await getOrCreateSession('user_456');

// 2. Create conversation if needed
let conversation;
if (!session.conversationId) {
  conversation = await createConversation({ userId: 'user_456' });
  await updateSessionConversation(session.sessionId, conversation.conversationId);
} else {
  conversation = await getConversation(session.conversationId);
}

// 3. Store user message
const userMessage = await storeMessage({
  conversationId: conversation.conversationId,
  userId: 'user_456',
  role: 'user',
  content: 'Hello, AI!'
});

// 4. Build context for AI
const context = await buildConversationContext(
  'user_456',
  conversation.conversationId,
  { limit: 20 }
);

// 5. Get AI response (your AI logic here)
const aiResponse = await getAIResponse(context);

// 6. Store AI message
const assistantMessage = await storeMessage({
  conversationId: conversation.conversationId,
  userId: 'user_456',
  role: 'assistant',
  content: aiResponse
});

// 7. Update session working memory
await addToWorkingMemory(session.sessionId, userMessage);
await addToWorkingMemory(session.sessionId, assistantMessage);

// 8. Update session activity
await updateSessionActivity(session.sessionId);
```

---

For more information, see:
- [Architecture Documentation](./ARCHITECTURE.md)
- [Database Schema](./DATABASE_SCHEMA.md)
- [Implementation Plan](./IMPLEMENTATION_PLAN.md)
