// Forum configuration and constants

export const FORUM_CATEGORIES = [
  {
    name: 'Getting Started',
    slug: 'getting-started',
    description: 'New to dAItaniverse? Start here!',
    icon: 'Rocket',
    color: '#3B82F6',
    order: 1,
  },
  {
    name: 'Business Building',
    slug: 'business-building',
    description: 'Strategy, marketing, branding, and sales for midlife entrepreneurs',
    icon: 'Briefcase',
    color: '#8B5CF6',
    order: 2,
  },
  {
    name: 'Neurodivergent Entrepreneurs',
    slug: 'neurodivergent-entrepreneurs',
    description: 'ADHD-friendly systems, energy management, and sensory strategies',
    icon: 'Brain',
    color: '#EC4899',
    order: 3,
  },
  {
    name: 'Wins & Celebrations',
    slug: 'wins-celebrations',
    description: 'Share your wins, success stories, and milestones!',
    icon: 'Trophy',
    color: '#10B981',
    order: 4,
  },
  {
    name: 'Tools & Resources',
    slug: 'tools-resources',
    description: 'Favorite tools, templates, and resources',
    icon: 'Wrench',
    color: '#F59E0B',
    order: 5,
  },
  {
    name: 'Off-Topic',
    slug: 'off-topic',
    description: 'Random chat, hobbies, and self-care',
    icon: 'Coffee',
    color: '#6B7280',
    order: 6,
  },
]

export const REACTION_TYPES = {
  HELPFUL: {
    emoji: '👍',
    label: 'Helpful',
    points: 5,
  },
  LOVE: {
    emoji: '❤️',
    label: 'Love',
    points: 2,
  },
  CELEBRATE: {
    emoji: '🎉',
    label: 'Celebrate',
    points: 3,
  },
  SPARK: {
    emoji: '✨',
    label: 'Spark',
    points: 3,
  },
  ROCKSTAR: {
    emoji: '💎',
    label: 'Rockstar',
    points: 5,
  },
}

export const REPUTATION_LEVELS = {
  NEWBIE: {
    min: 0,
    max: 50,
    label: 'Newbie',
    icon: 'Sprout',
    color: '#94A3B8',
  },
  CONTRIBUTOR: {
    min: 51,
    max: 200,
    label: 'Contributor',
    icon: 'User',
    color: '#3B82F6',
  },
  EXPERT: {
    min: 201,
    max: 500,
    label: 'Expert',
    icon: 'Star',
    color: '#8B5CF6',
  },
  ROCKSTAR: {
    min: 501,
    max: Infinity,
    label: 'Rockstar',
    icon: 'Crown',
    color: '#EC4899',
  },
}

export const BADGES = [
  {
    id: 'first-post',
    name: 'First Post',
    description: 'Made your first post in the community',
    icon: 'MessageSquare',
    color: '#3B82F6',
    criteria: { postsCount: 1 },
  },
  {
    id: 'conversation-starter',
    name: 'Conversation Starter',
    description: 'Created 10 threads',
    icon: 'MessageCircle',
    color: '#8B5CF6',
    criteria: { threadsCount: 10 },
  },
  {
    id: 'helpful-helper',
    name: 'Helpful Helper',
    description: 'Received 50 helpful reactions',
    icon: 'ThumbsUp',
    color: '#10B981',
    criteria: { helpfulCount: 50 },
  },
  {
    id: 'thread-champion',
    name: 'Thread Champion',
    description: 'Created a thread with 100+ replies',
    icon: 'Award',
    color: '#F59E0B',
    criteria: { threadReplies: 100 },
  },
  {
    id: 'community-builder',
    name: 'Community Builder',
    description: 'Reached 500+ reputation points',
    icon: 'Users',
    color: '#EC4899',
    criteria: { points: 500 },
  },
  {
    id: 'early-adopter',
    name: 'Early Adopter',
    description: 'Joined in the first month',
    icon: 'Zap',
    color: '#6366F1',
    criteria: { joinedBefore: '2025-02-01' },
  },
  {
    id: 'rockstar',
    name: 'Rockstar',
    description: 'Reached 1000+ reputation points',
    icon: 'Crown',
    color: '#EC4899',
    criteria: { points: 1000 },
  },
  {
    id: 'super-supporter',
    name: 'Super Supporter',
    description: 'Received 100+ helpful reactions',
    icon: 'Heart',
    color: '#EF4444',
    criteria: { helpfulCount: 100 },
  },
]

export const REPORT_REASONS = [
  { value: 'SPAM', label: 'Spam' },
  { value: 'INAPPROPRIATE', label: 'Inappropriate Content' },
  { value: 'OFF_TOPIC', label: 'Off-Topic' },
  { value: 'HARASSMENT', label: 'Harassment' },
]

export const POINTS_SYSTEM = {
  CREATE_THREAD: 5,
  POST_REPLY: 2,
  RECEIVE_HELPFUL: 5,
  THREAD_PINNED: 50,
  THREAD_FEATURED: 25,
}

export const RATE_LIMITS = {
  THREADS_PER_HOUR: 5,
  POSTS_PER_HOUR: 20,
  REACTIONS_PER_HOUR: 100,
}

export const PAGINATION = {
  THREADS_PER_PAGE: 20,
  POSTS_PER_PAGE: 20,
  SEARCH_RESULTS_PER_PAGE: 15,
}
