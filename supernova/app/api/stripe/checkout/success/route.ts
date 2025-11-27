import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth-middleware';
import { stripe } from '@/lib/stripe';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/stripe/checkout/success
 * Handle successful checkout redirect and return session data
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'subscription', 'payment_intent'],
    });

    // Verify the session belongs to the current user
    if (session.metadata?.userId !== auth.userId) {
      return NextResponse.json(
        { error: 'Session does not belong to user' },
        { status: 403 }
      );
    }

    let subscription = null;
    let payment = null;

    // Get subscription details if it's a subscription
    if (session.mode === 'subscription' && typeof session.subscription === 'object') {
      const sub = session.subscription as any;
      subscription = await prisma.subscription.findUnique({
        where: { stripeSubscriptionId: sub.id },
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      });
    }

    // Get payment details if it's a one-time payment
    if (session.mode === 'payment' && typeof session.payment_intent === 'object') {
      const pi = session.payment_intent as any;
      payment = await prisma.payment.findUnique({
        where: { stripePaymentIntentId: pi.id },
      });
    }

    return NextResponse.json({
      session: {
        id: session.id,
        status: session.status,
        payment_status: session.payment_status,
        amount_total: session.amount_total,
        currency: session.currency,
        customer_email: session.customer_details?.email,
      },
      subscription,
      payment,
    });
  } catch (error: any) {
    console.error('Error in GET /api/stripe/checkout/success:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve checkout session' },
      { status: 500 }
    );
  }
}
