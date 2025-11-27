import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const sequences = await prisma.emailSequence.findMany({
      include: {
        emails: {
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(sequences);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch sequences' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, triggerType, triggerValue, emails } = body;

    const sequence = await prisma.emailSequence.create({
      data: {
        name,
        description,
        triggerType: triggerType || 'MANUAL',
        triggerValue,
        emails: emails ? {
          create: emails.map((email: any, index: number) => ({
            order: index,
            delayDays: email.delayDays || 0,
            delayHours: email.delayHours || 0,
            subject: email.subject,
            previewText: email.previewText,
            htmlContent: email.htmlContent,
            textContent: email.textContent,
            fromName: email.fromName || 'dAItaniverse',
            fromEmail: email.fromEmail || 'hello@daitaniverse.com'
          }))
        } : undefined
      },
      include: { emails: true }
    });

    return NextResponse.json(sequence, { status: 201 });
  } catch (error) {
    console.error('[API] Error creating sequence:', error);
    return NextResponse.json({ error: 'Failed to create sequence' }, { status: 500 });
  }
}
