/**
 * Email utility for The dAItaniverse platform
 * In production, this would integrate with a service like SendGrid, Resend, or AWS SES
 */

export interface EmailTemplate {
  to: string
  subject: string
  html: string
  text: string
}

/**
 * Generate welcome email for quiz testers (MEMBER tier with lifetime access)
 */
export function generateQuizTesterWelcomeEmail(
  email: string,
  firstName: string,
  resetToken: string
): EmailTemplate {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`

  return {
    to: email,
    subject: '🎉 Thanks for Testing! Your Free MEMBER Access Awaits',
    html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .header h1 { color: white; margin: 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
    .cta-button { display: inline-block; background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to The dAItaniverse!</h1>
    </div>
    <div class="content">
      <h2>Hey ${firstName || 'there'}! 🎉</h2>

      <p><strong>Thank you for being one of our quiz testers!</strong></p>

      <p>You helped us build something amazing, and we're thrilled to give you <strong>FREE MEMBER access for life</strong> as our way of saying thank you.</p>

      <h3>What You Get with MEMBER Access:</h3>
      <ul>
        <li>✅ 300 SUPERNova AI messages per month</li>
        <li>✅ Up to 1,000 email subscribers</li>
        <li>✅ 60 social posts per month</li>
        <li>✅ Content repurposing (4 videos/month)</li>
        <li>✅ AI image generation (10/month)</li>
        <li>✅ AI video generation (2/month)</li>
        <li>✅ 5GB storage</li>
        <li>✅ Host up to 6 courses</li>
        <li>✅ List up to 50 products</li>
        <li>🌟 Access to ALL premium content and programs</li>
      </ul>

      <h3>Get Started:</h3>
      <p>Click the button below to set your password and access your account:</p>

      <div style="text-align: center;">
        <a href="${resetUrl}" class="cta-button">Set Your Password & Log In</a>
      </div>

      <p><small>If the button doesn't work, copy and paste this link into your browser:<br>${resetUrl}</small></p>

      <p>Your quiz results are saved and waiting for you inside the platform!</p>

      <p>Welcome to the community,<br>
      <strong>Debs & The dAItaniverse Team</strong></p>
    </div>
    <div class="footer">
      <p>The dAItaniverse | Building Authentic Brands with AI</p>
    </div>
  </div>
</body>
</html>
    `,
    text: `
Hey ${firstName || 'there'}!

Thank you for being one of our quiz testers!

You helped us build something amazing, and we're thrilled to give you FREE MEMBER access for life as our way of saying thank you.

What You Get with MEMBER Access:
✅ 300 SUPERNova AI messages per month
✅ Up to 1,000 email subscribers
✅ 60 social posts per month
✅ Content repurposing (4 videos/month)
✅ AI image generation (10/month)
✅ AI video generation (2/month)
✅ 5GB storage
✅ Host up to 6 courses
✅ List up to 50 products
🌟 Access to ALL premium content and programs

Get Started:
Click the link below to set your password and access your account:
${resetUrl}

Your quiz results are saved and waiting for you inside the platform!

Welcome to the community,
Debs & The dAItaniverse Team

---
The dAItaniverse | Building Authentic Brands with AI
    `,
  }
}

/**
 * Generate welcome email for regular subscribers (FREE tier)
 */
export function generateSubscriberWelcomeEmail(
  email: string,
  firstName: string,
  resetToken: string,
  hasQuizResults = false
): EmailTemplate {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`

  return {
    to: email,
    subject: `Welcome to The dAItaniverse, ${firstName || 'friend'}! 🚀`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .header h1 { color: white; margin: 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
    .cta-button { display: inline-block; background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
    .upgrade-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to The dAItaniverse!</h1>
    </div>
    <div class="content">
      <h2>Hey ${firstName || 'there'}! 👋</h2>

      <p>We're excited to have you in The dAItaniverse community!</p>

      ${
        hasQuizResults
          ? '<p><strong>Your quiz results are ready and waiting for you inside the platform.</strong></p>'
          : ''
      }

      <h3>Get Started:</h3>
      <p>Click the button below to set your password and access your account:</p>

      <div style="text-align: center;">
        <a href="${resetUrl}" class="cta-button">Set Your Password & Log In</a>
      </div>

      <p><small>If the button doesn't work, copy and paste this link into your browser:<br>${resetUrl}</small></p>

      <h3>What's Inside:</h3>
      <ul>
        <li>🎨 Anti-Branding frameworks and templates</li>
        <li>🧠 ADHD-friendly business systems</li>
        <li>📱 Social media content strategies</li>
        <li>✨ Personal branding resources</li>
        <li>🎓 Curated programs and courses</li>
      </ul>

      <div class="upgrade-box">
        <h4>🚀 Want More?</h4>
        <p>Upgrade to MEMBER access to unlock:</p>
        <ul>
          <li>SUPERNova AI assistant (300 messages/month)</li>
          <li>Content repurposing tools</li>
          <li>AI image & video generation</li>
          <li>Email marketing (up to 1,000 subscribers)</li>
          <li>Social scheduling (60 posts/month)</li>
          <li>Course hosting & product listings</li>
        </ul>
      </div>

      <p>Let's build something amazing together!</p>

      <p>Welcome to the community,<br>
      <strong>Debs & The dAItaniverse Team</strong></p>
    </div>
    <div class="footer">
      <p>The dAItaniverse | Building Authentic Brands with AI</p>
    </div>
  </div>
</body>
</html>
    `,
    text: `
Hey ${firstName || 'there'}!

We're excited to have you in The dAItaniverse community!

${hasQuizResults ? 'Your quiz results are ready and waiting for you inside the platform.' : ''}

Get Started:
Click the link below to set your password and access your account:
${resetUrl}

What's Inside:
🎨 Anti-Branding frameworks and templates
🧠 ADHD-friendly business systems
📱 Social media content strategies
✨ Personal branding resources
🎓 Curated programs and courses

🚀 Want More?
Upgrade to MEMBER access to unlock:
- SUPERNova AI assistant (300 messages/month)
- Content repurposing tools
- AI image & video generation
- Email marketing (up to 1,000 subscribers)
- Social scheduling (60 posts/month)
- Course hosting & product listings

Let's build something amazing together!

Welcome to the community,
Debs & The dAItaniverse Team

---
The dAItaniverse | Building Authentic Brands with AI
    `,
  }
}

/**
 * Send email (mock implementation - replace with real email service)
 */
export async function sendEmail(template: EmailTemplate): Promise<boolean> {
  // In production, integrate with SendGrid, Resend, or AWS SES
  console.log('📧 SENDING EMAIL:')
  console.log('To:', template.to)
  console.log('Subject:', template.subject)
  console.log('---')

  // For now, just log and return success
  // TODO: Replace with actual email service integration
  return true
}

/**
 * Queue emails for batch sending (to avoid rate limits)
 */
export async function queueEmails(templates: EmailTemplate[]): Promise<void> {
  // In production, use a queue system like BullMQ or AWS SQS
  console.log(`📧 QUEUING ${templates.length} emails for sending...`)

  for (const template of templates) {
    await sendEmail(template)
  }
}

/**
 * Generate ticket creation confirmation email
 */
export function generateTicketCreationEmail(
  email: string,
  firstName: string,
  ticketId: string,
  subject: string,
  slaHours: number
): EmailTemplate {
  const ticketUrl = `${process.env.NEXT_PUBLIC_APP_URL}/support/${ticketId}`

  return {
    to: email,
    subject: `Ticket #${ticketId.slice(-8)} Created: ${subject}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .header h1 { color: white; margin: 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
    .ticket-box { background: white; border-left: 4px solid #8b5cf6; padding: 15px; margin: 20px 0; border-radius: 4px; }
    .cta-button { display: inline-block; background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Support Ticket Created</h1>
    </div>
    <div class="content">
      <h2>Hey ${firstName || 'there'}! 👋</h2>

      <p>Thanks for reaching out! We've received your support request and our team is on it.</p>

      <div class="ticket-box">
        <p><strong>Ticket ID:</strong> #${ticketId.slice(-8)}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Expected Response Time:</strong> Within ${slaHours} hours</p>
      </div>

      <p>You'll receive an email notification as soon as an admin responds to your ticket.</p>

      <div style="text-align: center;">
        <a href="${ticketUrl}" class="cta-button">View Ticket</a>
      </div>

      <p><small>If the button doesn't work, copy and paste this link into your browser:<br>${ticketUrl}</small></p>

      <p>Need urgent help? Check our <a href="${process.env.NEXT_PUBLIC_APP_URL}/support">support center</a> for common solutions.</p>

      <p>Thanks for your patience,<br>
      <strong>The dAItaniverse Support Team</strong></p>
    </div>
    <div class="footer">
      <p>The dAItaniverse | Building Authentic Brands with AI</p>
    </div>
  </div>
</body>
</html>
    `,
    text: `
Hey ${firstName || 'there'}!

Thanks for reaching out! We've received your support request and our team is on it.

Ticket ID: #${ticketId.slice(-8)}
Subject: ${subject}
Expected Response Time: Within ${slaHours} hours

You'll receive an email notification as soon as an admin responds to your ticket.

View your ticket: ${ticketUrl}

Need urgent help? Check our support center for common solutions: ${process.env.NEXT_PUBLIC_APP_URL}/support

Thanks for your patience,
The dAItaniverse Support Team

---
The dAItaniverse | Building Authentic Brands with AI
    `,
  }
}

/**
 * Generate email when admin replies to ticket
 */
export function generateTicketReplyEmail(
  email: string,
  firstName: string,
  ticketId: string,
  subject: string,
  replyMessage: string,
  adminName: string
): EmailTemplate {
  const ticketUrl = `${process.env.NEXT_PUBLIC_APP_URL}/support/${ticketId}`

  return {
    to: email,
    subject: `Re: Ticket #${ticketId.slice(-8)} - ${subject}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .header h1 { color: white; margin: 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
    .reply-box { background: white; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 4px; }
    .cta-button { display: inline-block; background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>New Reply to Your Ticket</h1>
    </div>
    <div class="content">
      <h2>Hey ${firstName || 'there'}! 👋</h2>

      <p><strong>${adminName}</strong> has replied to your support ticket:</p>

      <div class="reply-box">
        <p><strong>Ticket #${ticketId.slice(-8)}:</strong> ${subject}</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 15px 0;">
        <p>${replyMessage.replace(/\n/g, '<br>')}</p>
      </div>

      <div style="text-align: center;">
        <a href="${ticketUrl}" class="cta-button">View & Reply</a>
      </div>

      <p><small>If the button doesn't work, copy and paste this link into your browser:<br>${ticketUrl}</small></p>

      <p>Thanks,<br>
      <strong>The dAItaniverse Support Team</strong></p>
    </div>
    <div class="footer">
      <p>The dAItaniverse | Building Authentic Brands with AI</p>
    </div>
  </div>
</body>
</html>
    `,
    text: `
Hey ${firstName || 'there'}!

${adminName} has replied to your support ticket:

Ticket #${ticketId.slice(-8)}: ${subject}

---
${replyMessage}
---

View and reply to your ticket: ${ticketUrl}

Thanks,
The dAItaniverse Support Team

---
The dAItaniverse | Building Authentic Brands with AI
    `,
  }
}

/**
 * Generate ticket resolved email
 */
export function generateTicketResolvedEmail(
  email: string,
  firstName: string,
  ticketId: string,
  subject: string
): EmailTemplate {
  const ticketUrl = `${process.env.NEXT_PUBLIC_APP_URL}/support/${ticketId}`

  return {
    to: email,
    subject: `Ticket #${ticketId.slice(-8)} Resolved: ${subject}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .header h1 { color: white; margin: 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
    .cta-button { display: inline-block; background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ Ticket Resolved</h1>
    </div>
    <div class="content">
      <h2>Hey ${firstName || 'there'}! 🎉</h2>

      <p>Great news! Your support ticket has been marked as resolved:</p>

      <p><strong>Ticket #${ticketId.slice(-8)}:</strong> ${subject}</p>

      <p>If you're still experiencing issues, you can reopen this ticket by replying to it within the next 7 days. After that, the ticket will be automatically closed.</p>

      <div style="text-align: center;">
        <a href="${ticketUrl}" class="cta-button">View Ticket</a>
      </div>

      <p>Thanks for using The dAItaniverse!</p>

      <p>Cheers,<br>
      <strong>The dAItaniverse Support Team</strong></p>
    </div>
    <div class="footer">
      <p>The dAItaniverse | Building Authentic Brands with AI</p>
    </div>
  </div>
</body>
</html>
    `,
    text: `
Hey ${firstName || 'there'}! 🎉

Great news! Your support ticket has been marked as resolved:

Ticket #${ticketId.slice(-8)}: ${subject}

If you're still experiencing issues, you can reopen this ticket by replying to it within the next 7 days. After that, the ticket will be automatically closed.

View your ticket: ${ticketUrl}

Thanks for using The dAItaniverse!

Cheers,
The dAItaniverse Support Team

---
The dAItaniverse | Building Authentic Brands with AI
    `,
  }
}
