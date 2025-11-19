# Viral Content Analyzer - Implementation Guide

## Overview

The Viral Content Analyzer is an AI-powered system that analyzes viral content to understand WHY it works and helps you create your own viral-worthy content.

### Key Value Proposition

Replace guesswork with data-driven content strategy by studying successful content patterns and getting AI-powered recommendations.

---

## Database Collections

### 1. ViralContent
Stores viral content from various platforms for analysis.

**Key Fields**:
- `platform` - twitter, instagram, tiktok, youtube, linkedin, facebook
- `url`, `author`, `authorFollowers`
- `contentType` - post, video, reel, thread, article, carousel
- `views`, `likes`, `comments`, `shares`, `saves`
- `engagementRate`, `viralScore` (0-100)
- `topic`, `industry`, `analysisData`

### 2. ViralAnalysis  
Deep AI analysis of viral content.

**Key Fields**:
- `hookType`, `hookText`, `hookScore`
- `emotionalTriggers` - array of emotions triggered
- `psychologicalPrinciples` - tactics used
- `engagementDrivers` - what drove engagement
- `recommendations` - actionable advice

### 3. ContentPatterns
Identified patterns that work.

**Key Fields**:
- `patternName`, `pattern`, `template`
- `avgEngagementRate`, `avgViralScore`
- `howToUse`, `examples`

### 4. UserContentSubmissions
User's own content for analysis.

**Key Fields**:
- `url`, `yourPerformance`
- `analysis`, `recommendations`
- `comparedToViralId`, `comparisonResults`

### 5. ContentIdeas
Generated content ideas.

**Key Fields**:
- `idea`, `hook`, `structure`
- `estimatedViralScore`
- `status` - idea, drafted, scheduled, published

### 6. ViralTrends
Trending topics and formats.

**Key Fields**:
- `trend`, `status` - emerging, rising, peak, declining, dead
- `howToCapitalize`, `opportunityWindow`

---

## Backend Services

### viralContentService.js
Core content management.

**Key Functions**:
```javascript
addViralContent(contentData, userId)
getTrendingContent(filters)
searchViralContent(searchTerm, filters)
getSavedContent(userId, filters)
calculateViralScore(contentData) // Returns 0-100
```

**Viral Score Formula**:
- Engagement rate: 0-40 points
- Reach vs author size: 0-20 points
- Velocity (views/hour): 0-20 points
- Quality of engagement: 0-20 points

### viralAnalysisService.js
AI-powered analysis.

**Key Functions**:
```javascript
analyzeViralContent(contentId)
analyzeUserContent(userContentId, similarViralId)
identifyPatterns(contentIds)
```

**Analysis Covers**:
1. Hook type and effectiveness
2. Emotional triggers
3. Structural elements
4. Psychological principles
5. Engagement drivers
6. Actionable recommendations

### viralToolsService.js
Consolidated tools service.

**Key Functions**:
```javascript
// Patterns
getPatterns(filters)
savePattern(patternData)

// Ideas
generateContentIdeas(userId, preferences)
getUserIdeas(userId, status)

// Predictor
predictVirality(platform, draftContent)

// Builder
buildContent(builderData)

// Trends
getCurrentTrends(filters)
saveTrend(trendData)
```

---

## Key Features

### 1. Discover Viral Content
```javascript
// Get trending content
const trending = await getTrendingContent({
  platform: 'twitter',
  minViralScore: 70,
  limit: 20
});
```

### 2. Analyze Viral Content
```javascript
// Analyze by URL
const content = await addViralContent({
  url: 'https://twitter.com/user/status/123',
  platform: 'twitter',
  // ... metrics
});

const analysis = await analyzeViralContent(content._id);

// Results include:
// - Hook type and effectiveness
// - Emotional triggers
// - Psychology tactics
// - Why it went viral
// - How to replicate
```

### 3. Analyze Your Content
```javascript
// Submit your content
const submission = await addUserContent({
  url: 'your-post-url',
  yourPerformance: { views: 1200, likes: 50 }
});

// Compare to similar viral content
const comparison = await analyzeUserContent(
  submission._id,
  similarViralContentId
);

// Get specific recommendations
```

### 4. Generate Content Ideas
```javascript
const ideas = await generateContentIdeas(userId, {
  platform: 'linkedin',
  industry: 'business',
  topics: ['productivity', 'remote work']
});

// Returns 5 ideas with:
// - Hook suggestions
// - Structure outline
// - Estimated viral score
// - Based on proven patterns
```

### 5. Predict Virality
```javascript
const prediction = await predictVirality('twitter', draftContent);

// Returns:
// - Viral score (0-100)
// - Strengths
// - Weaknesses
// - Suggestions for improvement
// - Optimized version
```

### 6. Build Content
```javascript
const built = await buildContent({
  platform: 'instagram',
  template: 'before_after',
  topic: 'productivity hacks',
  mainPoints: ['point 1', 'point 2', 'point 3'],
  targetAudience: 'entrepreneurs',
  tone: 'energetic'
});

// Returns complete content with:
// - Hook options
// - Body copy
// - CTA
// - Hashtags
// - Posting tips
```

---

## Implementation Examples

### Frontend: Analyze Page
```javascript
import { addViralContent } from 'backend/viralContentService';
import { analyzeViralContent } from 'backend/viralAnalysisService';

$w.onReady(function () {
  $w('#analyzeButton').onClick(async () => {
    const url = $w('#urlInput').value;
    
    // Add content
    const content = await addViralContent({
      url,
      platform: detectPlatform(url),
      // ... fetch metrics from API
    });
    
    // Analyze
    const analysis = await analyzeViralContent(content._id);
    
    // Display results
    displayAnalysis(analysis);
  });
});
```

### Frontend: Ideas Generator
```javascript
import { generateContentIdeas } from 'backend/viralToolsService';

$w('#generateIdeasButton').onClick(async () => {
  const ideas = await generateContentIdeas(userId, {
    platform: $w('#platformDropdown').value,
    industry: $w('#industryInput').value,
    topics: $w('#topicsInput').value.split(',')
  });
  
  $w('#ideasRepeater').data = ideas;
});
```

### Frontend: Virality Predictor
```javascript
import { predictVirality } from 'backend/viralToolsService';

$w('#draftInput').onInput(async () => {
  const draft = $w('#draftInput').value;
  
  if (draft.length > 50) {
    const prediction = await predictVirality('twitter', draft);
    
    $w('#scoreText').text = prediction.viralScore;
    $w('#strengthsList').text = prediction.strengths.join('\n');
    $w('#suggestionsList').text = prediction.suggestions.map(s => s.suggestion).join('\n');
  }
});
```

---

## Hook Types

Common viral hooks:
- **Question**: "Ever wondered why...?"
- **Bold Claim**: "This changed everything."
- **Story**: "3 years ago, I was..."
- **Statistic**: "95% of people don't know..."
- **Controversy**: "Unpopular opinion:"
- **Curiosity Gap**: "You won't believe..."
- **Pattern Interrupt**: "Stop doing X. Do Y instead."

---

## Emotional Triggers

Emotions that drive sharing:
- Surprise - Unexpected insights
- Anger - Injustice, frustration
- Joy - Happiness, humor
- Fear - Warnings, concerns
- Inspiration - Hope, motivation
- Nostalgia - Memories
- FOMO - Missing out
- Validation - Agreement, belonging

---

## Psychological Principles

- **Social Proof**: "10,000 people can't be wrong"
- **Authority**: Expertise demonstration
- **Scarcity**: "Limited time only"
- **Reciprocity**: Give value first
- **Storytelling**: Narrative arc
- **Contrast**: Before/after
- **Pattern Interrupt**: Break expectations

---

## Content Patterns

Example patterns:
1. **"3 Reasons Why"** - Listicle format
2. **"Misconception vs Reality"** - Myth-busting
3. **"Nobody Tells You"** - Insider secrets
4. **Before/After** - Transformation
5. **"Unpopular Opinion"** - Contrarian
6. **Personal Story** - Relatable experience
7. **How-to Tutorial** - Educational

---

## Platform Best Practices

### Twitter
- Hook in first 20 characters
- Use line breaks for readability
- End with question for engagement
- Threads for depth

### Instagram
- First 3 seconds crucial for Reels
- Bold text overlays
- Hook → Value → CTA
- Carousels for saves

### TikTok
- Pattern interrupt immediately
- Keep under 15 seconds for completion
- Text overlay + voiceover
- Trend alignment

### LinkedIn
- Professional but personal
- Storytelling works best
- 3-5 key points
- Ask for engagement

---

## Success Metrics

Track:
- Viral score improvement over time
- Engagement rate trends
- Most effective hook types for you
- Best-performing content formats
- Optimal posting times

---

## Testing

```javascript
// Test viral score calculation
const content = {
  views: 100000,
  likes: 5000,
  comments: 500,
  shares: 1000,
  authorFollowers: 10000,
  publishedAt: new Date(Date.now() - 3600000) // 1 hour ago
};

const score = calculateViralScore(content);
expect(score).toBeGreaterThan(70); // High engagement
```

---

## Best Practices

1. **Study Before Creating**: Analyze 10+ viral posts in your niche first
2. **Pattern Recognition**: Look for patterns across multiple viral posts
3. **Test Hooks**: Try 3 different hooks, see which performs best
4. **Optimal Timing**: Post when your audience is most active
5. **Engage Early**: Respond to comments in first hour
6. **Track Performance**: Monitor which content types work for YOU
7. **Iterate**: Apply learnings to next post

---

## Summary

The Viral Content Analyzer provides:
- Deep AI analysis of viral content
- Pattern recognition across thousands of posts
- Actionable recommendations
- Content idea generation
- Virality prediction
- Step-by-step content builder

Use it to replace guesswork with data-driven content strategy!
