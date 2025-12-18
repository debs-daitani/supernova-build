import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { ExternalLink } from 'lucide-react'

interface PageProps {
  params: Promise<{ username: string }>
}

const THEMES: Record<string, { bg: string; text: string; button: string }> = {
  default: {
    bg: 'bg-gray-900',
    text: 'text-white',
    button: 'bg-white/10 hover:bg-white/20',
  },
  neon: {
    bg: 'bg-black',
    text: 'text-cyan-400',
    button: 'bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50',
  },
  gradient: {
    bg: 'bg-gradient-to-br from-purple-900 via-pink-900 to-orange-900',
    text: 'text-white',
    button: 'bg-white/10 hover:bg-white/20',
  },
  minimal: {
    bg: 'bg-white',
    text: 'text-gray-900',
    button: 'bg-gray-900 text-white hover:bg-gray-800',
  },
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params

  const bio = await prisma.linkInBio.findUnique({
    where: { username }
  })

  if (!bio) {
    return { title: 'Not Found' }
  }

  return {
    title: `${bio.title || username} | dAItaniverse`,
    description: bio.bio || `Check out ${bio.title || username}'s links`,
  }
}

export default async function BioPage({ params }: PageProps) {
  const { username } = await params

  const bio = await prisma.linkInBio.findUnique({
    where: { username }
  })

  if (!bio) {
    notFound()
  }

  const theme = THEMES[bio.theme || 'default'] || THEMES.default
  const links = (bio.links as any[]) || []

  return (
    <div className={`min-h-screen ${theme.bg} py-16 px-4`}>
      <div className="max-w-md mx-auto text-center">
        {/* Avatar */}
        {bio.avatarUrl ? (
          <img
            src={bio.avatarUrl}
            alt={bio.title || ''}
            className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-2 border-white/20"
          />
        ) : (
          <div className={`w-24 h-24 rounded-full mx-auto mb-4 ${theme.button} flex items-center justify-center`}>
            <span className={`text-3xl ${theme.text} opacity-50`}>
              {(bio.title?.[0] || username[0])?.toUpperCase()}
            </span>
          </div>
        )}

        {/* Name */}
        <h1 className={`text-2xl font-supernova ${theme.text} mb-2`}>
          {bio.title || username}
        </h1>

        {/* Bio */}
        {bio.bio && (
          <p className={`font-josefin ${theme.text} opacity-80 mb-8`}>
            {bio.bio}
          </p>
        )}

        {/* Links */}
        <div className="space-y-3">
          {links.map((link: any, index: number) => (
            <a
              key={index}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-josefin transition-all ${theme.button} ${theme.text}`}
            >
              {link.title || 'Untitled Link'}
              <ExternalLink size={16} className="opacity-50" />
            </a>
          ))}
        </div>

        {links.length === 0 && (
          <p className={`font-josefin ${theme.text} opacity-50`}>
            No links yet
          </p>
        )}

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <a
            href="/"
            className={`font-josefin text-sm ${theme.text} opacity-50 hover:opacity-100 transition-opacity`}
          >
            Powered by dAItaniverse
          </a>
        </div>
      </div>
    </div>
  )
}
