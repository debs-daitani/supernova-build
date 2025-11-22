import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { generateSubdomain } from '@/lib/utils'

// POST /api/websites/[id]/duplicate - Duplicate a website
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const original = await db.website.findUnique({
      where: { id: params.id },
      include: {
        pages: true,
      },
    })

    if (!original) {
      return NextResponse.json(
        { error: 'Website not found' },
        { status: 404 }
      )
    }

    // Generate new subdomain
    const subdomain = `${original.subdomain}-copy`
    const domain = `${subdomain}.${process.env.NEXT_PUBLIC_SITE_DOMAIN}`

    // Create duplicate website
    const duplicate = await db.website.create({
      data: {
        userId: original.userId,
        name: `${original.name} (Copy)`,
        domain,
        subdomain,
        theme: original.theme,
        favicon: original.favicon,
        logo: original.logo,
        seoTitle: original.seoTitle,
        seoDescription: original.seoDescription,
        seoKeywords: original.seoKeywords,
        analyticsCode: original.analyticsCode,
        customCSS: original.customCSS,
        customJS: original.customJS,
        robotsTxt: original.robotsTxt,
        isPublished: false,
      },
    })

    // Duplicate pages
    for (const page of original.pages) {
      await db.websitePage.create({
        data: {
          websiteId: duplicate.id,
          title: page.title,
          slug: page.slug,
          content: page.content,
          isHomepage: page.isHomepage,
          order: page.order,
          seoTitle: page.seoTitle,
          seoDescription: page.seoDescription,
          seoImage: page.seoImage,
          isPublished: false,
        },
      })
    }

    return NextResponse.json(duplicate, { status: 201 })
  } catch (error) {
    console.error('Error duplicating website:', error)
    return NextResponse.json(
      { error: 'Failed to duplicate website' },
      { status: 500 }
    )
  }
}
