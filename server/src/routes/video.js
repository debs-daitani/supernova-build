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
// VIDEO SCRIPTS
// ============================================================================

// Generate video script with AI
router.post('/scripts/generate', authMiddleware, async (req, res) => {
  try {
    const {
      title,
      topic,
      duration,
      tone,
      keyPoints,
      callToAction,
      targetAudience,
      templateType,
    } = req.body;

    const toneDescriptions = {
      professional: 'professional and authoritative',
      casual: 'casual and conversational',
      educational: 'educational and informative',
      entertaining: 'entertaining and engaging',
      inspirational: 'motivational and inspirational',
    };

    const durationText = duration
      ? `Target duration: ${duration} seconds (approximately ${Math.floor(duration / 60)} minutes)`
      : 'Medium length video';

    const templateStructures = {
      tutorial: 'Hook → Problem Statement → Solution Steps (numbered) → Recap → Call-to-Action',
      product: 'Hook → Problem → Product Introduction → Key Features → Benefits → Call-to-Action',
      educational: 'Hook → Context/Background → Main Points (3-5) → Summary → Call-to-Action',
      listicle: 'Hook → Introduction → Item 1 → Item 2 → Item 3... → Recap → Call-to-Action',
      testimonial: 'Hook → Problem → Journey → Solution → Results → Call-to-Action',
    };

    const prompt = `Generate a complete video script for ${title || topic}.

Video Details:
- Topic: ${topic}
- ${durationText}
- Tone: ${toneDescriptions[tone] || 'engaging and authentic'}
- Target Audience: ${targetAudience || 'general audience'}
${templateType ? `- Structure: ${templateStructures[templateType]}` : ''}
${keyPoints?.length > 0 ? `- Key Points to Cover:\n${keyPoints.map((p, i) => `  ${i + 1}. ${p}`).join('\n')}` : ''}
- Call-to-Action: ${callToAction || 'like, subscribe, and comment'}

Requirements:
1. Start with a STRONG HOOK (first 5-10 seconds that grabs attention)
2. Include clear sections with timestamps
3. Write in a ${toneDescriptions[tone] || 'engaging'} tone
4. Make it conversational and natural to read aloud
5. Include [B-roll suggestions] where relevant
6. Add **pauses** for emphasis where needed
7. Include smooth transitions between sections
8. End with a strong call-to-action
9. Provide 3 alternative opening hooks

Format:
=== HOOKS (choose one) ===
1. [First hook]
2. [Second hook]
3. [Third hook]

=== SCRIPT ===
[00:00-00:10] HOOK
[Script text with [B-roll] notes and **pauses**]

[00:10-00:30] INTRODUCTION
[Script text]

[Continue with sections and timestamps]

=== CALL-TO-ACTIONS (choose one) ===
1. [First CTA]
2. [Second CTA]
3. [Third CTA]

Generate the complete script now.`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      messages: [{
        role: 'user',
        content: prompt,
      }],
    });

    const fullText = message.content[0].text;

    // Parse hooks
    const hooksMatch = fullText.match(/=== HOOKS[\s\S]*?===/);
    const hooksText = hooksMatch ? hooksMatch[0] : '';
    const hooks = hooksText
      .split('\n')
      .filter(line => /^\d+\./.test(line.trim()))
      .map(line => line.replace(/^\d+\.\s*/, '').trim())
      .filter(h => h);

    // Parse CTAs
    const ctasMatch = fullText.match(/=== CALL-TO-ACTIONS[\s\S]*$/);
    const ctasText = ctasMatch ? ctasMatch[0] : '';
    const ctas = ctasText
      .split('\n')
      .filter(line => /^\d+\./.test(line.trim()))
      .map(line => line.replace(/^\d+\.\s*/, '').trim())
      .filter(c => c);

    // Extract main script
    const scriptMatch = fullText.match(/=== SCRIPT ===([\s\S]*?)(===|$)/);
    const script = scriptMatch ? scriptMatch[1].trim() : fullText;

    // Parse sections with timestamps
    const sections = [];
    const sectionMatches = script.match(/\[[\d:]+\-[\d:]+\]\s*[A-Z\s]+/g) || [];
    sectionMatches.forEach((match, index) => {
      const timestampMatch = match.match(/\[([\d:]+)\-([\d:]+)\]/);
      const titleMatch = match.match(/\]\s*(.+)$/);
      if (timestampMatch && titleMatch) {
        sections.push({
          start: timestampMatch[1],
          end: timestampMatch[2],
          title: titleMatch[1].trim(),
          order: index,
        });
      }
    });

    // Save script to database
    const videoScript = await prisma.videoScript.create({
      data: {
        userId: req.user.id,
        title: title || topic,
        topic,
        duration,
        tone,
        script,
        hooks: hooks.length > 0 ? hooks : ['Generated hook 1', 'Generated hook 2', 'Generated hook 3'],
        ctas: ctas.length > 0 ? ctas : ['Generated CTA 1', 'Generated CTA 2', 'Generated CTA 3'],
        sections: sections.length > 0 ? sections : null,
      },
    });

    res.json(videoScript);
  } catch (error) {
    console.error('Error generating script:', error);
    res.status(500).json({ error: 'Failed to generate script' });
  }
});

// Get all user's scripts
router.get('/scripts', authMiddleware, async (req, res) => {
  try {
    const scripts = await prisma.videoScript.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });

    res.json(scripts);
  } catch (error) {
    console.error('Error fetching scripts:', error);
    res.status(500).json({ error: 'Failed to fetch scripts' });
  }
});

// Get single script
router.get('/scripts/:id', authMiddleware, async (req, res) => {
  try {
    const script = await prisma.videoScript.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!script) {
      return res.status(404).json({ error: 'Script not found' });
    }

    res.json(script);
  } catch (error) {
    console.error('Error fetching script:', error);
    res.status(500).json({ error: 'Failed to fetch script' });
  }
});

// Update script
router.patch('/scripts/:id', authMiddleware, async (req, res) => {
  try {
    const script = await prisma.videoScript.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!script) {
      return res.status(404).json({ error: 'Script not found' });
    }

    const { title, script: scriptText, sections, videoId } = req.body;

    const updated = await prisma.videoScript.update({
      where: { id: req.params.id },
      data: {
        title,
        script: scriptText,
        sections,
        videoId,
        updatedAt: new Date(),
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('Error updating script:', error);
    res.status(500).json({ error: 'Failed to update script' });
  }
});

// Delete script
router.delete('/scripts/:id', authMiddleware, async (req, res) => {
  try {
    const script = await prisma.videoScript.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!script) {
      return res.status(404).json({ error: 'Script not found' });
    }

    await prisma.videoScript.delete({
      where: { id: req.params.id },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting script:', error);
    res.status(500).json({ error: 'Failed to delete script' });
  }
});

// ============================================================================
// VIDEOS
// ============================================================================

// Create video record
router.post('/videos', authMiddleware, async (req, res) => {
  try {
    const {
      title,
      description,
      videoUrl,
      thumbnailUrl,
      duration,
      fileSize,
    } = req.body;

    const video = await prisma.video.create({
      data: {
        userId: req.user.id,
        title,
        description,
        videoUrl,
        thumbnailUrl,
        duration,
        fileSize,
        status: 'ready',
        tags: [],
      },
    });

    res.json(video);
  } catch (error) {
    console.error('Error creating video:', error);
    res.status(500).json({ error: 'Failed to create video' });
  }
});

// Get all user's videos
router.get('/videos', authMiddleware, async (req, res) => {
  try {
    const { status } = req.query;

    const where = {
      userId: req.user.id,
    };

    if (status) where.status = status;

    const videos = await prisma.video.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    res.json(videos);
  } catch (error) {
    console.error('Error fetching videos:', error);
    res.status(500).json({ error: 'Failed to fetch videos' });
  }
});

// Get single video
router.get('/videos/:id', authMiddleware, async (req, res) => {
  try {
    const video = await prisma.video.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    res.json(video);
  } catch (error) {
    console.error('Error fetching video:', error);
    res.status(500).json({ error: 'Failed to fetch video' });
  }
});

// Update video
router.patch('/videos/:id', authMiddleware, async (req, res) => {
  try {
    const video = await prisma.video.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    const {
      title,
      description,
      thumbnailUrl,
      seoTitle,
      seoDescription,
      tags,
      platforms,
      views,
      likes,
      comments,
      shares,
    } = req.body;

    const updated = await prisma.video.update({
      where: { id: req.params.id },
      data: {
        title,
        description,
        thumbnailUrl,
        seoTitle,
        seoDescription,
        tags,
        platforms,
        views,
        likes,
        comments,
        shares,
        updatedAt: new Date(),
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('Error updating video:', error);
    res.status(500).json({ error: 'Failed to update video' });
  }
});

// Delete video
router.delete('/videos/:id', authMiddleware, async (req, res) => {
  try {
    const video = await prisma.video.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    await prisma.video.delete({
      where: { id: req.params.id },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting video:', error);
    res.status(500).json({ error: 'Failed to delete video' });
  }
});

// ============================================================================
// VIDEO SEO
// ============================================================================

// Generate video title suggestions
router.post('/seo/title', authMiddleware, async (req, res) => {
  try {
    const { topic, platform, includeKeywords } = req.body;

    const platformGuidelines = {
      youtube: 'YouTube (60-70 characters, keyword-rich, compelling)',
      tiktok: 'TikTok (short, catchy, with emojis)',
      instagram: 'Instagram Reels (engaging, with hashtags)',
    };

    const prompt = `Generate 5 video title variations for ${platform || 'YouTube'}.

Topic: ${topic}
Platform: ${platformGuidelines[platform] || platformGuidelines.youtube}
${includeKeywords ? `Keywords to include: ${includeKeywords}` : ''}

Requirements:
- Create titles that are click-worthy and SEO-optimized
- Include power words (amazing, ultimate, secret, proven, easy)
- Use numbers when relevant (5 Ways, 3 Steps, 10 Tips)
- Create curiosity/intrigue
- Make them actionable
- Stay within character limits for the platform
- Each title should be unique in approach

Format each as:
1. [Title] - [Why it works]

Generate 5 titles now.`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: prompt,
      }],
    });

    const text = message.content[0].text;
    const titles = text
      .split('\n')
      .filter(line => /^\d+\./.test(line.trim()))
      .map(line => {
        const match = line.match(/^\d+\.\s*([^-]+)(?:\s*-\s*(.+))?$/);
        if (match) {
          return {
            title: match[1].trim(),
            reason: match[2] ? match[2].trim() : '',
          };
        }
        return null;
      })
      .filter(t => t !== null);

    res.json({ titles });
  } catch (error) {
    console.error('Error generating titles:', error);
    res.status(500).json({ error: 'Failed to generate titles' });
  }
});

// Generate video description
router.post('/seo/description', authMiddleware, async (req, res) => {
  try {
    const { topic, keyPoints, links, callToAction, platform } = req.body;

    const prompt = `Generate a comprehensive video description for ${platform || 'YouTube'}.

Topic: ${topic}
${keyPoints?.length > 0 ? `Key Points Covered:\n${keyPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}` : ''}
${callToAction ? `Call-to-Action: ${callToAction}` : ''}
${links ? `Links to Include:\n${Object.entries(links).map(([key, val]) => `${key}: ${val}`).join('\n')}` : ''}

Requirements:
- Start with a compelling summary (first 2-3 lines)
- Include timestamps/chapters if key points provided
- Naturally integrate keywords for SEO
- Include relevant links
- Add a clear call-to-action
- Include social media handles
- Add relevant hashtags at the end

Generate the complete description now.`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2048,
      messages: [{
        role: 'user',
        content: prompt,
      }],
    });

    const description = message.content[0].text.trim();

    res.json({ description });
  } catch (error) {
    console.error('Error generating description:', error);
    res.status(500).json({ error: 'Failed to generate description' });
  }
});

// Generate video tags
router.post('/seo/tags', authMiddleware, async (req, res) => {
  try {
    const { topic, platform, mix } = req.body;

    const mixDescriptions = {
      broad: 'mostly broad, high-volume tags',
      specific: 'mostly specific, niche tags',
      balanced: 'balanced mix of broad and specific tags',
    };

    const prompt = `Generate 25-30 relevant tags for a ${platform || 'YouTube'} video.

Topic: ${topic}
Strategy: ${mixDescriptions[mix] || mixDescriptions.balanced}

Requirements:
- Generate ${mix === 'broad' ? 'mostly broad tags (1M+ searches)' : mix === 'specific' ? 'mostly specific tags (10k-100k searches)' : 'a balanced mix'}
- Include 3-5 very specific long-tail tags
- Include 1-2 branded tags
- Make tags relevant to the video topic
- Consider what users would search for
- Include variations (singular/plural, abbreviations)

Return ONLY the tags separated by commas, no additional text.`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 512,
      messages: [{
        role: 'user',
        content: prompt,
      }],
    });

    const tagsText = message.content[0].text.trim();
    const tags = tagsText
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag)
      .slice(0, 30);

    res.json({ tags });
  } catch (error) {
    console.error('Error generating tags:', error);
    res.status(500).json({ error: 'Failed to generate tags' });
  }
});

// ============================================================================
// VIDEO TEMPLATES
// ============================================================================

// Get all templates
router.get('/templates', authMiddleware, async (req, res) => {
  try {
    const { category } = req.query;

    const where = {};
    if (category) where.category = category;

    const templates = await prisma.videoTemplate.findMany({
      where,
      orderBy: [
        { featured: 'desc' },
        { usageCount: 'desc' },
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
    const template = await prisma.videoTemplate.findUnique({
      where: { id: req.params.id },
    });

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    // Increment usage
    await prisma.videoTemplate.update({
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
// STATS
// ============================================================================

// Get video stats
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const [totalVideos, totalScripts, readyVideos] = await Promise.all([
      prisma.video.count({
        where: { userId: req.user.id },
      }),
      prisma.videoScript.count({
        where: { userId: req.user.id },
      }),
      prisma.video.count({
        where: { userId: req.user.id, status: 'ready' },
      }),
    ]);

    // Get aggregate stats
    const videoStats = await prisma.video.aggregate({
      where: { userId: req.user.id },
      _sum: {
        views: true,
        likes: true,
        comments: true,
        shares: true,
      },
      _avg: {
        views: true,
        likes: true,
        duration: true,
      },
    });

    // Get best performing video
    const bestVideo = await prisma.video.findFirst({
      where: { userId: req.user.id },
      orderBy: { views: 'desc' },
      take: 1,
    });

    res.json({
      videos: {
        total: totalVideos,
        ready: readyVideos,
        processing: totalVideos - readyVideos,
      },
      scripts: totalScripts,
      performance: {
        totalViews: videoStats._sum.views || 0,
        totalLikes: videoStats._sum.likes || 0,
        totalComments: videoStats._sum.comments || 0,
        totalShares: videoStats._sum.shares || 0,
        avgViews: Math.round(videoStats._avg.views || 0),
        avgLikes: Math.round(videoStats._avg.likes || 0),
        avgDuration: Math.round(videoStats._avg.duration || 0),
      },
      bestVideo,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

module.exports = router;
