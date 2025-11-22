// Shop configuration and constants

export const PRODUCT_CATEGORIES = [
  'Courses',
  'Templates',
  'Guides & Ebooks',
  'Design Assets',
  'Video Content',
  'Consulting',
  'Other',
]

export const PRODUCT_TYPES = {
  DIGITAL: {
    label: 'Digital Product',
    description: 'Downloadable files (PDFs, videos, designs, etc.)',
  },
  PHYSICAL: {
    label: 'Physical Product',
    description: 'Physical items that require shipping',
  },
  SUBSCRIPTION: {
    label: 'Subscription',
    description: 'Recurring access to content or services',
  },
  SERVICE: {
    label: 'Service',
    description: 'Consulting, coaching, or done-for-you services',
  },
}

export const CURRENCIES = [
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
]

export const ORDER_STATUSES = {
  PENDING: { label: 'Pending', color: '#94A3B8' },
  PAID: { label: 'Paid', color: '#10B981' },
  COMPLETED: { label: 'Completed', color: '#10B981' },
  REFUNDED: { label: 'Refunded', color: '#EF4444' },
  FAILED: { label: 'Failed', color: '#EF4444' },
}

export const PLATFORM_FEES = {
  BOLD: 0.05, // 5% fee
  BADASS: 0.03, // 3% fee
}

export const PAYOUT_SETTINGS = {
  MIN_PAYOUT_AMOUNT: 25, // £25 minimum
  CLEARANCE_DAYS: 7, // 7 days before funds are available
  PROCESSING_DAYS: 3, // 3-5 days for payout processing
}

export const DOWNLOAD_SETTINGS = {
  MAX_DOWNLOADS: 5,
  EXPIRY_HOURS: 24,
  MAX_FILE_SIZE: 500 * 1024 * 1024, // 500MB
}

export const TIER_LIMITS = {
  BRAVE: {
    maxProducts: 0,
    platformFee: 0,
    canSell: false,
  },
  BOLD: {
    maxProducts: 50,
    platformFee: PLATFORM_FEES.BOLD,
    canSell: true,
  },
  BADASS: {
    maxProducts: -1, // Unlimited
    platformFee: PLATFORM_FEES.BADASS,
    canSell: true,
  },
}

export const DISCOUNT_TYPES = {
  PERCENTAGE: 'Percentage Off',
  FIXED_AMOUNT: 'Fixed Amount Off',
}

export const PAYOUT_METHODS = {
  STRIPE: {
    label: 'Stripe Connect',
    description: 'Receive payouts via Stripe (fastest)',
    processingTime: '3-5 business days',
  },
  PAYPAL: {
    label: 'PayPal',
    description: 'Receive payouts to your PayPal account',
    processingTime: '5-7 business days',
  },
  BANK: {
    label: 'Bank Transfer',
    description: 'Direct deposit to your bank account',
    processingTime: '7-10 business days',
  },
}
