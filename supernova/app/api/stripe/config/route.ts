import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/stripe/config
 * Returns Stripe publishable key for frontend
 */
export async function GET(request: NextRequest) {
  try {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

    if (!publishableKey) {
      return NextResponse.json(
        { error: 'Stripe publishable key not configured' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      publishableKey,
    });
  } catch (error: any) {
    console.error('Error in GET /api/stripe/config:', error);
    return NextResponse.json(
      { error: 'Failed to get Stripe config' },
      { status: 500 }
    );
  }
}
