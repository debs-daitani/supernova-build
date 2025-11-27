import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/email/lists/[id]
 * Get a specific email list with subscribers
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const list = await prisma.emailList.findUnique({
      where: { id },
      include: {
        subscribers: {
          include: {
            subscriber: true
          },
          orderBy: {
            subscribedAt: 'desc'
          }
        }
      }
    });

    if (!list) {
      return NextResponse.json(
        { error: 'List not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(list);
  } catch (error) {
    console.error('[API] Error fetching email list:', error);
    return NextResponse.json(
      { error: 'Failed to fetch email list' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/email/lists/[id]
 * Update an email list
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { name, description, tags } = body;

    const list = await prisma.emailList.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(tags && { tags })
      }
    });

    return NextResponse.json(list);
  } catch (error) {
    console.error('[API] Error updating email list:', error);
    return NextResponse.json(
      { error: 'Failed to update email list' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/email/lists/[id]
 * Delete an email list
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    await prisma.emailList.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API] Error deleting email list:', error);
    return NextResponse.json(
      { error: 'Failed to delete email list' },
      { status: 500 }
    );
  }
}
