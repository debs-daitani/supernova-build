import { NextRequest, NextResponse } from 'next/server';
import { trackEmailClick } from '@/lib/email-sender';

export async function GET(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.redirect('/');
  }

  await trackEmailClick(params.eventId, url);

  return NextResponse.redirect(url);
}
