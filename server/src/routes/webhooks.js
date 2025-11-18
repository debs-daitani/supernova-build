import express from 'express';
import { PrismaClient } from '@prisma/client';
import { processSocialMessage, handleCommentTrigger } from '../services/socialAutomationEngine.js';

const router = express.Router();
const prisma = new PrismaClient();

const VERIFY_TOKEN = process.env.META_WEBHOOK_VERIFY_TOKEN || 'supernova_verify_token';

// ============================================
// WEBHOOK VERIFICATION (GET)
// ============================================

// Meta requires a GET endpoint for webhook verification
router.get('/verify', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('Webhook verified');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  } else {
    res.sendStatus(400);
  }
});

// ============================================
// INSTAGRAM WEBHOOKS
// ============================================

router.post('/instagram', async (req, res) => {
  try {
    const body = req.body;

    // Verify webhook signature (optional but recommended)
    // const signature = req.headers['x-hub-signature'];
    // Verify signature here...

    // Quick response (Meta requires 200 within 20 seconds)
    res.sendStatus(200);

    // Process webhook in background
    if (body.object === 'instagram') {
      for (const entry of body.entry) {
        // Handle different event types
        if (entry.changes) {
          for (const change of entry.changes) {
            await handleInstagramChange(change);
          }
        }

        if (entry.messaging) {
          for (const event of entry.messaging) {
            await handleInstagramMessage(event);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error processing Instagram webhook:', error);
    // Still return 200 to acknowledge receipt
  }
});

async function handleInstagramChange(change) {
  try {
    const field = change.field;
    const value = change.value;

    if (field === 'comments') {
      // New comment on post
      const commentId = value.id;
      const postId = value.media?.id;
      const userId = value.from?.id;
      const text = value.text;

      if (commentId && text) {
        // Find account that owns this post
        const account = await findAccountByPlatformId(value.media?.media_product_type === 'FEED' ? postId : null, 'instagram');

        if (account) {
          await handleCommentTrigger('instagram', account.id, commentId, postId, userId, text);
        }
      }
    }
  } catch (error) {
    console.error('Error handling Instagram change:', error);
  }
}

async function handleInstagramMessage(event) {
  try {
    const senderId = event.sender?.id;
    const recipientId = event.recipient?.id;
    const message = event.message;

    if (!senderId || !message) return;

    // Find account
    const account = await prisma.socialAccount.findFirst({
      where: {
        platform: 'instagram',
        accountId: recipientId
      }
    });

    if (!account) return;

    const messageText = message.text || '';
    const threadId = senderId; // In Instagram, thread ID is the sender's ID

    // Process message through automation engine
    await processSocialMessage('instagram', account.id, threadId, senderId, messageText);
  } catch (error) {
    console.error('Error handling Instagram message:', error);
  }
}

// ============================================
// FACEBOOK WEBHOOKS
// ============================================

router.post('/facebook', async (req, res) => {
  try {
    const body = req.body;

    // Quick response
    res.sendStatus(200);

    // Process webhook in background
    if (body.object === 'page') {
      for (const entry of entry.entry) {
        // Handle messaging events
        if (entry.messaging) {
          for (const event of entry.messaging) {
            await handleMessengerEvent(event);
          }
        }

        // Handle feed events (comments)
        if (entry.changes) {
          for (const change of entry.changes) {
            await handleFacebookChange(change);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error processing Facebook webhook:', error);
  }
});

async function handleMessengerEvent(event) {
  try {
    const senderId = event.sender?.id;
    const recipientId = event.recipient?.id;
    const message = event.message;
    const postback = event.postback;

    if (!senderId) return;

    // Find account (Page ID)
    const account = await prisma.socialAccount.findFirst({
      where: {
        platform: 'facebook',
        accountId: recipientId
      }
    });

    if (!account) return;

    let messageText = '';

    if (message) {
      messageText = message.text || '';
    } else if (postback) {
      // Handle button clicks
      messageText = postback.payload || postback.title || '';
    }

    if (!messageText) return;

    const threadId = senderId; // Thread ID is sender's ID

    // Process message through automation engine
    await processSocialMessage('facebook', account.id, threadId, senderId, messageText);
  } catch (error) {
    console.error('Error handling Messenger event:', error);
  }
}

async function handleFacebookChange(change) {
  try {
    const field = change.field;
    const value = change.value;

    if (field === 'feed') {
      // Comment on post
      if (value.item === 'comment') {
        const commentId = value.comment_id;
        const postId = value.post_id;
        const userId = value.from?.id;
        const text = value.message;

        if (commentId && text) {
          // Find account (Page)
          const account = await prisma.socialAccount.findFirst({
            where: {
              platform: 'facebook',
              accountId: value.post?.page_id || value.recipient_id
            }
          });

          if (account) {
            await handleCommentTrigger('facebook', account.id, commentId, postId, userId, text);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error handling Facebook change:', error);
  }
}

// Helper function to find account
async function findAccountByPlatformId(platformId, platform) {
  if (!platformId) return null;

  return await prisma.socialAccount.findFirst({
    where: {
      platform,
      accountId: platformId
    }
  });
}

export default router;
