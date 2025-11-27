import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendBulkEmails, generateUnsubscribeUrl } from '@/lib/email-sender';

export async function POST(
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

    if (campaign.status === 'SENT') {
      return NextResponse.json({ error: 'Campaign already sent' }, { status: 400 });
    }

    // Get subscribers from all selected lists
    const subscribers = await prisma.emailSubscriber.findMany({
      where: {
        status: 'SUBSCRIBED',
        lists: {
          some: {
            listId: {
              in: campaign.listIds
            }
          }
        }
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true
      }
    });

    if (subscribers.length === 0) {
      return NextResponse.json({ error: 'No subscribers to send to' }, { status: 400 });
    }

    // Update campaign status
    await prisma.emailCampaign.update({
      where: { id: params.id },
      data: {
        status: 'SENDING'
      }
    });

    // Send emails
    const results = await sendBulkEmails({
      subscribers: subscribers.map(sub => ({
        email: sub.email,
        subscriberId: sub.id,
        variables: {
          firstName: sub.firstName || '',
          lastName: sub.lastName || '',
          name: [sub.firstName, sub.lastName].filter(Boolean).join(' ') || 'there'
        }
      })),
      subject: campaign.subject,
      html: campaign.htmlContent,
      text: campaign.textContent || undefined,
      fromName: campaign.fromName,
      fromEmail: campaign.fromEmail,
      replyTo: campaign.replyTo || undefined,
      campaignId: campaign.id
    });

    // Update campaign with results
    await prisma.emailCampaign.update({
      where: { id: params.id },
      data: {
        status: 'SENT',
        sentAt: new Date(),
        sentCount: results.sent
      }
    });

    return NextResponse.json({
      success: true,
      sent: results.sent,
      failed: results.failed
    });
  } catch (error) {
    console.error('[API] Error sending campaign:', error);

    // Reset campaign status on error
    await prisma.emailCampaign.update({
      where: { id: params.id },
      data: { status: 'DRAFT' }
    });

    return NextResponse.json({ error: 'Failed to send campaign' }, { status: 500 });
  }
}
