import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail, generateUnsubscribeUrl } from '@/lib/email-sender';

const BATCH_SIZE = 50; // Process 50 emails per cron run
const MAX_RETRIES = 3;

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[QUEUE] Starting email queue processing...');

    // Get queued emails (oldest first, limit by batch size)
    const queuedEmails = await prisma.emailEvent.findMany({
      where: {
        eventType: 'QUEUED'
      },
      take: BATCH_SIZE,
      orderBy: {
        createdAt: 'asc'
      },
      include: {
        subscriber: true,
        campaign: true
      }
    });

    if (queuedEmails.length === 0) {
      console.log('[QUEUE] No emails in queue');
      return NextResponse.json({ processed: 0, message: 'Queue empty' });
    }

    console.log(`[QUEUE] Processing ${queuedEmails.length} queued emails`);

    let sent = 0;
    let failed = 0;

    for (const queuedEmail of queuedEmails) {
      try {
        const metadata = queuedEmail.metadata as any;
        const variables = metadata.variables || {};

        // Send the email
        const success = await sendEmail({
          to: queuedEmail.subscriber.email,
          subject: metadata.subject,
          html: metadata.html,
          campaignId: queuedEmail.campaignId || undefined,
          subscriberId: queuedEmail.subscriberId,
          unsubscribeUrl: generateUnsubscribeUrl(queuedEmail.subscriberId)
        });

        if (success) {
          // Mark as sent by deleting the queue entry
          await prisma.emailEvent.delete({
            where: { id: queuedEmail.id }
          });

          // Update campaign sent count
          if (queuedEmail.campaignId) {
            await prisma.emailCampaign.update({
              where: { id: queuedEmail.campaignId },
              data: {
                sentCount: {
                  increment: 1
                }
              }
            });
          }

          sent++;
          console.log(`[QUEUE] Sent email to ${queuedEmail.subscriber.email}`);
        } else {
          // Retry logic: increment retry count
          const retryCount = (metadata.retryCount || 0) + 1;

          if (retryCount >= MAX_RETRIES) {
            // Max retries reached, mark as failed and remove from queue
            await prisma.emailEvent.update({
              where: { id: queuedEmail.id },
              data: {
                eventType: 'FAILED',
                metadata: {
                  ...metadata,
                  retryCount,
                  failedAt: new Date().toISOString()
                }
              }
            });
            failed++;
            console.error(`[QUEUE] Failed to send email to ${queuedEmail.subscriber.email} after ${MAX_RETRIES} retries`);
          } else {
            // Update retry count
            await prisma.emailEvent.update({
              where: { id: queuedEmail.id },
              data: {
                metadata: {
                  ...metadata,
                  retryCount
                }
              }
            });
            console.log(`[QUEUE] Retry ${retryCount}/${MAX_RETRIES} for ${queuedEmail.subscriber.email}`);
          }
        }

        // Rate limiting: wait 100ms between emails
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`[QUEUE] Error processing email ${queuedEmail.id}:`, error);
        failed++;
      }
    }

    // Check if all emails for any campaigns are complete
    const campaigns = [...new Set(queuedEmails.map(e => e.campaignId).filter(Boolean))];
    for (const campaignId of campaigns) {
      const remainingQueued = await prisma.emailEvent.count({
        where: {
          campaignId: campaignId!,
          eventType: 'QUEUED'
        }
      });

      if (remainingQueued === 0) {
        // All emails sent, update campaign status to 'sent'
        await prisma.emailCampaign.update({
          where: { id: campaignId! },
          data: {
            status: 'sent'
          }
        });
        console.log(`[QUEUE] Campaign ${campaignId} completed`);
      }
    }

    console.log(`[QUEUE] Batch complete. Sent: ${sent}, Failed: ${failed}`);

    // Check if there are more queued emails to process
    const remainingInQueue = await prisma.emailEvent.count({
      where: { eventType: 'QUEUED' }
    });

    console.log(`[QUEUE] Remaining emails in queue: ${remainingInQueue}`);

    if (remainingInQueue > 0) {
      // Auto-trigger next batch processing
      console.log(`[QUEUE] Auto-triggering next batch processing...`);
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://supernova-b5ekalzz9-debs-daitanis-projects.vercel.app';

      fetch(`${baseUrl}/api/email/process-queue`, {
        method: 'GET',
        headers: {
          'Authorization': request.headers.get('authorization') || ''
        }
      }).catch(error => {
        console.error('[QUEUE] Failed to trigger next batch:', error);
      });

      return NextResponse.json({
        processed: queuedEmails.length,
        sent,
        failed,
        remaining: remainingInQueue,
        message: 'Batch complete, next batch triggered automatically'
      });
    } else {
      console.log(`[QUEUE] All emails processed successfully!`);
      return NextResponse.json({
        processed: queuedEmails.length,
        sent,
        failed,
        remaining: 0,
        message: 'Queue processing complete - all emails sent'
      });
    }
  } catch (error) {
    console.error('[QUEUE] Error processing queue:', error);
    return NextResponse.json({ error: 'Failed to process queue' }, { status: 500 });
  }
}
