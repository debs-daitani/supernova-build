import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/email/subscribers/import
 * Import subscribers from CSV data
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subscribers, source = 'import' } = body;

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
        const { email, name, tags } = sub;

        if (!email || !email.includes('@')) {
          results.skipped++;
          results.errors.push(`Invalid email: ${email}`);
          continue;
        }

        // Check if subscriber exists
        const existing = await prisma.emailSubscriber.findUnique({
          where: { email }
        });

        if (existing) {
          // Update existing subscriber
          await prisma.emailSubscriber.update({
            where: { email },
            data: {
              ...(name && { name }),
              ...(tags && { tags }),
            }
          });
          results.updated++;
        } else {
          // Create new subscriber
          await prisma.emailSubscriber.create({
            data: {
              email,
              name: name || null,
              tags: tags || [],
              source,
              status: 'active',
            }
          });
          results.created++;
        }
      } catch (error: any) {
        results.skipped++;
        results.errors.push(error.message);
      }
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
