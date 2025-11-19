import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const GRAPH_API_URL = 'https://graph.facebook.com/v18.0';

/**
 * Send a message on Facebook Messenger
 */
export async function sendMessengerMessage(accountId, recipientId, message) {
  try {
    const account = await prisma.socialAccount.findUnique({
      where: { id: accountId }
    });

    if (!account || account.platform !== 'facebook') {
      throw new Error('Invalid Facebook account');
    }

    const messageData = typeof message === 'string'
      ? { text: message }
      : message;

    const response = await fetch(
      `${GRAPH_API_URL}/me/messages`,
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
      throw new Error(data.error?.message || 'Failed to send Messenger message');
    }

    return data;
  } catch (error) {
    console.error('Error sending Messenger message:', error);
    throw error;
  }
}

/**
 * Send quick reply (buttons) on Messenger
 */
export async function sendMessengerQuickReply(accountId, recipientId, text, quickReplies) {
  const message = {
    text,
    quick_replies: quickReplies.map(reply => ({
      content_type: 'text',
      title: reply.title,
      payload: reply.payload || reply.title,
    }))
  };

  return sendMessengerMessage(accountId, recipientId, message);
}

/**
 * Send button template on Messenger
 */
export async function sendMessengerButtons(accountId, recipientId, text, buttons) {
  const message = {
    attachment: {
      type: 'template',
      payload: {
        template_type: 'button',
        text,
        buttons: buttons.map(btn => ({
          type: 'postback',
          title: btn.title,
          payload: btn.payload || btn.title,
        }))
      }
    }
  };

  return sendMessengerMessage(accountId, recipientId, message);
}

/**
 * Reply to a comment on Facebook
 */
export async function replyToFacebookComment(accountId, commentId, replyText) {
  try {
    const account = await prisma.socialAccount.findUnique({
      where: { id: accountId }
    });

    if (!account || account.platform !== 'facebook') {
      throw new Error('Invalid Facebook account');
    }

    const response = await fetch(
      `${GRAPH_API_URL}/${commentId}/comments`,
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
    console.error('Error replying to Facebook comment:', error);
    throw error;
  }
}

/**
 * Get Facebook user info
 */
export async function getFacebookUser(accountId, userId) {
  try {
    const account = await prisma.socialAccount.findUnique({
      where: { id: accountId }
    });

    if (!account || account.platform !== 'facebook') {
      throw new Error('Invalid Facebook account');
    }

    const response = await fetch(
      `${GRAPH_API_URL}/${userId}?fields=id,name,profile_pic`,
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
    console.error('Error getting Facebook user:', error);
    throw error;
  }
}

/**
 * Subscribe to Facebook Page webhooks
 */
export async function subscribeFacebookWebhooks(accountId) {
  try {
    const account = await prisma.socialAccount.findUnique({
      where: { id: accountId }
    });

    if (!account || account.platform !== 'facebook') {
      throw new Error('Invalid Facebook account');
    }

    // Subscribe to messages, messaging_postbacks, and feed (for comments)
    const response = await fetch(
      `${GRAPH_API_URL}/${account.accountId}/subscribed_apps`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${account.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscribed_fields: 'messages,messaging_postbacks,feed',
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to subscribe to webhooks');
    }

    return true;
  } catch (error) {
    console.error('Error subscribing to Facebook webhooks:', error);
    throw error;
  }
}

/**
 * Unsubscribe from Facebook webhooks
 */
export async function unsubscribeFacebookWebhooks(accountId) {
  try {
    const account = await prisma.socialAccount.findUnique({
      where: { id: accountId }
    });

    if (!account || account.platform !== 'facebook') {
      throw new Error('Invalid Facebook account');
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
    console.error('Error unsubscribing from Facebook webhooks:', error);
    throw error;
  }
}

/**
 * Refresh Facebook Page access token
 */
export async function refreshFacebookToken(accountId) {
  try {
    const account = await prisma.socialAccount.findUnique({
      where: { id: accountId }
    });

    if (!account || account.platform !== 'facebook') {
      throw new Error('Invalid Facebook account');
    }

    // Exchange short-lived token for long-lived token
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
    console.error('Error refreshing Facebook token:', error);
    throw error;
  }
}

export default {
  sendMessengerMessage,
  sendMessengerQuickReply,
  sendMessengerButtons,
  replyToFacebookComment,
  getFacebookUser,
  subscribeFacebookWebhooks,
  unsubscribeFacebookWebhooks,
  refreshFacebookToken,
};
