import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutCompleted(session)
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdate(subscription)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionCancelled(subscription)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        await handlePaymentFailed(invoice)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId
  if (!userId) {
    console.error('No userId in session metadata')
    return
  }

  const paymentType = session.metadata?.type

  // Create payment record
  await prisma.payment.create({
    data: {
      userId,
      amount: (session.amount_total || 0) / 100,
      type: paymentType === 'upgrade_one_time' ? 'UPGRADE' :
            paymentType === 'monthly_subscription' ? 'MONTHLY' :
            paymentType === 'annual_subscription' ? 'ANNUAL' : 'UPGRADE',
      stripePaymentId: session.id,
      status: 'COMPLETED',
    },
  })

  // Update user based on payment type
  if (paymentType === 'upgrade_one_time') {
    await prisma.user.update({
      where: { id: userId },
      data: {
        role: 'UPGRADE',
        subscriptionStatus: 'ACTIVE',
        subscriptionTier: 'UPGRADE_ONE_TIME',
        stripeCustomerId: session.customer as string,
      },
    })
  } else if (paymentType?.includes('subscription')) {
    const tier = paymentType === 'monthly_subscription' ? 'MONTHLY' : 'ANNUAL'

    await prisma.user.update({
      where: { id: userId },
      data: {
        role: 'MEMBER',
        subscriptionStatus: 'ACTIVE',
        subscriptionTier: tier,
        stripeCustomerId: session.customer as string,
      },
    })
  }
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId

  if (!userId) {
    // Find user by Stripe customer ID
    const user = await prisma.user.findUnique({
      where: { stripeCustomerId: subscription.customer as string },
    })

    if (!user) {
      console.error('User not found for subscription update')
      return
    }

    await updateUserSubscription(user.id, subscription)
  } else {
    await updateUserSubscription(userId, subscription)
  }
}

async function updateUserSubscription(userId: string, subscription: Stripe.Subscription) {
  const status = subscription.status === 'active' ? 'ACTIVE' :
                 subscription.status === 'canceled' ? 'CANCELLED' :
                 'PENDING'

  await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionStatus: status,
      subscriptionEndDate: new Date(subscription.current_period_end * 1000),
    },
  })
}

async function handleSubscriptionCancelled(subscription: Stripe.Subscription) {
  const user = await prisma.user.findUnique({
    where: { stripeCustomerId: subscription.customer as string },
  })

  if (!user) {
    console.error('User not found for subscription cancellation')
    return
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      subscriptionStatus: 'CANCELLED',
      // Keep access until period ends
      subscriptionEndDate: new Date(subscription.current_period_end * 1000),
    },
  })
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const user = await prisma.user.findUnique({
    where: { stripeCustomerId: invoice.customer as string },
  })

  if (!user) {
    console.error('User not found for failed payment')
    return
  }

  // TODO: Send email notification to user about failed payment
  console.log(`Payment failed for user ${user.id}`)
}
