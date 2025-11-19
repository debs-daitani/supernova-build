/**
 * SUPERNova Viral Content Analyzer - Analysis Service
 *
 * AI-powered viral content analysis:
 * - Deep analysis of viral content
 * - Hook analysis
 * - Emotional triggers
 * - Structural analysis
 * - Psychological principles
 * - Actionable recommendations
 */

import { fetch } from 'wix-fetch';
import wixData from 'wix-data';
import { getViralContent, updateViralContent } from './viralContentService';

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const CLAUDE_API_KEY = 'YOUR_ANTHROPIC_API_KEY';
const CLAUDE_MODEL = 'claude-3-5-sonnet-20241022';

const COLLECTIONS = {
  VIRAL_ANALYSIS: 'ViralAnalysis'
};

/**
 * Analyze viral content
 * @param {string} contentId - Viral content ID
 * @returns {Promise<Object>} Analysis results
 */
export async function analyzeViralContent(contentId) {
  try {
    const content = await getViralContent(contentId);

    // Build comprehensive analysis prompt
    const prompt = buildAnalysisPrompt(content);

    // Call AI for analysis
    const aiResponse = await callClaudeAPI(prompt);

    // Parse AI response
    const analysisData = parseAnalysisResponse(aiResponse);

    // Save analysis to database
    const analysis = await saveAnalysis(contentId, analysisData);

    // Update content record
    await updateViralContent(contentId, {
      isAnalyzed: true,
      analysisData: analysisData
    });

    return analysis;
  } catch (error) {
    console.error('Error analyzing viral content:', error);
    throw new Error(`Analysis failed: ${error.message}`);
  }
}

/**
 * Build AI analysis prompt
 * @param {Object} content - Viral content
 * @returns {string} Analysis prompt
 */
function buildAnalysisPrompt(content) {
  return `Analyze this viral ${content.contentType} and provide deep insights.

PLATFORM: ${content.platform}
AUTHOR: ${content.author} (${content.authorFollowers.toLocaleString()} followers)
PUBLISHED: ${new Date(content.publishedAt).toLocaleDateString()}

CONTENT:
Title/Hook: ${content.title}
Caption: ${content.caption}
${content.transcript ? `Transcript: ${content.transcript.substring(0, 1000)}` : ''}

PERFORMANCE:
- Views: ${content.views.toLocaleString()}
- Likes: ${content.likes.toLocaleString()}
- Comments: ${content.comments.toLocaleString()}
- Shares: ${content.shares.toLocaleString()}
- Engagement Rate: ${content.engagementRate.toFixed(2)}%
- Viral Score: ${content.viralScore}/100

ANALYZE THE FOLLOWING:

1. **Hook Analysis**:
   - What type of hook is used? (question, bold_claim, story, statistic, controversy, curiosity_gap, pattern_interrupt)
   - Extract the exact hook text (first line/3 seconds)
   - Why does it grab attention?
   - Hook effectiveness score (0-100)

2. **Emotional Triggers**:
   - What emotions does this evoke? (surprise, anger, joy, fear, inspiration, nostalgia, fomo, validation)
   - Which emotion is strongest?

3. **Structural Elements**:
   - How is the content structured?
   - Is there a narrative arc?
   - Pacing and flow
   - Length optimization

4. **Call-to-Action**:
   - What's the CTA (if any)?
   - CTA type and effectiveness

5. **Psychological Principles**:
   - What psychology tactics are used? (social_proof, authority, scarcity, reciprocity, storytelling, contrast, pattern_interrupt)

6. **Engagement Drivers**:
   - What specifically made people engage?
   - Why did people comment/share/save?

7. **Key Takeaways**:
   - What can others learn from this?
   - What made it go viral?

8. **Recommendations**:
   - How can someone replicate this success?
   - Specific actionable steps

Return analysis in JSON format:
{
  "hookType": "string",
  "hookText": "string",
  "hookScore": number,
  "emotionalTriggers": ["array"],
  "primaryEmotion": "string",
  "structuralElements": {
    "format": "string",
    "structure": "string",
    "pacing": "string",
    "length": "optimal/too_long/too_short"
  },
  "callToAction": "string",
  "ctaType": "string",
  "psychologicalPrinciples": ["array"],
  "engagementDrivers": ["array"],
  "keyTakeaways": ["array"],
  "recommendations": [
    {
      "recommendation": "string",
      "how": "string",
      "priority": "high/medium/low"
    }
  ],
  "whyViral": "string",
  "contentFormat": "string",
  "targetAudience": "string"
}`;
}

/**
 * Parse AI analysis response
 * @param {string} response - AI response
 * @returns {Object} Parsed analysis
 */
function parseAnalysisResponse(response) {
  try {
    return JSON.parse(response);
  } catch (error) {
    console.error('Failed to parse AI response:', error);
    // Return default structure if parsing fails
    return {
      hookType: 'unknown',
      hookText: '',
      hookScore: 50,
      emotionalTriggers: [],
      primaryEmotion: 'neutral',
      structuralElements: {},
      callToAction: '',
      ctaType: '',
      psychologicalPrinciples: [],
      engagementDrivers: [],
      keyTakeaways: [],
      recommendations: [],
      whyViral: 'Analysis unavailable',
      contentFormat: 'unknown',
      targetAudience: 'general'
    };
  }
}

/**
 * Save analysis to database
 * @param {string} contentId - Content ID
 * @param {Object} analysisData - Analysis data
 * @returns {Promise<Object>} Saved analysis
 */
async function saveAnalysis(contentId, analysisData) {
  try {
    const analysis = {
      viralContentId: contentId,
      hookType: analysisData.hookType,
      hookText: analysisData.hookText,
      hookScore: analysisData.hookScore,
      emotionalTriggers: analysisData.emotionalTriggers,
      structuralElements: analysisData.structuralElements,
      lengthAnalysis: {
        assessment: analysisData.structuralElements.length || 'unknown'
      },
      timingAnalysis: {},
      visualElements: {},
      callToAction: analysisData.callToAction,
      ctaType: analysisData.ctaType,
      engagementDrivers: analysisData.engagementDrivers,
      psychologicalPrinciples: analysisData.psychologicalPrinciples,
      contentFormat: analysisData.contentFormat,
      targetAudience: analysisData.targetAudience,
      keyTakeaways: analysisData.keyTakeaways,
      recommendations: analysisData.recommendations,
      similarPatterns: [],
      createdAt: new Date()
    };

    return await wixData.insert(COLLECTIONS.VIRAL_ANALYSIS, analysis);
  } catch (error) {
    console.error('Error saving analysis:', error);
    throw error;
  }
}

/**
 * Get analysis for content
 * @param {string} contentId - Content ID
 * @returns {Promise<Object|null>} Analysis or null
 */
export async function getAnalysis(contentId) {
  try {
    const results = await wixData.query(COLLECTIONS.VIRAL_ANALYSIS)
      .eq('viralContentId', contentId)
      .limit(1)
      .find();

    return results.items.length > 0 ? results.items[0] : null;
  } catch (error) {
    console.error('Error getting analysis:', error);
    return null;
  }
}

/**
 * Call Claude API
 * @param {string} prompt - Analysis prompt
 * @returns {Promise<string>} AI response
 */
async function callClaudeAPI(prompt) {
  try {
    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 3000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.content[0].text;
  } catch (error) {
    console.error('Error calling AI API:', error);
    throw error;
  }
}

/**
 * Analyze user's own content and compare
 * @param {string} userContentId - User content submission ID
 * @param {string} similarViralContentId - Similar viral content for comparison
 * @returns {Promise<Object>} Comparison analysis
 */
export async function analyzeUserContent(userContentId, similarViralContentId) {
  try {
    const userContent = await wixData.get('UserContentSubmissions', userContentId);
    const viralContent = await getViralContent(similarViralContentId);
    const viralAnalysis = await getAnalysis(similarViralContentId);

    const prompt = `Compare these two pieces of content and explain why one went viral and the other didn't.

USER'S CONTENT (Did NOT go viral):
${userContent.caption}
Performance: ${userContent.yourPerformance.views} views, ${userContent.yourPerformance.likes} likes

VIRAL CONTENT (Went viral):
${viralContent.caption}
Performance: ${viralContent.views} views, ${viralContent.likes} likes

Viral content analysis:
- Hook: ${viralAnalysis?.hookType || 'N/A'}
- Emotions: ${viralAnalysis?.emotionalTriggers.join(', ') || 'N/A'}
- Psychology: ${viralAnalysis?.psychologicalPrinciples.join(', ') || 'N/A'}

Provide comparison in JSON:
{
  "whatUserDid": ["list of what user did"],
  "whatViralDid": ["list of what viral content did differently"],
  "keyDifferences": [
    {
      "aspect": "string",
      "userApproach": "string",
      "viralApproach": "string",
      "lesson": "string"
    }
  ],
  "recommendations": [
    {
      "improve": "string",
      "how": "string",
      "priority": "high/medium/low"
    }
  ],
  "estimatedImpact": "string"
}`;

    const aiResponse = await callClaudeAPI(prompt);
    const comparison = JSON.parse(aiResponse);

    // Update user content submission
    await wixData.update('UserContentSubmissions', {
      ...userContent,
      analysisCompleted: true,
      comparedToViralId: similarViralContentId,
      comparisonResults: comparison,
      recommendations: comparison.recommendations
    });

    return comparison;
  } catch (error) {
    console.error('Error analyzing user content:', error);
    throw error;
  }
}

/**
 * Generate pattern recognition insights
 * @param {Array<string>} contentIds - Array of viral content IDs
 * @returns {Promise<Object>} Pattern insights
 */
export async function identifyPatterns(contentIds) {
  try {
    const analyses = [];

    for (const contentId of contentIds) {
      const analysis = await getAnalysis(contentId);
      if (analysis) {
        analyses.push(analysis);
      }
    }

    // Analyze patterns
    const patterns = {
      commonHooks: {},
      commonEmotions: {},
      commonPsychology: {},
      commonFormats: {}
    };

    analyses.forEach(analysis => {
      // Count hook types
      patterns.commonHooks[analysis.hookType] =
        (patterns.commonHooks[analysis.hookType] || 0) + 1;

      // Count emotions
      analysis.emotionalTriggers.forEach(emotion => {
        patterns.commonEmotions[emotion] =
          (patterns.commonEmotions[emotion] || 0) + 1;
      });

      // Count psychology principles
      analysis.psychologicalPrinciples.forEach(principle => {
        patterns.commonPsychology[principle] =
          (patterns.commonPsychology[principle] || 0) + 1;
      });

      // Count formats
      patterns.commonFormats[analysis.contentFormat] =
        (patterns.commonFormats[analysis.contentFormat] || 0) + 1;
    });

    return patterns;
  } catch (error) {
    console.error('Error identifying patterns:', error);
    throw error;
  }
}

export default {
  analyzeViralContent,
  getAnalysis,
  analyzeUserContent,
  identifyPatterns
};
