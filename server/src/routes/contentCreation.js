const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');
const Anthropic = require('@anthropic-ai/sdk');

const prisma = new PrismaClient();
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// ============================================================================
// DESIGN TEMPLATES
// ============================================================================

// Get all templates
router.get('/templates', authMiddleware, async (req, res) => {
  try {
    const { category, platform, featured } = req.query;

    const where = {};
    if (category) where.category = category;
    if (platform) where.platform = platform;
    if (featured === 'true') where.featured = true;

    const templates = await prisma.designTemplate.findMany({
      where,
      orderBy: [
        { featured: 'desc' },
        { usageCount: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    res.json(templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

// Get single template
router.get('/templates/:id', authMiddleware, async (req, res) => {
  try {
    const template = await prisma.designTemplate.findUnique({
      where: { id: req.params.id },
    });

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    // Increment usage count
    await prisma.designTemplate.update({
      where: { id: req.params.id },
      data: { usageCount: { increment: 1 } },
    });

    res.json(template);
  } catch (error) {
    console.error('Error fetching template:', error);
    res.status(500).json({ error: 'Failed to fetch template' });
  }
});

// ============================================================================
// SAVED DESIGNS
// ============================================================================

// Create/save design
router.post('/designs', authMiddleware, async (req, res) => {
  try {
    const { name, category, width, height, designData, thumbnail } = req.body;

    const design = await prisma.savedDesign.create({
      data: {
        userId: req.user.id,
        name,
        category,
        width,
        height,
        designData,
        thumbnail,
      },
    });

    res.json(design);
  } catch (error) {
    console.error('Error creating design:', error);
    res.status(500).json({ error: 'Failed to create design' });
  }
});

// Get user's designs
router.get('/designs', authMiddleware, async (req, res) => {
  try {
    const { category } = req.query;

    const where = {
      userId: req.user.id,
    };

    if (category) where.category = category;

    const designs = await prisma.savedDesign.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
    });

    res.json(designs);
  } catch (error) {
    console.error('Error fetching designs:', error);
    res.status(500).json({ error: 'Failed to fetch designs' });
  }
});

// Get single design
router.get('/designs/:id', authMiddleware, async (req, res) => {
  try {
    const design = await prisma.savedDesign.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!design) {
      return res.status(404).json({ error: 'Design not found' });
    }

    res.json(design);
  } catch (error) {
    console.error('Error fetching design:', error);
    res.status(500).json({ error: 'Failed to fetch design' });
  }
});

// Update design
router.patch('/designs/:id', authMiddleware, async (req, res) => {
  try {
    const design = await prisma.savedDesign.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!design) {
      return res.status(404).json({ error: 'Design not found' });
    }

    const { name, designData, thumbnail } = req.body;

    const updated = await prisma.savedDesign.update({
      where: { id: req.params.id },
      data: {
        name,
        designData,
        thumbnail,
        updatedAt: new Date(),
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('Error updating design:', error);
    res.status(500).json({ error: 'Failed to update design' });
  }
});

// Delete design
router.delete('/designs/:id', authMiddleware, async (req, res) => {
  try {
    const design = await prisma.savedDesign.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!design) {
      return res.status(404).json({ error: 'Design not found' });
    }

    await prisma.savedDesign.delete({
      where: { id: req.params.id },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting design:', error);
    res.status(500).json({ error: 'Failed to delete design' });
  }
});

// ============================================================================
// CONTENT POSTS
// ============================================================================

// Create post
router.post('/posts', authMiddleware, async (req, res) => {
  try {
    const {
      caption,
      mediaUrls,
      platforms,
      scheduledFor,
      hashtags,
      designId,
      status,
    } = req.body;

    const post = await prisma.contentPost.create({
      data: {
        userId: req.user.id,
        caption,
        mediaUrls: mediaUrls || [],
        platforms: platforms || [],
        scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
        hashtags: hashtags || [],
        designId,
        status: status || 'draft',
      },
    });

    res.json(post);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// Get all posts
router.get('/posts', authMiddleware, async (req, res) => {
  try {
    const { status, platform, startDate, endDate } = req.query;

    const where = {
      userId: req.user.id,
    };

    if (status) where.status = status;
    if (platform) where.platforms = { has: platform };

    if (startDate || endDate) {
      where.scheduledFor = {};
      if (startDate) where.scheduledFor.gte = new Date(startDate);
      if (endDate) where.scheduledFor.lte = new Date(endDate);
    }

    const posts = await prisma.contentPost.findMany({
      where,
      orderBy: [
        { scheduledFor: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    res.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// Get single post
router.get('/posts/:id', authMiddleware, async (req, res) => {
  try {
    const post = await prisma.contentPost.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json(post);
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

// Update post
router.patch('/posts/:id', authMiddleware, async (req, res) => {
  try {
    const post = await prisma.contentPost.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const {
      caption,
      mediaUrls,
      platforms,
      scheduledFor,
      hashtags,
      status,
      likes,
      comments,
      shares,
      reach,
    } = req.body;

    const updated = await prisma.contentPost.update({
      where: { id: req.params.id },
      data: {
        caption,
        mediaUrls,
        platforms,
        scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined,
        hashtags,
        status,
        likes,
        comments,
        shares,
        reach,
        updatedAt: new Date(),
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ error: 'Failed to update post' });
  }
});

// Schedule post
router.post('/posts/:id/schedule', authMiddleware, async (req, res) => {
  try {
    const { scheduledFor } = req.body;

    const post = await prisma.contentPost.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const updated = await prisma.contentPost.update({
      where: { id: req.params.id },
      data: {
        scheduledFor: new Date(scheduledFor),
        status: 'scheduled',
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('Error scheduling post:', error);
    res.status(500).json({ error: 'Failed to schedule post' });
  }
});

// Publish post immediately
router.post('/posts/:id/publish', authMiddleware, async (req, res) => {
  try {
    const post = await prisma.contentPost.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // TODO: Implement actual social media API publishing here
    // For now, just mark as published

    const updated = await prisma.contentPost.update({
      where: { id: req.params.id },
      data: {
        publishedAt: new Date(),
        status: 'published',
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('Error publishing post:', error);
    res.status(500).json({ error: 'Failed to publish post' });
  }
});

// Delete post
router.delete('/posts/:id', authMiddleware, async (req, res) => {
  try {
    const post = await prisma.contentPost.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    await prisma.contentPost.delete({
      where: { id: req.params.id },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

// Duplicate post
router.post('/posts/:id/duplicate', authMiddleware, async (req, res) => {
  try {
    const post = await prisma.contentPost.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const duplicate = await prisma.contentPost.create({
      data: {
        userId: req.user.id,
        caption: post.caption,
        mediaUrls: post.mediaUrls,
        platforms: post.platforms,
        hashtags: post.hashtags,
        designId: post.designId,
        status: 'draft',
      },
    });

    res.json(duplicate);
  } catch (error) {
    console.error('Error duplicating post:', error);
    res.status(500).json({ error: 'Failed to duplicate post' });
  }
});

// ============================================================================
// CONTENT IDEAS
// ============================================================================

// Create idea
router.post('/ideas', authMiddleware, async (req, res) => {
  try {
    const { title, description, category, status } = req.body;

    const idea = await prisma.contentIdea.create({
      data: {
        userId: req.user.id,
        title,
        description,
        category,
        status: status || 'idea',
      },
    });

    res.json(idea);
  } catch (error) {
    console.error('Error creating idea:', error);
    res.status(500).json({ error: 'Failed to create idea' });
  }
});

// Get all ideas
router.get('/ideas', authMiddleware, async (req, res) => {
  try {
    const { status, category } = req.query;

    const where = {
      userId: req.user.id,
    };

    if (status) where.status = status;
    if (category) where.category = category;

    const ideas = await prisma.contentIdea.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    res.json(ideas);
  } catch (error) {
    console.error('Error fetching ideas:', error);
    res.status(500).json({ error: 'Failed to fetch ideas' });
  }
});

// Update idea
router.patch('/ideas/:id', authMiddleware, async (req, res) => {
  try {
    const idea = await prisma.contentIdea.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!idea) {
      return res.status(404).json({ error: 'Idea not found' });
    }

    const { title, description, category, status, contentPostId } = req.body;

    const updated = await prisma.contentIdea.update({
      where: { id: req.params.id },
      data: {
        title,
        description,
        category,
        status,
        contentPostId,
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('Error updating idea:', error);
    res.status(500).json({ error: 'Failed to update idea' });
  }
});

// Delete idea
router.delete('/ideas/:id', authMiddleware, async (req, res) => {
  try {
    const idea = await prisma.contentIdea.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!idea) {
      return res.status(404).json({ error: 'Idea not found' });
    }

    await prisma.contentIdea.delete({
      where: { id: req.params.id },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting idea:', error);
    res.status(500).json({ error: 'Failed to delete idea' });
  }
});

// ============================================================================
// BRAND ASSETS
// ============================================================================

// Add brand asset
router.post('/brand-assets', authMiddleware, async (req, res) => {
  try {
    const { assetType, name, value, category, tags } = req.body;

    const asset = await prisma.brandAsset.create({
      data: {
        userId: req.user.id,
        assetType,
        name,
        value,
        category,
        tags: tags || [],
      },
    });

    res.json(asset);
  } catch (error) {
    console.error('Error creating brand asset:', error);
    res.status(500).json({ error: 'Failed to create brand asset' });
  }
});

// Get all brand assets
router.get('/brand-assets', authMiddleware, async (req, res) => {
  try {
    const { assetType, category } = req.query;

    const where = {
      userId: req.user.id,
    };

    if (assetType) where.assetType = assetType;
    if (category) where.category = category;

    const assets = await prisma.brandAsset.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    res.json(assets);
  } catch (error) {
    console.error('Error fetching brand assets:', error);
    res.status(500).json({ error: 'Failed to fetch brand assets' });
  }
});

// Update brand asset
router.patch('/brand-assets/:id', authMiddleware, async (req, res) => {
  try {
    const asset = await prisma.brandAsset.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!asset) {
      return res.status(404).json({ error: 'Brand asset not found' });
    }

    const { name, value, category, tags } = req.body;

    const updated = await prisma.brandAsset.update({
      where: { id: req.params.id },
      data: {
        name,
        value,
        category,
        tags,
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('Error updating brand asset:', error);
    res.status(500).json({ error: 'Failed to update brand asset' });
  }
});

// Delete brand asset
router.delete('/brand-assets/:id', authMiddleware, async (req, res) => {
  try {
    const asset = await prisma.brandAsset.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!asset) {
      return res.status(404).json({ error: 'Brand asset not found' });
    }

    await prisma.brandAsset.delete({
      where: { id: req.params.id },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting brand asset:', error);
    res.status(500).json({ error: 'Failed to delete brand asset' });
  }
});

// ============================================================================
// AI TOOLS
// ============================================================================

// Generate caption
router.post('/generate-caption', authMiddleware, async (req, res) => {
  try {
    const {
      topic,
      tone,
      callToAction,
      includeEmojis,
      length,
      platform,
    } = req.body;

    const toneDescriptions = {
      professional: 'professional and polished',
      casual: 'casual and friendly',
      funny: 'humorous and entertaining',
      inspirational: 'motivational and uplifting',
    };

    const lengthDescriptions = {
      short: '1-2 sentences (under 100 characters)',
      medium: '3-5 sentences (100-200 characters)',
      long: '6+ sentences (200-300 characters)',
    };

    const prompt = `Generate 3 social media caption variations for ${platform || 'social media'}.

Topic: ${topic}
Tone: ${toneDescriptions[tone] || 'engaging and authentic'}
Length: ${lengthDescriptions[length] || 'medium length'}
Call-to-action: ${callToAction || 'engage with the post'}
Include emojis: ${includeEmojis ? 'Yes' : 'No'}

Requirements:
- Write in a ${toneDescriptions[tone] || 'engaging'} tone
- Keep it ${lengthDescriptions[length] || 'medium length'}
- End with a clear call-to-action: "${callToAction}"
${includeEmojis ? '- Use relevant emojis naturally throughout' : '- Do not use emojis'}
- Make each variation unique in approach
- Ensure captions are compelling and likely to drive engagement

Return ONLY the 3 captions, numbered 1-3, with no additional explanation.`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: prompt,
      }],
    });

    const captionsText = message.content[0].text;
    const captions = captionsText
      .split(/\n\d+[.)]\s*/)
      .filter(c => c.trim())
      .map(c => c.trim());

    res.json({ captions });
  } catch (error) {
    console.error('Error generating caption:', error);
    res.status(500).json({ error: 'Failed to generate caption' });
  }
});

// Generate hashtags
router.post('/generate-hashtags', authMiddleware, async (req, res) => {
  try {
    const { topic, platform, mix } = req.body;

    const mixDescriptions = {
      popular: 'mostly popular hashtags with high usage (100k+ posts)',
      niche: 'mostly niche hashtags with moderate usage (10k-100k posts)',
      branded: 'mix of branded, niche, and some popular hashtags',
    };

    const prompt = `Generate 25-30 relevant hashtags for a ${platform || 'social media'} post.

Topic: ${topic}
Mix strategy: ${mixDescriptions[mix] || 'balanced mix of popular and niche'}

Requirements:
- Generate ${mix === 'popular' ? 'mostly popular hashtags (100k+ posts)' : mix === 'niche' ? 'mostly niche hashtags (10k-100k posts)' : 'a balanced mix'}
- Include 2-3 very specific niche hashtags
- Include 1-2 branded/unique hashtags
- Make hashtags relevant and likely to reach the target audience
- Use a mix of broad and specific hashtags
- Don't use banned or spammy hashtags

Return ONLY the hashtags separated by spaces, with # symbol, no additional text or explanation.`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 512,
      messages: [{
        role: 'user',
        content: prompt,
      }],
    });

    const hashtagsText = message.content[0].text.trim();
    const hashtags = hashtagsText
      .split(/\s+/)
      .filter(h => h.startsWith('#'))
      .slice(0, 30);

    res.json({ hashtags });
  } catch (error) {
    console.error('Error generating hashtags:', error);
    res.status(500).json({ error: 'Failed to generate hashtags' });
  }
});

// Generate content ideas
router.post('/generate-ideas', authMiddleware, async (req, res) => {
  try {
    const { niche, contentGoal, audience } = req.body;

    const prompt = `Generate 10 unique content ideas for ${niche || 'a content creator'}.

Content Goal: ${contentGoal || 'engage and grow audience'}
Target Audience: ${audience || 'general audience'}

Requirements:
- Generate 10 diverse content ideas
- Mix different content types (educational, entertaining, promotional, inspirational)
- Make ideas specific and actionable
- Ensure ideas align with the content goal
- Consider trending topics and evergreen content
- Make ideas suitable for social media

Format each idea as:
[Category] Title - Brief description (1 sentence)

Example:
[Educational] 5 Common Mistakes in Time Management - Quick tips to avoid productivity killers

Return ONLY the 10 ideas in this format, no additional text.`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: prompt,
      }],
    });

    const ideasText = message.content[0].text.trim();
    const ideas = ideasText
      .split('\n')
      .filter(line => line.trim() && line.includes(']'))
      .map(line => {
        const match = line.match(/\[([^\]]+)\]\s*([^-]+)\s*-\s*(.+)/);
        if (match) {
          return {
            category: match[1].trim().toLowerCase(),
            title: match[2].trim(),
            description: match[3].trim(),
          };
        }
        return null;
      })
      .filter(idea => idea !== null)
      .slice(0, 10);

    res.json({ ideas });
  } catch (error) {
    console.error('Error generating ideas:', error);
    res.status(500).json({ error: 'Failed to generate ideas' });
  }
});

// ============================================================================
// STATS
// ============================================================================

// Get content stats
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const [
      totalPosts,
      scheduledPosts,
      publishedPosts,
      totalDesigns,
      totalIdeas,
      totalBrandAssets,
    ] = await Promise.all([
      prisma.contentPost.count({
        where: { userId: req.user.id },
      }),
      prisma.contentPost.count({
        where: { userId: req.user.id, status: 'scheduled' },
      }),
      prisma.contentPost.count({
        where: { userId: req.user.id, status: 'published' },
      }),
      prisma.savedDesign.count({
        where: { userId: req.user.id },
      }),
      prisma.contentIdea.count({
        where: { userId: req.user.id },
      }),
      prisma.brandAsset.count({
        where: { userId: req.user.id },
      }),
    ]);

    // Get next scheduled post
    const nextScheduled = await prisma.contentPost.findFirst({
      where: {
        userId: req.user.id,
        status: 'scheduled',
        scheduledFor: {
          gte: new Date(),
        },
      },
      orderBy: { scheduledFor: 'asc' },
    });

    // Get performance stats for published posts
    const performanceStats = await prisma.contentPost.aggregate({
      where: {
        userId: req.user.id,
        status: 'published',
        likes: { not: null },
      },
      _avg: {
        likes: true,
        comments: true,
        shares: true,
        reach: true,
      },
      _sum: {
        likes: true,
        comments: true,
        shares: true,
        reach: true,
      },
    });

    res.json({
      posts: {
        total: totalPosts,
        scheduled: scheduledPosts,
        published: publishedPosts,
        draft: totalPosts - scheduledPosts - publishedPosts,
      },
      designs: totalDesigns,
      ideas: totalIdeas,
      brandAssets: totalBrandAssets,
      nextScheduled,
      performance: {
        average: {
          likes: Math.round(performanceStats._avg.likes || 0),
          comments: Math.round(performanceStats._avg.comments || 0),
          shares: Math.round(performanceStats._avg.shares || 0),
          reach: Math.round(performanceStats._avg.reach || 0),
        },
        total: {
          likes: performanceStats._sum.likes || 0,
          comments: performanceStats._sum.comments || 0,
          shares: performanceStats._sum.shares || 0,
          reach: performanceStats._sum.reach || 0,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

module.exports = router;
