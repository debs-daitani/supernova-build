import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const querySchema = z.object({
  userId: z.string(),
  limit: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const limit = searchParams.get('limit') || '10';

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const conversations = await prisma.conversation.findMany({
      where: { userId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
        _count: {
          select: { messages: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: parseInt(limit),
    });

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error('Failed to load conversations:', error);
    return NextResponse.json(
      { error: 'Failed to load conversations' },
      { status: 500 }
    );
  }
}
