// Email templates for Stripe subscription events
// These are ready to integrate with SendGrid or any email service

export interface EmailTemplate {
  subject: string
  html: string
  text: string
}

export function getWelcomeEmail(userName: string, trialEndDate: string): EmailTemplate {
  return {
    subject: 'Welcome to dAItaniverse! Your 7-Day Trial Has Started',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Josefin Sans', Arial, sans-serif; background-color: #000; color: #fff; padding: 40px; }
          .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); border-radius: 24px; padding: 40px; border: 2px solid #00F0E9; }
          .logo { text-align: center; margin-bottom: 32px; }
          .logo-text { font-size: 48px; font-weight: bold; background: linear-gradient(90deg, #FF008E, #00F0E9); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
          h1 { color: #fff; font-size: 32px; margin-bottom: 16px; }
          p { color: #ccc; line-height: 1.6; margin-bottom: 16px; }
          .cta-button { display: inline-block; background: linear-gradient(135deg, #FF008E, #00F0E9); color: #fff; padding: 16px 32px; text-decoration: none; border-radius: 12px; font-weight: bold; margin: 24px 0; }
          .feature-list { background: #1a1a1a; border-radius: 12px; padding: 24px; margin: 24px 0; }
          .feature { margin: 12px 0; padding-left: 24px; position: relative; }
          .feature:before { content: '✓'; position: absolute; left: 0; color: #00F0E9; font-weight: bold; }
          .footer { text-align: center; margin-top: 32px; padding-top: 32px; border-top: 1px solid #333; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">
            <div class="logo-text">dAItaniverse</div>
          </div>
          <h1>Welcome, ${userName}!</h1>
          <p>Your 7-day free trial has officially started. Get ready to transform how you build your business.</p>

          <div class="feature-list">
            <h2 style="color: #fff; margin-bottom: 16px;">What you get access to:</h2>
            <div class="feature">SUPERNova AI Coaching - Your 24/7 ADHD-friendly coach</div>
            <div class="feature">Quiz Builder - Create lead-generating quizzes</div>
            <div class="feature">Knowledge Library - Full access to all content</div>
            <div class="feature">ADHD Support Tools - Dopamine menu & pattern interrupts</div>
            <div class="feature">VENUED Project Management - Keep your projects on track</div>
          </div>

          <p><strong>Your trial ends on ${trialEndDate}</strong></p>
          <p>After your trial, you'll be charged £26/month. Cancel anytime before then if it's not for you.</p>

          <div style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/supernova" class="cta-button">Start Building</a>
          </div>

          <div class="footer">
            <p>Questions? Reply to this email or contact us at hello@daitaniverse.com</p>
            <p>dAItaniverse - Built for rebels who refuse to fit the mold</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Welcome to dAItaniverse, ${userName}!

Your 7-day free trial has started. Here's what you get:

• SUPERNova AI Coaching - Your 24/7 ADHD-friendly coach
• Quiz Builder - Create lead-generating quizzes
• Knowledge Library - Full access to all content
• ADHD Support Tools - Dopamine menu & pattern interrupts
• VENUED Project Management - Keep your projects on track

Your trial ends on ${trialEndDate}.

After your trial, you'll be charged £26/month. Cancel anytime.

Get started: ${process.env.NEXT_PUBLIC_APP_URL}/supernova

Questions? Email hello@daitaniverse.com
    `,
  }
}

export function getPaymentReceiptEmail(
  userName: string,
  amount: string,
  receiptUrl: string
): EmailTemplate {
  return {
    subject: 'Payment Receipt - dAItaniverse',
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; background-color: #000; color: #fff; padding: 40px;">
        <div style="max-width: 600px; margin: 0 auto; background: #1a1a1a; border-radius: 24px; padding: 40px; border: 2px solid #00F0E9;">
          <h1 style="color: #00F0E9;">Payment Received</h1>
          <p>Hi ${userName},</p>
          <p>Thank you for your payment of <strong>${amount}</strong>.</p>
          <p>Your dAItaniverse membership is active and ready to use.</p>
          <div style="margin: 32px 0;">
            <a href="${receiptUrl}" style="display: inline-block; background: linear-gradient(135deg, #FF008E, #00F0E9); color: #fff; padding: 16px 32px; text-decoration: none; border-radius: 12px; font-weight: bold;">Download Receipt</a>
          </div>
          <p>Keep building amazing things!</p>
          <p style="color: #666; font-size: 14px; margin-top: 32px;">Questions? Contact hello@daitaniverse.com</p>
        </div>
      </body>
      </html>
    `,
    text: `
Payment Received

Hi ${userName},

Thank you for your payment of ${amount}.

Your dAItaniverse membership is active and ready to use.

Download your receipt: ${receiptUrl}

Questions? Email hello@daitaniverse.com
    `,
  }
}

export function getPaymentFailedEmail(userName: string, retryDate: string): EmailTemplate {
  return {
    subject: 'Payment Failed - Action Required',
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; background-color: #000; color: #fff; padding: 40px;">
        <div style="max-width: 600px; margin: 0 auto; background: #1a1a1a; border-radius: 24px; padding: 40px; border: 2px solid #FF008E;">
          <h1 style="color: #FF008E;">Payment Failed</h1>
          <p>Hi ${userName},</p>
          <p>We were unable to process your payment for dAItaniverse membership.</p>
          <p>We'll automatically retry on ${retryDate}. Please make sure your payment method is up to date.</p>
          <div style="margin: 32px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/account/billing" style="display: inline-block; background: linear-gradient(135deg, #FF008E, #00F0E9); color: #fff; padding: 16px 32px; text-decoration: none; border-radius: 12px; font-weight: bold;">Update Payment Method</a>
          </div>
          <p style="color: #666; font-size: 14px; margin-top: 32px;">Questions? Contact hello@daitaniverse.com</p>
        </div>
      </body>
      </html>
    `,
    text: `
Payment Failed

Hi ${userName},

We were unable to process your payment for dAItaniverse membership.

We'll automatically retry on ${retryDate}. Please update your payment method:
${process.env.NEXT_PUBLIC_APP_URL}/account/billing

Questions? Email hello@daitaniverse.com
    `,
  }
}

export function getTrialEndingEmail(userName: string, daysLeft: number): EmailTemplate {
  return {
    subject: `Your dAItaniverse Trial Ends in ${daysLeft} Days`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; background-color: #000; color: #fff; padding: 40px;">
        <div style="max-width: 600px; margin: 0 auto; background: #1a1a1a; border-radius: 24px; padding: 40px; border: 2px solid #00F0E9;">
          <h1 style="color: #00F0E9;">Your Trial is Ending Soon</h1>
          <p>Hi ${userName},</p>
          <p>Your 7-day free trial of dAItaniverse ends in <strong>${daysLeft} days</strong>.</p>
          <p>After your trial ends, you'll be charged £26/month to continue your membership.</p>
          <p><strong>Don't want to continue?</strong> Cancel anytime before your trial ends - no questions asked.</p>
          <div style="margin: 32px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/account/billing" style="display: inline-block; background: linear-gradient(135deg, #FF008E, #00F0E9); color: #fff; padding: 16px 32px; text-decoration: none; border-radius: 12px; font-weight: bold;">Manage Subscription</a>
          </div>
          <p style="color: #666; font-size: 14px; margin-top: 32px;">Questions? Contact hello@daitaniverse.com</p>
        </div>
      </body>
      </html>
    `,
    text: `
Your Trial is Ending Soon

Hi ${userName},

Your 7-day free trial of dAItaniverse ends in ${daysLeft} days.

After your trial, you'll be charged £26/month.

Don't want to continue? Cancel anytime:
${process.env.NEXT_PUBLIC_APP_URL}/account/billing

Questions? Email hello@daitaniverse.com
    `,
  }
}

export function getSubscriptionCancelledEmail(
  userName: string,
  accessEndDate: string
): EmailTemplate {
  return {
    subject: "Subscription Cancelled - We'll Miss You",
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; background-color: #000; color: #fff; padding: 40px;">
        <div style="max-width: 600px; margin: 0 auto; background: #1a1a1a; border-radius: 24px; padding: 40px; border: 2px solid #FF008E;">
          <h1>Subscription Cancelled</h1>
          <p>Hi ${userName},</p>
          <p>We're sorry to see you go! Your subscription has been cancelled.</p>
          <p><strong>You still have access until ${accessEndDate}</strong></p>
          <p>After that date, you won't be charged again.</p>
          <p>Changed your mind? You can reactivate your subscription anytime before ${accessEndDate}.</p>
          <div style="margin: 32px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/account/billing" style="display: inline-block; background: linear-gradient(135deg, #FF008E, #00F0E9); color: #fff; padding: 16px 32px; text-decoration: none; border-radius: 12px; font-weight: bold;">Reactivate Subscription</a>
          </div>
          <p style="color: #666; font-size: 14px; margin-top: 32px;">We'd love to hear your feedback: hello@daitaniverse.com</p>
        </div>
      </body>
      </html>
    `,
    text: `
Subscription Cancelled

Hi ${userName},

Your subscription has been cancelled.

You still have access until ${accessEndDate}.

Changed your mind? Reactivate:
${process.env.NEXT_PUBLIC_APP_URL}/account/billing

We'd love your feedback: hello@daitaniverse.com
    `,
  }
}

// Helper function to send emails (console log for now, integrate with SendGrid later)
export async function sendEmail(to: string, template: EmailTemplate) {
  console.log('=== EMAIL NOTIFICATION ===')
  console.log('To:', to)
  console.log('Subject:', template.subject)
  console.log('Body:', template.text)
  console.log('========================')

  // TODO: Integrate with SendGrid
  // const sgMail = require('@sendgrid/mail')
  // sgMail.setApiKey(process.env.SENDGRID_API_KEY)
  // await sgMail.send({
  //   to,
  //   from: process.env.SENDGRID_FROM_EMAIL,
  //   subject: template.subject,
  //   text: template.text,
  //   html: template.html,
  // })
}
