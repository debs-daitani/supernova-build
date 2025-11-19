/**
 * SUPERNova Pitch Deck Generator - Deck Management Service
 *
 * Manages pitch decks:
 * - Deck CRUD operations
 * - Deck types and configuration
 * - Sharing and collaboration
 * - Analytics tracking
 */

import wixData from 'wix-data';

// ============================================================================
// Configuration
// ============================================================================

const COLLECTIONS = {
  PITCH_DECKS: 'PitchDecks',
  PITCH_SLIDES: 'PitchSlides',
  PITCH_VERSIONS: 'PitchVersions'
};

const DECK_TYPES = {
  INVESTOR: 'investor',
  PARTNERSHIP: 'partnership',
  SALES: 'sales',
  CLIENT: 'client',
  INTERNAL: 'internal'
};

const STAGES = {
  PRE_SEED: 'pre_seed',
  SEED: 'seed',
  SERIES_A: 'series_a',
  SERIES_B: 'series_b',
  GROWTH: 'growth',
  ESTABLISHED: 'established'
};

const DESIGN_THEMES = {
  PROFESSIONAL: 'professional',
  BOLD: 'bold',
  MINIMAL: 'minimal',
  CREATIVE: 'creative',
  TECH: 'tech'
};

// ============================================================================
// Deck CRUD
// ============================================================================

/**
 * Create a new pitch deck
 * @param {string} userId - User ID
 * @param {Object} deckData - Deck data
 * @returns {Promise<Object>} Created deck
 */
export async function createDeck(userId, deckData) {
  try {
    const now = new Date();

    const deck = {
      userId,
      title: deckData.title || 'Untitled Pitch Deck',
      tagline: deckData.tagline || '',
      deckType: deckData.deckType || DECK_TYPES.INVESTOR,
      industry: deckData.industry || '',
      stage: deckData.stage || STAGES.SEED,
      status: 'questionnaire', // Start with questionnaire
      slides: [],
      designTheme: deckData.designTheme || DESIGN_THEMES.PROFESSIONAL,
      colorScheme: deckData.colorScheme || getDefaultColorScheme(DESIGN_THEMES.PROFESSIONAL),
      brandKitId: deckData.brandKitId || null,
      askAmount: deckData.askAmount || 0,
      useOfFunds: deckData.useOfFunds || {},
      targetAudience: deckData.targetAudience || '',
      presentationDate: deckData.presentationDate ? new Date(deckData.presentationDate) : null,
      slideCount: 0,
      shareLink: null,
      sharePassword: null,
      trackingEnabled: true,
      viewCount: 0,
      collaborators: [],
      lastEditedAt: now,
      lastEditedBy: userId,
      createdAt: now
    };

    const created = await wixData.insert(COLLECTIONS.PITCH_DECKS, deck);
    return created;
  } catch (error) {
    console.error('Error creating pitch deck:', error);
    throw new Error(`Failed to create deck: ${error.message}`);
  }
}

/**
 * Get default color scheme for theme
 * @param {string} theme - Design theme
 * @returns {Object} Color scheme
 */
function getDefaultColorScheme(theme) {
  const schemes = {
    professional: {
      primary: '#1E3A8A', // Navy blue
      secondary: '#64748B', // Slate gray
      accent: '#3B82F6', // Blue
      background: '#FFFFFF',
      text: '#1E293B'
    },
    bold: {
      primary: '#DC2626', // Red
      secondary: '#F59E0B', // Amber
      accent: '#8B5CF6', // Purple
      background: '#111827',
      text: '#F9FAFB'
    },
    minimal: {
      primary: '#000000', // Black
      secondary: '#6B7280', // Gray
      accent: '#10B981', // Green
      background: '#FFFFFF',
      text: '#111827'
    },
    creative: {
      primary: '#EC4899', // Pink
      secondary: '#8B5CF6', // Purple
      accent: '#F59E0B', // Amber
      background: '#FFF7ED',
      text: '#78350F'
    },
    tech: {
      primary: '#06B6D4', // Cyan
      secondary: '#6366F1', // Indigo
      accent: '#10B981', // Green
      background: '#0F172A',
      text: '#F1F5F9'
    }
  };

  return schemes[theme] || schemes.professional;
}

/**
 * Get user's pitch decks
 * @param {string} userId - User ID
 * @param {Object} filters - Filter options
 * @returns {Promise<Array>} Pitch decks
 */
export async function getDecks(userId, filters = {}) {
  try {
    let query = wixData.query(COLLECTIONS.PITCH_DECKS)
      .eq('userId', userId);

    if (filters.deckType) {
      query = query.eq('deckType', filters.deckType);
    }

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    query = query.descending('lastEditedAt');

    const results = await query.find();
    return results.items;
  } catch (error) {
    console.error('Error getting pitch decks:', error);
    throw error;
  }
}

/**
 * Get a single pitch deck
 * @param {string} deckId - Deck ID
 * @returns {Promise<Object>} Pitch deck
 */
export async function getDeck(deckId) {
  try {
    const deck = await wixData.get(COLLECTIONS.PITCH_DECKS, deckId);
    return deck;
  } catch (error) {
    console.error('Error getting pitch deck:', error);
    throw error;
  }
}

/**
 * Update pitch deck
 * @param {string} deckId - Deck ID
 * @param {Object} updates - Updates
 * @param {string} userId - User making the update
 * @returns {Promise<Object>} Updated deck
 */
export async function updateDeck(deckId, updates, userId) {
  try {
    const deck = await getDeck(deckId);

    const updatedDeck = {
      ...deck,
      ...updates,
      lastEditedAt: new Date(),
      lastEditedBy: userId
    };

    const result = await wixData.update(COLLECTIONS.PITCH_DECKS, updatedDeck);
    return result;
  } catch (error) {
    console.error('Error updating pitch deck:', error);
    throw error;
  }
}

/**
 * Delete pitch deck
 * @param {string} deckId - Deck ID
 * @returns {Promise<void>}
 */
export async function deleteDeck(deckId) {
  try {
    // Delete all slides
    const slides = await wixData.query(COLLECTIONS.PITCH_SLIDES)
      .eq('pitchDeckId', deckId)
      .find();

    for (const slide of slides.items) {
      await wixData.remove(COLLECTIONS.PITCH_SLIDES, slide._id);
    }

    // Delete all versions
    const versions = await wixData.query(COLLECTIONS.PITCH_VERSIONS)
      .eq('pitchDeckId', deckId)
      .find();

    for (const version of versions.items) {
      await wixData.remove(COLLECTIONS.PITCH_VERSIONS, version._id);
    }

    // Delete deck
    await wixData.remove(COLLECTIONS.PITCH_DECKS, deckId);
  } catch (error) {
    console.error('Error deleting pitch deck:', error);
    throw error;
  }
}

// ============================================================================
// Design & Theming
// ============================================================================

/**
 * Update design theme
 * @param {string} deckId - Deck ID
 * @param {string} theme - Design theme
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Updated deck
 */
export async function updateDesignTheme(deckId, theme, userId) {
  try {
    const colorScheme = getDefaultColorScheme(theme);

    return await updateDeck(deckId, {
      designTheme: theme,
      colorScheme
    }, userId);
  } catch (error) {
    console.error('Error updating design theme:', error);
    throw error;
  }
}

/**
 * Update color scheme
 * @param {string} deckId - Deck ID
 * @param {Object} colorScheme - Color scheme
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Updated deck
 */
export async function updateColorScheme(deckId, colorScheme, userId) {
  try {
    return await updateDeck(deckId, { colorScheme }, userId);
  } catch (error) {
    console.error('Error updating color scheme:', error);
    throw error;
  }
}

// ============================================================================
// Sharing & Collaboration
// ============================================================================

/**
 * Generate shareable link
 * @param {string} deckId - Deck ID
 * @param {Object} options - Sharing options
 * @returns {Promise<Object>} Share link info
 */
export async function generateShareLink(deckId, options = {}) {
  try {
    const shareId = generateUniqueId();
    const shareLink = `${options.baseUrl || ''}/pitch/${shareId}`;

    await updateDeck(deckId, {
      shareLink,
      sharePassword: options.password || null,
      trackingEnabled: options.trackingEnabled !== false
    }, options.userId);

    return {
      shareLink,
      shareId,
      hasPassword: !!options.password,
      trackingEnabled: options.trackingEnabled !== false
    };
  } catch (error) {
    console.error('Error generating share link:', error);
    throw error;
  }
}

/**
 * Generate unique ID
 * @returns {string} Unique ID
 */
function generateUniqueId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Track deck view
 * @param {string} deckId - Deck ID
 * @param {Object} viewData - View data (viewer IP, time, etc.)
 * @returns {Promise<Object>} Updated deck
 */
export async function trackView(deckId, viewData = {}) {
  try {
    const deck = await getDeck(deckId);

    if (!deck.trackingEnabled) {
      return deck;
    }

    // Increment view count
    const viewCount = (deck.viewCount || 0) + 1;

    // Store view data (in production, use separate analytics collection)
    // For now, just increment counter

    return await wixData.update(COLLECTIONS.PITCH_DECKS, {
      ...deck,
      viewCount
    });
  } catch (error) {
    console.error('Error tracking view:', error);
    throw error;
  }
}

/**
 * Add collaborator
 * @param {string} deckId - Deck ID
 * @param {string} collaboratorId - User ID to add
 * @param {string} userId - User adding collaborator
 * @returns {Promise<Object>} Updated deck
 */
export async function addCollaborator(deckId, collaboratorId, userId) {
  try {
    const deck = await getDeck(deckId);
    const collaborators = deck.collaborators || [];

    if (!collaborators.includes(collaboratorId)) {
      collaborators.push(collaboratorId);
    }

    return await updateDeck(deckId, { collaborators }, userId);
  } catch (error) {
    console.error('Error adding collaborator:', error);
    throw error;
  }
}

/**
 * Remove collaborator
 * @param {string} deckId - Deck ID
 * @param {string} collaboratorId - User ID to remove
 * @param {string} userId - User removing collaborator
 * @returns {Promise<Object>} Updated deck
 */
export async function removeCollaborator(deckId, collaboratorId, userId) {
  try {
    const deck = await getDeck(deckId);
    const collaborators = (deck.collaborators || []).filter(id => id !== collaboratorId);

    return await updateDeck(deckId, { collaborators }, userId);
  } catch (error) {
    console.error('Error removing collaborator:', error);
    throw error;
  }
}

// ============================================================================
// Status Management
// ============================================================================

/**
 * Update deck status
 * @param {string} deckId - Deck ID
 * @param {string} status - New status
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Updated deck
 */
export async function updateStatus(deckId, status, userId) {
  try {
    return await updateDeck(deckId, { status }, userId);
  } catch (error) {
    console.error('Error updating status:', error);
    throw error;
  }
}

/**
 * Mark deck as final
 * @param {string} deckId - Deck ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Updated deck
 */
export async function markAsFinal(deckId, userId) {
  try {
    return await updateStatus(deckId, 'final', userId);
  } catch (error) {
    console.error('Error marking as final:', error);
    throw error;
  }
}

// ============================================================================
// Statistics
// ============================================================================

/**
 * Get deck statistics
 * @param {string} deckId - Deck ID
 * @returns {Promise<Object>} Deck statistics
 */
export async function getDeckStats(deckId) {
  try {
    const deck = await getDeck(deckId);

    const slides = await wixData.query(COLLECTIONS.PITCH_SLIDES)
      .eq('pitchDeckId', deckId)
      .find();

    const versions = await wixData.query(COLLECTIONS.PITCH_VERSIONS)
      .eq('pitchDeckId', deckId)
      .find();

    return {
      slideCount: slides.items.length,
      versionCount: versions.items.length,
      viewCount: deck.viewCount || 0,
      collaboratorCount: (deck.collaborators || []).length,
      lastEdited: deck.lastEditedAt,
      created: deck.createdAt,
      status: deck.status
    };
  } catch (error) {
    console.error('Error getting deck stats:', error);
    throw error;
  }
}

export default {
  createDeck,
  getDecks,
  getDeck,
  updateDeck,
  deleteDeck,
  updateDesignTheme,
  updateColorScheme,
  generateShareLink,
  trackView,
  addCollaborator,
  removeCollaborator,
  updateStatus,
  markAsFinal,
  getDeckStats,
  DECK_TYPES,
  STAGES,
  DESIGN_THEMES
};
