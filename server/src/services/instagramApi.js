import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const GRAPH_API_URL = 'https://graph.facebook.com/v18.0';

/**
 * Send a DM on Instagram
 */
export async function sendInstagramDM(accountId, recipientId, message) {
  try {
    const account = await prisma.socialAccount.findUnique({
      where: { id: accountId }
    });

    if (!account || account.platform !== 'instagram') {
      throw new Error('Invalid Instagram account');
    }

    const messageData = typeof message === 'string'
      ? { text: message }
      : message;

    const response = await fetch(
      `${GRAPH_API_URL}/${account.accountId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${account.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipient: { id: recipientId },
          message: messageData,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to send Instagram DM');
    }

    return data;
  } catch (error) {
    console.error('Error sending Instagram DM:', error);
    throw error;
  }
}

/**
 * Send a quick reply (buttons) on Instagram
 */
export async function sendInstagramQuickReply(accountId, recipientId, text, quickReplies) {
  const message = {
    text,
    quick_replies: quickReplies.map(reply => ({
      content_type: 'text',
      title: reply.title,
      payload: reply.payload || reply.title,
    }))
  };

  return sendInstagramDM(accountId, recipientId, message);
}

/**
 * Reply to a comment on Instagram
 */
export async function replyToInstagramComment(accountId, commentId, replyText) {
  try {
    const account = await prisma.socialAccount.findUnique({
      where: { id: accountId }
    });

    if (!account || account.platform !== 'instagram') {
      throw new Error('Invalid Instagram account');
    }

    const response = await fetch(
      `${GRAPH_API_URL}/${commentId}/replies`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${account.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: replyText,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to reply to comment');
    }

    return data;
  } catch (error) {
    console.error('Error replying to Instagram comment:', error);
    throw error;
  }
}

/**
 * Get Instagram user info from comment or DM
 */
export async function getInstagramUser(accountId, userId) {
  try {
    const account = await prisma.socialAccount.findUnique({
      where: { id: accountId }
    });

    if (!account || account.platform !== 'instagram') {
      throw new Error('Invalid Instagram account');
    }

    const response = await fetch(
      `${GRAPH_API_URL}/${userId}?fields=id,username,name,profile_pic`,
      {
        headers: {
          'Authorization': `Bearer ${account.accessToken}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to get user info');
    }

    return data;
  } catch (error) {
    console.error('Error getting Instagram user:', error);
    throw error;
  }
}

/**
 * Subscribe to Instagram webhooks
 */
export async function subscribeInstagramWebhooks(accountId) {
  try {
    const account = await prisma.socialAccount.findUnique({
      where: { id: accountId }
    });

    if (!account || account.platform !== 'instagram') {
      throw new Error('Invalid Instagram account');
    }

    // Subscribe to comments, messages, and mentions
    const subscriptions = ['comments', 'messages', 'messaging_postbacks'];

    for (const field of subscriptions) {
      const response = await fetch(
        `${GRAPH_API_URL}/${account.accountId}/subscribed_apps`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${account.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            subscribed_fields: field,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error(`Failed to subscribe to ${field}:`, data.error);
      }
    }

    return true;
  } catch (error) {
    console.error('Error subscribing to webhooks:', error);
    throw error;
  }
}

/**
 * Unsubscribe from Instagram webhooks
 */
export async function unsubscribeInstagramWebhooks(accountId) {
  try {
    const account = await prisma.socialAccount.findUnique({
      where: { id: accountId }
    });

    if (!account || account.platform !== 'instagram') {
      throw new Error('Invalid Instagram account');
    }

    const response = await fetch(
      `${GRAPH_API_URL}/${account.accountId}/subscribed_apps`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${account.accessToken}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to unsubscribe');
    }

    return true;
  } catch (error) {
    console.error('Error unsubscribing from webhooks:', error);
    throw error;
  }
}

/**
 * Refresh access token
 */
export async function refreshInstagramToken(accountId) {
  try {
    const account = await prisma.socialAccount.findUnique({
      where: { id: accountId }
    });

    if (!account || account.platform !== 'instagram') {
      throw new Error('Invalid Instagram account');
    }

    // Long-lived tokens are valid for 60 days
    // Exchange existing token for a new long-lived token
    const response = await fetch(
      `${GRAPH_API_URL}/oauth/access_token?grant_type=fb_exchange_token&client_id=${process.env.FACEBOOK_APP_ID}&client_secret=${process.env.FACEBOOK_APP_SECRET}&fb_exchange_token=${account.accessToken}`
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to refresh token');
    }

    // Update token in database
    await prisma.socialAccount.update({
      where: { id: accountId },
      data: {
        accessToken: data.access_token,
        tokenExpiry: new Date(Date.now() + (data.expires_in * 1000)),
      },
    });

    return data.access_token;
  } catch (error) {
    console.error('Error refreshing Instagram token:', error);
    throw error;
  }
}

export default {
  sendInstagramDM,
  sendInstagramQuickReply,
  replyToInstagramComment,
  getInstagramUser,
  subscribeInstagramWebhooks,
  unsubscribeInstagramWebhooks,
  refreshInstagramToken,
};
