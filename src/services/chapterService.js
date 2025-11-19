/**
 * SUPERNova Book Writing Suite - Chapter & Scene Service
 *
 * Manages chapters and scenes including:
 * - Chapter creation and management
 * - Scene organization
 * - Content editing
 * - Word count tracking
 */

import wixData from 'wix-data';
import { updateProjectWordCount } from './bookProjectService';

// ============================================================================
// Configuration
// ============================================================================

const COLLECTIONS = {
  CHAPTERS: 'Chapters',
  SCENES: 'Scenes',
  BOOK_PROJECTS: 'BookProjects'
};

// ============================================================================
// Chapter Operations
// ============================================================================

/**
 * Create a new chapter
 * @param {Object} chapterInput - Chapter data
 * @returns {Promise<Object>} Created chapter
 */
export async function createChapter(chapterInput) {
  try {
    const now = new Date();

    const chapter = {
      bookProjectId: chapterInput.bookProjectId,
      chapterNumber: chapterInput.chapterNumber,
      title: chapterInput.title || `Chapter ${chapterInput.chapterNumber}`,
      synopsis: chapterInput.synopsis || '',
      wordCount: 0,
      targetWordCount: chapterInput.targetWordCount || null,
      content: chapterInput.content || '',
      notes: chapterInput.notes || '',
      status: chapterInput.status || 'outline',
      povCharacterId: chapterInput.povCharacterId || null,
      setting: chapterInput.setting || '',
      createdAt: now,
      updatedAt: now
    };

    const result = await wixData.insert(COLLECTIONS.CHAPTERS, chapter);
    return result;
  } catch (error) {
    console.error('Error creating chapter:', error);
    throw new Error(`Failed to create chapter: ${error.message}`);
  }
}

/**
 * Get chapter by ID
 * @param {string} chapterId - Chapter ID
 * @returns {Promise<Object|null>} Chapter object
 */
export async function getChapter(chapterId) {
  try {
    const chapter = await wixData.get(COLLECTIONS.CHAPTERS, chapterId);
    return chapter;
  } catch (error) {
    console.error('Error getting chapter:', error);
    throw new Error(`Failed to get chapter: ${error.message}`);
  }
}

/**
 * Get all chapters for a book project
 * @param {string} bookProjectId - Book project ID
 * @returns {Promise<Array>} Array of chapters
 */
export async function getProjectChapters(bookProjectId) {
  try {
    const results = await wixData.query(COLLECTIONS.CHAPTERS)
      .eq('bookProjectId', bookProjectId)
      .ascending('chapterNumber')
      .find();

    return results.items;
  } catch (error) {
    console.error('Error getting project chapters:', error);
    throw new Error(`Failed to get chapters: ${error.message}`);
  }
}

/**
 * Update chapter
 * @param {string} chapterId - Chapter ID
 * @param {Object} updates - Update data
 * @returns {Promise<Object>} Updated chapter
 */
export async function updateChapter(chapterId, updates) {
  try {
    const chapter = await getChapter(chapterId);
    if (!chapter) {
      throw new Error('Chapter not found');
    }

    // Calculate word count if content was updated
    if (updates.content !== undefined) {
      updates.wordCount = countWords(updates.content);
    }

    const updatedChapter = {
      ...chapter,
      ...updates,
      updatedAt: new Date()
    };

    const result = await wixData.update(COLLECTIONS.CHAPTERS, updatedChapter);

    // Update project word count
    if (updates.content !== undefined || updates.wordCount !== undefined) {
      updateProjectWordCount(chapter.bookProjectId).catch(err => {
        console.error('Error updating project word count:', err);
      });
    }

    return result;
  } catch (error) {
    console.error('Error updating chapter:', error);
    throw new Error(`Failed to update chapter: ${error.message}`);
  }
}

/**
 * Delete chapter
 * @param {string} chapterId - Chapter ID
 * @returns {Promise<boolean>} Success status
 */
export async function deleteChapter(chapterId) {
  try {
    const chapter = await getChapter(chapterId);
    if (!chapter) {
      throw new Error('Chapter not found');
    }

    const bookProjectId = chapter.bookProjectId;

    // Delete all scenes in this chapter
    const scenes = await wixData.query(COLLECTIONS.SCENES)
      .eq('chapterId', chapterId)
      .find();

    for (const scene of scenes.items) {
      await wixData.remove(COLLECTIONS.SCENES, scene._id);
    }

    // Delete the chapter
    await wixData.remove(COLLECTIONS.CHAPTERS, chapterId);

    // Update project word count
    updateProjectWordCount(bookProjectId).catch(err => {
      console.error('Error updating project word count:', err);
    });

    return true;
  } catch (error) {
    console.error('Error deleting chapter:', error);
    throw new Error(`Failed to delete chapter: ${error.message}`);
  }
}

/**
 * Reorder chapters
 * @param {string} bookProjectId - Book project ID
 * @param {Array} chapterIds - Array of chapter IDs in new order
 * @returns {Promise<boolean>} Success status
 */
export async function reorderChapters(bookProjectId, chapterIds) {
  try {
    // Update each chapter with new number
    for (let i = 0; i < chapterIds.length; i++) {
      const chapter = await getChapter(chapterIds[i]);
      if (chapter && chapter.bookProjectId === bookProjectId) {
        chapter.chapterNumber = i + 1;
        chapter.updatedAt = new Date();
        await wixData.update(COLLECTIONS.CHAPTERS, chapter);
      }
    }

    return true;
  } catch (error) {
    console.error('Error reordering chapters:', error);
    throw new Error(`Failed to reorder chapters: ${error.message}`);
  }
}

// ============================================================================
// Scene Operations
// ============================================================================

/**
 * Create a new scene
 * @param {Object} sceneInput - Scene data
 * @returns {Promise<Object>} Created scene
 */
export async function createScene(sceneInput) {
  try {
    const now = new Date();

    const scene = {
      chapterId: sceneInput.chapterId,
      bookProjectId: sceneInput.bookProjectId,
      sceneNumber: sceneInput.sceneNumber,
      title: sceneInput.title || `Scene ${sceneInput.sceneNumber}`,
      setting: sceneInput.setting || '',
      characters: sceneInput.characters || [],
      purpose: sceneInput.purpose || '',
      conflict: sceneInput.conflict || '',
      resolution: sceneInput.resolution || '',
      wordCount: 0,
      content: sceneInput.content || '',
      notes: sceneInput.notes || '',
      status: sceneInput.status || 'outline',
      createdAt: now,
      updatedAt: now
    };

    const result = await wixData.insert(COLLECTIONS.SCENES, scene);
    return result;
  } catch (error) {
    console.error('Error creating scene:', error);
    throw new Error(`Failed to create scene: ${error.message}`);
  }
}

/**
 * Get scene by ID
 * @param {string} sceneId - Scene ID
 * @returns {Promise<Object|null>} Scene object
 */
export async function getScene(sceneId) {
  try {
    const scene = await wixData.get(COLLECTIONS.SCENES, sceneId);
    return scene;
  } catch (error) {
    console.error('Error getting scene:', error);
    throw new Error(`Failed to get scene: ${error.message}`);
  }
}

/**
 * Get all scenes for a chapter
 * @param {string} chapterId - Chapter ID
 * @returns {Promise<Array>} Array of scenes
 */
export async function getChapterScenes(chapterId) {
  try {
    const results = await wixData.query(COLLECTIONS.SCENES)
      .eq('chapterId', chapterId)
      .ascending('sceneNumber')
      .find();

    return results.items;
  } catch (error) {
    console.error('Error getting chapter scenes:', error);
    throw new Error(`Failed to get scenes: ${error.message}`);
  }
}

/**
 * Get all scenes for a book project
 * @param {string} bookProjectId - Book project ID
 * @returns {Promise<Array>} Array of scenes
 */
export async function getProjectScenes(bookProjectId) {
  try {
    const results = await wixData.query(COLLECTIONS.SCENES)
      .eq('bookProjectId', bookProjectId)
      .ascending('sceneNumber')
      .find();

    return results.items;
  } catch (error) {
    console.error('Error getting project scenes:', error);
    throw new Error(`Failed to get scenes: ${error.message}`);
  }
}

/**
 * Update scene
 * @param {string} sceneId - Scene ID
 * @param {Object} updates - Update data
 * @returns {Promise<Object>} Updated scene
 */
export async function updateScene(sceneId, updates) {
  try {
    const scene = await getScene(sceneId);
    if (!scene) {
      throw new Error('Scene not found');
    }

    // Calculate word count if content was updated
    if (updates.content !== undefined) {
      updates.wordCount = countWords(updates.content);
    }

    const updatedScene = {
      ...scene,
      ...updates,
      updatedAt: new Date()
    };

    const result = await wixData.update(COLLECTIONS.SCENES, updatedScene);
    return result;
  } catch (error) {
    console.error('Error updating scene:', error);
    throw new Error(`Failed to update scene: ${error.message}`);
  }
}

/**
 * Delete scene
 * @param {string} sceneId - Scene ID
 * @returns {Promise<boolean>} Success status
 */
export async function deleteScene(sceneId) {
  try {
    await wixData.remove(COLLECTIONS.SCENES, sceneId);
    return true;
  } catch (error) {
    console.error('Error deleting scene:', error);
    throw new Error(`Failed to delete scene: ${error.message}`);
  }
}

/**
 * Reorder scenes within a chapter
 * @param {string} chapterId - Chapter ID
 * @param {Array} sceneIds - Array of scene IDs in new order
 * @returns {Promise<boolean>} Success status
 */
export async function reorderScenes(chapterId, sceneIds) {
  try {
    for (let i = 0; i < sceneIds.length; i++) {
      const scene = await getScene(sceneIds[i]);
      if (scene && scene.chapterId === chapterId) {
        scene.sceneNumber = i + 1;
        scene.updatedAt = new Date();
        await wixData.update(COLLECTIONS.SCENES, scene);
      }
    }

    return true;
  } catch (error) {
    console.error('Error reordering scenes:', error);
    throw new Error(`Failed to reorder scenes: ${error.message}`);
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Count words in text
 * @param {string} text - Text to count
 * @returns {number} Word count
 */
function countWords(text) {
  if (!text) return 0;

  // Remove HTML tags if present
  const plainText = text.replace(/<[^>]*>/g, ' ');

  // Count words
  const words = plainText
    .trim()
    .split(/\s+/)
    .filter(word => word.length > 0);

  return words.length;
}

/**
 * Get chapter with scenes
 * @param {string} chapterId - Chapter ID
 * @returns {Promise<Object>} Chapter with scenes array
 */
export async function getChapterWithScenes(chapterId) {
  try {
    const chapter = await getChapter(chapterId);
    if (!chapter) {
      throw new Error('Chapter not found');
    }

    const scenes = await getChapterScenes(chapterId);

    return {
      ...chapter,
      scenes
    };
  } catch (error) {
    console.error('Error getting chapter with scenes:', error);
    throw new Error(`Failed to get chapter with scenes: ${error.message}`);
  }
}

export default {
  // Chapter operations
  createChapter,
  getChapter,
  getProjectChapters,
  updateChapter,
  deleteChapter,
  reorderChapters,
  // Scene operations
  createScene,
  getScene,
  getChapterScenes,
  getProjectScenes,
  updateScene,
  deleteScene,
  reorderScenes,
  // Utility
  getChapterWithScenes,
  countWords
};
