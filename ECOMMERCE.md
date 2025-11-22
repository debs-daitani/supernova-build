# E-commerce & Products System Documentation

## Overview

The dAItaniverse E-commerce & Products System is a comprehensive marketplace that allows entrepreneurs to sell digital products, courses, templates, and services. The system features tier-based selling permissions, platform fees, secure payments via Stripe, digital downloads with expiry, and a complete seller dashboard.

## Table of Contents

1. [Database Schema](#database-schema)
2. [Tier-Based Permissions](#tier-based-permissions)
3. [Platform Fees](#platform-fees)
4. [Features](#features)
5. [Pages & Routes](#pages--routes)
6. [API Endpoints](#api-endpoints)
7. [Payment Processing](#payment-processing)
8. [Digital Downloads](#digital-downloads)
9. [Payouts](#payouts)
10. [Configuration](#configuration)

---

## Database Schema

### Product
Stores digital products, courses, templates, and services.

```typescript
model Product {
  id              String   @id @default(cuid())
  userId          String   // Seller
  name            String
  slug            String   @unique
  description     String?  @db.Text
  price           Float
  currency        String   @default("GBP")
  productType     String   @default("DIGITAL")
  category        String?
  tags            String[] @default([])
  thumbnail       String?
  images          String[] @default([])
  downloadUrl     String?
  fileSize        Int?
  fileType        String?
  isActive        Boolean  @default(true)
  isFeatured      Boolean  @default(false)
  salesCount      Int      @default(0)
  revenue         Float    @default(0)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

**Key Fields:**
- `slug`: SEO-friendly URL (auto-generated from name)
- `productType`: DIGITAL, COURSE, TEMPLATE, SERVICE
- `category`: One of 7 predefined categories
- `downloadUrl`: Direct link to file (cloud storage)
- `salesCount` & `revenue`: Automatically updated on each sale

### Order
Tracks purchases from buyers.

```typescript
model Order {
  id                String    @id @default(cuid())
  buyerId           String?   // Nullable for guest checkout
  sellerId          String
  productId         String
  variantId         String?
  quantity          Int       @default(1)
  unitPrice         Float
  totalAmount       Float
  status            String    @default("PENDING")
  paymentIntentId   String?   @unique
  customerEmail     String
  customerName      String?
  downloadUrl       String?
  downloadExpiresAt DateTime?
  downloadCount     Int       @default(0)
  maxDownloads      Int       @default(5)
  createdAt         DateTime  @default(now())
  paidAt            DateTime?
}
```

**Order Statuses:**
- `PENDING`: Awaiting payment
- `PAID`: Payment successful, download available
- `COMPLETED`: Order fulfilled
- `REFUNDED`: Refund issued
- `FAILED`: Payment failed

**Download Security:**
- Downloads expire 24 hours after purchase
- Limited to 5 downloads per order
- Download count tracked to prevent abuse

### Cart
Shopping cart for logged-in users (guests use session storage).

```typescript
model Cart {
  id          String   @id @default(cuid())
  userId      String
  items       Json     // Array of cart items
  totalAmount Float
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### ProductReview
Customer reviews for products.

```typescript
model ProductReview {
  id                  String   @id @default(cuid())
  productId           String
  userId              String
  orderId             String?  @unique
  rating              Int      // 1-5 stars
  comment             String?  @db.Text
  isVerifiedPurchase  Boolean  @default(false)
  createdAt           DateTime @default(now())
}
```

### Coupon
Discount codes for promotions.

```typescript
model Coupon {
  id                 String    @id @default(cuid())
  userId             String    // Creator
  code               String    @unique
  discountType       String    // PERCENTAGE, FIXED_AMOUNT
  discountValue      Float
  minPurchaseAmount  Float?
  maxUses            Int?
  usedCount          Int       @default(0)
  expiresAt          DateTime?
  isActive           Boolean   @default(true)
  createdAt          DateTime  @default(now())
}
```

### PayoutRequest
Seller payout requests.

```typescript
model PayoutRequest {
  id          String    @id @default(cuid())
  userId      String
  amount      Float
  status      String    @default("PENDING")
  method      String    // STRIPE, PAYPAL, BANK
  details     String?   @db.Text
  requestedAt DateTime  @default(now())
  processedAt DateTime?
}
```

### ProductVariant
Different pricing tiers for products.

```typescript
model ProductVariant {
  id          String   @id @default(cuid())
  productId   String
  name        String   // e.g., "Basic", "Pro", "Enterprise"
  price       Float
  description String?
  features    String[] @default([])
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
}
```

---

## Tier-Based Permissions

### BRAVE (£6/month)
- **Can Sell:** ❌ No
- **Max Products:** 0
- **Platform Fee:** N/A

### BOLD (£26/month)
- **Can Sell:** ✅ Yes
- **Max Products:** 50
- **Platform Fee:** 5%

### BADASS (£260/year)
- **Can Sell:** ✅ Yes
- **Max Products:** Unlimited
- **Platform Fee:** 3%

**Quota Enforcement:**
- Product creation blocked when limit reached
- Warning messages shown on dashboard
- Upgrade prompts displayed

---

## Platform Fees

### Fee Calculation

```typescript
// Example: £100 sale on BOLD tier
const grossRevenue = 100
const platformFee = grossRevenue * 0.05 // £5
const netEarnings = grossRevenue - platformFee // £95
```

### Fee Structure

| Tier | Fee Rate | Example (£100 sale) |
|------|----------|---------------------|
| BOLD | 5% | Seller gets £95 |
| BADASS | 3% | Seller gets £97 |

### When Fees Are Deducted
- Fees are calculated at time of sale
- Deducted before payout
- Tracked in seller dashboard
- Displayed in payout requests

---

## Features

### ✅ Product Management
- Create, edit, delete products
- Upload thumbnails and images
- Set pricing and categories
- Add tags for discoverability
- Toggle active/inactive status
- Feature products on homepage
- Product variants with different prices

### ✅ Shopping Experience
- Browse product catalog
- Search and filter products
- Category navigation
- Product detail pages with reviews
- Add to cart functionality
- Guest and logged-in checkout
- Secure payment processing

### ✅ Seller Dashboard
- View all products
- Sales analytics
- Revenue tracking
- Order management
- Performance metrics
- Quick actions

### ✅ Sales & Analytics
- Total revenue
- Net earnings (after fees)
- Order counts
- Top performing products
- Time-range filtering (7d, 30d, all)
- Platform fee breakdown

### ✅ Payouts
- Request payouts via Stripe, PayPal, or Bank
- Minimum payout: £25
- 7-day fund clearance period
- 3-day processing time
- Payout history tracking
- Available vs pending balance

### ✅ Digital Downloads
- Secure download links
- 24-hour expiry
- 5 download limit per purchase
- Download tracking
- Email delivery
- File size/type display

### ✅ Reviews & Ratings
- 5-star rating system
- Verified purchase badges
- Comment system
- Review display on product pages
- Average rating calculation

### ✅ Coupons
- Percentage or fixed amount discounts
- Minimum purchase requirements
- Usage limits
- Expiry dates
- Coupon validation

---

## Pages & Routes

### Buyer Pages

| Page | Route | Description |
|------|-------|-------------|
| Shop Home | `/shop` | Homepage with featured products |
| Product Catalog | `/shop/products` | Browse all products |
| Product Detail | `/shop/products/[slug]` | View product details |
| Shopping Cart | `/shop/cart` | View cart items |
| Checkout | `/shop/checkout` | Complete purchase |
| Order Confirmation | `/shop/orders/confirmation` | Post-purchase confirmation |
| My Purchases | `/shop/my-purchases` | View purchase history |

### Seller Pages

| Page | Route | Description |
|------|-------|-------------|
| My Products | `/shop/my-products` | Manage products |
| Create Product | `/shop/my-products/new` | Add new product |
| Edit Product | `/shop/my-products/[id]/edit` | Edit existing product |
| Sales Dashboard | `/shop/sales` | View sales analytics |
| Payouts | `/shop/payouts` | Request & track payouts |

---

## API Endpoints

### Products

```typescript
// List products
GET /api/shop/products
Query: category, search, featured, sellerId, sort, page, limit

// Get single product
GET /api/shop/products/[id]

// Create product (sellers only)
POST /api/shop/products
Body: name, description, price, category, productType, tags, etc.

// Update product (owner only)
PATCH /api/shop/products/[id]
Body: name, description, price, isActive, etc.

// Delete product (owner only)
DELETE /api/shop/products/[id]
```

### Cart

```typescript
// Get cart
GET /api/shop/cart

// Add to cart
POST /api/shop/cart
Body: productId, variantId?, quantity

// Clear cart
DELETE /api/shop/cart
```

### Orders

```typescript
// List orders
GET /api/shop/orders
Query: sellerId, buyerId, productId, status

// Get single order
GET /api/shop/orders/[id]

// Get buyer's purchases
GET /api/shop/orders/my-purchases

// Track download
POST /api/shop/orders/[id]/download
```

### Checkout

```typescript
// Process checkout
POST /api/shop/checkout
Body: cartItems, customerName, customerEmail, paymentIntentId
```

### Payouts

```typescript
// List payouts
GET /api/shop/payouts
Query: userId

// Request payout
POST /api/shop/payouts
Body: amount, method, details
```

### Coupons

```typescript
// Validate coupon
POST /api/shop/coupons/validate
Body: code
```

---

## Payment Processing

### Stripe Integration

The system integrates with Stripe for secure payment processing.

**Checkout Flow:**

1. **Add to Cart** → Items stored in database or session
2. **Checkout** → Customer enters details
3. **Payment** → Stripe processes payment
4. **Order Creation** → Order records created in database
5. **Download Links** → Generated and emailed to customer

**Demo Mode:**
Currently in demo mode. Production implementation requires:

```typescript
// Install Stripe
npm install @stripe/stripe-js stripe

// Create payment intent
const paymentIntent = await stripe.paymentIntents.create({
  amount: totalAmount * 100, // Convert to cents
  currency: 'gbp',
  metadata: { orderId: order.id }
})
```

### Guest Checkout
- No login required
- Email required for order confirmation
- Download links sent to email
- Order tracked via email + order ID

---

## Digital Downloads

### Security Features

1. **Time-Limited Access**
   - Links expire 24 hours after purchase
   - Expiry timestamp stored in order

2. **Download Limits**
   - Maximum 5 downloads per purchase
   - Download count tracked and enforced

3. **Unique Links**
   - Token-based download URLs
   - Validated on each download attempt

### Download URL Generation

```typescript
// Generate secure download URL
export function generateDownloadUrl(productId: string, orderId: string): string {
  const expiryTime = Date.now() + 24 * 60 * 60 * 1000 // 24 hours
  const token = Buffer.from(`${productId}:${orderId}:${expiryTime}`).toString('base64url')
  return `/api/shop/download/${token}`
}
```

### File Storage

**Recommended Setup:**
- Use cloud storage (AWS S3, Cloudflare R2, Google Cloud Storage)
- Generate signed URLs with expiration
- Max file size: 500MB
- Supported types: PDF, ZIP, MP4, etc.

---

## Payouts

### Payout Settings

```typescript
export const PAYOUT_SETTINGS = {
  MIN_PAYOUT_AMOUNT: 25,      // £25 minimum
  CLEARANCE_DAYS: 7,           // 7-day hold
  PROCESSING_DAYS: 3,          // 3-day processing
}
```

### Payout Flow

1. **Sale Completed** → Revenue tracked
2. **7-Day Hold** → Funds pending clearance
3. **Funds Cleared** → Available for payout
4. **Request Payout** → Seller submits request
5. **Processing** → 3-day processing time
6. **Completed** → Funds transferred

### Balance Calculation

```typescript
// Available Balance (cleared funds)
const clearedSales = orders.filter(order =>
  areFundsCleared(order.paidAt)
)
const availableBalance = calculateSellerPayout(clearedSales, userTier)

// Pending Balance (not cleared yet)
const pendingSales = orders.filter(order =>
  !areFundsCleared(order.paidAt)
)
const pendingBalance = calculateSellerPayout(pendingSales, userTier)
```

### Payout Methods

| Method | Processing Time | Details Required |
|--------|----------------|------------------|
| Stripe | 1-3 days | Email address |
| PayPal | 1-2 days | Email address |
| Bank Transfer | 3-5 days | Account details |

---

## Configuration

### Product Categories

```typescript
export const PRODUCT_CATEGORIES = [
  'Courses',
  'Templates',
  'Guides & Ebooks',
  'Design Assets',
  'Video Content',
  'Consulting',
  'Other'
]
```

### Download Settings

```typescript
export const DOWNLOAD_SETTINGS = {
  MAX_DOWNLOADS: 5,
  EXPIRY_HOURS: 24,
  MAX_FILE_SIZE: 500 * 1024 * 1024, // 500MB
}
```

### Currency Support

```typescript
const SUPPORTED_CURRENCIES = ['GBP', 'USD', 'EUR']
```

---

## Usage Examples

### Creating a Product

```typescript
const product = await fetch('/api/shop/products', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Social Media Marketing Course',
    description: 'Complete guide to social media marketing',
    price: 49.99,
    category: 'Courses',
    productType: 'DIGITAL',
    tags: ['marketing', 'social-media', 'business'],
    thumbnail: 'https://example.com/image.jpg',
    downloadUrl: 'https://storage.com/file.pdf',
    fileSize: 1048576,
    fileType: 'PDF',
    isFeatured: true
  })
})
```

### Processing a Purchase

```typescript
const checkout = await fetch('/api/shop/checkout', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    cartItems: [
      { productId: 'prod_123', quantity: 1, price: 49.99 }
    ],
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
    paymentIntentId: 'pi_stripe123'
  })
})
```

### Requesting a Payout

```typescript
const payout = await fetch('/api/shop/payouts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    amount: 475.50,
    method: 'STRIPE',
    details: 'seller@example.com'
  })
})
```

---

## TODO / Future Enhancements

- [ ] Complete Stripe integration (currently demo mode)
- [ ] Implement actual file upload to cloud storage
- [ ] Add email notifications for orders and downloads
- [ ] Create admin dashboard for platform management
- [ ] Add refund processing
- [ ] Implement subscription products
- [ ] Add affiliate/referral system
- [ ] Create mobile app
- [ ] Add product bundles
- [ ] Implement wishlists
- [ ] Add seller verification badges
- [ ] Create dispute resolution system

---

## Support & Troubleshooting

### Common Issues

**Q: Products not appearing in catalog**
- Check `isActive` status
- Verify product has valid category
- Ensure seller tier allows selling

**Q: Download link expired**
- Links expire after 24 hours
- Contact seller for new download
- Check download count limit

**Q: Payout not available**
- Check 7-day clearance period
- Verify minimum £25 balance
- Ensure payout details are correct

**Q: Platform fee incorrect**
- BOLD tier: 5%
- BADASS tier: 3%
- Fees deducted automatically

---

## Technical Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL with Prisma ORM
- **Payments:** Stripe (integration pending)
- **Styling:** Tailwind CSS + shadcn/ui
- **File Storage:** Cloud storage (AWS S3, etc.)

---

## License & Credits

Part of the dAItaniverse platform ecosystem.

Created: 2025
Last Updated: 2025-11-22
