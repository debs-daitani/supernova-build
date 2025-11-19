# SUPERNova Pitch Deck Generator - Complete Implementation Guide

## Overview

The Pitch Deck Generator is an intelligent system that creates professional investor presentations through conversational AI. Unlike template-based tools, it asks strategic questions and generates custom decks with compelling narratives.

**Key Value:** Replace expensive pitch deck designers (£2,000-£10,000) with AI-powered system that creates investor-ready decks in 30 minutes.

## Key Features

✅ **Interactive Questionnaire** - Chat-style Q&A (not boring forms)
✅ **AI-Powered Generation** - Claude generates compelling copy
✅ **Professional Designs** - 5 design themes, customizable colors
✅ **Multiple Deck Types** - Investor, partnership, sales, client, internal
✅ **Smart Slide Structure** - 15+ slide types with optimal flow
✅ **AI Coaching** - Feedback on deck, investor perspective mode
✅ **Practice Mode** - Rehearse with AI asking tough questions
✅ **Export Options** - PowerPoint, PDF, Google Slides, Keynote
✅ **Analytics** - Track views, time per slide, viewer engagement
✅ **Collaboration** - Multi-user editing with comments
✅ **Version Control** - Save and restore previous versions

## Database Collections

### 1. PitchDecks
Main deck information and configuration.

**Key Fields:**
- `userId` - Owner
- `title` - Deck title/company name
- `deckType` - investor, partnership, sales, client, internal
- `stage` - pre_seed, seed, series_a, growth, established
- `status` - questionnaire, generating, draft, review, final
- `designTheme` - professional, bold, minimal, creative, tech
- `colorScheme` - JSON with primary, secondary, accent colors
- `askAmount` - Funding amount (for investor decks)
- `slideCount` - Number of slides
- `shareLink` - Unique shareable URL
- `viewCount` - Analytics counter

### 2. PitchQuestionnaires
Conversational questionnaire responses.

**Key Fields:**
- `pitchDeckId` - Reference to deck
- `responses` - JSON object with all Q&A pairs
- `currentQuestionIndex` - Progress tracking
- `completionPercentage` - 0-100%
- `conversationFlow` - Array of conversation turns
- `isComplete` - Whether finished

### 3. PitchSlides
Individual slides with content.

**Key Fields:**
- `pitchDeckId` - Reference to deck
- `slideNumber` - Position in deck
- `slideType` - cover, problem, solution, market, team, etc.
- `title` - Slide headline
- `content` - JSON structured content (bullets, data, highlights)
- `speakerNotes` - What to say when presenting
- `designLayout` - Layout template
- `charts` - JSON array of chart configurations
- `aiSuggestions` - Improvement recommendations

### 4. PitchVersions
Version control and history.

**Key Fields:**
- `pitchDeckId` - Reference to deck
- `versionNumber` - 1, 2, 3, etc.
- `versionName` - Optional name (e.g., "Conservative", "Aggressive")
- `snapshot` - Full deck state at this version
- `changes` - What changed from previous version

## Backend Services

### 1. pitchDeckService.js
**Purpose:** Deck CRUD and configuration

**Key Functions:**
```javascript
// Create new deck
createDeck(userId, deckData)

// Get user's decks
getDecks(userId, filters)

// Update deck
updateDeck(deckId, updates, userId)

// Design customization
updateDesignTheme(deckId, theme, userId)
updateColorScheme(deckId, colorScheme, userId)

// Sharing
generateShareLink(deckId, options)
trackView(deckId, viewData)

// Collaboration
addCollaborator(deckId, collaboratorId, userId)
removeCollaborator(deckId, collaboratorId, userId)
```

**Design Themes:**
- **Professional:** Navy blue, clean, trustworthy
- **Bold:** Red/purple, energetic, vibrant
- **Minimal:** Black/white, modern, clean
- **Creative:** Pink/purple/amber, unique, artistic
- **Tech:** Cyan/indigo, sleek, futuristic

### 2. pitchQuestionnaireService.js
**Purpose:** Interactive questionnaire management

**Key Functions:**
```javascript
// Start questionnaire
createQuestionnaire(pitchDeckId, deckType)

// Get current question
getCurrentQuestion(pitchDeckId)

// Submit answer
submitAnswer(pitchDeckId, questionId, answer)

// Navigation
skipQuestion(pitchDeckId, questionId)
goToPreviousQuestion(pitchDeckId)
updateAnswer(pitchDeckId, questionId, newAnswer)

// Summary
getQuestionnaireSummary(pitchDeckId)
```

**Question Flow:**

For investor decks, asks 20+ strategic questions:
1. Business basics (name, one-liner)
2. Problem (pain point, scope)
3. Solution (how it works, secret sauce)
4. Timing (why now)
5. Market (size, target customer)
6. Business model (revenue, pricing, economics)
7. Traction (metrics, growth, validation)
8. Competition (who, differentiation)
9. Go-to-market (acquisition strategy)
10. Team (founders, key members)
11. Financials (projections, assumptions)
12. Ask (amount, use of funds, milestones)

Questions adapt based on answers:
- Pre-revenue → focuses on vision and validation
- Has traction → focuses on metrics and scaling
- B2B → asks about sales cycle and contracts
- B2C → asks about user acquisition and virality

### 3. pitchGenerationService.js
**Purpose:** AI-powered deck generation

**Key Functions:**
```javascript
// Generate full deck from questionnaire
generateDeck(pitchDeckId)

// Regenerate specific slide
regenerateSlide(slideId)
```

**Generation Process:**

1. **Analyze Responses:** Extract key information from questionnaire
2. **Structure Narrative:** Determine slide order and flow
3. **Generate Content:** Use Claude AI to write compelling copy for each slide
4. **Create Visualizations:** Identify data that needs charts/graphs
5. **Add Speaker Notes:** Generate presenter guidance

**AI Prompt Engineering:**

Each slide gets custom prompt:
```
You are an expert pitch deck consultant. Create compelling,
investor-ready content for a [SLIDE_TYPE] slide.

CONTEXT: [questionnaire responses]

REQUIREMENTS:
- Punchy, compelling copy (not corporate speak)
- Concise (max 3-5 bullet points)
- Focus on impact and benefits
- Use numbers and data
- Investor-friendly language

OUTPUT FORMAT: JSON with title, content, speakerNotes
```

**Standard Slide Structure:**

1. **Cover** - Company name, tagline, contact
2. **Hook** - One big idea that grabs attention
3. **Problem** - Pain point, scope, current solutions
4. **Solution** - Your product, how it works, benefits
5. **Why Now** - Market shifts, trends, timing
6. **Market** - TAM/SAM/SOM, growth rate, target
7. **Product** - Screenshots, features, UX
8. **Business Model** - Revenue, pricing, unit economics
9. **Traction** - Growth metrics, customer stories
10. **Competition** - Landscape, differentiation, defensibility
11. **Go-to-Market** - Acquisition, channels, partnerships
12. **Team** - Founders, key hires, advisors
13. **Financials** - Historical, projections, assumptions
14. **Ask** - Amount, use of funds, milestones
15. **Vision** - Where you're going, impact, closer

### 4. pitchSlideService.js
**Purpose:** Slide management and editing

**Key Functions:**
```javascript
// Get all slides
getSlides(pitchDeckId)

// Update slide content
updateSlide(slideId, updates)

// Reorder slides
reorderSlides(pitchDeckId, slideIds)

// Add visualizations
addChart(slideId, chartConfig)
```

**Slide Layouts:**

- `centered` - Cover slides, centered text
- `title_content` - Standard title + content
- `title_bullets` - Title + bullet points
- `two_column` - Split content
- `title_chart` - Title + data visualization
- `full_image` - Image background with text overlay
- `title_stats` - Title + key metrics/numbers
- `title_grid` - Title + grid layout (for team)

### 5. pitchFeedbackService.js
**Purpose:** AI coaching and feedback

**Key Functions:**
```javascript
// Get deck review
getDeckFeedback(pitchDeckId)

// Get slide suggestions
getSlideSuggestions(slideId)

// Practice mode
getInvestorQuestions(pitchDeckId)
```

**AI Feedback Format:**

```json
{
  "overallAssessment": "Strong deck! Clear problem and solution...",
  "strengths": [
    "Traction slide is powerful (120% MoM growth)",
    "Team credentials are strong",
    "Market opportunity well-researched"
  ],
  "weaknesses": [
    "Problem slide could be more emotional",
    "Financial projections seem aggressive"
  ],
  "criticalIssues": [
    "Missing competitive analysis",
    "Use of funds too vague"
  ],
  "recommendations": [
    {
      "slide": "Problem",
      "issue": "Too abstract",
      "suggestion": "Add specific customer story",
      "priority": "high"
    }
  ],
  "investorPerspective": {
    "likelyQuestions": [
      "How do you know 60% need this?",
      "What about Company X?"
    ],
    "concerns": [
      "Churn projection seems optimistic",
      "No clear competitive moat"
    ]
  },
  "score": 75
}
```

**Investor Perspective Mode:**

AI role-plays as skeptical investor:
- Identifies potential objections
- Suggests what investors will question
- Helps prepare counter-arguments
- Highlights red flags

**Practice Mode:**

AI asks 10 tough questions:
- "Your market size looks huge, but how much can you realistically capture?"
- "What happens if Company X copies your feature?"
- "Your projections show 10x growth - walk me through the assumptions"

### 6. pitchExportService.js
**Purpose:** Export and analytics

**Key Functions:**
```javascript
// Export formats
exportToPowerPoint(pitchDeckId)
exportToPDF(pitchDeckId)

// Analytics
trackDeckView(pitchDeckId, viewData)
getDeckAnalytics(pitchDeckId)
```

**Analytics Tracking:**

When deck is shared, track:
- Who viewed (IP, location)
- How long on each slide
- Which slides got most attention
- Device breakdown
- Total views
- Completion rate (% who viewed to end)

**Use Cases:**

"Investor A spent 3 minutes on Traction but skipped Financials - they need convincing on business fundamentals"

## Implementation Examples

### Create and Generate Deck

```javascript
import { createDeck } from 'backend/pitchDeckService';
import { createQuestionnaire, submitAnswer } from 'backend/pitchQuestionnaireService';
import { generateDeck } from 'backend/pitchGenerationService';

// 1. Create deck
const deck = await createDeck(userId, {
  title: 'SuperWidget Inc.',
  deckType: 'investor',
  stage: 'seed',
  askAmount: 500000
});

// 2. Start questionnaire
const questionnaire = await createQuestionnaire(deck._id, 'investor');

// 3. Answer questions
await submitAnswer(deck._id, 'company_name', 'SuperWidget Inc.');
await submitAnswer(deck._id, 'one_liner', 'AI-powered inventory management for small businesses');
await submitAnswer(deck._id, 'problem', 'Small businesses waste 10+ hours/week on manual inventory tracking');
// ... continue answering all questions

// 4. Generate deck
const result = await generateDeck(deck._id);
// Returns deck with 15 professionally written slides
```

### Get Feedback and Iterate

```javascript
import { getDeckFeedback } from 'backend/pitchFeedbackService';
import { updateSlide } from 'backend/pitchSlideService';

// Get AI feedback
const feedback = await getDeckFeedback(deckId);

console.log('Overall Score:', feedback.score);
console.log('Strengths:', feedback.strengths);
console.log('Weaknesses:', feedback.weaknesses);

// Implement recommendations
for (const rec of feedback.recommendations) {
  if (rec.priority === 'high') {
    console.log(`Fix ${rec.slide}: ${rec.suggestion}`);
  }
}

// Update problem slide based on feedback
const problemSlide = slides.find(s => s.slideType === 'problem');
await updateSlide(problemSlide._id, {
  content: {
    ...problemSlide.content,
    customerStory: "Meet Sarah, a bakery owner who lost £5K in spoiled inventory last month..."
  }
});
```

### Export and Share

```javascript
import { exportToPowerPoint, exportToPDF } from 'backend/pitchExportService';
import { generateShareLink } from 'backend/pitchDeckService';

// Export to PowerPoint
const pptx = await exportToPowerPoint(deckId);
// User downloads: SuperWidget_Inc.pptx

// Export to PDF
const pdf = await exportToPDF(deckId);

// Generate shareable link
const share = await generateShareLink(deckId, {
  password: 'investor2024',
  trackingEnabled: true
});

console.log('Share URL:', share.shareLink);
// https://yourdomain.com/pitch/abc123xyz

// Track when investors view
const analytics = await getDeckAnalytics(deckId);
console.log('Total Views:', analytics.totalViews);
console.log('Avg Duration:', analytics.avgDuration);
```

## UI Implementation

### Questionnaire Page

```javascript
// Page: /pitch/create
import { getCurrentQuestion, submitAnswer } from 'backend/pitchQuestionnaireService';

$w.onReady(async function () {
  const deckId = $w('#deckId').text;
  await loadQuestion();

  $w('#submitButton').onClick(handleSubmit);
  $w('#skipButton').onClick(handleSkip);
});

async function loadQuestion() {
  const q = await getCurrentQuestion(deckId);

  if (q.isComplete) {
    wixLocation.to('/pitch/generate/' + deckId);
    return;
  }

  $w('#questionText').text = q.question;
  $w('#progressBar').value = q.progress;
  $w('#progressText').text = `${q.questionNumber} of ${q.totalQuestions}`;
}

async function handleSubmit() {
  const answer = $w('#answerInput').value;

  if (!answer) {
    $w('#errorText').text = 'Please provide an answer';
    return;
  }

  await submitAnswer(deckId, currentQuestionId, answer);
  $w('#answerInput').value = '';
  await loadQuestion();
}
```

### Deck Editor

```javascript
// Page: /pitch/edit/:id
import { getSlides, updateSlide } from 'backend/pitchSlideService';
import { getDeck } from 'backend/pitchDeckService';

$w.onReady(async function () {
  const deckId = await loadDeck();
  await loadSlides(deckId);
});

async function loadSlides(deckId) {
  const slides = await getSlides(deckId);

  $w('#slidesRepeater').data = slides.map(s => ({
    _id: s._id,
    number: s.slideNumber,
    title: s.title,
    type: s.slideType
  }));

  $w('#slidesRepeater').onItemReady(($item, itemData) => {
    $item('#slideThumb').onClick(() => {
      loadSlideInEditor(itemData._id);
    });
  });
}

async function loadSlideInEditor(slideId) {
  const slide = await getSlide(slideId);

  $w('#slideTitle').value = slide.title;
  $w('#slideContent').value = JSON.stringify(slide.content, null, 2);
  $w('#speakerNotes').value = slide.speakerNotes;

  currentSlideId = slideId;
}

async function saveSlide() {
  await updateSlide(currentSlideId, {
    title: $w('#slideTitle').value,
    content: JSON.parse($w('#slideContent').value),
    speakerNotes: $w('#speakerNotes').value
  });

  $w('#saveStatus').text = 'Saved!';
}
```

## Deck Types

### Investor Pitch
**Focus:** Opportunity, traction, team, ask
**Tone:** Confident, data-driven, ambitious
**Slides:** 15-18 (full structure)

### Partnership Pitch
**Focus:** Mutual benefit, value exchange, synergies
**Tone:** Collaborative, strategic
**Slides:** 10-12 (focused on partnership value)

### Sales Deck
**Focus:** Customer pain, solution, ROI, proof
**Tone:** Client-focused, benefit-driven
**Slides:** 8-10 (quick, punchy)

### Client Proposal
**Focus:** Understanding needs, solution, timeline, pricing
**Tone:** Professional, detailed
**Slides:** 12-15 (comprehensive proposal)

### Internal Presentation
**Focus:** Progress, challenges, recommendations
**Tone:** Transparent, team-oriented
**Slides:** 6-10 (concise updates)

## Best Practices

### Writing Compelling Copy

❌ **Bad:** "We provide a software platform for inventory management."
✅ **Good:** "Small businesses lose £50K/year from poor inventory tracking. We fix that."

❌ **Bad:** "Our solution is innovative and user-friendly."
✅ **Good:** "AI predicts demand and auto-reorders. Set it and forget it."

### Slide Design Principles

1. **One idea per slide** - Don't cram
2. **Visual hierarchy** - Headlines, then details
3. **Data visualization** - Charts > tables > text
4. **White space** - Let content breathe
5. **Consistent branding** - Colors, fonts, logos

### Investor Dos and Don'ts

**DO:**
- Lead with traction if you have it
- Show you understand the market
- Be honest about risks
- Have backup slides for detailed questions

**DON'T:**
- Say "no competitors" (red flag)
- Use tiny fonts
- Read slides word-for-word
- Go over time limit

## API Integration

### Configure Claude API

1. Get API key from Anthropic
2. Store in Wix Secrets Manager
3. Update services to use key

```javascript
import { getSecret } from 'wix-secrets-backend';

const CLAUDE_API_KEY = await getSecret('CLAUDE_API_KEY');
```

## Pricing Model

Pitch Deck Generator as premium feature:
- **One-time:** £49 per deck
- **Unlimited:** £19/month (create unlimited decks)
- **Bundle:** Included in Premium plan (£99/month)

## Testing

```javascript
// Test deck generation
const testDeck = await createDeck('test-user', {
  title: 'Test Company',
  deckType: 'investor'
});

const questionnaire = await createQuestionnaire(testDeck._id, 'investor');

// Submit test answers
await submitAnswer(testDeck._id, 'company_name', 'Test Co');
// ... submit all answers

// Generate
const result = await generateDeck(testDeck._id);
console.log('Generated', result.slideCount, 'slides');
```

## Next Steps

1. Set up database collections
2. Add backend services
3. Create UI pages (questionnaire, editor, viewer)
4. Configure Claude API
5. Design slide templates
6. Set up export functionality
7. Implement analytics
8. Test with sample decks
9. Beta test with users
10. Launch!

## Support

For help:
- Review service code comments
- Check implementation examples
- Test with sample data first
- Monitor AI API costs

## Changelog

**v1.0.0** - Initial release
- Interactive questionnaire
- AI deck generation
- 5 design themes
- Export to PowerPoint/PDF
- AI feedback system
- Analytics tracking
