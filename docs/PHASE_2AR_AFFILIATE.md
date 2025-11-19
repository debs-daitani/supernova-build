# Phase 2AR: Affiliate Program

Complete implementation of the affiliate/referral program for The dAItaniverse platform.

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Database Schema](#database-schema)
- [Commission Structure](#commission-structure)
- [Backend Services](#backend-services)
- [API Endpoints](#api-endpoints)
- [Frontend Components](#frontend-components)
- [Tracking Implementation](#tracking-implementation)
- [Email Notifications](#email-notifications)
- [Integration Guide](#integration-guide)
- [Testing](#testing)

## 🎯 Overview

Phase 2AR provides a complete affiliate/referral program that:

- **Generates unique referral codes** for each affiliate
- **Tracks referrals** via cookies and UTM parameters
- **Awards commissions** (20-30%) on subscription revenue
- **Provides tiered rewards** based on referral count
- **Processes payouts** monthly (minimum £50)
- **Supplies marketing materials** for promotion
- **Sends automated emails** for all affiliate events

Think of it as: **ShareASale + Refersion + Tapfiliate** - all in one.

## 🏗️ Architecture

### Commission Flow

```
User Clicks Referral Link
         ↓
Cookie Set (30 days)
         ↓
User Signs Up → Referral Recorded
         ↓
User Subscribes → Commission Created (PENDING)
         ↓
30 Days Pass → Commission Approved
         ↓
Affiliate Requests Payout (min £50)
         ↓
Admin Processes → Payout Completed
```

### Commission Tiers

```
┌─────────────────┐
│  Bronze Tier    │  0-10 referrals
│     20%         │  £5.20/referral/month
└─────────────────┘

┌─────────────────┐
│  Silver Tier    │  11-50 referrals
│     25%         │  £6.50/referral/month
└─────────────────┘

┌─────────────────┐
│   Gold Tier     │  51+ referrals
│     30%         │  £7.80/referral/month
└─────────────────┘
```

### Components

1. **Database Layer** - Prisma models for affiliates, referrals, commissions, payouts
2. **Service Layer** - Business logic for affiliate operations
3. **Middleware Layer** - Cookie tracking and URL parsing
4. **API Layer** - REST endpoints for affiliates and admins
5. **Frontend Layer** - Public landing page, dashboard, admin panel
6. **Email Layer** - Automated notifications

## 🗄️ Database Schema

### Models

**AffiliateProfile** - Affiliate account
```prisma
- userId, affiliateCode, referralLink
- commissionRate, tier (BRONZE/SILVER/GOLD)
- totalEarnings, pendingEarnings, paidEarnings
- status (ACTIVE, PENDING, SUSPENDED, CLOSED)
- paymentMethod, paymentEmail, paymentDetails
- totalClicks, totalSignups, totalConversions
```

**Referral** - Tracked referred users
```prisma
- affiliateId, referredUserId, referralCode
- status (SIGNED_UP, TRIAL, SUBSCRIBED, CANCELLED, REFUNDED)
- signupDate, firstPurchaseDate
- totalValue, lifetimeMonths
- ipAddress, userAgent, landingPage
```

**Commission** - Individual commission records
```prisma
- affiliateId, referralId
- amount, percentage, baseAmount
- orderId, subscriptionId, invoiceId
- status (PENDING, APPROVED, PAID, CANCELLED, EXPIRED)
- createdAt, approvedAt, paidAt, cancelledAt
```

**Payout** - Batch payouts to affiliates
```prisma
- affiliateId, amount, currency
- method (PAYPAL, BANK_TRANSFER, STRIPE, CHECK)
- status (PENDING, PROCESSING, COMPLETED, FAILED, CANCELLED)
- transactionId, processorFee, netAmount
- requestedAt, processedAt, paidAt
```

**AffiliateMaterial** - Marketing assets
```prisma
- title, description, type (BANNER, EMAIL, SOCIAL, VIDEO, etc.)
- fileUrl, thumbnailUrl, content
- category, tags, dimensions, fileSize
- downloadCount, useCount
```

**ReferralClick** - Click tracking
```prisma
- affiliateCode, affiliateId
- ipAddress, userAgent, referer, landingPage
- utmSource, utmMedium, utmCampaign
- converted, convertedUserId
- clickedAt
```

### Relationships

```
User ─┬─ AffiliateProfile
      └─ Referral (as referredUser)

AffiliateProfile ─┬─ Referrals[]
                  ├─ Commissions[]
                  └─ Payouts[]

Referral ─── Commissions[]

Commission ─── Payout (optional)
```

## 💰 Commission Structure

### Subscription: SUPERNova-LTE (£26/month)

| Tier   | Referrals | Rate | Per Referral | 10 Referrals | 50 Referrals | 100 Referrals |
|--------|-----------|------|--------------|--------------|--------------|---------------|
| Bronze | 0-10      | 20%  | £5.20/mo     | £52/mo       | -            | -             |
| Silver | 11-50     | 25%  | £6.50/mo     | £65/mo       | £325/mo      | -             |
| Gold   | 51+       | 30%  | £7.80/mo     | £78/mo       | £390/mo      | £780/mo       |

### Commission Lifecycle

1. **Created (PENDING)** - When referral subscribes
2. **30-Day Hold** - Refund protection period
3. **Approved** - After 30 days, available for payout
4. **Paid** - Included in completed payout
5. **Cancelled** - If subscription refunded/cancelled during hold period

### Payout Rules

- **Minimum:** £50
- **Frequency:** Monthly (or when requested)
- **Methods:** PayPal, Bank Transfer, Stripe
- **Processing Time:** 3-5 business days

## ⚙️ Backend Services

### Affiliate Service

**File:** `/server/src/services/affiliateService.js`

**Key Functions:**

```javascript
// Generate unique affiliate code
generateAffiliateCode(userId, userName)
// Returns: "DEBS123ABC"

// Create affiliate profile
await createAffiliateProfile(userId, paymentInfo, prisma)
// Returns: { id, affiliateCode, referralLink, commissionRate, tier }

// Track referral click
await trackReferralClick(referralCode, trackingData, prisma)
// Increments click count, stores tracking data

// Record signup
await recordSignup(userId, referralCode, prisma)
// Creates referral record, updates signup count

// Calculate commission
calculateCommission(subscriptionAmount, affiliateRate)
// Returns: commission amount (e.g., 26 * 0.20 = 5.20)

// Record commission
await recordCommission(referralId, amount, details, prisma)
// Creates PENDING commission, updates affiliate totals

// Approve commission (after 30 days)
await approveCommission(commissionId, prisma)
// Changes status to APPROVED, ready for payout

// Cancel commission (refund/cancellation)
await cancelCommission(commissionId, reason, prisma)
// Changes status to CANCELLED, adjusts totals

// Request payout
await requestPayout(affiliateId, amount, prisma)
// Creates payout request, marks commissions as PAID

// Process payout (admin)
await processPayout(payoutId, transactionId, prisma)
// Marks payout as COMPLETED, updates paid earnings

// Get affiliate stats
await getAffiliateStats(affiliateId, prisma)
// Returns: full stats, recent referrals, commissions, payouts

// Update affiliate tier
await updateAffiliateTier(affiliateId, prisma)
// Auto-upgrades tier based on referral count

// Validate referral code
await validateReferralCode(code, prisma)
// Returns: true if valid and active
```

### Tracking Middleware

**File:** `/server/src/middleware/affiliateTracking.js`

**Functions:**

```javascript
// Main tracking middleware
trackReferrals(prisma)
// Extracts ?ref=CODE, sets cookie, tracks click

// Get referral code
getReferralCode(req)
// Returns code from URL or cookie

// Clear referral cookie
clearReferralCookie(res)
// Removes cookie after attribution

// Short URL handler
handleShortUrl(prisma)
// Handles /r/CODE format

// Mark conversion
await markConversion(referralCode, userId, prisma)
// Updates click record with conversion

// Get referral stats
await getReferralStats(affiliateCode, prisma)
// Returns: clicks, conversions, conversion rate
```

## 🔌 API Endpoints

### Public Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/affiliate/validate/:code` | Validate referral code |
| GET | `/api/affiliate/program-info` | Get program tiers and terms |

### User Routes (Authenticated)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/affiliate/join` | Join affiliate program |
| GET | `/api/affiliate/my-profile` | Get affiliate profile |
| PUT | `/api/affiliate/payment-info` | Update payment details |
| GET | `/api/affiliate/my-stats` | Get performance stats |
| GET | `/api/affiliate/my-referrals` | List referrals |
| GET | `/api/affiliate/my-commissions` | List commissions |
| POST | `/api/affiliate/request-payout` | Request payout |
| GET | `/api/affiliate/my-payouts` | List payouts |
| GET | `/api/affiliate/materials` | Get marketing materials |
| POST | `/api/affiliate/materials/:id/download` | Track material download |

### Admin Routes (Admin Only)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/affiliate/admin/affiliates` | List all affiliates |
| GET | `/api/affiliate/admin/payouts/pending` | Get pending payouts |
| POST | `/api/affiliate/admin/payouts/:id/process` | Process payout |
| POST | `/api/affiliate/admin/commissions/:id/approve` | Approve commission |
| POST | `/api/affiliate/admin/commissions/:id/cancel` | Cancel commission |
| POST | `/api/affiliate/admin/affiliates/:id/update-tier` | Update tier |
| POST | `/api/affiliate/admin/materials` | Create marketing material |
| GET | `/api/affiliate/admin/analytics` | Get program analytics |

## 🎨 Frontend Components

### 1. Affiliate Program Page

**File:** `/client/src/pages/AffiliateProgramPage.jsx`

**Purpose:** Public landing page promoting the affiliate program

**Sections:**
- Hero with commission highlight
- How It Works (4 steps)
- Commission tiers comparison
- Marketing materials preview
- FAQ section
- Final CTA

**URL:** `/affiliate-program`

### 2. Affiliate Dashboard

**File:** `/client/src/pages/Dashboard/AffiliateDashboard.jsx`

**Purpose:** Main dashboard for affiliates

**Features:**
- Stats cards (total earnings, pending, active referrals, this month)
- Tier badge and quick stats
- Referral link with copy button
- Social share buttons
- Tabs: Overview, Referrals, Commissions, Payouts
- Payout request modal

**URL:** `/dashboard/affiliate`

### 3. Marketing Materials Library

**File:** `/client/src/pages/Dashboard/MarketingMaterialsPage.jsx`

**Purpose:** Browse and download promotional assets

**Features:**
- Search and filters (type, category)
- Material cards with previews
- Download tracking
- Copy content to clipboard
- Usage tips (do's and don'ts)

**URL:** `/dashboard/affiliate/materials`

### 4. Admin Panel

**File:** `/client/src/pages/Admin/AffiliateAdminPanel.jsx`

**Purpose:** Admin interface for managing affiliates

**Features:**
- Analytics overview
- Affiliate list with stats
- Pending payouts queue
- Process payout with transaction ID
- View affiliate details

**URL:** `/admin/affiliate`

### 5. Reusable Components

**File:** `/client/src/components/Affiliate/index.js`

**Components:**
- `ReferralLinkWidget` - Compact referral link display
- `EarningsSummary` - Earnings breakdown widget

## 🔍 Tracking Implementation

### Cookie-Based Tracking

When user clicks referral link:

1. Extract referral code from URL (`?ref=CODE`, `?affiliate=CODE`, or `/r/CODE`)
2. Validate code is active
3. Set cookie: `supernova_referral=CODE` (expires in 30 days)
4. Track click in database (IP, user agent, UTM params, etc.)
5. Redirect to homepage/signup

### URL Patterns

- Query parameter: `https://thedaitaniverse.com?ref=DEBS123`
- Alternative: `https://thedaitaniverse.com?affiliate=DEBS123`
- Short URL: `https://thedaitaniverse.com/r/DEBS123`

### Signup Attribution

When user signs up:

1. Check for referral code in cookie
2. If found, create `Referral` record (status: SIGNED_UP)
3. Link user to affiliate
4. Update affiliate signup count
5. Send "New Referral" email to affiliate
6. Clear cookie (attribution complete)

### Subscription Attribution

When referred user subscribes:

1. Find referral record for user
2. Create commission record (status: PENDING)
3. Update referral status to SUBSCRIBED
4. Update affiliate totals (totalEarnings, pendingEarnings, totalConversions)
5. Send "Commission Earned" email to affiliate

### Conversion Tracking

```javascript
// In subscription webhook or payment handler
const referralCode = user.referralCode;
if (referralCode) {
  const referral = await prisma.referral.findFirst({
    where: { referredUserId: user.id }
  });

  if (referral) {
    await recordCommission(referral.id, subscriptionAmount, {
      orderId: order.id,
      subscriptionId: subscription.id,
      invoiceId: invoice.id,
      description: `Commission from SUPERNova-LTE subscription`
    }, prisma);
  }
}
```

## 📧 Email Notifications

**File:** `/server/src/config/affiliateEmailTemplates.js`

### Email Templates

1. **Welcome Email** - When joining program
   - Shows affiliate code and referral link
   - Explains commission tiers
   - Next steps and how-to guide

2. **New Referral** - When someone signs up
   - Notifies affiliate of signup
   - Shows potential earnings
   - Encourages continued promotion

3. **Commission Earned** - When referral subscribes
   - Shows commission amount
   - Explains 30-day hold period
   - Links to earnings dashboard

4. **Commission Approved** - After 30 days
   - Confirms commission is ready for payout
   - Shows available balance
   - CTA to request payout

5. **Payout Requested** - When payout requested
   - Confirms request received
   - Shows processing timeline (3-5 days)
   - Displays payout details

6. **Payout Completed** - When payment sent
   - Confirms payment processed
   - Shows transaction ID
   - Thanks for participation

7. **Tier Upgrade** - When tier changes
   - Celebrates achievement
   - Shows new commission rate
   - Motivates to reach next tier

### Usage

```javascript
const { getWelcomeEmail } = require('./config/affiliateEmailTemplates');
const emailContent = getWelcomeEmail(affiliateProfile);

// Send via your email service
await sendEmail({
  to: affiliate.user.email,
  subject: emailContent.subject,
  html: emailContent.html,
  text: emailContent.text
});
```

## 📖 Integration Guide

### Step 1: Add Prisma Schema

Add models from `/schema/affiliate-program.prisma` to your main `schema.prisma`:

```prisma
// In your User model, add:
model User {
  // ... existing fields

  // Affiliate relations
  affiliateProfile AffiliateProfile? @relation("UserAffiliateProfile")
  referredBy       Referral?          @relation("ReferredUser")

  // Referral tracking
  referralCode     String? // Code used during signup
}
```

Run migration:
```bash
npx prisma migrate dev --name add_affiliate_program
npx prisma generate
```

### Step 2: Set Up Routes

In your Express app:

```javascript
const affiliateRoutes = require('./routes/affiliate');
const { trackReferrals, handleShortUrl } = require('./middleware/affiliateTracking');

// Attach Prisma to requests
app.use((req, res, next) => {
  req.prisma = prisma;
  next();
});

// Add tracking middleware (before other routes)
app.use(trackReferrals(prisma));

// Short URL handler
app.get('/r/:code', handleShortUrl(prisma));

// Affiliate API routes
app.use('/api/affiliate', affiliateRoutes);
```

### Step 3: Track Signups

In your signup/registration handler:

```javascript
const { recordSignup } = require('./services/affiliateService');
const { getReferralCode, clearReferralCookie } = require('./middleware/affiliateTracking');

// In signup route
router.post('/signup', async (req, res) => {
  // Create user
  const user = await prisma.user.create({ data: ... });

  // Check for referral
  const referralCode = getReferralCode(req);
  if (referralCode) {
    await recordSignup(user.id, referralCode, prisma);
    clearReferralCookie(res);
  }

  res.json(user);
});
```

### Step 4: Track Subscriptions

In your subscription webhook/payment handler:

```javascript
const { recordCommission } = require('./services/affiliateService');

// When subscription is created
async function handleSubscription(subscription) {
  // Find user
  const user = await prisma.user.findUnique({
    where: { id: subscription.userId }
  });

  // Check if user was referred
  if (user.referralCode) {
    const referral = await prisma.referral.findFirst({
      where: { referredUserId: user.id }
    });

    if (referral) {
      await recordCommission(referral.id, subscription.amount, {
        subscriptionId: subscription.id,
        orderId: subscription.orderId,
        description: `Commission from ${subscription.planName}`
      }, prisma);
    }
  }
}
```

### Step 5: Schedule Commission Approvals

Create a cron job to approve commissions after 30 days:

```javascript
const cron = require('node-cron');
const { approveCommission } = require('./services/affiliateService');

// Run daily at midnight
cron.schedule('0 0 * * *', async () => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const pendingCommissions = await prisma.commission.findMany({
    where: {
      status: 'PENDING',
      createdAt: {
        lte: thirtyDaysAgo
      }
    }
  });

  for (const commission of pendingCommissions) {
    await approveCommission(commission.id, prisma);
  }
});
```

### Step 6: Add Frontend Routes

In your React app:

```jsx
import AffiliateProgramPage from './pages/AffiliateProgramPage';
import AffiliateDashboard from './pages/Dashboard/AffiliateDashboard';
import MarketingMaterialsPage from './pages/Dashboard/MarketingMaterialsPage';
import AffiliateAdminPanel from './pages/Admin/AffiliateAdminPanel';

// Routes
<Route path="/affiliate-program" component={AffiliateProgramPage} />
<Route path="/dashboard/affiliate" component={AffiliateDashboard} />
<Route path="/dashboard/affiliate/materials" component={MarketingMaterialsPage} />
<Route path="/admin/affiliate" component={AffiliateAdminPanel} />
```

## 🧪 Testing

### Manual Testing Checklist

**Tracking:**
- [ ] Referral link sets cookie correctly
- [ ] Cookie persists for 30 days
- [ ] Click is recorded in database
- [ ] Signup is attributed to affiliate
- [ ] Conversion updates referral status

**Commissions:**
- [ ] Commission created when referral subscribes
- [ ] Correct amount calculated (20-30%)
- [ ] Commission status is PENDING
- [ ] Commission approved after 30 days
- [ ] Affiliate totals update correctly

**Payouts:**
- [ ] Can request payout with £50+ balance
- [ ] Payout request blocks insufficient balance
- [ ] Commissions marked as PAID
- [ ] Admin can process payout
- [ ] Payout completion updates totals

**Tiers:**
- [ ] New affiliate starts at Bronze (20%)
- [ ] Tier upgrades at 11 referrals (Silver 25%)
- [ ] Tier upgrades at 51 referrals (Gold 30%)
- [ ] Commission rate updates with tier

**Emails:**
- [ ] Welcome email sent on join
- [ ] New referral email sent on signup
- [ ] Commission earned email sent
- [ ] Commission approved email sent
- [ ] Payout emails sent

### API Testing

```bash
# Join affiliate program
curl -X POST http://localhost:3000/api/affiliate/join \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "paymentMethod": "paypal",
    "paymentEmail": "affiliate@example.com"
  }'

# Get my profile
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:3000/api/affiliate/my-profile

# Get stats
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:3000/api/affiliate/my-stats

# Request payout
curl -X POST http://localhost:3000/api/affiliate/request-payout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{ "amount": 50 }'

# Validate referral code
curl http://localhost:3000/api/affiliate/validate/DEBS123
```

## 🚀 Next Steps

After implementing Phase 2AR:

1. **Marketing Materials Library**
   - Upload banner ads (multiple sizes)
   - Create email templates
   - Design social media graphics
   - Write blog post templates

2. **Analytics Dashboard**
   - Track top affiliates
   - Monitor conversion rates
   - Measure program ROI
   - Identify fraud/abuse

3. **Advanced Features**
   - Multi-level commissions (2-tier)
   - Bonus challenges/contests
   - Custom commission rates
   - Lifetime commissions option

4. **Automation**
   - Auto-tier upgrades
   - Scheduled payouts
   - Fraud detection
   - Performance alerts

5. **Integrations**
   - Impact.com integration
   - ShareASale integration
   - CJ Affiliate integration
   - Stripe Connect for payouts

## 📊 Metrics to Track

- **Total Affiliates:** Active vs inactive
- **Conversion Rate:** Clicks → Signups → Subscriptions
- **Average Earnings Per Affiliate (EPA):** Total commissions / active affiliates
- **Payout Rate:** % of affiliates requesting payouts
- **Referral Lifetime Value (LTV):** Average subscription duration
- **Top Performers:** Leaderboard by earnings
- **Marketing Material Usage:** Which assets drive results
- **Commission Cancellation Rate:** Refund/cancellation impact

## 🎓 Best Practices

1. **Communicate clearly** - Set expectations on commission holds and payout timelines
2. **Provide resources** - Make marketing materials easily accessible
3. **Respond quickly** - Answer affiliate questions within 24 hours
4. **Pay on time** - Process payouts reliably and consistently
5. **Celebrate success** - Publicly recognize top performers
6. **Monitor fraud** - Watch for click fraud, cookie stuffing, trademark bidding
7. **Test everything** - Verify tracking works before launch
8. **Automate notifications** - Keep affiliates informed of all events

## 🐛 Troubleshooting

**Cookie not setting:**
- Check HTTPS in production
- Verify SameSite and domain settings
- Test in incognito mode

**Signup not attributed:**
- Confirm cookie exists before signup
- Check recordSignup() is called
- Verify referralCode saved to user

**Commission not created:**
- Ensure referral record exists
- Check subscription webhook firing
- Verify recordCommission() called

**Payout request fails:**
- Confirm minimum £50 balance
- Check approved commissions exist
- Verify payment info provided

**Tier not upgrading:**
- Run updateAffiliateTier() manually
- Check referral count is correct
- Verify tier thresholds (11, 51)

---

**Phase 2AR Status:** ✅ Complete

**Built with:** Prisma, Express, React

**Dependencies:** @prisma/client, cookie-parser, express

**Integration Required:** Email service (SendGrid, Mailgun, etc.)
