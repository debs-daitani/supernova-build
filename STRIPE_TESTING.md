# Stripe Payment Infrastructure - Testing Guide

## Test Environment Setup

### Prerequisites
- Stripe CLI installed: `stripe login`
- Development server running: `npm run dev`
- Webhook listener active: `stripe listen --forward-to localhost:3001/api/stripe/webhook`

### Test Mode
All testing uses Stripe test mode. Test keys start with `sk_test_` and `pk_test_`.

## Test Cards

### Success Scenarios

| Card Number | CVC | Date | Description |
|-------------|-----|------|-------------|
| 4242 4242 4242 4242 | Any 3 digits | Any future date | Successful payment |
| 5555 5555 5555 4444 | Any 3 digits | Any future date | Mastercard success |
| 3782 822463 10005 | Any 4 digits | Any future date | American Express |

### Failure Scenarios

| Card Number | Result |
|-------------|--------|
| 4000 0000 0000 0002 | Card declined |
| 4000 0000 0000 9995 | Card declined - insufficient funds |
| 4000 0000 0000 0069 | Card expired |
| 4000 0000 0000 0127 | Card declined - incorrect CVC |

### Authentication Required

| Card Number | Description |
|-------------|-------------|
| 4000 0025 0000 3155 | Requires 3D Secure authentication |
| 4000 0027 6000 3184 | Authentication required but succeeds |

### Special Cases

| Card Number | Behavior |
|-------------|----------|
| 4000 0000 0000 0341 | Payment requires address |
| 4000 0000 0000 0019 | Payment always blocked as fraudulent |

## Test Scenarios

### 1. Successful Subscription Creation

**Steps:**
1. Navigate to `/billing/plans`
2. Select a plan and click "Subscribe Now"
3. Enter test card: `4242 4242 4242 4242`
4. Complete checkout
5. Verify redirect to success page
6. Check `/billing` shows active subscription
7. Verify webhook received `customer.subscription.created`
8. Check database for subscription record

**Expected Results:**
- Subscription status: ACTIVE or TRIALING
- Invoice created and marked as PAID
- Payment record created with status SUCCEEDED
- User has access to subscribed features

**API Checks:**
```bash
# Check subscription
curl http://localhost:3001/api/stripe/subscriptions \
  -H "Cookie: auth-token=YOUR_TOKEN"

# Check invoices
curl http://localhost:3001/api/stripe/invoices \
  -H "Cookie: auth-token=YOUR_TOKEN"
```

### 2. Failed Payment

**Steps:**
1. Navigate to `/billing/plans`
2. Select a plan
3. Enter failing card: `4000 0000 0000 0002`
4. Attempt checkout
5. Observe error message

**Expected Results:**
- Checkout fails with clear error message
- No subscription created
- No charges made
- User remains on checkout page

### 3. Subscription Cancellation

**Steps:**
1. Ensure user has active subscription
2. Navigate to `/billing`
3. Click "Cancel Subscription"
4. Confirm cancellation
5. Verify subscription marked for cancellation

**Expected Results:**
- Subscription `cancelAtPeriodEnd`: true
- Subscription remains ACTIVE until period end
- Cancel date recorded
- Webhook `customer.subscription.updated` received

**API Test:**
```bash
curl -X POST http://localhost:3001/api/stripe/subscriptions/SUB_ID/cancel \
  -H "Cookie: auth-token=YOUR_TOKEN"
```

### 4. Subscription Reactivation

**Steps:**
1. Cancel a subscription (previous test)
2. Click "Reactivate Subscription"
3. Confirm reactivation

**Expected Results:**
- `cancelAtPeriodEnd`: false
- Subscription will continue after current period
- Webhook received

**API Test:**
```bash
curl -X DELETE http://localhost:3001/api/stripe/subscriptions/SUB_ID/cancel \
  -H "Cookie: auth-token=YOUR_TOKEN"
```

### 5. Customer Portal Flow

**Steps:**
1. Navigate to `/billing`
2. Click "Manage via Stripe"
3. Verify redirect to Stripe portal
4. Update payment method in portal
5. Return to application
6. Verify changes reflected

**Expected Results:**
- Seamless redirect to portal
- Changes sync via webhooks
- Return URL works correctly

### 6. Invoice Generation

**Steps:**
1. Create subscription
2. Wait for invoice.paid webhook
3. Navigate to `/billing/invoices`
4. Verify invoice appears
5. Click invoice to view details
6. Download PDF

**Expected Results:**
- Invoice listed with correct amount
- Status: PAID
- PDF download link works
- Hosted invoice URL accessible

### 7. Payment Method Management

**Steps:**
1. Navigate to `/billing/payment-methods`
2. Click "Add Payment Method"
3. Add card via Stripe portal
4. Set as default
5. Add another card
6. Remove first card

**Expected Results:**
- Cards save successfully
- Default flag updates
- Card deletion works
- Only non-default cards can be removed if subscription exists

### 8. Upgrade/Downgrade Plan

**Steps:**
1. Have active subscription on basic plan
2. Navigate to `/billing/plans`
3. Select higher-tier plan
4. Complete upgrade
5. Check proration charge

**Expected Results:**
- Subscription updated to new price
- Proration invoice created
- New price applies immediately
- Webhook received

### 9. Trial Period

**Steps:**
1. Create price with trial period (e.g., 7 days)
2. Subscribe to plan
3. Verify trial status
4. Check trial end date

**Expected Results:**
- Subscription status: TRIALING
- Trial end date set correctly
- No charge until trial ends
- Webhook `customer.subscription.trial_will_end` fires 3 days before end

### 10. Failed Recurring Payment

**Steps:**
1. Create subscription with card that will fail on renewal
2. Use Stripe CLI to simulate renewal:
   ```bash
   stripe trigger invoice.payment_failed
   ```
3. Check subscription status
4. Verify user notification

**Expected Results:**
- Subscription status: PAST_DUE
- Invoice status: OPEN or UNCOLLECTIBLE
- Payment retry logic activated
- User receives notification (if implemented)

## Webhook Testing

### Test Individual Webhooks

Use Stripe CLI to trigger specific events:

```bash
# Subscription created
stripe trigger customer.subscription.created

# Subscription updated
stripe trigger customer.subscription.updated

# Invoice paid
stripe trigger invoice.paid

# Payment failed
stripe trigger invoice.payment_failed

# Payment intent succeeded
stripe trigger payment_intent.succeeded
```

### Verify Webhook Processing

Check server logs for:
- Signature verification success
- Event type logged
- Database updates completed
- No errors thrown

### Test Webhook Idempotency

Send same webhook twice:
```bash
stripe events resend evt_xxxxx
```

Verify:
- No duplicate database entries
- No errors on second processing

## API Endpoint Testing

### Test Authentication

```bash
# Without auth (should fail)
curl http://localhost:3001/api/stripe/subscriptions

# With auth (should succeed)
curl http://localhost:3001/api/stripe/subscriptions \
  -H "Cookie: auth-token=YOUR_TOKEN"
```

### Test Admin Endpoints

```bash
# As regular user (should fail)
curl -X POST http://localhost:3001/api/stripe/products \
  -H "Cookie: auth-token=USER_TOKEN" \
  -d '{"name":"Test Product"}'

# As admin (should succeed)
curl -X POST http://localhost:3001/api/stripe/products \
  -H "Cookie: auth-token=ADMIN_TOKEN" \
  -d '{"name":"Test Product"}'
```

### Test Product Creation

```bash
curl -X POST http://localhost:3001/api/stripe/products \
  -H "Cookie: auth-token=ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Pro Plan",
    "description": "Professional tier with all features",
    "features": ["Feature 1", "Feature 2", "Feature 3"]
  }'
```

### Test Price Creation

```bash
curl -X POST http://localhost:3001/api/stripe/prices \
  -H "Cookie: auth-token=ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "prod_xxxxx",
    "amount": 2600,
    "currency": "gbp",
    "interval": "MONTH",
    "nickname": "Pro Monthly"
  }'
```

### Test Analytics

```bash
curl http://localhost:3001/api/stripe/analytics \
  -H "Cookie: auth-token=ADMIN_TOKEN"
```

Verify response includes:
- MRR
- Total revenue
- Revenue this month
- Active subscriptions
- Churn rate
- Top products

## Performance Testing

### Load Test Checkout

```bash
# Install Apache Bench
apt-get install apache2-utils

# Test checkout endpoint
ab -n 100 -c 10 \
  -H "Cookie: auth-token=YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -p checkout.json \
  http://localhost:3001/api/stripe/checkout
```

### Monitor Database Performance

```sql
-- Check subscription query performance
EXPLAIN ANALYZE SELECT * FROM "Subscription" WHERE "userId" = 'user_id';

-- Check index usage
SELECT * FROM pg_stat_user_indexes WHERE relname = 'Subscription';
```

## Security Testing

### 1. Test Webhook Signature Verification

Send webhook with invalid signature:
```bash
curl -X POST http://localhost:3001/api/stripe/webhook \
  -H "stripe-signature: invalid" \
  -d '{"type":"test"}'
```

Expected: 400 error with "Webhook signature verification failed"

### 2. Test Authorization

Try accessing another user's subscription:
```bash
curl http://localhost:3001/api/stripe/subscriptions/OTHER_USER_SUB_ID \
  -H "Cookie: auth-token=YOUR_TOKEN"
```

Expected: 403 Forbidden or 404 Not Found

### 3. Test Input Validation

Send invalid data:
```bash
curl -X POST http://localhost:3001/api/stripe/checkout \
  -H "Cookie: auth-token=YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"priceId": "<script>alert(1)</script>"}'
```

Expected: 400 Bad Request with validation error

## Integration Testing Checklist

- [ ] User can browse plans
- [ ] User can subscribe to plan
- [ ] User can see active subscription
- [ ] User can cancel subscription
- [ ] User can reactivate subscription
- [ ] User can upgrade plan
- [ ] User can downgrade plan
- [ ] User can view invoices
- [ ] User can download invoice PDF
- [ ] User can manage payment methods
- [ ] User can add payment method
- [ ] User can remove payment method
- [ ] User can set default payment method
- [ ] Webhooks process correctly
- [ ] Failed payments handled gracefully
- [ ] Trial periods work correctly
- [ ] Proration calculated correctly
- [ ] Customer portal redirects work
- [ ] Admin can create products
- [ ] Admin can create prices
- [ ] Admin can view analytics
- [ ] MRR calculated correctly
- [ ] Churn rate calculated correctly

## Automated Testing

### Jest Test Example

```typescript
describe('Stripe Integration', () => {
  it('should create subscription', async () => {
    const response = await fetch('/api/stripe/subscriptions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `auth-token=${authToken}`
      },
      body: JSON.stringify({
        priceId: 'price_test_123',
        paymentMethodId: 'pm_test_123'
      })
    });

    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.subscription.status).toBe('ACTIVE');
  });
});
```

## Debugging Tips

### Enable Stripe Request Logging

```typescript
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
  maxNetworkRetries: 2,
  telemetry: false,
});
```

### Check Webhook Logs

Stripe Dashboard > Developers > Webhooks > Select endpoint > View logs

### Database Queries

```sql
-- Check recent subscriptions
SELECT * FROM "Subscription" ORDER BY "createdAt" DESC LIMIT 10;

-- Check payment failures
SELECT * FROM "Payment" WHERE status = 'FAILED';

-- Check subscription statuses
SELECT status, COUNT(*) FROM "Subscription" GROUP BY status;
```

### Application Logs

Monitor server logs for:
- Webhook processing
- API errors
- Database errors
- Stripe API errors

## Test Data Cleanup

### Reset Test Data

```sql
-- Delete all test subscriptions
DELETE FROM "Subscription" WHERE "stripeCustomerId" LIKE 'cus_test_%';

-- Delete all test payments
DELETE FROM "Payment" WHERE "stripePaymentIntentId" LIKE 'pi_test_%';

-- Delete all test invoices
DELETE FROM "Invoice" WHERE "stripeInvoiceId" LIKE 'in_test_%';
```

### Stripe Dashboard Cleanup

Stripe Dashboard > Developers > View test data > Delete all test data

## Production Testing

Before going live:

1. **Sanity Checks**
   - [ ] All environment variables set with live keys
   - [ ] Webhook endpoint accessible from internet
   - [ ] SSL certificate valid
   - [ ] Database backups configured

2. **Small Test Transaction**
   - Use real card with small amount (£1)
   - Verify full flow works
   - Immediately refund

3. **Monitor First Transactions**
   - Watch Stripe Dashboard in real-time
   - Check webhook delivery
   - Verify database updates
   - Monitor application logs

## Support

If tests fail:
1. Check Stripe Dashboard logs
2. Review webhook delivery logs
3. Check application server logs
4. Verify environment variables
5. Test with Stripe CLI
6. Review database state

## Resources

- [Stripe Testing Docs](https://stripe.com/docs/testing)
- [Stripe CLI Reference](https://stripe.com/docs/stripe-cli)
- [Test Card Numbers](https://stripe.com/docs/testing#cards)
- [Webhook Testing](https://stripe.com/docs/webhooks/test)
