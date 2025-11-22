// Forum utility functions

import { REPUTATION_LEVELS, BADGES, POINTS_SYSTEM } from './forum-config'

// Generate slug from title
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100)
}

// Add unique suffix if slug exists
export function makeUniqueSlug(baseSlug: string, existingSlugs: string[]): string {
  let slug = baseSlug
  let counter = 1

  while (existingSlugs.includes(slug)) {
    slug = `${baseSlug}-${counter}`
    counter++
  }

  return slug
}

// Calculate reputation level from points
export function getReputationLevel(points: number): {
  level: string
  label: string
  icon: string
  color: string
  nextLevel?: string
  pointsToNext?: number
} {
  let currentLevel = 'NEWBIE'
  let nextLevel: string | undefined
  let pointsToNext: number | undefined

  for (const [level, config] of Object.entries(REPUTATION_LEVELS)) {
    if (points >= config.min && points <= config.max) {
      currentLevel = level

      // Find next level
      const levels = Object.entries(REPUTATION_LEVELS).sort(
        (a, b) => a[1].min - b[1].min
      )
      const currentIndex = levels.findIndex(([l]) => l === level)
      if (currentIndex < levels.length - 1) {
        const next = levels[currentIndex + 1]
        nextLevel = next[0]
        pointsToNext = next[1].min - points
      }

      break
    }
  }

  const config = REPUTATION_LEVELS[currentLevel as keyof typeof REPUTATION_LEVELS]

  return {
    level: currentLevel,
    label: config.label,
    icon: config.icon,
    color: config.color,
    nextLevel,
    pointsToNext,
  }
}

// Check if user earned any badges
export function checkBadgesEarned(userData: {
  postsCount: number
  threadsCount: number
  helpfulCount: number
  points: number
  joinedAt: Date
  currentBadges: string[]
}): string[] {
  const newBadges: string[] = []

  for (const badge of BADGES) {
    // Skip if already has badge
    if (userData.currentBadges.includes(badge.id)) continue

    let earned = false

    if (badge.criteria.postsCount && userData.postsCount >= badge.criteria.postsCount) {
      earned = true
    }

    if (
      badge.criteria.threadsCount &&
      userData.threadsCount >= badge.criteria.threadsCount
    ) {
      earned = true
    }

    if (
      badge.criteria.helpfulCount &&
      userData.helpfulCount >= badge.criteria.helpfulCount
    ) {
      earned = true
    }

    if (badge.criteria.points && userData.points >= badge.criteria.points) {
      earned = true
    }

    if (
      badge.criteria.joinedBefore &&
      userData.joinedAt < new Date(badge.criteria.joinedBefore)
    ) {
      earned = true
    }

    if (earned) {
      newBadges.push(badge.id)
    }
  }

  return newBadges
}

// Calculate points for an action
export function calculatePoints(action: {
  type: 'CREATE_THREAD' | 'POST_REPLY' | 'RECEIVE_HELPFUL' | 'THREAD_PINNED' | 'THREAD_FEATURED'
  count?: number
}): number {
  const basePoints = POINTS_SYSTEM[action.type] || 0
  const count = action.count || 1
  return basePoints * count
}

// Format time ago (e.g., "2 hours ago")
export function formatTimeAgo(date: Date): string {
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`
  if (seconds < 2592000) return `${Math.floor(seconds / 604800)} weeks ago`
  if (seconds < 31536000) return `${Math.floor(seconds / 2592000)} months ago`
  return `${Math.floor(seconds / 31536000)} years ago`
}

// Sanitize HTML (basic - use a library like DOMPurify in production)
export function sanitizeHtml(html: string): string {
  // This is a very basic sanitizer - use DOMPurify or similar in production
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '')
}

// Extract mentions from content (@username)
export function extractMentions(content: string): string[] {
  const mentionRegex = /@(\w+)/g
  const mentions: string[] = []
  let match

  while ((match = mentionRegex.exec(content)) !== null) {
    mentions.push(match[1])
  }

  return [...new Set(mentions)] // Remove duplicates
}

// Check if user can perform action (rate limiting)
export function canPerformAction(
  actionType: 'thread' | 'post' | 'reaction',
  recentActions: Date[],
  limits: { THREADS_PER_HOUR?: number; POSTS_PER_HOUR?: number; REACTIONS_PER_HOUR?: number }
): { allowed: boolean; resetIn?: number } {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
  const recentCount = recentActions.filter((date) => date > oneHourAgo).length

  let limit = 0
  if (actionType === 'thread') limit = limits.THREADS_PER_HOUR || 5
  if (actionType === 'post') limit = limits.POSTS_PER_HOUR || 20
  if (actionType === 'reaction') limit = limits.REACTIONS_PER_HOUR || 100

  if (recentCount >= limit) {
    const oldestAction = recentActions
      .filter((date) => date > oneHourAgo)
      .sort((a, b) => a.getTime() - b.getTime())[0]

    const resetIn = Math.ceil((oldestAction.getTime() + 60 * 60 * 1000 - Date.now()) / 1000)

    return { allowed: false, resetIn }
  }

  return { allowed: true }
}

// Highlight search terms in text
export function highlightSearchTerms(text: string, searchTerm: string): string {
  if (!searchTerm) return text

  const regex = new RegExp(`(${searchTerm})`, 'gi')
  return text.replace(regex, '<mark class="bg-yellow-200">$1</mark>')
}

// Truncate text with ellipsis
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength).trim() + '...'
}

// Strip HTML tags
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '')
}

// Get initials from name
export function getInitials(name: string): string {
  const parts = name.split(' ').filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

// Format number with K/M suffix
export function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}

// Validate thread title
export function validateThreadTitle(title: string): { valid: boolean; error?: string } {
  if (!title || title.trim().length === 0) {
    return { valid: false, error: 'Title is required' }
  }

  if (title.length < 10) {
    return { valid: false, error: 'Title must be at least 10 characters' }
  }

  if (title.length > 200) {
    return { valid: false, error: 'Title must be less than 200 characters' }
  }

  return { valid: true }
}

// Validate post content
export function validatePostContent(content: string): { valid: boolean; error?: string } {
  const plainText = stripHtml(content).trim()

  if (!plainText || plainText.length === 0) {
    return { valid: false, error: 'Content is required' }
  }

  if (plainText.length < 10) {
    return { valid: false, error: 'Content must be at least 10 characters' }
  }

  if (plainText.length > 10000) {
    return { valid: false, error: 'Content must be less than 10,000 characters' }
  }

  return { valid: true }
}

// Check for spam keywords
export function containsSpam(text: string): boolean {
  const spamKeywords = [
    'viagra',
    'cialis',
    'buy now',
    'click here',
    'free money',
    'earn $$$',
    'weight loss',
    'miracle cure',
  ]

  const lowerText = text.toLowerCase()
  return spamKeywords.some((keyword) => lowerText.includes(keyword))
}
