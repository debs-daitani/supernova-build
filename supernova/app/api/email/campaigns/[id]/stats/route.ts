import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaign = await prisma.emailCampaign.findUnique({
      where: { id: params.id }
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    // Get detailed event statistics
    const events = await prisma.emailEvent.findMany({
      where: { campaignId: params.id },
      include: {
        subscriber: {
          select: {
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    // Group events by type
    const eventsByType = events.reduce((acc: any, event) => {
      if (!acc[event.type]) {
        acc[event.type] = [];
      }
      acc[event.type].push(event);
      return acc;
    }, {});

    // Calculate click stats
    const clickedLinks = events
      .filter(e => e.type === 'CLICKED' && e.data)
      .reduce((acc: any, event: any) => {
        const url = event.data.url;
        if (!acc[url]) {
          acc[url] = 0;
        }
        acc[url]++;
        return acc;
      }, {});

    // Calculate rates
    const sentCount = campaign.sentCount || 0;
    const openRate = sentCount > 0 ? (campaign.openedCount / sentCount) * 100 : 0;
    const clickRate = sentCount > 0 ? (campaign.clickedCount / sentCount) * 100 : 0;
    const unsubscribeRate = sentCount > 0 ? (campaign.unsubscribedCount / sentCount) * 100 : 0;

    return NextResponse.json({
      campaign,
      stats: {
        sent: sentCount,
        opened: campaign.openedCount,
        clicked: campaign.clickedCount,
        bounced: campaign.bouncedCount,
        unsubscribed: campaign.unsubscribedCount,
        openRate: openRate.toFixed(2),
        clickRate: clickRate.toFixed(2),
        unsubscribeRate: unsubscribeRate.toFixed(2)
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
