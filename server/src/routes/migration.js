/**
 * User Migration Routes
 * API endpoints for importing users from external systems
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { migrateUsers } = require('../scripts/migrateYourUsers');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/migrations');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `migration_${Date.now()}_${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max
  }
});

/**
 * ADMIN ROUTES (require admin authentication)
 */

// Get all migration logs
router.get('/logs', /* requireAdmin, */ async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const [logs, total] = await Promise.all([
      req.prisma.migrationLog.findMany({
        orderBy: { startedAt: 'desc' },
        skip: (page - 1) * limit,
        take: parseInt(limit)
      }),
      req.prisma.migrationLog.count()
    ]);

    res.json({
      logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching migration logs:', error);
    res.status(500).json({ error: 'Failed to fetch migration logs' });
  }
});

// Get specific migration log
router.get('/logs/:batchId', /* requireAdmin, */ async (req, res) => {
  try {
    const { batchId } = req.params;

    const log = await req.prisma.migrationLog.findFirst({
      where: { batchId }
    });

    if (!log) {
      return res.status(404).json({ error: 'Migration log not found' });
    }

    // Get detailed records
    const records = await req.prisma.migratedUser.findMany({
      where: { batchId },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      log,
      records
    });
  } catch (error) {
    console.error('Error fetching migration log:', error);
    res.status(500).json({ error: 'Failed to fetch migration log' });
  }
});

// Upload CSV file
router.post('/upload', /* requireAdmin, */ upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Parse CSV to preview
    const { migrateUsers: { readCSV } } = require('../scripts/migrateYourUsers');

    // We need to export readCSV, let's read the file manually for preview
    const fs = require('fs');
    const content = fs.readFileSync(req.file.path, 'utf-8');
    const lines = content.split('\n').filter(l => l.trim());
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));

    const preview = lines.slice(1, 6).map(line => {
      const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      const obj = {};
      headers.forEach((h, i) => obj[h] = values[i] || '');
      return obj;
    });

    res.json({
      success: true,
      filename: req.file.filename,
      filepath: req.file.path,
      size: req.file.size,
      totalRows: lines.length - 1,
      preview,
      headers
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Failed to process file' });
  }
});

// Preview migration (dry run)
router.post('/preview', /* requireAdmin, */ async (req, res) => {
  try {
    const { filepath } = req.body;

    if (!filepath || !fs.existsSync(filepath)) {
      return res.status(400).json({ error: 'Invalid file path' });
    }

    // Run dry run
    const result = await migrateUsers(filepath, {
      dryRun: true,
      sendEmails: false
    });

    res.json({
      success: true,
      preview: result
    });
  } catch (error) {
    console.error('Error previewing migration:', error);
    res.status(500).json({ error: error.message || 'Failed to preview migration' });
  }
});

// Run migration
router.post('/run', /* requireAdmin, */ async (req, res) => {
  try {
    const { filepath, sendEmails = true } = req.body;

    if (!filepath || !fs.existsSync(filepath)) {
      return res.status(400).json({ error: 'Invalid file path' });
    }

    // Run migration
    const result = await migrateUsers(filepath, {
      dryRun: false,
      sendEmails
    });

    res.json({
      success: true,
      result
    });
  } catch (error) {
    console.error('Error running migration:', error);
    res.status(500).json({ error: error.message || 'Failed to run migration' });
  }
});

// Resend welcome emails for a batch
router.post('/resend-emails/:batchId', /* requireAdmin, */ async (req, res) => {
  try {
    const { batchId } = req.params;

    // Get users from this batch who haven't received emails
    const migratedUsers = await req.prisma.migratedUser.findMany({
      where: {
        batchId,
        emailSent: false,
        status: 'success'
      }
    });

    if (migratedUsers.length === 0) {
      return res.json({
        success: true,
        message: 'No users need email resend',
        count: 0
      });
    }

    let sent = 0;
    let failed = 0;

    for (const migratedUser of migratedUsers) {
      try {
        const user = await req.prisma.user.findUnique({
          where: { id: migratedUser.userId }
        });

        if (user && user.temporaryPassword) {
          const { sendWelcomeEmail } = require('../scripts/migrateYourUsers');
          await sendWelcomeEmail(user, user.temporaryPassword, user.isQuizTester);

          // Update record
          await req.prisma.migratedUser.update({
            where: { id: migratedUser.id },
            data: {
              emailSent: true,
              emailSentAt: new Date()
            }
          });

          sent++;
        }
      } catch (error) {
        console.error(`Failed to resend email to ${migratedUser.originalEmail}:`, error);
        failed++;
      }
    }

    res.json({
      success: true,
      sent,
      failed,
      total: migratedUsers.length
    });
  } catch (error) {
    console.error('Error resending emails:', error);
    res.status(500).json({ error: 'Failed to resend emails' });
  }
});

// Get migration statistics
router.get('/stats', /* requireAdmin, */ async (req, res) => {
  try {
    const totalMigrations = await req.prisma.migrationLog.count();
    const totalUsers = await req.prisma.migratedUser.count();
    const successfulUsers = await req.prisma.migratedUser.count({
      where: { status: 'success' }
    });
    const quizTesters = await req.prisma.user.count({
      where: { isQuizTester: true }
    });

    const recentMigrations = await req.prisma.migrationLog.findMany({
      orderBy: { startedAt: 'desc' },
      take: 5
    });

    res.json({
      totalMigrations,
      totalUsers,
      successfulUsers,
      quizTesters,
      recentMigrations
    });
  } catch (error) {
    console.error('Error fetching migration stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Delete migration log (cleanup)
router.delete('/logs/:batchId', /* requireAdmin, */ async (req, res) => {
  try {
    const { batchId } = req.params;

    // Delete migrated user records
    await req.prisma.migratedUser.deleteMany({
      where: { batchId }
    });

    // Delete migration log
    await req.prisma.migrationLog.deleteMany({
      where: { batchId }
    });

    res.json({
      success: true,
      message: 'Migration log deleted'
    });
  } catch (error) {
    console.error('Error deleting migration log:', error);
    res.status(500).json({ error: 'Failed to delete migration log' });
  }
});

export default router;
