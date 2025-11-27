import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth-middleware';
import { stripe, getOrCreateStripeCustomer } from '@/lib/stripe';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * POST /api/stripe/checkout
 * Create Stripe checkout session for subscription or one-time payment
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { priceId, mode = 'subscription', successUrl, cancelUrl, metadata } = body;

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

    // Get price to determine mode and product
    const price = await prisma.price.findUnique({
      where: { stripePriceId: priceId },
      include: { product: true },
    });

    // Determine checkout mode based on price interval
    const checkoutMode = price?.interval === 'ONE_TIME' ? 'payment' : 'subscription';

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: checkoutMode as 'subscription' | 'payment',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url:
        successUrl ||
        `${process.env.NEXT_PUBLIC_APP_URL}/billing/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:
        cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/billing/plans`,
      metadata: {
        userId: auth.userId,
        ...metadata,
      },
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      customer_update: {
        address: 'auto',
        name: 'auto',
      },
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error: any) {
    console.error('Error in POST /api/stripe/checkout:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
