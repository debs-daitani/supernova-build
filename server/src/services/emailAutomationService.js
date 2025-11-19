/**
 * Email Automation Service
 * Handles welcome email series and automated email campaigns
 */

/**
 * Schedule 5-email welcome series for new user
 *
 * Series:
 * - Email 0: Welcome (immediate)
 * - Email 1: Day 1 - First Win Check
 * - Email 2: Day 3 - Feature Discovery
 * - Email 3: Day 5 - Community
 * - Email 4: Day 7 - Check In
 */
async function scheduleWelcomeSeries(userId, userEmail, userName, prisma) {
  const now = new Date();

  const emails = [
    {
      userId,
      email: userEmail,
      emailType: 'welcome',
      scheduledFor: now, // Immediate
      subject: 'Welcome to The dAItaniverse! 🎉',
      template: 'welcome',
      status: 'scheduled',
      metadata: JSON.stringify({ userName })
    },
    {
      userId,
      email: userEmail,
      emailType: 'day_1',
      scheduledFor: new Date(now.getTime() + 24 * 60 * 60 * 1000), // 24 hours
      subject: 'Your first 24 hours - did you build something?',
      template: 'day_1',
      status: 'scheduled',
      metadata: JSON.stringify({ userName })
    },
    {
      userId,
      email: userEmail,
      emailType: 'day_3',
      scheduledFor: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days
      subject: '3 features you probably missed',
      template: 'day_3',
      status: 'scheduled',
      metadata: JSON.stringify({ userName })
    },
    {
      userId,
      email: userEmail,
      emailType: 'day_5',
      scheduledFor: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000), // 5 days
      subject: "Join 500+ entrepreneurs (we don't bite!)",
      template: 'day_5',
      status: 'scheduled',
      metadata: JSON.stringify({ userName })
    },
    {
      userId,
      email: userEmail,
      emailType: 'day_7',
      scheduledFor: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days
      subject: "How's your first week been?",
      template: 'day_7',
      status: 'scheduled',
      metadata: JSON.stringify({ userName })
    }
  ];

  if (prisma && prisma.welcomeEmail) {
    await prisma.welcomeEmail.createMany({
      data: emails
    });
  }

  return emails;
}

/**
 * Send scheduled emails (run as cron job every hour)
 */
async function sendScheduledEmails(prisma, emailService) {
  const now = new Date();

  if (!prisma || !prisma.welcomeEmail) {
    console.error('Prisma or welcomeEmail model not available');
    return;
  }

  const dueEmails = await prisma.welcomeEmail.findMany({
    where: {
      scheduledFor: { lte: now },
      sentAt: null,
      status: 'scheduled'
    },
    include: {
      user: true
    }
  });

  console.log(`Found ${dueEmails.length} emails to send`);

  for (const email of dueEmails) {
    try {
      // Get template content
      const templateContent = getEmailTemplate(email.template, email.user);

      // Send via email service (SendGrid, Resend, Nodemailer, etc.)
      if (emailService && typeof emailService.send === 'function') {
        await emailService.send({
          to: email.email,
          subject: email.subject,
          html: templateContent.html,
          text: templateContent.text,
          trackingPixel: true,
          emailId: email.id
        });
      } else {
        // Fallback: log email (for development)
        console.log('EMAIL WOULD BE SENT:', {
          to: email.email,
          subject: email.subject,
          template: email.template
        });
      }

      // Mark as sent
      await prisma.welcomeEmail.update({
        where: { id: email.id },
        data: {
          sentAt: new Date(),
          status: 'sent'
        }
      });

      console.log(`✓ Sent ${email.emailType} to ${email.email}`);
    } catch (error) {
      console.error(`Failed to send email ${email.id}:`, error);

      await prisma.welcomeEmail.update({
        where: { id: email.id },
        data: {
          status: 'failed',
          metadata: JSON.stringify({
            ...(email.metadata ? JSON.parse(email.metadata) : {}),
            error: error.message
          })
        }
      });
    }
  }

  return dueEmails.length;
}

/**
 * Track email open (pixel tracking)
 */
async function trackEmailOpen(emailId, prisma) {
  if (!prisma || !prisma.welcomeEmail) {
    return;
  }

  await prisma.welcomeEmail.update({
    where: { id: emailId },
    data: {
      openedAt: new Date(),
      status: 'opened'
    }
  });
}

/**
 * Track email click
 */
async function trackEmailClick(emailId, prisma) {
  if (!prisma || !prisma.welcomeEmail) {
    return;
  }

  await prisma.welcomeEmail.update({
    where: { id: emailId },
    data: {
      clickedAt: new Date(),
      status: 'clicked'
    }
  });
}

/**
 * Cancel scheduled emails for a user (if they unsubscribe or delete account)
 */
async function cancelWelcomeSeries(userId, prisma) {
  if (!prisma || !prisma.welcomeEmail) {
    return 0;
  }

  const result = await prisma.welcomeEmail.updateMany({
    where: {
      userId,
      status: 'scheduled',
      sentAt: null
    },
    data: {
      status: 'cancelled'
    }
  });

  return result.count;
}

/**
 * Get email template content
 */
function getEmailTemplate(templateName, user) {
  const userName = user.preferredName || user.name || 'there';
  const baseUrl = process.env.APP_URL || 'https://thedaitaniverse.com';
  const loginUrl = `${baseUrl}/login`;

  const templates = {
    welcome: {
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to The dAItaniverse!</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #f97316 0%, #ec4899 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 32px;">🎉 Welcome to The dAItaniverse!</h1>
          </div>

          <div style="background: white; padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
            <h2 style="color: #f97316; margin-top: 0;">Hey ${userName}! 👋</h2>

            <p style="font-size: 16px;">You're officially part of something special.</p>

            <p>The dAItaniverse is your all-in-one business platform - think Kajabi, ClickFunnels, HubSpot, and Shopify had a baby... powered by AI. 🚀</p>

            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 25px 0;">
              <p style="margin: 0;"><strong>🤖 Meet SUPERNova AI</strong></p>
              <p style="margin: 10px 0 0 0; font-size: 14px;">Your 24/7 business coach. Stuck? Just ask. SUPERNova knows everything and speaks in Debs' voice - direct, no BS, all value.</p>
            </div>

            <h3 style="color: #1f2937;">Quick Start Guide (3 minutes):</h3>

            <ol style="padding-left: 20px;">
              <li style="margin-bottom: 10px;"><strong>Log in and explore</strong> - Check out the dashboard</li>
              <li style="margin-bottom: 10px;"><strong>Complete Quick Wins</strong> - 5 tasks to get your first win</li>
              <li style="margin-bottom: 10px;"><strong>Ask SUPERNova anything</strong> - "Help me build a landing page"</li>
            </ol>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${loginUrl}" style="display: inline-block; background: #f97316; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Log In Now →</a>
            </div>

            <p>Over the next week, I'll send you a few more emails with tips, features, and resources to help you succeed.</p>

            <p>Let's build something amazing! 💪</p>

            <p style="margin-top: 30px;">
              Cheers,<br>
              <strong>Debs Daitani</strong><br>
              <em>Founder, The dAItaniverse</em>
            </p>
          </div>

          <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
            <p>The dAItaniverse | All-in-One Business Platform</p>
            <p><a href="${baseUrl}/unsubscribe" style="color: #6b7280;">Unsubscribe</a></p>
          </div>
        </body>
        </html>
      `,
      text: `Welcome to The dAItaniverse, ${userName}!\n\nYou're officially part of something special.\n\nQuick Start:\n1. Log in and explore\n2. Complete Quick Wins checklist\n3. Ask SUPERNova AI anything\n\nLog in: ${loginUrl}\n\nCheers,\nDebs Daitani`
    },

    day_1: {
      html: `
        <!DOCTYPE html>
        <html>
        <body style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <h2 style="color: #f97316;">Your First 24 Hours ⏰</h2>

          <p>Hey ${userName},</p>

          <p>It's been a day since you joined. Quick question:</p>

          <p style="font-size: 18px; font-weight: bold; color: #1f2937;">Did you complete your Quick Wins checklist? 🎯</p>

          <p>These 5 tasks (each takes 1-3 minutes) are designed to give you your first win and show you what's possible.</p>

          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Quick Wins Checklist:</h3>
            <ul>
              <li>✅ Create your first page</li>
              <li>✅ Add a product or service</li>
              <li>✅ Chat with SUPERNova AI</li>
              <li>✅ Connect a custom domain</li>
              <li>✅ Set up your profile</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${loginUrl}" style="display: inline-block; background: #f97316; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold;">Complete Quick Wins →</a>
          </div>

          <p><strong>Stuck?</strong> Ask SUPERNova: "Help me complete Quick Wins"</p>

          <p>You got this! 💪</p>

          <p>Debs</p>
        </body>
        </html>
      `,
      text: `Your First 24 Hours\n\nHey ${userName},\n\nDid you complete your Quick Wins checklist?\n\nLog in: ${loginUrl}\n\n- Debs`
    },

    day_3: {
      html: `
        <!DOCTYPE html>
        <html>
        <body style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <h2 style="color: #f97316;">3 Features You Probably Missed 🔍</h2>

          <p>Hey ${userName},</p>

          <p>You've been exploring for a few days. Here are 3 powerful features most people miss:</p>

          <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
            <h3 style="margin-top: 0;">1. 🎨 Template Library</h3>
            <p>Don't build from scratch! We have 100+ pre-built templates for pages, funnels, emails, and more.</p>
          </div>

          <div style="background: #dbeafe; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0;">
            <h3 style="margin-top: 0;">2. 🤖 SUPERNova AI Assistant</h3>
            <p>Ask it to build entire pages, write copy, create workflows, or explain features. It's like having Debs as your personal coach.</p>
          </div>

          <div style="background: #e0e7ff; border-left: 4px solid #8b5cf6; padding: 15px; margin: 20px 0;">
            <h3 style="margin-top: 0;">3. ⚡ Automation Builder</h3>
            <p>Set up email sequences, lead scoring, SMS follow-ups, and more - all without code.</p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${loginUrl}" style="display: inline-block; background: #f97316; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold;">Explore Features →</a>
          </div>

          <p>Want a personalized feature tour? Just ask SUPERNova!</p>

          <p>Debs</p>
        </body>
        </html>
      `,
      text: `3 Features You Probably Missed\n\nHey ${userName},\n\n1. Template Library\n2. SUPERNova AI\n3. Automation Builder\n\nExplore: ${loginUrl}\n\n- Debs`
    },

    day_5: {
      html: `
        <!DOCTYPE html>
        <html>
        <body style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <h2 style="color: #f97316;">Join the Community 🌟</h2>

          <p>Hey ${userName},</p>

          <p>You know what's better than building alone?</p>

          <p style="font-size: 20px; font-weight: bold;">Building with 500+ other entrepreneurs who "get it."</p>

          <p>Our private community is where:</p>

          <ul style="font-size: 16px; line-height: 1.8;">
            <li>💡 Ideas get validated (or destroyed... lovingly)</li>
            <li>🚀 Wins get celebrated (no matter how small)</li>
            <li>🤝 Collaborations happen organically</li>
            <li>📚 Real strategies get shared (not theory)</li>
            <li>🎯 Debs herself drops weekly wisdom bombs</li>
          </ul>

          <div style="background: #f9fafb; border: 2px solid #f97316; border-radius: 8px; padding: 20px; margin: 30px 0; text-align: center;">
            <p style="font-size: 18px; margin: 0;"><strong>Plus: Weekly live Q&A with Debs</strong></p>
            <p style="color: #6b7280; margin: 10px 0 0 0;">Every Thursday, 7pm EST</p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="https://facebook.com/groups/daitaniverse" style="display: inline-block; background: #1877f2; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold;">Join Facebook Group →</a>
          </div>

          <p>See you there!</p>

          <p>Debs</p>
        </body>
        </html>
      `,
      text: `Join the Community\n\nHey ${userName},\n\n500+ entrepreneurs building together.\n\nJoin: https://facebook.com/groups/daitaniverse\n\n- Debs`
    },

    day_7: {
      html: `
        <!DOCTYPE html>
        <html>
        <body style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <h2 style="color: #f97316;">Your First Week - How'd It Go? 📊</h2>

          <p>Hey ${userName},</p>

          <p>It's been a week since you joined The dAItaniverse.</p>

          <p><strong>I'd love to hear from you:</strong></p>

          <ul style="font-size: 16px; line-height: 1.8;">
            <li>What have you built so far?</li>
            <li>What features are you loving?</li>
            <li>Where are you getting stuck?</li>
            <li>What do you wish we had that we don't?</li>
          </ul>

          <div style="text-align: center; margin: 30px 0;">
            <a href="mailto:debs@thedaitaniverse.com?subject=My First Week Feedback" style="display: inline-block; background: #f97316; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold;">Send Feedback →</a>
          </div>

          <p>Seriously - hit reply and let me know. I read every email.</p>

          <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 25px 0;">
            <p style="margin: 0;"><strong>📅 Trial Reminder:</strong></p>
            <p style="margin: 10px 0 0 0;">You have 7 more days left on your trial. Make the most of it!</p>
          </div>

          <p>Questions? Stuck on something? Just ask SUPERNova or email me directly.</p>

          <p>Let's finish this trial strong! 💪</p>

          <p style="margin-top: 30px;">
            Cheers,<br>
            <strong>Debs Daitani</strong>
          </p>
        </body>
        </html>
      `,
      text: `Your First Week\n\nHey ${userName},\n\nHow's it going? I'd love to hear your feedback.\n\nReply to this email or send to: debs@thedaitaniverse.com\n\n- Debs`
    }
  };

  return templates[templateName] || templates.welcome;
}

/**
 * Get email stats for a user
 */
async function getEmailStats(userId, prisma) {
  if (!prisma || !prisma.welcomeEmail) {
    return null;
  }

  const emails = await prisma.welcomeEmail.findMany({
    where: { userId }
  });

  return {
    total: emails.length,
    sent: emails.filter(e => e.status === 'sent').length,
    opened: emails.filter(e => e.openedAt !== null).length,
    clicked: emails.filter(e => e.clickedAt !== null).length,
    failed: emails.filter(e => e.status === 'failed').length,
    scheduled: emails.filter(e => e.status === 'scheduled').length
  };
}

module.exports = {
  scheduleWelcomeSeries,
  sendScheduledEmails,
  trackEmailOpen,
  trackEmailClick,
  cancelWelcomeSeries,
  getEmailTemplate,
  getEmailStats
};
