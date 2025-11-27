import express from 'express';
import prisma from '../config/database.js';
import stripe from '../config/stripe.js';
import { authenticate } from '../middleware/auth.js';
import { sendUpgradeConfirmation, sendSubscriptionConfirmation, sendPaymentReceipt } from '../services/emailService.js';

const router = express.Router();

router.use(authenticate);

// POST /api/payments/create-upgrade-intent
router.post('/create-upgrade-intent', async (req, res) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: parseInt(process.env.UPGRADE_PRICE) || 2600, // £26 in pence
      currency: 'gbp',
      metadata: {
        userId: req.user.id,
        type: 'UPGRADE',
      },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Payment intent error:', error);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
});

// POST /api/payments/create-subscription
router.post('/create-subscription', async (req, res) => {
  try {
    const { plan } = req.body; // 'MONTHLY' or 'ANNUAL'

    const prices = {
      MONTHLY: process.env.MONTHLY_PRICE || 1900, // £19
      ANNUAL: process.env.ANNUAL_PRICE || 19900, // £199
    };

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: req.user.stripeCustomerId, // Assume customer ID stored on user
      items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: `dAItaniverse ${plan} Membership`,
            },
            recurring: {
              interval: plan === 'MONTHLY' ? 'month' : 'year',
            },
            unit_amount: parseInt(prices[plan]),
          },
        },
      ],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
    });

    res.json({
      subscriptionId: subscription.id,
      clientSecret: subscription.latest_invoice.payment_intent.client_secret,
    });
  } catch (error) {
    console.error('Subscription error:', error);
    res.status(500).json({ error: 'Failed to create subscription' });
  }
});

// POST /api/payments/webhook - Stripe webhook
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
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

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      await handlePaymentSuccess(paymentIntent);
      break;

    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      const subscription = event.data.object;
      await handleSubscriptionUpdate(subscription);
      break;

    case 'customer.subscription.deleted':
      const deletedSub = event.data.object;
      await handleSubscriptionCanceled(deletedSub);
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

// Helper: Handle successful payment
async function handlePaymentSuccess(paymentIntent) {
  const { userId, type, listingId, sellerId } = paymentIntent.metadata;

  // Store payment record
  const payment = await prisma.payment.create({
    data: {
      userId,
      stripePaymentId: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: 'SUCCEEDED',
      type: type || 'UPGRADE',
      description: `Payment for ${type}`,
    },
  });

  // Update user account type if upgrade
  if (type === 'UPGRADE') {
    await prisma.user.update({
      where: { id: userId },
      data: { accountType: 'UPGRADE' },
    });

    const user = await prisma.user.findUnique({ where: { id: userId } });

    // Send upgrade confirmation email
    sendUpgradeConfirmation(user, {
      prompts: `${process.env.CLIENT_URL}/downloads/78-prompts.pdf`,
      guide: `${process.env.CLIENT_URL}/downloads/ai-amplified-guide.pdf`,
      bonus: `${process.env.CLIENT_URL}/downloads/bonus.pdf`,
    }).catch(console.error);
  }

  // Handle marketplace purchase
  if (type === 'MARKETPLACE_PURCHASE' && listingId && sellerId) {
    const commission = Math.floor(paymentIntent.amount * 0.06); // 6%
    const sellerAmount = paymentIntent.amount - commission;

    await prisma.marketplacePurchase.create({
      data: {
        listingId,
        buyerId: userId,
        amount: paymentIntent.amount,
        commission,
        sellerAmount,
        stripePaymentId: paymentIntent.id,
        status: 'COMPLETED',
      },
    });

    // Mark listing as sold
    await prisma.marketplaceListing.update({
      where: { id: listingId },
      data: { status: 'SOLD' },
    });

    // Send emails to buyer and seller
    const [buyer, seller, listing] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.user.findUnique({ where: { id: sellerId } }),
      prisma.marketplaceListing.findUnique({ where: { id: listingId } }),
    ]);

    sendMarketplaceSaleBuyer(buyer, listing, seller).catch(console.error);
    sendMarketplaceSaleSeller(seller, listing, buyer, sellerAmount).catch(console.error);
  }
}

// Helper: Handle subscription update
async function handleSubscriptionUpdate(subscription) {
  const customerId = subscription.customer;

  // Find user by Stripe customer ID
  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (!user) return;

  // Upsert subscription record
  await prisma.subscription.upsert({
    where: { stripeSubscriptionId: subscription.id },
    update: {
      status: subscription.status.toUpperCase(),
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
    create: {
      userId: user.id,
      stripeSubscriptionId: subscription.id,
      status: subscription.status.toUpperCase(),
      plan: subscription.items.data[0].price.recurring.interval === 'month' ? 'MONTHLY' : 'ANNUAL',
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
  });

  // Update user account type
  if (subscription.status === 'active') {
    await prisma.user.update({
      where: { id: user.id },
      data: { accountType: 'MEMBER' },
    });
  }
}

// Helper: Handle subscription cancelation
async function handleSubscriptionCanceled(subscription) {
  const customerId = subscription.customer;

  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (!user) return;

  // Update subscription status
  await prisma.subscription.update({
    where: { stripeSubscriptionId: subscription.id },
    data: { status: 'CANCELED' },
  });

  // Downgrade user account
  await prisma.user.update({
    where: { id: user.id },
    data: { accountType: 'UPGRADE' }, // Downgrade to upgrade level
  });
}

// GET /api/payments/history
router.get('/history', async (req, res) => {
  try {
    const payments = await prisma.payment.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });

    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch payment history' });
  }
});

// GET /api/payments/subscription
router.get('/subscription', async (req, res) => {
  try {
    const subscription = await prisma.subscription.findFirst({
      where: { userId: req.user.id, status: 'ACTIVE' },
    });

    res.json(subscription);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch subscription' });
  }
});

// POST /api/payments/cancel-subscription
router.post('/cancel-subscription', async (req, res) => {
  try {
    const subscription = await prisma.subscription.findFirst({
      where: { userId: req.user.id, status: 'ACTIVE' },
    });

    if (!subscription) {
      return res.status(404).json({ error: 'No active subscription found' });
    }

    // Cancel at period end
    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { cancelAtPeriodEnd: true },
    });

    res.json({ message: 'Subscription will be canceled at period end' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

export default router;
