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

    // Update campaign status to 'sending'
    await prisma.emailCampaign.update({
      where: { id },
      data: {
        status: 'sending',
        sentAt: new Date(),
      }
    });

    // Queue all emails to the database for background processing
    console.log(`[CAMPAIGN] Queuing ${subscribers.length} emails for campaign ${id}`);

    const queuedEmails = await prisma.$transaction(
      subscribers.map(sub =>
        prisma.emailEvent.create({
          data: {
            campaignId: campaign.id,
            subscriberId: sub.id,
            eventType: 'QUEUED',
            metadata: {
              subject: campaign.subject,
              html: campaign.content,
              variables: {
                name: sub.name || 'there',
                email: sub.email,
              }
            }
          }
        })
      )
    );

    console.log(`[CAMPAIGN] Queued ${queuedEmails.length} emails successfully`);

    // Return immediately - emails will be processed by cron job
    return NextResponse.json({
      success: true,
      queued: queuedEmails.length,
      message: 'Emails queued for sending'
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
