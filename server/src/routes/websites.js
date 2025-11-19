import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// ============================================
// WEBSITE MANAGEMENT
// ============================================

// Get all user's websites
router.get('/', authMiddleware, async (req, res) => {
  try {
    const websites = await prisma.website.findMany({
      where: { userId: req.user.id },
      include: {
        _count: {
          select: { pages: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(websites);
  } catch (error) {
    console.error('Error fetching websites:', error);
    res.status(500).json({ error: 'Failed to fetch websites' });
  }
});

// Get specific website
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const website = await prisma.website.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      },
      include: {
        pages: {
          orderBy: { order: 'asc' }
        }
      }
    });

    if (!website) {
      return res.status(404).json({ error: 'Website not found' });
    }

    res.json(website);
  } catch (error) {
    console.error('Error fetching website:', error);
    res.status(500).json({ error: 'Failed to fetch website' });
  }
});

// Create new website
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, templateId } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Website name is required' });
    }

    // Generate subdomain from username + random string
    const subdomain = `${req.user.email.split('@')[0]}-${Math.random().toString(36).substr(2, 6)}`.toLowerCase();

    let templateData = null;

    // If template selected, fetch it
    if (templateId) {
      templateData = await prisma.websiteTemplate.findUnique({
        where: { id: templateId }
      });

      if (templateData) {
        // Increment usage count
        await prisma.websiteTemplate.update({
          where: { id: templateId },
          data: { usageCount: { increment: 1 } }
        });
      }
    }

    // Create website
    const website = await prisma.website.create({
      data: {
        userId: req.user.id,
        name,
        subdomain,
        template: templateId,
        theme: templateData?.theme || {
          colors: {
            primary: '#FF1493',
            secondary: '#9333EA',
            background: '#FFFFFF',
            text: '#1F2937'
          },
          fonts: {
            heading: 'Inter',
            body: 'Inter'
          }
        }
      }
    });

    // Create pages from template or default homepage
    if (templateData && templateData.pages) {
      const templatePages = templateData.pages;

      for (const page of templatePages.pages || []) {
        await prisma.websitePage.create({
          data: {
            websiteId: website.id,
            title: page.title,
            slug: page.slug,
            pageType: page.pageType || 'custom',
            content: page.content || { blocks: [] },
            order: page.order || 0
          }
        });
      }
    } else {
      // Create default homepage
      await prisma.websitePage.create({
        data: {
          websiteId: website.id,
          title: 'Home',
          slug: 'home',
          pageType: 'home',
          content: {
            blocks: [
              {
                id: 'hero',
                type: 'section',
                props: {
                  backgroundColor: '#FF1493',
                  padding: '80px 20px',
                  textAlign: 'center'
                },
                children: [
                  {
                    id: 'heading',
                    type: 'heading',
                    props: {
                      text: 'Welcome to ' + name,
                      level: 'h1',
                      color: '#FFFFFF',
                      fontSize: '48px'
                    }
                  },
                  {
                    id: 'subheading',
                    type: 'paragraph',
                    props: {
                      text: 'Start building your amazing website',
                      color: '#FFFFFF',
                      fontSize: '20px'
                    }
                  }
                ]
              }
            ]
          },
          order: 0
        }
      });
    }

    res.status(201).json(website);
  } catch (error) {
    console.error('Error creating website:', error);
    res.status(500).json({ error: 'Failed to create website' });
  }
});

// Update website
router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    const { name, title, description, favicon, logo, theme, seoTitle, seoDescription, seoKeywords, googleAnalyticsId, settings } = req.body;

    // Verify ownership
    const existing = await prisma.website.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Website not found' });
    }

    const website = await prisma.website.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(favicon !== undefined && { favicon }),
        ...(logo !== undefined && { logo }),
        ...(theme && { theme }),
        ...(seoTitle !== undefined && { seoTitle }),
        ...(seoDescription !== undefined && { seoDescription }),
        ...(seoKeywords && { seoKeywords }),
        ...(googleAnalyticsId !== undefined && { googleAnalyticsId }),
        ...(settings && { settings })
      }
    });

    res.json(website);
  } catch (error) {
    console.error('Error updating website:', error);
    res.status(500).json({ error: 'Failed to update website' });
  }
});

// Publish/unpublish website
router.post('/:id/publish', authMiddleware, async (req, res) => {
  try {
    const { publish } = req.body; // true or false

    const existing = await prisma.website.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Website not found' });
    }

    const website = await prisma.website.update({
      where: { id: req.params.id },
      data: {
        published: publish,
        ...(publish && { publishedAt: new Date() })
      }
    });

    res.json(website);
  } catch (error) {
    console.error('Error publishing website:', error);
    res.status(500).json({ error: 'Failed to publish website' });
  }
});

// Delete website
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const existing = await prisma.website.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Website not found' });
    }

    await prisma.website.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Website deleted successfully' });
  } catch (error) {
    console.error('Error deleting website:', error);
    res.status(500).json({ error: 'Failed to delete website' });
  }
});

// ============================================
// PAGE MANAGEMENT
// ============================================

// Get all pages for a website
router.get('/:id/pages', authMiddleware, async (req, res) => {
  try {
    const website = await prisma.website.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!website) {
      return res.status(404).json({ error: 'Website not found' });
    }

    const pages = await prisma.websitePage.findMany({
      where: { websiteId: req.params.id },
      orderBy: { order: 'asc' }
    });

    res.json(pages);
  } catch (error) {
    console.error('Error fetching pages:', error);
    res.status(500).json({ error: 'Failed to fetch pages' });
  }
});

// Create new page
router.post('/:id/pages', authMiddleware, async (req, res) => {
  try {
    const { title, slug, pageType, content } = req.body;

    const website = await prisma.website.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!website) {
      return res.status(404).json({ error: 'Website not found' });
    }

    if (!title || !slug) {
      return res.status(400).json({ error: 'Title and slug are required' });
    }

    // Get max order
    const maxOrder = await prisma.websitePage.findFirst({
      where: { websiteId: req.params.id },
      orderBy: { order: 'desc' }
    });

    const page = await prisma.websitePage.create({
      data: {
        websiteId: req.params.id,
        title,
        slug,
        pageType: pageType || 'custom',
        content: content || { blocks: [] },
        order: (maxOrder?.order || 0) + 1
      }
    });

    res.status(201).json(page);
  } catch (error) {
    console.error('Error creating page:', error);
    res.status(500).json({ error: 'Failed to create page' });
  }
});

// Update page
router.patch('/:id/pages/:pageId', authMiddleware, async (req, res) => {
  try {
    const { title, slug, pageType, content, seoTitle, seoDescription, published } = req.body;

    const website = await prisma.website.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!website) {
      return res.status(404).json({ error: 'Website not found' });
    }

    const page = await prisma.websitePage.update({
      where: { id: req.params.pageId },
      data: {
        ...(title && { title }),
        ...(slug && { slug }),
        ...(pageType && { pageType }),
        ...(content && { content }),
        ...(seoTitle !== undefined && { seoTitle }),
        ...(seoDescription !== undefined && { seoDescription }),
        ...(published !== undefined && { published })
      }
    });

    res.json(page);
  } catch (error) {
    console.error('Error updating page:', error);
    res.status(500).json({ error: 'Failed to update page' });
  }
});

// Delete page
router.delete('/:id/pages/:pageId', authMiddleware, async (req, res) => {
  try {
    const website = await prisma.website.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!website) {
      return res.status(404).json({ error: 'Website not found' });
    }

    await prisma.websitePage.delete({
      where: { id: req.params.pageId }
    });

    res.json({ message: 'Page deleted successfully' });
  } catch (error) {
    console.error('Error deleting page:', error);
    res.status(500).json({ error: 'Failed to delete page' });
  }
});

// ============================================
// TEMPLATES
// ============================================

// Get all templates
router.get('/templates/all', async (req, res) => {
  try {
    const templates = await prisma.websiteTemplate.findMany({
      orderBy: [
        { featured: 'desc' },
        { usageCount: 'desc' }
      ]
    });

    res.json(templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

// Get template by ID
router.get('/templates/:templateId', async (req, res) => {
  try {
    const template = await prisma.websiteTemplate.findUnique({
      where: { id: req.params.templateId }
    });

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    res.json(template);
  } catch (error) {
    console.error('Error fetching template:', error);
    res.status(500).json({ error: 'Failed to fetch template' });
  }
});

export default router;
