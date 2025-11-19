/**
 * SUPERNova Pitch Deck Generator - Feedback Service
 *
 * Provides AI coaching and feedback:
 * - Deck review and analysis
 * - Slide-specific suggestions
 * - Industry benchmarking
 * - Investor perspective mode
 * - Practice mode
 */

import wixData from 'wix-data';
import { fetch } from 'wix-fetch';
import { getDeck } from './pitchDeckService';
import { getSlides } from './pitchSlideService';
import { getQuestionnaireSummary } from './pitchQuestionnaireService';

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const CLAUDE_API_KEY = 'YOUR_ANTHROPIC_API_KEY';
const CLAUDE_MODEL = 'claude-3-5-sonnet-20241022';

/**
 * Get AI feedback on entire deck
 * @param {string} pitchDeckId - Pitch deck ID
 * @returns {Promise<Object>} Feedback
 */
export async function getDeckFeedback(pitchDeckId) {
  try {
    const deck = await getDeck(pitchDeckId);
    const slides = await getSlides(pitchDeckId);
    const summary = await getQuestionnaireSummary(pitchDeckId);

    const prompt = buildDeckReviewPrompt(deck, slides, summary);

    const response = await callClaudeAPI(prompt);

    return parseFeedback(response);
  } catch (error) {
    console.error('Error getting deck feedback:', error);
    throw new Error(`Failed to get feedback: ${error.message}`);
  }
}

/**
 * Build deck review prompt
 * @param {Object} deck - Deck
 * @param {Array} slides - Slides
 * @param {Object} summary - Questionnaire summary
 * @returns {string} Prompt
 */
function buildDeckReviewPrompt(deck, slides, summary) {
  return `You are an expert pitch deck consultant who has reviewed thousands of successful decks.

Review this ${deck.deckType} pitch deck and provide constructive feedback.

DECK INFO:
- Type: ${deck.deckType}
- Stage: ${deck.stage}
- Ask: £${deck.askAmount || 0}

SLIDES:
${slides.map(s => `${s.slideNumber}. ${s.title} (${s.slideType})`).join('\n')}

RESPONSES:
${JSON.stringify(summary.responses, null, 2)}

Provide feedback in this JSON format:
{
  "overallAssessment": "summary of strengths and weaknesses",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "weaknesses": ["weakness 1", "weakness 2"],
  "criticalIssues": ["issue 1", "issue 2"],
  "recommendations": [
    {
      "slide": "slide title",
      "issue": "what's wrong",
      "suggestion": "how to fix it",
      "priority": "high/medium/low"
    }
  ],
  "investorPerspective": {
    "likelyQuestions": ["question 1", "question 2"],
    "concerns": ["concern 1", "concern 2"]
  },
  "score": 75
}`;
}

/**
 * Call Claude API
 * @param {string} prompt - Prompt
 * @returns {Promise<string>} Response
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
        max_tokens: 2048,
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
 * Parse feedback response
 * @param {string} response - AI response
 * @returns {Object} Parsed feedback
 */
function parseFeedback(response) {
  try {
    return JSON.parse(response);
  } catch (error) {
    return {
      overallAssessment: response,
      strengths: [],
      weaknesses: [],
      recommendations: []
    };
  }
}

/**
 * Get slide-specific suggestions
 * @param {string} slideId - Slide ID
 * @returns {Promise<Array>} Suggestions
 */
export async function getSlideSuggestions(slideId) {
  try {
    const slide = await wixData.get('PitchSlides', slideId);

    const prompt = `Review this ${slide.slideType} slide and suggest improvements:

TITLE: ${slide.title}
CONTENT: ${JSON.stringify(slide.content, null, 2)}

Provide 3-5 specific, actionable suggestions to make this slide more compelling.

Return as JSON array:
["suggestion 1", "suggestion 2", "suggestion 3"]`;

    const response = await callClaudeAPI(prompt);

    try {
      return JSON.parse(response);
    } catch {
      return [response];
    }
  } catch (error) {
    console.error('Error getting slide suggestions:', error);
    throw error;
  }
}

/**
 * Practice mode - AI asks tough questions
 * @param {string} pitchDeckId - Pitch deck ID
 * @returns {Promise<Array>} Investor questions
 */
export async function getInvestorQuestions(pitchDeckId) {
  try {
    const deck = await getDeck(pitchDeckId);
    const summary = await getQuestionnaireSummary(pitchDeckId);

    const prompt = `You are a skeptical VC investor reviewing this pitch.

BUSINESS: ${summary.responses.company_name}
ONE-LINER: ${summary.responses.one_liner}
RAISE: £${deck.askAmount}

Generate 10 tough but fair questions you would ask this founder.

Return as JSON array:
["question 1", "question 2", ...]`;

    const response = await callClaudeAPI(prompt);

    try {
      return JSON.parse(response);
    } catch {
      return [];
    }
  } catch (error) {
    console.error('Error getting investor questions:', error);
    throw error;
  }
}

export default {
  getDeckFeedback,
  getSlideSuggestions,
  getInvestorQuestions
};
