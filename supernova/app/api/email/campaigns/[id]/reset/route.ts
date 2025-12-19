import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    // Reset campaign to draft status
    await prisma.emailCampaign.update({
      where: { id },
      data: {
        status: 'draft',
        sentCount: 0,
        openCount: 0,
        clickCount: 0,
        sentAt: null
      }
    });

    // Delete any queued emails for this campaign
    await prisma.emailEvent.deleteMany({
      where: {
        campaignId: id,
        eventType: 'QUEUED'
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API] Error resetting campaign:', error);
    return NextResponse.json({ error: 'Failed to reset campaign' }, { status: 500 });
  }
}
