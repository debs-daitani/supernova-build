# SUPERNova AI - Complete Testing Guide

## 🎯 Quick Start

**App Running**: http://localhost:3001/dashboard

**Test User**:
- Email: `test@daitani.com`
- Password: `supernova123`

---

## ✅ ALL 5 ADHD FEATURES - TESTING SCENARIOS

### 1. 🎤 Voice Memos + Auto-Transcription

**Setup Required:**
1. Add OpenAI API key to `.env`:
   ```
   OPENAI_API_KEY="sk-..."
   ```
2. Get key from: https://platform.openai.com/api-keys
3. Restart dev server

**Test Scenario:**
1. Go to dashboard
2. Click **"Record Voice Memo"** button
3. Allow microphone access
4. Say:
   > "Hey, I wanted to let you know I'm launching my coaching program in January. I'm thinking about charging $997 for a 12-week program. I'm a bit nervous about the pricing but I think it's fair for the value I'm providing."
5. Click **Stop**
6. Listen to playback to verify
7. Click **"Send & Transcribe"**
8. Wait ~5-10 seconds for transcription
9. **Expected Results**:
   - Transcription appears as user message
   - SUPERNova responds to the content
   - Memories extracted: "launching in January", "charging $997", "12-week program"
   - VoiceMemo saved to database

**Verify in Database:**
```sql
SELECT * FROM "VoiceMemo" ORDER BY "createdAt" DESC LIMIT 1;
SELECT * FROM "UserMemory" WHERE "memoryType" = 'FACT' ORDER BY "createdAt" DESC LIMIT 5;
```

---

### 2. 🎯 Dopamine Menu / ADHD Rescue

**Test Scenario:**
1. Type message:
   > "I'm so stuck right now, I can't think, my brain is completely shutting down and I don't know what to do"

2. Send message

3. **Expected Results**:
   - SUPERNova detects overwhelm keywords
   - Offers dopamine menu with 5 items
   - Items sorted by difficulty (easiest first)
   - Empathetic but direct tone
   - No lecturing, just options

**Example Response:**
```
Hey, I hear you. You're in shutdown mode.

Here's your dopamine rescue menu - pick ONE:

1. Text ONE person (just screenshot it back to me)
2. 2-Minute Timer Challenge (do ANYTHING for 2 minutes)
3. Screenshot your desktop chaos (just take it, send it)
4. Cold water on face for 30 seconds
5. Post something unpolished on social

Don't think. Just pick one and do it. I'll wait.
```

**Verify in Database:**
```sql
SELECT * FROM "DopamineMenuItem" ORDER BY "timesOffered" DESC;
```

---

### 3. 🔁 Pattern Interrupt System

**Test Scenario - Pricing Paralysis:**

**Message 1:**
> "I'm thinking about my pricing strategy for my new coaching offer"

**Message 2:**
> "Still not sure what to charge. What do you think is a good price point?"

**Message 3:**
> "I keep going back and forth on pricing. Should it be $297 or $497?"

**Expected Results (on 3rd mention):**
```
STOP. We've talked about pricing 3 times now.

Here's the truth: You're not stuck on pricing. You're stuck on WORTH.

What's the REAL fear? Say it out loud.
- "I'm not good enough to charge that"
- "What if no one pays?"
- "I don't have proof I'm worth it"

Which one is it? Because we're not doing another pricing dance until you tell me what you're ACTUALLY afraid of.
```

**Other Patterns to Test:**

**Imposter Syndrome** (3 mentions):
- "I don't feel qualified to coach people"
- "Who am I to teach this stuff?"
- "I feel like a fraud sometimes"

**Launch Paralysis** (4 mentions):
- "I'm getting ready to launch"
- "I'm planning to launch soon"
- "I'm going to launch next month"
- "I'm almost ready to launch"

**Perfectionism** (3 mentions):
- "It's not ready yet"
- "I need to fix a few more things"
- "Just one more tweak and it'll be perfect"

**Verify in Database:**
```sql
SELECT * FROM "LoopDetection" ORDER BY "lastDetected" DESC;
```

---

### 4. ⚡ Decision Paralysis Killer

**Test Scenario - Binary Choice:**

**Message 1:**
> "Should I charge $297 or $497 for my coaching program?"

**Expected Response (First Ask):**
```
Quick gut check: Which one makes your chest feel LIGHTER? Not which one sounds "smarter" or more "strategic." Which one feels like RELIEF?

That's your answer. Trust it.
```

**Message 2 (Ask Again):**
> "I'm still not sure. Should I go with $297 or $497?"

**Expected Response (Second Ask):**
```
DECISION PARALYSIS ALERT

We've talked about this decision 2 times now. You're stuck in analysis mode.

Here's the truth: BOTH OPTIONS WILL WORK. The cost of NOT deciding is higher than picking the "wrong" one.

30-SECOND DECISION:

Option A: $297
Option B: $497

Close your eyes. Count to 3. Say the first one that comes out of your mouth.

I'm waiting. A or B?
```

**Message 3 (Ask AGAIN):**
> "Okay but really, $297 or $497?"

**Expected Response (Coin Flip!):**
```
DECISION OVERRIDE ACTIVATED

This is the 3rd time you've asked about this. I'm not letting you spiral anymore.

I'm flipping a coin for you.

*flips coin*

The answer is: B

- A: $297
- B: $497

Go with it. If your gut SCREAMS "no," then you know it's the other one. But you're not allowed to think anymore. You're DOING.

Commit to it RIGHT NOW in your next message. Which one is it?
```

**Test Scenario - Too Many Options:**

**Message:**
> "Should I launch in January, February, March, or wait until April?"

**Expected Response:**
```
DECISION PARALYSIS DETECTED

You've presented 4 options. That's TOO MANY. ADHD brains shut down with choice overload.

Here's what we're doing:

60-SECOND TIMER STARTS NOW.

Which TWO options are you ACTUALLY considering? Not what sounds good. Not what you "should" do. Which two are pulling at you?

Pick TWO. I'll help you choose between them. GO.
```

**Verify in Database:**
```sql
SELECT * FROM "Decision" ORDER BY "createdAt" DESC;
```

---

### 5. 🤝 Accountability Partner

**Test Scenario - Making Commitment:**

**Message:**
> "I'm going to post on LinkedIn tomorrow about my new coaching offer"

**Expected Response:**
```
COMMITMENT LOCKED IN

Got it. You're committing to: post on LinkedIn about coaching offer by end of today.

I'm holding you to this. I'll check in with you later.

One question: What's the FIRST tiny step you can take right now (like, in the next 5 minutes) toward this?

Don't overthink it. Just the first micro-action.
```

**Verify in Database:**
```sql
SELECT * FROM "Commitment" WHERE "status" = 'active' ORDER BY "createdAt" DESC;
```

**Test Scenario - Check-In (Simulated):**

Since check-ins happen after 24h, you can manually test by:

1. Create a commitment (see above)
2. Manually update the `createdAt` timestamp to 25 hours ago:
   ```sql
   UPDATE "Commitment"
   SET "createdAt" = NOW() - INTERVAL '25 hours'
   WHERE "id" = 'your_commitment_id';
   ```
3. Send any message to SUPERNova
4. **Expected Response:**
   ```
   ACCOUNTABILITY CHECK-IN TIME

   You have 1 active commitment that needs checking in on:

   1. "post on LinkedIn about coaching offer" (DEADLINE PASSED)
      - Completion rate: 0%

   Did you do it? Yes or no.
   ```

**Test Scenario - Multiple Commitments:**

1. Create 3 commitments:
   - "Post on LinkedIn by tomorrow"
   - "Email my list by Friday"
   - "Schedule 3 sales calls this week"

2. Wait 24h or manually update timestamps

3. SUPERNova checks in on ALL of them

**Verify in Database:**
```sql
SELECT
  c.*,
  COUNT(ci.id) as check_in_count
FROM "Commitment" c
LEFT JOIN "CheckIn" ci ON c.id = ci."commitmentId"
GROUP BY c.id
ORDER BY c."createdAt" DESC;
```

---

## 🧪 COMBINED TESTING

**Test All Features in One Conversation:**

1. **Voice Memo**: Record "I'm stuck on pricing and I'm launching in January"
2. **Dopamine Menu**: Type "I'm overwhelmed and can't think"
3. **Pattern Interrupt**: Mention "pricing" 3 times
4. **Decision Killer**: Ask "Should I charge $297 or $497?"
5. **Accountability**: Say "I'm going to post on LinkedIn tomorrow"

**Expected Flow:**
1. Voice memo transcribed → SUPERNova responds
2. Overwhelm detected → Dopamine menu offered
3. Pricing mentioned 3x → Pattern interrupt triggered
4. Decision asked → Binary choice forced
5. Commitment made → Locked in with check-in scheduled

---

## 📊 DATABASE VERIFICATION

**Check All Features:**

```sql
-- Voice Memos
SELECT COUNT(*) as voice_memo_count FROM "VoiceMemo";

-- Dopamine Menu (should have 23 items)
SELECT COUNT(*) as dopamine_items FROM "DopamineMenuItem";

-- Pattern Interrupts
SELECT "loopType", COUNT(*) as occurrences
FROM "LoopDetection"
GROUP BY "loopType";

-- Decisions
SELECT
  "question",
  "timesAsked",
  "lockedIn"
FROM "Decision"
ORDER BY "createdAt" DESC;

-- Commitments
SELECT
  "description",
  "status",
  "completionCount",
  "missedCount"
FROM "Commitment"
ORDER BY "createdAt" DESC;

-- Memories Extracted
SELECT "memoryType", COUNT(*) as count
FROM "UserMemory"
GROUP BY "memoryType";
```

---

## 🐛 TROUBLESHOOTING

### Voice Memos Not Working

**Error: "Failed to access microphone"**
- Check browser permissions
- Use HTTPS or localhost only (mic requires secure context)
- Try Chrome/Edge (best browser recording support)

**Error: "Failed to transcribe audio"**
- Check `OPENAI_API_KEY` in `.env`
- Verify key is valid: https://platform.openai.com/api-keys
- Check file size < 25MB
- Restart dev server after adding key

**Error: "Upload failed"**
- Check `/public/uploads/voice-memos/` directory exists
- Check file permissions
- Check disk space

### Dopamine Menu Not Appearing

- Run seed script: `npx tsx prisma/seed-dopamine-menu.ts`
- Check database: `SELECT COUNT(*) FROM "DopamineMenuItem";`
- Must have 23 items
- Use overwhelm keywords: "stuck", "can't think", "overwhelmed"

### Pattern Interrupts Not Triggering

- Must mention pattern keywords 3+ times (varies by pattern)
- Each mention must be in a DIFFERENT message
- Check database: `SELECT * FROM "LoopDetection";`
- Patterns tracked per user

### Decisions Not Being Forced

- Must use decision language: "should I", "or", "which"
- Binary format: "A or B"
- Check extraction: look for "Option A" / "Option B" in response
- Ask same question 3 times for coin flip

### Commitments Not Being Tracked

- Must use commitment language: "I'll", "I'm going to", "by tomorrow"
- Check database: `SELECT * FROM "Commitment";`
- Timeframe detection: "tomorrow", "next week", "by Friday"

---

## ✅ SUCCESS CRITERIA

**All 5 features are working if:**

1. ✅ Voice memo records, uploads, transcribes, and extracts memories
2. ✅ Dopamine menu appears when user says "I'm stuck"
3. ✅ Pattern interrupt triggers after 3 mentions of "pricing"
4. ✅ Decision killer forces choice after user asks 2-3 times
5. ✅ Commitment confirmed when user says "I'm going to..."

**Check database for:**
- VoiceMemo records
- DopamineMenuItem (23 items)
- LoopDetection records
- Decision records
- Commitment records
- UserMemory records (extracted from voice memos)

---

## 🚀 READY FOR TESTING!

Everything is built and integrated. Just add your `OPENAI_API_KEY` to `.env` and start testing!

**Happy testing! 🎉**
