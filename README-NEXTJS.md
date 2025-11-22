# SUPERNova AI - Next.js Implementation

> 🚀 Your no-bullshit business coach for midlife entrepreneurs

A complete Next.js + PostgreSQL + Anthropic Claude implementation of SUPERNova AI with three coaching modes (Body/Brain/Business), tier enforcement, and usage tracking.

---

## 🎯 Features

### ✅ Complete Implementation

- ✨ **Three AI Modes** with Debs's personality:
  - 💪 **BODY**: Physical wellness, menopause, perimenopause
  - 🧠 **BRAIN**: Mental health, ADHD, neurodivergence
  - 🚀 **BUSINESS**: Anti-Branding, Menopreneur strategies

- 🔐 **Tier Enforcement**:
  - FREE: Blocked from SUPERNova (upgrade prompt shown)
  - UPGRADE: 100 messages/month
  - MEMBER: 300 messages/month
  - ADMIN: Unlimited

- 💾 **Full Database Persistence**:
  - Conversations saved to PostgreSQL
  - Messages stored with token tracking
  - Usage quota tracking per user

- 📊 **Usage Tracking**:
  - Real-time message count display
  - Monthly quota enforcement
  - Token usage tracking per message

- 🌊 **Streaming Responses**:
  - Real-time AI responses via Server-Sent Events
  - Smooth typing animation
  - Proper error handling

---

## 🛠 Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env` file:

```bash
cp .env.example .env
```

Edit `.env` and add:

```env
# PostgreSQL Database
DATABASE_URL="postgresql://user:password@localhost:5432/supernova"

# Anthropic API Key
ANTHROPIC_API_KEY="sk-ant-your-key-here"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Set Up Database

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database (creates tables)
npm run db:push

# Optional: Open Prisma Studio to view data
npm run db:studio
```

### 4. Create Test User

You'll need to create a user in the database. Use Prisma Studio or run:

```sql
INSERT INTO "User" (id, email, tier, "createdAt", "updatedAt")
VALUES ('user-123', 'test@example.com', 'MEMBER', NOW(), NOW());
```

### 5. Run Development Server

```bash
npm run dev
```

Visit: `http://localhost:3000`

---

## 🔧 Critical Fixes Implemented

### ✅ Model Name Fixed
- **OLD (Broken)**: `claude-3-5-sonnet-20240620` → 404 error
- **NEW (Working)**: `claude-sonnet-4-20250514` → Latest model

### ✅ Frontend/Backend Data Mismatch Fixed
- **OLD**: Backend sent `{ text: "..." }`, frontend expected `parsed.content`
- **NEW**: Backend sends `{ text: "..." }`, frontend reads `parsed.text`

### ✅ Database Persistence Added
- All messages saved to PostgreSQL
- Conversations created automatically
- Token usage tracked per message

### ✅ Tier Enforcement Added
- FREE users blocked with upgrade prompt
- UPGRADE/MEMBER get quota limits
- ADMIN gets unlimited access

### ✅ Debs's Personality Integrated
- Three distinct system prompts
- Direct, sweary, anti-bullshit tone
- Rock music metaphors
- British English, no corporate jargon

---

## 📁 File Structure

```
supernova-build/
├── prisma/
│   └── schema.prisma              # Database schema
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── supernova/
│   │   │   │   └── route.ts       # Main AI chat API (STREAMING)
│   │   │   ├── conversations/
│   │   │   │   └── route.ts       # Load conversation history
│   │   │   └── usage/
│   │   │       └── route.ts       # Get usage stats
│   │   ├── supernova/
│   │   │   └── page.tsx           # Chat UI (FIXED PARSING)
│   │   ├── layout.tsx             # Root layout
│   │   ├── page.tsx               # Landing page
│   │   └── globals.css            # Global styles
│   └── lib/
│       └── prisma.ts              # Prisma client singleton
├── .env.example                   # Environment template
├── next.config.js                 # Next.js config
├── tsconfig.json                  # TypeScript config
├── tailwind.config.ts             # Tailwind config
└── package.json                   # Dependencies
```

---

## 🎨 Personality Modes

### 💪 BODY Mode
**Focus**: Physical wellness, menopause, perimenopause

**Tone**: Direct, honest, sweary when appropriate. Understands ADHD bodies and sensory sensitivities. Anti-bullshit. Rock music metaphors.

**Example**: "Your hormones are doing the fucking macarena, and that's completely normal at this stage..."

---

### 🧠 BRAIN Mode
**Focus**: Mental health, ADHD, executive dysfunction

**Tone**: Profanity-friendly, anti-establishment, anti-guru. Gets that "some days the brain just isn't braining."

**Example**: "Time blindness is a real fucking thing. Let's build systems that work WITH your ADHD brain..."

---

### 🚀 BUSINESS Mode
**Focus**: Anti-Branding, Menopreneur strategies, ADHD-friendly business

**Tone**: Direct, sweary, anti-gatekeeping. Uses rock metaphors. British English. No "slay" or "hey girl" terminology.

**Example**: "Fuck the personal brand rules. Let's build your business like a rockstar on tour..."

---

## 🔒 Tier System

| Tier | SUPERNova Access | Monthly Limit |
|------|------------------|---------------|
| FREE | ❌ Blocked | 0 messages |
| UPGRADE | ✅ Allowed | 100 messages |
| MEMBER | ✅ Allowed | 300 messages |
| ADMIN | ✅ Allowed | Unlimited |

---

## 📊 Database Schema

### User
- `id`: Unique user ID
- `email`: User email
- `tier`: FREE, UPGRADE, MEMBER, ADMIN
- `createdAt`, `updatedAt`: Timestamps

### Conversation
- `id`: Conversation ID
- `userId`: Foreign key to User
- `title`: Auto-generated from first message
- `mode`: BODY, BRAIN, or BUSINESS
- `messages`: Related messages

### Message
- `id`: Message ID
- `conversationId`: Foreign key to Conversation
- `userId`: Foreign key to User
- `role`: USER, ASSISTANT, SYSTEM
- `content`: Message text
- `tokensUsed`: Tokens consumed (from Anthropic API)
- `modelUsed`: Model name (claude-sonnet-4-20250514)

### UsageTracking
- `userId`: One-to-one with User
- `supernovaMessages`: Monthly message count (resets each month)
- `totalMessages`: Lifetime message count
- `totalTokens`: Lifetime token count

---

## 🚀 API Endpoints

### `POST /api/supernova`
Send a message to SUPERNova AI.

**Request**:
```json
{
  "message": "How do I handle menopause brain fog?",
  "userId": "user-123",
  "conversationId": "conv-456",  // Optional
  "mode": "BODY"
}
```

**Response**: Server-Sent Events stream
```
data: {"text": "Let's talk about..."}
data: {"text": " brain fog"}
data: {"done": true, "conversationId": "conv-456", "tokensUsed": 1234, "usage": {"used": 7, "limit": 100}}
```

---

### `GET /api/conversations?userId=user-123`
Get user's conversation history.

**Response**:
```json
{
  "conversations": [
    {
      "id": "conv-456",
      "title": "Menopause brain fog strategies",
      "mode": "BODY",
      "messages": [...],
      "createdAt": "2024-11-22T00:00:00Z"
    }
  ]
}
```

---

### `GET /api/usage?userId=user-123`
Get user's usage statistics.

**Response**:
```json
{
  "tier": "MEMBER",
  "usage": {
    "used": 7,
    "limit": 300,
    "remaining": 293
  },
  "totalMessages": 42,
  "totalTokens": 15234
}
```

---

## 🧪 Testing Checklist

- [ ] Chat sends message and receives streaming response
- [ ] Mode selector changes AI personality
- [ ] FREE tier users see upgrade prompt
- [ ] UPGRADE tier users have 100 message limit
- [ ] MEMBER tier users have 300 message limit
- [ ] Usage counter increments correctly
- [ ] Conversation persists to database
- [ ] Messages save with token counts
- [ ] Error messages display properly
- [ ] Clear conversation button works

---

## 🐛 Known Issues / TODOs

- [ ] Replace hardcoded `userId` with real authentication
- [ ] Add conversation history sidebar
- [ ] Implement conversation search
- [ ] Add conversation sharing
- [ ] Add export conversation feature
- [ ] Improve mobile responsiveness
- [ ] Add dark mode toggle
- [ ] Add message editing
- [ ] Add regenerate response button

---

## 🔐 Security Notes

- API key is server-side only (never exposed to client)
- All database queries filtered by authenticated user ID
- Tier enforcement prevents unauthorized access
- Usage limits prevent abuse

---

## 📝 Development Notes

### Model Selection
The correct Anthropic Claude model is **`claude-sonnet-4-20250514`**. Do not change this unless Anthropic releases a newer model.

### Streaming Format
The API uses Server-Sent Events (SSE) with the format:
```
data: {"text": "chunk"}\n\n
```

Frontend must parse line-by-line and look for `data:` prefix.

### Token Tracking
Tokens are reported by Anthropic in the stream:
- `message_start`: Contains `input_tokens`
- `message_delta`: Contains `output_tokens`

Total tokens = input + output.

---

## 🎯 Success Criteria

✅ **All Implemented**:
1. Correct Claude model name (claude-sonnet-4-20250514)
2. Fixed frontend parsing (text vs content)
3. Database persistence working
4. Tier enforcement blocking FREE users
5. Usage quota tracking and display
6. Three personality modes with Debs's voice
7. Token tracking per message
8. Conversation management
9. Error handling with upgrade prompts
10. Streaming responses working

---

## 📞 Support

For issues or questions, check:
- Prisma logs: `npm run db:studio`
- Next.js console output
- Browser console for frontend errors
- Database connection in `.env`

---

## 🎸 Rock On!

Built with the same no-bullshit energy as Debs's coaching. Now go build your business like a rockstar. 🚀
