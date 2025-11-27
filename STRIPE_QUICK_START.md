# Stripe Payment Infrastructure - Quick Start Guide

## 5-Minute Setup

### 1. Environment Variables
Add to `.env`:
```env
STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

### 2. Database Schema
Already applied! Schema includes:
- StripeCustomer, Product, Price
- Subscription, Payment, Invoice, PaymentMethod

### 3. Start Webhook Listener (Development)
```bash
stripe listen --forward-to localhost:3001/api/stripe/webhook
```

### 4. Create Your First Product
Navigate to `/admin/billing/products` and create a product with pricing.

### 5. Test Subscription Flow
1. Go to `/billing/plans`
2. Click "Subscribe Now"
3. Use test card: `4242 4242 4242 4242`
4. Any future date for expiry
5. Any 3-digit CVC

## Quick Reference

### Test Cards
| Card Number | Description |
|-------------|-------------|
| 4242 4242 4242 4242 | Successful payment |
| 4000 0000 0000 0341 | Card declined |
| 4000 0025 0000 3155 | Requires authentication |
| 4000 0000 0000 9995 | Payment fails |

### API Endpoints Quick List

**Public:**
- `GET /api/stripe/config` - Get publishable key
- `POST /api/stripe/checkout` - Create checkout session
- `GET /api/stripe/products` - List products

**Authenticated:**
- `GET /api/stripe/customers` - Get/create customer
- `GET /api/stripe/subscriptions` - User's subscriptions
- `POST /api/stripe/portal` - Customer portal
- `GET /api/stripe/invoices` - User's invoices
- `GET /api/stripe/payment-methods` - Payment methods

**Admin:**
- `POST /api/stripe/products` - Create product
- `POST /api/stripe/prices` - Create price
- `GET /api/stripe/analytics` - Revenue analytics

### User Pages
- `/billing` - Subscription overview
- `/billing/plans` - Browse plans
- `/billing/invoices` - Invoice history
- `/billing/payment-methods` - Manage payment methods

### Admin Pages
- `/admin/billing/products` - Manage products
- `/admin/billing/revenue` - Revenue dashboard

## Common Workflows

### Create Subscription via Checkout
```typescript
const response = await fetch('/api/stripe/checkout', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ priceId: 'price_...' })
});
const { url } = await response.json();
window.location.href = url;
```

### Cancel Subscription
```typescript
await fetch(`/api/stripe/subscriptions/${subscriptionId}/cancel`, {
  method: 'POST'
});
```

### Open Customer Portal
```typescript
const response = await fetch('/api/stripe/portal', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ returnUrl: window.location.href })
});
const { url } = await response.json();
window.location.href = url;
```

## Webhook Events

Key events handled automatically:
- `checkout.session.completed` - Post-checkout processing
- `customer.subscription.updated` - Sync subscription changes
- `invoice.paid` - Record successful payment
- `invoice.payment_failed` - Handle failed payment

## Troubleshooting Quick Fixes

### "No publishable key"
→ Add `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` to .env

### "Webhook signature verification failed"
→ Copy webhook secret from `stripe listen` output

### "Customer not found"
→ Call `GET /api/stripe/customers` to create customer

### "Product not found"
→ Create product in admin panel or Stripe Dashboard

## Next Steps

1. Review full documentation: [STRIPE_README.md](./STRIPE_README.md)
2. Run test scenarios: [STRIPE_TESTING.md](./STRIPE_TESTING.md)
3. Configure production webhooks in Stripe Dashboard
4. Set up production environment variables
5. Enable Stripe billing portal in Dashboard settings

## Helper Functions

### Format Amount
```typescript
import { formatAmount } from '@/lib/stripe';
formatAmount(2600, 'gbp'); // "£26.00"
```

### Get or Create Customer
```typescript
import { getOrCreateStripeCustomer } from '@/lib/stripe';
const customerId = await getOrCreateStripeCustomer(userId, email, name);
```

### Calculate MRR
```typescript
import { calculateMRR } from '@/lib/stripe';
const mrr = calculateMRR(subscriptions);
```

## Production Checklist

- [ ] Update environment variables with live keys
- [ ] Configure production webhook endpoint
- [ ] Test live webhook delivery
- [ ] Enable Stripe billing portal
- [ ] Configure tax settings (if applicable)
- [ ] Set up email notifications
- [ ] Test full payment flow with real card
- [ ] Monitor Stripe Dashboard for errors
- [ ] Set up Stripe radar for fraud prevention
- [ ] Configure subscription lifecycle emails

## Support & Resources

- **Documentation**: See STRIPE_README.md
- **Testing**: See STRIPE_TESTING.md
- **Stripe Docs**: https://stripe.com/docs
- **Stripe Dashboard**: https://dashboard.stripe.com
