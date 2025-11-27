import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth-middleware';
import { calculateMRR } from '@/lib/stripe';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/stripe/analytics
 * Revenue analytics (MRR, total revenue, subscription counts, churn rate)
 * Admin only
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: { role: true },
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get all subscriptions
    const allSubscriptions = await prisma.subscription.findMany();

    // Calculate active subscriptions
    const activeSubscriptions = allSubscriptions.filter(
      (sub) => sub.status === 'ACTIVE' || sub.status === 'TRIALING'
    );

    // Get prices for MRR calculation
    const prices = await prisma.price.findMany({
      where: {
        stripePriceId: {
          in: activeSubscriptions.map((sub) => sub.stripePriceId),
        },
      },
    });

    // Map subscriptions with amounts
    const subscriptionsWithAmounts = activeSubscriptions.map((sub) => {
      const price = prices.find((p) => p.stripePriceId === sub.stripePriceId);
      return {
        ...sub,
        amount: price?.amount || 0,
        interval: price?.interval || 'MONTH',
      };
    });

    // Calculate MRR
    const mrr = calculateMRR(subscriptionsWithAmounts);

    // Calculate total revenue (all time)
    const allPayments = await prisma.payment.findMany({
      where: { status: 'SUCCEEDED' },
    });
    const totalRevenue = allPayments.reduce(
      (sum, payment) => sum + payment.amount,
      0
    );

    // Calculate revenue this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthPayments = await prisma.payment.findMany({
      where: {
        status: 'SUCCEEDED',
        createdAt: { gte: startOfMonth },
      },
    });
    const revenueThisMonth = monthPayments.reduce(
      (sum, payment) => sum + payment.amount,
      0
    );

    // Calculate churn rate (canceled in last 30 days / active at start of period)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const canceledLast30Days = await prisma.subscription.count({
      where: {
        status: 'CANCELED',
        canceledAt: { gte: thirtyDaysAgo },
      },
    });

    const activeAtStart = allSubscriptions.filter(
      (sub) =>
        sub.createdAt < thirtyDaysAgo &&
        (sub.status === 'ACTIVE' ||
          sub.status === 'TRIALING' ||
          (sub.status === 'CANCELED' && sub.canceledAt && sub.canceledAt >= thirtyDaysAgo))
    ).length;

    const churnRate =
      activeAtStart > 0 ? (canceledLast30Days / activeAtStart) * 100 : 0;

    // Subscription breakdown by status
    const subscriptionsByStatus = {
      ACTIVE: allSubscriptions.filter((sub) => sub.status === 'ACTIVE').length,
      TRIALING: allSubscriptions.filter((sub) => sub.status === 'TRIALING')
        .length,
      PAST_DUE: allSubscriptions.filter((sub) => sub.status === 'PAST_DUE')
        .length,
      CANCELED: allSubscriptions.filter((sub) => sub.status === 'CANCELED')
        .length,
      INCOMPLETE: allSubscriptions.filter((sub) => sub.status === 'INCOMPLETE')
        .length,
    };

    // Get top products
    const productCounts: Record<string, number> = {};
    activeSubscriptions.forEach((sub) => {
      if (sub.stripeProductId) {
        productCounts[sub.stripeProductId] =
          (productCounts[sub.stripeProductId] || 0) + 1;
      }
    });

    const topProducts = Object.entries(productCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(async ([productId, count]) => {
        const product = await prisma.product.findFirst({
          where: { stripeProductId: productId },
        });
        return {
          productId,
          productName: product?.name || 'Unknown',
          subscribers: count,
        };
      });

    const topProductsData = await Promise.all(topProducts);

    return NextResponse.json({
      mrr: mrr / 100, // Convert from pence to pounds
      totalRevenue: totalRevenue / 100,
      revenueThisMonth: revenueThisMonth / 100,
      totalSubscriptions: allSubscriptions.length,
      activeSubscriptions: activeSubscriptions.length,
      churnRate: churnRate.toFixed(2),
      subscriptionsByStatus,
      topProducts: topProductsData,
    });
  } catch (error: any) {
    console.error('Error in GET /api/stripe/analytics:', error);
    return NextResponse.json(
      { error: 'Failed to get analytics' },
      { status: 500 }
    );
  }
}
