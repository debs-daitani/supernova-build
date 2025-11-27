import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/email/subscribers
 * Get all subscribers with filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const source = searchParams.get('source');
    const tag = searchParams.get('tag');
    const search = searchParams.get('search');

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (source) {
      where.source = source;
    }

    if (tag) {
      where.tags = {
        has: tag
      };
    }

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } }
      ];
    }

    const subscribers = await prisma.emailSubscriber.findMany({
      where,
      include: {
        lists: {
          include: {
            list: true
          }
        },
        _count: {
          select: {
            events: true
          }
        }
      },
      orderBy: {
        subscribedAt: 'desc'
      }
    });

    return NextResponse.json(subscribers);
  } catch (error) {
    console.error('[API] Error fetching subscribers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscribers' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/email/subscribers
 * Create a new subscriber
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, firstName, lastName, listIds, tags, source, customFields } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if subscriber already exists
    let subscriber = await prisma.emailSubscriber.findUnique({
      where: { email }
    });

    if (subscriber) {
      // Update existing subscriber
      subscriber = await prisma.emailSubscriber.update({
        where: { email },
        data: {
          ...(firstName && { firstName }),
          ...(lastName && { lastName }),
          ...(tags && { tags }),
          ...(customFields && { customFields }),
          status: 'SUBSCRIBED'
        }
      });
    } else {
      // Create new subscriber
      subscriber = await prisma.emailSubscriber.create({
        data: {
          email,
          firstName,
          lastName,
          tags: tags || [],
          source: source || 'MANUAL',
          customFields
        }
      });
    }

    // Add to lists if specified
    if (listIds && listIds.length > 0) {
      for (const listId of listIds) {
        await prisma.emailListSubscriber.upsert({
          where: {
            listId_subscriberId: {
              listId,
              subscriberId: subscriber.id
            }
          },
          create: {
            listId,
            subscriberId: subscriber.id
          },
          update: {}
        });

        // Update list subscriber count
        const count = await prisma.emailListSubscriber.count({
          where: { listId }
        });
        await prisma.emailList.update({
          where: { id: listId },
          data: { subscriberCount: count }
        });
      }
    }

    return NextResponse.json(subscriber, { status: 201 });
  } catch (error) {
    console.error('[API] Error creating subscriber:', error);
    return NextResponse.json(
      { error: 'Failed to create subscriber' },
      { status: 500 }
    );
  }
}
