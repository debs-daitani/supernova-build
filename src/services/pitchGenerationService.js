/**
 * SUPERNova Pitch Deck Generator - Generation Service
 *
 * Manages AI-powered deck generation:
 * - Generate deck from questionnaire responses
 * - Create slide content and structure
 * - Write compelling copy
 * - Structure narrative flow
 */

import wixData from 'wix-data';
import { fetch } from 'wix-fetch';
import { getDeck, updateDeck } from './pitchDeckService';
import { getQuestionnaireSummary } from './pitchQuestionnaireService';

// ============================================================================
// Configuration
// ============================================================================

const COLLECTIONS = {
  PITCH_SLIDES: 'PitchSlides'
};

// Claude API configuration
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const CLAUDE_API_KEY = 'YOUR_ANTHROPIC_API_KEY'; // Store in Wix Secrets
const CLAUDE_MODEL = 'claude-3-5-sonnet-20241022';

// ============================================================================
// Deck Generation
// ============================================================================

/**
 * Generate deck from questionnaire
 * @param {string} pitchDeckId - Pitch deck ID
 * @returns {Promise<Object>} Generated deck with slides
 */
export async function generateDeck(pitchDeckId) {
  try {
    // Update status
    await updateDeck(pitchDeckId, { status: 'generating' }, 'system');

    // Get questionnaire responses
    const summary = await getQuestionnaireSummary(pitchDeckId);

    if (!summary || !summary.isComplete) {
      throw new Error('Questionnaire must be completed before generating deck');
    }

    // Get deck info
    const deck = await getDeck(pitchDeckId);

    // Generate slide structure
    const slideStructure = getSlideStructure(deck.deckType);

    // Generate content for each slide using AI
    const slides = [];

    for (const slideTemplate of slideStructure) {
      const slideContent = await generateSlideContent(
        slideTemplate,
        summary.responses,
        deck
      );

      const slide = await createSlide(pitchDeckId, slideContent);
      slides.push(slide);
    }

    // Update deck
    await updateDeck(pitchDeckId, {
      status: 'draft',
      slideCount: slides.length,
      slides: slides.map(s => s._id)
    }, 'system');

    return {
      deckId: pitchDeckId,
      slideCount: slides.length,
      slides
    };
  } catch (error) {
    console.error('Error generating deck:', error);
    // Update status to draft so user can try again
    await updateDeck(pitchDeckId, { status: 'draft' }, 'system');
    throw new Error(`Failed to generate deck: ${error.message}`);
  }
}

/**
 * Get slide structure for deck type
 * @param {string} deckType - Deck type
 * @returns {Array} Slide templates
 */
function getSlideStructure(deckType) {
  // Standard investor deck structure
  return [
    { type: 'cover', title: 'Cover' },
    { type: 'hook', title: 'The Hook' },
    { type: 'problem', title: 'The Problem' },
    { type: 'solution', title: 'Our Solution' },
    { type: 'why_now', title: 'Why Now' },
    { type: 'market', title: 'Market Opportunity' },
    { type: 'product', title: 'Product' },
    { type: 'business_model', title: 'Business Model' },
    { type: 'traction', title: 'Traction' },
    { type: 'competition', title: 'Competition' },
    { type: 'gtm', title: 'Go-to-Market' },
    { type: 'team', title: 'Team' },
    { type: 'financials', title: 'Financials' },
    { type: 'ask', title: 'The Ask' },
    { type: 'vision', title: 'Vision' }
  ];
}

/**
 * Generate slide content using AI
 * @param {Object} slideTemplate - Slide template
 * @param {Object} responses - Questionnaire responses
 * @param {Object} deck - Deck info
 * @returns {Promise<Object>} Slide content
 */
async function generateSlideContent(slideTemplate, responses, deck) {
  try {
    const prompt = buildSlidePrompt(slideTemplate, responses, deck);

    // Call Claude API
    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.content[0].text;

    // Parse AI response into structured content
    return parseSlideContent(slideTemplate.type, content, responses);
  } catch (error) {
    console.error('Error generating slide content:', error);
    // Return fallback content
    return getFallbackContent(slideTemplate, responses);
  }
}

/**
 * Build prompt for AI
 * @param {Object} slideTemplate - Slide template
 * @param {Object} responses - Responses
 * @param {Object} deck - Deck info
 * @returns {string} Prompt
 */
function buildSlidePrompt(slideTemplate, responses, deck) {
  const context = JSON.stringify(responses, null, 2);

  return `You are an expert pitch deck consultant. Create compelling, investor-ready content for a ${slideTemplate.type} slide.

CONTEXT:
${context}

REQUIREMENTS:
- Write punchy, compelling copy (not boring corporate speak)
- Keep text concise (max 3-5 bullet points per slide)
- Focus on impact and benefits
- Use numbers and data when available
- Make it investor-friendly

OUTPUT FORMAT:
Return JSON with:
{
  "title": "slide title",
  "subtitle": "optional subtitle",
  "content": {
    "bullets": ["point 1", "point 2", "point 3"],
    "highlight": "key stat or quote",
    "data": {} // any relevant data for charts
  },
  "speakerNotes": "what to say when presenting this slide"
}

Generate content for ${slideTemplate.title} slide now:`;
}

/**
 * Parse AI response into slide content
 * @param {string} slideType - Slide type
 * @param {string} aiResponse - AI response
 * @param {Object} responses - Questionnaire responses
 * @returns {Object} Structured slide content
 */
function parseSlideContent(slideType, aiResponse, responses) {
  try {
    // Try to parse as JSON
    const parsed = JSON.parse(aiResponse);

    return {
      slideType,
      title: parsed.title || '',
      subtitle: parsed.subtitle || '',
      content: parsed.content || {},
      speakerNotes: parsed.speakerNotes || '',
      designLayout: getDefaultLayout(slideType)
    };
  } catch (error) {
    // If parsing fails, use fallback
    return getFallbackContent({ type: slideType }, responses);
  }
}

/**
 * Get fallback content if AI fails
 * @param {Object} slideTemplate - Slide template
 * @param {Object} responses - Responses
 * @returns {Object} Fallback content
 */
function getFallbackContent(slideTemplate, responses) {
  const fallbacks = {
    cover: {
      title: responses.company_name || 'Company Name',
      subtitle: responses.one_liner || 'Your tagline here',
      content: { companyName: responses.company_name },
      speakerNotes: 'Introduce yourself and your company'
    },
    problem: {
      title: 'The Problem',
      content: {
        bullets: [responses.problem || 'Problem description here']
      },
      speakerNotes: 'Explain the pain point your customers face'
    },
    solution: {
      title: 'Our Solution',
      content: {
        bullets: [responses.solution || 'Solution description here']
      },
      speakerNotes: 'Explain how your product solves the problem'
    }
  };

  const fallback = fallbacks[slideTemplate.type] || {
    title: slideTemplate.title,
    content: {},
    speakerNotes: ''
  };

  return {
    slideType: slideTemplate.type,
    ...fallback,
    designLayout: getDefaultLayout(slideTemplate.type)
  };
}

/**
 * Get default layout for slide type
 * @param {string} slideType - Slide type
 * @returns {string} Layout name
 */
function getDefaultLayout(slideType) {
  const layouts = {
    cover: 'centered',
    hook: 'centered_large',
    problem: 'title_bullets',
    solution: 'title_bullets',
    market: 'title_chart',
    traction: 'title_stats',
    team: 'title_grid',
    financials: 'title_chart'
  };

  return layouts[slideType] || 'title_content';
}

/**
 * Create slide in database
 * @param {string} pitchDeckId - Pitch deck ID
 * @param {Object} slideContent - Slide content
 * @returns {Promise<Object>} Created slide
 */
async function createSlide(pitchDeckId, slideContent) {
  try {
    // Get current slide count
    const existingSlides = await wixData.query(COLLECTIONS.PITCH_SLIDES)
      .eq('pitchDeckId', pitchDeckId)
      .find();

    const slideNumber = existingSlides.items.length + 1;

    const slide = {
      pitchDeckId,
      slideNumber,
      slideType: slideContent.slideType,
      title: slideContent.title || '',
      subtitle: slideContent.subtitle || '',
      content: slideContent.content || {},
      speakerNotes: slideContent.speakerNotes || '',
      designLayout: slideContent.designLayout || 'title_content',
      backgroundColor: null,
      textColor: null,
      imageUrls: [],
      charts: [],
      animations: [],
      duration: 60, // Default 60 seconds per slide
      isVisible: true,
      isLocked: false,
      comments: [],
      aiSuggestions: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const created = await wixData.insert(COLLECTIONS.PITCH_SLIDES, slide);
    return created;
  } catch (error) {
    console.error('Error creating slide:', error);
    throw error;
  }
}

/**
 * Regenerate specific slide
 * @param {string} slideId - Slide ID
 * @returns {Promise<Object>} Regenerated slide
 */
export async function regenerateSlide(slideId) {
  try {
    const slide = await wixData.get(COLLECTIONS.PITCH_SLIDES, slideId);
    const summary = await getQuestionnaireSummary(slide.pitchDeckId);
    const deck = await getDeck(slide.pitchDeckId);

    const slideTemplate = { type: slide.slideType, title: slide.title };

    const newContent = await generateSlideContent(
      slideTemplate,
      summary.responses,
      deck
    );

    const updated = {
      ...slide,
      ...newContent,
      updatedAt: new Date()
    };

    const result = await wixData.update(COLLECTIONS.PITCH_SLIDES, updated);
    return result;
  } catch (error) {
    console.error('Error regenerating slide:', error);
    throw error;
  }
}

export default {
  generateDeck,
  regenerateSlide
};
