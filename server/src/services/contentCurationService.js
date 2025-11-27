import prisma from '../config/database.js';

/**
 * Search content library based on user query and preferences
 */
export const searchContent = async ({ query, pillar, contentType, accessLevel, tags, limit = 10 }) => {
  const where = {};

  // Filter by pillar
  if (pillar && pillar !== 'GENERAL') {
    where.pillar = pillar;
  }

  // Filter by content type
  if (contentType) {
    where.contentType = contentType;
  }

  // Filter by access level (user can access their level and below)
  if (accessLevel) {
    const accessHierarchy = { FREE: 0, UPGRADE: 1, MEMBER: 2 };
    const userLevel = accessHierarchy[accessLevel];

    where.accessLevel = {
      in: Object.keys(accessHierarchy).filter(level => accessHierarchy[level] <= userLevel),
    };
  }

  // Search by tags or text query
  if (query || tags) {
    const searchTerms = query?.toLowerCase().split(' ') || [];
    const allTerms = tags ? [...searchTerms, ...tags] : searchTerms;

    where.OR = [
      {
        title: {
          contains: query,
          mode: 'insensitive',
        },
      },
      {
        description: {
          contains: query,
          mode: 'insensitive',
        },
      },
      {
        tags: {
          hasSome: allTerms,
        },
      },
    ];
  }

  const content = await prisma.content.findMany({
    where,
    orderBy: { orderIndex: 'asc' },
    take: limit,
  });

  return content;
};

/**
 * Curate a learning program based on user query
 */
export const curateProgram = async (userQuery, userLevel, pillar) => {
  // Extract keywords from query
  const keywords = userQuery
    .toLowerCase()
    .split(' ')
    .filter(word => word.length > 3);

  // Search for relevant content
  const content = await searchContent({
    query: userQuery,
    pillar,
    accessLevel: userLevel,
    limit: 20,
  });

  // Group content by tags and relevance
  const grouped = content.reduce((acc, item) => {
    const relevanceScore = calculateRelevance(item, keywords);
    item.relevanceScore = relevanceScore;

    if (relevanceScore > 0) {
      acc.push(item);
    }

    return acc;
  }, []);

  // Sort by relevance and order index
  grouped.sort((a, b) => {
    if (a.relevanceScore !== b.relevanceScore) {
      return b.relevanceScore - a.relevanceScore;
    }
    return a.orderIndex - b.orderIndex;
  });

  // Take top results and organize into a program
  const program = grouped.slice(0, 10);

  return {
    title: generateProgramTitle(userQuery),
    description: `A curated learning path based on your interest in ${userQuery}`,
    modules: program.map((item, index) => ({
      order: index + 1,
      ...item,
    })),
  };
};

/**
 * Calculate relevance score for content item
 */
const calculateRelevance = (content, keywords) => {
  let score = 0;

  const titleLower = content.title.toLowerCase();
  const descriptionLower = content.description.toLowerCase();
  const tagsLower = content.tags.map(t => t.toLowerCase());

  keywords.forEach(keyword => {
    // Title match = 3 points
    if (titleLower.includes(keyword)) score += 3;

    // Description match = 2 points
    if (descriptionLower.includes(keyword)) score += 2;

    // Tag match = 5 points
    if (tagsLower.some(tag => tag.includes(keyword))) score += 5;
  });

  return score;
};

/**
 * Generate program title from query
 */
const generateProgramTitle = (query) => {
  // Capitalize first letter of each word
  return query
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ') + ' Bootcamp';
};

/**
 * Get content recommendations based on user progress
 */
export const getRecommendations = async (userId, limit = 5) => {
  // Get user's completed content
  const completed = await prisma.contentProgress.findMany({
    where: { userId, completed: true },
    include: { content: true },
  });

  // Get user's account type
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { accountType: true },
  });

  // Find content they haven't seen yet
  const completedIds = completed.map(c => c.contentId);

  // Get similar content based on pillars and tags they've engaged with
  const pillars = [...new Set(completed.map(c => c.content.pillar))];
  const tags = [...new Set(completed.flatMap(c => c.content.tags))];

  const recommendations = await searchContent({
    pillar: pillars[0], // Focus on their most common pillar
    tags: tags.slice(0, 5),
    accessLevel: user.accountType,
    limit,
  });

  // Filter out already completed
  return recommendations.filter(r => !completedIds.includes(r.id));
};

/**
 * Track content progress
 */
export const trackProgress = async (userId, contentId, progress, completed = false) => {
  return await prisma.contentProgress.upsert({
    where: {
      userId_contentId: { userId, contentId },
    },
    update: {
      progress,
      completed,
      updatedAt: new Date(),
    },
    create: {
      userId,
      contentId,
      progress,
      completed,
    },
  });
};

export default {
  searchContent,
  curateProgram,
  getRecommendations,
  trackProgress,
};
