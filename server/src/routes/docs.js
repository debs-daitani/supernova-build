import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth.js';
import crypto from 'crypto';

const router = express.Router();
const prisma = new PrismaClient();

// ============================================================================
// DOCUMENTS
// ============================================================================

// Create document
router.post('/', authenticate, async (req, res) => {
  try {
    const {
      title = 'Untitled Document',
      content = { ops: [{ insert: '\n' }] }, // Empty Quill delta
      folderId,
    } = req.body;

    const document = await prisma.document.create({
      data: {
        userId: req.user.id,
        title,
        content,
        folderId,
      },
    });

    res.json(document);
  } catch (error) {
    console.error('Create document error:', error);
    res.status(500).json({ error: 'Failed to create document' });
  }
});

// Get all user documents
router.get('/', authenticate, async (req, res) => {
  try {
    const { folderId, shared, recent } = req.query;

    let where = {};

    if (shared === 'true') {
      // Get documents shared with this user
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

    const documents = await prisma.document.findMany({
      where,
      orderBy,
      select: {
        id: true,
        title: true,
        wordCount: true,
        characterCount: true,
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

    res.json(documents);
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

// Get single document
router.get('/:id', authenticate, async (req, res) => {
  try {
    const document = await prisma.document.findUnique({
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

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Check access permission
    const hasAccess =
      document.userId === req.user.id ||
      document.isPublic ||
      document.collaborators.some(c => c.userId === req.user.id);

    if (!hasAccess) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Update last viewed
    await prisma.document.update({
      where: { id: req.params.id },
      data: { lastViewedAt: new Date() },
    });

    res.json(document);
  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({ error: 'Failed to fetch document' });
  }
});

// Update document
router.patch('/:id', authenticate, async (req, res) => {
  try {
    const {
      title,
      content,
      wordCount,
      characterCount,
      folderId,
      isPublic,
    } = req.body;

    const existing = await prisma.document.findUnique({
      where: { id: req.params.id },
      include: {
        collaborators: true,
      },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Document not found' });
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

    const document = await prisma.document.update({
      where: { id: req.params.id },
      data: {
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
        ...(wordCount !== undefined && { wordCount }),
        ...(characterCount !== undefined && { characterCount }),
        ...(folderId !== undefined && { folderId }),
        ...(isPublic !== undefined && { isPublic }),
      },
    });

    res.json(document);
  } catch (error) {
    console.error('Update document error:', error);
    res.status(500).json({ error: 'Failed to update document' });
  }
});

// Delete document
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const document = await prisma.document.findUnique({
      where: { id: req.params.id },
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    if (document.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await prisma.document.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

// Copy document
router.post('/:id/copy', authenticate, async (req, res) => {
  try {
    const original = await prisma.document.findUnique({
      where: { id: req.params.id },
      include: {
        collaborators: true,
      },
    });

    if (!original) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Check access permission
    const hasAccess =
      original.userId === req.user.id ||
      original.isPublic ||
      original.collaborators.some(c => c.userId === req.user.id);

    if (!hasAccess) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const copy = await prisma.document.create({
      data: {
        userId: req.user.id,
        title: `${original.title} (Copy)`,
        content: original.content,
        wordCount: original.wordCount,
        characterCount: original.characterCount,
      },
    });

    res.json(copy);
  } catch (error) {
    console.error('Copy document error:', error);
    res.status(500).json({ error: 'Failed to copy document' });
  }
});

// Move document to folder
router.post('/:id/move', authenticate, async (req, res) => {
  try {
    const { folderId } = req.body;

    const document = await prisma.document.findUnique({
      where: { id: req.params.id },
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    if (document.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const updated = await prisma.document.update({
      where: { id: req.params.id },
      data: { folderId },
    });

    res.json(updated);
  } catch (error) {
    console.error('Move document error:', error);
    res.status(500).json({ error: 'Failed to move document' });
  }
});

// ============================================================================
// FOLDERS
// ============================================================================

// Create folder
router.post('/folders', authenticate, async (req, res) => {
  try {
    const { name, color, parentId } = req.body;

    const folder = await prisma.documentFolder.create({
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
    const folders = await prisma.documentFolder.findMany({
      where: { userId: req.user.id },
      include: {
        documents: {
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

    const folder = await prisma.documentFolder.findUnique({
      where: { id: req.params.id },
    });

    if (!folder) {
      return res.status(404).json({ error: 'Folder not found' });
    }

    if (folder.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const updated = await prisma.documentFolder.update({
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
    const folder = await prisma.documentFolder.findUnique({
      where: { id: req.params.id },
    });

    if (!folder) {
      return res.status(404).json({ error: 'Folder not found' });
    }

    if (folder.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await prisma.documentFolder.delete({
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

// Share document
router.post('/:id/share', authenticate, async (req, res) => {
  try {
    const { emails, permission = 'view' } = req.body;

    const document = await prisma.document.findUnique({
      where: { id: req.params.id },
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    if (document.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Find users by email
    const users = await prisma.user.findMany({
      where: {
        email: { in: Array.isArray(emails) ? emails : [emails] },
      },
    });

    // Add collaborators
    const collaborators = await Promise.all(
      users.map(user =>
        prisma.documentCollaborator.upsert({
          where: {
            documentId_userId: {
              documentId: req.params.id,
              userId: user.id,
            },
          },
          create: {
            documentId: req.params.id,
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
    console.error('Share document error:', error);
    res.status(500).json({ error: 'Failed to share document' });
  }
});

// Generate share link
router.post('/:id/share-link', authenticate, async (req, res) => {
  try {
    const document = await prisma.document.findUnique({
      where: { id: req.params.id },
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    if (document.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const shareLink = crypto.randomBytes(16).toString('hex');

    const updated = await prisma.document.update({
      where: { id: req.params.id },
      data: {
        shareLink,
        isPublic: true,
      },
    });

    res.json({
      shareLink: `${process.env.CLIENT_URL}/docs/shared/${shareLink}`,
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

    const document = await prisma.document.findUnique({
      where: { id: req.params.id },
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    if (document.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const collaborator = await prisma.documentCollaborator.update({
      where: {
        documentId_userId: {
          documentId: req.params.id,
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
    const document = await prisma.document.findUnique({
      where: { id: req.params.id },
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    if (document.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await prisma.documentCollaborator.delete({
      where: {
        documentId_userId: {
          documentId: req.params.id,
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
    const { content, anchor, parentId } = req.body;

    const document = await prisma.document.findUnique({
      where: { id: req.params.id },
      include: {
        collaborators: true,
      },
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Check comment permission
    const canComment =
      document.userId === req.user.id ||
      document.collaborators.some(
        c => c.userId === req.user.id && ['comment', 'edit', 'owner'].includes(c.permission)
      );

    if (!canComment) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const comment = await prisma.documentComment.create({
      data: {
        documentId: req.params.id,
        userId: req.user.id,
        content,
        anchor,
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
      documentId: req.params.id,
      parentId: null, // Only top-level comments
    };

    if (resolved !== undefined) {
      where.resolved = resolved === 'true';
    }

    const comments = await prisma.documentComment.findMany({
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

    const comment = await prisma.documentComment.findUnique({
      where: { id: req.params.commentId },
    });

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (comment.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const updated = await prisma.documentComment.update({
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
    const comment = await prisma.documentComment.findUnique({
      where: { id: req.params.commentId },
    });

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (comment.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await prisma.documentComment.delete({
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
    const comment = await prisma.documentComment.findUnique({
      where: { id: req.params.commentId },
    });

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    const updated = await prisma.documentComment.update({
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
    const versions = await prisma.documentVersion.findMany({
      where: { documentId: req.params.id },
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
    const document = await prisma.document.findUnique({
      where: { id: req.params.id },
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    if (document.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const version = await prisma.documentVersion.findUnique({
      where: { id: req.params.versionId },
    });

    if (!version) {
      return res.status(404).json({ error: 'Version not found' });
    }

    // Save current state as new version before restoring
    const latestVersion = await prisma.documentVersion.findFirst({
      where: { documentId: req.params.id },
      orderBy: { versionNumber: 'desc' },
    });

    const newVersionNumber = latestVersion ? latestVersion.versionNumber + 1 : 1;

    await prisma.documentVersion.create({
      data: {
        documentId: req.params.id,
        userId: req.user.id,
        versionNumber: newVersionNumber,
        content: document.content,
        changesSummary: `Restored version ${version.versionNumber}`,
      },
    });

    // Restore the selected version
    const updated = await prisma.document.update({
      where: { id: req.params.id },
      data: {
        content: version.content,
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('Restore version error:', error);
    res.status(500).json({ error: 'Failed to restore version' });
  }
});

// ============================================================================
// EXPORT
// ============================================================================

// Export as PDF
router.get('/:id/export/pdf', authenticate, async (req, res) => {
  try {
    // In a real implementation:
    // 1. Get document
    // 2. Render HTML from content
    // 3. Convert to PDF using Puppeteer or wkhtmltopdf
    // 4. Return PDF file

    res.json({
      success: true,
      message: 'PDF export requires Puppeteer integration',
    });
  } catch (error) {
    console.error('Export PDF error:', error);
    res.status(500).json({ error: 'Failed to export PDF' });
  }
});

// Export as DOCX
router.get('/:id/export/docx', authenticate, async (req, res) => {
  try {
    // In a real implementation:
    // 1. Get document
    // 2. Convert content to DOCX format using docx.js
    // 3. Return DOCX file

    res.json({
      success: true,
      message: 'DOCX export requires docx.js integration',
    });
  } catch (error) {
    console.error('Export DOCX error:', error);
    res.status(500).json({ error: 'Failed to export DOCX' });
  }
});

// Export as text
router.get('/:id/export/txt', authenticate, async (req, res) => {
  try {
    const document = await prisma.document.findUnique({
      where: { id: req.params.id },
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Extract plain text from Quill delta
    let text = '';
    if (document.content && document.content.ops) {
      text = document.content.ops
        .map(op => typeof op.insert === 'string' ? op.insert : '')
        .join('');
    }

    res.json({
      success: true,
      text,
      filename: `${document.title}.txt`,
    });
  } catch (error) {
    console.error('Export TXT error:', error);
    res.status(500).json({ error: 'Failed to export text' });
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

    const templates = await prisma.documentTemplate.findMany({
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

// Create document from template
router.post('/from-template/:templateId', authenticate, async (req, res) => {
  try {
    const { title } = req.body;

    const template = await prisma.documentTemplate.findUnique({
      where: { id: req.params.templateId },
    });

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    const document = await prisma.document.create({
      data: {
        userId: req.user.id,
        title: title || template.name,
        content: template.content,
      },
    });

    // Update template usage count
    await prisma.documentTemplate.update({
      where: { id: req.params.templateId },
      data: { usageCount: { increment: 1 } },
    });

    res.json(document);
  } catch (error) {
    console.error('Create from template error:', error);
    res.status(500).json({ error: 'Failed to create document from template' });
  }
});

export default router;
