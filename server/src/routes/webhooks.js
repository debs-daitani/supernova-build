import express from 'express';
import { PrismaClient } from '@prisma/client';
import { processSocialMessage, handleCommentTrigger } from '../services/socialAutomationEngine.js';
import Stripe from 'stripe';
import {
  getReceiptEmailTemplate,
  getPaymentFailedEmailTemplate
} from '../utils/email-templates.js';

const router = express.Router();
const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy');

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

// ============================================
// STRIPE WEBHOOKS (Phase 2BG)
// ============================================

/**
 * Handle Stripe webhooks
 * POST /api/webhooks/stripe
 *
 * IMPORTANT: This endpoint needs raw body, not JSON
 * Configure in server/src/index.js with express.raw()
 */
router.post('/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log(`Received Stripe event: ${event.type}`);

  // Handle the event
  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
});

// Stripe webhook event handlers
async function handleSubscriptionUpdated(subscription) {
  console.log('Subscription updated:', subscription.id);

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { stripeCustomerId: subscription.customer },
        { stripeSubscriptionId: subscription.id }
      ]
    }
  });

  if (!user) {
    console.error('User not found for subscription:', subscription.id);
    return;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      stripeSubscriptionId: subscription.id,
      planStatus: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end
    }
  });
}

async function handleSubscriptionDeleted(subscription) {
  console.log('Subscription deleted:', subscription.id);

  const user = await prisma.user.findUnique({
    where: { stripeSubscriptionId: subscription.id }
  });

  if (!user) return;

  await prisma.user.update({
    where: { id: user.id },
    data: {
      planStatus: 'canceled',
      planType: 'trial',
      cancelAtPeriodEnd: false
    }
  });
}

async function handleInvoicePaymentSucceeded(invoice) {
  console.log('Payment succeeded:', invoice.id);

  const user = await prisma.user.findUnique({
    where: { stripeCustomerId: invoice.customer }
  });

  if (!user) return;

  // Update subscription status
  if (invoice.subscription) {
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        planStatus: 'active',
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000)
      }
    });
  }

  // Log payment
  await prisma.payment.create({
    data: {
      userId: user.id,
      stripePaymentIntentId: invoice.payment_intent,
      stripeInvoiceId: invoice.id,
      stripeChargeId: invoice.charge,
      amount: invoice.amount_paid / 100,
      currency: invoice.currency.toUpperCase(),
      status: 'succeeded',
      type: invoice.subscription ? 'subscription' : 'one_time'
    }
  });

  // Create invoice record
  await prisma.invoice.create({
    data: {
      userId: user.id,
      stripeInvoiceId: invoice.id,
      invoiceNumber: invoice.number,
      amount: invoice.subtotal / 100,
      tax: (invoice.tax || 0) / 100,
      total: invoice.total / 100,
      currency: invoice.currency.toUpperCase(),
      status: 'paid',
      periodStart: new Date(invoice.period_start * 1000),
      periodEnd: new Date(invoice.period_end * 1000),
      invoicePdf: invoice.invoice_pdf,
      paidAt: new Date()
    }
  });

  // Send receipt email
  try {
    const emailTemplate = getReceiptEmailTemplate(
      user.name,
      user.email,
      invoice.amount_paid / 100,
      invoice.currency.toUpperCase(),
      invoice.invoice_pdf
    );
    console.log('Receipt email would be sent to:', user.email);
  } catch (emailError) {
    console.error('Failed to send receipt email:', emailError);
  }
}

async function handleInvoicePaymentFailed(invoice) {
  console.log('Payment failed:', invoice.id);

  const user = await prisma.user.findUnique({
    where: { stripeCustomerId: invoice.customer }
  });

  if (!user) return;

  await prisma.user.update({
    where: { id: user.id },
    data: { planStatus: 'past_due' }
  });

  // Send payment failed email
  try {
    const emailTemplate = getPaymentFailedEmailTemplate(
      user.name,
      invoice.amount_due / 100,
      invoice.currency.toUpperCase(),
      invoice.next_payment_attempt ? new Date(invoice.next_payment_attempt * 1000) : null
    );
    console.log('Payment failed email would be sent to:', user.email);
  } catch (emailError) {
    console.error('Failed to send payment failed email:', emailError);
  }
}

export default router;
