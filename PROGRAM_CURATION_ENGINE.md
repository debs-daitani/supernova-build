# SUPERNova AI - Program Curation Engine
## Netflix-Style Adaptive Learning System

> **Built**: Database schema ✅
> **Status**: Ready for document upload and RAG implementation

---

## What's Live NOW:

### ✅ Database Schema Complete
- `KnowledgeProgram` - Uploaded programs and content sources
- `ContentChunk` - Chunked content with embeddings
- `CuratedProgram` - Personalized programs created for users
- `ProgramSession` - Individual sessions within curated programs

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    KNOWLEDGE BASE UPLOAD                     │
│  Upload PDFs, DOCXs, Markdown → Parse → Chunk → Embed      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    CONTENT STORAGE                           │
│  PostgreSQL: Programs, Chunks, Embeddings (JSON)           │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    USER MAKES REQUEST                        │
│  "I want to learn about pricing strategy"                  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    SEMANTIC SEARCH                           │
│  Embed request → Find relevant chunks → Rank by similarity  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    CURATION ENGINE                           │
│  Assemble program outline → Create sessions → Package      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    DELIVER VIA CHAT                          │
│  SUPERNova guides user through personalized program        │
└─────────────────────────────────────────────────────────────┘
```

---

## Implementation Steps

### PHASE 1: Document Processing (NEXT) 🚧

**Files to Create:**
1. `supernova/lib/document-processor.ts` - Parse PDFs, DOCX, MD files
2. `supernova/lib/text-chunker.ts` - Smart text chunking (semantic boundaries)
3. `supernova/lib/embedding-service.ts` - OpenAI embedding generation
4. `supernova/app/api/knowledge/upload/route.ts` - Upload endpoint

**Features:**
- Parse PDF (pdf-parse)
- Parse DOCX (mammoth)
- Parse Markdown
- Chunk text intelligently (respect paragraphs, headings, semantic boundaries)
- Generate embeddings with OpenAI `text-embedding-3-small`
- Store chunks with metadata (type, topics, pillar)

**Smart Chunking Strategy:**
- Target chunk size: 500-1000 tokens
- Respect semantic boundaries (paragraphs, sections)
- Include surrounding context (preceding/following text)
- Detect chunk types (framework, exercise, example, concept)

### PHASE 2: Semantic Search & RAG

**Files to Create:**
1. `supernova/lib/semantic-search.ts` - Vector similarity search
2. `supernova/lib/knowledge-retrieval.ts` - RAG retrieval logic

**Features:**
- Embed user queries
- Cosine similarity search across all chunks
- Rank results by relevance
- Filter by pillar, topics, chunk type
- Return top N most relevant chunks

**Cosine Similarity (without pgvector):**
```typescript
function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0)
  const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0))
  const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0))
  return dotProduct / (magA * magB)
}
```

### PHASE 3: Curation Engine

**Files to Create:**
1. `supernova/lib/program-curator.ts` - Program assembly logic
2. `supernova/app/api/programs/curate/route.ts` - Curation endpoint

**Features:**
- Analyze user request (what do they want to learn?)
- Search knowledge base for relevant content
- Assemble coherent program outline
- Break into sessions (1-10 sessions)
- Generate session titles and descriptions
- Create CuratedProgram and ProgramSession records

**Curation Prompt Template:**
```typescript
const CURATION_PROMPT = `
You are a program curator for SUPERNova AI. Create a personalized learning program based on the user's request and available content.

USER REQUEST:
"${userRequest}"

AVAILABLE CONTENT CHUNKS (${chunks.length} chunks found):
${chunks.map((c, i) => `
Chunk ${i + 1}:
Type: ${c.chunkType}
Topics: ${c.topics.join(', ')}
Content: ${c.content.substring(0, 300)}...
`).join('\n')}

Create a program outline with:
1. Program title
2. Description (2-3 sentences)
3. Sessions (1-10 sessions)
   - Each session has: title, description, chunk IDs to include

Return as JSON:
{
  "title": "Pricing Strategy Masterclass",
  "description": "...",
  "estimatedDuration": "3 sessions",
  "sessions": [
    {
      "sessionNumber": 1,
      "title": "Pricing Fundamentals",
      "content": "...",
      "chunkIds": ["chunk1", "chunk2"]
    }
  ]
}
`
```

### PHASE 4: Chat Integration

**Updates to `chat/route.ts`:**
- Detect when user requests learning ("I want to learn about...")
- Trigger curation engine
- Store CuratedProgram
- Deliver first session in chat
- Track progress through program

**Detection Keywords:**
- "I want to learn about..."
- "Teach me..."
- "How do I..."
- "Show me how to..."
- "I need help with..."

### PHASE 5: Admin UI

**Pages to Create:**
1. `supernova/app/admin/knowledge/page.tsx` - Knowledge base dashboard
2. `supernova/app/admin/knowledge/upload/page.tsx` - Upload interface
3. `supernova/app/admin/knowledge/programs/page.tsx` - View programs

**Features:**
- Upload documents (drag & drop)
- Tag programs (pillar, topics, level)
- View all chunks
- See usage analytics (which chunks get used most)
- Edit/delete programs

---

## Example Usage Flow

### 1. Admin uploads content:
```bash
POST /api/knowledge/upload
{
  "file": <PDF file>,
  "title": "Badass Branding Blueprint",
  "pillar": "BUSINESS",
  "topics": ["branding", "positioning", "messaging"],
  "level": "intermediate"
}
```

Response:
```json
{
  "programId": "clz123",
  "chunksCreated": 47,
  "status": "success"
}
```

### 2. User requests learning:
**Chat:**
> User: "I want to learn about pricing strategy for my coaching business"

### 3. SUPERNova triggers curation:
```typescript
const curated = await curateProgram({
  userId: 'user123',
  request: "pricing strategy for coaching business",
  pillar: "BUSINESS"
})
```

### 4. Curation engine:
- Embeds request
- Searches knowledge base
- Finds 15 relevant chunks about pricing
- Assembles 3-session program:
  - Session 1: Pricing Fundamentals
  - Session 2: Value-Based Pricing
  - Session 3: Packaging Your Offers

### 5. SUPERNova delivers:
> SUPERNova: "I've created a personalized 3-session program on pricing strategy for you. Want to dive into Session 1: Pricing Fundamentals?"

### 6. User progresses:
- Completes Session 1
- SUPERNova delivers Session 2
- Tracks progress in database

---

## Cost Modeling

### Embedding Costs (OpenAI text-embedding-3-small)
- $0.02 per 1M tokens
- Average chunk: 500 tokens
- 1000 chunks = 500K tokens = **$0.01**

### Storage
- 1000 chunks × 1536 floats × 4 bytes = 6MB
- PostgreSQL JSON: ~10MB for 1000 chunks
- **Negligible cost**

### Search/Retrieval
- Embed user query: ~50 tokens = **$0.000001**
- Compare against 1000 chunks: **<1ms** (in-memory cosine similarity)

### Curation
- Use Haiku for program assembly: ~2000 tokens = **$0.0005**

**Total per program creation: ~$0.001** 🔥

---

## Next Steps

1. **Build document processor** (PDF, DOCX, MD parsing)
2. **Build chunking service** (smart semantic chunking)
3. **Build embedding service** (OpenAI integration)
4. **Build semantic search** (cosine similarity)
5. **Build curation engine** (program assembly)
6. **Integrate into chat** (detect requests, trigger curation)
7. **Build admin UI** (upload, manage content)

---

## pgvector Installation (Future)

When pgvector is available:
1. Install extension: `CREATE EXTENSION vector;`
2. Update Prisma schema to use `vector(1536)` type
3. Create vector index: `CREATE INDEX ON "ContentChunk" USING ivfflat (embedding vector_cosine_ops);`
4. Migrate from JSON embeddings to native vector type
5. Enjoy 10-100x faster similarity search

For now, JSON embeddings + cosine similarity work fine for <10K chunks.

---

## READY TO BUILD! 🚀

Database schema is live. Next: Build the document processor and start uploading knowledge!
