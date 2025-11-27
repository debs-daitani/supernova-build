import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    const templates = await prisma.emailTemplate.findMany({
      where: category ? { category } : undefined,
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(templates);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, category, htmlContent, thumbnailUrl, variables } = body;

    const template = await prisma.emailTemplate.create({
      data: {
        name,
        category: category || 'general',
        htmlContent,
        thumbnailUrl,
        variables: variables || []
      }
    });

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 });
  }
}
