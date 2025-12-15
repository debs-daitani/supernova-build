import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth-middleware';
import { stripe } from '@/lib/stripe';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/stripe/products/[id]
 * Get product details with prices
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const product = await prisma.product.findUnique({
      where: { id: id },
      include: {
        prices: {
          where: { active: true },
          orderBy: { amount: 'asc' },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error: any) {
    console.error('Error in GET /api/stripe/products/[id]:', error);
    return NextResponse.json(
      { error: 'Failed to get product' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/stripe/products/[id]
 * Update product (admin only)
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

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: { role: true },
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, features, active } = body;

    const product = await prisma.product.findUnique({
      where: { id: id },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Update in Stripe if stripeProductId exists
    if (product.stripeProductId) {
      await stripe.products.update(product.stripeProductId, {
        name: name || undefined,
        description: description || undefined,
        active: active !== undefined ? active : undefined,
      });
    }

    // Update in database
    const updated = await prisma.product.update({
      where: { id: id },
      data: {
        name: name || undefined,
        description: description !== undefined ? description : undefined,
        features: features || undefined,
        active: active !== undefined ? active : undefined,
      },
      include: {
        prices: true,
      },
    });

    return NextResponse.json({ product: updated });
  } catch (error: any) {
    console.error('Error in PATCH /api/stripe/products/[id]:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/stripe/products/[id]
 * Deactivate product (admin only)
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

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: { role: true },
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const product = await prisma.product.findUnique({
      where: { id: id },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Deactivate in Stripe
    if (product.stripeProductId) {
      await stripe.products.update(product.stripeProductId, {
        active: false,
      });
    }

    // Deactivate in database
    await prisma.product.update({
      where: { id: id },
      data: { active: false },
    });

    return NextResponse.json({ message: 'Product deactivated' });
  } catch (error: any) {
    console.error('Error in DELETE /api/stripe/products/[id]:', error);
    return NextResponse.json(
      { error: 'Failed to deactivate product' },
      { status: 500 }
    );
  }
}
