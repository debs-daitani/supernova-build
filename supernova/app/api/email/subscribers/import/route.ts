import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/email/subscribers/import
 * Import subscribers from CSV data
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subscribers, listId, source = 'IMPORT' } = body;

    if (!subscribers || !Array.isArray(subscribers)) {
      return NextResponse.json(
        { error: 'Invalid subscribers data' },
        { status: 400 }
      );
    }

    const results = {
      created: 0,
      updated: 0,
      skipped: 0,
      errors: [] as string[]
    };

    for (const sub of subscribers) {
      try {
        const { email, firstName, lastName, tags, customFields } = sub;

        if (!email || !email.includes('@')) {
          results.skipped++;
          results.errors.push(`Invalid email: ${email}`);
          continue;
        }

        // Check if subscriber exists
        const existing = await prisma.emailSubscriber.findUnique({
          where: { email }
        });

        let subscriber;

        if (existing) {
          // Update existing subscriber
          subscriber = await prisma.emailSubscriber.update({
            where: { email },
            data: {
              ...(firstName && { firstName }),
              ...(lastName && { lastName }),
              ...(tags && { tags }),
              ...(customFields && { customFields })
            }
          });
          results.updated++;
        } else {
          // Create new subscriber
          subscriber = await prisma.emailSubscriber.create({
            data: {
              email,
              firstName: firstName || null,
              lastName: lastName || null,
              tags: tags || [],
              source,
              customFields: customFields || null
            }
          });
          results.created++;
        }

        // Add to list if specified
        if (listId) {
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
        }
      } catch (error: any) {
        results.skipped++;
        results.errors.push(error.message);
      }
    }

    // Update list subscriber count if list specified
    if (listId) {
      const count = await prisma.emailListSubscriber.count({
        where: { listId }
      });
      await prisma.emailList.update({
        where: { id: listId },
        data: { subscriberCount: count }
      });
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error('[API] Error importing subscribers:', error);
    return NextResponse.json(
      { error: 'Failed to import subscribers' },
      { status: 500 }
    );
  }
}
