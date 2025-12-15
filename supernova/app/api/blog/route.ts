import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth-middleware';

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// GET - List all blog posts (public: published only, admin: all)
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    // Check if user is admin
    let isAdmin = false;
    if (auth.authenticated && auth.userId) {
      const user = await prisma.user.findUnique({
        where: { id: auth.userId },
        select: { role: true },
      });
      isAdmin = user?.role === 'ADMIN';
    }

    // For public requests, only show published posts
    const whereClause = isAdmin && status
      ? { status: status.toUpperCase() as 'DRAFT' | 'PUBLISHED' | 'SCHEDULED' }
      : isAdmin
        ? {}
        : { status: 'PUBLISHED' as const, publishedAt: { lte: new Date() } };

    const posts = await prisma.blogPost.findMany({
      where: whereClause,
      include: {
        author: { select: { id: true, name: true, email: true } },
        categories: true,
        tags: true,
      },
      orderBy: { publishedAt: 'desc' },
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error('[API] Error fetching blog posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog posts' },
      { status: 500 }
    );
  }
}

// POST - Create a new blog post (admin only)
export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);

    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: { role: true },
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      title,
      slug: providedSlug,
      content,
      excerpt,
      featuredImage,
      status = 'DRAFT',
      publishedAt,
      metaTitle,
      metaDescription,
      categoryIds = [],
      tagIds = [],
    } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    // Generate slug if not provided
    let slug = providedSlug || generateSlug(title);

    // Check for duplicate slug and append number if needed
    let slugExists = await prisma.blogPost.findUnique({ where: { slug } });
    let counter = 1;
    const baseSlug = slug;
    while (slugExists) {
      slug = `${baseSlug}-${counter}`;
      slugExists = await prisma.blogPost.findUnique({ where: { slug } });
      counter++;
    }

    const post = await prisma.blogPost.create({
      data: {
        title,
        slug,
        content,
        excerpt,
        featuredImage,
        status: status.toUpperCase(),
        publishedAt: status === 'PUBLISHED' ? (publishedAt ? new Date(publishedAt) : new Date()) : null,
        metaTitle,
        metaDescription,
        authorId: auth.userId,
        categories: categoryIds.length > 0 ? { connect: categoryIds.map((id: string) => ({ id })) } : undefined,
        tags: tagIds.length > 0 ? { connect: tagIds.map((id: string) => ({ id })) } : undefined,
      },
      include: {
        author: { select: { id: true, name: true, email: true } },
        categories: true,
        tags: true,
      },
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error('[API] Error creating blog post:', error);
    return NextResponse.json(
      { error: 'Failed to create blog post' },
      { status: 500 }
    );
  }
}
