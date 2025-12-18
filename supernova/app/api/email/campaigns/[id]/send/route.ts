import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendBulkEmails } from '@/lib/email-sender';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const campaign = await prisma.emailCampaign.findUnique({
      where: { id }
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    if (campaign.status === 'sent') {
      return NextResponse.json({ error: 'Campaign already sent' }, { status: 400 });
    }

    // Get all active subscribers
    const subscribers = await prisma.emailSubscriber.findMany({
      where: {
        status: 'active',
      },
      select: {
        id: true,
        email: true,
        name: true,
      }
    });

    if (subscribers.length === 0) {
      return NextResponse.json({ error: 'No subscribers to send to' }, { status: 400 });
    }

    // Update campaign status to 'sent' immediately
    await prisma.emailCampaign.update({
      where: { id },
      data: {
        status: 'sent',
        sentAt: new Date(),
        sentCount: subscribers.length
      }
    });

    // Send emails asynchronously (don't await)
    sendBulkEmails({
      subscribers: subscribers.map(sub => ({
        email: sub.email,
        subscriberId: sub.id,
        variables: {
          name: sub.name || 'there'
        }
      })),
      subject: campaign.subject,
      html: campaign.content,
      campaignId: campaign.id
    }).catch(error => {
      console.error('[API] Error in background email sending:', error);
    });

    // Return immediately
    return NextResponse.json({
      success: true,
      sent: subscribers.length
    });
  } catch (error) {
    console.error('[API] Error sending campaign:', error);

    // Reset campaign status on error
    try {
      await prisma.emailCampaign.update({
        where: { id },
        data: { status: 'draft' }
      });
    } catch {
      // Ignore cleanup errors
    }

    return NextResponse.json({ error: 'Failed to send campaign' }, { status: 500 });
  }
}
