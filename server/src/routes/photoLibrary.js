/**
 * Photo Library Routes
 * API endpoints for photo management and editing (Lightroom alternative)
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
  importPhoto,
  extractExifData,
  applyEdits,
  exportPhoto,
  generateHistogram
} = require('../services/photoService');
const {
  getDefaultEditSettings,
  saveEdit,
  getEditHistory,
  revertToEdit,
  resetToOriginal,
  createPreset,
  getUserPresets,
  applyPreset,
  batchApplyPreset,
  copySettings,
  autoEnhance
} = require('../services/editingEngine');

// Configure multer for photo uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/photos/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit for RAW files
  fileFilter: (req, file, cb) => {
    const allowedExts = [
      '.jpg', '.jpeg', '.png', '.tiff', '.tif', '.webp',
      '.cr2', '.nef', '.arw', '.dng', '.raf', '.orf', '.rw2', '.pef'
    ];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExts.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type. Allowed: ${allowedExts.join(', ')}`));
    }
  }
});

// ============================================================================
// PHOTO MANAGEMENT
// ============================================================================

/**
 * POST /api/photos/import
 * Import photos
 */
router.post('/import', upload.array('photos', 50), async (req, res) => {
  try {
    const userId = req.user.id;
    const files = req.files;
    const { albumId, tags, rating } = req.body;

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No photos uploaded' });
    }

    const imported = [];
    const failed = [];

    for (const file of files) {
      try {
        // Import and process photo
        const result = await importPhoto(file.path, userId, {
          originalName: file.originalname,
          tags: tags ? JSON.parse(tags) : [],
          rating: rating || 0
        });

        if (result.success) {
          // Create database record
          const photo = await req.prisma.photo.create({
            data: {
              ...result.photoData,
              fileUrl: file.path,
              thumbnailUrl: result.thumbnails.medium || null
            }
          });

          // Add to album if specified
          if (albumId) {
            await req.prisma.photoAlbumItem.create({
              data: {
                albumId,
                photoId: photo.id
              }
            });

            // Update album photo count
            await req.prisma.photoAlbum.update({
              where: { id: albumId },
              data: { photoCount: { increment: 1 } }
            });
          }

          imported.push(photo);
        } else {
          failed.push({ filename: file.originalname, error: result.error });
        }
      } catch (error) {
        failed.push({ filename: file.originalname, error: error.message });
      }
    }

    res.json({
      success: true,
      imported: imported.length,
      failed: failed.length,
      photos: imported,
      errors: failed
    });
  } catch (error) {
    console.error('Error importing photos:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/photos
 * List photos with filters
 */
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      albumId,
      rating,
      flagStatus,
      colorLabel,
      camera,
      sortBy = 'captureDate',
      sortOrder = 'desc',
      page = 1,
      limit = 50
    } = req.query;

    const where = { userId };

    if (albumId) {
      where.albumItems = { some: { albumId } };
    }
    if (rating) {
      where.rating = { gte: parseInt(rating) };
    }
    if (flagStatus) {
      where.flagStatus = flagStatus;
    }
    if (colorLabel) {
      where.colorLabel = colorLabel;
    }
    if (camera) {
      where.camera = { contains: camera };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [photos, total] = await Promise.all([
      req.prisma.photo.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: parseInt(limit),
        select: {
          id: true,
          fileName: true,
          thumbnailUrl: true,
          rating: true,
          flagStatus: true,
          colorLabel: true,
          camera: true,
          captureDate: true,
          width: true,
          height: true,
          uploadedAt: true
        }
      }),
      req.prisma.photo.count({ where })
    ]);

    res.json({
      photos,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error listing photos:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/photos/:id
 * Get photo details
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const photo = await req.prisma.photo.findFirst({
      where: { id, userId },
      include: {
        albumItems: {
          include: {
            album: {
              select: { id: true, name: true }
            }
          }
        }
      }
    });

    if (!photo) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    res.json({ photo });
  } catch (error) {
    console.error('Error getting photo:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PATCH /api/photos/:id
 * Update photo metadata
 */
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { title, caption, copyright, tags, gpsLatitude, gpsLongitude } = req.body;

    const photo = await req.prisma.photo.updateMany({
      where: { id, userId },
      data: {
        title,
        caption,
        copyright,
        tags,
        gpsLatitude,
        gpsLongitude
      }
    });

    if (photo.count === 0) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    res.json({ success: true, message: 'Photo updated' });
  } catch (error) {
    console.error('Error updating photo:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PATCH /api/photos/:id/rating
 * Set photo rating
 */
router.patch('/:id/rating', async (req, res) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;
    const userId = req.user.id;

    if (rating < 0 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 0 and 5' });
    }

    await req.prisma.photo.updateMany({
      where: { id, userId },
      data: { rating }
    });

    res.json({ success: true, rating });
  } catch (error) {
    console.error('Error setting rating:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PATCH /api/photos/:id/flag
 * Set photo flag status
 */
router.patch('/:id/flag', async (req, res) => {
  try {
    const { id } = req.params;
    const { flagStatus } = req.body;
    const userId = req.user.id;

    await req.prisma.photo.updateMany({
      where: { id, userId },
      data: { flagStatus }
    });

    res.json({ success: true, flagStatus });
  } catch (error) {
    console.error('Error setting flag:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PATCH /api/photos/:id/color
 * Set photo color label
 */
router.patch('/:id/color', async (req, res) => {
  try {
    const { id } = req.params;
    const { colorLabel } = req.body;
    const userId = req.user.id;

    await req.prisma.photo.updateMany({
      where: { id, userId },
      data: { colorLabel }
    });

    res.json({ success: true, colorLabel });
  } catch (error) {
    console.error('Error setting color:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/photos/:id
 * Delete photo
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await req.prisma.photo.deleteMany({
      where: { id, userId }
    });

    res.json({ success: true, message: 'Photo deleted' });
  } catch (error) {
    console.error('Error deleting photo:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// PHOTO EDITING
// ============================================================================

/**
 * GET /api/photos/:id/edit
 * Get current edit settings
 */
router.get('/:id/edit', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const photo = await req.prisma.photo.findFirst({
      where: { id, userId }
    });

    if (!photo) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    const currentEdit = photo.currentEdit || getDefaultEditSettings();

    res.json({
      photoId: id,
      currentEdit,
      hasEdits: photo.currentEdit !== null
    });
  } catch (error) {
    console.error('Error getting edit:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/photos/:id/edit
 * Save edits to photo
 */
router.post('/:id/edit', async (req, res) => {
  try {
    const { id } = req.params;
    const { settings, presetId } = req.body;
    const userId = req.user.id;

    const photo = await req.prisma.photo.findFirst({
      where: { id, userId }
    });

    if (!photo) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    const result = await saveEdit(id, settings, req.prisma, presetId);

    if (result.success) {
      res.json({
        success: true,
        edit: result.edit
      });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error saving edit:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/photos/:id/history
 * Get edit history
 */
router.get('/:id/history', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await getEditHistory(id, req.prisma);

    if (result.success) {
      res.json({ edits: result.edits });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error getting history:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/photos/:id/revert
 * Revert to previous edit
 */
router.post('/:id/revert', async (req, res) => {
  try {
    const { id } = req.params;
    const { editId } = req.body;

    if (editId) {
      // Revert to specific edit
      const result = await revertToEdit(id, editId, req.prisma);
      if (result.success) {
        res.json({ success: true, edit: result.edit });
      } else {
        res.status(500).json({ error: result.error });
      }
    } else {
      // Reset to original
      const result = await resetToOriginal(id, req.prisma);
      if (result.success) {
        res.json({ success: true, message: 'Reset to original' });
      } else {
        res.status(500).json({ error: result.error });
      }
    }
  } catch (error) {
    console.error('Error reverting:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/photos/:id/auto-enhance
 * Auto-enhance photo
 */
router.post('/:id/auto-enhance', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const photo = await req.prisma.photo.findFirst({
      where: { id, userId }
    });

    if (!photo) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    // Generate histogram
    const histogramResult = await generateHistogram(photo.fileUrl);

    if (!histogramResult.success) {
      return res.status(500).json({ error: 'Failed to analyze photo' });
    }

    // Apply auto-enhance
    const enhancedSettings = autoEnhance(histogramResult.histogram);

    // Save edit
    await saveEdit(id, enhancedSettings, req.prisma);

    res.json({
      success: true,
      settings: enhancedSettings
    });
  } catch (error) {
    console.error('Error auto-enhancing:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/photos/copy-settings
 * Copy settings from one photo to others
 */
router.post('/copy-settings', async (req, res) => {
  try {
    const { sourcePhotoId, targetPhotoIds, settingsToSync } = req.body;

    const result = await copySettings(sourcePhotoId, targetPhotoIds, req.prisma, settingsToSync);

    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error copying settings:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// ALBUMS
// ============================================================================

/**
 * POST /api/albums
 * Create album
 */
router.post('/albums', async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, description, isSmartAlbum, smartCriteria } = req.body;

    const album = await req.prisma.photoAlbum.create({
      data: {
        userId,
        name,
        description,
        isSmartAlbum,
        smartCriteria
      }
    });

    res.json({ success: true, album });
  } catch (error) {
    console.error('Error creating album:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/albums
 * List albums
 */
router.get('/albums', async (req, res) => {
  try {
    const userId = req.user.id;

    const albums = await req.prisma.photoAlbum.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { photos: true }
        }
      }
    });

    res.json({ albums });
  } catch (error) {
    console.error('Error listing albums:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/albums/:id/photos
 * Add photos to album
 */
router.post('/albums/:id/photos', async (req, res) => {
  try {
    const { id } = req.params;
    const { photoIds } = req.body;

    if (!Array.isArray(photoIds)) {
      return res.status(400).json({ error: 'photoIds must be an array' });
    }

    for (const photoId of photoIds) {
      await req.prisma.photoAlbumItem.upsert({
        where: {
          albumId_photoId: {
            albumId: id,
            photoId
          }
        },
        update: {},
        create: {
          albumId: id,
          photoId
        }
      });
    }

    // Update photo count
    const count = await req.prisma.photoAlbumItem.count({
      where: { albumId: id }
    });

    await req.prisma.photoAlbum.update({
      where: { id },
      data: { photoCount: count }
    });

    res.json({ success: true, message: `Added ${photoIds.length} photos to album` });
  } catch (error) {
    console.error('Error adding photos to album:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/albums/:albumId/photos/:photoId
 * Remove photo from album
 */
router.delete('/albums/:albumId/photos/:photoId', async (req, res) => {
  try {
    const { albumId, photoId } = req.params;

    await req.prisma.photoAlbumItem.deleteMany({
      where: { albumId, photoId }
    });

    // Update photo count
    await req.prisma.photoAlbum.update({
      where: { id: albumId },
      data: { photoCount: { decrement: 1 } }
    });

    res.json({ success: true, message: 'Photo removed from album' });
  } catch (error) {
    console.error('Error removing photo from album:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// PRESETS
// ============================================================================

/**
 * POST /api/presets
 * Create preset
 */
router.post('/presets', async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, description, settings, isPublic } = req.body;

    const result = await createPreset(userId, name, description, settings, req.prisma, isPublic);

    if (result.success) {
      res.json({ success: true, preset: result.preset });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error creating preset:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/presets
 * List presets
 */
router.get('/presets', async (req, res) => {
  try {
    const userId = req.user.id;
    const { includePublic = 'true' } = req.query;

    const result = await getUserPresets(userId, req.prisma, includePublic === 'true');

    if (result.success) {
      res.json({ presets: result.presets });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error listing presets:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/presets/:id/apply
 * Apply preset to photo(s)
 */
router.post('/presets/:id/apply', async (req, res) => {
  try {
    const { id } = req.params;
    const { photoIds, merge = false } = req.body;

    if (Array.isArray(photoIds)) {
      // Batch apply
      const result = await batchApplyPreset(photoIds, id, req.prisma);
      res.json(result);
    } else {
      // Single photo
      const result = await applyPreset(photoIds, id, req.prisma, merge);
      if (result.success) {
        res.json(result);
      } else {
        res.status(500).json({ error: result.error });
      }
    }
  } catch (error) {
    console.error('Error applying preset:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/presets/:id
 * Delete preset
 */
router.delete('/presets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await req.prisma.editPreset.deleteMany({
      where: { id, userId }
    });

    res.json({ success: true, message: 'Preset deleted' });
  } catch (error) {
    console.error('Error deleting preset:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// EXPORT
// ============================================================================

/**
 * POST /api/photos/export
 * Export photos with edits applied
 */
router.post('/export', async (req, res) => {
  try {
    const { photoIds, exportOptions } = req.body;

    if (!Array.isArray(photoIds) || photoIds.length === 0) {
      return res.status(400).json({ error: 'photoIds is required' });
    }

    const exported = [];
    const failed = [];

    for (const photoId of photoIds) {
      try {
        const photo = await req.prisma.photo.findUnique({
          where: { id: photoId }
        });

        if (!photo) {
          failed.push({ photoId, error: 'Photo not found' });
          continue;
        }

        // Apply edits if any
        const edits = photo.currentEdit || {};

        // Export photo
        const result = await exportPhoto(photo.fileUrl, edits, exportOptions);

        if (result.success) {
          exported.push({
            photoId,
            filename: photo.fileName,
            path: result.path
          });
        } else {
          failed.push({ photoId, error: result.error });
        }
      } catch (error) {
        failed.push({ photoId, error: error.message });
      }
    }

    res.json({
      success: true,
      exported: exported.length,
      failed: failed.length,
      photos: exported,
      errors: failed
    });
  } catch (error) {
    console.error('Error exporting photos:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
