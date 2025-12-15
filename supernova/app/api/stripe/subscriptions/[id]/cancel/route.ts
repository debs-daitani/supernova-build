import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth-middleware';
import { stripe } from '@/lib/stripe';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * POST /api/stripe/subscriptions/[id]/cancel
 * Cancel subscription at period end
 */
export async function POST(
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

    // Update in Stripe to cancel at period end
    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    // Update in database
    const updated = await prisma.subscription.update({
      where: { id: id },
      data: {
        cancelAtPeriodEnd: true,
        canceledAt: new Date(),
      },
    });

    return NextResponse.json({
      subscription: updated,
      message: 'Subscription will cancel at period end',
    });
  } catch (error: any) {
    console.error('Error in POST /api/stripe/subscriptions/[id]/cancel:', error);
    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/stripe/subscriptions/[id]/cancel
 * Reactivate subscription (undo cancellation)
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

    // Update in Stripe to reactivate
    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: false,
    });

    // Update in database
    const updated = await prisma.subscription.update({
      where: { id: id },
      data: {
        cancelAtPeriodEnd: false,
        canceledAt: null,
      },
    });

    return NextResponse.json({
      subscription: updated,
      message: 'Subscription reactivated',
    });
  } catch (error: any) {
    console.error('Error in DELETE /api/stripe/subscriptions/[id]/cancel:', error);
    return NextResponse.json(
      { error: 'Failed to reactivate subscription' },
      { status: 500 }
    );
  }
}
