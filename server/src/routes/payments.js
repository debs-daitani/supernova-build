import express from 'express';
import Stripe from 'stripe';
import { body } from 'express-validator';
import { query } from '../db/database.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create checkout session for one-time upgrade (£26)
router.post(
  '/checkout/upgrade',
  authenticate,
  async (req, res) => {
    try {
      // Check if user already upgraded
      if (req.user.subscription_status !== 'free') {
        return res.status(400).json({ error: 'You already have an active subscription or upgrade' });
      }

      // Get or create Stripe customer
      let customerId = req.user.stripe_customer_id;

      if (!customerId) {
        const customer = await stripe.customers.create({
          email: req.user.email,
          metadata: {
            userId: req.user.id
          }
        });
        customerId = customer.id;

        // Save customer ID
        await query(
          'UPDATE users SET stripe_customer_id = $1 WHERE id = $2',
          [customerId, req.user.id]
        );
      }

      // Create checkout session
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        mode: 'payment',
        line_items: [
          {
            price: process.env.STRIPE_UPGRADE_PRICE_ID,
            quantity: 1
          }
        ],
        success_url: `${process.env.FRONTEND_URL}/upgrade/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/upgrade/cancelled`,
        metadata: {
          userId: req.user.id,
          type: 'upgrade'
        }
      });

      res.json({ sessionUrl: session.url });
    } catch (error) {
      console.error('Create upgrade checkout error:', error);
      res.status(500).json({ error: 'Failed to create checkout session' });
    }
  }
);

// Create checkout session for subscription (monthly or annual)
router.post(
  '/checkout/subscription',
  authenticate,
  [body('plan').isIn(['monthly', 'annual'])],
  validate,
  async (req, res) => {
    try {
      const { plan } = req.body;

      // Check if user already has a subscription
      if (['monthly', 'annual'].includes(req.user.subscription_status)) {
        return res.status(400).json({ error: 'You already have an active subscription' });
      }

      // Get or create Stripe customer
      let customerId = req.user.stripe_customer_id;

      if (!customerId) {
        const customer = await stripe.customers.create({
          email: req.user.email,
          metadata: {
            userId: req.user.id
          }
        });
        customerId = customer.id;

        await query(
          'UPDATE users SET stripe_customer_id = $1 WHERE id = $2',
          [customerId, req.user.id]
        );
      }

      // Get price ID based on plan
      const priceId = plan === 'monthly'
        ? process.env.STRIPE_MONTHLY_PRICE_ID
        : process.env.STRIPE_ANNUAL_PRICE_ID;

      // Create checkout session
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        mode: 'subscription',
        line_items: [
          {
            price: priceId,
            quantity: 1
          }
        ],
        success_url: `${process.env.FRONTEND_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/subscription/cancelled`,
        metadata: {
          userId: req.user.id,
          plan
        }
      });

      res.json({ sessionUrl: session.url });
    } catch (error) {
      console.error('Create subscription checkout error:', error);
      res.status(500).json({ error: 'Failed to create checkout session' });
    }
  }
);

// Webhook handler for Stripe events
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
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

    try {
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object;
          const userId = session.metadata.userId;

          if (session.mode === 'payment') {
            // One-time upgrade
            await query(
              'UPDATE users SET subscription_status = $1 WHERE id = $2',
              ['upgraded', userId]
            );

            // Record payment
            await query(
              `INSERT INTO payments (user_id, stripe_payment_id, amount, payment_type, status)
               VALUES ($1, $2, $3, 'upgrade', 'succeeded')`,
              [userId, session.payment_intent, session.amount_total / 100]
            );

            console.log(`✅ User ${userId} upgraded successfully`);
          } else if (session.mode === 'subscription') {
            // Subscription
            const plan = session.metadata.plan;

            await query(
              'UPDATE users SET subscription_status = $1, subscription_id = $2 WHERE id = $3',
              [plan, session.subscription, userId]
            );

            // Record payment
            await query(
              `INSERT INTO payments (user_id, stripe_payment_id, amount, payment_type, status, metadata)
               VALUES ($1, $2, $3, 'subscription', 'succeeded', $4)`,
              [userId, session.payment_intent, session.amount_total / 100, JSON.stringify({ plan })]
            );

            console.log(`✅ User ${userId} subscribed to ${plan} plan`);
          }

          // TODO: Send welcome email with download links
          break;
        }

        case 'customer.subscription.updated':
        case 'customer.subscription.deleted': {
          const subscription = event.data.object;
          const userId = subscription.metadata?.userId;

          if (userId) {
            if (subscription.status === 'active') {
              // Keep subscription active
            } else if (['canceled', 'unpaid', 'past_due'].includes(subscription.status)) {
              // Downgrade to free
              await query(
                'UPDATE users SET subscription_status = $1, subscription_id = NULL WHERE id = $2',
                ['free', userId]
              );

              console.log(`⚠️ User ${userId} subscription cancelled/expired`);
            }
          }
          break;
        }

        case 'invoice.payment_succeeded': {
          const invoice = event.data.object;
          const userId = invoice.metadata?.userId;

          if (userId) {
            await query(
              `INSERT INTO payments (user_id, stripe_payment_id, amount, payment_type, status)
               VALUES ($1, $2, $3, 'subscription', 'succeeded')`,
              [userId, invoice.payment_intent, invoice.amount_paid / 100]
            );
          }
          break;
        }

        case 'invoice.payment_failed': {
          const invoice = event.data.object;
          const userId = invoice.metadata?.userId;

          if (userId) {
            // TODO: Send payment failed email
            console.log(`❌ Payment failed for user ${userId}`);
          }
          break;
        }

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      res.json({ received: true });
    } catch (error) {
      console.error('Webhook handler error:', error);
      res.status(500).json({ error: 'Webhook handler failed' });
    }
  }
);

// Get payment history for user
router.get('/history', authenticate, async (req, res) => {
  try {
    const result = await query(
      `SELECT id, amount, currency, payment_type, status, metadata, created_at
       FROM payments
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    res.json({
      payments: result.rows.map(p => ({
        id: p.id,
        amount: p.amount,
        currency: p.currency,
        type: p.payment_type,
        status: p.status,
        metadata: p.metadata || {},
        createdAt: p.created_at
      }))
    });
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({ error: 'Failed to get payment history' });
  }
});

// Cancel subscription
router.post('/subscription/cancel', authenticate, async (req, res) => {
  try {
    const { subscription_id } = req.user;

    if (!subscription_id) {
      return res.status(400).json({ error: 'No active subscription found' });
    }

    // Cancel subscription at period end
    await stripe.subscriptions.update(subscription_id, {
      cancel_at_period_end: true
    });

    res.json({ message: 'Subscription will be cancelled at the end of the billing period' });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

export default router;
