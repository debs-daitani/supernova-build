import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth.js';
import crypto from 'crypto';

const router = express.Router();
const prisma = new PrismaClient();

// ============================================================================
// SPREADSHEETS
// ============================================================================

// Create spreadsheet
router.post('/', authenticate, async (req, res) => {
  try {
    const {
      title = 'Untitled Spreadsheet',
      sheets = [
        {
          name: 'Sheet1',
          rows: 100,
          columns: 26,
          cells: {},
        },
      ],
      folderId,
    } = req.body;

    const spreadsheet = await prisma.spreadsheet.create({
      data: {
        userId: req.user.id,
        title,
        sheets,
        folderId,
      },
    });

    res.json(spreadsheet);
  } catch (error) {
    console.error('Create spreadsheet error:', error);
    res.status(500).json({ error: 'Failed to create spreadsheet' });
  }
});

// Get all user spreadsheets
router.get('/', authenticate, async (req, res) => {
  try {
    const { folderId, shared, recent } = req.query;

    let where = {};

    if (shared === 'true') {
      where = {
        collaborators: {
          some: {
            userId: req.user.id,
          },
        },
      };
    } else if (folderId) {
      where = {
        userId: req.user.id,
        folderId,
      };
    } else {
      where = {
        userId: req.user.id,
      };
    }

    let orderBy = { updatedAt: 'desc' };
    if (recent === 'true') {
      orderBy = { lastViewedAt: 'desc' };
    }

    const spreadsheets = await prisma.spreadsheet.findMany({
      where,
      orderBy,
      select: {
        id: true,
        title: true,
        isPublic: true,
        folderId: true,
        createdAt: true,
        updatedAt: true,
        lastViewedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        collaborators: {
          select: {
            userId: true,
            permission: true,
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    res.json(spreadsheets);
  } catch (error) {
    console.error('Get spreadsheets error:', error);
    res.status(500).json({ error: 'Failed to fetch spreadsheets' });
  }
});

// Get single spreadsheet
router.get('/:id', authenticate, async (req, res) => {
  try {
    const spreadsheet = await prisma.spreadsheet.findUnique({
      where: { id: req.params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        collaborators: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        comments: {
          where: { resolved: false },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            replies: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!spreadsheet) {
      return res.status(404).json({ error: 'Spreadsheet not found' });
    }

    // Check access permission
    const hasAccess =
      spreadsheet.userId === req.user.id ||
      spreadsheet.isPublic ||
      spreadsheet.collaborators.some(c => c.userId === req.user.id);

    if (!hasAccess) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Update last viewed
    await prisma.spreadsheet.update({
      where: { id: req.params.id },
      data: { lastViewedAt: new Date() },
    });

    res.json(spreadsheet);
  } catch (error) {
    console.error('Get spreadsheet error:', error);
    res.status(500).json({ error: 'Failed to fetch spreadsheet' });
  }
});

// Update spreadsheet
router.patch('/:id', authenticate, async (req, res) => {
  try {
    const {
      title,
      sheets,
      folderId,
      isPublic,
    } = req.body;

    const existing = await prisma.spreadsheet.findUnique({
      where: { id: req.params.id },
      include: {
        collaborators: true,
      },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Spreadsheet not found' });
    }

    // Check edit permission
    const canEdit =
      existing.userId === req.user.id ||
      existing.collaborators.some(
        c => c.userId === req.user.id && ['edit', 'owner'].includes(c.permission)
      );

    if (!canEdit) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const spreadsheet = await prisma.spreadsheet.update({
      where: { id: req.params.id },
      data: {
        ...(title !== undefined && { title }),
        ...(sheets !== undefined && { sheets }),
        ...(folderId !== undefined && { folderId }),
        ...(isPublic !== undefined && { isPublic }),
      },
    });

    res.json(spreadsheet);
  } catch (error) {
    console.error('Update spreadsheet error:', error);
    res.status(500).json({ error: 'Failed to update spreadsheet' });
  }
});

// Delete spreadsheet
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const spreadsheet = await prisma.spreadsheet.findUnique({
      where: { id: req.params.id },
    });

    if (!spreadsheet) {
      return res.status(404).json({ error: 'Spreadsheet not found' });
    }

    if (spreadsheet.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await prisma.spreadsheet.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Spreadsheet deleted successfully' });
  } catch (error) {
    console.error('Delete spreadsheet error:', error);
    res.status(500).json({ error: 'Failed to delete spreadsheet' });
  }
});

// Copy spreadsheet
router.post('/:id/copy', authenticate, async (req, res) => {
  try {
    const original = await prisma.spreadsheet.findUnique({
      where: { id: req.params.id },
      include: {
        collaborators: true,
      },
    });

    if (!original) {
      return res.status(404).json({ error: 'Spreadsheet not found' });
    }

    // Check access permission
    const hasAccess =
      original.userId === req.user.id ||
      original.isPublic ||
      original.collaborators.some(c => c.userId === req.user.id);

    if (!hasAccess) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const copy = await prisma.spreadsheet.create({
      data: {
        userId: req.user.id,
        title: `${original.title} (Copy)`,
        sheets: original.sheets,
      },
    });

    res.json(copy);
  } catch (error) {
    console.error('Copy spreadsheet error:', error);
    res.status(500).json({ error: 'Failed to copy spreadsheet' });
  }
});

// Move spreadsheet to folder
router.post('/:id/move', authenticate, async (req, res) => {
  try {
    const { folderId } = req.body;

    const spreadsheet = await prisma.spreadsheet.findUnique({
      where: { id: req.params.id },
    });

    if (!spreadsheet) {
      return res.status(404).json({ error: 'Spreadsheet not found' });
    }

    if (spreadsheet.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const updated = await prisma.spreadsheet.update({
      where: { id: req.params.id },
      data: { folderId },
    });

    res.json(updated);
  } catch (error) {
    console.error('Move spreadsheet error:', error);
    res.status(500).json({ error: 'Failed to move spreadsheet' });
  }
});

// ============================================================================
// FOLDERS
// ============================================================================

// Create folder
router.post('/folders', authenticate, async (req, res) => {
  try {
    const { name, color, parentId } = req.body;

    const folder = await prisma.spreadsheetFolder.create({
      data: {
        userId: req.user.id,
        name,
        color,
        parentId,
      },
    });

    res.json(folder);
  } catch (error) {
    console.error('Create folder error:', error);
    res.status(500).json({ error: 'Failed to create folder' });
  }
});

// Get all folders
router.get('/folders', authenticate, async (req, res) => {
  try {
    const folders = await prisma.spreadsheetFolder.findMany({
      where: { userId: req.user.id },
      include: {
        spreadsheets: {
          select: {
            id: true,
            title: true,
          },
        },
        subfolders: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    res.json(folders);
  } catch (error) {
    console.error('Get folders error:', error);
    res.status(500).json({ error: 'Failed to fetch folders' });
  }
});

// Update folder
router.patch('/folders/:id', authenticate, async (req, res) => {
  try {
    const { name, color, parentId } = req.body;

    const folder = await prisma.spreadsheetFolder.findUnique({
      where: { id: req.params.id },
    });

    if (!folder) {
      return res.status(404).json({ error: 'Folder not found' });
    }

    if (folder.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const updated = await prisma.spreadsheetFolder.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(color !== undefined && { color }),
        ...(parentId !== undefined && { parentId }),
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('Update folder error:', error);
    res.status(500).json({ error: 'Failed to update folder' });
  }
});

// Delete folder
router.delete('/folders/:id', authenticate, async (req, res) => {
  try {
    const folder = await prisma.spreadsheetFolder.findUnique({
      where: { id: req.params.id },
    });

    if (!folder) {
      return res.status(404).json({ error: 'Folder not found' });
    }

    if (folder.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await prisma.spreadsheetFolder.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Folder deleted successfully' });
  } catch (error) {
    console.error('Delete folder error:', error);
    res.status(500).json({ error: 'Failed to delete folder' });
  }
});

// ============================================================================
// SHARING & COLLABORATORS
// ============================================================================

// Share spreadsheet
router.post('/:id/share', authenticate, async (req, res) => {
  try {
    const { emails, permission = 'view' } = req.body;

    const spreadsheet = await prisma.spreadsheet.findUnique({
      where: { id: req.params.id },
    });

    if (!spreadsheet) {
      return res.status(404).json({ error: 'Spreadsheet not found' });
    }

    if (spreadsheet.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const users = await prisma.user.findMany({
      where: {
        email: { in: Array.isArray(emails) ? emails : [emails] },
      },
    });

    const collaborators = await Promise.all(
      users.map(user =>
        prisma.spreadsheetCollaborator.upsert({
          where: {
            spreadsheetId_userId: {
              spreadsheetId: req.params.id,
              userId: user.id,
            },
          },
          create: {
            spreadsheetId: req.params.id,
            userId: user.id,
            permission,
            invitedBy: req.user.id,
          },
          update: {
            permission,
          },
        })
      )
    );

    res.json(collaborators);
  } catch (error) {
    console.error('Share spreadsheet error:', error);
    res.status(500).json({ error: 'Failed to share spreadsheet' });
  }
});

// Generate share link
router.post('/:id/share-link', authenticate, async (req, res) => {
  try {
    const spreadsheet = await prisma.spreadsheet.findUnique({
      where: { id: req.params.id },
    });

    if (!spreadsheet) {
      return res.status(404).json({ error: 'Spreadsheet not found' });
    }

    if (spreadsheet.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const shareLink = crypto.randomBytes(16).toString('hex');

    const updated = await prisma.spreadsheet.update({
      where: { id: req.params.id },
      data: {
        shareLink,
        isPublic: true,
      },
    });

    res.json({
      shareLink: `${process.env.CLIENT_URL}/sheets/shared/${shareLink}`,
    });
  } catch (error) {
    console.error('Generate share link error:', error);
    res.status(500).json({ error: 'Failed to generate share link' });
  }
});

// Update permissions
router.patch('/:id/permissions', authenticate, async (req, res) => {
  try {
    const { userId, permission } = req.body;

    const spreadsheet = await prisma.spreadsheet.findUnique({
      where: { id: req.params.id },
    });

    if (!spreadsheet) {
      return res.status(404).json({ error: 'Spreadsheet not found' });
    }

    if (spreadsheet.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const collaborator = await prisma.spreadsheetCollaborator.update({
      where: {
        spreadsheetId_userId: {
          spreadsheetId: req.params.id,
          userId,
        },
      },
      data: { permission },
    });

    res.json(collaborator);
  } catch (error) {
    console.error('Update permissions error:', error);
    res.status(500).json({ error: 'Failed to update permissions' });
  }
});

// Remove collaborator
router.delete('/:id/collaborators/:userId', authenticate, async (req, res) => {
  try {
    const spreadsheet = await prisma.spreadsheet.findUnique({
      where: { id: req.params.id },
    });

    if (!spreadsheet) {
      return res.status(404).json({ error: 'Spreadsheet not found' });
    }

    if (spreadsheet.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await prisma.spreadsheetCollaborator.delete({
      where: {
        spreadsheetId_userId: {
          spreadsheetId: req.params.id,
          userId: req.params.userId,
        },
      },
    });

    res.json({ message: 'Collaborator removed successfully' });
  } catch (error) {
    console.error('Remove collaborator error:', error);
    res.status(500).json({ error: 'Failed to remove collaborator' });
  }
});

// ============================================================================
// COMMENTS
// ============================================================================

// Add comment
router.post('/:id/comments', authenticate, async (req, res) => {
  try {
    const { content, sheetName, cellReference, parentId } = req.body;

    const spreadsheet = await prisma.spreadsheet.findUnique({
      where: { id: req.params.id },
      include: {
        collaborators: true,
      },
    });

    if (!spreadsheet) {
      return res.status(404).json({ error: 'Spreadsheet not found' });
    }

    const canComment =
      spreadsheet.userId === req.user.id ||
      spreadsheet.collaborators.some(
        c => c.userId === req.user.id && ['comment', 'edit', 'owner'].includes(c.permission)
      );

    if (!canComment) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const comment = await prisma.spreadsheetComment.create({
      data: {
        spreadsheetId: req.params.id,
        userId: req.user.id,
        content,
        sheetName,
        cellReference,
        parentId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.json(comment);
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// Get comments
router.get('/:id/comments', authenticate, async (req, res) => {
  try {
    const { resolved } = req.query;

    const where = {
      spreadsheetId: req.params.id,
      parentId: null,
    };

    if (resolved !== undefined) {
      where.resolved = resolved === 'true';
    }

    const comments = await prisma.spreadsheetComment.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(comments);
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// Update comment
router.patch('/:id/comments/:commentId', authenticate, async (req, res) => {
  try {
    const { content } = req.body;

    const comment = await prisma.spreadsheetComment.findUnique({
      where: { id: req.params.commentId },
    });

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (comment.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const updated = await prisma.spreadsheetComment.update({
      where: { id: req.params.commentId },
      data: { content },
    });

    res.json(updated);
  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({ error: 'Failed to update comment' });
  }
});

// Delete comment
router.delete('/:id/comments/:commentId', authenticate, async (req, res) => {
  try {
    const comment = await prisma.spreadsheetComment.findUnique({
      where: { id: req.params.commentId },
    });

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (comment.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await prisma.spreadsheetComment.delete({
      where: { id: req.params.commentId },
    });

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

// Resolve comment
router.post('/:id/comments/:commentId/resolve', authenticate, async (req, res) => {
  try {
    const comment = await prisma.spreadsheetComment.findUnique({
      where: { id: req.params.commentId },
    });

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    const updated = await prisma.spreadsheetComment.update({
      where: { id: req.params.commentId },
      data: {
        resolved: true,
        resolvedAt: new Date(),
        resolvedBy: req.user.id,
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('Resolve comment error:', error);
    res.status(500).json({ error: 'Failed to resolve comment' });
  }
});

// ============================================================================
// VERSION HISTORY
// ============================================================================

// Get version history
router.get('/:id/versions', authenticate, async (req, res) => {
  try {
    const versions = await prisma.spreadsheetVersion.findMany({
      where: { spreadsheetId: req.params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { versionNumber: 'desc' },
    });

    res.json(versions);
  } catch (error) {
    console.error('Get versions error:', error);
    res.status(500).json({ error: 'Failed to fetch versions' });
  }
});

// Restore version
router.post('/:id/restore/:versionId', authenticate, async (req, res) => {
  try {
    const spreadsheet = await prisma.spreadsheet.findUnique({
      where: { id: req.params.id },
    });

    if (!spreadsheet) {
      return res.status(404).json({ error: 'Spreadsheet not found' });
    }

    if (spreadsheet.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const version = await prisma.spreadsheetVersion.findUnique({
      where: { id: req.params.versionId },
    });

    if (!version) {
      return res.status(404).json({ error: 'Version not found' });
    }

    // Save current state as new version
    const latestVersion = await prisma.spreadsheetVersion.findFirst({
      where: { spreadsheetId: req.params.id },
      orderBy: { versionNumber: 'desc' },
    });

    const newVersionNumber = latestVersion ? latestVersion.versionNumber + 1 : 1;

    await prisma.spreadsheetVersion.create({
      data: {
        spreadsheetId: req.params.id,
        userId: req.user.id,
        versionNumber: newVersionNumber,
        sheets: spreadsheet.sheets,
        changesSummary: `Restored version ${version.versionNumber}`,
      },
    });

    // Restore the selected version
    const updated = await prisma.spreadsheet.update({
      where: { id: req.params.id },
      data: {
        sheets: version.sheets,
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('Restore version error:', error);
    res.status(500).json({ error: 'Failed to restore version' });
  }
});

// ============================================================================
// IMPORT/EXPORT
// ============================================================================

// Import CSV
router.post('/import/csv', authenticate, async (req, res) => {
  try {
    const { csvData, title } = req.body;

    // In a real implementation:
    // 1. Parse CSV data
    // 2. Convert to spreadsheet format
    // 3. Create spreadsheet with imported data

    res.json({
      success: true,
      message: 'CSV import requires CSV parsing library integration',
    });
  } catch (error) {
    console.error('Import CSV error:', error);
    res.status(500).json({ error: 'Failed to import CSV' });
  }
});

// Import XLSX
router.post('/import/xlsx', authenticate, async (req, res) => {
  try {
    const { fileUrl, title } = req.body;

    // In a real implementation:
    // 1. Download XLSX file
    // 2. Parse using SheetJS (xlsx library)
    // 3. Convert to spreadsheet format
    // 4. Create spreadsheet

    res.json({
      success: true,
      message: 'XLSX import requires SheetJS (xlsx) library integration',
    });
  } catch (error) {
    console.error('Import XLSX error:', error);
    res.status(500).json({ error: 'Failed to import XLSX' });
  }
});

// Export CSV
router.get('/:id/export/csv', authenticate, async (req, res) => {
  try {
    const spreadsheet = await prisma.spreadsheet.findUnique({
      where: { id: req.params.id },
    });

    if (!spreadsheet) {
      return res.status(404).json({ error: 'Spreadsheet not found' });
    }

    // In a real implementation:
    // 1. Get spreadsheet data
    // 2. Convert to CSV format
    // 3. Return CSV file

    res.json({
      success: true,
      message: 'CSV export requires CSV generation',
    });
  } catch (error) {
    console.error('Export CSV error:', error);
    res.status(500).json({ error: 'Failed to export CSV' });
  }
});

// Export XLSX
router.get('/:id/export/xlsx', authenticate, async (req, res) => {
  try {
    const spreadsheet = await prisma.spreadsheet.findUnique({
      where: { id: req.params.id },
    });

    if (!spreadsheet) {
      return res.status(404).json({ error: 'Spreadsheet not found' });
    }

    // In a real implementation:
    // 1. Get spreadsheet data
    // 2. Convert to XLSX using SheetJS
    // 3. Return XLSX file

    res.json({
      success: true,
      message: 'XLSX export requires SheetJS (xlsx) library integration',
    });
  } catch (error) {
    console.error('Export XLSX error:', error);
    res.status(500).json({ error: 'Failed to export XLSX' });
  }
});

// Export PDF
router.get('/:id/export/pdf', authenticate, async (req, res) => {
  try {
    const spreadsheet = await prisma.spreadsheet.findUnique({
      where: { id: req.params.id },
    });

    if (!spreadsheet) {
      return res.status(404).json({ error: 'Spreadsheet not found' });
    }

    // In a real implementation:
    // 1. Render spreadsheet as HTML table
    // 2. Convert to PDF using Puppeteer
    // 3. Return PDF file

    res.json({
      success: true,
      message: 'PDF export requires Puppeteer integration',
    });
  } catch (error) {
    console.error('Export PDF error:', error);
    res.status(500).json({ error: 'Failed to export PDF' });
  }
});

// ============================================================================
// TEMPLATES
// ============================================================================

// Get templates
router.get('/templates', authenticate, async (req, res) => {
  try {
    const { category } = req.query;

    const where = category ? { category } : {};

    const templates = await prisma.spreadsheetTemplate.findMany({
      where,
      orderBy: [
        { featured: 'desc' },
        { usageCount: 'desc' },
      ],
    });

    res.json(templates);
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

// Create spreadsheet from template
router.post('/from-template/:templateId', authenticate, async (req, res) => {
  try {
    const { title } = req.body;

    const template = await prisma.spreadsheetTemplate.findUnique({
      where: { id: req.params.templateId },
    });

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    const spreadsheet = await prisma.spreadsheet.create({
      data: {
        userId: req.user.id,
        title: title || template.name,
        sheets: template.sheets,
      },
    });

    // Update template usage count
    await prisma.spreadsheetTemplate.update({
      where: { id: req.params.templateId },
      data: { usageCount: { increment: 1 } },
    });

    res.json(spreadsheet);
  } catch (error) {
    console.error('Create from template error:', error);
    res.status(500).json({ error: 'Failed to create spreadsheet from template' });
  }
});

export default router;
