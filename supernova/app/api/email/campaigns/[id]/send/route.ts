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

    // Use createMany for much faster bulk insert (single query instead of 263 queries)
    await prisma.emailEvent.createMany({
      data: subscribers.map(sub => ({
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
      }))
    });

    console.log(`[CAMPAIGN] Queued ${subscribers.length} emails successfully`);

    // Trigger queue processing immediately (non-blocking)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://supernova-b5ekalzz9-debs-daitanis-projects.vercel.app';
    const queueUrl = `${baseUrl}/api/email/process-queue`;
    console.log(`[CAMPAIGN] Triggering queue processor at: ${queueUrl}`);
    console.log(`[CAMPAIGN] CRON_SECRET exists:`, !!process.env.CRON_SECRET);

    fetch(queueUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.CRON_SECRET}`
      }
    })
      .then(res => {
        console.log(`[CAMPAIGN] Queue processor response status: ${res.status}`);
        return res.json();
      })
      .then(data => {
        console.log(`[CAMPAIGN] Queue processor response:`, JSON.stringify(data, null, 2));
      })
      .catch(error => {
        console.error('[CAMPAIGN] Failed to trigger queue processing:', error);
        console.error('[CAMPAIGN] Error details:', error.message);
      });

    // Return immediately - emails will be processed in background
    return NextResponse.json({
      success: true,
      queued: subscribers.length,
      message: 'Emails queued and processing started'
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
