import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/email/sequences/[id]
 * Get sequence details with all emails
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sequence = await prisma.emailSequence.findUnique({
      where: { id: params.id },
      include: {
        emails: {
          orderBy: { order: 'asc' },
          include: {
            _count: {
              select: {
                events: true
              }
            }
          }
        }
      }
    });

    if (!sequence) {
      return NextResponse.json(
        { error: 'Sequence not found' },
        { status: 404 }
      );
    }

    // Get enrollment stats
    const totalEnrollments = await prisma.emailEvent.count({
      where: {
        sequenceEmailId: {
          in: sequence.emails.map(e => e.id)
        },
        type: 'SENT'
      }
    });

    const uniqueSubscribers = await prisma.emailEvent.groupBy({
      by: ['subscriberId'],
      where: {
        sequenceEmailId: {
          in: sequence.emails.map(e => e.id)
        },
        type: 'SENT'
      }
    });

    return NextResponse.json({
      ...sequence,
      stats: {
        totalEnrollments,
        uniqueEnrollments: uniqueSubscribers.length
      }
    });
  } catch (error) {
    console.error('[API] Error fetching sequence:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sequence' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/email/sequences/[id]
 * Update sequence details and emails
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, description, status, triggerType, triggerValue, emails } = body;

    // Update sequence
    const sequence = await prisma.emailSequence.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(status && { status }),
        ...(triggerType && { triggerType }),
        ...(triggerValue !== undefined && { triggerValue })
      }
    });

    // Update emails if provided
    if (emails && Array.isArray(emails)) {
      // Delete existing emails not in the update
      const emailIds = emails.filter(e => e.id).map(e => e.id);
      await prisma.emailSequenceEmail.deleteMany({
        where: {
          sequenceId: params.id,
          id: {
            notIn: emailIds
          }
        }
      });

      // Update or create emails
      for (const email of emails) {
        if (email.id) {
          await prisma.emailSequenceEmail.update({
            where: { id: email.id },
            data: {
              order: email.order,
              delayDays: email.delayDays || 0,
              delayHours: email.delayHours || 0,
              subject: email.subject,
              previewText: email.previewText,
              htmlContent: email.htmlContent,
              textContent: email.textContent,
              fromName: email.fromName || 'dAItaniverse',
              fromEmail: email.fromEmail || 'hello@daitaniverse.com'
            }
          });
        } else {
          await prisma.emailSequenceEmail.create({
            data: {
              sequenceId: params.id,
              order: email.order,
              delayDays: email.delayDays || 0,
              delayHours: email.delayHours || 0,
              subject: email.subject,
              previewText: email.previewText,
              htmlContent: email.htmlContent,
              textContent: email.textContent,
              fromName: email.fromName || 'dAItaniverse',
              fromEmail: email.fromEmail || 'hello@daitaniverse.com'
            }
          });
        }
      }
    }

    // Fetch updated sequence
    const updatedSequence = await prisma.emailSequence.findUnique({
      where: { id: params.id },
      include: {
        emails: {
          orderBy: { order: 'asc' }
        }
      }
    });

    return NextResponse.json(updatedSequence);
  } catch (error) {
    console.error('[API] Error updating sequence:', error);
    return NextResponse.json(
      { error: 'Failed to update sequence' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/email/sequences/[id]
 * Delete a sequence
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.emailSequence.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API] Error deleting sequence:', error);
    return NextResponse.json(
      { error: 'Failed to delete sequence' },
      { status: 500 }
    );
  }
}
