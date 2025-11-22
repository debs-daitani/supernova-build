import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { generateProductSlug, makeUniqueProductSlug } from '@/lib/shop-utils'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const featured = searchParams.get('featured')
    const sellerId = searchParams.get('sellerId')
    const sort = searchParams.get('sort') || 'recent'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')

    const where: any = { isActive: true }

    if (category) where.category = category
    if (sellerId) where.userId = sellerId
    if (featured === 'true') where.isFeatured = true
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } },
      ]
    }

    let orderBy: any = { createdAt: 'desc' }
    if (sort === 'price-low') orderBy = { price: 'asc' }
    if (sort === 'price-high') orderBy = { price: 'desc' }
    if (sort === 'popular') orderBy = { salesCount: 'desc' }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              profilePhotoUrl: true,
            },
          },
          _count: {
            select: {
              reviews: true,
            },
          },
        },
      }),
      prisma.product.count({ where }),
    ])

    return NextResponse.json({
      products,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = 'user_placeholder' // TODO: Get from auth
    const body = await request.json()

    // Generate unique slug
    const baseSlug = generateProductSlug(body.name)
    const existingSlugs = await prisma.product.findMany({
      where: { slug: { startsWith: baseSlug } },
      select: { slug: true },
    })
    const slug = makeUniqueProductSlug(
      baseSlug,
      existingSlugs.map((p) => p.slug)
    )

    const product = await prisma.product.create({
      data: {
        userId,
        name: body.name,
        slug,
        description: body.description,
        price: body.price,
        currency: body.currency || 'GBP',
        productType: body.productType || 'DIGITAL',
        category: body.category,
        tags: body.tags || [],
        thumbnail: body.thumbnail,
        images: body.images || [],
        downloadUrl: body.downloadUrl,
        fileSize: body.fileSize,
        fileType: body.fileType,
        isActive: body.isActive !== false,
      },
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}
