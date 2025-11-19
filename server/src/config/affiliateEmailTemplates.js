/**
 * Affiliate Email Templates
 * Templates for affiliate program notifications
 */

/**
 * Welcome email when someone joins affiliate program
 */
function getWelcomeEmail(affiliate) {
  return {
    subject: '🎉 Welcome to The dAItaniverse Affiliate Program!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f97316 0%, #ec4899 100%); color: white; padding: 30px; text-align: center; border-radius: 10px; }
          .content { background: #f9fafb; padding: 30px; border-radius: 10px; margin-top: 20px; }
          .code-box { background: white; border: 2px solid #f97316; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
          .code { font-size: 24px; font-weight: bold; color: #f97316; font-family: monospace; }
          .link-box { background: #fff7ed; border-left: 4px solid #f97316; padding: 15px; margin: 20px 0; }
          .button { display: inline-block; background: #f97316; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 10px 0; }
          .stats { display: flex; gap: 20px; margin: 20px 0; }
          .stat { flex: 1; background: white; padding: 15px; border-radius: 8px; text-align: center; }
          .stat-value { font-size: 24px; font-weight: bold; color: #f97316; }
          .stat-label { font-size: 12px; color: #6b7280; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">Welcome to the Team! 🎉</h1>
            <p style="margin: 10px 0 0 0;">You're now part of The dAItaniverse Affiliate Program</p>
          </div>

          <div class="content">
            <h2>Hi ${affiliate.user?.name || 'there'},</h2>

            <p>Congratulations! Your affiliate account has been created and you're ready to start earning.</p>

            <div class="code-box">
              <p style="margin: 0 0 10px 0;">Your Unique Affiliate Code</p>
              <div class="code">${affiliate.affiliateCode}</div>
            </div>

            <div class="link-box">
              <strong>Your Referral Link:</strong><br>
              <a href="${affiliate.referralLink}" style="color: #f97316; word-break: break-all;">
                ${affiliate.referralLink}
              </a>
            </div>

            <div class="stats">
              <div class="stat">
                <div class="stat-value">${affiliate.commissionRate * 100}%</div>
                <div class="stat-label">Commission Rate</div>
              </div>
              <div class="stat">
                <div class="stat-value">£26</div>
                <div class="stat-label">Per Referral/Month</div>
              </div>
              <div class="stat">
                <div class="stat-value">30</div>
                <div class="stat-label">Day Cookie</div>
              </div>
            </div>

            <h3>What's Next?</h3>
            <ol>
              <li><strong>Share your link</strong> - Post it on social media, blog, email, or anywhere your audience is</li>
              <li><strong>Use marketing materials</strong> - Download banners, graphics, and templates from your dashboard</li>
              <li><strong>Track performance</strong> - Monitor clicks, signups, and earnings in real-time</li>
              <li><strong>Get paid</strong> - Request payouts once you reach £50 (minimum)</li>
            </ol>

            <p style="text-align: center;">
              <a href="https://thedaitaniverse.com/dashboard/affiliate" class="button">
                Visit Your Dashboard
              </a>
            </p>

            <h3>Commission Tiers</h3>
            <p>The more you refer, the more you earn:</p>
            <ul>
              <li><strong>Bronze (0-10 referrals):</strong> 20% commission</li>
              <li><strong>Silver (11-50 referrals):</strong> 25% commission</li>
              <li><strong>Gold (51+ referrals):</strong> 30% commission</li>
            </ul>

            <p>Questions? Reply to this email or check out our <a href="https://thedaitaniverse.com/affiliate-program" style="color: #f97316;">Affiliate Program page</a>.</p>

            <p>Let's make some money together! 💰</p>

            <p>Best,<br>The dAItaniverse Team</p>
          </div>

          <div class="footer">
            <p>The dAItaniverse | AI-Powered Business Platform</p>
            <p><a href="https://thedaitaniverse.com" style="color: #6b7280;">thedaitaniverse.com</a></p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Welcome to The dAItaniverse Affiliate Program!

Hi ${affiliate.user?.name || 'there'},

Congratulations! Your affiliate account has been created and you're ready to start earning.

Your Unique Affiliate Code: ${affiliate.affiliateCode}
Your Referral Link: ${affiliate.referralLink}

Commission Rate: ${affiliate.commissionRate * 100}%
Per Referral: £26/month
Cookie Duration: 30 days

What's Next?
1. Share your link on social media, blog, email, or anywhere your audience is
2. Use marketing materials - Download from your dashboard
3. Track performance - Monitor clicks, signups, and earnings in real-time
4. Get paid - Request payouts once you reach £50 minimum

Commission Tiers:
- Bronze (0-10 referrals): 20% commission
- Silver (11-50 referrals): 25% commission
- Gold (51+ referrals): 30% commission

Visit your dashboard: https://thedaitaniverse.com/dashboard/affiliate

Questions? Reply to this email or visit our Affiliate Program page.

Let's make some money together!

Best,
The dAItaniverse Team
    `.trim()
  };
}

/**
 * Email when affiliate gets a new referral signup
 */
function getNewReferralEmail(affiliate, referral) {
  return {
    subject: '🎯 New Referral Signup!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px; }
          .content { background: #f9fafb; padding: 30px; border-radius: 10px; margin-top: 20px; }
          .highlight { background: #d1fae5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; }
          .button { display: inline-block; background: #f97316; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 10px 0; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">New Referral! 🎯</h1>
            <p style="margin: 10px 0 0 0;">Someone just signed up using your link</p>
          </div>

          <div class="content">
            <h2>Great news, ${affiliate.user?.name || 'there'}!</h2>

            <p>A new user just signed up through your referral link.</p>

            <div class="highlight">
              <p style="margin: 0;"><strong>Email:</strong> ${referral.referredUser?.email || 'User'}</p>
              <p style="margin: 5px 0 0 0;"><strong>Signed up:</strong> ${new Date(referral.signupDate).toLocaleDateString()}</p>
            </div>

            <p>Once they subscribe to SUPERNova-LTE (£26/month), you'll earn <strong>${affiliate.commissionRate * 100}% commission</strong> - that's <strong>£${(26 * affiliate.commissionRate).toFixed(2)}/month</strong> recurring!</p>

            <p>Keep up the great work! The more you refer, the more you earn.</p>

            <p style="text-align: center;">
              <a href="https://thedaitaniverse.com/dashboard/affiliate" class="button">
                View Your Dashboard
              </a>
            </p>

            <p>Best,<br>The dAItaniverse Team</p>
          </div>

          <div class="footer">
            <p>The dAItaniverse | AI-Powered Business Platform</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
New Referral Signup!

Great news, ${affiliate.user?.name || 'there'}!

A new user just signed up through your referral link.

Email: ${referral.referredUser?.email || 'User'}
Signed up: ${new Date(referral.signupDate).toLocaleDateString()}

Once they subscribe to SUPERNova-LTE (£26/month), you'll earn ${affiliate.commissionRate * 100}% commission - that's £${(26 * affiliate.commissionRate).toFixed(2)}/month recurring!

Keep up the great work!

View your dashboard: https://thedaitaniverse.com/dashboard/affiliate

Best,
The dAItaniverse Team
    `.trim()
  };
}

/**
 * Email when commission is earned
 */
function getCommissionEarnedEmail(affiliate, commission) {
  return {
    subject: '💰 You Earned a Commission!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); color: white; padding: 30px; text-align: center; border-radius: 10px; }
          .content { background: #f9fafb; padding: 30px; border-radius: 10px; margin-top: 20px; }
          .amount-box { background: white; border: 3px solid #fbbf24; padding: 30px; border-radius: 10px; text-align: center; margin: 20px 0; }
          .amount { font-size: 48px; font-weight: bold; color: #10b981; }
          .button { display: inline-block; background: #f97316; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 10px 0; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">Commission Earned! 💰</h1>
            <p style="margin: 10px 0 0 0;">Your referral just subscribed</p>
          </div>

          <div class="content">
            <h2>Congratulations, ${affiliate.user?.name || 'there'}!</h2>

            <p>One of your referrals just subscribed to SUPERNova-LTE!</p>

            <div class="amount-box">
              <div class="amount">£${commission.amount.toFixed(2)}</div>
              <p style="margin: 5px 0 0 0; color: #6b7280;">Monthly Recurring Commission</p>
            </div>

            <p><strong>Commission Details:</strong></p>
            <ul>
              <li>Base Amount: £${commission.baseAmount.toFixed(2)}</li>
              <li>Your Rate: ${(commission.percentage * 100).toFixed(0)}%</li>
              <li>Commission: £${commission.amount.toFixed(2)}</li>
            </ul>

            <p style="background: #fef3c7; border-left: 4px solid #fbbf24; padding: 15px; margin: 20px 0;">
              <strong>⏳ Note:</strong> This commission will be held for 30 days to account for potential refunds. After 30 days, it will be approved and available for payout.
            </p>

            <p style="text-align: center;">
              <a href="https://thedaitaniverse.com/dashboard/affiliate" class="button">
                View Your Earnings
              </a>
            </p>

            <p>Keep sharing your referral link to earn more!</p>

            <p>Best,<br>The dAItaniverse Team</p>
          </div>

          <div class="footer">
            <p>The dAItaniverse | AI-Powered Business Platform</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Commission Earned!

Congratulations, ${affiliate.user?.name || 'there'}!

One of your referrals just subscribed to SUPERNova-LTE!

Amount: £${commission.amount.toFixed(2)}/month (recurring)

Commission Details:
- Base Amount: £${commission.baseAmount.toFixed(2)}
- Your Rate: ${(commission.percentage * 100).toFixed(0)}%
- Commission: £${commission.amount.toFixed(2)}

Note: This commission will be held for 30 days to account for potential refunds. After 30 days, it will be approved and available for payout.

View your earnings: https://thedaitaniverse.com/dashboard/affiliate

Keep sharing your referral link to earn more!

Best,
The dAItaniverse Team
    `.trim()
  };
}

/**
 * Email when commission is approved (after 30 days)
 */
function getCommissionApprovedEmail(affiliate, commission) {
  return {
    subject: '✅ Commission Approved!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px; }
          .content { background: #f9fafb; padding: 30px; border-radius: 10px; margin-top: 20px; }
          .highlight { background: #d1fae5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; }
          .button { display: inline-block; background: #f97316; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 10px 0; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">Commission Approved! ✅</h1>
            <p style="margin: 10px 0 0 0;">Ready for payout</p>
          </div>

          <div class="content">
            <h2>Good news, ${affiliate.user?.name || 'there'}!</h2>

            <p>A commission of <strong>£${commission.amount.toFixed(2)}</strong> has been approved and is now available for payout!</p>

            <div class="highlight">
              <p style="margin: 0;">The 30-day hold period has passed and this commission is ready to be withdrawn.</p>
            </div>

            <p>Once you reach the minimum payout of £50, you can request a payout from your dashboard.</p>

            <p style="text-align: center;">
              <a href="https://thedaitaniverse.com/dashboard/affiliate" class="button">
                Request Payout
              </a>
            </p>

            <p>Best,<br>The dAItaniverse Team</p>
          </div>

          <div class="footer">
            <p>The dAItaniverse | AI-Powered Business Platform</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Commission Approved!

Good news, ${affiliate.user?.name || 'there'}!

A commission of £${commission.amount.toFixed(2)} has been approved and is now available for payout!

The 30-day hold period has passed and this commission is ready to be withdrawn.

Once you reach the minimum payout of £50, you can request a payout from your dashboard.

Request payout: https://thedaitaniverse.com/dashboard/affiliate

Best,
The dAItaniverse Team
    `.trim()
  };
}

/**
 * Email when payout is requested
 */
function getPayoutRequestedEmail(affiliate, payout) {
  return {
    subject: '💳 Payout Request Received',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: white; padding: 30px; text-align: center; border-radius: 10px; }
          .content { background: #f9fafb; padding: 30px; border-radius: 10px; margin-top: 20px; }
          .info-box { background: white; border: 2px solid #6366f1; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">Payout Request Received 💳</h1>
            <p style="margin: 10px 0 0 0;">We're processing your payment</p>
          </div>

          <div class="content">
            <h2>Hi ${affiliate.user?.name || 'there'},</h2>

            <p>We've received your payout request!</p>

            <div class="info-box">
              <p style="margin: 0;"><strong>Amount:</strong> £${payout.amount.toFixed(2)}</p>
              <p style="margin: 5px 0 0 0;"><strong>Method:</strong> ${payout.method}</p>
              <p style="margin: 5px 0 0 0;"><strong>Payment Email:</strong> ${payout.paymentEmail || 'N/A'}</p>
              <p style="margin: 5px 0 0 0;"><strong>Requested:</strong> ${new Date(payout.requestedAt).toLocaleDateString()}</p>
            </div>

            <p>Your payout will be processed within 3-5 business days. You'll receive a confirmation email once it's completed.</p>

            <p>Thank you for being part of The dAItaniverse Affiliate Program!</p>

            <p>Best,<br>The dAItaniverse Team</p>
          </div>

          <div class="footer">
            <p>The dAItaniverse | AI-Powered Business Platform</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Payout Request Received

Hi ${affiliate.user?.name || 'there'},

We've received your payout request!

Amount: £${payout.amount.toFixed(2)}
Method: ${payout.method}
Payment Email: ${payout.paymentEmail || 'N/A'}
Requested: ${new Date(payout.requestedAt).toLocaleDateString()}

Your payout will be processed within 3-5 business days. You'll receive a confirmation email once it's completed.

Thank you for being part of The dAItaniverse Affiliate Program!

Best,
The dAItaniverse Team
    `.trim()
  };
}

/**
 * Email when payout is completed
 */
function getPayoutCompletedEmail(affiliate, payout) {
  return {
    subject: '✅ Payout Completed!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px; }
          .content { background: #f9fafb; padding: 30px; border-radius: 10px; margin-top: 20px; }
          .success-box { background: #d1fae5; border: 2px solid #10b981; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
          .amount { font-size: 36px; font-weight: bold; color: #10b981; }
          .button { display: inline-block; background: #f97316; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 10px 0; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">Payout Completed! ✅</h1>
            <p style="margin: 10px 0 0 0;">Your money is on the way</p>
          </div>

          <div class="content">
            <h2>Congratulations, ${affiliate.user?.name || 'there'}!</h2>

            <p>Your payout has been processed successfully!</p>

            <div class="success-box">
              <div class="amount">£${payout.amount.toFixed(2)}</div>
              <p style="margin: 10px 0 0 0; color: #059669;">Sent to ${payout.paymentEmail || 'your account'}</p>
            </div>

            <p><strong>Transaction Details:</strong></p>
            <ul>
              <li>Amount: £${payout.amount.toFixed(2)}</li>
              <li>Method: ${payout.method}</li>
              <li>Transaction ID: ${payout.transactionId || 'N/A'}</li>
              <li>Processed: ${new Date(payout.paidAt || payout.processedAt).toLocaleDateString()}</li>
            </ul>

            <p>Depending on your payment method, it may take 1-3 business days for the funds to appear in your account.</p>

            <p>Keep up the great work! Continue sharing your referral link to earn more.</p>

            <p style="text-align: center;">
              <a href="https://thedaitaniverse.com/dashboard/affiliate" class="button">
                View Your Dashboard
              </a>
            </p>

            <p>Best,<br>The dAItaniverse Team</p>
          </div>

          <div class="footer">
            <p>The dAItaniverse | AI-Powered Business Platform</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Payout Completed!

Congratulations, ${affiliate.user?.name || 'there'}!

Your payout has been processed successfully!

Amount: £${payout.amount.toFixed(2)}
Method: ${payout.method}
Transaction ID: ${payout.transactionId || 'N/A'}
Processed: ${new Date(payout.paidAt || payout.processedAt).toLocaleDateString()}

Sent to: ${payout.paymentEmail || 'your account'}

Depending on your payment method, it may take 1-3 business days for the funds to appear in your account.

Keep up the great work! Continue sharing your referral link to earn more.

View your dashboard: https://thedaitaniverse.com/dashboard/affiliate

Best,
The dAItaniverse Team
    `.trim()
  };
}

/**
 * Email when tier is upgraded
 */
function getTierUpgradeEmail(affiliate, newTier, newRate) {
  const tierEmojis = {
    BRONZE: '🥉',
    SILVER: '🥈',
    GOLD: '🥇'
  };

  return {
    subject: `🎉 Congratulations! You're Now ${newTier}!`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); color: white; padding: 30px; text-align: center; border-radius: 10px; }
          .content { background: #f9fafb; padding: 30px; border-radius: 10px; margin-top: 20px; }
          .tier-box { background: white; border: 3px solid #fbbf24; padding: 30px; border-radius: 10px; text-align: center; margin: 20px 0; }
          .tier { font-size: 48px; font-weight: bold; color: #f59e0b; }
          .button { display: inline-block; background: #f97316; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 10px 0; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">Tier Upgrade! ${tierEmojis[newTier] || '🎉'}</h1>
            <p style="margin: 10px 0 0 0;">You've unlocked a higher commission rate</p>
          </div>

          <div class="content">
            <h2>Amazing work, ${affiliate.user?.name || 'there'}!</h2>

            <p>You've been upgraded to the <strong>${newTier}</strong> tier!</p>

            <div class="tier-box">
              <div style="font-size: 64px; margin-bottom: 10px;">${tierEmojis[newTier] || '🎉'}</div>
              <div class="tier">${newTier}</div>
              <p style="margin: 10px 0 0 0; color: #f59e0b; font-size: 24px; font-weight: bold;">
                ${(newRate * 100).toFixed(0)}% Commission
              </p>
            </div>

            <p>Your new commission rate of <strong>${(newRate * 100).toFixed(0)}%</strong> will apply to all future commissions.</p>

            <p>Keep referring to reach the next tier and earn even more!</p>

            <p style="text-align: center;">
              <a href="https://thedaitaniverse.com/dashboard/affiliate" class="button">
                View Your Dashboard
              </a>
            </p>

            <p>Best,<br>The dAItaniverse Team</p>
          </div>

          <div class="footer">
            <p>The dAItaniverse | AI-Powered Business Platform</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Tier Upgrade! ${tierEmojis[newTier] || '🎉'}

Amazing work, ${affiliate.user?.name || 'there'}!

You've been upgraded to the ${newTier} tier!

New Commission Rate: ${(newRate * 100).toFixed(0)}%

Your new commission rate will apply to all future commissions.

Keep referring to reach the next tier and earn even more!

View your dashboard: https://thedaitaniverse.com/dashboard/affiliate

Best,
The dAItaniverse Team
    `.trim()
  };
}

module.exports = {
  getWelcomeEmail,
  getNewReferralEmail,
  getCommissionEarnedEmail,
  getCommissionApprovedEmail,
  getPayoutRequestedEmail,
  getPayoutCompletedEmail,
  getTierUpgradeEmail
};
