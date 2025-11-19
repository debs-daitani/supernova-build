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
