/**
 * Email Sending Service for dAItaniverse
 *
 * This service provides email sending functionality with tracking and analytics.
 * Integrated with Resend for reliable email delivery.
 */

import { Resend } from 'resend';
import { prisma } from './prisma';

// Verify API key is loaded
if (!process.env.RESEND_API_KEY) {
  console.error('[EMAIL] WARNING: RESEND_API_KEY environment variable is not set!');
} else {
  console.log('[EMAIL] Resend API key loaded (first 10 chars):', process.env.RESEND_API_KEY.substring(0, 10) + '...');
}

const resend = new Resend(process.env.RESEND_API_KEY);

export interface EmailOptions {
  to: string;
  from?: string;
  fromName?: string;
  replyTo?: string;
  subject: string;
  html: string;
  text?: string;
  campaignId?: string;
  sequenceEmailId?: string;
  subscriberId?: string;
  unsubscribeUrl?: string;
}

export interface BulkEmailOptions {
  subscribers: Array<{
    email: string;
    subscriberId: string;
    variables?: Record<string, string>;
  }>;
  from?: string;
  fromName?: string;
  replyTo?: string;
  subject: string;
  html: string;
  text?: string;
  campaignId?: string;
  sequenceEmailId?: string;
}

/**
 * Replace template variables in content
 */
function replaceVariables(
  content: string,
  variables: Record<string, string> = {}
): string {
  let result = content;

  // Replace all {{variable}} patterns
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, value);
  });

  return result;
}

/**
 * Generate unsubscribe URL for a subscriber
 */
export function generateUnsubscribeUrl(subscriberId: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${baseUrl}/email/unsubscribe/${subscriberId}`;
}

/**
 * Add tracking pixel to HTML content
 */
function addTrackingPixel(html: string, eventId: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const trackingPixel = `<img src="${baseUrl}/api/email/track/open/${eventId}" width="1" height="1" style="display:none;" />`;

  // Try to insert before closing body tag
  if (html.includes('</body>')) {
    return html.replace('</body>', `${trackingPixel}</body>`);
  }

  // Otherwise append to end
  return html + trackingPixel;
}

/**
 * Wrap links with click tracking
 */
function addClickTracking(html: string, eventId: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  // Find all href attributes and wrap them with tracking URL
  return html.replace(/href="([^"]+)"/g, (match, url) => {
    // Skip mailto, tel, and anchor links
    if (url.startsWith('mailto:') || url.startsWith('tel:') || url.startsWith('#')) {
      return match;
    }

    const trackingUrl = `${baseUrl}/api/email/track/click/${eventId}?url=${encodeURIComponent(url)}`;
    return `href="${trackingUrl}"`;
  });
}

/**
 * Send a single email
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const {
      to,
      from = process.env.EMAIL_FROM || 'onboarding@resend.dev',
      fromName = 'dAItaniverse',
      replyTo,
      subject,
      html,
      text,
      campaignId,
      sequenceEmailId,
      subscriberId,
      unsubscribeUrl
    } = options;

    // Get or create subscriber
    let subscriber = subscriberId
      ? await prisma.emailSubscriber.findUnique({ where: { id: subscriberId } })
      : await prisma.emailSubscriber.findUnique({ where: { email: to } });

    if (!subscriber) {
      subscriber = await prisma.emailSubscriber.create({
        data: {
          email: to,
          status: 'active',
          source: 'MANUAL'
        }
      });
    }

    // Check if subscriber is unsubscribed
    if (subscriber.status !== 'active') {
      console.log(`[EMAIL] Skipping email to ${to} - status: ${subscriber.status}`);
      return false;
    }

    // Create email event for tracking
    const event = await prisma.emailEvent.create({
      data: {
        subscriberId: subscriber.id,
        campaignId,
        sequenceEmailId,
        type: 'SENT',
        data: {
          subject,
          from: `${fromName} <${from}>`,
          to
        }
      }
    });

    // Add tracking pixel and click tracking
    let trackedHtml = addTrackingPixel(html, event.id);
    trackedHtml = addClickTracking(trackedHtml, event.id);

    // Add unsubscribe link if provided
    if (unsubscribeUrl) {
      trackedHtml = trackedHtml.replace(
        '{{unsubscribeUrl}}',
        unsubscribeUrl
      );
    }

    // Send email via Resend
    try {
      console.log(`[EMAIL] Attempting to send email to ${to} with from: ${fromName} <${from}>`);

      const result = await resend.emails.send({
        from: `${fromName} <${from}>`,
        to,
        reply_to: replyTo || 'debs@daitani.co.uk',
        subject,
        html: trackedHtml,
        text: text || html.replace(/<[^>]*>/g, ''),
      });

      console.log(`[EMAIL] Resend API response:`, JSON.stringify(result, null, 2));
      console.log(`[EMAIL] Sent successfully to ${to} - Event ID: ${event.id}`);
      return true;
    } catch (sendError: any) {
      console.error('[EMAIL] Resend API error:', sendError);
      console.error('[EMAIL] Error details:', JSON.stringify(sendError, null, 2));
      if (sendError.response) {
        console.error('[EMAIL] Response data:', sendError.response);
      }
      return false;
    }
  } catch (error) {
    console.error('[EMAIL] Error sending email:', error);
    return false;
  }
}

/**
 * Send bulk emails (for campaigns)
 */
export async function sendBulkEmails(options: BulkEmailOptions): Promise<{
  sent: number;
  failed: number;
}> {
  const {
    subscribers,
    from = process.env.EMAIL_FROM || 'onboarding@resend.dev',
    fromName = 'dAItaniverse',
    replyTo,
    subject,
    html,
    text,
    campaignId,
    sequenceEmailId
  } = options;

  let sent = 0;
  let failed = 0;

  console.log(`\n[BULK EMAIL] Sending ${subscribers.length} emails...`);

  for (const subscriber of subscribers) {
    try {
      // Replace variables in subject and content
      const variables = {
        email: subscriber.email,
        unsubscribeUrl: generateUnsubscribeUrl(subscriber.subscriberId),
        ...subscriber.variables
      };

      const personalizedSubject = replaceVariables(subject, variables);
      const personalizedHtml = replaceVariables(html, variables);
      const personalizedText = text ? replaceVariables(text, variables) : undefined;

      const success = await sendEmail({
        to: subscriber.email,
        from,
        fromName,
        replyTo,
        subject: personalizedSubject,
        html: personalizedHtml,
        text: personalizedText,
        campaignId,
        sequenceEmailId,
        subscriberId: subscriber.subscriberId,
        unsubscribeUrl: variables.unsubscribeUrl
      });

      if (success) {
        sent++;
      } else {
        failed++;
      }

      // Rate limiting: wait 100ms between emails
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`[BULK EMAIL] Error sending to ${subscriber.email}:`, error);
      failed++;
    }
  }

  console.log(`[BULK EMAIL] Complete. Sent: ${sent}, Failed: ${failed}\n`);

  return { sent, failed };
}

/**
 * Track email open
 */
export async function trackEmailOpen(eventId: string): Promise<void> {
  try {
    const event = await prisma.emailEvent.findUnique({
      where: { id: eventId }
    });

    if (!event) {
      console.log(`[EMAIL] Event not found: ${eventId}`);
      return;
    }

    // Check if already tracked
    const existingOpen = await prisma.emailEvent.findFirst({
      where: {
        subscriberId: event.subscriberId,
        campaignId: event.campaignId,
        sequenceEmailId: event.sequenceEmailId,
        type: 'OPENED'
      }
    });

    if (existingOpen) {
      return; // Already tracked
    }

    // Create open event
    await prisma.emailEvent.create({
      data: {
        subscriberId: event.subscriberId,
        campaignId: event.campaignId,
        sequenceEmailId: event.sequenceEmailId,
        type: 'OPENED',
        data: {
          originalEventId: eventId,
          timestamp: new Date().toISOString()
        }
      }
    });

    // Update campaign stats
    if (event.campaignId) {
      await prisma.emailCampaign.update({
        where: { id: event.campaignId },
        data: {
          openedCount: {
            increment: 1
          }
        }
      });
    }

    console.log(`[EMAIL] Tracked open for event: ${eventId}`);
  } catch (error) {
    console.error('[EMAIL] Error tracking open:', error);
  }
}

/**
 * Track email click
 */
export async function trackEmailClick(
  eventId: string,
  url: string
): Promise<void> {
  try {
    const event = await prisma.emailEvent.findUnique({
      where: { id: eventId }
    });

    if (!event) {
      console.log(`[EMAIL] Event not found: ${eventId}`);
      return;
    }

    // Create click event
    await prisma.emailEvent.create({
      data: {
        subscriberId: event.subscriberId,
        campaignId: event.campaignId,
        sequenceEmailId: event.sequenceEmailId,
        type: 'CLICKED',
        data: {
          originalEventId: eventId,
          url,
          timestamp: new Date().toISOString()
        }
      }
    });

    // Update campaign stats (count unique clicks)
    if (event.campaignId) {
      const existingClick = await prisma.emailEvent.findFirst({
        where: {
          subscriberId: event.subscriberId,
          campaignId: event.campaignId,
          type: 'CLICKED'
        }
      });

      if (!existingClick) {
        await prisma.emailCampaign.update({
          where: { id: event.campaignId },
          data: {
            clickedCount: {
              increment: 1
            }
          }
        });
      }
    }

    console.log(`[EMAIL] Tracked click for event: ${eventId}, URL: ${url}`);
  } catch (error) {
    console.error('[EMAIL] Error tracking click:', error);
  }
}

/**
 * Handle unsubscribe
 */
export async function unsubscribeEmail(subscriberId: string): Promise<boolean> {
  try {
    const subscriber = await prisma.emailSubscriber.update({
      where: { id: subscriberId },
      data: {
        status: 'UNSUBSCRIBED',
        unsubscribedAt: new Date()
      }
    });

    // Create unsubscribe event
    await prisma.emailEvent.create({
      data: {
        subscriberId,
        type: 'UNSUBSCRIBED',
        data: {
          timestamp: new Date().toISOString()
        }
      }
    });

    console.log(`[EMAIL] Unsubscribed: ${subscriber.email}`);
    return true;
  } catch (error) {
    console.error('[EMAIL] Error unsubscribing:', error);
    return false;
  }
}
