import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth-middleware';
import { stripe, getOrCreateStripeCustomer } from '@/lib/stripe';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/stripe/payment-methods
 * List user's payment methods
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get Stripe customer
    const stripeCustomer = await prisma.stripeCustomer.findUnique({
      where: { userId: auth.userId },
    });

    if (!stripeCustomer) {
      return NextResponse.json({ paymentMethods: [] });
    }

    // Get payment methods from Stripe
    const paymentMethods = await stripe.paymentMethods.list({
      customer: stripeCustomer.stripeCustomerId,
      type: 'card',
    });

    // Get saved payment methods from database
    const savedMethods = await prisma.paymentMethod.findMany({
      where: { userId: auth.userId },
    });

    return NextResponse.json({
      paymentMethods: paymentMethods.data,
      savedMethods,
    });
  } catch (error: any) {
    console.error('Error in GET /api/stripe/payment-methods:', error);
    return NextResponse.json(
      { error: 'Failed to get payment methods' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/stripe/payment-methods
 * Attach payment method to customer
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { paymentMethodId, setAsDefault } = body;

    if (!paymentMethodId) {
      return NextResponse.json(
        { error: 'Payment method ID is required' },
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

    // Attach payment method
    const paymentMethod = await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });

    // Set as default if requested
    if (setAsDefault) {
      await stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });

      // Update all other payment methods to not be default
      await prisma.paymentMethod.updateMany({
        where: { userId: auth.userId },
        data: { isDefault: false },
      });
    }

    // Save to database
    const saved = await prisma.paymentMethod.create({
      data: {
        userId: auth.userId,
        stripePaymentMethodId: paymentMethodId,
        stripeCustomerId: customerId,
        type: 'CARD',
        last4: (paymentMethod as any).card?.last4 || null,
        brand: (paymentMethod as any).card?.brand || null,
        expiryMonth: (paymentMethod as any).card?.exp_month || null,
        expiryYear: (paymentMethod as any).card?.exp_year || null,
        isDefault: setAsDefault || false,
      },
    });

    return NextResponse.json({ paymentMethod: saved }, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/stripe/payment-methods:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to attach payment method' },
      { status: 500 }
    );
  }
}
