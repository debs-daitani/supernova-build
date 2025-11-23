# SUPERNova AI - Comprehensive Memory System Design
## PostgreSQL + Next.js Implementation

> **Goal**: SUPERNova remembers EVERYTHING - eliminating the need to copy/paste context between conversations

---

## Table of Contents
1. [System Overview](#system-overview)
2. [Database Schema Extensions](#database-schema-extensions)
3. [Memory Types & Storage](#memory-types--storage)
4. [Memory Extraction & Processing](#memory-extraction--processing)
5. [Memory Retrieval & Context Assembly](#memory-retrieval--context-assembly)
6. [Implementation Roadmap](#implementation-roadmap)
7. [Cost & Performance Modeling](#cost--performance-modeling)

---

## System Overview

### Core Principle
**Everything the user shares gets extracted, categorized, and stored** for intelligent retrieval across ALL future conversations.

### Memory Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    CONVERSATION LAYER                        │
│  User sends message → SUPERNova responds with full context  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  MEMORY EXTRACTION LAYER                     │
│  Background: Extract facts, goals, preferences, patterns    │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    STORAGE LAYER (PostgreSQL)                │
│  UserMemory, ConversationSummary, EntityExtraction          │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  RETRIEVAL & ASSEMBLY LAYER                  │
│  Pull relevant memories → Build rich context for Claude     │
└─────────────────────────────────────────────────────────────┘
```

---

## Database Schema Extensions

### Existing Schema (Already Implemented)
```prisma
model User {
  id              String         @id @default(cuid())
  email           String         @unique
  conversations   Conversation[]
  messages        Message[]
  userMemories    UserMemory[]   // Basic memory storage
}

model Conversation {
  id              String    @id @default(cuid())
  userId          String
  mode            String    // BODY, BRAIN, BUSINESS, GENERAL
  title           String
  messages        Message[]
  lastMessageAt   DateTime  @default(now())
}

model Message {
  id              String   @id @default(cuid())
  conversationId  String
  userId          String
  role            String   // 'user' | 'assistant'
  content         String   @db.Text
  modelUsed       String?
  createdAt       DateTime @default(now())
}

model UserMemory {
  id              String   @id @default(cuid())
  userId          String
  content         String   @db.Text
  memoryType      String   // 'fact', 'preference', 'goal', 'context'
  pillarTags      String[] // BODY, BRAIN, BUSINESS
  importanceScore Int      @default(5)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

### NEW MODELS TO ADD

#### 1. ConversationSummary
**Purpose**: Store AI-generated summaries of conversations to reduce token usage

```prisma
model ConversationSummary {
  id                String       @id @default(cuid())
  conversationId    String       @unique
  conversation      Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  userId            String
  user              User         @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Summary fields
  summary           String       @db.Text  // Concise summary of entire conversation
  keyTopics         String[]     // ['purpose', 'rebel yell', 'branding']
  keyConcepts       String[]     // Main ideas discussed
  actionItems       String[]     // TODOs or commitments made
  emotionalTone     String?      // 'frustrated', 'motivated', 'stuck', etc.

  // Metadata
  messageCount      Int          // Number of messages summarized
  pillar            String       // BODY, BRAIN, BUSINESS, GENERAL
  createdAt         DateTime     @default(now())
  updatedAt         DateTime     @updatedAt

  @@index([userId])
  @@index([conversationId])
}
```

#### 2. ExtractedEntity
**Purpose**: Extract and store people, places, projects, concepts mentioned

```prisma
model ExtractedEntity {
  id                String       @id @default(cuid())
  userId            String
  user              User         @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Entity details
  entityType        String       // 'person', 'place', 'project', 'concept', 'business', 'tool'
  name              String       // "My new coaching program"
  description       String?      @db.Text // Additional context

  // Relationships
  conversationIds   String[]     // Where this entity was mentioned
  relatedMemoryIds  String[]     // Links to UserMemory records

  // Metadata
  firstMentioned    DateTime     @default(now())
  lastMentioned     DateTime     @updatedAt
  mentionCount      Int          @default(1)
  importanceScore   Int          @default(5) // 1-10
  pillarTags        String[]     // BODY, BRAIN, BUSINESS

  @@index([userId])
  @@index([entityType])
  @@index([userId, entityType])
}
```

#### 3. UserPattern
**Purpose**: Track behavior patterns, triggers, and recurring themes

```prisma
model UserPattern {
  id                String   @id @default(cuid())
  userId            String
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Pattern details
  patternType       String   // 'trigger', 'recurring_theme', 'limiting_belief', 'strength', 'struggle'
  description       String   @db.Text  // "Gets stuck on branding when overwhelmed"
  evidence          String[] // ["conv-123", "conv-456"] - Supporting conversation IDs

  // Tracking
  firstObserved     DateTime @default(now())
  lastObserved      DateTime @updatedAt
  observationCount  Int      @default(1)
  confidence        Float    @default(0.5) // 0.0 - 1.0 confidence in pattern
  pillarTags        String[] // BODY, BRAIN, BUSINESS

  @@index([userId])
  @@index([patternType])
}
```

#### 4. ConversationLink
**Purpose**: Link related conversations and track conversation threads

```prisma
model ConversationLink {
  id                  String       @id @default(cuid())
  conversationId      String
  conversation        Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  linkedConversationId String
  linkedConversation  Conversation @relation("LinkedConversations", fields: [linkedConversationId], references: [id], onDelete: Cascade)

  linkType            String       // 'continuation', 'related_topic', 'follow_up', 'callback'
  relevanceScore      Float        @default(0.5) // How related are these conversations
  createdAt           DateTime     @default(now())

  @@index([conversationId])
  @@index([linkedConversationId])
}
```

#### 5. MemorySession
**Purpose**: Track what memories were used in each conversation

```prisma
model MemorySession {
  id                String       @id @default(cuid())
  conversationId    String
  conversation      Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  userId            String
  user              User         @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Memory tracking
  memoriesUsed      String[]     // IDs of UserMemory records included
  entitiesReferenced String[]    // IDs of ExtractedEntity records used
  patternsApplied   String[]     // IDs of UserPattern records leveraged
  summariesIncluded String[]     // IDs of ConversationSummary records included

  // Performance
  totalTokensUsed   Int?         // Tokens used for memory context
  retrievalTimeMs   Int?         // How long memory retrieval took

  createdAt         DateTime     @default(now())

  @@index([conversationId])
  @@index([userId])
}
```

---

## Memory Types & Storage

### 1. **Short-Term Memory (STM)**
**What**: Current conversation context within active session
**Storage**: `Message` table + in-session state
**Retention**: Active conversation + last 20 messages
**Size**: ~20 messages or ~8,000 tokens

### 2. **Long-Term Memory (LTM)**
**What**: All historical conversations and extracted knowledge
**Storage**: `Conversation`, `Message`, `ConversationSummary`
**Retention**: Indefinite (user controlled)
**Size**: Unlimited (paginated retrieval)

### 3. **Semantic Memory**
**What**: Facts, preferences, goals, context about the user
**Storage**: `UserMemory` table
**Retention**: Indefinite
**Categories**:
- `fact`: "I'm a life coach for neurodivergent entrepreneurs"
- `preference`: "I prefer bold, direct communication"
- `goal`: "Launch SUPERNova by January 2026"
- `context`: "Currently building on Wix for beta, then migrating to custom stack"
- `struggle`: "Hate having to repeat myself across conversations"
- `strength`: "Great at pattern recognition and big-picture thinking"

### 4. **Episodic Memory**
**What**: Specific conversation events and interactions
**Storage**: `Conversation` + `ConversationSummary` + `Message`
**Retention**: Full messages for 90 days, summaries indefinitely

### 5. **Procedural Memory**
**What**: User patterns, triggers, and behavioral insights
**Storage**: `UserPattern` table
**Retention**: Indefinite
**Examples**:
- "Gets decision paralysis when too many options"
- "Works best with direct, no-BS feedback"
- "Tends to overthink branding decisions"

---

## Memory Extraction & Processing

### Automated Extraction Pipeline

#### STEP 1: Real-Time Extraction (During Conversation)
**When**: After every assistant response
**Process**:
1. Analyze user message + assistant response
2. Extract immediate facts, preferences, mentions
3. Store in `UserMemory` with high importance score
4. Link to current conversation

**Implementation**: Background API call after message storage

#### STEP 2: Conversation-End Summarization
**When**: When conversation goes inactive (>30 min no activity)
**Process**:
1. Retrieve all messages in conversation
2. Call Claude to generate:
   - Summary (2-3 sentences)
   - Key topics
   - Key concepts
   - Action items
   - Emotional tone
3. Store in `ConversationSummary`
4. Extract entities mentioned
5. Store in `ExtractedEntity`

**Implementation**: Background job triggered by inactivity detection

#### STEP 3: Pattern Recognition (Weekly)
**When**: Background job runs weekly
**Process**:
1. Analyze all user conversations from past 90 days
2. Identify recurring themes, triggers, patterns
3. Update `UserPattern` records
4. Increase confidence scores for repeated patterns

**Implementation**: Scheduled serverless function

### Memory Extraction Prompt Template

```typescript
const MEMORY_EXTRACTION_PROMPT = `
You are a memory extraction system for SUPERNova AI. Your job is to analyze conversation messages and extract structured memories.

CONVERSATION CONTEXT:
User Messages:
{userMessages}

Assistant Responses:
{assistantResponses}

EXTRACT THE FOLLOWING:

1. FACTS (things that are objectively true about the user):
   - Professional details (job, business, industry)
   - Personal details (family, location, life stage)
   - Technical details (tools they use, platforms, tech stack)

2. PREFERENCES (how they like things):
   - Communication style preferences
   - Work style preferences
   - Decision-making preferences

3. GOALS (what they want to achieve):
   - Short-term goals (next 1-3 months)
   - Long-term goals (6+ months)
   - Aspirations and dreams

4. CONTEXT (situational information):
   - Current projects
   - Current challenges
   - Current life circumstances

5. STRUGGLES (what's hard for them):
   - Recurring pain points
   - Blockers and obstacles
   - Frustrations

6. STRENGTHS (what they're good at):
   - Skills and talents
   - Natural abilities
   - Wins and successes

7. ENTITIES (people, places, projects, concepts mentioned):
   - Names of people, businesses, projects
   - Tools and platforms they use
   - Concepts and frameworks they reference

8. PATTERNS (behavioral patterns you notice):
   - Recurring triggers
   - Decision-making patterns
   - Emotional patterns

Return as JSON:
{
  "facts": [{ "content": "...", "confidence": 0.9, "pillarTags": ["BUSINESS"] }],
  "preferences": [...],
  "goals": [...],
  "context": [...],
  "struggles": [...],
  "strengths": [...],
  "entities": [{ "type": "project", "name": "SUPERNova AI", "description": "..." }],
  "patterns": [{ "type": "trigger", "description": "...", "confidence": 0.7 }]
}
`
```

---

## Memory Retrieval & Context Assembly

### Context Assembly Strategy

When user sends a new message, **intelligently assemble context** from:

1. **Recent Conversation** (if continuing existing conversation)
   - Last 10-20 messages from current conversation
   - Token budget: ~6,000 tokens

2. **User Profile Memories**
   - Top 10 most important `UserMemory` records matching current pillar
   - Token budget: ~2,000 tokens

3. **Related Conversation Summaries**
   - Find 2-3 most relevant past conversations via keyword/semantic matching
   - Include their summaries (not full messages)
   - Token budget: ~1,000 tokens

4. **Relevant Entities**
   - If user mentions a project/person/concept, pull that entity's context
   - Token budget: ~500 tokens

5. **Behavioral Patterns**
   - Top 3-5 most relevant patterns for current pillar
   - Token budget: ~500 tokens

6. **Album Content** (if relevant)
   - Curated program content based on user message
   - Token budget: ~2,000 tokens

**Total Context Budget**: ~12,000 tokens (leaving ~8,000 for response)

### Context Assembly Prompt Structure

```typescript
const systemPrompt = `
${getPersonalityContext(mode)} // Pillar-specific personality

## WHAT YOU KNOW ABOUT THIS USER

### CORE FACTS
${facts.map(f => `- ${f.content}`).join('\n')}

### PREFERENCES
${preferences.map(p => `- ${p.content}`).join('\n')}

### CURRENT GOALS
${goals.map(g => `- ${g.content}`).join('\n')}

### STRUGGLES & CHALLENGES
${struggles.map(s => `- ${s.content}`).join('\n')}

### STRENGTHS
${strengths.map(s => `- ${s.content}`).join('\n')}

### BEHAVIORAL PATTERNS
${patterns.map(p => `- ${p.description}`).join('\n')}

### ENTITIES & PROJECTS THEY'VE MENTIONED
${entities.map(e => `- ${e.name}: ${e.description}`).join('\n')}

### RECENT CONVERSATION CONTEXT
${relatedSummaries.map(s => `- ${s.summary}`).join('\n')}

${albumContent} // If relevant program content found

---

Use this knowledge to make your coaching PERSONAL, SPECIFIC, and INSIGHTFUL.
Reference their patterns, call back to previous conversations, and connect dots they can't see yet.
`
```

### Retrieval Algorithm

```typescript
async function assembleContext(userId: string, mode: string, currentMessage: string) {
  // 1. Get user memories filtered by pillar and importance
  const memories = await prisma.userMemory.findMany({
    where: {
      userId,
      OR: [
        { pillarTags: { has: mode } },
        { pillarTags: { isEmpty: true } }
      ]
    },
    orderBy: { importanceScore: 'desc' },
    take: 15
  })

  // Group by type
  const facts = memories.filter(m => m.memoryType === 'fact')
  const preferences = memories.filter(m => m.memoryType === 'preference')
  const goals = memories.filter(m => m.memoryType === 'goal')
  const struggles = memories.filter(m => m.memoryType === 'struggle')
  const strengths = memories.filter(m => m.memoryType === 'strength')

  // 2. Get behavioral patterns
  const patterns = await prisma.userPattern.findMany({
    where: {
      userId,
      OR: [
        { pillarTags: { has: mode } },
        { pillarTags: { isEmpty: true } }
      ]
    },
    orderBy: [
      { confidence: 'desc' },
      { observationCount: 'desc' }
    ],
    take: 5
  })

  // 3. Find related conversation summaries (semantic matching)
  const keywords = extractKeywords(currentMessage)
  const relatedSummaries = await prisma.conversationSummary.findMany({
    where: {
      userId,
      OR: keywords.map(kw => ({
        OR: [
          { keyTopics: { has: kw } },
          { keyConcepts: { has: kw } },
          { summary: { contains: kw, mode: 'insensitive' } }
        ]
      }))
    },
    orderBy: { updatedAt: 'desc' },
    take: 3
  })

  // 4. Get mentioned entities
  const entities = await prisma.extractedEntity.findMany({
    where: {
      userId,
      OR: keywords.map(kw => ({
        name: { contains: kw, mode: 'insensitive' }
      }))
    },
    orderBy: { importanceScore: 'desc' },
    take: 5
  })

  // 5. Curate Album content
  const albumContent = await curateContent(currentMessage, mode)

  return {
    facts,
    preferences,
    goals,
    struggles,
    strengths,
    patterns,
    relatedSummaries,
    entities,
    albumContent
  }
}
```

---

## Implementation Roadmap

### PHASE 1: Schema & Infrastructure (Week 1)
- [ ] Extend Prisma schema with new models
- [ ] Run migrations
- [ ] Create seed data for testing
- [ ] Set up database indexes

### PHASE 2: Memory Extraction Service (Week 2)
- [ ] Build memory extraction API endpoint
- [ ] Create background job for conversation summarization
- [ ] Implement entity extraction logic
- [ ] Build pattern recognition algorithm

### PHASE 3: Memory Retrieval & Context Assembly (Week 3)
- [ ] Update chat API to pull comprehensive context
- [ ] Implement smart context assembly algorithm
- [ ] Build relevance scoring for memories
- [ ] Optimize token budgeting

### PHASE 4: User Interface (Week 4)
- [ ] Build "My Memory" page (view all memories)
- [ ] Add memory editing/deletion
- [ ] Create conversation summary view
- [ ] Show entity graph visualization

### PHASE 5: Optimization & Testing (Week 5)
- [ ] Performance tuning for large memory sets
- [ ] Add caching for frequently accessed memories
- [ ] Test with real user data
- [ ] Fine-tune extraction prompts

---

## Cost & Performance Modeling

### Token Usage Estimates

#### Per Conversation (without memory system):
- System prompt: ~800 tokens
- Conversation history (10 messages): ~2,500 tokens
- Album content: ~2,000 tokens
- User message: ~100 tokens
- **Total input**: ~5,400 tokens
- Assistant response: ~500 tokens
- **Total per message**: ~5,900 tokens

#### Per Conversation (with full memory system):
- System prompt: ~800 tokens
- **Memory context**: ~4,000 tokens (facts, preferences, goals, patterns, entities)
- Conversation history (10 messages): ~2,500 tokens
- **Related summaries**: ~1,000 tokens
- Album content: ~2,000 tokens
- User message: ~100 tokens
- **Total input**: ~10,400 tokens
- Assistant response: ~500 tokens
- **Total per message**: ~10,900 tokens

### Claude API Costs (Sonnet 4.5)
- Input: $3 per 1M tokens
- Output: $15 per 1M tokens

#### Without Memory System:
- Input cost: 5,400 tokens × $3/1M = $0.0162 per message
- Output cost: 500 tokens × $15/1M = $0.0075 per message
- **Total**: $0.0237 per message

#### With Memory System:
- Input cost: 10,400 tokens × $3/1M = $0.0312 per message
- Output cost: 500 tokens × $15/1M = $0.0075 per message
- **Total**: $0.0387 per message

### Cost Impact per Tier

| Tier | Messages/Month | Cost Without Memory | Cost With Memory | Difference |
|------|----------------|---------------------|------------------|------------|
| BRAVE | 20 | $0.47 | $0.77 | +$0.30 |
| BOLD | 100 | $2.37 | $3.87 | +$1.50 |
| BADASS | 300 | $7.11 | $11.61 | +$4.50 |

### Revenue Impact

| Tier | Price | Cost With Memory | Gross Margin |
|------|-------|------------------|--------------|
| BRAVE (free trial) | $0 | -$0.77 | -100% (acquisition cost) |
| BOLD | £6 ($7.50) | $3.87 | 48% margin |
| BADASS | £26 ($32.50) | $11.61 | 64% margin |

### Optimization Strategies

1. **Haiku for Memory Extraction**
   - Use cheaper model (Haiku: $0.25 per 1M input tokens) for background extraction
   - Saves ~90% on extraction costs

2. **Smart Context Pruning**
   - Only include highly relevant memories (relevance score > 0.7)
   - Reduces average memory context from 4,000 to 2,500 tokens

3. **Summary-First Approach**
   - Store conversation summaries instead of full message history
   - Reduces retrieval tokens by 60%

4. **Caching** (Claude supports prompt caching)
   - Cache user profile memories (facts, preferences, patterns)
   - Reduces cost by 90% for cached portions
   - Cache TTL: 5 minutes

**With optimizations**, cost per message: **$0.0250** (only +$0.0013 vs. no memory)

---

## Success Metrics

### User Experience Metrics
- Reduction in repeated questions by SUPERNova
- Increase in "she gets me" sentiment
- Conversation depth (topics covered, insights provided)

### Technical Metrics
- Memory retrieval time < 100ms
- Context assembly time < 200ms
- Extraction accuracy > 85%
- Pattern recognition confidence > 0.7

### Business Metrics
- User retention increase (goal: +30%)
- Upgrade rate to paid tiers (goal: 20% BRAVE → BOLD)
- User satisfaction score (goal: 9/10)

---

## GDPR & Privacy Compliance

### User Rights
1. **Right to Access**: View all stored memories
2. **Right to Edit**: Correct inaccurate memories
3. **Right to Delete**: Delete specific memories or all data
4. **Right to Export**: Download all data as JSON

### Implementation
- Memory management UI page
- Export API endpoint
- Hard delete (not soft delete) for GDPR compliance
- Cascade deletes when user account deleted

---

## Next Steps

1. **Review & Approve** this design with user
2. **Prioritize** features (Phase 1-2 = MVP, Phase 3-5 = enhancements)
3. **Implement** schema changes and core extraction service
4. **Test** with real conversations
5. **Iterate** based on extraction accuracy and user feedback

---

**This memory system ensures SUPERNova truly remembers EVERYTHING, making every conversation feel like a continuation of a deep, ongoing relationship.**
