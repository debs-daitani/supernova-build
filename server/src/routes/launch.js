import express from 'express';
import { PrismaClient } from '@prisma/client';
import Anthropic from '@anthropic-ai/sdk';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// ============================================================================
// LAUNCH PLANNING
// ============================================================================

// Create launch plan
router.post('/launch', authMiddleware, async (req, res) => {
  try {
    const {
      name,
      description,
      launchDate,
      launchType,
      goals,
      generateChecklist = true,
    } = req.body;

    // Create launch
    const launch = await prisma.launch.create({
      data: {
        userId: req.user.id,
        name,
        description,
        launchDate: new Date(launchDate),
        launchType,
        goals: goals || {},
        status: 'planning',
      },
    });

    // Generate AI-powered checklist
    if (generateChecklist) {
      const daysUntilLaunch = Math.ceil((new Date(launchDate) - new Date()) / (1000 * 60 * 60 * 24));

      const prompt = `Generate a comprehensive launch checklist for a ${launchType} launch.

Launch Details:
- Name: ${name}
- Description: ${description || 'Not specified'}
- Days Until Launch: ${daysUntilLaunch}
- Goals: ${JSON.stringify(goals || {})}

Create a detailed, actionable checklist with tasks organized by timeline and category.

Timeline phases:
- 90 days before (if applicable)
- 60 days before
- 30 days before
- 2 weeks before
- 1 week before (Launch Week)
- Launch Day
- Post-Launch (Week 1)

Categories: marketing, technical, legal, content, logistics

For each task, provide:
1. Clear, actionable task description
2. Category (marketing/technical/legal/content/logistics)
3. Days before launch (as negative number, e.g., -30 for 30 days before)
4. Optional: Brief description/notes

Return as a JSON array of tasks in this format:
[
  {
    "task": "Define target audience and create customer avatar",
    "description": "Research and document your ideal customer's demographics, pain points, and desires",
    "category": "marketing",
    "daysBefore": -90
  },
  ...
]

Include 30-40 comprehensive tasks covering all phases of the launch.`;

      try {
        const message = await anthropic.messages.create({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 4096,
          messages: [{
            role: 'user',
            content: prompt,
          }],
        });

        const content = message.content[0].text;

        // Extract JSON from response
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const tasks = JSON.parse(jsonMatch[0]);

          // Create checklist items
          for (let i = 0; i < tasks.length; i++) {
            const task = tasks[i];
            const dueDate = new Date(launchDate);
            dueDate.setDate(dueDate.getDate() + (task.daysBefore || 0));

            await prisma.launchChecklistItem.create({
              data: {
                launchId: launch.id,
                task: task.task,
                description: task.description || null,
                category: task.category || 'logistics',
                dueDate,
                order: i,
              },
            });
          }
        }
      } catch (aiError) {
        console.error('Failed to generate AI checklist:', aiError);
        // Continue without checklist
      }
    }

    // Return launch with checklist
    const launchWithData = await prisma.launch.findUnique({
      where: { id: launch.id },
      include: {
        checklist: {
          orderBy: { order: 'asc' },
        },
        waitlist: true,
      },
    });

    res.json(launchWithData);
  } catch (error) {
    console.error('Create launch error:', error);
    res.status(500).json({ error: 'Failed to create launch' });
  }
});

// Get all launches for user
router.get('/launch', authMiddleware, async (req, res) => {
  try {
    const { status } = req.query;

    const where = {
      userId: req.user.id,
      ...(status && { status }),
    };

    const launches = await prisma.launch.findMany({
      where,
      include: {
        checklist: {
          select: {
            id: true,
            completed: true,
          },
        },
        _count: {
          select: {
            waitlist: true,
          },
        },
      },
      orderBy: { launchDate: 'asc' },
    });

    // Add computed fields
    const launchesWithStats = launches.map(launch => ({
      ...launch,
      totalTasks: launch.checklist.length,
      completedTasks: launch.checklist.filter(t => t.completed).length,
      waitlistCount: launch._count.waitlist,
      daysUntilLaunch: Math.ceil((new Date(launch.launchDate) - new Date()) / (1000 * 60 * 60 * 24)),
    }));

    res.json(launchesWithStats);
  } catch (error) {
    console.error('Get launches error:', error);
    res.status(500).json({ error: 'Failed to fetch launches' });
  }
});

// Get single launch
router.get('/launch/:id', authMiddleware, async (req, res) => {
  try {
    const launch = await prisma.launch.findUnique({
      where: { id: req.params.id },
      include: {
        checklist: {
          orderBy: [
            { completed: 'asc' },
            { dueDate: 'asc' },
          ],
        },
        waitlist: {
          orderBy: { position: 'asc' },
        },
      },
    });

    if (!launch) {
      return res.status(404).json({ error: 'Launch not found' });
    }

    if (launch.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Add computed fields
    const launchWithStats = {
      ...launch,
      totalTasks: launch.checklist.length,
      completedTasks: launch.checklist.filter(t => t.completed).length,
      daysUntilLaunch: Math.ceil((new Date(launch.launchDate) - new Date()) / (1000 * 60 * 60 * 24)),
    };

    res.json(launchWithStats);
  } catch (error) {
    console.error('Get launch error:', error);
    res.status(500).json({ error: 'Failed to fetch launch' });
  }
});

// Update launch
router.patch('/launch/:id', authMiddleware, async (req, res) => {
  try {
    const { name, description, launchDate, goals, status } = req.body;

    const existing = await prisma.launch.findUnique({
      where: { id: req.params.id },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Launch not found' });
    }

    if (existing.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const launch = await prisma.launch.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(launchDate && { launchDate: new Date(launchDate) }),
        ...(goals && { goals }),
        ...(status && { status }),
      },
      include: {
        checklist: true,
        waitlist: true,
      },
    });

    res.json(launch);
  } catch (error) {
    console.error('Update launch error:', error);
    res.status(500).json({ error: 'Failed to update launch' });
  }
});

// Delete launch
router.delete('/launch/:id', authMiddleware, async (req, res) => {
  try {
    const launch = await prisma.launch.findUnique({
      where: { id: req.params.id },
    });

    if (!launch) {
      return res.status(404).json({ error: 'Launch not found' });
    }

    if (launch.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await prisma.launch.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Launch deleted successfully' });
  } catch (error) {
    console.error('Delete launch error:', error);
    res.status(500).json({ error: 'Failed to delete launch' });
  }
});

// ============================================================================
// CHECKLIST MANAGEMENT
// ============================================================================

// Add checklist item
router.post('/launch/:id/checklist', authMiddleware, async (req, res) => {
  try {
    const { task, description, category, dueDate } = req.body;

    const launch = await prisma.launch.findUnique({
      where: { id: req.params.id },
      include: { checklist: true },
    });

    if (!launch) {
      return res.status(404).json({ error: 'Launch not found' });
    }

    if (launch.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const item = await prisma.launchChecklistItem.create({
      data: {
        launchId: req.params.id,
        task,
        description,
        category: category || 'logistics',
        dueDate: dueDate ? new Date(dueDate) : null,
        order: launch.checklist.length,
      },
    });

    res.json(item);
  } catch (error) {
    console.error('Add checklist item error:', error);
    res.status(500).json({ error: 'Failed to add checklist item' });
  }
});

// Update checklist item
router.patch('/launch/:launchId/checklist/:itemId', authMiddleware, async (req, res) => {
  try {
    const { task, description, category, dueDate, completed } = req.body;

    const item = await prisma.launchChecklistItem.findUnique({
      where: { id: req.params.itemId },
      include: { launch: true },
    });

    if (!item) {
      return res.status(404).json({ error: 'Checklist item not found' });
    }

    if (item.launch.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const updated = await prisma.launchChecklistItem.update({
      where: { id: req.params.itemId },
      data: {
        ...(task && { task }),
        ...(description !== undefined && { description }),
        ...(category && { category }),
        ...(dueDate && { dueDate: new Date(dueDate) }),
        ...(typeof completed === 'boolean' && {
          completed,
          completedAt: completed ? new Date() : null,
        }),
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('Update checklist item error:', error);
    res.status(500).json({ error: 'Failed to update checklist item' });
  }
});

// Toggle checklist item completion
router.post('/launch/:launchId/checklist/:itemId/toggle', authMiddleware, async (req, res) => {
  try {
    const item = await prisma.launchChecklistItem.findUnique({
      where: { id: req.params.itemId },
      include: { launch: true },
    });

    if (!item) {
      return res.status(404).json({ error: 'Checklist item not found' });
    }

    if (item.launch.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const updated = await prisma.launchChecklistItem.update({
      where: { id: req.params.itemId },
      data: {
        completed: !item.completed,
        completedAt: !item.completed ? new Date() : null,
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('Toggle checklist item error:', error);
    res.status(500).json({ error: 'Failed to toggle checklist item' });
  }
});

// Delete checklist item
router.delete('/launch/:launchId/checklist/:itemId', authMiddleware, async (req, res) => {
  try {
    const item = await prisma.launchChecklistItem.findUnique({
      where: { id: req.params.itemId },
      include: { launch: true },
    });

    if (!item) {
      return res.status(404).json({ error: 'Checklist item not found' });
    }

    if (item.launch.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await prisma.launchChecklistItem.delete({
      where: { id: req.params.itemId },
    });

    res.json({ message: 'Checklist item deleted successfully' });
  } catch (error) {
    console.error('Delete checklist item error:', error);
    res.status(500).json({ error: 'Failed to delete checklist item' });
  }
});

// ============================================================================
// WAITLIST MANAGEMENT
// ============================================================================

// Add to waitlist (public endpoint - no auth required)
router.post('/launch/:id/waitlist', async (req, res) => {
  try {
    const { email, name, referredBy } = req.body;

    const launch = await prisma.launch.findUnique({
      where: { id: req.params.id },
    });

    if (!launch) {
      return res.status(404).json({ error: 'Launch not found' });
    }

    // Check if already on waitlist
    const existing = await prisma.waitlistEntry.findFirst({
      where: {
        launchId: req.params.id,
        email,
      },
    });

    if (existing) {
      return res.status(400).json({ error: 'Email already on waitlist' });
    }

    // Get current waitlist count for position
    const count = await prisma.waitlistEntry.count({
      where: { launchId: req.params.id },
    });

    // Create entry
    const entry = await prisma.waitlistEntry.create({
      data: {
        launchId: req.params.id,
        email,
        name,
        referredBy,
        position: count + 1,
      },
    });

    // Update launch waitlist count
    await prisma.launch.update({
      where: { id: req.params.id },
      data: { waitlistCount: count + 1 },
    });

    // If referred by someone, increment their referral count
    if (referredBy) {
      await prisma.waitlistEntry.updateMany({
        where: {
          launchId: req.params.id,
          email: referredBy,
        },
        data: {
          referralCount: { increment: 1 },
        },
      });
    }

    res.json(entry);
  } catch (error) {
    console.error('Add to waitlist error:', error);
    res.status(500).json({ error: 'Failed to join waitlist' });
  }
});

// Get waitlist entries (owner only)
router.get('/launch/:id/waitlist', authMiddleware, async (req, res) => {
  try {
    const launch = await prisma.launch.findUnique({
      where: { id: req.params.id },
    });

    if (!launch) {
      return res.status(404).json({ error: 'Launch not found' });
    }

    if (launch.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const entries = await prisma.waitlistEntry.findMany({
      where: { launchId: req.params.id },
      orderBy: { position: 'asc' },
    });

    res.json(entries);
  } catch (error) {
    console.error('Get waitlist error:', error);
    res.status(500).json({ error: 'Failed to fetch waitlist' });
  }
});

// Send notification to waitlist (owner only)
router.post('/launch/:id/waitlist/notify', authMiddleware, async (req, res) => {
  try {
    const { subject, message } = req.body;

    const launch = await prisma.launch.findUnique({
      where: { id: req.params.id },
      include: { waitlist: true },
    });

    if (!launch) {
      return res.status(404).json({ error: 'Launch not found' });
    }

    if (launch.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // In a real implementation, this would send emails
    // For now, just mark as notified
    await prisma.waitlistEntry.updateMany({
      where: { launchId: req.params.id },
      data: { notified: true },
    });

    res.json({
      message: 'Waitlist notified successfully',
      count: launch.waitlist.length,
    });
  } catch (error) {
    console.error('Notify waitlist error:', error);
    res.status(500).json({ error: 'Failed to notify waitlist' });
  }
});

export default router;
