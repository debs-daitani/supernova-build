import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/email/lists
 * Get all email lists
 */
export async function GET(request: NextRequest) {
  try {
    const lists = await prisma.emailList.findMany({
      include: {
        subscribers: {
          select: {
            subscriber: {
              select: {
                id: true,
                email: true,
                status: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Calculate active subscriber count for each list
    const listsWithCounts = lists.map(list => ({
      ...list,
      activeSubscriberCount: list.subscribers.filter(
        s => s.subscriber.status === 'SUBSCRIBED'
      ).length,
      totalSubscriberCount: list.subscribers.length
    }));

    return NextResponse.json(listsWithCounts);
  } catch (error) {
    console.error('[API] Error fetching email lists:', error);
    return NextResponse.json(
      { error: 'Failed to fetch email lists' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/email/lists
 * Create a new email list
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, tags } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    const list = await prisma.emailList.create({
      data: {
        name,
        description,
        tags: tags || []
      }
    });

    return NextResponse.json(list, { status: 201 });
  } catch (error) {
    console.error('[API] Error creating email list:', error);
    return NextResponse.json(
      { error: 'Failed to create email list' },
      { status: 500 }
    );
  }
}
