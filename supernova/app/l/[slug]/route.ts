import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type RouteContext = {
  params: Promise<{ slug: string }>
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params

    const link = await prisma.shortLink.findUnique({
      where: { slug }
    })

    if (!link) {
      // Redirect to home if link not found
      return NextResponse.redirect(new URL('/', request.url))
    }

    // Increment click count
    await prisma.shortLink.update({
      where: { id: link.id },
      data: { clicks: { increment: 1 } }
    })

    // Redirect to destination
    return NextResponse.redirect(link.destinationUrl)
  } catch (error) {
    console.error('Error redirecting:', error)
    return NextResponse.redirect(new URL('/', request.url))
  }
}
