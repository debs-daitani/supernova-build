import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth-middleware';
import { stripe } from '@/lib/stripe';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/stripe/prices
 * List all active prices
 */
export async function GET(request: NextRequest) {
  try {
    const prices = await prisma.price.findMany({
      where: { active: true },
      include: {
        product: true,
      },
      orderBy: { amount: 'asc' },
    });

    return NextResponse.json({ prices });
  } catch (error: any) {
    console.error('Error in GET /api/stripe/prices:', error);
    return NextResponse.json(
      { error: 'Failed to get prices' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/stripe/prices
 * Create price (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: { role: true },
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const {
      productId,
      amount,
      currency = 'gbp',
      interval = 'MONTH',
      intervalCount = 1,
      nickname,
      trialPeriodDays,
    } = body;

    if (!productId || !amount) {
      return NextResponse.json(
        { error: 'Product ID and amount are required' },
        { status: 400 }
      );
    }

    // Get product
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product || !product.stripeProductId) {
      return NextResponse.json(
        { error: 'Product not found or not linked to Stripe' },
        { status: 404 }
      );
    }

    // Map interval to Stripe format
    const intervalMap: Record<string, 'month' | 'year' | 'week' | 'day'> = {
      MONTH: 'month',
      YEAR: 'year',
      WEEK: 'week',
      DAY: 'day',
    };

    // Create price in Stripe
    const stripePriceData: any = {
      product: product.stripeProductId,
      unit_amount: amount,
      currency: currency.toLowerCase(),
      nickname: nickname || undefined,
    };

    if (interval !== 'ONE_TIME') {
      stripePriceData.recurring = {
        interval: intervalMap[interval] || 'month',
        interval_count: intervalCount,
      };

      if (trialPeriodDays) {
        stripePriceData.recurring.trial_period_days = trialPeriodDays;
      }
    }

    const stripePrice = await stripe.prices.create(stripePriceData);

    // Save to database
    const price = await prisma.price.create({
      data: {
        productId,
        stripePriceId: stripePrice.id,
        amount,
        currency,
        interval,
        intervalCount,
        nickname: nickname || null,
        trialPeriodDays: trialPeriodDays || null,
        active: true,
      },
      include: {
        product: true,
      },
    });

    return NextResponse.json({ price }, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/stripe/prices:', error);
    return NextResponse.json(
      { error: 'Failed to create price' },
      { status: 500 }
    );
  }
}
