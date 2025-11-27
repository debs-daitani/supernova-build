# SUPERNova AI - Game-Changing Features Roadmap

## 🎯 PRIORITY 1: BUILD NOW

### 1. ✅ Voice Memos + Auto-Transcription
**Status**: BUILDING NOW
**Impact**: Removes biggest barrier to authentic communication
**Tech**: OpenAI Whisper API
**Use Case**: ADHD brains think better OUT LOUD
- Record voice memo in chat
- Auto-transcribe
- SUPERNova responds to content
- Extracts memories automatically
- "I heard you say you're launching in January. That's a FACT now."

### 2. ✅ Dopamine Menu / ADHD Rescue System
**Status**: BUILDING NOW
**Impact**: Instant rescue from executive dysfunction
**Use Case**: User hits wall, can't think about business
- Detects overwhelm/stuck patterns
- Offers instant micro-wins
- "Text one person. Just one. Screenshot it back to me."
- Pattern interrupt: "What song is playing in your head?"
- Body reset: "Cold shower. 30 seconds. Come back."

### 3. ✅ Pattern Interrupt System
**Status**: BUILDING NOW
**Impact**: Breaks spirals that cost time/money
**Use Case**: User mentions same struggle 3+ times
- Detects loops (pricing paralysis, imposter syndrome)
- Interrupts: "STOP. We've talked about pricing 4 times. What's the REAL fear?"
- Forces different angle
- Escalates if needed

### 4. ✅ Accountability Partner Mode
**Status**: BUILDING NOW
**Impact**: Replaces expensive human coaches
**Use Case**: Need external accountability but coaches cost $$
- User sets commitments
- SUPERNova checks in proactively
- Celebrates wins, calls out excuses
- Adjusts unrealistic expectations

### 5. ✅ Decision Paralysis Killer
**Status**: BUILDING NOW
**Impact**: ADHD brains NEED this
**Use Case**: Too many options = shutdown
- Detects decision paralysis
- Strips to 2 options ONLY
- Time pressure: "60 seconds. Pick ONE."
- Locks it in, moves on

---

## 🔥 PRIORITY 2: BUILD NEXT

### 6. Future Self Voice Letters
**Impact**: Keeps vision alive when shit gets hard
**Use Case**: User losing sight of their "why"
- Create letters FROM future successful self
- Deliver at perfect moments (stuck, about to quit, pattern match)
- "Hey, it's you from January 2026. You DID launch. Trust yourself."

### 7. Anti-Branding Brand Generator
**Impact**: Authentic voice = better conversions
**Use Case**: Everyone sounds the same, templates kill authenticity
- Analyzes how USER talks in conversations
- Extracts unique phrases, energy, rhythm
- Generates content IN THEIR VOICE
- LinkedIn posts, emails, sales copy that sounds like THEM

### 8. Energy Tracking + Adaptive Scheduling
**Impact**: Work WITH your brain, not against it
**Use Case**: ADHD brains have variable energy
- Track energy patterns
- "You're always high-energy Tuesday mornings. That's your power window."
- Task matching: High energy → strategy work. Low energy → simple tasks.
- Realistic scheduling based on actual patterns

### 9. Wins Tracker + Pattern Amplification
**Impact**: Shifts focus from failures to wins
**Use Case**: ADHD brains ignore wins
- Daily: "Tell me ONE win from today."
- Tracks wins by type
- Spots patterns: "Every time you post about pricing, you get inquiries. DO MORE."
- Amplification playbook

### 10. "Fuck It" Button
**Impact**: Permission to STOP trying
**Use Case**: Hit wall, can't push anymore
- Activates "Fuck It" mode
- "Cool. Business is off the table for 24 hours. What do you WANT to do?"
- No judgment, no guilt
- Tracks recovery time

---

## 📋 FULL LIST FOR FUTURE

1. ✅ Voice Memos + Auto-Transcription (BUILDING NOW)
2. ✅ Dopamine Menu / ADHD Rescue (BUILDING NOW)
3. ✅ Pattern Interrupt System (BUILDING NOW)
4. ✅ Accountability Partner Mode (BUILDING NOW)
5. ✅ Decision Paralysis Killer (BUILDING NOW)
6. Future Self Voice Letters
7. Anti-Branding Brand Generator
8. Energy Tracking + Adaptive Scheduling
9. Wins Tracker + Pattern Amplification
10. "Fuck It" Button

---

## 🛠️ TECHNICAL IMPLEMENTATION: PRIORITY 1 FEATURES

### Database Schema Extensions Needed:

```prisma
// DOPAMINE MENU
model DopamineMenuItem {
  id              String   @id @default(cuid())
  userId          String?  // null = global, set = personalized

  title           String   // "Text one person"
  description     String   // "Just one. Screenshot it back."
  pillar          String   // BODY, BRAIN, BUSINESS, GENERAL
  difficultyLevel Int      // 1-10 (1 = easiest)

  // Effectiveness tracking
  timesOffered    Int      @default(0)
  timesCompleted  Int      @default(0)
  avgCompletionTime Int?   // Minutes

  createdAt       DateTime @default(now())
}

// COMMITMENTS & ACCOUNTABILITY
model Commitment {
  id              String   @id @default(cuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id])

  description     String   // "Post on LinkedIn 3x this week"
  frequency       String   // 'daily', 'weekly', 'one-time'
  deadline        DateTime?
  pillar          String

  // Tracking
  status          String   @default("active") // active, completed, abandoned
  checkIns        CheckIn[]
  completionCount Int      @default(0)
  missedCount     Int      @default(0)

  createdAt       DateTime @default(now())
  completedAt     DateTime?
}

model CheckIn {
  id              String      @id @default(cuid())
  commitmentId    String
  commitment      Commitment  @relation(fields: [commitmentId], references: [id])

  completed       Boolean
  userResponse    String?     @db.Text
  snResponse      String?     @db.Text

  checkedAt       DateTime    @default(now())
}

// VOICE MEMOS
model VoiceMemo {
  id              String   @id @default(cuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id])
  conversationId  String?

  // Audio file
  audioUrl        String   // S3 or local storage path
  duration        Int      // Seconds

  // Transcription
  transcription   String   @db.Text

  // Extracted from transcription
  extractedMemories String[] // IDs of memories created
  summary         String?  @db.Text

  createdAt       DateTime @default(now())
}

// LOOP DETECTION (Pattern Interrupts)
model LoopDetection {
  id              String   @id @default(cuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id])

  loopType        String   // 'pricing_paralysis', 'imposter_syndrome', etc.
  description     String   @db.Text

  // Tracking
  occurrences     String[] // Conversation IDs where this loop appeared
  lastInterrupted DateTime?
  interruptCount  Int      @default(0)

  // Effectiveness
  wasResolved     Boolean  @default(false)
  resolvedAt      DateTime?

  firstDetected   DateTime @default(now())
  lastDetected    DateTime @updatedAt
}

// DECISION TRACKING
model Decision {
  id              String   @id @default(cuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id])
  conversationId  String?

  question        String   @db.Text // "What's your pricing?"
  options         String[] // ["$297", "$497"]
  chosenOption    String?

  // Paralysis detection
  timesAsked      Int      @default(1)
  timeToDecide    Int?     // Seconds

  // Commitment
  lockedIn        Boolean  @default(false)
  lockedAt        DateTime?

  createdAt       DateTime @default(now())
}
```

### API Endpoints Needed:

1. `POST /api/voice/upload` - Upload voice memo
2. `POST /api/voice/transcribe` - Transcribe with Whisper
3. `GET /api/dopamine/menu` - Get personalized dopamine menu
4. `POST /api/dopamine/complete` - Mark dopamine task complete
5. `POST /api/commitments/create` - Create commitment
6. `GET /api/commitments/check` - Check commitment status
7. `POST /api/patterns/interrupt` - Trigger pattern interrupt
8. `POST /api/decisions/force` - Force decision (binary choice)

---

## 🚀 BUILD ORDER

### Week 1: Voice Memos
- Upload endpoint + storage
- Whisper integration
- Memory extraction from transcription
- Chat UI for voice recording

### Week 2: Dopamine Menu
- Schema + seed data
- Detection logic (overwhelm patterns)
- Menu generation
- Completion tracking

### Week 3: Pattern Interrupts
- Loop detection algorithm
- Interrupt triggers
- Escalation logic

### Week 4: Accountability Partner
- Commitment tracking
- Proactive check-ins
- Win celebrations + excuse calling

### Week 5: Decision Paralysis Killer
- Paralysis detection
- Binary choice forcing
- Time pressure mechanics
- Lock-in system

---

## 💰 COST MODELING

### Voice Memos (Whisper API)
- $0.006 per minute
- Average memo: 2 minutes = **$0.012**
- 100 memos/month = **$1.20/user/month**

### Everything Else
- Database storage: negligible
- Background jobs: negligible
- Claude calls for detection: covered by existing usage

**Total added cost: ~$1.50/user/month for voice memos**
**Still profitable at all tiers!**

---

## ✅ READY TO BUILD!

Starting with Voice Memos + Dopamine Menu + Pattern Interrupts NOW!
