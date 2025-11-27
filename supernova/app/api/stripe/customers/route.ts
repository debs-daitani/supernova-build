import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth-middleware';
import { getOrCreateStripeCustomer } from '@/lib/stripe';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/stripe/customers
 * Get or create Stripe customer for current user
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

    // Get customer from database
    const stripeCustomer = await prisma.stripeCustomer.findUnique({
      where: { userId: auth.userId },
    });

    return NextResponse.json({
      customerId,
      email: stripeCustomer?.email,
      name: stripeCustomer?.name,
    });
  } catch (error: any) {
    console.error('Error in GET /api/stripe/customers:', error);
    return NextResponse.json(
      { error: 'Failed to get customer' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/stripe/customers
 * Create Stripe customer (if not exists)
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { email, name } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Create Stripe customer
    const customerId = await getOrCreateStripeCustomer(
      auth.userId,
      email,
      name
    );

    return NextResponse.json({ customerId }, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/stripe/customers:', error);
    return NextResponse.json(
      { error: 'Failed to create customer' },
      { status: 500 }
    );
  }
}
