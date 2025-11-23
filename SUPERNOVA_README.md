# SUPERNova AI - Intelligent Coaching Assistant

## 🌟 What is SUPERNova AI?

SUPERNova AI is the intelligent coaching assistant for The dAItaniverse - your bold, direct, anti-BS coach across three pillars: **Body**, **Brain**, and **Business**.

### Key Features

✅ **Three Coaching Modes**
- 🫀 **BODY** - Health, wellness, fitness, energy management
- 🧠 **BRAIN** - ADHD support, mindset, executive function
- 📈 **BUSINESS** - Strategy, growth, entrepreneurship

✅ **Conversation Memory System**
- Remembers context across all chats
- Stores user facts, preferences, goals, and insights
- Provides personalized coaching based on your patterns

✅ **Bold Personality**
- Direct, authentic, no corporate BS
- Rock-and-roll energy with deep compassion
- Challenges you BECAUSE it believes in you
- Calls out excuses and self-sabotage

✅ **Streaming Responses**
- Real-time Claude AI responses
- No lag, instant feedback
- Natural conversation flow

✅ **Full Memory & History**
- All conversations saved to database
- Resume any conversation
- Track your progress over time

## 🚀 Quick Start

### 1. Prerequisites

- Node.js 18+ installed
- PostgreSQL database running
- Anthropic API key

### 2. Installation

```bash
# Install dependencies
cd venued
npm install

# Install root dependencies (Prisma)
cd ..
npm install
```

### 3. Environment Setup

Create a `.env` file in the root:

```env
DATABASE_URL="postgresql://postgres:supernova26@localhost:5432/daitaniverse"
JWT_SECRET="your-super-secret-key-change-this-later"
NODE_ENV="development"
ANTHROPIC_API_KEY="your-anthropic-api-key-here"
```

### 4. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed with demo data
npm run seed
```

### 5. Start the App

```bash
cd venued
npm run dev
```

Visit **http://localhost:3000/supernova** to start chatting!

## 📊 Database Schema

### Core Tables

**User** - User accounts with profile and subscription info
- Email, password, name
- Role, subscription status/tier
- Bio, location, niche, skills

**Conversation** - Chat conversations
- Title, coaching mode (BODY/BRAIN/BUSINESS/GENERAL)
- User relationship
- Archived status, folder organization
- Timestamps

**Message** - Individual chat messages
- User or assistant role
- Content, tokens used, model used
- Conversation relationship

**UserMemory** - Stored user context
- Memory type (FACT, PREFERENCE, GOAL, CONTEXT, INSIGHT)
- Importance score (0-10)
- Pillar tags (BODY, BRAIN, BUSINESS)
- Source conversation tracking

**Folder** - Conversation organization
- Name, color, order
- User relationship

**Program** - Content library (future)
- Courses, workshops, coaching programs
- Associated with coaching modes

## 🎨 Coaching Modes

### BODY Mode - Health & Wellness
Focuses on physical excellence, energy management, and sustainable health habits.

**Expertise:**
- Nutrition and real food
- Movement and strength training
- Sleep optimization
- Energy management
- Nervous system regulation

**Approach:**
- Systems over goals
- Function over form
- Track energy, not just metrics
- Sustainable habits

### BRAIN Mode - ADHD & Mindset
Designed for ADHD brains and mental performance optimization.

**Expertise:**
- ADHD strategies and accommodations
- Executive function tools
- Time management for ADHD
- Emotional regulation
- Dopamine management
- Pattern recognition

**Approach:**
- Validate ADHD experience first
- Design systems for YOUR brain
- Call out shame spirals
- Celebrate hyperfocus wins
- Externalize executive function

### BUSINESS Mode - Strategy & Growth
Entrepreneurship coaching focused on revenue and strategic clarity.

**Expertise:**
- Business strategy and positioning
- Revenue generation and pricing
- Marketing and messaging
- Systems and automation
- Scaling without burnout
- Niche clarity

**Approach:**
- Cut through noise - ONE focus
- Revenue-generating activities first
- Challenge shiny object syndrome
- Implementation over planning
- Price based on value, not fear

## 🔧 Technical Architecture

### Frontend (Next.js 16)
- **Framework:** Next.js with App Router
- **Styling:** Tailwind CSS v4
- **Icons:** Lucide React
- **Language:** TypeScript 5

### Backend
- **API:** Next.js API Routes
- **Database:** PostgreSQL
- **ORM:** Prisma 5
- **AI:** Anthropic Claude API (Sonnet 3.5)
- **Streaming:** Server-Sent Events (SSE)

### Key Files

```
venued/
├── app/
│   ├── supernova/page.tsx         # Chat UI
│   └── api/chat/route.ts          # Chat API with streaming
├── lib/
│   ├── prisma.ts                  # Prisma client singleton
│   └── personalities.ts           # Coaching mode personalities
└── components/
    └── Navigation.tsx             # Main nav (includes SUPERNova link)

prisma/
├── schema.prisma                  # Database schema
└── seed.ts                        # Demo data seeder

.env                               # Environment variables
```

## 💬 How It Works

1. **User sends a message** in the chat interface
2. **Frontend** sends POST to `/api/chat` with message, userId, mode
3. **API route:**
   - Gets or creates conversation
   - Fetches user memories from database
   - Builds conversation history (last 20 messages)
   - Generates personality-enhanced system prompt
   - Calls Claude API with streaming
4. **Streaming response** sent back to frontend via SSE
5. **Messages saved** to database (user + assistant)
6. **Conversation updated** with latest timestamp
7. **UI updates in real-time** as tokens arrive

## 🎯 Demo User

After seeding, you'll have a demo user:

- **Email:** demo@daitaniverse.com
- **User ID:** demo-user-1
- **Pre-loaded memories:**
  - Has ADHD and struggles with time management
  - Wants to build 6-figure coaching business
  - Prefers direct, no-BS communication
  - Morning energy, crashes after 3pm
  - Starts many projects, struggles to finish

## 🔐 Security Notes

**Current Implementation (MVP):**
- Demo user hardcoded in UI
- No authentication required
- Passwords stored as plain text in seed

**Production Requirements:**
- Add authentication (NextAuth, Clerk, etc.)
- Hash passwords with bcrypt
- Add JWT token validation
- Implement rate limiting
- Add CORS protection
- Secure API key storage

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL is running
psql -U postgres -h localhost -p 5432

# Reset database if needed
npx prisma db push --force-reset
npm run seed
```

### Prisma Client Errors
```bash
# Regenerate Prisma client
npx prisma generate
```

### API Key Issues
- Verify `ANTHROPIC_API_KEY` in `.env`
- Check API key has credits
- Test key with curl:
```bash
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{"model": "claude-3-5-sonnet-20241022", "max_tokens": 10, "messages": [{"role": "user", "content": "Hi"}]}'
```

### Build Errors
```bash
# Clear Next.js cache
cd venued
rm -rf .next
npm run dev
```

## 📈 Future Enhancements

- [ ] User authentication and authorization
- [ ] Program recommendation engine
- [ ] Upload and process knowledge base documents
- [ ] Semantic search for memory retrieval
- [ ] Conversation folders and organization
- [ ] Export conversations
- [ ] Voice input/output
- [ ] Mobile app (React Native)
- [ ] Analytics and insights dashboard
- [ ] Multi-user team coaching
- [ ] Payment integration (Stripe)

## 🎸 The dAItaniverse Philosophy

This isn't your typical AI chatbot. SUPERNova is built on these principles:

1. **Truth over comfort** - We tell you what you NEED to hear, not what you want to hear
2. **Action over planning** - Implementation beats endless strategizing
3. **Systems over willpower** - Design your environment, don't rely on motivation
4. **Progress over perfection** - Done is better than perfect
5. **Authenticity over polish** - Real talk, zero corporate BS

## 🤘 Rock On

Built with passion for The dAItaniverse.

**Tech Stack:**
- Next.js 16 • TypeScript • Tailwind CSS
- Prisma • PostgreSQL • Claude AI
- React • Lucide Icons

**Version:** 1.0.0 - Phase 2C MVP Complete

---

Ready to transform? Visit `/supernova` and let's GO! 🚀
