// Dynamic import to avoid build errors when stripe isn't configured
let stripe: any = null

async function getStripe() {
  if (!stripe) {
    const Stripe = (await import('stripe')).default
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not defined in environment variables')
    }
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-11-20.acacia',
      typescript: true,
    })
  }
  return stripe
}

export { getStripe, stripe }

// Stripe configuration
export const STRIPE_CONFIG = {
  PRICE_ID: process.env.STRIPE_PRICE_ID || '',
  CURRENCY: 'gbp',
  AMOUNT: 2600, // £26.00 in pence
  TRIAL_PERIOD_DAYS: 7,
  PRODUCT_NAME: 'dAItaniverse Membership',
  PRODUCT_DESCRIPTION: 'All-in-one platform for ADHD entrepreneurs',
}

// Helper function to format amounts
export function formatAmount(amount: number, currency: string = 'gbp'): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount / 100)
}

// Helper function to get subscription status display
export function getSubscriptionStatusDisplay(status: string): {
  label: string
  color: string
} {
  const statusMap: Record<string, { label: string; color: string }> = {
    active: { label: 'Active', color: 'green' },
    trialing: { label: 'Trial', color: 'blue' },
    past_due: { label: 'Past Due', color: 'orange' },
    canceled: { label: 'Canceled', color: 'red' },
    incomplete: { label: 'Incomplete', color: 'yellow' },
    incomplete_expired: { label: 'Expired', color: 'red' },
    unpaid: { label: 'Unpaid', color: 'red' },
  }

  return statusMap[status.toLowerCase()] || { label: 'Unknown', color: 'gray' }
}

// Helper function to get or create a Stripe customer
export async function getOrCreateStripeCustomer(
  userId: string,
  email: string,
  name?: string
): Promise<string> {
  const stripeClient = await getStripe()
  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();

  try {
    // Check if customer already exists
    const existingCustomer = await prisma.stripeCustomer.findUnique({
      where: { userId },
    });

    if (existingCustomer) {
      return existingCustomer.stripeCustomerId;
    }

    // Create new Stripe customer
    const customer = await stripeClient.customers.create({
      email,
      name: name || undefined,
      metadata: {
        userId,
      },
    });

    // Save to database
    await prisma.stripeCustomer.create({
      data: {
        userId,
        stripeCustomerId: customer.id,
        email,
      },
    });

    return customer.id;
  } finally {
    await prisma.$disconnect();
  }
}

// Helper function to calculate MRR (Monthly Recurring Revenue)
export function calculateMRR(subscriptions: any[]): number {
  let mrr = 0;

  for (const sub of subscriptions) {
    if (sub.status === 'ACTIVE' || sub.status === 'TRIALING') {
      // Convert to monthly amount based on interval
      const amount = sub.amount || 0;
      const interval = sub.interval || 'month';

      if (interval === 'year') {
        mrr += amount / 12;
      } else if (interval === 'month') {
        mrr += amount;
      }
    }
  }

  return Math.round(mrr);
}

// Helper function to verify webhook signature
export async function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string,
  secret: string
): Promise<any> {
  const stripeClient = await getStripe()
  return stripeClient.webhooks.constructEvent(payload, signature, secret);
}
