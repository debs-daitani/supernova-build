import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth-middleware';

// GET - Get single blog post by ID or slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await verifyAuth(request);

    // Check if user is admin
    let isAdmin = false;
    if (auth.authenticated && auth.userId) {
      const user = await prisma.user.findUnique({
        where: { id: auth.userId },
        select: { role: true },
      });
      isAdmin = user?.role === 'ADMIN';
    }

    // Try to find by ID first, then by slug
    let post = await prisma.blogPost.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true, email: true } },
        categories: true,
        tags: true,
      },
    });

    if (!post) {
      // Try by slug
      post = await prisma.blogPost.findUnique({
        where: { slug: id },
        include: {
          author: { select: { id: true, name: true, email: true } },
          categories: true,
          tags: true,
        },
      });
    }

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Non-admins can only see published posts
    if (!isAdmin && (post.status !== 'PUBLISHED' || (post.publishedAt && post.publishedAt > new Date()))) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Increment view count for public views
    if (!isAdmin && post.status === 'PUBLISHED') {
      await prisma.blogPost.update({
        where: { id: post.id },
        data: { viewCount: { increment: 1 } },
      });
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error('[API] Error fetching blog post:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog post' },
      { status: 500 }
    );
  }
}

// PUT - Update blog post (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
      slug,
      content,
      excerpt,
      featuredImage,
      status,
      publishedAt,
      metaTitle,
      metaDescription,
      categoryIds,
      tagIds,
    } = body;

    // Check if post exists
    const existing = await prisma.blogPost.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // If slug changed, check for duplicates
    if (slug && slug !== existing.slug) {
      const slugExists = await prisma.blogPost.findFirst({
        where: { slug, NOT: { id } },
      });
      if (slugExists) {
        return NextResponse.json(
          { error: 'Slug already exists' },
          { status: 400 }
        );
      }
    }

    // Handle publishing
    let finalPublishedAt = existing.publishedAt;
    if (status === 'PUBLISHED' && !existing.publishedAt) {
      finalPublishedAt = publishedAt ? new Date(publishedAt) : new Date();
    } else if (publishedAt) {
      finalPublishedAt = new Date(publishedAt);
    }

    const post = await prisma.blogPost.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(slug && { slug }),
        ...(content !== undefined && { content }),
        ...(excerpt !== undefined && { excerpt }),
        ...(featuredImage !== undefined && { featuredImage }),
        ...(status && { status: status.toUpperCase() }),
        publishedAt: finalPublishedAt,
        ...(metaTitle !== undefined && { metaTitle }),
        ...(metaDescription !== undefined && { metaDescription }),
        ...(categoryIds && {
          categories: {
            set: [],
            connect: categoryIds.map((cid: string) => ({ id: cid })),
          },
        }),
        ...(tagIds && {
          tags: {
            set: [],
            connect: tagIds.map((tid: string) => ({ id: tid })),
          },
        }),
      },
      include: {
        author: { select: { id: true, name: true, email: true } },
        categories: true,
        tags: true,
      },
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error('[API] Error updating blog post:', error);
    return NextResponse.json(
      { error: 'Failed to update blog post' },
      { status: 500 }
    );
  }
}

// DELETE - Delete blog post (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    await prisma.blogPost.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API] Error deleting blog post:', error);
    return NextResponse.json(
      { error: 'Failed to delete blog post' },
      { status: 500 }
    );
  }
}
