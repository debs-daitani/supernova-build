import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import PublicLandingPage from './PublicLandingPage'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params

  const page = await prisma.landingPage.findUnique({
    where: { slug }
  })

  if (!page) {
    return { title: 'Page Not Found' }
  }

  const settings = page.settings as any

  return {
    title: settings?.seoTitle || page.title,
    description: settings?.seoDescription || `${page.title} - dAItaniverse`,
  }
}

export default async function LandingPageRoute({ params }: PageProps) {
  const { slug } = await params

  const page = await prisma.landingPage.findUnique({
    where: { slug }
  })

  if (!page || page.status !== 'published') {
    notFound()
  }

  // Increment view count
  await prisma.landingPage.update({
    where: { id: page.id },
    data: { views: { increment: 1 } }
  })

  return <PublicLandingPage page={page} />
}
