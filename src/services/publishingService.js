/**
 * SUPERNova Book Writing Suite - Publishing Service
 *
 * Manages publishing preparation:
 * - Query letters
 * - Agent/publisher tracking
 * - Publishing checklists
 * - Manuscript export
 */

import wixData from 'wix-data';

// ============================================================================
// Configuration
// ============================================================================

const COLLECTIONS = {
  QUERY_LETTERS: 'QueryLetters',
  AGENT_PUBLISHERS: 'AgentPublishers',
  PUBLISHING_CHECKLISTS: 'PublishingChecklists',
  BOOK_PROJECTS: 'BookProjects',
  CHAPTERS: 'Chapters'
};

// ============================================================================
// Query Letter Operations
// ============================================================================

/**
 * Create query letter
 * @param {Object} queryInput - Query letter data
 * @returns {Promise<Object>} Created query letter
 */
export async function createQueryLetter(queryInput) {
  try {
    const now = new Date();

    const queryLetter = {
      bookProjectId: queryInput.bookProjectId,
      version: queryInput.version || 1,
      hook: queryInput.hook || '',
      bookDescription: queryInput.bookDescription || '',
      authorBio: queryInput.authorBio || '',
      comparableTitles: queryInput.comparableTitles || '',
      wordCount: queryInput.wordCount || 0,
      genre: queryInput.genre || '',
      status: 'draft',
      sentTo: null,
      sentDate: null,
      responseDate: null,
      notes: '',
      createdAt: now,
      updatedAt: now
    };

    const result = await wixData.insert(COLLECTIONS.QUERY_LETTERS, queryLetter);
    return result;
  } catch (error) {
    console.error('Error creating query letter:', error);
    throw new Error(`Failed to create query letter: ${error.message}`);
  }
}

/**
 * Get query letters for a book
 * @param {string} bookProjectId - Book project ID
 * @returns {Promise<Array>} Array of query letters
 */
export async function getQueryLetters(bookProjectId) {
  try {
    const results = await wixData.query(COLLECTIONS.QUERY_LETTERS)
      .eq('bookProjectId', bookProjectId)
      .descending('version')
      .find();

    return results.items;
  } catch (error) {
    console.error('Error getting query letters:', error);
    throw new Error(`Failed to get query letters: ${error.message}`);
  }
}

/**
 * Update query letter
 * @param {string} queryId - Query letter ID
 * @param {Object} updates - Update data
 * @returns {Promise<Object>} Updated query letter
 */
export async function updateQueryLetter(queryId, updates) {
  try {
    const queryLetter = await wixData.get(COLLECTIONS.QUERY_LETTERS, queryId);
    if (!queryLetter) {
      throw new Error('Query letter not found');
    }

    const updatedQuery = {
      ...queryLetter,
      ...updates,
      updatedAt: new Date()
    };

    const result = await wixData.update(COLLECTIONS.QUERY_LETTERS, updatedQuery);
    return result;
  } catch (error) {
    console.error('Error updating query letter:', error);
    throw new Error(`Failed to update query letter: ${error.message}`);
  }
}

/**
 * Mark query letter as sent
 * @param {string} queryId - Query letter ID
 * @param {string} agentName - Agent/publisher name
 * @returns {Promise<Object>} Updated query letter
 */
export async function markQueryAsSent(queryId, agentName) {
  try {
    return await updateQueryLetter(queryId, {
      status: 'sent',
      sentTo: agentName,
      sentDate: new Date()
    });
  } catch (error) {
    console.error('Error marking query as sent:', error);
    throw new Error(`Failed to mark query as sent: ${error.message}`);
  }
}

/**
 * Record query response
 * @param {string} queryId - Query letter ID
 * @param {string} status - Response status (rejected, accepted, requested)
 * @param {string} notes - Response notes
 * @returns {Promise<Object>} Updated query letter
 */
export async function recordQueryResponse(queryId, status, notes) {
  try {
    return await updateQueryLetter(queryId, {
      status,
      responseDate: new Date(),
      notes
    });
  } catch (error) {
    console.error('Error recording query response:', error);
    throw new Error(`Failed to record response: ${error.message}`);
  }
}

/**
 * Delete query letter
 * @param {string} queryId - Query letter ID
 * @returns {Promise<boolean>} Success status
 */
export async function deleteQueryLetter(queryId) {
  try {
    await wixData.remove(COLLECTIONS.QUERY_LETTERS, queryId);
    return true;
  } catch (error) {
    console.error('Error deleting query letter:', error);
    throw new Error(`Failed to delete query letter: ${error.message}`);
  }
}

// ============================================================================
// Agent/Publisher Operations
// ============================================================================

/**
 * Create agent/publisher contact
 * @param {Object} contactInput - Contact data
 * @returns {Promise<Object>} Created contact
 */
export async function createAgentPublisher(contactInput) {
  try {
    const now = new Date();

    const contact = {
      userId: contactInput.userId,
      name: contactInput.name,
      type: contactInput.type,
      agency: contactInput.agency || '',
      genres: contactInput.genres || [],
      submissionGuidelines: contactInput.submissionGuidelines || '',
      contactEmail: contactInput.contactEmail || '',
      website: contactInput.website || null,
      responseTime: contactInput.responseTime || '',
      manuscriptStatus: contactInput.manuscriptStatus || null,
      notes: contactInput.notes || '',
      lastContactDate: contactInput.lastContactDate || null,
      createdAt: now,
      updatedAt: now
    };

    const result = await wixData.insert(COLLECTIONS.AGENT_PUBLISHERS, contact);
    return result;
  } catch (error) {
    console.error('Error creating agent/publisher:', error);
    throw new Error(`Failed to create contact: ${error.message}`);
  }
}

/**
 * Get agent/publisher contacts for a user
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Array of contacts
 */
export async function getAgentPublishers(userId, options = {}) {
  try {
    let query = wixData.query(COLLECTIONS.AGENT_PUBLISHERS)
      .eq('userId', userId);

    if (options.type) {
      query = query.eq('type', options.type);
    }

    if (options.status) {
      query = query.eq('manuscriptStatus', options.status);
    }

    const results = await query
      .ascending('name')
      .find();

    return results.items;
  } catch (error) {
    console.error('Error getting agent/publishers:', error);
    throw new Error(`Failed to get contacts: ${error.message}`);
  }
}

/**
 * Update agent/publisher contact
 * @param {string} contactId - Contact ID
 * @param {Object} updates - Update data
 * @returns {Promise<Object>} Updated contact
 */
export async function updateAgentPublisher(contactId, updates) {
  try {
    const contact = await wixData.get(COLLECTIONS.AGENT_PUBLISHERS, contactId);
    if (!contact) {
      throw new Error('Contact not found');
    }

    const updatedContact = {
      ...contact,
      ...updates,
      updatedAt: new Date()
    };

    const result = await wixData.update(COLLECTIONS.AGENT_PUBLISHERS, updatedContact);
    return result;
  } catch (error) {
    console.error('Error updating agent/publisher:', error);
    throw new Error(`Failed to update contact: ${error.message}`);
  }
}

/**
 * Delete agent/publisher contact
 * @param {string} contactId - Contact ID
 * @returns {Promise<boolean>} Success status
 */
export async function deleteAgentPublisher(contactId) {
  try {
    await wixData.remove(COLLECTIONS.AGENT_PUBLISHERS, contactId);
    return true;
  } catch (error) {
    console.error('Error deleting agent/publisher:', error);
    throw new Error(`Failed to delete contact: ${error.message}`);
  }
}

/**
 * Search agents/publishers by genre
 * @param {string} userId - User ID
 * @param {string} genre - Genre to search for
 * @returns {Promise<Array>} Matching contacts
 */
export async function searchByGenre(userId, genre) {
  try {
    const results = await wixData.query(COLLECTIONS.AGENT_PUBLISHERS)
      .eq('userId', userId)
      .hasSome('genres', [genre])
      .find();

    return results.items;
  } catch (error) {
    console.error('Error searching by genre:', error);
    throw new Error(`Failed to search: ${error.message}`);
  }
}

// ============================================================================
// Publishing Checklist Operations
// ============================================================================

/**
 * Create publishing checklist item
 * @param {Object} itemInput - Checklist item data
 * @returns {Promise<Object>} Created checklist item
 */
export async function createChecklistItem(itemInput) {
  try {
    const now = new Date();

    const item = {
      bookProjectId: itemInput.bookProjectId,
      itemType: itemInput.itemType,
      description: itemInput.description,
      status: 'not_started',
      dueDate: itemInput.dueDate || null,
      notes: '',
      completedAt: null,
      createdAt: now,
      updatedAt: now
    };

    const result = await wixData.insert(COLLECTIONS.PUBLISHING_CHECKLISTS, item);
    return result;
  } catch (error) {
    console.error('Error creating checklist item:', error);
    throw new Error(`Failed to create checklist item: ${error.message}`);
  }
}

/**
 * Get publishing checklist for a book
 * @param {string} bookProjectId - Book project ID
 * @returns {Promise<Array>} Array of checklist items
 */
export async function getPublishingChecklist(bookProjectId) {
  try {
    const results = await wixData.query(COLLECTIONS.PUBLISHING_CHECKLISTS)
      .eq('bookProjectId', bookProjectId)
      .ascending('itemType')
      .find();

    return results.items;
  } catch (error) {
    console.error('Error getting publishing checklist:', error);
    throw new Error(`Failed to get checklist: ${error.message}`);
  }
}

/**
 * Update checklist item
 * @param {string} itemId - Checklist item ID
 * @param {Object} updates - Update data
 * @returns {Promise<Object>} Updated checklist item
 */
export async function updateChecklistItem(itemId, updates) {
  try {
    const item = await wixData.get(COLLECTIONS.PUBLISHING_CHECKLISTS, itemId);
    if (!item) {
      throw new Error('Checklist item not found');
    }

    const updatedItem = {
      ...item,
      ...updates,
      updatedAt: new Date()
    };

    // Set completion date if status changed to complete
    if (updates.status === 'complete' && item.status !== 'complete') {
      updatedItem.completedAt = new Date();
    }

    const result = await wixData.update(COLLECTIONS.PUBLISHING_CHECKLISTS, updatedItem);
    return result;
  } catch (error) {
    console.error('Error updating checklist item:', error);
    throw new Error(`Failed to update checklist item: ${error.message}`);
  }
}

/**
 * Delete checklist item
 * @param {string} itemId - Checklist item ID
 * @returns {Promise<boolean>} Success status
 */
export async function deleteChecklistItem(itemId) {
  try {
    await wixData.remove(COLLECTIONS.PUBLISHING_CHECKLISTS, itemId);
    return true;
  } catch (error) {
    console.error('Error deleting checklist item:', error);
    throw new Error(`Failed to delete checklist item: ${error.message}`);
  }
}

/**
 * Initialize default publishing checklist for a book
 * @param {string} bookProjectId - Book project ID
 * @returns {Promise<Array>} Created checklist items
 */
export async function initializeDefaultChecklist(bookProjectId) {
  try {
    const defaultItems = [
      { itemType: 'manuscript_format', description: 'Format manuscript to industry standards' },
      { itemType: 'proofreading', description: 'Complete final proofread' },
      { itemType: 'cover_design', description: 'Design or commission book cover' },
      { itemType: 'isbn', description: 'Obtain ISBN number' },
      { itemType: 'copyright', description: 'Register copyright' },
      { itemType: 'metadata', description: 'Prepare book metadata (description, keywords, categories)' },
      { itemType: 'author_bio', description: 'Write author biography' },
      { itemType: 'book_description', description: 'Write compelling book description' },
      { itemType: 'pricing', description: 'Determine pricing strategy' },
      { itemType: 'launch_plan', description: 'Create launch and marketing plan' }
    ];

    const createdItems = [];

    for (const itemData of defaultItems) {
      const item = await createChecklistItem({
        bookProjectId,
        ...itemData
      });
      createdItems.push(item);
    }

    return createdItems;
  } catch (error) {
    console.error('Error initializing checklist:', error);
    throw new Error(`Failed to initialize checklist: ${error.message}`);
  }
}

/**
 * Get publishing readiness score
 * @param {string} bookProjectId - Book project ID
 * @returns {Promise<Object>} Readiness assessment
 */
export async function getPublishingReadiness(bookProjectId) {
  try {
    const checklist = await getPublishingChecklist(bookProjectId);

    if (checklist.length === 0) {
      return {
        score: 0,
        totalItems: 0,
        completedItems: 0,
        percentage: 0,
        isReady: false
      };
    }

    const completedItems = checklist.filter(item => item.status === 'complete').length;
    const percentage = Math.round((completedItems / checklist.length) * 100);

    return {
      score: percentage,
      totalItems: checklist.length,
      completedItems,
      percentage,
      isReady: percentage >= 90 // 90% or higher is considered ready
    };
  } catch (error) {
    console.error('Error getting publishing readiness:', error);
    throw new Error(`Failed to get readiness: ${error.message}`);
  }
}

export default {
  // Query Letters
  createQueryLetter,
  getQueryLetters,
  updateQueryLetter,
  markQueryAsSent,
  recordQueryResponse,
  deleteQueryLetter,
  // Agents/Publishers
  createAgentPublisher,
  getAgentPublishers,
  updateAgentPublisher,
  deleteAgentPublisher,
  searchByGenre,
  // Publishing Checklist
  createChecklistItem,
  getPublishingChecklist,
  updateChecklistItem,
  deleteChecklistItem,
  initializeDefaultChecklist,
  getPublishingReadiness
};
