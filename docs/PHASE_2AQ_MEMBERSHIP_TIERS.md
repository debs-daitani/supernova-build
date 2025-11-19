# Phase 2AQ: Membership Tiers System

Complete implementation of the membership tiers, usage limits, and feature gating system for The dAItaniverse platform.

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Database Schema](#database-schema)
- [Membership Tiers](#membership-tiers)
- [Backend Services](#backend-services)
- [API Endpoints](#api-endpoints)
- [Frontend Components](#frontend-components)
- [Integration Guide](#integration-guide)
- [Testing](#testing)

## 🎯 Overview

Phase 2AQ provides a complete membership and billing system that:

- **Manages multiple tiers** (Free, SUPERNova-LTE, Enterprise)
- **Gates features** based on membership level
- **Enforces usage limits** (pages, products, storage, etc.)
- **Tracks usage** automatically per billing period
- **Supports add-ons** for extra capacity
- **Enables upgrades/downgrades** seamlessly
- **Provides trial periods** for paid tiers

Think of it as: **Stripe Billing + Memberstack + Kajabi Memberships** - all in one.

## 🏗️ Architecture

### Tier System

```
┌─────────────────┐
│   Free Tier     │  - Limited features
│   £0/month      │  - 5 pages, 100 contacts
└─────────────────┘

┌─────────────────┐
│ SUPERNova-LTE   │  - Full platform access
│   £26/month     │  - Unlimited most things
└─────────────────┘  - 14-day trial

┌─────────────────┐
│  Enterprise     │  - Custom pricing
│   Custom        │  - Unlimited everything
└─────────────────┘  - White label, SLA
```

### Feature Gating Flow

```
User Action → Check Feature Access → Allow/Deny
                     ↓
              Check Usage Limit → Allow/Deny
                     ↓
              Increment Usage → Track
```

### Components

1. **Database Layer** - Prisma models for tiers, features, usage
2. **Service Layer** - Business logic for access control
3. **Middleware Layer** - Route protection
4. **API Layer** - REST endpoints
5. **Frontend Layer** - UI components

## 🗄️ Database Schema

### Models

**MembershipTier** - Defines subscription tiers
```prisma
- name, slug, description
- priceMonthly, priceYearly
- features (JSON array)
- limits (JSON object)
- trialDays, isActive, isPublic
```

**Feature** - Granular feature flags
```prisma
- key (unique identifier)
- name, description, category
- availableInTiers (array of tier slugs)
```

**UsageRecord** - Tracks usage per metric
```prisma
- userId, metric, value
- periodStart, periodEnd
```

**AddOn** - Extra capacity for purchase
```prisma
- name, slug, priceMonthly
- feature (optional)
- extraLimit (JSON object)
```

**AddOnPurchase** - User's purchased add-ons
```prisma
- userId, addOnId
- status (ACTIVE, CANCELLED, EXPIRED)
- purchasedAt, expiresAt, cancelledAt
```

### Relationships

```
User ─┬─ MembershipTier
      ├─ UsageRecords[]
      └─ AddOnPurchases[]

Subscription ─── MembershipTier (at purchase)

AddOn ─── AddOnPurchases[]
```

## 💎 Membership Tiers

### Free Tier (£0/month)

**Purpose:** Let users try the platform

**Limits:**
- 1 website
- 5 pages
- 10 blog posts
- 0 products (no ecommerce)
- 100 contacts
- 0.5GB storage
- 5 SUPERNova AI messages/day

**Features:**
- ✅ Website builder
- ✅ Blog
- ✅ CRM (basic)
- ✅ Community support
- ❌ Ecommerce
- ❌ Courses
- ❌ Email marketing

### SUPERNova-LTE (£26/month)

**Purpose:** Full platform for entrepreneurs

**Pricing:**
- £26/month
- £260/year (save 17%)
- 14-day free trial

**Limits:**
- Unlimited websites
- Unlimited pages
- Unlimited blog posts
- Unlimited products
- Unlimited courses
- 10,000 contacts
- 10,000 emails/month
- 50GB storage
- 1,000 video minutes
- 5 team members
- 5 custom domains

**Features:**
- ✅ Everything in Free
- ✅ Full ecommerce suite
- ✅ Course platform
- ✅ Email marketing
- ✅ Custom domains
- ✅ Advanced analytics
- ✅ Priority support
- ✅ Unlimited SUPERNova AI

### Enterprise (Custom pricing)

**Purpose:** Agencies, high-volume businesses

**Pricing:** Custom (contact sales)

**Limits:**
- Unlimited everything
- 500GB storage (default)
- Negotiable higher limits

**Features:**
- ✅ Everything in SUPERNova-LTE
- ✅ White label options
- ✅ Dedicated account manager
- ✅ Custom integrations
- ✅ Advanced API access
- ✅ SLA guarantee
- ✅ Onboarding & training

## ⚙️ Backend Services

### Membership Service

**File:** `/server/src/services/membershipService.js`

**Key Functions:**

```javascript
// Check if user has access to a feature
await hasFeatureAccess(userId, 'ecommerce', prisma)
// Returns: true/false

// Check usage limit
await checkUsageLimit(userId, 'pages', prisma)
// Returns: { allowed, current, limit, remaining, percentUsed }

// Increment usage
await incrementUsage(userId, 'pages', 1, prisma)

// Get full usage summary
await getUserUsageSummary(userId, prisma)
// Returns: { tier, limits, addOns }

// Change tier
await changeMembershipTier(userId, 'supernova-lte', prisma)

// Get recommended upgrade
await getRecommendedUpgradeTier(userId, 'ecommerce', prisma)
```

### Feature Gate Middleware

**File:** `/server/src/middleware/featureGate.js`

**Middleware Functions:**

```javascript
// Require feature access
requireFeature('ecommerce')
// Returns 403 if user doesn't have feature

// Require usage limit check
requireLimit('pages')
// Returns 429 if limit reached

// Require minimum tier
requireTier('supernova-lte')
// Returns 403 if user on lower tier

// Optional feature check (doesn't block)
optionalFeature('analytics')
// Adds req.hasFeature.analytics = true/false
```

**Usage in routes:**

```javascript
// Protect ecommerce routes
router.post('/products',
  authenticate,
  requireFeature('ecommerce'),
  createProduct
);

// Check page limit
router.post('/pages',
  authenticate,
  requireLimit('pages'),
  async (req, res) => {
    // Create page
    const page = await createPage(req.body);

    // Increment usage
    await incrementUsage(req.user.id, 'pages', 1, req.prisma);

    res.json(page);
  }
);
```

## 🔌 API Endpoints

### Tier Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/membership/tiers` | Get all public tiers |
| GET | `/api/membership/tiers/:slug` | Get specific tier |
| GET | `/api/membership/my-tier` | Get current user's tier + usage |
| POST | `/api/membership/change-tier` | Upgrade/downgrade tier |

### Feature Access

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/membership/check-feature/:key` | Check feature access |
| GET | `/api/membership/check-limit/:metric` | Check usage limit |
| GET | `/api/membership/features` | Get all features |

### Add-ons

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/membership/addons` | Get available add-ons |
| POST | `/api/membership/addons/:id/purchase` | Purchase add-on |
| POST | `/api/membership/addons/:id/cancel` | Cancel add-on |

### Usage Tracking

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/membership/increment-usage` | Manually increment usage |

## 🎨 Frontend Components

### 1. Pricing Page

**File:** `/client/src/pages/Pricing.jsx`

**Purpose:** Public pricing page

**Features:**
- Shows all public tiers
- Monthly/yearly toggle
- Feature comparison
- FAQ section
- Responsive design

**Usage:**
```jsx
import Pricing from '@/pages/Pricing';

<Route path="/pricing" component={Pricing} />
```

### 2. UpgradeModal

**File:** `/client/src/components/Membership/UpgradeModal.jsx`

**Purpose:** Shown when user hits limit or tries locked feature

**Props:**
- `feature` - Feature user tried to access
- `currentTier` - User's current tier name
- `limitInfo` - Limit info if limit reached
- `onClose` - Close callback

**Usage:**
```jsx
import { UpgradeModal } from '@/components/Membership';

{showUpgrade && (
  <UpgradeModal
    feature="Ecommerce"
    currentTier="Free"
    onClose={() => setShowUpgrade(false)}
  />
)}
```

### 3. Usage Page

**File:** `/client/src/pages/Settings/UsagePage.jsx`

**Purpose:** Shows user's current usage vs limits

**Features:**
- Usage meters with color coding
- Progress bars
- Add-on list
- Upgrade CTA

**Usage:**
```jsx
import UsagePage from '@/pages/Settings/UsagePage';

<Route path="/settings/usage" component={UsagePage} />
```

## 📖 Integration Guide

### Step 1: Add Prisma Schema

Add the models from `/schema/membership-tiers.prisma` to your main `schema.prisma` file.

Update your User model:
```prisma
model User {
  // ... existing fields

  membershipTierId String?
  membershipTier   MembershipTier? @relation("UserMembershipTier", fields: [membershipTierId], references: [id])

  usageRecords     UsageRecord[] @relation("UserUsageRecords")
  addOnPurchases   AddOnPurchase[] @relation("UserAddOnPurchases")
}
```

Run migration:
```bash
npx prisma migrate dev --name add_membership_tiers
npx prisma generate
```

### Step 2: Seed Database

```javascript
const { PrismaClient } = require('@prisma/client');
const { seedTiers } = require('./server/src/scripts/seedTiers');

const prisma = new PrismaClient();

await seedTiers(prisma);
```

### Step 3: Add Routes

In your Express app:

```javascript
const membershipRoutes = require('./routes/membership');

app.use('/api/membership', membershipRoutes);
```

### Step 4: Attach Prisma to Requests

```javascript
// Middleware to attach prisma
app.use((req, res, next) => {
  req.prisma = prisma;
  next();
});

// Or set global
global.prisma = prisma;
```

### Step 5: Protect Routes with Feature Gates

```javascript
const { requireFeature, requireLimit } = require('./middleware/featureGate');

// Protect ecommerce routes
router.post('/products', authenticate, requireFeature('ecommerce'), createProduct);

// Check page limit
router.post('/pages', authenticate, requireLimit('pages'), async (req, res) => {
  // Create page
  const page = await createPage(req.body);

  // Increment usage
  await incrementUsage(req.user.id, 'pages', 1, req.prisma);

  res.json(page);
});
```

### Step 6: Add Frontend Components

```jsx
// In your main app
import { UpgradeModal } from '@/components/Membership';

// Show when API returns 403 FEATURE_LOCKED
const handleApiError = (error) => {
  if (error.code === 'FEATURE_LOCKED') {
    setShowUpgrade(true);
    setLockedFeature(error.feature);
  }
};
```

### Step 7: Handle Errors

```jsx
// Axios interceptor example
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 403) {
      const data = error.response.data;

      if (data.code === 'FEATURE_LOCKED') {
        // Show upgrade modal
        showUpgradeModal(data.feature);
      }
    }

    if (error.response?.status === 429) {
      const data = error.response.data;

      if (data.code === 'LIMIT_REACHED') {
        // Show limit reached modal
        showLimitModal(data.metric, data.limit);
      }
    }

    return Promise.reject(error);
  }
);
```

## 🧪 Testing

### Manual Testing Checklist

**Tier System:**
- [ ] Free tier user can create up to 5 pages
- [ ] Free tier user blocked from creating 6th page
- [ ] Free tier user cannot access ecommerce
- [ ] SUPERNova-LTE user has unlimited pages
- [ ] Enterprise features work correctly

**Feature Gating:**
- [ ] Ecommerce routes blocked for Free tier
- [ ] Email marketing blocked for Free tier
- [ ] Analytics blocked for Free tier
- [ ] All features available for SUPERNova-LTE

**Usage Tracking:**
- [ ] Creating page increments usage counter
- [ ] Usage resets monthly
- [ ] Add-ons increase limits correctly
- [ ] Usage display shows accurate numbers

**Upgrades:**
- [ ] Upgrade modal shows when limit hit
- [ ] Recommended tier shown correctly
- [ ] Upgrade flow completes successfully
- [ ] Features unlock immediately after upgrade

**Add-ons:**
- [ ] Add-on purchase works
- [ ] Extra limits applied correctly
- [ ] Add-on cancellation works
- [ ] Cancelled add-on limits removed

### API Testing

```bash
# Get all tiers
curl http://localhost:3000/api/membership/tiers

# Check feature access
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:3000/api/membership/check-feature/ecommerce

# Check usage limit
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:3000/api/membership/check-limit/pages

# Get my tier
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:3000/api/membership/my-tier
```

## 🚀 Next Steps

After implementing Phase 2AQ:

1. **Stripe Integration**
   - Connect Stripe for payment processing
   - Create Stripe Products/Prices
   - Handle webhooks for subscription events
   - Implement prorated upgrades/downgrades

2. **Trial Management**
   - Track trial start/end dates
   - Send trial expiration emails
   - Auto-downgrade after trial ends

3. **Analytics**
   - Track tier conversion rates
   - Monitor upgrade patterns
   - Measure feature adoption by tier

4. **Notifications**
   - Email when approaching limits
   - Notify on limit reached
   - Celebrate upgrades

5. **Admin Dashboard**
   - Manage tiers (pricing, limits)
   - View usage analytics
   - Override user limits

## 📊 Metrics to Track

- **Conversion Rate:** Free → Paid
- **Upgrade Rate:** Paid tier changes
- **Add-on Attach Rate:** % of users with add-ons
- **Churn Rate:** Cancellations per tier
- **MRR by Tier:** Monthly recurring revenue
- **Limit Hit Rate:** % hitting limits
- **Feature Adoption:** Which features drive upgrades

## 🎓 Best Practices

1. **Always check limits before creating resources**
2. **Increment usage immediately after creation**
3. **Decrement usage when deleting resources**
4. **Show usage warnings at 80% capacity**
5. **Make upgrade path obvious and easy**
6. **Offer add-ons as alternative to upgrading**
7. **Grandfather existing users when changing limits**
8. **Test limit enforcement thoroughly**

## 🐛 Troubleshooting

**User can't access feature they should have:**
- Check user's membershipTier is set correctly
- Verify feature exists in Feature table
- Confirm tier slug in feature.availableInTiers
- Check feature.isActive is true

**Usage not incrementing:**
- Verify incrementUsage() is called after creation
- Check periodStart matches current month
- Ensure prisma client is passed correctly

**Limits not enforced:**
- Confirm requireLimit middleware is used
- Check limit value in tier.limits JSON
- Verify middleware order (auth before limit check)

**Upgrade modal not showing:**
- Check 403/429 error handling in frontend
- Verify error response includes code field
- Ensure UpgradeModal component is rendered

## 📝 Configuration

### Changing Limits

Edit `/server/src/config/membershipTiers.js`:

```javascript
limits: {
  pages: 10,  // Change from 5 to 10
  // ... other limits
}
```

Then re-seed:
```bash
node server/src/scripts/seedTiers.js
```

### Adding New Features

1. Add to DEFAULT_FEATURES in config
2. Add to tier features arrays
3. Reseed database
4. Use requireFeature() in routes

### Changing Pricing

1. Update priceMonthly/priceYearly in config
2. Update Stripe prices
3. Reseed tiers
4. Handle existing subscriptions

---

**Phase 2AQ Status:** ✅ Complete

**Built with:** Prisma, Express, React

**Dependencies:** @prisma/client, express

**Integration Required:** Stripe (for payment processing)
