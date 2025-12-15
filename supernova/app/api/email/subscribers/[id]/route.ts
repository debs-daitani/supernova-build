import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/email/subscribers/[id]
 * Get a specific subscriber
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const subscriber = await prisma.emailSubscriber.findUnique({
      where: { id },
      include: {
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, tags, status } = body;

    const subscriber = await prisma.emailSubscriber.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(tags && { tags }),
        ...(status && { status }),
      }
    });

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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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
