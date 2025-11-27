import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Get total subscribers
    const totalSubscribers = await prisma.emailSubscriber.count();
    const activeSubscribers = await prisma.emailSubscriber.count({
      where: { status: 'SUBSCRIBED' }
    });

    // Get subscriber growth over last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const subscriberGrowth = await prisma.emailSubscriber.groupBy({
      by: ['subscribedAt'],
      where: {
        subscribedAt: { gte: thirtyDaysAgo }
      },
      _count: true
    });

    // Get campaign stats
    const campaigns = await prisma.emailCampaign.findMany({
      where: { status: 'SENT' },
      orderBy: { sentAt: 'desc' },
      take: 10
    });

    const totalSent = campaigns.reduce((sum, c) => sum + c.sentCount, 0);
    const totalOpened = campaigns.reduce((sum, c) => sum + c.openedCount, 0);
    const totalClicked = campaigns.reduce((sum, c) => sum + c.clickedCount, 0);
    const totalUnsubscribed = campaigns.reduce((sum, c) => sum + c.unsubscribedCount, 0);

    const avgOpenRate = totalSent > 0 ? (totalOpened / totalSent) * 100 : 0;
    const avgClickRate = totalSent > 0 ? (totalClicked / totalSent) * 100 : 0;
    const unsubscribeRate = totalSent > 0 ? (totalUnsubscribed / totalSent) * 100 : 0;

    // Get event counts by type
    const eventCounts = await prisma.emailEvent.groupBy({
      by: ['type'],
      _count: true
    });

    // Get top performing campaigns
    const topCampaigns = campaigns
      .map(c => ({
        ...c,
        openRate: c.sentCount > 0 ? (c.openedCount / c.sentCount) * 100 : 0,
        clickRate: c.sentCount > 0 ? (c.clickedCount / c.sentCount) * 100 : 0
      }))
      .sort((a, b) => b.openRate - a.openRate)
      .slice(0, 5);

    return NextResponse.json({
      subscribers: {
        total: totalSubscribers,
        active: activeSubscribers,
        unsubscribed: totalSubscribers - activeSubscribers,
        growth: subscriberGrowth
      },
      campaigns: {
        total: campaigns.length,
        sent: totalSent,
        opened: totalOpened,
        clicked: totalClicked,
        avgOpenRate: avgOpenRate.toFixed(2),
        avgClickRate: avgClickRate.toFixed(2),
        unsubscribeRate: unsubscribeRate.toFixed(2),
        topPerforming: topCampaigns
      },
      events: eventCounts
    });
  } catch (error) {
    console.error('[API] Error fetching analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
