import { NextRequest, NextResponse } from 'next/server';
import { trackEmailOpen } from '@/lib/email-sender';

export async function GET(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  await trackEmailOpen(params.eventId);

  // Return 1x1 transparent pixel
  const pixel = Buffer.from(
    'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
    'base64'
  );

  return new NextResponse(pixel, {
    headers: {
      'Content-Type': 'image/gif',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  });
}
