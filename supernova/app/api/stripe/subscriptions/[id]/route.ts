import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth-middleware';
import { stripe } from '@/lib/stripe';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/stripe/subscriptions/[id]
 * Get subscription details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const auth = await verifyAuth(request);
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const subscription = await prisma.subscription.findUnique({
      where: {
        id: id,
        userId: auth.userId,
      },
    });

    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    // Get latest details from Stripe
    const stripeSubscription = await stripe.subscriptions.retrieve(
      subscription.stripeSubscriptionId
    );

    return NextResponse.json({
      subscription,
      stripeDetails: stripeSubscription,
    });
  } catch (error: any) {
    console.error('Error in GET /api/stripe/subscriptions/[id]:', error);
    return NextResponse.json(
      { error: 'Failed to get subscription' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/stripe/subscriptions/[id]
 * Update subscription (change plan, etc.)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const auth = await verifyAuth(request);
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { priceId, cancelAtPeriodEnd, prorationBehavior = 'create_prorations' } = body;

    const subscription = await prisma.subscription.findUnique({
      where: {
        id: id,
        userId: auth.userId,
      },
    });

    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    const updateData: any = {};

    // Update price if provided
    if (priceId) {
      updateData.items = [
        {
          id: (await stripe.subscriptions.retrieve(subscription.stripeSubscriptionId))
            .items.data[0].id,
          price: priceId,
        },
      ];
      updateData.proration_behavior = prorationBehavior;
    }

    // Update cancel at period end if provided
    if (cancelAtPeriodEnd !== undefined) {
      updateData.cancel_at_period_end = cancelAtPeriodEnd;
    }

    // Update in Stripe
    const updated = await stripe.subscriptions.update(
      subscription.stripeSubscriptionId,
      updateData
    );

    // Update in database
    const statusMap: Record<string, any> = {
      active: 'ACTIVE',
      past_due: 'PAST_DUE',
      canceled: 'CANCELED',
      incomplete: 'INCOMPLETE',
      incomplete_expired: 'INCOMPLETE_EXPIRED',
      trialing: 'TRIALING',
      unpaid: 'UNPAID',
    };

    const updatedSub = await prisma.subscription.update({
      where: { id: id },
      data: {
        stripePriceId: priceId || subscription.stripePriceId,
        status: statusMap[updated.status] || subscription.status,
        cancelAtPeriodEnd: updated.cancel_at_period_end,
        currentPeriodStart: new Date(updated.current_period_start * 1000),
        currentPeriodEnd: new Date(updated.current_period_end * 1000),
      },
    });

    return NextResponse.json({ subscription: updatedSub });
  } catch (error: any) {
    console.error('Error in PATCH /api/stripe/subscriptions/[id]:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update subscription' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/stripe/subscriptions/[id]
 * Cancel subscription immediately
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const auth = await verifyAuth(request);
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const subscription = await prisma.subscription.findUnique({
      where: {
        id: id,
        userId: auth.userId,
      },
    });

    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    // Cancel in Stripe
    await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);

    // Update in database
    await prisma.subscription.update({
      where: { id: id },
      data: {
        status: 'CANCELED',
        canceledAt: new Date(),
      },
    });

    return NextResponse.json({ message: 'Subscription canceled' });
  } catch (error: any) {
    console.error('Error in DELETE /api/stripe/subscriptions/[id]:', error);
    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
}
