import { NextRequest, NextResponse } from 'next/server';
import { unsubscribeEmail } from '@/lib/email-sender';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ subscriberId: string }> }
) {
  try {
    const { subscriberId } = await params;
    const success = await unsubscribeEmail(subscriberId);

    if (success) {
      return NextResponse.json({ success: true, message: 'Successfully unsubscribed' });
    } else {
      return NextResponse.json({ error: 'Failed to unsubscribe' }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to unsubscribe' }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ subscriberId: string }> }
) {
  const { subscriberId } = await params;
  // Also support GET for email links
  await unsubscribeEmail(subscriberId);

  // Redirect to unsubscribe confirmation page
  return NextResponse.redirect(
    new URL('/email/unsubscribed', request.url)
  );
}
