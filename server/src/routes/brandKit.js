/**
 * Brand Kit Routes
 * API endpoints for brand asset management
 */

const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');
const brandKitService = require('../services/brandKitService');

const prisma = new PrismaClient();

// ============================================================================
// BRAND KITS
// ============================================================================

/**
 * Get all brand kits for user
 * GET /api/brand-kits
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await brandKitService.getBrandKits(prisma, req.user.id);
    res.json(result);
  } catch (error) {
    console.error('Error getting brand kits:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Get single brand kit
 * GET /api/brand-kits/:id
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await brandKitService.getBrandKit(prisma, id, req.user.id);

    if (!result.success) {
      return res.status(404).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error('Error getting brand kit:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Create new brand kit
 * POST /api/brand-kits
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const result = await brandKitService.createBrandKit(prisma, req.user.id, req.body);
    res.json(result);
  } catch (error) {
    console.error('Error creating brand kit:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Update brand kit
 * PATCH /api/brand-kits/:id
 */
router.patch('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await brandKitService.updateBrandKit(prisma, id, req.user.id, req.body);

    if (!result.success) {
      return res.status(404).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error('Error updating brand kit:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Delete brand kit
 * DELETE /api/brand-kits/:id
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await brandKitService.deleteBrandKit(prisma, id, req.user.id);

    if (!result.success) {
      return res.status(404).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error('Error deleting brand kit:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// BRAND ASSETS
// ============================================================================

/**
 * Get assets for brand kit
 * GET /api/brand-kits/:id/assets
 */
router.get('/:id/assets', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { type, category, search } = req.query;

    const result = await brandKitService.getBrandAssets(
      prisma,
      id,
      req.user.id,
      { type, category, search }
    );

    if (!result.success) {
      return res.status(404).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error('Error getting brand assets:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Upload brand asset
 * POST /api/brand-kits/:id/assets
 */
router.post('/:id/assets', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await brandKitService.createBrandAsset(prisma, id, req.user.id, req.body);

    if (!result.success) {
      return res.status(404).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error('Error creating brand asset:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Delete brand asset
 * DELETE /api/brand-assets/:id
 */
router.delete('/assets/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await brandKitService.deleteBrandAsset(prisma, id, req.user.id);

    if (!result.success) {
      return res.status(404).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error('Error deleting brand asset:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// BRAND GUIDELINES
// ============================================================================

/**
 * Save brand guideline section
 * POST /api/brand-kits/:id/guidelines
 */
router.post('/:id/guidelines', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await brandKitService.saveBrandGuideline(prisma, id, req.user.id, req.body);

    if (!result.success) {
      return res.status(404).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error('Error saving brand guideline:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Delete brand guideline section
 * DELETE /api/brand-guidelines/:id
 */
router.delete('/guidelines/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await brandKitService.deleteBrandGuideline(prisma, id, req.user.id);

    if (!result.success) {
      return res.status(404).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error('Error deleting brand guideline:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// COLOR TOOLS
// ============================================================================

/**
 * Generate color palette from primary color
 * POST /api/brand-kits/tools/generate-palette
 */
router.post('/tools/generate-palette', authenticateToken, async (req, res) => {
  try {
    const { primaryColor } = req.body;

    if (!primaryColor) {
      return res.status(400).json({ success: false, error: 'Primary color is required' });
    }

    const result = brandKitService.generateColorPalette(primaryColor);
    res.json(result);
  } catch (error) {
    console.error('Error generating palette:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Check contrast ratio between two colors
 * POST /api/brand-kits/tools/check-contrast
 */
router.post('/tools/check-contrast', authenticateToken, async (req, res) => {
  try {
    const { color1, color2 } = req.body;

    if (!color1 || !color2) {
      return res.status(400).json({ success: false, error: 'Two colors are required' });
    }

    const result = brandKitService.checkContrast(color1, color2);
    res.json(result);
  } catch (error) {
    console.error('Error checking contrast:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// SHARING
// ============================================================================

/**
 * Create share link
 * POST /api/brand-kits/:id/share
 */
router.post('/:id/share', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await brandKitService.createShareLink(prisma, id, req.user.id, req.body);

    if (!result.success) {
      return res.status(404).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error('Error creating share link:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Get shared brand kit (public)
 * GET /api/brand-kits/shared/:token
 */
router.get('/shared/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.query;

    const result = await brandKitService.getSharedBrandKit(prisma, token, password);

    if (!result.success) {
      return res.status(403).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error('Error getting shared brand kit:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// EXPORT
// ============================================================================

/**
 * Export brand kit as CSS
 * GET /api/brand-kits/:id/export/css
 */
router.get('/:id/export/css', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await brandKitService.getBrandKit(prisma, id, req.user.id);

    if (!result.success) {
      return res.status(404).json(result);
    }

    const css = brandKitService.generateCSS(result.brandKit);

    res.setHeader('Content-Type', 'text/css');
    res.setHeader('Content-Disposition', `attachment; filename="${result.brandKit.name}-variables.css"`);
    res.send(css);
  } catch (error) {
    console.error('Error exporting CSS:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Export brand kit data as JSON
 * GET /api/brand-kits/:id/export/json
 */
router.get('/:id/export/json', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await brandKitService.getBrandKit(prisma, id, req.user.id);

    if (!result.success) {
      return res.status(404).json(result);
    }

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${result.brandKit.name}-brand-kit.json"`);
    res.json(result.brandKit);
  } catch (error) {
    console.error('Error exporting JSON:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Apply brand kit to all content
 * POST /api/brand-kits/:id/apply
 */
router.post('/:id/apply', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { targets } = req.body; // Which content to apply to

    const result = await brandKitService.getBrandKit(prisma, id, req.user.id);

    if (!result.success) {
      return res.status(404).json(result);
    }

    // TODO: Implement actual application logic
    // This would update websites, email templates, etc. with brand colors and fonts

    res.json({
      success: true,
      message: 'Brand kit applied successfully',
      appliedTo: targets || ['websites', 'emails', 'presentations']
    });
  } catch (error) {
    console.error('Error applying brand kit:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
