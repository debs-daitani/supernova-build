# Stripe Payment Infrastructure - Complete Guide

## Overview

This is a comprehensive, production-ready Stripe payment infrastructure built for the dAItaniverse SUPERNova app. It includes subscription management, one-time payments, customer portal integration, invoice tracking, payment methods, and revenue analytics.

## Table of Contents

1. [Architecture](#architecture)
2. [Database Schema](#database-schema)
3. [API Routes](#api-routes)
4. [Frontend Pages](#frontend-pages)
5. [Webhook Integration](#webhook-integration)
6. [Environment Variables](#environment-variables)
7. [Setup Instructions](#setup-instructions)
8. [Testing](#testing)
9. [Security Considerations](#security-considerations)
10. [Troubleshooting](#troubleshooting)

## Architecture

### Tech Stack
- **Backend**: Next.js 16 API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Payment Processing**: Stripe API v2024-11-20
- **Authentication**: JWT-based authentication
- **Frontend**: React 19 with TypeScript

### Key Features
- Subscription management (create, update, cancel, reactivate)
- Multiple pricing tiers (monthly, yearly, one-time)
- Customer portal for self-service management
- Invoice generation and tracking
- Payment method management
- Revenue analytics and MRR tracking
- Webhook handling for real-time updates
- Admin dashboard for product and revenue management

## Database Schema

### Models

#### StripeCustomer
Links users to Stripe customers.
```prisma
model StripeCustomer {
  userId            String   @unique
  stripeCustomerId  String   @unique
  email             String
  name              String?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}
```

#### Product
Product catalog for subscription plans.
```prisma
model Product {
  id              String   @id @default(cuid())
  stripeProductId String?  @unique
  name            String
  description     String?
  active          Boolean  @default(true)
  features        String[]
  metadata        Json?
  prices          Price[]
}
```

#### Price
Pricing tiers for products.
```prisma
model Price {
  id              String        @id @default(cuid())
  productId       String
  stripePriceId   String?       @unique
  amount          Int           // Amount in cents
  currency        String        @default("gbp")
  interval        PriceInterval @default(MONTH)
  intervalCount   Int           @default(1)
  active          Boolean       @default(true)
  trialPeriodDays Int?
}
```

#### Subscription
User subscriptions.
```prisma
model Subscription {
  id                    String                    @id @default(cuid())
  userId                String
  stripeCustomerId      String
  stripeSubscriptionId  String                    @unique
  stripePriceId         String
  stripeProductId       String?
  status                StripeSubscriptionStatus
  currentPeriodStart    DateTime
  currentPeriodEnd      DateTime
  cancelAtPeriodEnd     Boolean                   @default(false)
  canceledAt            DateTime?
  trialStart            DateTime?
  trialEnd              DateTime?
}
```

#### Payment
Payment history.
```prisma
model Payment {
  id                    String        @id @default(cuid())
  userId                String
  stripePaymentIntentId String        @unique
  amount                Int
  currency              String        @default("gbp")
  status                PaymentStatus
  description           String?
  receiptUrl            String?
}
```

#### Invoice
Invoice tracking.
```prisma
model Invoice {
  id                String        @id @default(cuid())
  userId            String
  stripeInvoiceId   String        @unique
  amountDue         Int
  amountPaid        Int
  status            InvoiceStatus
  hostedInvoiceUrl  String?
  invoicePdf        String?
  dueDate           DateTime?
  paidAt            DateTime?
}
```

#### PaymentMethod
Saved payment methods.
```prisma
model PaymentMethod {
  id                    String            @id @default(cuid())
  userId                String
  stripePaymentMethodId String            @unique
  stripeCustomerId      String
  type                  PaymentMethodType
  last4                 String?
  brand                 String?
  expiryMonth           Int?
  expiryYear            Int?
  isDefault             Boolean           @default(false)
}
```

## API Routes

### Configuration
- **GET /api/stripe/config** - Returns Stripe publishable key

### Customer Management
- **GET /api/stripe/customers** - Get or create Stripe customer
- **POST /api/stripe/customers** - Create Stripe customer

### Product Management
- **GET /api/stripe/products** - List all active products with prices
- **POST /api/stripe/products** - Create product (admin only)
- **GET /api/stripe/products/[id]** - Get product details
- **PATCH /api/stripe/products/[id]** - Update product (admin only)
- **DELETE /api/stripe/products/[id]** - Deactivate product (admin only)

### Price Management
- **GET /api/stripe/prices** - List all active prices
- **POST /api/stripe/prices** - Create price (admin only)

### Checkout
- **POST /api/stripe/checkout** - Create checkout session
- **GET /api/stripe/checkout/success** - Handle successful checkout

### Subscription Management
- **GET /api/stripe/subscriptions** - List user's subscriptions
- **POST /api/stripe/subscriptions** - Create subscription directly
- **GET /api/stripe/subscriptions/[id]** - Get subscription details
- **PATCH /api/stripe/subscriptions/[id]** - Update subscription
- **DELETE /api/stripe/subscriptions/[id]** - Cancel subscription immediately
- **POST /api/stripe/subscriptions/[id]/cancel** - Cancel at period end
- **DELETE /api/stripe/subscriptions/[id]/cancel** - Reactivate subscription

### Customer Portal
- **POST /api/stripe/portal** - Create customer portal session

### Invoice Management
- **GET /api/stripe/invoices** - List user's invoices
- **GET /api/stripe/invoices/[id]** - Get invoice details

### Payment Methods
- **GET /api/stripe/payment-methods** - List payment methods
- **POST /api/stripe/payment-methods** - Attach payment method
- **PATCH /api/stripe/payment-methods/[id]** - Set as default
- **DELETE /api/stripe/payment-methods/[id]** - Remove payment method

### Analytics
- **GET /api/stripe/analytics** - Revenue analytics (admin only)

### Webhooks
- **POST /api/stripe/webhook** - Handle Stripe webhooks

## Frontend Pages

### User Pages
- **/billing** - Subscription overview
- **/billing/plans** - Pricing table and plan selection
- **/billing/checkout/success** - Post-checkout success page
- **/billing/invoices** - Invoice history
- **/billing/invoices/[id]** - Invoice details
- **/billing/payment-methods** - Payment method management

### Admin Pages
- **/admin/billing/products** - Product and price management
- **/admin/billing/revenue** - Revenue dashboard and analytics

## Webhook Integration

### Webhook Events Handled

1. **checkout.session.completed** - Checkout completed
2. **customer.subscription.created** - New subscription created
3. **customer.subscription.updated** - Subscription updated
4. **customer.subscription.deleted** - Subscription deleted
5. **invoice.paid** - Invoice paid successfully
6. **invoice.payment_failed** - Invoice payment failed
7. **payment_intent.succeeded** - Payment succeeded
8. **payment_intent.payment_failed** - Payment failed
9. **customer.subscription.trial_will_end** - Trial ending soon

### Webhook Signature Verification

All webhooks verify the signature using:
```typescript
import { stripe } from '@/lib/stripe';

const event = stripe.webhooks.constructEvent(
  body,
  signature,
  webhookSecret
);
```

## Environment Variables

Required environment variables in `.env`:

```env
# Stripe Keys
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3001

# Database
DATABASE_URL=postgresql://...

# JWT Secret
JWT_SECRET=your_jwt_secret_here
```

## Setup Instructions

### 1. Install Dependencies

Stripe libraries are already installed in the project:
- `stripe` (v20.0.0)
- `@stripe/stripe-js` (v8.5.2)
- `@stripe/react-stripe-js` (v5.4.0)

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your Stripe keys:
```bash
cp .env.example .env
```

### 3. Apply Database Migrations

```bash
npx prisma db push
npx prisma generate
```

### 4. Configure Stripe Webhook

#### For Local Development:
```bash
stripe listen --forward-to localhost:3001/api/stripe/webhook
```

This will output a webhook secret (whsec_...). Add it to your `.env` file.

#### For Production:
1. Go to Stripe Dashboard > Developers > Webhooks
2. Add endpoint: `https://yourdomain.com/api/stripe/webhook`
3. Select events to listen for (see webhook events above)
4. Copy the signing secret and add to production environment variables

### 5. Create Products and Prices

Use the admin panel at `/admin/billing/products` or use Stripe Dashboard to create products and prices.

### 6. Test the Integration

See STRIPE_TESTING.md for comprehensive testing instructions.

## Security Considerations

### Authentication
- All API routes verify JWT authentication
- Admin routes check for ADMIN role
- User-specific resources verify userId ownership

### Webhook Security
- Webhook signature verification is REQUIRED
- Prevents replay attacks
- Validates event source

### Payment Security
- No card details stored in database
- PCI compliance handled by Stripe
- Stripe Elements for secure card input
- Customer portal for self-service (no admin access to payment details)

### API Security
- Rate limiting recommended (implement with middleware)
- CORS configuration
- Input validation
- SQL injection prevention via Prisma

## Troubleshooting

### Common Issues

#### 1. Webhook Signature Verification Failed
**Cause**: Webhook secret mismatch or body parsing issue
**Solution**:
- Verify STRIPE_WEBHOOK_SECRET in .env
- Ensure raw body is used (Next.js handles this automatically)
- Check Stripe CLI output for correct secret

#### 2. Customer Not Found
**Cause**: Customer not created in Stripe
**Solution**: Use `getOrCreateStripeCustomer()` helper function

#### 3. Subscription Not Syncing
**Cause**: Webhook not delivered or processed
**Solution**:
- Check webhook logs in Stripe Dashboard
- Verify webhook endpoint is accessible
- Check server logs for errors

#### 4. Payment Method Not Attaching
**Cause**: Customer ID mismatch
**Solution**:
- Verify stripeCustomerId is correct
- Check Stripe Dashboard for customer

#### 5. MRR Calculation Incorrect
**Cause**: Interval conversion issue
**Solution**: Review `calculateMRR()` function in lib/stripe.ts

## Additional Resources

- [Stripe API Documentation](https://stripe.com/docs/api)
- [Stripe Webhook Documentation](https://stripe.com/docs/webhooks)
- [Stripe Testing Guide](https://stripe.com/docs/testing)
- [STRIPE_QUICK_START.md](./STRIPE_QUICK_START.md) - Quick reference guide
- [STRIPE_TESTING.md](./STRIPE_TESTING.md) - Comprehensive testing guide

## Support

For issues or questions:
1. Check this documentation
2. Review Stripe Dashboard logs
3. Check server error logs
4. Review webhook delivery logs
5. Test with Stripe CLI

## License

This Stripe integration is part of the SUPERNova AI application.
