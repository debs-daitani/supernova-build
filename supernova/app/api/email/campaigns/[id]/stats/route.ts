import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const campaign = await prisma.emailCampaign.findUnique({
      where: { id: id }
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    // Get detailed event statistics
    const events = await prisma.emailEvent.findMany({
      where: { campaignId: id },
      include: {
        subscriber: {
          select: {
            email: true,
            name: true,
          }
        }
      }
    });

    // Group events by type
    const eventsByType = events.reduce((acc: any, event) => {
      if (!acc[event.eventType]) {
        acc[event.eventType] = [];
      }
      acc[event.eventType].push(event);
      return acc;
    }, {});

    // Calculate click stats
    const clickedLinks = events
      .filter(e => e.eventType === 'click' && e.metadata)
      .reduce((acc: any, event: any) => {
        const url = (event.metadata as any)?.url;
        if (url) {
          if (!acc[url]) {
            acc[url] = 0;
          }
          acc[url]++;
        }
        return acc;
      }, {});

    // Calculate rates
    const sentCount = campaign.sentCount || 0;
    const openRate = sentCount > 0 ? (campaign.openCount / sentCount) * 100 : 0;
    const clickRate = sentCount > 0 ? (campaign.clickCount / sentCount) * 100 : 0;

    return NextResponse.json({
      campaign,
      stats: {
        sent: sentCount,
        opened: campaign.openCount,
        clicked: campaign.clickCount,
        openRate: openRate.toFixed(2),
        clickRate: clickRate.toFixed(2),
      },
      eventsByType,
      clickedLinks,
      recentEvents: events.slice(0, 50)
    });
  } catch (error) {
    console.error('[API] Error fetching campaign stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
