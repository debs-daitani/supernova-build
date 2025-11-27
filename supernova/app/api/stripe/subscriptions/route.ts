import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth-middleware';
import { stripe, getOrCreateStripeCustomer } from '@/lib/stripe';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/stripe/subscriptions
 * List current user's subscriptions
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const subscriptions = await prisma.subscription.findMany({
      where: { userId: auth.userId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ subscriptions });
  } catch (error: any) {
    console.error('Error in GET /api/stripe/subscriptions:', error);
    return NextResponse.json(
      { error: 'Failed to get subscriptions' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/stripe/subscriptions
 * Create subscription directly (alternative to checkout)
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { priceId, paymentMethodId, trialPeriodDays } = body;

    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID is required' },
        { status: 400 }
      );
    }

    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: { email: true, name: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get or create Stripe customer
    const customerId = await getOrCreateStripeCustomer(
      auth.userId,
      user.email,
      user.name || undefined
    );

    // Attach payment method if provided
    if (paymentMethodId) {
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });

      // Set as default payment method
      await stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });
    }

    // Create subscription in Stripe
    const subscriptionData: any = {
      customer: customerId,
      items: [{ price: priceId }],
      metadata: {
        userId: auth.userId,
      },
    };

    if (trialPeriodDays) {
      subscriptionData.trial_period_days = trialPeriodDays;
    }

    if (!paymentMethodId) {
      subscriptionData.payment_behavior = 'default_incomplete';
    }

    const stripeSubscription = await stripe.subscriptions.create(subscriptionData);

    // Get price details
    const price = await prisma.price.findUnique({
      where: { stripePriceId: priceId },
      include: { product: true },
    });

    // Map Stripe status to our enum
    const statusMap: Record<string, any> = {
      active: 'ACTIVE',
      past_due: 'PAST_DUE',
      canceled: 'CANCELED',
      incomplete: 'INCOMPLETE',
      incomplete_expired: 'INCOMPLETE_EXPIRED',
      trialing: 'TRIALING',
      unpaid: 'UNPAID',
    };

    // Save subscription to database
    const subscription = await prisma.subscription.create({
      data: {
        userId: auth.userId,
        stripeCustomerId: customerId,
        stripeSubscriptionId: stripeSubscription.id,
        stripePriceId: priceId,
        stripeProductId: price?.product?.stripeProductId || null,
        status: statusMap[stripeSubscription.status] || 'INCOMPLETE',
        currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
        currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
        cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
        trialStart: stripeSubscription.trial_start
          ? new Date(stripeSubscription.trial_start * 1000)
          : null,
        trialEnd: stripeSubscription.trial_end
          ? new Date(stripeSubscription.trial_end * 1000)
          : null,
      },
    });

    return NextResponse.json(
      {
        subscription,
        clientSecret: (stripeSubscription as any).latest_invoice?.payment_intent
          ?.client_secret,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error in POST /api/stripe/subscriptions:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create subscription' },
      { status: 500 }
    );
  }
}
