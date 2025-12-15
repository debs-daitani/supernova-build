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
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }

    const subscribers = await prisma.emailSubscriber.findMany({
      where,
      include: {
        _count: {
          select: {
            events: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
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
    const { email, name, tags, source } = body;

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
          ...(name && { name }),
          ...(tags && { tags }),
          status: 'active'
        }
      });
    } else {
      // Create new subscriber
      subscriber = await prisma.emailSubscriber.create({
        data: {
          email,
          name,
          tags: tags || [],
          source: source || 'manual',
          status: 'active',
        }
      });
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
