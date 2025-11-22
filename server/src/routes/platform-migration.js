/**
 * Platform Migration Routes
 * API endpoints for migrating from other platforms (Wix, Shopify, WordPress, etc.)
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
  createMigrationProject,
  analyzeData,
  getDefaultMapping,
  executeMigration,
  getMigrationProgress,
  getMigrationReport,
  retryFailedItems
} = require('../services/migrationService');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/migration/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.csv', '.json', '.xml', '.zip'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type. Allowed: ${allowedTypes.join(', ')}`));
    }
  }
});

/**
 * POST /api/platform-migration/start
 * Start a new migration project
 */
router.post('/start', async (req, res) => {
  try {
    const { sourcePlatform, projectName } = req.body;
    const userId = req.user.id;

    if (!sourcePlatform) {
      return res.status(400).json({ error: 'Source platform is required' });
    }

    const project = await createMigrationProject(
      userId,
      sourcePlatform,
      projectName,
      req.prisma
    );

    res.json({
      success: true,
      project: {
        id: project.id,
        sourcePlatform: project.sourcePlatform,
        projectName: project.projectName,
        status: project.status,
        currentStep: project.currentStep
      }
    });
  } catch (error) {
    console.error('Error starting migration:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/platform-migration/projects
 * Get user's migration projects
 */
router.get('/projects', async (req, res) => {
  try {
    const userId = req.user.id;

    const projects = await req.prisma.migrationProject.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { migratedItems: true }
        }
      }
    });

    res.json({ projects });
  } catch (error) {
    console.error('Error loading projects:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/platform-migration/:id
 * Get migration project details
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const project = await req.prisma.migrationProject.findFirst({
      where: { id, userId },
      include: {
        migratedItems: {
          orderBy: { createdAt: 'desc' },
          take: 100
        }
      }
    });

    if (!project) {
      return res.status(404).json({ error: 'Migration project not found' });
    }

    res.json({ project });
  } catch (error) {
    console.error('Error loading project:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/platform-migration/:id/connect
 * Connect to platform API
 */
router.post('/:id/connect', async (req, res) => {
  try {
    const { id } = req.params;
    const { apiKey, credentials } = req.body;
    const userId = req.user.id;

    // Verify project ownership
    const project = await req.prisma.migrationProject.findFirst({
      where: { id, userId }
    });

    if (!project) {
      return res.status(404).json({ error: 'Migration project not found' });
    }

    // Update with connection details (should be encrypted in production)
    const updated = await req.prisma.migrationProject.update({
      where: { id },
      data: {
        apiKey,
        credentials,
        status: 'CONNECTING',
        currentStep: 2
      }
    });

    res.json({
      success: true,
      message: 'Connected to platform API',
      project: updated
    });
  } catch (error) {
    console.error('Error connecting to platform:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/platform-migration/:id/upload
 * Upload export files
 */
router.post('/:id/upload', upload.array('files', 10), async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    // Verify project ownership
    const project = await req.prisma.migrationProject.findFirst({
      where: { id, userId }
    });

    if (!project) {
      return res.status(404).json({ error: 'Migration project not found' });
    }

    // Analyze uploaded files
    const analysis = await analyzeData(id, files, req.prisma);

    res.json({
      success: true,
      message: `Analyzed ${files.length} file(s)`,
      analysis,
      files: files.map(f => ({
        originalName: f.originalname,
        size: f.size,
        path: f.path
      }))
    });
  } catch (error) {
    console.error('Error uploading files:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/platform-migration/:id/select-data
 * Select what data types to migrate
 */
router.post('/:id/select-data', async (req, res) => {
  try {
    const { id } = req.params;
    const { dataToMigrate } = req.body;
    const userId = req.user.id;

    if (!Array.isArray(dataToMigrate) || dataToMigrate.length === 0) {
      return res.status(400).json({ error: 'dataToMigrate must be a non-empty array' });
    }

    // Verify project ownership
    const project = await req.prisma.migrationProject.findFirst({
      where: { id, userId }
    });

    if (!project) {
      return res.status(404).json({ error: 'Migration project not found' });
    }

    // Update data selection
    const updated = await req.prisma.migrationProject.update({
      where: { id },
      data: {
        dataToMigrate,
        currentStep: 3,
        status: 'MAPPING'
      }
    });

    res.json({
      success: true,
      message: 'Data selection updated',
      project: updated
    });
  } catch (error) {
    console.error('Error selecting data:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/platform-migration/:id/default-mapping
 * Get default field mapping for platform
 */
router.get('/:id/default-mapping', async (req, res) => {
  try {
    const { id } = req.params;
    const { itemType } = req.query;
    const userId = req.user.id;

    const project = await req.prisma.migrationProject.findFirst({
      where: { id, userId }
    });

    if (!project) {
      return res.status(404).json({ error: 'Migration project not found' });
    }

    const mapping = getDefaultMapping(project.sourcePlatform, itemType);

    res.json({ mapping });
  } catch (error) {
    console.error('Error getting default mapping:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/platform-migration/:id/mapping
 * Save custom field mapping
 */
router.post('/:id/mapping', async (req, res) => {
  try {
    const { id } = req.params;
    const { fieldMapping } = req.body;
    const userId = req.user.id;

    // Verify project ownership
    const project = await req.prisma.migrationProject.findFirst({
      where: { id, userId }
    });

    if (!project) {
      return res.status(404).json({ error: 'Migration project not found' });
    }

    // Save field mapping
    const updated = await req.prisma.migrationProject.update({
      where: { id },
      data: {
        fieldMapping,
        currentStep: 4,
        status: 'READY'
      }
    });

    res.json({
      success: true,
      message: 'Field mapping saved',
      project: updated
    });
  } catch (error) {
    console.error('Error saving mapping:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/platform-migration/:id/preview
 * Preview data before migration
 */
router.get('/:id/preview', async (req, res) => {
  try {
    const { id } = req.params;
    const { itemType, limit = 10 } = req.query;
    const userId = req.user.id;

    const project = await req.prisma.migrationProject.findFirst({
      where: { id, userId }
    });

    if (!project) {
      return res.status(404).json({ error: 'Migration project not found' });
    }

    // Get sample items
    const items = await req.prisma.migratedItem.findMany({
      where: {
        migrationProjectId: id,
        itemType: itemType ? itemType : undefined
      },
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      preview: items.map(item => ({
        itemType: item.itemType,
        originalData: item.originalData,
        status: item.status
      }))
    });
  } catch (error) {
    console.error('Error previewing data:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/platform-migration/:id/execute
 * Execute migration
 */
router.post('/:id/execute', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verify project ownership
    const project = await req.prisma.migrationProject.findFirst({
      where: { id, userId }
    });

    if (!project) {
      return res.status(404).json({ error: 'Migration project not found' });
    }

    if (project.status === 'IN_PROGRESS') {
      return res.status(400).json({ error: 'Migration already in progress' });
    }

    // Execute migration asynchronously
    executeMigration(id, req.prisma)
      .then(result => {
        console.log(`Migration ${id} completed:`, result);
      })
      .catch(error => {
        console.error(`Migration ${id} failed:`, error);
      });

    res.json({
      success: true,
      message: 'Migration started',
      projectId: id
    });
  } catch (error) {
    console.error('Error executing migration:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/platform-migration/:id/status
 * Get migration progress
 */
router.get('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verify project ownership
    const project = await req.prisma.migrationProject.findFirst({
      where: { id, userId }
    });

    if (!project) {
      return res.status(404).json({ error: 'Migration project not found' });
    }

    const progress = await getMigrationProgress(id, req.prisma);

    res.json({ progress });
  } catch (error) {
    console.error('Error getting status:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/platform-migration/:id/report
 * Get migration report
 */
router.get('/:id/report', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verify project ownership
    const project = await req.prisma.migrationProject.findFirst({
      where: { id, userId }
    });

    if (!project) {
      return res.status(404).json({ error: 'Migration project not found' });
    }

    const report = await getMigrationReport(id, req.prisma);

    res.json({ report });
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/platform-migration/:id/retry
 * Retry failed items
 */
router.post('/:id/retry', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verify project ownership
    const project = await req.prisma.migrationProject.findFirst({
      where: { id, userId }
    });

    if (!project) {
      return res.status(404).json({ error: 'Migration project not found' });
    }

    if (!project.allowRetry) {
      return res.status(400).json({ error: 'Retry not allowed for this project' });
    }

    const result = await retryFailedItems(id, req.prisma);

    res.json({
      success: true,
      message: 'Retry completed',
      successCount: result.successCount,
      failedCount: result.failedCount
    });
  } catch (error) {
    console.error('Error retrying failed items:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/platform-migration/:id
 * Cancel/delete migration project
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verify project ownership
    const project = await req.prisma.migrationProject.findFirst({
      where: { id, userId }
    });

    if (!project) {
      return res.status(404).json({ error: 'Migration project not found' });
    }

    // Mark as cancelled or delete
    await req.prisma.migrationProject.update({
      where: { id },
      data: {
        status: 'CANCELLED'
      }
    });

    res.json({
      success: true,
      message: 'Migration project cancelled'
    });
  } catch (error) {
    console.error('Error cancelling project:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/platform-migration/guides/:platform
 * Get export guide for a platform
 */
router.get('/guides/:platform', async (req, res) => {
  try {
    const { platform } = req.params;

    const guide = await req.prisma.migrationGuide.findUnique({
      where: { platform: platform.toUpperCase() }
    });

    if (!guide) {
      return res.status(404).json({ error: 'Guide not found for this platform' });
    }

    // Increment views
    await req.prisma.migrationGuide.update({
      where: { platform: platform.toUpperCase() },
      data: { views: { increment: 1 } }
    });

    res.json({ guide });
  } catch (error) {
    console.error('Error loading guide:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/platform-migration/templates
 * Get migration templates
 */
router.get('/templates', async (req, res) => {
  try {
    const { platform } = req.query;

    const templates = await req.prisma.migrationTemplate.findMany({
      where: platform ? { sourcePlatform: platform.toUpperCase() } : {},
      orderBy: [
        { isOfficial: 'desc' },
        { timesUsed: 'desc' }
      ]
    });

    res.json({ templates });
  } catch (error) {
    console.error('Error loading templates:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
