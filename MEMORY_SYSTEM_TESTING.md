# SUPERNova Memory System - Testing Guide

## Phase 1 & 2 COMPLETE! ✅

### What's Live NOW:

1. **Database Schema Extended** ✅
   - 5 new tables: ConversationSummary, ExtractedEntity, UserPattern, ConversationLink, MemorySession
   - Enhanced MemoryType enum with STRUGGLE and STRENGTH

2. **Memory Extraction Service** ✅
   - Automatic extraction every 5 messages
   - Uses Claude Haiku (cheap & fast) for extraction
   - Extracts: facts, preferences, goals, context, struggles, strengths, entities, patterns

3. **Conversation Summarization** ✅
   - Auto-generates summaries with key topics, concepts, action items
   - Tracks emotional tone

4. **Background Processing** ✅
   - Runs extraction in background (doesn't slow down chat)
   - Stores all extracted data automatically

---

## How to Test TONIGHT:

### Step 1: Start a Fresh Conversation
1. Go to [http://localhost:3001/dashboard](http://localhost:3001/dashboard)
2. Login with your test user
3. Start a new conversation (pick BUSINESS mode)

### Step 2: Have a REAL Conversation
Talk to SUPERNova about your business like you normally would. Share:
- **Facts**: "I'm building SUPERNova AI for neurodivergent entrepreneurs"
- **Struggles**: "I hate having to repeat myself across conversations"
- **Goals**: "Launch beta by January 2026"
- **Preferences**: "I prefer bold, direct communication"
- **Projects**: Mention specific projects, tools, people
- **Patterns**: Share recurring challenges or triggers

### Step 3: Send 5+ Messages
After every 5 messages, the system will automatically:
1. Extract memories in the background
2. Store them in the database
3. Generate a conversation summary

You won't see any UI feedback yet - it's all happening in the background.

### Step 4: Check the Database

After 5 messages, check what was extracted:

```sql
-- Check extracted memories
SELECT memoryType, content, importanceScore, pillarTags
FROM "UserMemory"
WHERE userId = 'YOUR_USER_ID'
ORDER BY createdAt DESC
LIMIT 20;

-- Check extracted entities
SELECT entityType, name, description, mentionCount
FROM "ExtractedEntity"
WHERE userId = 'YOUR_USER_ID'
ORDER BY createdAt DESC;

-- Check detected patterns
SELECT patternType, description, confidence, observationCount
FROM "UserPattern"
WHERE userId = 'YOUR_USER_ID'
ORDER BY createdAt DESC;

-- Check conversation summary
SELECT summary, keyTopics, keyConcepts, actionItems, emotionalTone
FROM "ConversationSummary"
WHERE userId = 'YOUR_USER_ID'
ORDER BY createdAt DESC
LIMIT 1;
```

### Step 5: Manual Extraction (Optional)

If you want to manually trigger extraction for testing:

```bash
curl -X POST http://localhost:3001/api/memory/extract \
  -H "Content-Type: application/json" \
  -d '{
    "conversationId": "YOUR_CONVERSATION_ID",
    "userId": "YOUR_USER_ID",
    "pillar": "BUSINESS"
  }'
```

This will return counts of what was extracted:
```json
{
  "message": "Memories extracted and stored successfully",
  "extracted": {
    "factCount": 3,
    "preferenceCount": 2,
    "goalCount": 1,
    "contextCount": 2,
    "struggleCount": 1,
    "strengthCount": 1,
    "entityCount": 2,
    "patternCount": 1
  }
}
```

---

## What to Look For:

### ✅ GOOD SIGNS:
- Memories accurately capture what you shared
- Entities correctly identify projects, tools, people mentioned
- Patterns detect recurring themes
- Summary captures conversation essence
- Importance scores are reasonable (higher for more important info)
- Pillar tags are correct (BODY, BRAIN, BUSINESS)

### ⚠️ ISSUES TO WATCH FOR:
- Missing information (didn't extract something important)
- Wrong pillar tags
- Low confidence/importance scores for critical info
- Duplicate memories
- Incorrect entity types
- Patterns that don't make sense

---

## Server Logs to Monitor:

Watch the console for these logs:
```
Stored memories for conversation clz123...
Generated summary for conversation clz123...
```

If you see errors:
```
Background memory extraction failed: [error details]
```

---

## Next Steps After Testing:

Once we confirm extraction is working well:

### Phase 3: Memory Retrieval & Context Assembly
- Pull memories into conversation context
- Smart relevance filtering
- Token budget management

### Phase 4: UI for Memory Management
- View all your memories
- Edit/delete memories
- See entity graph
- View conversation summaries

### Phase 5: Optimization
- Fine-tune extraction prompts
- Improve relevance scoring
- Add semantic search
- Caching strategies

---

## Quick Database Access:

If you need your user ID or conversation ID:

```sql
-- Get your user ID
SELECT id, email FROM "User" WHERE email = 'your@email.com';

-- Get conversation IDs
SELECT id, title, mode, messageCount
FROM "Conversation" c
LEFT JOIN LATERAL (
  SELECT COUNT(*) as messageCount
  FROM "Message"
  WHERE conversationId = c.id
) m ON true
WHERE userId = 'YOUR_USER_ID'
ORDER BY lastMessageAt DESC;
```

---

## READY TO TEST! 🚀

The memory system is LIVE and running in the background. Have a real conversation with SUPERNova and let's see what she remembers!
