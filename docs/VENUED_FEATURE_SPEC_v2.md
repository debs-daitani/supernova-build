# 🎸 VENUED v2.0 - ADHD POWER TOOL SPECIFICATION

**"Not a journal. Not a workbook. YOUR ADHD POWER TOOL."**

---

## 📋 OVERVIEW

VENUED is an ADHD-friendly project planner with rock concert theming. This specification outlines the consolidated feature set, new additions, and animation/UX requirements to make the app feel ALIVE.

**Target:** Beta testers getting something JUICY to play with!

---

## 🎨 DESIGN PHILOSOPHY

### Brand Essence:
- Rock concert energy meets ADHD brain support
- Bold, direct, no-bullshit
- Celebratory, not clinical
- Movement, feedback, dopamine hits

### Colour Palette:
- **Hot Pink:** #FF1B8D - Primary, CTAs, energy
- **Purple:** #9D4EDD - Secondary, depth
- **Neon Green:** #39FF14 - Success, achievements
- **Cyan:** #00D9FF - Accents, highlights
- **Black:** #000000 - Background
- **White:** #FFFFFF - Text

### Typography:
- Headers: Bold, impactful
- Body: Clean, readable
- Numbers/Stats: Monospace for that "power tool" feel

---

## 🏠 APP STRUCTURE (Rock Concert Theme)

| Screen | Purpose | Icon |
|--------|---------|------|
| **Backstage** | Dashboard/Command Centre | 🎤 |
| **Setlist** | Project Planning/Tasks | 📋 |
| **Crew** | Daily Task Squad | 👥 |
| **Tour** | Timeline/Calendar | 🗓️ |
| **Entourage** | ADHD Support Tools | 🧠 |

---

## 🛠️ CONSOLIDATED TOOL LIST (12 Core Tools)

### Previously 15 tools, now streamlined to 12:

| # | Tool Name | Purpose | Merged From |
|---|-----------|---------|-------------|
| 1 | **Executive Function Helper** | Break overwhelming tasks into micro-steps with AI | Original |
| 2 | **Focus Session** | Customizable timer with presets (5/25/45 min) | Focus Timer + Session |
| 3 | **Dopamine Rewards** | Customizable reward system for wins | Original |
| 4 | **Time Perception Tracker** | Estimate vs actual time comparison with insights | Time Blindness Tracker |
| 5 | **Hyperfocus Logger** | Log sessions with duration, energy, AI insights | Original |
| 6 | **Achievement System** | Points, levels, unlockable badges, streaks | Gamification/Achievements |
| 7 | **Idea Graveyard** | Log "shiny object" moments AND pivot points | Shiny Object + Pivot Logger |
| 8 | **Quick Decisions** | Pre-made decision templates to reduce fatigue | Decision Fatigue Reducer |
| 9 | **Revenue Reality Check** | Break income goals into daily actions | Original |
| 10 | **Accountability Roulette** | Random partner matching for check-ins | Original |
| 11 | **Panic Button** | Voice-to-text brain dump + "Fuck It Ship It" mode | Brain Dump + FISI merged |
| 12 | **Hype Station** | Curated music + motivational content | Hype Playlist expanded |

---

## ✨ NEW FEATURES TO ADD

### 1. 🔄 Reset Protocols (NEW - HIGH PRIORITY!)

Quick 10-second interventions for when you're stuck. Located in Entourage.

**5 Reset Types:**

| Reset | Trigger | Quick Intervention |
|-------|---------|-------------------|
| **Cognitive Overload** | "My mind is racing and I can't process" | Breathing exercise + thought dump |
| **Energy Crash** | "I'm exhausted and can't focus" | Movement prompt + energy snack reminder |
| **Emotional Spiral** | "I'm overwhelmed or anxious" | Grounding exercise (5-4-3-2-1 senses) |
| **Executive Dysfunction** | "I can't start or switch tasks" | 2-minute micro-task generator |
| **Sensory Overload** | "Everything is TOO MUCH" | Stimulus reduction checklist |

**UI/UX:**
- Large, colourful buttons (easy to tap when struggling)
- Each reset is MAX 60 seconds
- Satisfying completion animation
- Optional: Track which resets you use most (pattern insights)

---

### 2. 💬 Daily Power Message (NEW)

Shown when user first opens app each day.

**Content Rotation (3 types):**

**Type A - ADHD Truth Bombs:**
- "ADHD masking is exhausting. Today, try being 10% more yourself."
- "Time blindness isn't laziness - your brain processes time differently."
- "Your brain isn't broken. The system wasn't built for you."
- "Executive dysfunction isn't a character flaw. It's neurological."
- "Struggling doesn't mean failing. It means you're still fighting."

**Type B - Rock-Themed Motivation:**
- "Even rockstars have off days. Show up anyway."
- "Your setlist doesn't have to be perfect. Just start the first song."
- "Headliners weren't born on stage. They practiced in garages."
- "The crowd doesn't need perfection. They need YOU."
- "Legends aren't made in comfort zones. Get on that stage."

**Type C - Quick ADHD Tips:**
- "Stuck? 2-minute rule: if it takes less than 2 minutes, do it now."
- "Body doubling works. Even having this app open counts."
- "Movement before motivation. Stand up, stretch, then start."
- "Can't decide? Flip a coin. Your gut reaction tells you the truth."
- "Done is better than perfect. Ship it, then improve it."

**UI/UX:**
- Full-screen takeover on app open
- Beautiful gradient background with subtle animation
- Swipe or tap to dismiss
- "Save to favourites" option
- Can disable in settings

---

### 3. 📦 Routine Template Packs (NEW)

Pre-built task/routine templates to reduce setup friction.

**Starter Packs:**

| Pack | Contents |
|------|----------|
| **Morning Kickstart** | Wake-up routine, medication reminder, brain warm-up tasks |
| **Workday Flow** | Focus blocks, break reminders, end-of-day shutdown |
| **Wind Down Routine** | Screen time alerts, tomorrow prep, sleep hygiene |
| **Meeting Recovery** | Post-meeting decompression, action item capture |
| **Creative Session** | Warm-up exercises, distraction blocking, reward scheduling |

**UI/UX:**
- One-tap to add pack to your Setlist
- Customizable after adding
- Can create and share your own packs (future feature)

---

## 🎬 ANIMATION & MOVEMENT SPECIFICATION

### Global Background:
```
- Subtle floating particles (cosmic dust/stars)
- Very slow drift, 20-30 second loop
- Colours: Pink/purple/cyan at 10-20% opacity
- Should NOT be distracting, just "alive"
```

### Screen Transitions:
```
- Slide transitions between tabs (300ms ease-out)
- Fade-in for modal overlays (200ms)
- Scale-up for cards appearing (spring animation)
```

### Button Interactions:
```
- Press: Scale down to 0.95 + slight darken (100ms)
- Release: Spring back to 1.0 with slight overshoot
- Disabled: No animation, 50% opacity
- Ripple effect on tap (optional)
```

### Task Completion:
```
- Checkbox: Satisfying "pop" animation with checkmark drawing in
- Task card: Slides right and fades out (300ms)
- Confetti burst: 1-2 second particle explosion (for important tasks)
- XP gain: Number floats up and fades (+10 XP style)
```

### Progress Bars:
```
- Fill animation: Smooth ease-out (500ms)
- Glow effect when reaching milestones
- Pulse when nearly complete (encouraging!)
```

### Achievement Unlocks:
```
- Full screen takeover
- Badge scales up with spring animation
- Particle explosion behind badge
- Sound effect (optional)
- "ACHIEVEMENT UNLOCKED" text with typewriter effect
```

### Streak Counter:
```
- Fire emoji that "burns" more intensely with higher streaks
- Subtle flame animation
- Screen shake on streak milestones (7, 14, 30 days)
```

### Idle States:
```
- Floating elements: Gentle 3-4 second bob up/down
- Glowing elements: Subtle pulse (2 second cycle)
- Background gradient: Very slow colour shift (60+ second cycle)
```

### Reset Protocols:
```
- Button press: Ripple expands from touch point
- Screen transition: Calm fade to reset screen
- Timer: Smooth circular countdown
- Completion: Gentle "breath out" animation, calming
```

### Daily Power Message:
```
- Entry: Fade up from black with slow reveal
- Background: Animated gradient shift
- Text: Subtle typewriter or fade-in word by word
- Exit: Swipe gesture with momentum, or fade out on tap
```

---

## 📱 SCREEN-BY-SCREEN NOTES

### Landing Screen
- Hero animation: Logo with subtle glow pulse
- "Try Demo" / "Start Fresh" buttons with hover glow
- Background: Slow-moving gradient

### Backstage (Dashboard)
- Stats cards: Count-up animations on load
- Progress rings: Animated fill on appear
- Recent activity: Cards slide in sequentially
- Quick action buttons: Glow on idle, squish on press

### Setlist (Projects/Tasks) - NEEDS REBUILD
- Task cards: Drag-and-drop with physics feel
- Swipe actions: Delete/complete with satisfying feedback
- Add task: Card "deals" onto screen from bottom
- Phase headers: Subtle parallax on scroll

### Crew (Daily Tasks)
- Task filtering: Smooth morph transitions
- Assignment avatars: Subtle bounce when assigned
- Priority indicators: Colour pulse for urgent items

### Tour (Timeline)
- Calendar: Smooth scroll with momentum
- Event dots: Pop in on scroll into view
- Today indicator: Glowing line/marker

### Entourage (ADHD Tools)
- Tool cards: Staggered fade-in on load
- Category tabs: Underline slides between active tab
- Tool open: Scale up from card position
- Individual tools: See specific animations above

---

## 🔧 TECHNICAL IMPLEMENTATION

### Recommended Libraries:
```
react-native-reanimated - Smooth, performant animations
lottie-react-native - Complex animated graphics/illustrations
react-native-gesture-handler - Better touch/swipe handling
expo-haptics - Tactile feedback on interactions
expo-av - Sound effects (optional)
```

### Performance Notes:
- Use `useNativeDriver: true` where possible
- Limit simultaneous animations to 3-4 max
- Background particles should be optimized (canvas or shader)
- Test on lower-end Android devices!

---

## ✅ IMPLEMENTATION PRIORITY

### Phase 1 (Immediate - Beta Ready):
1. ✅ Fix Setlist screen crash (rebuild from scratch)
2. ✅ Add Daily Power Message system
3. ✅ Add Reset Protocols (5 types)
4. ✅ Basic animations (button press, task completion)
5. ✅ Consolidate tools (15 → 12)

### Phase 2 (Polish):
1. Background particle system
2. Achievement unlock celebrations
3. Streak fire animations
4. Screen transitions
5. Routine Template Packs

### Phase 3 (Nice to Have):
1. Sound effects
2. Haptic feedback
3. Custom animation speeds in settings
4. User-created routine packs
5. Share achievements to social

---

## 📝 NOTES FOR CLAUDE CODE

**CRITICAL REMINDERS:**
- Test on BOTH iOS and Android
- Verify files exist after claiming "done"
- Commit after each working feature
- Use `npx expo install` for package compatibility
- The `disabled` prop on TouchableOpacity is buggy - use conditional onPress

**File Locations:**
- Mobile app: `daitaniverse-build/venued/mobile/`
- Web app: `daitaniverse-build/venued/`
- Components: `src/components/`
- Screens: `src/screens/`
- Lib/Utils: `src/lib/`

**Current Branch:** `daitaniverse`

---

## 🎸 THE VISION

VENUED isn't just an app. It's the ADHD entrepreneur's secret weapon.

Every tap should feel SATISFYING.
Every completion should feel like a WIN.
Every feature should make the ADHD brain go "FINALLY, something that GETS me."

**"Plan your projects like a tour. Execute like a headliner."** 🎸💎🔥

---

**Document Version:** 2.0
**Created:** 27 November 2025
**Status:** READY FOR CLAUDE CODE
