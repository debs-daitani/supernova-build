import sgMail from '@sendgrid/mail';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import prisma from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const renderTemplate = async (templateName, variables) => {
  const templatePath = path.join(__dirname, '..', 'emails', 'templates', `${templateName}.html`);
  let html = await fs.readFile(templatePath, 'utf-8');

  // Replace variables in template
  Object.keys(variables).forEach(key => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    html = html.replace(regex, variables[key]);
  });

  return html;
};

export const sendEmail = async ({ to, subject, templateName, variables }) => {
  try {
    const html = await renderTemplate(templateName, variables);

    const msg = {
      to,
      from: {
        email: process.env.FROM_EMAIL,
        name: process.env.FROM_NAME,
      },
      subject,
      html,
    };

    await sgMail.send(msg);
    console.log(`Email sent to ${to}: ${subject}`);
    return { success: true };
  } catch (error) {
    console.error('Email send error:', error);
    throw new Error('Failed to send email');
  }
};

// Specific email functions

export const sendWelcomeEmail = async (user) => {
  return sendEmail({
    to: user.email,
    subject: 'Welcome to The dAItaniverse! 🌟',
    templateName: 'welcome',
    variables: {
      name: user.name,
      dashboardUrl: `${process.env.CLIENT_URL}/dashboard`,
    },
  });
};

export const sendUpgradeConfirmation = async (user, downloadLinks) => {
  return sendEmail({
    to: user.email,
    subject: 'You\'re Upgraded! Your Resources Are Ready 🎉',
    templateName: 'upgrade-confirmation',
    variables: {
      name: user.name,
      promptsUrl: downloadLinks.prompts,
      guideUrl: downloadLinks.guide,
      bonusUrl: downloadLinks.bonus,
      chatUrl: `${process.env.CLIENT_URL}/chat`,
    },
  });
};

export const sendSubscriptionConfirmation = async (user, subscription) => {
  const nextBillingDate = new Date(subscription.currentPeriodEnd).toLocaleDateString('en-GB');
  const plan = subscription.plan === 'MONTHLY' ? 'Monthly' : 'Annual';

  return sendEmail({
    to: user.email,
    subject: 'Welcome to Full Membership! 🚀',
    templateName: 'subscription-confirmation',
    variables: {
      name: user.name,
      plan,
      nextBillingDate,
      contentUrl: `${process.env.CLIENT_URL}/content`,
      communityUrl: `${process.env.CLIENT_URL}/community`,
    },
  });
};

export const sendPaymentReceipt = async (user, payment) => {
  const amount = (payment.amount / 100).toFixed(2);
  const date = new Date(payment.createdAt).toLocaleDateString('en-GB');

  return sendEmail({
    to: user.email,
    subject: 'Payment Receipt - The dAItaniverse',
    templateName: 'payment-receipt',
    variables: {
      name: user.name,
      amount,
      date,
      invoiceNumber: payment.id,
      description: payment.description,
    },
  });
};

export const sendPasswordResetEmail = async (user, resetToken) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

  return sendEmail({
    to: user.email,
    subject: 'Reset Your Password - The dAItaniverse',
    templateName: 'password-reset',
    variables: {
      name: user.name,
      resetUrl,
    },
  });
};

export const sendMarketplaceSaleBuyer = async (buyer, listing, seller) => {
  return sendEmail({
    to: buyer.email,
    subject: 'Congrats on Your Purchase! 🎉',
    templateName: 'marketplace-sale-buyer',
    variables: {
      name: buyer.name,
      listingTitle: listing.title,
      sellerName: seller.name,
      sellerEmail: seller.email,
      listingUrl: `${process.env.CLIENT_URL}/marketplace/${listing.id}`,
    },
  });
};

export const sendMarketplaceSaleSeller = async (seller, listing, buyer, sellerAmount) => {
  const amount = (sellerAmount / 100).toFixed(2);

  return sendEmail({
    to: seller.email,
    subject: 'Your Idea Sold! 💰',
    templateName: 'marketplace-sale-seller',
    variables: {
      name: seller.name,
      listingTitle: listing.title,
      amount,
      buyerName: buyer.name,
      buyerEmail: buyer.email,
    },
  });
};

export const sendMarketplaceMessage = async (recipient, sender, listing, messagePreview) => {
  return sendEmail({
    to: recipient.email,
    subject: 'New Message About Your Listing',
    templateName: 'marketplace-message',
    variables: {
      name: recipient.name,
      senderName: sender.name,
      listingTitle: listing.title,
      messagePreview,
      listingUrl: `${process.env.CLIENT_URL}/marketplace/${listing.id}`,
    },
  });
};

export const sendCommunityMention = async (user, mentioner, post) => {
  return sendEmail({
    to: user.email,
    subject: `${mentioner.name} mentioned you in a post`,
    templateName: 'community-mention',
    variables: {
      name: user.name,
      mentionerName: mentioner.name,
      postTitle: post.title,
      postPreview: post.content.substring(0, 150) + '...',
      postUrl: `${process.env.CLIENT_URL}/community/posts/${post.id}`,
    },
  });
};

export const sendNewDM = async (recipient, sender, messagePreview) => {
  return sendEmail({
    to: recipient.email,
    subject: `New message from ${sender.name}`,
    templateName: 'new-dm',
    variables: {
      name: recipient.name,
      senderName: sender.name,
      messagePreview,
      messagesUrl: `${process.env.CLIENT_URL}/messages`,
    },
  });
};

// ============================================
// Phase 2AZ: Email Automation Sequences
// ============================================

/**
 * Personalize email content with user data
 */
export const personalizeContent = (content, user) => {
  if (!content) return content;

  // Parse pronouns
  const pronouns = user.pronouns || 'they/them';
  const pronounParts = pronouns.toLowerCase().split('/');
  const subject = pronounParts[0] || 'they';
  const object = pronounParts[1] || 'them';
  const possessive = pronounParts[2] || 'their';
  const reflexive = pronounParts[3] || 'themselves';

  // Replace all variables
  let personalized = content
    .replace(/\{\{name\}\}/g, user.name || '')
    .replace(/\{\{preferredName\}\}/g, user.preferredName || user.name || '')
    .replace(/\{\{email\}\}/g, user.email || '')
    .replace(/\{\{pronouns\}\}/g, pronouns)
    .replace(/\{\{pronounSubject\}\}/g, subject)
    .replace(/\{\{pronounObject\}\}/g, object)
    .replace(/\{\{pronounPossessive\}\}/g, possessive)
    .replace(/\{\{pronounReflexive\}\}/g, reflexive);

  // Business goal and onboarding data
  if (user.onboardingProgress) {
    personalized = personalized
      .replace(/\{\{businessGoal\}\}/g, user.onboardingProgress.primaryGoal || 'your business')
      .replace(/\{\{businessType\}\}/g, user.onboardingProgress.businessType || 'your business')
      .replace(/\{\{targetAudience\}\}/g, user.onboardingProgress.targetAudience || 'your audience');
  }

  // Account info
  personalized = personalized
    .replace(/\{\{accountType\}\}/g, user.accountType || 'free')
    .replace(/\{\{signupDate\}\}/g, user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '');

  return personalized;
};

/**
 * Send sequence email (for automated sequences)
 */
export const sendSequenceEmail = async ({ to, subject, htmlContent, textContent, userId, sequenceId, emailId }) => {
  try {
    const msg = {
      to,
      from: {
        email: process.env.FROM_EMAIL,
        name: process.env.FROM_NAME,
      },
      subject,
      html: htmlContent,
      text: textContent,
      trackingSettings: {
        clickTracking: { enable: true },
        openTracking: { enable: true }
      }
    };

    const result = await sgMail.send(msg);

    // Log delivery in database
    const delivery = await prisma.emailDelivery.create({
      data: {
        userId,
        sequenceId,
        emailId,
        subject,
        content: htmlContent,
        status: 'sent',
        provider: 'sendgrid',
        providerId: result[0]?.headers?.['x-message-id'] || null,
        sentAt: new Date()
      }
    });

    console.log(`Sequence email sent to ${to}: ${subject}`);
    return {
      success: true,
      deliveryId: delivery.id,
      messageId: result[0]?.headers?.['x-message-id']
    };
  } catch (error) {
    console.error('Sequence email send error:', error);

    // Log failed delivery
    await prisma.emailDelivery.create({
      data: {
        userId,
        sequenceId,
        emailId,
        subject,
        content: htmlContent,
        status: 'failed',
        provider: 'sendgrid'
      }
    });

    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Track email open
 */
export const trackEmailOpen = async (deliveryId) => {
  try {
    await prisma.emailDelivery.update({
      where: { id: deliveryId },
      data: {
        opened: true,
        openedAt: new Date(),
        status: 'delivered'
      }
    });

    // Update sequence email stats
    const delivery = await prisma.emailDelivery.findUnique({
      where: { id: deliveryId },
      select: { emailId: true }
    });

    if (delivery?.emailId) {
      await prisma.sequenceEmail.update({
        where: { id: delivery.emailId },
        data: { openCount: { increment: 1 } }
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Failed to track open:', error);
    return { success: false };
  }
};

/**
 * Track email click
 */
export const trackEmailClick = async (deliveryId, url) => {
  try {
    await prisma.emailDelivery.update({
      where: { id: deliveryId },
      data: {
        clicked: true,
        clickedAt: new Date(),
        clickedUrl: url,
        status: 'delivered'
      }
    });

    // Update sequence email stats
    const delivery = await prisma.emailDelivery.findUnique({
      where: { id: deliveryId },
      select: { emailId: true }
    });

    if (delivery?.emailId) {
      await prisma.sequenceEmail.update({
        where: { id: delivery.emailId },
        data: { clickCount: { increment: 1 } }
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Failed to track click:', error);
    return { success: false };
  }
};

/**
 * Unsubscribe user from sequence
 */
export const unsubscribeFromSequence = async (userId, sequenceId) => {
  try {
    await prisma.sequenceEnrollment.updateMany({
      where: {
        userId,
        sequenceId: sequenceId || undefined, // If no sequenceId, update all
        status: 'active'
      },
      data: {
        status: 'unsubscribed',
        pausedAt: new Date()
      }
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to unsubscribe:', error);
    return { success: false };
  }
};

/**
 * Process email queue (called by cron job)
 */
export const processEmailQueue = async () => {
  try {
    const now = new Date();

    // Find enrollments ready for next email
    const ready = await prisma.sequenceEnrollment.findMany({
      where: {
        status: 'active',
        nextEmailAt: {
          lte: now
        }
      },
      include: {
        user: {
          include: {
            onboardingProgress: true
          }
        },
        sequence: {
          include: {
            emails: {
              orderBy: { order: 'asc' }
            }
          }
        }
      },
      take: 50 // Process 50 at a time
    });

    console.log(`Processing ${ready.length} emails in queue...`);

    const results = {
      processed: 0,
      sent: 0,
      failed: 0,
      completed: 0
    };

    for (const enrollment of ready) {
      results.processed++;

      const nextEmail = enrollment.sequence.emails[enrollment.currentStep];

      if (!nextEmail) {
        // Sequence completed
        await prisma.sequenceEnrollment.update({
          where: { id: enrollment.id },
          data: {
            status: 'completed',
            completedAt: new Date(),
            nextEmailAt: null
          }
        });
        results.completed++;
        continue;
      }

      // Personalize content
      const personalizedSubject = personalizeContent(nextEmail.subject, enrollment.user);
      const personalizedHtml = personalizeContent(nextEmail.htmlContent, enrollment.user);
      const personalizedText = personalizeContent(nextEmail.textContent, enrollment.user);

      // Send email
      const result = await sendSequenceEmail({
        to: enrollment.user.email,
        subject: personalizedSubject,
        htmlContent: personalizedHtml,
        textContent: personalizedText,
        userId: enrollment.user.id,
        sequenceId: enrollment.sequenceId,
        emailId: nextEmail.id
      });

      if (result.success) {
        results.sent++;

        // Update sequence email sent count
        await prisma.sequenceEmail.update({
          where: { id: nextEmail.id },
          data: { sentCount: { increment: 1 } }
        });

        // Calculate next email time
        const nextStep = enrollment.currentStep + 1;
        const nextEmailInSequence = enrollment.sequence.emails[nextStep];

        let nextEmailAt = null;
        if (nextEmailInSequence) {
          const delay = (nextEmailInSequence.delayDays * 24 * 60 * 60 * 1000) +
                       (nextEmailInSequence.delayHours * 60 * 60 * 1000);
          nextEmailAt = new Date(now.getTime() + delay);
        }

        // Update enrollment
        await prisma.sequenceEnrollment.update({
          where: { id: enrollment.id },
          data: {
            currentStep: nextStep,
            nextEmailAt
          }
        });
      } else {
        results.failed++;
        console.error(`Failed to send email to ${enrollment.user.email}:`, result.error);
      }
    }

    console.log('Queue processing complete:', results);
    return results;
  } catch (error) {
    console.error('Error processing email queue:', error);
    throw error;
  }
};

/**
 * Calculate sequence statistics
 */
export const calculateSequenceStats = async (sequenceId) => {
  try {
    // Get all emails in sequence
    const emails = await prisma.sequenceEmail.findMany({
      where: { sequenceId }
    });

    const totalSent = emails.reduce((sum, email) => sum + email.sentCount, 0);
    const totalOpened = emails.reduce((sum, email) => sum + email.openCount, 0);
    const totalClicked = emails.reduce((sum, email) => sum + email.clickCount, 0);

    // Get completed enrollments (conversions)
    const completedCount = await prisma.sequenceEnrollment.count({
      where: {
        sequenceId,
        status: 'completed'
      }
    });

    const openRate = totalSent > 0 ? (totalOpened / totalSent) * 100 : 0;
    const clickRate = totalSent > 0 ? (totalClicked / totalSent) * 100 : 0;
    const conversionRate = totalSent > 0 ? (completedCount / totalSent) * 100 : 0;

    // Update sequence stats
    await prisma.emailSequence.update({
      where: { id: sequenceId },
      data: {
        openRate,
        clickRate,
        conversionRate
      }
    });

    return {
      totalSent,
      totalOpened,
      totalClicked,
      completedCount,
      openRate,
      clickRate,
      conversionRate
    };
  } catch (error) {
    console.error('Failed to calculate sequence stats:', error);
    throw error;
  }
};

export default {
  sendEmail,
  sendWelcomeEmail,
  sendUpgradeConfirmation,
  sendSubscriptionConfirmation,
  sendPaymentReceipt,
  sendPasswordResetEmail,
  sendMarketplaceSaleBuyer,
  sendMarketplaceSaleSeller,
  sendMarketplaceMessage,
  sendCommunityMention,
  sendNewDM,
  // Phase 2AZ - Email Sequences
  personalizeContent,
  sendSequenceEmail,
  trackEmailOpen,
  trackEmailClick,
  unsubscribeFromSequence,
  processEmailQueue,
  calculateSequenceStats,
};
