import { NextRequest, NextResponse } from 'next/server';
import { unsubscribeEmail } from '@/lib/email-sender';

export async function POST(
  request: NextRequest,
  { params }: { params: { subscriberId: string } }
) {
  try {
    const success = await unsubscribeEmail(params.subscriberId);

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
  { params }: { params: { subscriberId: string } }
) {
  // Also support GET for email links
  await unsubscribeEmail(params.subscriberId);

  // Redirect to unsubscribe confirmation page
  return NextResponse.redirect(
    new URL('/email/unsubscribed', request.url)
  );
}
