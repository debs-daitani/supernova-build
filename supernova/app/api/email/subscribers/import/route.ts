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
      imported: 0,
      updated: 0,
      skipped: 0,
      errors: [] as string[]
    };

    for (const sub of subscribers) {
      try {
        const { email, firstName, lastName, name, tags } = sub;

        if (!email || !email.includes('@')) {
          results.skipped++;
          results.errors.push(`Invalid email: ${email}`);
          continue;
        }

        // Build the name from firstName/lastName or use provided name
        let fullName = name;
        if (!fullName && (firstName || lastName)) {
          fullName = [firstName, lastName].filter(Boolean).join(' ');
        }

        // Check if subscriber exists
        const existing = await prisma.emailSubscriber.findUnique({
          where: { email: email.toLowerCase().trim() }
        });

        if (existing) {
          // Update existing subscriber
          await prisma.emailSubscriber.update({
            where: { email: email.toLowerCase().trim() },
            data: {
              ...(fullName && { name: fullName }),
              ...(tags && { tags }),
            }
          });
          results.updated++;
        } else {
          // Create new subscriber
          await prisma.emailSubscriber.create({
            data: {
              email: email.toLowerCase().trim(),
              name: fullName || null,
              tags: tags || [],
              source,
              status: 'active',
            }
          });
          results.imported++;
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
