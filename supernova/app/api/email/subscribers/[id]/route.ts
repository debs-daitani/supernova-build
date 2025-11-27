import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { unsubscribeEmail } from '@/lib/email-sender';

/**
 * GET /api/email/subscribers/[id]
 * Get a specific subscriber
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const subscriber = await prisma.emailSubscriber.findUnique({
      where: { id },
      include: {
        lists: {
          include: {
            list: true
          }
        },
        events: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 50
        }
      }
    });

    if (!subscriber) {
      return NextResponse.json(
        { error: 'Subscriber not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(subscriber);
  } catch (error) {
    console.error('[API] Error fetching subscriber:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscriber' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/email/subscribers/[id]
 * Update a subscriber
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { firstName, lastName, tags, status, customFields, listIds } = body;

    const subscriber = await prisma.emailSubscriber.update({
      where: { id },
      data: {
        ...(firstName !== undefined && { firstName }),
        ...(lastName !== undefined && { lastName }),
        ...(tags && { tags }),
        ...(status && { status }),
        ...(customFields && { customFields })
      }
    });

    // Update list memberships if specified
    if (listIds) {
      // Remove from all lists
      await prisma.emailListSubscriber.deleteMany({
        where: { subscriberId: id }
      });

      // Add to new lists
      for (const listId of listIds) {
        await prisma.emailListSubscriber.create({
          data: {
            listId,
            subscriberId: id
          }
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

    return NextResponse.json(subscriber);
  } catch (error) {
    console.error('[API] Error updating subscriber:', error);
    return NextResponse.json(
      { error: 'Failed to update subscriber' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/email/subscribers/[id]
 * Delete a subscriber
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    await prisma.emailSubscriber.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API] Error deleting subscriber:', error);
    return NextResponse.json(
      { error: 'Failed to delete subscriber' },
      { status: 500 }
    );
  }
}
