/**
 * SUPERNova Book Writing Suite - Fiction Tools Service
 *
 * Manages fiction-specific tools:
 * - World building elements
 * - Plot threads
 * - Timelines and chronology
 * - Story structure
 */

import wixData from 'wix-data';

// ============================================================================
// Configuration
// ============================================================================

const COLLECTIONS = {
  WORLD_BUILDING: 'WorldBuilding',
  PLOT_THREADS: 'PlotThreads',
  TIMELINES: 'Timelines',
  CHARACTERS: 'Characters',
  CHAPTERS: 'Chapters'
};

// ============================================================================
// World Building Operations
// ============================================================================

/**
 * Create world building element
 * @param {Object} elementInput - Element data
 * @returns {Promise<Object>} Created element
 */
export async function createWorldElement(elementInput) {
  try {
    const now = new Date();

    const element = {
      bookProjectId: elementInput.bookProjectId,
      category: elementInput.category,
      name: elementInput.name,
      description: elementInput.description || '',
      rules: elementInput.rules || '',
      significance: elementInput.significance || '',
      relatedCharacters: elementInput.relatedCharacters || [],
      relatedEvents: elementInput.relatedEvents || [],
      images: elementInput.images || [],
      createdAt: now,
      updatedAt: now
    };

    const result = await wixData.insert(COLLECTIONS.WORLD_BUILDING, element);
    return result;
  } catch (error) {
    console.error('Error creating world element:', error);
    throw new Error(`Failed to create world element: ${error.message}`);
  }
}

/**
 * Get world building elements for a project
 * @param {string} bookProjectId - Book project ID
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Array of world building elements
 */
export async function getWorldElements(bookProjectId, options = {}) {
  try {
    let query = wixData.query(COLLECTIONS.WORLD_BUILDING)
      .eq('bookProjectId', bookProjectId);

    if (options.category) {
      query = query.eq('category', options.category);
    }

    const results = await query
      .ascending('name')
      .find();

    return results.items;
  } catch (error) {
    console.error('Error getting world elements:', error);
    throw new Error(`Failed to get world elements: ${error.message}`);
  }
}

/**
 * Update world building element
 * @param {string} elementId - Element ID
 * @param {Object} updates - Update data
 * @returns {Promise<Object>} Updated element
 */
export async function updateWorldElement(elementId, updates) {
  try {
    const element = await wixData.get(COLLECTIONS.WORLD_BUILDING, elementId);
    if (!element) {
      throw new Error('World element not found');
    }

    const updatedElement = {
      ...element,
      ...updates,
      updatedAt: new Date()
    };

    const result = await wixData.update(COLLECTIONS.WORLD_BUILDING, updatedElement);
    return result;
  } catch (error) {
    console.error('Error updating world element:', error);
    throw new Error(`Failed to update world element: ${error.message}`);
  }
}

/**
 * Delete world building element
 * @param {string} elementId - Element ID
 * @returns {Promise<boolean>} Success status
 */
export async function deleteWorldElement(elementId) {
  try {
    await wixData.remove(COLLECTIONS.WORLD_BUILDING, elementId);
    return true;
  } catch (error) {
    console.error('Error deleting world element:', error);
    throw new Error(`Failed to delete world element: ${error.message}`);
  }
}

// ============================================================================
// Plot Thread Operations
// ============================================================================

/**
 * Create plot thread
 * @param {Object} threadInput - Thread data
 * @returns {Promise<Object>} Created thread
 */
export async function createPlotThread(threadInput) {
  try {
    const now = new Date();

    const thread = {
      bookProjectId: threadInput.bookProjectId,
      name: threadInput.name,
      type: threadInput.type || 'subplot',
      description: threadInput.description || '',
      startChapter: threadInput.startChapter || null,
      endChapter: threadInput.endChapter || null,
      status: threadInput.status || 'active',
      relatedCharacters: threadInput.relatedCharacters || [],
      keyEvents: threadInput.keyEvents || [],
      resolution: threadInput.resolution || '',
      createdAt: now,
      updatedAt: now
    };

    const result = await wixData.insert(COLLECTIONS.PLOT_THREADS, thread);
    return result;
  } catch (error) {
    console.error('Error creating plot thread:', error);
    throw new Error(`Failed to create plot thread: ${error.message}`);
  }
}

/**
 * Get plot threads for a project
 * @param {string} bookProjectId - Book project ID
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Array of plot threads
 */
export async function getPlotThreads(bookProjectId, options = {}) {
  try {
    let query = wixData.query(COLLECTIONS.PLOT_THREADS)
      .eq('bookProjectId', bookProjectId);

    if (options.type) {
      query = query.eq('type', options.type);
    }

    if (options.status) {
      query = query.eq('status', options.status);
    }

    const results = await query
      .ascending('name')
      .find();

    return results.items;
  } catch (error) {
    console.error('Error getting plot threads:', error);
    throw new Error(`Failed to get plot threads: ${error.message}`);
  }
}

/**
 * Update plot thread
 * @param {string} threadId - Thread ID
 * @param {Object} updates - Update data
 * @returns {Promise<Object>} Updated thread
 */
export async function updatePlotThread(threadId, updates) {
  try {
    const thread = await wixData.get(COLLECTIONS.PLOT_THREADS, threadId);
    if (!thread) {
      throw new Error('Plot thread not found');
    }

    const updatedThread = {
      ...thread,
      ...updates,
      updatedAt: new Date()
    };

    const result = await wixData.update(COLLECTIONS.PLOT_THREADS, updatedThread);
    return result;
  } catch (error) {
    console.error('Error updating plot thread:', error);
    throw new Error(`Failed to update plot thread: ${error.message}`);
  }
}

/**
 * Delete plot thread
 * @param {string} threadId - Thread ID
 * @returns {Promise<boolean>} Success status
 */
export async function deletePlotThread(threadId) {
  try {
    await wixData.remove(COLLECTIONS.PLOT_THREADS, threadId);
    return true;
  } catch (error) {
    console.error('Error deleting plot thread:', error);
    throw new Error(`Failed to delete plot thread: ${error.message}`);
  }
}

/**
 * Get plot thread visualization data
 * @param {string} bookProjectId - Book project ID
 * @returns {Promise<Object>} Visualization data
 */
export async function getPlotThreadVisualization(bookProjectId) {
  try {
    const threads = await getPlotThreads(bookProjectId);
    const chapters = await wixData.query(COLLECTIONS.CHAPTERS)
      .eq('bookProjectId', bookProjectId)
      .ascending('chapterNumber')
      .find();

    // Map threads to chapters
    const visualization = threads.map(thread => ({
      id: thread._id,
      name: thread.name,
      type: thread.type,
      status: thread.status,
      startChapter: thread.startChapter,
      endChapter: thread.endChapter,
      chaptersSpanned: thread.endChapter - thread.startChapter + 1
    }));

    return {
      threads: visualization,
      totalChapters: chapters.items.length
    };
  } catch (error) {
    console.error('Error getting plot thread visualization:', error);
    throw new Error(`Failed to get visualization: ${error.message}`);
  }
}

// ============================================================================
// Timeline Operations
// ============================================================================

/**
 * Create timeline event
 * @param {Object} eventInput - Event data
 * @returns {Promise<Object>} Created event
 */
export async function createTimelineEvent(eventInput) {
  try {
    const now = new Date();

    const event = {
      bookProjectId: eventInput.bookProjectId,
      eventName: eventInput.eventName,
      eventDate: eventInput.eventDate || '',
      chapterId: eventInput.chapterId || null,
      sceneId: eventInput.sceneId || null,
      description: eventInput.description || '',
      involvedCharacters: eventInput.involvedCharacters || [],
      significance: eventInput.significance || '',
      createdAt: now,
      updatedAt: now
    };

    const result = await wixData.insert(COLLECTIONS.TIMELINES, event);
    return result;
  } catch (error) {
    console.error('Error creating timeline event:', error);
    throw new Error(`Failed to create timeline event: ${error.message}`);
  }
}

/**
 * Get timeline events for a project
 * @param {string} bookProjectId - Book project ID
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Array of timeline events
 */
export async function getTimelineEvents(bookProjectId, options = {}) {
  try {
    let query = wixData.query(COLLECTIONS.TIMELINES)
      .eq('bookProjectId', bookProjectId);

    if (options.chapterId) {
      query = query.eq('chapterId', options.chapterId);
    }

    // Sort by event date if available, otherwise by creation date
    const results = await query
      .ascending('eventDate')
      .find();

    return results.items;
  } catch (error) {
    console.error('Error getting timeline events:', error);
    throw new Error(`Failed to get timeline events: ${error.message}`);
  }
}

/**
 * Update timeline event
 * @param {string} eventId - Event ID
 * @param {Object} updates - Update data
 * @returns {Promise<Object>} Updated event
 */
export async function updateTimelineEvent(eventId, updates) {
  try {
    const event = await wixData.get(COLLECTIONS.TIMELINES, eventId);
    if (!event) {
      throw new Error('Timeline event not found');
    }

    const updatedEvent = {
      ...event,
      ...updates,
      updatedAt: new Date()
    };

    const result = await wixData.update(COLLECTIONS.TIMELINES, updatedEvent);
    return result;
  } catch (error) {
    console.error('Error updating timeline event:', error);
    throw new Error(`Failed to update timeline event: ${error.message}`);
  }
}

/**
 * Delete timeline event
 * @param {string} eventId - Event ID
 * @returns {Promise<boolean>} Success status
 */
export async function deleteTimelineEvent(eventId) {
  try {
    await wixData.remove(COLLECTIONS.TIMELINES, eventId);
    return true;
  } catch (error) {
    console.error('Error deleting timeline event:', error);
    throw new Error(`Failed to delete timeline event: ${error.message}`);
  }
}

/**
 * Check timeline consistency
 * @param {string} bookProjectId - Book project ID
 * @returns {Promise<Object>} Consistency check results
 */
export async function checkTimelineConsistency(bookProjectId) {
  try {
    const events = await getTimelineEvents(bookProjectId);
    const chapters = await wixData.query(COLLECTIONS.CHAPTERS)
      .eq('bookProjectId', bookProjectId)
      .ascending('chapterNumber')
      .find();

    const issues = [];

    // Check for events with same date in different chapters
    const dateMap = new Map();

    events.forEach(event => {
      if (event.eventDate) {
        if (!dateMap.has(event.eventDate)) {
          dateMap.set(event.eventDate, []);
        }
        dateMap.get(event.eventDate).push(event);
      }
    });

    // Look for potential conflicts
    dateMap.forEach((eventsAtDate, date) => {
      if (eventsAtDate.length > 1) {
        // Check if events at same date happen in different chapters
        const chapterIds = new Set(eventsAtDate.map(e => e.chapterId).filter(Boolean));

        if (chapterIds.size > 1) {
          // Check if characters are involved in multiple events simultaneously
          const characterMap = new Map();

          eventsAtDate.forEach(event => {
            if (event.involvedCharacters) {
              event.involvedCharacters.forEach(charId => {
                if (!characterMap.has(charId)) {
                  characterMap.set(charId, []);
                }
                characterMap.get(charId).push(event);
              });
            }
          });

          characterMap.forEach((charEvents, charId) => {
            if (charEvents.length > 1) {
              issues.push({
                type: 'character_in_multiple_places',
                severity: 'high',
                characterId: charId,
                date: date,
                events: charEvents.map(e => ({
                  eventName: e.eventName,
                  chapterId: e.chapterId
                }))
              });
            }
          });
        }
      }
    });

    return {
      totalEvents: events.length,
      issues,
      isConsistent: issues.length === 0
    };
  } catch (error) {
    console.error('Error checking timeline consistency:', error);
    throw new Error(`Failed to check consistency: ${error.message}`);
  }
}

export default {
  // World Building
  createWorldElement,
  getWorldElements,
  updateWorldElement,
  deleteWorldElement,
  // Plot Threads
  createPlotThread,
  getPlotThreads,
  updatePlotThread,
  deletePlotThread,
  getPlotThreadVisualization,
  // Timeline
  createTimelineEvent,
  getTimelineEvents,
  updateTimelineEvent,
  deleteTimelineEvent,
  checkTimelineConsistency
};
