import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// ============================================================================
// IMAGE EDITOR PROJECTS
// ============================================================================

// Create new project
router.post('/projects', authenticate, async (req, res) => {
  try {
    const {
      name,
      width = 1920,
      height = 1080,
      projectData = {},
    } = req.body;

    const project = await prisma.imageProject.create({
      data: {
        userId: req.user.id,
        name,
        width,
        height,
        projectData,
      },
    });

    res.json(project);
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// Get all user projects
router.get('/projects', authenticate, async (req, res) => {
  try {
    const projects = await prisma.imageProject.findMany({
      where: { userId: req.user.id },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        name: true,
        width: true,
        height: true,
        thumbnail: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json(projects);
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Get single project
router.get('/projects/:id', authenticate, async (req, res) => {
  try {
    const project = await prisma.imageProject.findUnique({
      where: { id: req.params.id },
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (project.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    res.json(project);
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// Update project
router.patch('/projects/:id', authenticate, async (req, res) => {
  try {
    const { name, projectData, thumbnail } = req.body;

    const existing = await prisma.imageProject.findUnique({
      where: { id: req.params.id },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (existing.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const project = await prisma.imageProject.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(projectData && { projectData }),
        ...(thumbnail !== undefined && { thumbnail }),
      },
    });

    res.json(project);
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// Delete project
router.delete('/projects/:id', authenticate, async (req, res) => {
  try {
    const project = await prisma.imageProject.findUnique({
      where: { id: req.params.id },
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (project.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await prisma.imageProject.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

// Duplicate project
router.post('/projects/:id/duplicate', authenticate, async (req, res) => {
  try {
    const original = await prisma.imageProject.findUnique({
      where: { id: req.params.id },
    });

    if (!original) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (original.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const duplicate = await prisma.imageProject.create({
      data: {
        userId: req.user.id,
        name: `${original.name} (Copy)`,
        width: original.width,
        height: original.height,
        projectData: original.projectData,
        thumbnail: original.thumbnail,
      },
    });

    res.json(duplicate);
  } catch (error) {
    console.error('Duplicate project error:', error);
    res.status(500).json({ error: 'Failed to duplicate project' });
  }
});

// ============================================================================
// EXPORT
// ============================================================================

// Export image
router.post('/export', authenticate, async (req, res) => {
  try {
    const {
      projectId,
      format = 'png',
      quality = 90,
      width,
      height,
      dataUrl, // Base64 data URL of the canvas
    } = req.body;

    // In a real implementation, this would:
    // 1. Take the canvas data URL
    // 2. Convert to desired format
    // 3. Resize if needed
    // 4. Upload to cloud storage (S3, Cloudinary, etc.)
    // 5. Return the URL

    // For now, we'll just save the export URL to the project
    if (projectId) {
      await prisma.imageProject.update({
        where: { id: projectId },
        data: { lastExport: dataUrl },
      });
    }

    // Return the data URL (in production, this would be a cloud URL)
    res.json({
      url: dataUrl,
      format,
      width,
      height,
    });
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Failed to export image' });
  }
});

// ============================================================================
// AI TOOLS
// ============================================================================

// Remove background
router.post('/remove-bg', authenticate, async (req, res) => {
  try {
    const { imageUrl } = req.body;

    // In a real implementation, this would integrate with:
    // - Remove.bg API
    // - Cloudinary AI background removal
    // - Or a custom AI model

    // For now, return a mock response
    res.json({
      success: true,
      resultUrl: imageUrl, // Would be the processed image
      message: 'Background removal API integration required',
    });
  } catch (error) {
    console.error('Remove background error:', error);
    res.status(500).json({ error: 'Failed to remove background' });
  }
});

// Remove object
router.post('/remove-object', authenticate, async (req, res) => {
  try {
    const { imageUrl, maskData } = req.body;

    // In a real implementation, this would use:
    // - Cloudinary AI generative fill
    // - Or Stability AI inpainting
    // - Or custom AI model

    res.json({
      success: true,
      resultUrl: imageUrl, // Would be the processed image
      message: 'Object removal API integration required',
    });
  } catch (error) {
    console.error('Remove object error:', error);
    res.status(500).json({ error: 'Failed to remove object' });
  }
});

// Upscale image
router.post('/upscale', authenticate, async (req, res) => {
  try {
    const { imageUrl, scale = 2 } = req.body;

    // In a real implementation, this would use:
    // - Real-ESRGAN API
    // - Cloudinary AI upscale
    // - Or Replicate.com models

    res.json({
      success: true,
      resultUrl: imageUrl, // Would be the upscaled image
      scale,
      message: 'Upscale API integration required',
    });
  } catch (error) {
    console.error('Upscale error:', error);
    res.status(500).json({ error: 'Failed to upscale image' });
  }
});

// Auto enhance
router.post('/enhance', authenticate, async (req, res) => {
  try {
    const { imageUrl } = req.body;

    // In a real implementation, this would use:
    // - Cloudinary auto-enhance
    // - Or custom AI analysis

    res.json({
      success: true,
      resultUrl: imageUrl,
      adjustments: {
        brightness: 0,
        contrast: 0,
        saturation: 0,
        // AI-determined adjustments
      },
      message: 'Auto-enhance API integration required',
    });
  } catch (error) {
    console.error('Auto enhance error:', error);
    res.status(500).json({ error: 'Failed to enhance image' });
  }
});

// Colorize black & white
router.post('/colorize', authenticate, async (req, res) => {
  try {
    const { imageUrl } = req.body;

    // In a real implementation, this would use:
    // - DeOldify
    // - Replicate.com colorization models

    res.json({
      success: true,
      resultUrl: imageUrl,
      message: 'Colorization API integration required',
    });
  } catch (error) {
    console.error('Colorize error:', error);
    res.status(500).json({ error: 'Failed to colorize image' });
  }
});

// ============================================================================
// ASSETS
// ============================================================================

// Upload asset
router.post('/assets', authenticate, async (req, res) => {
  try {
    const {
      name,
      assetType,
      fileUrl,
      fileSize,
      width,
      height,
      format,
    } = req.body;

    const asset = await prisma.imageAsset.create({
      data: {
        userId: req.user.id,
        name,
        assetType,
        fileUrl,
        fileSize,
        width,
        height,
        format,
      },
    });

    res.json(asset);
  } catch (error) {
    console.error('Upload asset error:', error);
    res.status(500).json({ error: 'Failed to upload asset' });
  }
});

// Get user assets
router.get('/assets', authenticate, async (req, res) => {
  try {
    const { assetType } = req.query;

    const where = {
      userId: req.user.id,
      ...(assetType && { assetType }),
    };

    const assets = await prisma.imageAsset.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    res.json(assets);
  } catch (error) {
    console.error('Get assets error:', error);
    res.status(500).json({ error: 'Failed to fetch assets' });
  }
});

// Delete asset
router.delete('/assets/:id', authenticate, async (req, res) => {
  try {
    const asset = await prisma.imageAsset.findUnique({
      where: { id: req.params.id },
    });

    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    if (asset.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await prisma.imageAsset.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Asset deleted successfully' });
  } catch (error) {
    console.error('Delete asset error:', error);
    res.status(500).json({ error: 'Failed to delete asset' });
  }
});

// Increment asset usage
router.post('/assets/:id/use', authenticate, async (req, res) => {
  try {
    const asset = await prisma.imageAsset.findUnique({
      where: { id: req.params.id },
    });

    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    if (asset.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const updated = await prisma.imageAsset.update({
      where: { id: req.params.id },
      data: {
        usageCount: { increment: 1 },
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('Increment usage error:', error);
    res.status(500).json({ error: 'Failed to update asset' });
  }
});

export default router;
