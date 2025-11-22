import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { generateSubdomain } from '@/lib/utils'

// GET /api/websites - List all websites for a user
export async function GET(request: NextRequest) {
  try {
    // TODO: Get userId from session - for now using hardcoded value
    const userId = 'user_1' // Replace with actual auth

    const websites = await db.website.findMany({
      where: { userId },
      include: {
        pages: {
          select: {
            id: true,
            title: true,
            slug: true,
            isHomepage: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    })

    return NextResponse.json(websites)
  } catch (error) {
    console.error('Error fetching websites:', error)
    return NextResponse.json(
      { error: 'Failed to fetch websites' },
      { status: 500 }
    )
  }
}

// POST /api/websites - Create a new website
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, templateId, username } = body

    // TODO: Get userId from session
    const userId = 'user_1'

    // Generate subdomain from username or name
    const subdomain = generateSubdomain(username || name)
    const domain = `${subdomain}.${process.env.NEXT_PUBLIC_SITE_DOMAIN}`

    // Check if subdomain already exists
    const existing = await db.website.findFirst({
      where: { subdomain },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Subdomain already taken' },
        { status: 400 }
      )
    }

    // If templateId provided, clone template
    let websiteData: any = {
      userId,
      name,
      domain,
      subdomain,
    }

    if (templateId) {
      const template = await db.websiteTemplate.findUnique({
        where: { id: templateId },
      })

      if (template) {
        websiteData.theme = template.theme
      }
    }

    // Create website
    const website = await db.website.create({
      data: websiteData,
    })

    // Create initial homepage if template provided
    if (templateId) {
      const template = await db.websiteTemplate.findUnique({
        where: { id: templateId },
      })

      if (template && template.pages) {
        const pages = template.pages as any[]

        for (let i = 0; i < pages.length; i++) {
          const pageData = pages[i]
          await db.websitePage.create({
            data: {
              websiteId: website.id,
              title: pageData.title,
              slug: pageData.slug,
              content: pageData.content || [],
              isHomepage: i === 0,
              order: i,
              seoTitle: pageData.seoTitle,
              seoDescription: pageData.seoDescription,
            },
          })
        }
      }
    } else {
      // Create blank homepage
      await db.websitePage.create({
        data: {
          websiteId: website.id,
          title: 'Home',
          slug: 'home',
          content: [],
          isHomepage: true,
          order: 0,
        },
      })
    }

    return NextResponse.json(website, { status: 201 })
  } catch (error) {
    console.error('Error creating website:', error)
    return NextResponse.json(
      { error: 'Failed to create website' },
      { status: 500 }
    )
  }
}
