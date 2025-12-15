import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth-middleware';
import { stripe } from '@/lib/stripe';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * PATCH /api/stripe/payment-methods/[id]
 * Set payment method as default
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

    const paymentMethod = await prisma.paymentMethod.findUnique({
      where: {
        id: id,
        userId: auth.userId,
      },
    });

    if (!paymentMethod) {
      return NextResponse.json(
        { error: 'Payment method not found' },
        { status: 404 }
      );
    }

    // Set as default in Stripe
    await stripe.customers.update(paymentMethod.stripeCustomerId, {
      invoice_settings: {
        default_payment_method: paymentMethod.stripePaymentMethodId,
      },
    });

    // Update all other payment methods to not be default
    await prisma.paymentMethod.updateMany({
      where: { userId: auth.userId },
      data: { isDefault: false },
    });

    // Set this one as default
    const updated = await prisma.paymentMethod.update({
      where: { id: id },
      data: { isDefault: true },
    });

    return NextResponse.json({ paymentMethod: updated });
  } catch (error: any) {
    console.error('Error in PATCH /api/stripe/payment-methods/[id]:', error);
    return NextResponse.json(
      { error: 'Failed to update payment method' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/stripe/payment-methods/[id]
 * Detach payment method
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

    const paymentMethod = await prisma.paymentMethod.findUnique({
      where: {
        id: id,
        userId: auth.userId,
      },
    });

    if (!paymentMethod) {
      return NextResponse.json(
        { error: 'Payment method not found' },
        { status: 404 }
      );
    }

    // Detach from Stripe
    await stripe.paymentMethods.detach(paymentMethod.stripePaymentMethodId);

    // Delete from database
    await prisma.paymentMethod.delete({
      where: { id: id },
    });

    return NextResponse.json({ message: 'Payment method removed' });
  } catch (error: any) {
    console.error('Error in DELETE /api/stripe/payment-methods/[id]:', error);
    return NextResponse.json(
      { error: 'Failed to remove payment method' },
      { status: 500 }
    );
  }
}
