# The dAItaniverse - API Reference

## Table of Contents
1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Auth Endpoints](#auth-endpoints)
4. [User Endpoints](#user-endpoints)
5. [Agent Endpoints](#agent-endpoints)
6. [Conversation Endpoints](#conversation-endpoints)
7. [Message Endpoints](#message-endpoints)
8. [Payment Endpoints](#payment-endpoints)
9. [Analytics Endpoints](#analytics-endpoints)
10. [WebSocket Events](#websocket-events)
11. [Error Codes](#error-codes)

---

## Overview

### Base URL
```
Production: https://api.daitaniverse.com/v1
Staging: https://api-staging.daitaniverse.com/v1
Development: http://localhost:3000/api/v1
```

### Request Format
- **Content-Type**: `application/json`
- **Accept**: `application/json`
- **Authorization**: `Bearer {access_token}`

### Response Format
```json
{
  "success": true,
  "data": {...},
  "message": "Operation successful",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Pagination
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Rate Limiting
- **Authenticated**: 1000 requests/hour
- **Unauthenticated**: 100 requests/hour
- **Headers**:
  - `X-RateLimit-Limit`: Request limit
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Reset timestamp

---

## Authentication

### Bearer Token
Include in `Authorization` header:
```
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Token Expiry
- **Access Token**: 15 minutes
- **Refresh Token**: 7 days

### Refresh Flow
When access token expires, use refresh token to get new tokens.

---

## Auth Endpoints

### Register User
```http
POST /auth/register
```

**Request Body**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "username": "johndoe",
  "displayName": "John Doe"
}
```

**Response** (201 Created)
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "usr_abc123",
      "email": "user@example.com",
      "username": "johndoe",
      "displayName": "John Doe",
      "subscriptionTier": "free",
      "createdAt": "2024-01-15T10:30:00Z"
    },
    "tokens": {
      "accessToken": "eyJhbGc...",
      "refreshToken": "eyJhbGc...",
      "expiresIn": 900
    }
  }
}
```

**Validation Rules**
- `email`: Valid email format, unique
- `password`: Min 8 chars, 1 uppercase, 1 number, 1 special char
- `username`: 3-50 chars, alphanumeric + underscore, unique
- `displayName`: 1-100 chars

---

### Login
```http
POST /auth/login
```

**Request Body**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response** (200 OK)
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "usr_abc123",
      "email": "user@example.com",
      "username": "johndoe",
      "displayName": "John Doe",
      "subscriptionTier": "pro",
      "messageCount": 150,
      "messageLimit": 1000
    },
    "tokens": {
      "accessToken": "eyJhbGc...",
      "refreshToken": "eyJhbGc...",
      "expiresIn": 900
    }
  }
}
```

---

### Refresh Token
```http
POST /auth/refresh
```

**Request Body**
```json
{
  "refreshToken": "eyJhbGc..."
}
```

**Response** (200 OK)
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "expiresIn": 900
  }
}
```

---

### Logout
```http
POST /auth/logout
```

**Headers**
```
Authorization: Bearer {access_token}
```

**Response** (200 OK)
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### OAuth - Google
```http
GET /auth/google
```

Redirects to Google OAuth consent screen.

**Callback**
```http
GET /auth/google/callback?code=...
```

Returns access/refresh tokens.

---

### OAuth - GitHub
```http
GET /auth/github
```

Redirects to GitHub OAuth consent screen.

**Callback**
```http
GET /auth/github/callback?code=...
```

Returns access/refresh tokens.

---

## User Endpoints

### Get Current User
```http
GET /users/me
```

**Response** (200 OK)
```json
{
  "success": true,
  "data": {
    "id": "usr_abc123",
    "email": "user@example.com",
    "emailVerified": true,
    "username": "johndoe",
    "displayName": "John Doe",
    "avatarUrl": "https://cdn.daitaniverse.com/avatars/...",
    "bio": "AI enthusiast",
    "subscriptionTier": "pro",
    "subscriptionStatus": "active",
    "messageCount": 150,
    "messageLimit": 1000,
    "createdAt": "2024-01-15T10:30:00Z",
    "lastLoginAt": "2024-01-20T08:15:00Z"
  }
}
```

---

### Update Profile
```http
PATCH /users/me
```

**Request Body**
```json
{
  "displayName": "John Smith",
  "bio": "AI researcher and developer",
  "username": "johnsmith"
}
```

**Response** (200 OK)
```json
{
  "success": true,
  "data": {
    "id": "usr_abc123",
    "displayName": "John Smith",
    "bio": "AI researcher and developer",
    "username": "johnsmith"
  },
  "message": "Profile updated successfully"
}
```

---

### Upload Avatar
```http
POST /users/me/avatar
```

**Request** (multipart/form-data)
```
Content-Type: multipart/form-data

avatar: [binary file]
```

**Response** (200 OK)
```json
{
  "success": true,
  "data": {
    "avatarUrl": "https://cdn.daitaniverse.com/avatars/usr_abc123.jpg"
  }
}
```

**Constraints**
- Max file size: 5MB
- Allowed formats: JPG, PNG, WebP
- Image dimensions: 200x200 to 2000x2000

---

### Get Usage Statistics
```http
GET /users/me/usage
```

**Response** (200 OK)
```json
{
  "success": true,
  "data": {
    "currentPeriod": {
      "startDate": "2024-01-01",
      "endDate": "2024-01-31",
      "messagesUsed": 150,
      "messageLimit": 1000,
      "percentageUsed": 15
    },
    "allTime": {
      "totalMessages": 5420,
      "totalConversations": 89,
      "totalTokens": 1250000
    }
  }
}
```

---

### Delete Account
```http
DELETE /users/me
```

**Request Body**
```json
{
  "password": "SecurePassword123!",
  "confirmation": "DELETE"
}
```

**Response** (200 OK)
```json
{
  "success": true,
  "message": "Account deleted successfully"
}
```

---

## Agent Endpoints

### List Agents
```http
GET /agents?page=1&limit=20&filter=mine
```

**Query Parameters**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)
- `filter` (optional): `mine` | `public` | `templates`
- `search` (optional): Search by name or description

**Response** (200 OK)
```json
{
  "success": true,
  "data": [
    {
      "id": "agt_xyz789",
      "name": "Code Assistant",
      "description": "Helps with programming tasks",
      "avatarUrl": "https://cdn.daitaniverse.com/agents/...",
      "model": "claude-3-5-sonnet-20241022",
      "isPublic": false,
      "conversationCount": 12,
      "createdAt": "2024-01-10T14:20:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "totalPages": 1
  }
}
```

---

### Create Agent
```http
POST /agents
```

**Request Body**
```json
{
  "name": "Code Assistant",
  "description": "Helps with programming tasks",
  "systemPrompt": "You are an expert programmer...",
  "model": "claude-3-5-sonnet-20241022",
  "temperature": 1.0,
  "maxTokens": 4096,
  "isPublic": false,
  "personalityTraits": {
    "tone": "professional",
    "verbosity": "concise"
  }
}
```

**Response** (201 Created)
```json
{
  "success": true,
  "data": {
    "id": "agt_xyz789",
    "name": "Code Assistant",
    "description": "Helps with programming tasks",
    "systemPrompt": "You are an expert programmer...",
    "model": "claude-3-5-sonnet-20241022",
    "temperature": 1.0,
    "maxTokens": 4096,
    "userId": "usr_abc123",
    "isPublic": false,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

**Validation**
- `name`: Required, 1-100 chars
- `systemPrompt`: Required, 1-10000 chars
- `model`: Valid Anthropic model name
- `temperature`: 0-2
- `maxTokens`: 1-200000

---

### Get Agent
```http
GET /agents/:id
```

**Response** (200 OK)
```json
{
  "success": true,
  "data": {
    "id": "agt_xyz789",
    "name": "Code Assistant",
    "description": "Helps with programming tasks",
    "systemPrompt": "You are an expert programmer...",
    "model": "claude-3-5-sonnet-20241022",
    "temperature": 1.0,
    "maxTokens": 4096,
    "streamingEnabled": true,
    "memoryEnabled": true,
    "userId": "usr_abc123",
    "isPublic": false,
    "conversationCount": 12,
    "messageCount": 450,
    "createdAt": "2024-01-10T14:20:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

---

### Update Agent
```http
PATCH /agents/:id
```

**Request Body**
```json
{
  "name": "Senior Code Assistant",
  "description": "Expert-level programming help",
  "systemPrompt": "You are a senior software engineer...",
  "temperature": 0.8
}
```

**Response** (200 OK)
```json
{
  "success": true,
  "data": {
    "id": "agt_xyz789",
    "name": "Senior Code Assistant",
    "temperature": 0.8,
    "updatedAt": "2024-01-15T11:00:00Z"
  },
  "message": "Agent updated successfully"
}
```

---

### Delete Agent
```http
DELETE /agents/:id
```

**Response** (200 OK)
```json
{
  "success": true,
  "message": "Agent deleted successfully"
}
```

---

### Duplicate Agent
```http
POST /agents/:id/duplicate
```

**Request Body** (optional)
```json
{
  "name": "Code Assistant Copy"
}
```

**Response** (201 Created)
```json
{
  "success": true,
  "data": {
    "id": "agt_new123",
    "name": "Code Assistant Copy",
    "...": "..."
  }
}
```

---

## Conversation Endpoints

### List Conversations
```http
GET /conversations?page=1&limit=20&status=active
```

**Query Parameters**
- `page`: Page number
- `limit`: Items per page
- `status`: `active` | `archived` | `all`

**Response** (200 OK)
```json
{
  "success": true,
  "data": [
    {
      "id": "conv_123abc",
      "title": "Chat with Code Assistant",
      "agentId": "agt_xyz789",
      "agent": {
        "id": "agt_xyz789",
        "name": "Code Assistant",
        "avatarUrl": "..."
      },
      "status": "active",
      "messageCount": 15,
      "lastMessageAt": "2024-01-15T10:30:00Z",
      "createdAt": "2024-01-15T09:00:00Z"
    }
  ],
  "pagination": {...}
}
```

---

### Create Conversation
```http
POST /conversations
```

**Request Body**
```json
{
  "agentId": "agt_xyz789",
  "title": "New conversation"
}
```

**Response** (201 Created)
```json
{
  "success": true,
  "data": {
    "id": "conv_123abc",
    "title": "New conversation",
    "agentId": "agt_xyz789",
    "userId": "usr_abc123",
    "status": "active",
    "messageCount": 0,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

---

### Get Conversation
```http
GET /conversations/:id
```

**Response** (200 OK)
```json
{
  "success": true,
  "data": {
    "id": "conv_123abc",
    "title": "Chat with Code Assistant",
    "agentId": "agt_xyz789",
    "agent": {
      "id": "agt_xyz789",
      "name": "Code Assistant",
      "model": "claude-3-5-sonnet-20241022"
    },
    "status": "active",
    "messageCount": 15,
    "totalTokensUsed": 12500,
    "lastMessageAt": "2024-01-15T10:30:00Z",
    "createdAt": "2024-01-15T09:00:00Z"
  }
}
```

---

### Update Conversation
```http
PATCH /conversations/:id
```

**Request Body**
```json
{
  "title": "Updated title"
}
```

**Response** (200 OK)
```json
{
  "success": true,
  "data": {
    "id": "conv_123abc",
    "title": "Updated title",
    "updatedAt": "2024-01-15T11:00:00Z"
  }
}
```

---

### Archive Conversation
```http
POST /conversations/:id/archive
```

**Response** (200 OK)
```json
{
  "success": true,
  "data": {
    "id": "conv_123abc",
    "status": "archived",
    "archivedAt": "2024-01-15T11:00:00Z"
  }
}
```

---

### Delete Conversation
```http
DELETE /conversations/:id
```

**Response** (200 OK)
```json
{
  "success": true,
  "message": "Conversation deleted successfully"
}
```

---

## Message Endpoints

### List Messages
```http
GET /conversations/:conversationId/messages?page=1&limit=50
```

**Response** (200 OK)
```json
{
  "success": true,
  "data": [
    {
      "id": "msg_def456",
      "conversationId": "conv_123abc",
      "role": "user",
      "content": "How do I reverse a string in Python?",
      "tokenCount": 12,
      "createdAt": "2024-01-15T10:25:00Z"
    },
    {
      "id": "msg_ghi789",
      "conversationId": "conv_123abc",
      "role": "assistant",
      "content": "Here's how to reverse a string in Python:\n\n```python\ntext = 'hello'\nreversed_text = text[::-1]\n```",
      "tokenCount": 45,
      "model": "claude-3-5-sonnet-20241022",
      "createdAt": "2024-01-15T10:25:15Z"
    }
  ],
  "pagination": {...}
}
```

---

### Send Message
```http
POST /conversations/:conversationId/messages
```

**Request Body**
```json
{
  "content": "How do I reverse a string in Python?"
}
```

**Response** (201 Created)
```json
{
  "success": true,
  "data": {
    "id": "msg_def456",
    "conversationId": "conv_123abc",
    "role": "user",
    "content": "How do I reverse a string in Python?",
    "tokenCount": 12,
    "createdAt": "2024-01-15T10:25:00Z"
  }
}
```

**Note**: AI response is streamed via WebSocket.

---

### Delete Message
```http
DELETE /messages/:id
```

**Response** (200 OK)
```json
{
  "success": true,
  "message": "Message deleted successfully"
}
```

---

## Payment Endpoints

### Create Checkout Session
```http
POST /payments/checkout
```

**Request Body**
```json
{
  "priceId": "price_1234567890"
}
```

**Response** (200 OK)
```json
{
  "success": true,
  "data": {
    "sessionId": "cs_test_1234567890",
    "url": "https://checkout.stripe.com/pay/cs_test_1234567890"
  }
}
```

---

### Get Current Subscription
```http
GET /subscriptions/current
```

**Response** (200 OK)
```json
{
  "success": true,
  "data": {
    "id": "sub_abc123",
    "plan": "pro",
    "status": "active",
    "amount": 1900,
    "currency": "usd",
    "currentPeriodStart": "2024-01-01T00:00:00Z",
    "currentPeriodEnd": "2024-02-01T00:00:00Z",
    "cancelAtPeriodEnd": false
  }
}
```

---

### Cancel Subscription
```http
POST /subscriptions/cancel
```

**Response** (200 OK)
```json
{
  "success": true,
  "data": {
    "id": "sub_abc123",
    "cancelAtPeriodEnd": true,
    "canceledAt": "2024-01-15T10:30:00Z"
  },
  "message": "Subscription will be canceled at period end"
}
```

---

### Get Customer Portal URL
```http
GET /subscriptions/portal
```

**Response** (200 OK)
```json
{
  "success": true,
  "data": {
    "url": "https://billing.stripe.com/session/live_1234567890"
  }
}
```

---

## Analytics Endpoints

### Get Dashboard Stats
```http
GET /analytics/dashboard
```

**Response** (200 OK)
```json
{
  "success": true,
  "data": {
    "conversations": {
      "total": 89,
      "active": 12,
      "thisMonth": 15
    },
    "messages": {
      "total": 5420,
      "thisMonth": 450,
      "avgPerDay": 15
    },
    "usage": {
      "messagesUsed": 150,
      "messageLimit": 1000,
      "percentageUsed": 15
    },
    "agents": {
      "total": 5,
      "public": 1
    }
  }
}
```

---

### Get Conversation Analytics
```http
GET /analytics/conversations/:id
```

**Response** (200 OK)
```json
{
  "success": true,
  "data": {
    "conversationId": "conv_123abc",
    "messageCount": 25,
    "totalTokens": 15000,
    "avgResponseTime": 2.5,
    "userMessages": 13,
    "assistantMessages": 12,
    "createdAt": "2024-01-10T09:00:00Z",
    "lastActivity": "2024-01-15T10:30:00Z",
    "duration": "5 days"
  }
}
```

---

## WebSocket Events

### Connection
```javascript
import io from 'socket.io-client';

const socket = io('wss://api.daitaniverse.com', {
  auth: {
    token: accessToken
  }
});
```

---

### Join Conversation
**Client → Server**
```javascript
socket.emit('join:conversation', {
  conversationId: 'conv_123abc'
});
```

**Server → Client**
```javascript
socket.on('user:joined', (data) => {
  // { userId: 'usr_abc123' }
});
```

---

### Typing Indicators
**Client → Server**
```javascript
socket.emit('typing:start', {
  conversationId: 'conv_123abc'
});

socket.emit('typing:stop', {
  conversationId: 'conv_123abc'
});
```

**Server → Client**
```javascript
socket.on('typing:start', (data) => {
  // { userId: 'usr_def456' }
});

socket.on('typing:stop', (data) => {
  // { userId: 'usr_def456' }
});
```

---

### Message Streaming
**Server → Client**
```javascript
// Stream start
socket.on('message:stream:start', () => {
  console.log('AI response starting...');
});

// Stream chunks
socket.on('message:stream:chunk', (data) => {
  console.log(data.chunk); // "Hello, "
});

// Stream end
socket.on('message:stream:end', (data) => {
  console.log('AI response complete');
  // { messageId: 'msg_xyz789' }
});

// Stream error
socket.on('message:stream:error', (data) => {
  console.error(data.error);
});
```

---

## Error Codes

### HTTP Status Codes
| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 422 | Validation Error |
| 429 | Too Many Requests |
| 500 | Internal Server Error |
| 503 | Service Unavailable |

### Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      }
    ]
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Error Codes
| Code | Description |
|------|-------------|
| `UNAUTHORIZED` | Missing or invalid authentication |
| `FORBIDDEN` | Insufficient permissions |
| `NOT_FOUND` | Resource not found |
| `VALIDATION_ERROR` | Input validation failed |
| `DUPLICATE_ERROR` | Resource already exists |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `QUOTA_EXCEEDED` | Usage limit exceeded |
| `PAYMENT_REQUIRED` | Upgrade required |
| `INTERNAL_ERROR` | Server error |
| `SERVICE_UNAVAILABLE` | Service temporarily unavailable |

---

## Best Practices

### Authentication
- Always include `Authorization` header
- Refresh tokens before expiry
- Store tokens securely (not in localStorage)

### Pagination
- Use reasonable `limit` values (20-50)
- Implement cursor-based pagination for large datasets

### Rate Limiting
- Implement exponential backoff for retries
- Cache responses where possible
- Use WebSockets for real-time updates

### Error Handling
- Check `success` field in response
- Handle all error codes gracefully
- Display user-friendly error messages

### WebSockets
- Reconnect on disconnect
- Handle connection errors
- Clean up event listeners

---

## SDKs & Libraries

### Official SDKs (Planned)
- JavaScript/TypeScript SDK
- Python SDK
- Ruby SDK
- Go SDK

### Community SDKs
- Contributions welcome!

---

## Changelog

### v1.0.0 (2024-01-15)
- Initial API release
- Authentication endpoints
- User management
- Agent CRUD
- Conversation & message management
- Payment integration
- WebSocket events

---

## Support

- **Documentation**: https://docs.daitaniverse.com
- **API Status**: https://status.daitaniverse.com
- **Support Email**: support@daitaniverse.com
- **GitHub Issues**: https://github.com/daitaniverse/api/issues

---

**Happy Building! 🚀**
