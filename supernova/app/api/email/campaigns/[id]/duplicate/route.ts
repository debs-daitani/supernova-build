import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    // Get the original campaign
    const originalCampaign = await prisma.emailCampaign.findUnique({
      where: { id }
    });

    if (!originalCampaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    // Create a duplicate with "Copy of" prefix
    const duplicatedCampaign = await prisma.emailCampaign.create({
      data: {
        name: `Copy of ${originalCampaign.name}`,
        subject: originalCampaign.subject,
        content: originalCampaign.content,
        status: 'draft',
        sentCount: 0,
        openCount: 0,
        clickCount: 0,
      }
    });

    return NextResponse.json(duplicatedCampaign);
  } catch (error) {
    console.error('[API] Error duplicating campaign:', error);
    return NextResponse.json({ error: 'Failed to duplicate campaign' }, { status: 500 });
  }
}
