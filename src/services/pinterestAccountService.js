/**
 * SUPERNova Pinterest Integration - Account Service
 *
 * Manages Pinterest account connections:
 * - OAuth 2.0 authentication
 * - Account details and sync
 * - Token management
 * - Connection status
 */

import wixData from 'wix-data';
import { fetch } from 'wix-fetch';

// ============================================================================
// Configuration
// ============================================================================

const COLLECTIONS = {
  PINTEREST_ACCOUNTS: 'PinterestAccounts',
  PINTEREST_BOARDS: 'PinterestBoards'
};

const PINTEREST_API_BASE = 'https://api.pinterest.com/v5';

// Pinterest OAuth endpoints
const PINTEREST_AUTH_URL = 'https://www.pinterest.com/oauth/';
const PINTEREST_TOKEN_URL = 'https://api.pinterest.com/v5/oauth/token';

// Get these from Wix Secrets Manager
const PINTEREST_APP_ID = process.env.PINTEREST_APP_ID;
const PINTEREST_APP_SECRET = process.env.PINTEREST_APP_SECRET;
const PINTEREST_REDIRECT_URI = process.env.PINTEREST_REDIRECT_URI;

// ============================================================================
// OAuth Flow
// ============================================================================

/**
 * Generate Pinterest OAuth authorization URL
 * @param {string} userId - User ID for state parameter
 * @returns {string} Authorization URL
 */
export function getAuthorizationUrl(userId) {
  const state = generateStateToken(userId);

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: PINTEREST_APP_ID,
    redirect_uri: PINTEREST_REDIRECT_URI,
    scope: 'boards:read,boards:write,pins:read,pins:write,user_accounts:read',
    state: state
  });

  return `${PINTEREST_AUTH_URL}?${params.toString()}`;
}

/**
 * Exchange authorization code for access token
 * @param {string} code - Authorization code from Pinterest
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Token data
 */
export async function exchangeCodeForToken(code, userId) {
  try {
    const response = await fetch(PINTEREST_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: PINTEREST_REDIRECT_URI,
        client_id: PINTEREST_APP_ID,
        client_secret: PINTEREST_APP_SECRET
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Pinterest OAuth error: ${error.message}`);
    }

    const tokenData = await response.json();

    // Save account with tokens
    await saveAccount(userId, tokenData);

    return tokenData;
  } catch (error) {
    console.error('Error exchanging code for token:', error);
    throw new Error(`Failed to connect Pinterest: ${error.message}`);
  }
}

/**
 * Refresh access token
 * @param {string} accountId - Pinterest account ID
 * @returns {Promise<string>} New access token
 */
export async function refreshAccessToken(accountId) {
  try {
    const account = await wixData.get(COLLECTIONS.PINTEREST_ACCOUNTS, accountId);

    if (!account.refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(PINTEREST_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: account.refreshToken,
        client_id: PINTEREST_APP_ID,
        client_secret: PINTEREST_APP_SECRET
      })
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    const tokenData = await response.json();

    // Update account with new tokens
    account.accessToken = tokenData.access_token;
    if (tokenData.refresh_token) {
      account.refreshToken = tokenData.refresh_token;
    }
    account.tokenExpiresAt = new Date(Date.now() + tokenData.expires_in * 1000);
    account.updatedAt = new Date();

    await wixData.update(COLLECTIONS.PINTEREST_ACCOUNTS, account);

    return tokenData.access_token;
  } catch (error) {
    console.error('Error refreshing token:', error);
    throw new Error(`Failed to refresh token: ${error.message}`);
  }
}

// ============================================================================
// Account Management
// ============================================================================

/**
 * Save Pinterest account after OAuth
 * @param {string} userId - User ID
 * @param {Object} tokenData - OAuth token data
 * @returns {Promise<Object>} Created account
 */
async function saveAccount(userId, tokenData) {
  try {
    // Fetch user details from Pinterest
    const userDetails = await fetchPinterestUserDetails(tokenData.access_token);

    const now = new Date();
    const expiresAt = new Date(now.getTime() + tokenData.expires_in * 1000);

    // Check if account already exists
    const existing = await wixData.query(COLLECTIONS.PINTEREST_ACCOUNTS)
      .eq('userId', userId)
      .find();

    const accountData = {
      userId,
      pinterestUserId: userDetails.id,
      username: userDetails.username,
      displayName: userDetails.profile_name || userDetails.username,
      profileUrl: userDetails.profile_url,
      followerCount: userDetails.follower_count || 0,
      followingCount: userDetails.following_count || 0,
      boardCount: userDetails.board_count || 0,
      pinCount: userDetails.pin_count || 0,
      monthlyViews: userDetails.monthly_views || 0,
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token || null,
      tokenExpiresAt: expiresAt,
      isConnected: true,
      lastSyncedAt: now,
      createdAt: existing.items.length > 0 ? existing.items[0].createdAt : now,
      updatedAt: now
    };

    if (existing.items.length > 0) {
      // Update existing account
      accountData._id = existing.items[0]._id;
      return await wixData.update(COLLECTIONS.PINTEREST_ACCOUNTS, accountData);
    } else {
      // Create new account
      return await wixData.insert(COLLECTIONS.PINTEREST_ACCOUNTS, accountData);
    }
  } catch (error) {
    console.error('Error saving Pinterest account:', error);
    throw new Error(`Failed to save account: ${error.message}`);
  }
}

/**
 * Fetch Pinterest user details
 * @param {string} accessToken - Access token
 * @returns {Promise<Object>} User details
 */
async function fetchPinterestUserDetails(accessToken) {
  try {
    const response = await fetch(`${PINTEREST_API_BASE}/user_account`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user details');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching Pinterest user:', error);
    throw error;
  }
}

/**
 * Get Pinterest account for user
 * @param {string} userId - User ID
 * @returns {Promise<Object|null>} Pinterest account or null
 */
export async function getPinterestAccount(userId) {
  try {
    const results = await wixData.query(COLLECTIONS.PINTEREST_ACCOUNTS)
      .eq('userId', userId)
      .find();

    return results.items.length > 0 ? results.items[0] : null;
  } catch (error) {
    console.error('Error getting Pinterest account:', error);
    throw new Error(`Failed to get account: ${error.message}`);
  }
}

/**
 * Disconnect Pinterest account
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} Success status
 */
export async function disconnectAccount(userId) {
  try {
    const account = await getPinterestAccount(userId);

    if (!account) {
      return true; // Already disconnected
    }

    account.isConnected = false;
    account.accessToken = null;
    account.refreshToken = null;
    account.updatedAt = new Date();

    await wixData.update(COLLECTIONS.PINTEREST_ACCOUNTS, account);

    return true;
  } catch (error) {
    console.error('Error disconnecting account:', error);
    throw new Error(`Failed to disconnect: ${error.message}`);
  }
}

/**
 * Sync Pinterest account data
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Updated account
 */
export async function syncAccount(userId) {
  try {
    const account = await getPinterestAccount(userId);

    if (!account || !account.isConnected) {
      throw new Error('Pinterest account not connected');
    }

    // Check if token needs refresh
    if (account.tokenExpiresAt && new Date() > new Date(account.tokenExpiresAt)) {
      await refreshAccessToken(account._id);
      // Refetch account with new token
      const updatedAccount = await getPinterestAccount(userId);
      account.accessToken = updatedAccount.accessToken;
    }

    // Fetch updated user details
    const userDetails = await fetchPinterestUserDetails(account.accessToken);

    // Update account
    account.followerCount = userDetails.follower_count || 0;
    account.followingCount = userDetails.following_count || 0;
    account.boardCount = userDetails.board_count || 0;
    account.pinCount = userDetails.pin_count || 0;
    account.monthlyViews = userDetails.monthly_views || 0;
    account.lastSyncedAt = new Date();
    account.updatedAt = new Date();

    const result = await wixData.update(COLLECTIONS.PINTEREST_ACCOUNTS, account);

    // Also sync boards
    await syncBoards(account._id, account.accessToken);

    return result;
  } catch (error) {
    console.error('Error syncing account:', error);
    throw new Error(`Failed to sync account: ${error.message}`);
  }
}

/**
 * Sync boards from Pinterest
 * @param {string} accountId - Pinterest account ID
 * @param {string} accessToken - Access token
 * @returns {Promise<Array>} Synced boards
 */
async function syncBoards(accountId, accessToken) {
  try {
    const response = await fetch(`${PINTEREST_API_BASE}/boards`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch boards');
    }

    const data = await response.json();
    const boards = data.items || [];

    const syncedBoards = [];

    for (const boardData of boards) {
      // Check if board already exists
      const existing = await wixData.query(COLLECTIONS.PINTEREST_BOARDS)
        .eq('boardId', boardData.id)
        .find();

      const now = new Date();

      const board = {
        pinterestAccountId: accountId,
        boardId: boardData.id,
        name: boardData.name,
        description: boardData.description || '',
        privacy: boardData.privacy || 'public',
        pinCount: boardData.pin_count || 0,
        followerCount: boardData.follower_count || 0,
        coverImageUrl: boardData.cover_pin_url || null,
        url: `https://pinterest.com/${boardData.owner?.username}/${boardData.name}`,
        createdAt: existing.items.length > 0 ? existing.items[0].createdAt : now,
        updatedAt: now
      };

      if (existing.items.length > 0) {
        board._id = existing.items[0]._id;
        const updated = await wixData.update(COLLECTIONS.PINTEREST_BOARDS, board);
        syncedBoards.push(updated);
      } else {
        const created = await wixData.insert(COLLECTIONS.PINTEREST_BOARDS, board);
        syncedBoards.push(created);
      }
    }

    return syncedBoards;
  } catch (error) {
    console.error('Error syncing boards:', error);
    throw error;
  }
}

/**
 * Get valid access token (refreshes if needed)
 * @param {string} userId - User ID
 * @returns {Promise<string>} Valid access token
 */
export async function getValidAccessToken(userId) {
  try {
    const account = await getPinterestAccount(userId);

    if (!account || !account.isConnected) {
      throw new Error('Pinterest account not connected');
    }

    // Check if token is expired or will expire soon (within 5 minutes)
    const expiresAt = new Date(account.tokenExpiresAt);
    const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000);

    if (expiresAt < fiveMinutesFromNow) {
      // Refresh token
      return await refreshAccessToken(account._id);
    }

    return account.accessToken;
  } catch (error) {
    console.error('Error getting valid access token:', error);
    throw error;
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Generate state token for OAuth
 * @param {string} userId - User ID
 * @returns {string} State token
 */
function generateStateToken(userId) {
  // In production, use a secure random token and store mapping
  return Buffer.from(JSON.stringify({ userId, timestamp: Date.now() })).toString('base64');
}

/**
 * Verify state token
 * @param {string} state - State token to verify
 * @returns {Object} Decoded state
 */
export function verifyStateToken(state) {
  try {
    const decoded = JSON.parse(Buffer.from(state, 'base64').toString());
    return decoded;
  } catch (error) {
    throw new Error('Invalid state token');
  }
}

export default {
  getAuthorizationUrl,
  exchangeCodeForToken,
  refreshAccessToken,
  getPinterestAccount,
  disconnectAccount,
  syncAccount,
  getValidAccessToken,
  verifyStateToken
};
