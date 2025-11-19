/**
 * SUPERNova Pitch Deck Generator - Questionnaire Service
 *
 * Manages interactive questionnaire:
 * - Conversational question flow
 * - Adaptive questions based on answers
 * - Progress tracking
 * - Response management
 */

import wixData from 'wix-data';
import { getDeck } from './pitchDeckService';

// ============================================================================
// Configuration
// ============================================================================

const COLLECTIONS = {
  PITCH_QUESTIONNAIRES: 'PitchQuestionnaires',
  PITCH_DECKS: 'PitchDecks'
};

// Question sets for different deck types
const INVESTOR_QUESTIONS = [
  { id: 'company_name', question: "Let's start with the basics. What's your company called?", category: 'business' },
  { id: 'one_liner', question: "Great! In one sentence, what does {company_name} do?", category: 'business' },
  { id: 'problem', question: "Perfect. Now, why does this matter? What pain are your customers experiencing?", category: 'problem' },
  { id: 'problem_scope', question: "How big is this problem? How many people/businesses face this?", category: 'problem' },
  { id: 'solution', question: "So how does {company_name} solve this?", category: 'solution' },
  { id: 'how_it_works', question: "Can you explain how it works in simple terms?", category: 'solution' },
  { id: 'secret_sauce', question: "What makes your solution unique? Your secret sauce?", category: 'solution' },
  { id: 'why_now', question: "Why is now the perfect time for this solution?", category: 'timing' },
  { id: 'market_size', question: "How big is the market? (TAM, SAM, SOM if you know them)", category: 'market' },
  { id: 'target_customer', question: "Who is your ideal customer? Be specific.", category: 'market' },
  { id: 'business_model', question: "How do you make money?", category: 'business_model' },
  { id: 'pricing', question: "What's your pricing?", category: 'business_model' },
  { id: 'unit_economics', question: "What are your unit economics? (CAC, LTV, margins)", category: 'business_model' },
  { id: 'traction', question: "What traction have you achieved so far?", category: 'traction' },
  { id: 'metrics', question: "What are your key metrics? (revenue, users, growth rate)", category: 'traction' },
  { id: 'competition', question: "Who are your main competitors?", category: 'competition' },
  { id: 'differentiation', question: "What makes you different from them?", category: 'competition' },
  { id: 'go_to_market', question: "How will you acquire customers?", category: 'gtm' },
  { id: 'team', question: "Tell me about your team. Who are the founders and key members?", category: 'team' },
  { id: 'financials', question: "What are your financial projections for the next 3-5 years?", category: 'financials' },
  { id: 'raise_amount', question: "How much are you raising?", category: 'ask' },
  { id: 'use_of_funds', question: "What will you use the funds for?", category: 'ask' },
  { id: 'milestones', question: "What milestones will this funding help you achieve?", category: 'ask' }
];

// ============================================================================
// Questionnaire Management
// ============================================================================

/**
 * Create questionnaire for deck
 * @param {string} pitchDeckId - Pitch deck ID
 * @param {string} deckType - Deck type
 * @returns {Promise<Object>} Created questionnaire
 */
export async function createQuestionnaire(pitchDeckId, deckType) {
  try {
    const questions = getQuestionsForDeckType(deckType);

    const questionnaire = {
      pitchDeckId,
      deckType,
      responses: {},
      currentQuestionIndex: 0,
      totalQuestions: questions.length,
      completionPercentage: 0,
      conversationFlow: [],
      skippedQuestions: [],
      adaptiveQuestions: [],
      isComplete: false,
      completedAt: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const created = await wixData.insert(COLLECTIONS.PITCH_QUESTIONNAIRES, questionnaire);
    return created;
  } catch (error) {
    console.error('Error creating questionnaire:', error);
    throw new Error(`Failed to create questionnaire: ${error.message}`);
  }
}

/**
 * Get questions for deck type
 * @param {string} deckType - Deck type
 * @returns {Array} Questions
 */
function getQuestionsForDeckType(deckType) {
  // For now, return investor questions
  // In production, customize based on deck type
  return INVESTOR_QUESTIONS;
}

/**
 * Get questionnaire
 * @param {string} pitchDeckId - Pitch deck ID
 * @returns {Promise<Object>} Questionnaire
 */
export async function getQuestionnaire(pitchDeckId) {
  try {
    const results = await wixData.query(COLLECTIONS.PITCH_QUESTIONNAIRES)
      .eq('pitchDeckId', pitchDeckId)
      .find();

    return results.items.length > 0 ? results.items[0] : null;
  } catch (error) {
    console.error('Error getting questionnaire:', error);
    throw error;
  }
}

/**
 * Get current question
 * @param {string} pitchDeckId - Pitch deck ID
 * @returns {Promise<Object>} Current question and context
 */
export async function getCurrentQuestion(pitchDeckId) {
  try {
    const questionnaire = await getQuestionnaire(pitchDeckId);

    if (!questionnaire) {
      throw new Error('Questionnaire not found');
    }

    if (questionnaire.isComplete) {
      return {
        isComplete: true,
        message: 'Questionnaire completed!'
      };
    }

    const questions = getQuestionsForDeckType(questionnaire.deckType);
    const currentIndex = questionnaire.currentQuestionIndex;

    if (currentIndex >= questions.length) {
      return {
        isComplete: true,
        message: 'All questions answered!'
      };
    }

    const question = questions[currentIndex];

    // Replace placeholders with previous answers
    const questionText = replacePlaceholders(question.question, questionnaire.responses);

    return {
      questionId: question.id,
      question: questionText,
      category: question.category,
      questionNumber: currentIndex + 1,
      totalQuestions: questions.length,
      progress: Math.round((currentIndex / questions.length) * 100),
      canSkip: true
    };
  } catch (error) {
    console.error('Error getting current question:', error);
    throw error;
  }
}

/**
 * Replace placeholders in question text
 * @param {string} text - Question text
 * @param {Object} responses - Previous responses
 * @returns {string} Text with placeholders replaced
 */
function replacePlaceholders(text, responses) {
  let result = text;

  Object.keys(responses).forEach(key => {
    const placeholder = `{${key}}`;
    if (result.includes(placeholder)) {
      result = result.replace(placeholder, responses[key]);
    }
  });

  return result;
}

/**
 * Submit answer
 * @param {string} pitchDeckId - Pitch deck ID
 * @param {string} questionId - Question ID
 * @param {string} answer - User's answer
 * @returns {Promise<Object>} Updated questionnaire
 */
export async function submitAnswer(pitchDeckId, questionId, answer) {
  try {
    const questionnaire = await getQuestionnaire(pitchDeckId);

    if (!questionnaire) {
      throw new Error('Questionnaire not found');
    }

    // Store answer
    const responses = questionnaire.responses || {};
    responses[questionId] = answer;

    // Add to conversation flow
    const conversationFlow = questionnaire.conversationFlow || [];
    const questions = getQuestionsForDeckType(questionnaire.deckType);
    const question = questions.find(q => q.id === questionId);

    conversationFlow.push({
      questionId,
      question: question.question,
      answer,
      timestamp: new Date()
    });

    // Move to next question
    const currentIndex = questionnaire.currentQuestionIndex + 1;
    const completionPercentage = Math.round((currentIndex / questions.length) * 100);
    const isComplete = currentIndex >= questions.length;

    const updated = {
      ...questionnaire,
      responses,
      conversationFlow,
      currentQuestionIndex: currentIndex,
      completionPercentage,
      isComplete,
      completedAt: isComplete ? new Date() : null,
      updatedAt: new Date()
    };

    const result = await wixData.update(COLLECTIONS.PITCH_QUESTIONNAIRES, updated);

    return result;
  } catch (error) {
    console.error('Error submitting answer:', error);
    throw error;
  }
}

/**
 * Skip question
 * @param {string} pitchDeckId - Pitch deck ID
 * @param {string} questionId - Question ID
 * @returns {Promise<Object>} Updated questionnaire
 */
export async function skipQuestion(pitchDeckId, questionId) {
  try {
    const questionnaire = await getQuestionnaire(pitchDeckId);

    if (!questionnaire) {
      throw new Error('Questionnaire not found');
    }

    const skippedQuestions = questionnaire.skippedQuestions || [];
    if (!skippedQuestions.includes(questionId)) {
      skippedQuestions.push(questionId);
    }

    // Move to next question
    const currentIndex = questionnaire.currentQuestionIndex + 1;
    const questions = getQuestionsForDeckType(questionnaire.deckType);
    const completionPercentage = Math.round((currentIndex / questions.length) * 100);

    const updated = {
      ...questionnaire,
      skippedQuestions,
      currentQuestionIndex: currentIndex,
      completionPercentage,
      updatedAt: new Date()
    };

    const result = await wixData.update(COLLECTIONS.PITCH_QUESTIONNAIRES, updated);

    return result;
  } catch (error) {
    console.error('Error skipping question:', error);
    throw error;
  }
}

/**
 * Go back to previous question
 * @param {string} pitchDeckId - Pitch deck ID
 * @returns {Promise<Object>} Updated questionnaire
 */
export async function goToPreviousQuestion(pitchDeckId) {
  try {
    const questionnaire = await getQuestionnaire(pitchDeckId);

    if (!questionnaire) {
      throw new Error('Questionnaire not found');
    }

    const currentIndex = Math.max(0, questionnaire.currentQuestionIndex - 1);
    const questions = getQuestionsForDeckType(questionnaire.deckType);
    const completionPercentage = Math.round((currentIndex / questions.length) * 100);

    const updated = {
      ...questionnaire,
      currentQuestionIndex: currentIndex,
      completionPercentage,
      updatedAt: new Date()
    };

    const result = await wixData.update(COLLECTIONS.PITCH_QUESTIONNAIRES, updated);

    return result;
  } catch (error) {
    console.error('Error going to previous question:', error);
    throw error;
  }
}

/**
 * Update existing answer
 * @param {string} pitchDeckId - Pitch deck ID
 * @param {string} questionId - Question ID
 * @param {string} newAnswer - New answer
 * @returns {Promise<Object>} Updated questionnaire
 */
export async function updateAnswer(pitchDeckId, questionId, newAnswer) {
  try {
    const questionnaire = await getQuestionnaire(pitchDeckId);

    if (!questionnaire) {
      throw new Error('Questionnaire not found');
    }

    const responses = questionnaire.responses || {};
    responses[questionId] = newAnswer;

    const updated = {
      ...questionnaire,
      responses,
      updatedAt: new Date()
    };

    const result = await wixData.update(COLLECTIONS.PITCH_QUESTIONNAIRES, updated);

    return result;
  } catch (error) {
    console.error('Error updating answer:', error);
    throw error;
  }
}

/**
 * Get questionnaire summary
 * @param {string} pitchDeckId - Pitch deck ID
 * @returns {Promise<Object>} Questionnaire summary
 */
export async function getQuestionnaireSummary(pitchDeckId) {
  try {
    const questionnaire = await getQuestionnaire(pitchDeckId);

    if (!questionnaire) {
      return null;
    }

    const questions = getQuestionsForDeckType(questionnaire.deckType);
    const answeredCount = Object.keys(questionnaire.responses || {}).length;
    const skippedCount = (questionnaire.skippedQuestions || []).length;

    return {
      totalQuestions: questions.length,
      answeredCount,
      skippedCount,
      completionPercentage: questionnaire.completionPercentage,
      isComplete: questionnaire.isComplete,
      responses: questionnaire.responses,
      conversationFlow: questionnaire.conversationFlow
    };
  } catch (error) {
    console.error('Error getting questionnaire summary:', error);
    throw error;
  }
}

export default {
  createQuestionnaire,
  getQuestionnaire,
  getCurrentQuestion,
  submitAnswer,
  skipQuestion,
  goToPreviousQuestion,
  updateAnswer,
  getQuestionnaireSummary
};
