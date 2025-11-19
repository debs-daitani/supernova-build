/**
 * SUPERNova Pitch Deck Generator - Slide Service
 *
 * Manages pitch slides:
 * - Slide CRUD operations
 * - Reordering
 * - Content editing
 * - Layout management
 */

import wixData from 'wix-data';

const COLLECTIONS = {
  PITCH_SLIDES: 'PitchSlides',
  PITCH_DECKS: 'PitchDecks'
};

/**
 * Get all slides for a deck
 * @param {string} pitchDeckId - Pitch deck ID
 * @returns {Promise<Array>} Slides
 */
export async function getSlides(pitchDeckId) {
  try {
    const results = await wixData.query(COLLECTIONS.PITCH_SLIDES)
      .eq('pitchDeckId', pitchDeckId)
      .eq('isVisible', true)
      .ascending('slideNumber')
      .find();

    return results.items;
  } catch (error) {
    console.error('Error getting slides:', error);
    throw error;
  }
}

/**
 * Get a single slide
 * @param {string} slideId - Slide ID
 * @returns {Promise<Object>} Slide
 */
export async function getSlide(slideId) {
  try {
    return await wixData.get(COLLECTIONS.PITCH_SLIDES, slideId);
  } catch (error) {
    console.error('Error getting slide:', error);
    throw error;
  }
}

/**
 * Update slide
 * @param {string} slideId - Slide ID
 * @param {Object} updates - Updates
 * @returns {Promise<Object>} Updated slide
 */
export async function updateSlide(slideId, updates) {
  try {
    const slide = await getSlide(slideId);

    const updated = {
      ...slide,
      ...updates,
      updatedAt: new Date()
    };

    return await wixData.update(COLLECTIONS.PITCH_SLIDES, updated);
  } catch (error) {
    console.error('Error updating slide:', error);
    throw error;
  }
}

/**
 * Delete slide
 * @param {string} slideId - Slide ID
 * @returns {Promise<void>}
 */
export async function deleteSlide(slideId) {
  try {
    await wixData.remove(COLLECTIONS.PITCH_SLIDES, slideId);
  } catch (error) {
    console.error('Error deleting slide:', error);
    throw error;
  }
}

/**
 * Reorder slides
 * @param {string} pitchDeckId - Pitch deck ID
 * @param {Array} slideIds - Array of slide IDs in new order
 * @returns {Promise<Array>} Updated slides
 */
export async function reorderSlides(pitchDeckId, slideIds) {
  try {
    const updates = [];

    for (let i = 0; i < slideIds.length; i++) {
      const slide = await getSlide(slideIds[i]);
      slide.slideNumber = i + 1;
      await wixData.update(COLLECTIONS.PITCH_SLIDES, slide);
      updates.push(slide);
    }

    return updates;
  } catch (error) {
    console.error('Error reordering slides:', error);
    throw error;
  }
}

/**
 * Add chart to slide
 * @param {string} slideId - Slide ID
 * @param {Object} chartConfig - Chart configuration
 * @returns {Promise<Object>} Updated slide
 */
export async function addChart(slideId, chartConfig) {
  try {
    const slide = await getSlide(slideId);
    const charts = slide.charts || [];
    charts.push(chartConfig);

    return await updateSlide(slideId, { charts });
  } catch (error) {
    console.error('Error adding chart:', error);
    throw error;
  }
}

export default {
  getSlides,
  getSlide,
  updateSlide,
  deleteSlide,
  reorderSlides,
  addChart
};
