import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
})

// Price IDs from Stripe dashboard
export const PRICES = {
  UPGRADE_ONE_TIME: process.env.STRIPE_UPGRADE_PRICE_ID || 'price_upgrade_26',
  MONTHLY: process.env.STRIPE_MONTHLY_PRICE_ID || 'price_monthly_26',
  ANNUAL: process.env.STRIPE_ANNUAL_PRICE_ID || 'price_annual_260',
}

export async function createCheckoutSession(
  userId: string,
  email: string,
  priceId: string,
  mode: 'payment' | 'subscription',
  metadata: Record<string, string> = {}
) {
  const session = await stripe.checkout.sessions.create({
    customer_email: email,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode,
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/upgrade`,
    metadata: {
      userId,
      ...metadata,
    },
  })

  return session
}

export async function createCustomerPortalSession(customerId: string) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
  })

  return session
}
