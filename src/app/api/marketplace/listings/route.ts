import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const listingSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  niche: z.string().min(2, 'Niche is required'),
  whatsIncluded: z.array(z.string()),
  whatsNeeded: z.string().optional(),
  progress: z.number().min(0).max(100),
  price: z.number().min(1, 'Price must be at least £1'),
  images: z.array(z.string()).optional(),
  status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
})

// GET - Browse listings (with filters)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const niche = searchParams.get('niche')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const minProgress = searchParams.get('minProgress')
    const maxProgress = searchParams.get('maxProgress')
    const featured = searchParams.get('featured')
    const sort = searchParams.get('sort') || 'newest'

    const listings = await prisma.marketplaceListing.findMany({
      where: {
        status: 'PUBLISHED',
        ...(search && {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        }),
        ...(niche && { niche: { contains: niche, mode: 'insensitive' } }),
        ...(minPrice && { price: { gte: parseFloat(minPrice) } }),
        ...(maxPrice && { price: { lte: parseFloat(maxPrice) } }),
        ...(minProgress && { progress: { gte: parseFloat(minProgress) } }),
        ...(maxProgress && { progress: { lte: parseFloat(maxProgress) } }),
        ...(featured === 'true' && { featured: true }),
      },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            reviews: true,
          },
        },
      },
      orderBy:
        sort === 'price-low'
          ? { price: 'asc' }
          : sort === 'price-high'
          ? { price: 'desc' }
          : sort === 'popular'
          ? { viewsCount: 'desc' }
          : { createdAt: 'desc' },
    })

    return NextResponse.json({ listings })
  } catch (error) {
    console.error('Get listings error:', error)
    return NextResponse.json(
      { error: 'Failed to get listings' },
      { status: 500 }
    )
  }
}

// POST - Create new listing
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = listingSchema.parse(body)

    const listing = await prisma.marketplaceListing.create({
      data: {
        sellerId: session.userId,
        title: validatedData.title,
        description: validatedData.description,
        niche: validatedData.niche,
        whatsIncluded: validatedData.whatsIncluded,
        whatsNeeded: validatedData.whatsNeeded || '',
        progress: validatedData.progress,
        price: validatedData.price,
        images: validatedData.images || [],
        status: validatedData.status || 'DRAFT',
      },
    })

    return NextResponse.json({ listing })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Create listing error:', error)
    return NextResponse.json(
      { error: 'Failed to create listing' },
      { status: 500 }
    )
  }
}
