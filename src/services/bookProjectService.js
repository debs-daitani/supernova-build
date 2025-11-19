/**
 * SUPERNova Book Writing Suite - Book Project Service
 *
 * Manages book projects including:
 * - Project creation and management
 * - Word count tracking
 * - Progress monitoring
 * - Project settings
 */

import wixData from 'wix-data';
import { generateId } from '../utils/helpers';

// ============================================================================
// Configuration
// ============================================================================

const COLLECTIONS = {
  BOOK_PROJECTS: 'BookProjects',
  CHAPTERS: 'Chapters',
  WRITING_SESSIONS: 'WritingSessions',
  SCENES: 'Scenes'
};

// ============================================================================
// Book Project Operations
// ============================================================================

/**
 * Create a new book project
 * @param {Object} projectInput - Project data
 * @returns {Promise<Object>} Created project
 */
export async function createBookProject(projectInput) {
  try {
    const now = new Date();

    const project = {
      userId: projectInput.userId,
      title: projectInput.title || 'Untitled Book',
      subtitle: projectInput.subtitle || '',
      genre: projectInput.genre,
      targetWordCount: projectInput.targetWordCount || 80000,
      currentWordCount: 0,
      status: 'planning',
      description: projectInput.description || '',
      elevatorPitch: projectInput.elevatorPitch || '',
      targetAudience: projectInput.targetAudience || '',
      competingBooks: projectInput.competingBooks || [],
      uniqueSellingPoint: projectInput.uniqueSellingPoint || '',
      coverImageUrl: projectInput.coverImageUrl || null,
      startedAt: now,
      targetCompletionDate: projectInput.targetCompletionDate || null,
      publishedAt: null,
      createdAt: now,
      updatedAt: now
    };

    const result = await wixData.insert(COLLECTIONS.BOOK_PROJECTS, project);
    return result;
  } catch (error) {
    console.error('Error creating book project:', error);
    throw new Error(`Failed to create book project: ${error.message}`);
  }
}

/**
 * Get book project by ID
 * @param {string} projectId - Project ID
 * @param {string} userId - User ID (for authorization)
 * @returns {Promise<Object|null>} Project object
 */
export async function getBookProject(projectId, userId) {
  try {
    const results = await wixData.query(COLLECTIONS.BOOK_PROJECTS)
      .eq('_id', projectId)
      .eq('userId', userId)
      .find();

    return results.items.length > 0 ? results.items[0] : null;
  } catch (error) {
    console.error('Error getting book project:', error);
    throw new Error(`Failed to get book project: ${error.message}`);
  }
}

/**
 * Get all book projects for a user
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Array of projects
 */
export async function getUserBookProjects(userId, options = {}) {
  try {
    let query = wixData.query(COLLECTIONS.BOOK_PROJECTS)
      .eq('userId', userId);

    if (options.status) {
      query = query.eq('status', options.status);
    }

    if (options.genre) {
      query = query.eq('genre', options.genre);
    }

    const results = await query
      .descending('updatedAt')
      .limit(options.limit || 100)
      .find();

    return results.items;
  } catch (error) {
    console.error('Error getting user book projects:', error);
    throw new Error(`Failed to get book projects: ${error.message}`);
  }
}

/**
 * Update book project
 * @param {string} projectId - Project ID
 * @param {string} userId - User ID
 * @param {Object} updates - Update data
 * @returns {Promise<Object>} Updated project
 */
export async function updateBookProject(projectId, userId, updates) {
  try {
    const project = await getBookProject(projectId, userId);
    if (!project) {
      throw new Error('Project not found or access denied');
    }

    const updatedProject = {
      ...project,
      ...updates,
      updatedAt: new Date()
    };

    const result = await wixData.update(COLLECTIONS.BOOK_PROJECTS, updatedProject);
    return result;
  } catch (error) {
    console.error('Error updating book project:', error);
    throw new Error(`Failed to update book project: ${error.message}`);
  }
}

/**
 * Delete book project (and all related data)
 * @param {string} projectId - Project ID
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} Success status
 */
export async function deleteBookProject(projectId, userId) {
  try {
    // Verify ownership
    const project = await getBookProject(projectId, userId);
    if (!project) {
      throw new Error('Project not found or access denied');
    }

    // Delete project (cascading deletes will handle related data in production)
    await wixData.remove(COLLECTIONS.BOOK_PROJECTS, projectId);

    // TODO: In production, also delete:
    // - Chapters, Scenes, Characters, WorldBuilding, PlotThreads
    // - Timelines, ResearchItems, CaseStudies, ExpertInterviews
    // - MindMapNodes, WritingSessions, PublishingChecklists
    // - QueryLetters, BookProposals

    return true;
  } catch (error) {
    console.error('Error deleting book project:', error);
    throw new Error(`Failed to delete book project: ${error.message}`);
  }
}

/**
 * Calculate and update total word count for a project
 * @param {string} projectId - Project ID
 * @returns {Promise<number>} Updated word count
 */
export async function updateProjectWordCount(projectId) {
  try {
    // Get all chapters for this project
    const chapters = await wixData.query(COLLECTIONS.CHAPTERS)
      .eq('bookProjectId', projectId)
      .find();

    // Sum up all chapter word counts
    const totalWords = chapters.items.reduce((sum, chapter) => {
      return sum + (chapter.wordCount || 0);
    }, 0);

    // Update project with new word count
    const project = await wixData.get(COLLECTIONS.BOOK_PROJECTS, projectId);
    project.currentWordCount = totalWords;
    project.updatedAt = new Date();

    await wixData.update(COLLECTIONS.BOOK_PROJECTS, project);

    return totalWords;
  } catch (error) {
    console.error('Error updating project word count:', error);
    throw new Error(`Failed to update word count: ${error.message}`);
  }
}

/**
 * Get project statistics
 * @param {string} projectId - Project ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Project statistics
 */
export async function getProjectStatistics(projectId, userId) {
  try {
    const project = await getBookProject(projectId, userId);
    if (!project) {
      throw new Error('Project not found');
    }

    // Get chapter count and status breakdown
    const chapters = await wixData.query(COLLECTIONS.CHAPTERS)
      .eq('bookProjectId', projectId)
      .find();

    const chapterStats = {
      total: chapters.items.length,
      outline: 0,
      draft: 0,
      revision: 0,
      complete: 0
    };

    chapters.items.forEach(chapter => {
      chapterStats[chapter.status] = (chapterStats[chapter.status] || 0) + 1;
    });

    // Get writing session stats (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const sessions = await wixData.query(COLLECTIONS.WRITING_SESSIONS)
      .eq('bookProjectId', projectId)
      .ge('startTime', thirtyDaysAgo)
      .find();

    const totalWordsLast30Days = sessions.items.reduce((sum, session) => {
      return sum + (session.wordsWritten || 0);
    }, 0);

    const avgWordsPerDay = sessions.items.length > 0
      ? Math.round(totalWordsLast30Days / 30)
      : 0;

    // Calculate completion percentage
    const completionPercentage = project.targetWordCount > 0
      ? Math.round((project.currentWordCount / project.targetWordCount) * 100)
      : 0;

    // Calculate days to completion based on average
    const remainingWords = project.targetWordCount - project.currentWordCount;
    const daysToCompletion = avgWordsPerDay > 0
      ? Math.ceil(remainingWords / avgWordsPerDay)
      : null;

    // Calculate days writing
    const daysWriting = Math.floor((new Date() - new Date(project.startedAt)) / (1000 * 60 * 60 * 24));

    return {
      project: {
        currentWordCount: project.currentWordCount,
        targetWordCount: project.targetWordCount,
        completionPercentage,
        daysWriting,
        status: project.status
      },
      chapters: chapterStats,
      writingActivity: {
        sessionsLast30Days: sessions.items.length,
        wordsLast30Days: totalWordsLast30Days,
        avgWordsPerDay,
        daysToCompletion
      }
    };
  } catch (error) {
    console.error('Error getting project statistics:', error);
    throw new Error(`Failed to get statistics: ${error.message}`);
  }
}

/**
 * Get writing streak for a project
 * @param {string} projectId - Project ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Streak information
 */
export async function getWritingStreak(projectId, userId) {
  try {
    // Get all writing sessions, ordered by date
    const sessions = await wixData.query(COLLECTIONS.WRITING_SESSIONS)
      .eq('bookProjectId', projectId)
      .eq('userId', userId)
      .descending('startTime')
      .limit(365) // Last year
      .find();

    if (sessions.items.length === 0) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        totalDaysWritten: 0
      };
    }

    // Group sessions by date
    const dateMap = new Map();
    sessions.items.forEach(session => {
      const date = new Date(session.startTime).toDateString();
      if (!dateMap.has(date)) {
        dateMap.set(date, true);
      }
    });

    const writingDates = Array.from(dateMap.keys())
      .map(dateStr => new Date(dateStr))
      .sort((a, b) => b - a); // Most recent first

    // Calculate current streak
    let currentStreak = 0;
    const today = new Date().toDateString();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    let checkDate = new Date();

    // Start from today or yesterday
    if (writingDates[0].toDateString() === today ||
        writingDates[0].toDateString() === yesterdayStr) {

      for (let i = 0; i < writingDates.length; i++) {
        const sessionDate = writingDates[i].toDateString();
        const expectedDate = new Date(checkDate).toDateString();

        if (sessionDate === expectedDate) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    // Calculate longest streak
    let longestStreak = 0;
    let tempStreak = 1;

    for (let i = 1; i < writingDates.length; i++) {
      const dayDiff = Math.floor((writingDates[i - 1] - writingDates[i]) / (1000 * 60 * 60 * 24));

      if (dayDiff === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    return {
      currentStreak,
      longestStreak,
      totalDaysWritten: writingDates.length
    };
  } catch (error) {
    console.error('Error calculating writing streak:', error);
    throw new Error(`Failed to calculate streak: ${error.message}`);
  }
}

/**
 * Duplicate a book project (for templates/versions)
 * @param {string} projectId - Source project ID
 * @param {string} userId - User ID
 * @param {string} newTitle - New project title
 * @returns {Promise<Object>} New project
 */
export async function duplicateBookProject(projectId, userId, newTitle) {
  try {
    const sourceProject = await getBookProject(projectId, userId);
    if (!sourceProject) {
      throw new Error('Source project not found');
    }

    const newProjectInput = {
      ...sourceProject,
      title: newTitle || `${sourceProject.title} (Copy)`,
      currentWordCount: 0,
      startedAt: new Date(),
      publishedAt: null,
      _id: undefined // Remove ID to create new
    };

    const newProject = await createBookProject(newProjectInput);

    // TODO: Optionally duplicate chapters, characters, etc.

    return newProject;
  } catch (error) {
    console.error('Error duplicating book project:', error);
    throw new Error(`Failed to duplicate project: ${error.message}`);
  }
}

export default {
  createBookProject,
  getBookProject,
  getUserBookProjects,
  updateBookProject,
  deleteBookProject,
  updateProjectWordCount,
  getProjectStatistics,
  getWritingStreak,
  duplicateBookProject
};
