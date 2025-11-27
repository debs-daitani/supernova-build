/**
 * Phase 2BF: Email Templates
 * Pre-built email templates for signup flow
 */

/**
 * Verification Email Template
 */
export function getVerificationEmailTemplate(name, verificationUrl) {
  return {
    subject: 'Verify your email for The dAItaniverse',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #9333ea;
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
            margin: 20px 0;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            font-size: 12px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <h1>Hey ${name}!</h1>

        <p>Thanks for signing up!</p>

        <p>Click to verify your email and activate your account:</p>

        <a href="${verificationUrl}" class="button">VERIFY EMAIL →</a>

        <p><small>Or copy this link: ${verificationUrl}</small></p>

        <p>This link expires in 24 hours.</p>

        <p>Didn't sign up? Ignore this email.</p>

        <p>See you inside!<br>Debs 🤘</p>

        <div class="footer">
          <p>The dAItaniverse<br>
          Questions? Email debs@daitaniverse.com</p>
        </div>
      </body>
      </html>
    `,
    text: `
Hey ${name}!

Thanks for signing up!

Click to verify your email and activate your account:
${verificationUrl}

This link expires in 24 hours.

Didn't sign up? Ignore this email.

See you inside!
Debs 🤘

---
The dAItaniverse
Questions? Email debs@daitaniverse.com
    `
  };
}

/**
 * Welcome Email Template
 */
export function getWelcomeEmailTemplate(name, email, planType, trialEndDate) {
  const isTrial = planType === 'trial';

  return {
    subject: 'Welcome to The dAItaniverse! 🎉',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .details-box {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }
          .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #9333ea;
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
            margin: 10px 0;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            font-size: 12px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <h1>Hey ${name}!</h1>

        <p>You're officially in!</p>

        <div class="details-box">
          <h3>Your Details:</h3>
          <ul>
            <li><strong>Email:</strong> ${email}</li>
            <li><strong>Plan:</strong> ${isTrial ? '7-Day Free Trial' : 'PRO'}</li>
            ${isTrial ? `<li><strong>Trial ends:</strong> ${new Date(trialEndDate).toLocaleDateString()}</li>` : ''}
          </ul>
        </div>

        <h3>QUICK START:</h3>

        <ol>
          <li>Log in: <a href="https://app.daitaniverse.com">https://app.daitaniverse.com</a></li>
          <li>Watch this 2-minute tour (coming soon!)</li>
          <li>Build something!</li>
        </ol>

        <h3>WHAT TO DO FIRST:</h3>

        <p>Choose ONE thing to build today:</p>
        <ul>
          <li><strong>Website?</strong> Start with Website Builder</li>
          <li><strong>Online store?</strong> Start with Ecommerce</li>
          <li><strong>Course?</strong> Start with Course Platform</li>
          <li><strong>Not sure?</strong> Ask SUPERNova AI!</li>
        </ul>

        <a href="https://app.daitaniverse.com/dashboard" class="button">GO TO DASHBOARD →</a>

        <p>Need help? Just reply to this email.</p>

        <p>Let's build your empire!</p>

        <p>Debs<br>Founder, The dAItaniverse</p>

        <p><small>P.S. Stuck? I read every email. Reply anytime.</small></p>

        <div class="footer">
          <p>The dAItaniverse<br>
          Questions? Email debs@daitaniverse.com</p>
        </div>
      </body>
      </html>
    `,
    text: `
Hey ${name}!

You're officially in!

Your Details:
- Email: ${email}
- Plan: ${isTrial ? '7-Day Free Trial' : 'PRO'}
${isTrial ? `- Trial ends: ${new Date(trialEndDate).toLocaleDateString()}` : ''}

QUICK START:

1. Log in: https://app.daitaniverse.com
2. Watch this 2-minute tour (coming soon!)
3. Build something!

WHAT TO DO FIRST:

Choose ONE thing to build today:
- Website? Start with Website Builder
- Online store? Start with Ecommerce
- Course? Start with Course Platform
- Not sure? Ask SUPERNova AI!

Need help? Just reply to this email.

Let's build your empire!

Debs
Founder, The dAItaniverse

P.S. Stuck? I read every email. Reply anytime.

---
The dAItaniverse
Questions? Email debs@daitaniverse.com
    `
  };
}

/**
 * Trial Reminder Email - Day 5
 */
export function getTrialReminder5Template(name, trialEndDate) {
  return {
    subject: 'Your trial ends in 2 days ⏰',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .highlight {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            margin: 20px 0;
          }
          .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #9333ea;
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
            margin: 10px 0;
          }
        </style>
      </head>
      <body>
        <h1>Hey ${name},</h1>

        <p>Quick heads up: Your trial ends in 2 days.</p>

        <div class="highlight">
          <strong>Trial ends:</strong> ${new Date(trialEndDate).toLocaleString()}
        </div>

        <h3>HOW'S IT GOING?</h3>

        <p>I'd love to hear:</p>
        <ul>
          <li>What have you built so far?</li>
          <li>Any questions?</li>
          <li>What feature do you love most?</li>
        </ul>

        <p>Just reply and let me know!</p>

        <h3>WANT TO KEEP EVERYTHING?</h3>

        <p>Upgrade to Pro (£26/month) and keep:</p>
        <ul>
          <li>✅ Everything you've built</li>
          <li>✅ All 40+ tools</li>
          <li>✅ Priority support</li>
          <li>✅ SUPERNova AI</li>
        </ul>

        <a href="https://app.daitaniverse.com/upgrade" class="button">Upgrade Now →</a>

        <p>Or stay on trial and we'll remind you again tomorrow.</p>

        <p>Debs</p>

        <p><small>P.S. Upgrading takes 30 seconds. No data loss. Everything stays.</small></p>
      </body>
      </html>
    `
  };
}

/**
 * Trial Expired Email
 */
export function getTrialExpiredTemplate(name) {
  return {
    subject: 'Your trial has ended',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #9333ea;
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
            margin: 10px 0;
          }
        </style>
      </head>
      <body>
        <h1>Hey ${name},</h1>

        <p>Your 7-day trial just ended.</p>

        <p>Miss it already?</p>

        <p>Come back anytime:</p>

        <a href="https://app.daitaniverse.com/upgrade" class="button">Upgrade to Pro - £26/Month →</a>

        <p>All your data is saved for 30 days. Upgrade now and pick up where you left off.</p>

        <p>Questions? Just reply.</p>

        <p>Debs</p>

        <p><small>P.S. We miss you already! 😢</small></p>
      </body>
      </html>
    `
  };
}

/**
 * Abandoned Signup Recovery Email
 */
export function getAbandonedSignupTemplate(name, email, sessionData) {
  return {
    subject: 'You were so close!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #9333ea;
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
            margin: 10px 0;
          }
        </style>
      </head>
      <body>
        <h1>Hey ${name || 'there'}!</h1>

        <p>I noticed you started signing up but didn't finish.</p>

        <p>Everything okay?</p>

        <p>Your account is waiting:</p>

        <a href="https://app.daitaniverse.com/signup" class="button">Complete Signup →</a>

        <p>Takes just 2 more minutes.</p>

        <p>Questions? Just reply!</p>

        <p>Debs</p>
      </body>
      </html>
    `
  };
}

/**
 * Phase 2BG: Payment Email Templates
 */

/**
 * Receipt Email Template
 */
export function getReceiptEmailTemplate(name, email, amount, currency, invoicePdfUrl) {
  return {
    subject: 'Receipt for your payment - The dAItaniverse',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .details-box {
            background: #f0fdf4;
            border: 1px solid #86efac;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }
          .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #9333ea;
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
            margin: 10px 0;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            font-size: 12px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <h1>Payment Received ✅</h1>

        <p>Hey ${name}!</p>

        <p>Thanks for your payment!</p>

        <div class="details-box">
          <h3>Receipt Details:</h3>
          <ul>
            <li><strong>Amount:</strong> ${currency} ${amount.toFixed(2)}</li>
            <li><strong>Email:</strong> ${email}</li>
            <li><strong>Date:</strong> ${new Date().toLocaleDateString()}</li>
          </ul>
        </div>

        ${invoicePdfUrl ? `<a href="${invoicePdfUrl}" class="button">Download Invoice (PDF) →</a>` : ''}

        <p>Your subscription is active and you have full access to all features.</p>

        <p>Need help? Just reply to this email.</p>

        <p>Debs<br>Founder, The dAItaniverse</p>

        <div class="footer">
          <p>The dAItaniverse<br>
          Questions? Email debs@daitaniverse.com</p>
        </div>
      </body>
      </html>
    `,
    text: `
Payment Received ✅

Hey ${name}!

Thanks for your payment!

Receipt Details:
- Amount: ${currency} ${amount.toFixed(2)}
- Email: ${email}
- Date: ${new Date().toLocaleDateString()}

${invoicePdfUrl ? `Download Invoice: ${invoicePdfUrl}` : ''}

Your subscription is active and you have full access to all features.

Need help? Just reply to this email.

Debs
Founder, The dAItaniverse

---
The dAItaniverse
Questions? Email debs@daitaniverse.com
    `
  };
}

/**
 * Payment Failed Email Template
 */
export function getPaymentFailedEmailTemplate(name, amount, currency, nextAttemptDate) {
  return {
    subject: 'Payment failed - Action required',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .warning-box {
            background: #fef2f2;
            border: 1px solid #fca5a5;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }
          .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #dc2626;
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
            margin: 10px 0;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            font-size: 12px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <h1>Payment Failed ⚠️</h1>

        <p>Hey ${name},</p>

        <p>We couldn't process your payment.</p>

        <div class="warning-box">
          <h3>Payment Details:</h3>
          <ul>
            <li><strong>Amount:</strong> ${currency} ${amount.toFixed(2)}</li>
            <li><strong>Status:</strong> Failed</li>
            ${nextAttemptDate ? `<li><strong>Next retry:</strong> ${nextAttemptDate.toLocaleDateString()}</li>` : ''}
          </ul>
        </div>

        <h3>WHAT TO DO:</h3>

        <ol>
          <li>Check your payment method is valid</li>
          <li>Make sure you have sufficient funds</li>
          <li>Update your payment details</li>
        </ol>

        <a href="https://app.daitaniverse.com/billing" class="button">Update Payment Method →</a>

        <p>Your account will remain active for a few days while we retry the payment.</p>

        <p>Questions? Just reply!</p>

        <p>Debs<br>Founder, The dAItaniverse</p>

        <div class="footer">
          <p>The dAItaniverse<br>
          Questions? Email debs@daitaniverse.com</p>
        </div>
      </body>
      </html>
    `,
    text: `
Payment Failed ⚠️

Hey ${name},

We couldn't process your payment.

Payment Details:
- Amount: ${currency} ${amount.toFixed(2)}
- Status: Failed
${nextAttemptDate ? `- Next retry: ${nextAttemptDate.toLocaleDateString()}` : ''}

WHAT TO DO:

1. Check your payment method is valid
2. Make sure you have sufficient funds
3. Update your payment details

Update Payment Method: https://app.daitaniverse.com/billing

Your account will remain active for a few days while we retry the payment.

Questions? Just reply!

Debs
Founder, The dAItaniverse

---
The dAItaniverse
Questions? Email debs@daitaniverse.com
    `
  };
}

/**
 * Cancellation Email Template
 */
export function getCancellationEmailTemplate(name, immediately, periodEndDate) {
  return {
    subject: 'Subscription canceled - We\'ll miss you!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .info-box {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }
          .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #9333ea;
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
            margin: 10px 0;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            font-size: 12px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <h1>Subscription Canceled</h1>

        <p>Hey ${name},</p>

        <p>Your subscription has been canceled.</p>

        <div class="info-box">
          <h3>What happens now:</h3>
          ${immediately
            ? '<p><strong>Your access has ended immediately.</strong></p>'
            : `<p><strong>Access until:</strong> ${periodEndDate ? new Date(periodEndDate).toLocaleDateString() : 'End of billing period'}</p>
               <p>You'll keep full access until then. No further charges.</p>`
          }
        </div>

        <h3>BEFORE YOU GO:</h3>

        <p>Can you help me improve?</p>

        <p>What made you cancel?</p>
        <ul>
          <li>Too expensive?</li>
          <li>Missing a feature?</li>
          <li>Too complicated?</li>
          <li>Found something better?</li>
        </ul>

        <p>Just reply and let me know. I read every email.</p>

        <h3>CHANGED YOUR MIND?</h3>

        <p>You can reactivate anytime:</p>

        <a href="https://app.daitaniverse.com/billing" class="button">Reactivate Subscription →</a>

        <p>All your data will be saved for 30 days.</p>

        <p>Thanks for being part of The dAItaniverse!</p>

        <p>Debs<br>Founder, The dAItaniverse</p>

        <p><small>P.S. Door's always open if you want to come back! 💜</small></p>

        <div class="footer">
          <p>The dAItaniverse<br>
          Questions? Email debs@daitaniverse.com</p>
        </div>
      </body>
      </html>
    `,
    text: `
Subscription Canceled

Hey ${name},

Your subscription has been canceled.

What happens now:
${immediately
  ? 'Your access has ended immediately.'
  : `Access until: ${periodEndDate ? new Date(periodEndDate).toLocaleDateString() : 'End of billing period'}
You'll keep full access until then. No further charges.`
}

BEFORE YOU GO:

Can you help me improve?

What made you cancel?
- Too expensive?
- Missing a feature?
- Too complicated?
- Found something better?

Just reply and let me know. I read every email.

CHANGED YOUR MIND?

You can reactivate anytime: https://app.daitaniverse.com/billing

All your data will be saved for 30 days.

Thanks for being part of The dAItaniverse!

Debs
Founder, The dAItaniverse

P.S. Door's always open if you want to come back! 💜

---
The dAItaniverse
Questions? Email debs@daitaniverse.com
    `
  };
}

/**
 * Refund Email Template
 */
export function getRefundEmailTemplate(name, amount) {
  return {
    subject: 'Refund processed - The dAItaniverse',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .success-box {
            background: #f0fdf4;
            border: 1px solid #86efac;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            font-size: 12px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <h1>Refund Processed ✅</h1>

        <p>Hey ${name},</p>

        <p>Your refund has been processed.</p>

        <div class="success-box">
          <h3>Refund Details:</h3>
          <ul>
            <li><strong>Amount:</strong> £${amount.toFixed(2)}</li>
            <li><strong>Date:</strong> ${new Date().toLocaleDateString()}</li>
            <li><strong>Processing time:</strong> 5-10 business days</li>
          </ul>
        </div>

        <p>The refund will appear on your original payment method within 5-10 business days.</p>

        <p>If you don't see it after 10 days, contact your bank or reply to this email.</p>

        <p>Sorry to see you go!</p>

        <p>Debs<br>Founder, The dAItaniverse</p>

        <div class="footer">
          <p>The dAItaniverse<br>
          Questions? Email debs@daitaniverse.com</p>
        </div>
      </body>
      </html>
    `,
    text: `
Refund Processed ✅

Hey ${name},

Your refund has been processed.

Refund Details:
- Amount: £${amount.toFixed(2)}
- Date: ${new Date().toLocaleDateString()}
- Processing time: 5-10 business days

The refund will appear on your original payment method within 5-10 business days.

If you don't see it after 10 days, contact your bank or reply to this email.

Sorry to see you go!

Debs
Founder, The dAItaniverse

---
The dAItaniverse
Questions? Email debs@daitaniverse.com
    `
  };
}
