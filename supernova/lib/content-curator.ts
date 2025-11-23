/**
 * Content Curator for SUPERNova
 * Intelligently retrieves and curates Album content based on conversation context
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface CuratedContent {
  albumTitle: string
  trackTitle: string
  sections: {
    type: string
    content: string
    estimatedReadTime?: string
  }[]
  relevanceScore: number
}

/**
 * Curate content based on user message and context
 */
export async function curateContent(
  userMessage: string,
  mode: string
): Promise<CuratedContent | null> {
  // Keywords for content matching
  const keywords = extractKeywords(userMessage.toLowerCase())

  // Track 1.1: I WON'T RUN - rebel yell, commitment, purpose, why
  const track11Keywords = [
    'why',
    'purpose',
    'mission',
    'rebel',
    'commitment',
    'stand',
    'fight',
    'yell',
    'backing down',
    'running',
    'scared',
    'afraid',
    'bold',
  ]

  // Track 1.2: DO WHAT YOU WANT - authenticity, playbook, rules, algorithm
  const track12Keywords = [
    'authentic',
    'playbook',
    'rules',
    'algorithm',
    'should',
    'supposed',
    'format',
    'posting',
    'content',
    'schedule',
    'formula',
    'template',
  ]

  // Track 1.3: THESE TIMES ARE CHANGING - timing, opportunity, battle
  const track13Keywords = [
    'timing',
    'when',
    'ready',
    'wait',
    'opportunity',
    'battle',
    'enemy',
    'fight',
    'change',
    'revolution',
    'now',
    'later',
  ]

  // Track 1.4: ONE NIGHT ONLY - positioning, niche, specific, variant
  const track14Keywords = [
    'niche',
    'specific',
    'positioning',
    'known for',
    'remember',
    'stand out',
    'different',
    'unique',
    'variant',
    'outlier',
    'competition',
  ]

  // Calculate relevance scores
  const scores = {
    track11: calculateRelevance(keywords, track11Keywords),
    track12: calculateRelevance(keywords, track12Keywords),
    track13: calculateRelevance(keywords, track13Keywords),
    track14: calculateRelevance(keywords, track14Keywords),
  }

  // Find the most relevant track
  const maxScore = Math.max(...Object.values(scores))

  // If no strong match, return null
  if (maxScore < 2) return null

  // Determine which track to recommend
  let trackOrder: number
  if (scores.track11 === maxScore) trackOrder = 1
  else if (scores.track12 === maxScore) trackOrder = 2
  else if (scores.track13 === maxScore) trackOrder = 3
  else trackOrder = 4

  // Fetch the track and its sections
  const album = await prisma.album.findFirst({
    where: { order: 1 },
    include: {
      tracks: {
        where: { order: trackOrder },
        include: {
          sections: {
            orderBy: { order: 'asc' },
          },
        },
      },
    },
  })

  if (!album || album.tracks.length === 0) return null

  const track = album.tracks[0]

  return {
    albumTitle: album.title,
    trackTitle: track.title,
    sections: track.sections.map((section) => ({
      type: section.sectionType,
      content: section.content,
      estimatedReadTime: section.estimatedReadTime || undefined,
    })),
    relevanceScore: maxScore,
  }
}

/**
 * Get a specific section from a track
 */
export async function getSection(
  albumOrder: number,
  trackOrder: number,
  sectionType: string
) {
  const album = await prisma.album.findFirst({
    where: { order: albumOrder },
    include: {
      tracks: {
        where: { order: trackOrder },
        include: {
          sections: {
            where: { sectionType },
          },
        },
      },
    },
  })

  if (!album || album.tracks.length === 0 || album.tracks[0].sections.length === 0) {
    return null
  }

  return album.tracks[0].sections[0]
}

/**
 * Get the full track with all sections
 */
export async function getFullTrack(albumOrder: number, trackOrder: number) {
  const album = await prisma.album.findFirst({
    where: { order: albumOrder },
    include: {
      tracks: {
        where: { order: trackOrder },
        include: {
          sections: {
            orderBy: { order: 'asc' },
          },
        },
      },
    },
  })

  if (!album || album.tracks.length === 0) return null

  const track = album.tracks[0]

  return {
    albumTitle: album.title,
    trackTitle: track.title,
    subtitle: track.subtitle,
    sections: track.sections,
  }
}

/**
 * List all available albums
 */
export async function listAlbums() {
  return await prisma.album.findMany({
    where: { isPublic: true },
    orderBy: { order: 'asc' },
    include: {
      tracks: {
        orderBy: { order: 'asc' },
        select: {
          title: true,
          subtitle: true,
          order: true,
        },
      },
    },
  })
}

/**
 * Extract keywords from user message
 */
function extractKeywords(text: string): string[] {
  // Remove common words
  const stopWords = new Set([
    'i',
    'me',
    'my',
    'myself',
    'we',
    'our',
    'ours',
    'ourselves',
    'you',
    'your',
    'yours',
    'yourself',
    'yourselves',
    'he',
    'him',
    'his',
    'himself',
    'she',
    'her',
    'hers',
    'herself',
    'it',
    'its',
    'itself',
    'they',
    'them',
    'their',
    'theirs',
    'themselves',
    'what',
    'which',
    'who',
    'whom',
    'this',
    'that',
    'these',
    'those',
    'am',
    'is',
    'are',
    'was',
    'were',
    'be',
    'been',
    'being',
    'have',
    'has',
    'had',
    'having',
    'do',
    'does',
    'did',
    'doing',
    'a',
    'an',
    'the',
    'and',
    'but',
    'if',
    'or',
    'because',
    'as',
    'until',
    'while',
    'of',
    'at',
    'by',
    'for',
    'with',
    'about',
    'against',
    'between',
    'into',
    'through',
    'during',
    'before',
    'after',
    'above',
    'below',
    'to',
    'from',
    'up',
    'down',
    'in',
    'out',
    'on',
    'off',
    'over',
    'under',
    'again',
    'further',
    'then',
    'once',
  ])

  return text
    .toLowerCase()
    .split(/\W+/)
    .filter((word) => word.length > 2 && !stopWords.has(word))
}

/**
 * Calculate relevance score between user keywords and track keywords
 */
function calculateRelevance(userKeywords: string[], trackKeywords: string[]): number {
  let score = 0
  for (const keyword of userKeywords) {
    if (trackKeywords.includes(keyword)) {
      score += 2 // Exact match
    } else {
      // Partial match
      for (const trackKeyword of trackKeywords) {
        if (
          keyword.includes(trackKeyword) ||
          trackKeyword.includes(keyword)
        ) {
          score += 1
          break
        }
      }
    }
  }
  return score
}
