import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { usageTracking: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get tier limits
    const tierLimits = {
      FREE: 0,
      UPGRADE: 100,
      MEMBER: 300,
      ADMIN: Infinity,
    };

    const limit = tierLimits[user.tier];
    const used = user.usageTracking?.supernovaMessages || 0;

    return NextResponse.json({
      tier: user.tier,
      usage: {
        used,
        limit,
        remaining: limit - used,
      },
      totalMessages: user.usageTracking?.totalMessages || 0,
      totalTokens: user.usageTracking?.totalTokens || 0,
    });
  } catch (error) {
    console.error('Failed to get usage:', error);
    return NextResponse.json(
      { error: 'Failed to get usage data' },
      { status: 500 }
    );
  }
}
