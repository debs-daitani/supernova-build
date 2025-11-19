/**
 * SUPERNova Pinterest Integration - Board Service
 *
 * Manages Pinterest boards:
 * - Board CRUD operations
 * - Board statistics
 * - Board synchronization
 */

import wixData from 'wix-data';
import { fetch } from 'wix-fetch';
import { getValidAccessToken } from './pinterestAccountService';

// ============================================================================
// Configuration
// ============================================================================

const COLLECTIONS = {
  PINTEREST_BOARDS: 'PinterestBoards',
  PINTEREST_PINS: 'PinterestPins'
};

const PINTEREST_API_BASE = 'https://api.pinterest.com/v5';

// ============================================================================
// Board Operations
// ============================================================================

/**
 * Get boards for a Pinterest account
 * @param {string} pinterestAccountId - Pinterest account ID
 * @returns {Promise<Array>} Array of boards
 */
export async function getBoards(pinterestAccountId) {
  try {
    const results = await wixData.query(COLLECTIONS.PINTEREST_BOARDS)
      .eq('pinterestAccountId', pinterestAccountId)
      .ascending('name')
      .find();

    return results.items;
  } catch (error) {
    console.error('Error getting boards:', error);
    throw new Error(`Failed to get boards: ${error.message}`);
  }
}

/**
 * Get board by ID
 * @param {string} boardId - Board ID
 * @returns {Promise<Object|null>} Board object
 */
export async function getBoard(boardId) {
  try {
    const board = await wixData.get(COLLECTIONS.PINTEREST_BOARDS, boardId);
    return board;
  } catch (error) {
    console.error('Error getting board:', error);
    throw new Error(`Failed to get board: ${error.message}`);
  }
}

/**
 * Create board on Pinterest
 * @param {string} pinterestAccountId - Pinterest account ID
 * @param {string} userId - User ID
 * @param {Object} boardData - Board data
 * @returns {Promise<Object>} Created board
 */
export async function createBoard(pinterestAccountId, userId, boardData) {
  try {
    const accessToken = await getValidAccessToken(userId);

    // Create board on Pinterest
    const response = await fetch(`${PINTEREST_API_BASE}/boards`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: boardData.name,
        description: boardData.description || '',
        privacy: boardData.privacy || 'PUBLIC'
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create board');
    }

    const pinterestBoardData = await response.json();

    // Save to local database
    const now = new Date();

    const board = {
      pinterestAccountId,
      boardId: pinterestBoardData.id,
      name: pinterestBoardData.name,
      description: pinterestBoardData.description || '',
      privacy: pinterestBoardData.privacy || 'public',
      pinCount: 0,
      followerCount: 0,
      coverImageUrl: null,
      url: `https://pinterest.com/${pinterestBoardData.owner?.username}/${pinterestBoardData.name}`,
      createdAt: now,
      updatedAt: now
    };

    const result = await wixData.insert(COLLECTIONS.PINTEREST_BOARDS, board);
    return result;
  } catch (error) {
    console.error('Error creating board:', error);
    throw new Error(`Failed to create board: ${error.message}`);
  }
}

/**
 * Update board
 * @param {string} boardId - Board ID
 * @param {string} userId - User ID
 * @param {Object} updates - Update data
 * @returns {Promise<Object>} Updated board
 */
export async function updateBoard(boardId, userId, updates) {
  try {
    const board = await getBoard(boardId);
    if (!board) {
      throw new Error('Board not found');
    }

    // Update on Pinterest if necessary
    if (updates.name || updates.description || updates.privacy) {
      const accessToken = await getValidAccessToken(userId);

      const response = await fetch(`${PINTEREST_API_BASE}/boards/${board.boardId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: updates.name || board.name,
          description: updates.description !== undefined ? updates.description : board.description,
          privacy: updates.privacy || board.privacy
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update board on Pinterest');
      }
    }

    // Update local database
    const updatedBoard = {
      ...board,
      ...updates,
      updatedAt: new Date()
    };

    const result = await wixData.update(COLLECTIONS.PINTEREST_BOARDS, updatedBoard);
    return result;
  } catch (error) {
    console.error('Error updating board:', error);
    throw new Error(`Failed to update board: ${error.message}`);
  }
}

/**
 * Delete board
 * @param {string} boardId - Board ID
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} Success status
 */
export async function deleteBoard(boardId, userId) {
  try {
    const board = await getBoard(boardId);
    if (!board) {
      return true; // Already deleted
    }

    // Delete from Pinterest
    const accessToken = await getValidAccessToken(userId);

    const response = await fetch(`${PINTEREST_API_BASE}/boards/${board.boardId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    // Delete from local database (even if Pinterest delete fails)
    await wixData.remove(COLLECTIONS.PINTEREST_BOARDS, boardId);

    return true;
  } catch (error) {
    console.error('Error deleting board:', error);
    throw new Error(`Failed to delete board: ${error.message}`);
  }
}

// ============================================================================
// Board Statistics
// ============================================================================

/**
 * Get board statistics
 * @param {string} boardId - Board ID
 * @returns {Promise<Object>} Board statistics
 */
export async function getBoardStatistics(boardId) {
  try {
    const board = await getBoard(boardId);
    if (!board) {
      throw new Error('Board not found');
    }

    // Get pins for this board
    const pins = await wixData.query(COLLECTIONS.PINTEREST_PINS)
      .eq('boardId', boardId)
      .find();

    const stats = {
      totalPins: pins.items.length,
      publishedPins: 0,
      scheduledPins: 0,
      draftPins: 0,
      totalImpressions: 0,
      totalSaves: 0,
      totalClicks: 0
    };

    pins.items.forEach(pin => {
      if (pin.status === 'published') stats.publishedPins++;
      if (pin.status === 'scheduled') stats.scheduledPins++;
      if (pin.status === 'draft') stats.draftPins++;

      stats.totalImpressions += pin.impressions || 0;
      stats.totalSaves += pin.saves || 0;
      stats.totalClicks += pin.clicks || 0;
    });

    return stats;
  } catch (error) {
    console.error('Error getting board statistics:', error);
    throw error;
  }
}

/**
 * Get pins for a board
 * @param {string} boardId - Board ID
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Array of pins
 */
export async function getBoardPins(boardId, options = {}) {
  try {
    let query = wixData.query(COLLECTIONS.PINTEREST_PINS)
      .eq('boardId', boardId);

    if (options.status) {
      query = query.eq('status', options.status);
    }

    const results = await query
      .descending('createdAt')
      .limit(options.limit || 100)
      .find();

    return results.items;
  } catch (error) {
    console.error('Error getting board pins:', error);
    throw error;
  }
}

export default {
  getBoards,
  getBoard,
  createBoard,
  updateBoard,
  deleteBoard,
  getBoardStatistics,
  getBoardPins
};
