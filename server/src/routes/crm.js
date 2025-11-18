import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// ============================================
// CONTACTS
// ============================================

// Get all contacts
router.get('/contacts', authMiddleware, async (req, res) => {
  try {
    const { status, search, tag } = req.query;

    const where = { userId: req.user.id };

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (tag) {
      where.tags = { has: tag };
    }

    const contacts = await prisma.contact.findMany({
      where,
      include: {
        _count: {
          select: {
            deals: true,
            tasks: true,
            activities: true,
            invoices: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(contacts);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
});

// Get single contact
router.get('/contacts/:id', authMiddleware, async (req, res) => {
  try {
    const contact = await prisma.contact.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      },
      include: {
        deals: { orderBy: { createdAt: 'desc' } },
        tasks: { orderBy: { dueDate: 'asc' } },
        activities: { orderBy: { createdAt: 'desc' }, take: 50 },
        invoices: { orderBy: { createdAt: 'desc' } }
      }
    });

    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    res.json(contact);
  } catch (error) {
    console.error('Error fetching contact:', error);
    res.status(500).json({ error: 'Failed to fetch contact' });
  }
});

// Create contact
router.post('/contacts', authMiddleware, async (req, res) => {
  try {
    const contact = await prisma.contact.create({
      data: {
        ...req.body,
        userId: req.user.id
      }
    });

    // Log activity
    await prisma.activity.create({
      data: {
        userId: req.user.id,
        contactId: contact.id,
        type: 'contact_created',
        title: 'Contact created',
        description: `${contact.firstName} ${contact.lastName} was added to contacts`
      }
    });

    res.json(contact);
  } catch (error) {
    console.error('Error creating contact:', error);
    res.status(500).json({ error: 'Failed to create contact' });
  }
});

// Update contact
router.patch('/contacts/:id', authMiddleware, async (req, res) => {
  try {
    const contact = await prisma.contact.findFirst({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    const updated = await prisma.contact.update({
      where: { id: req.params.id },
      data: req.body
    });

    res.json(updated);
  } catch (error) {
    console.error('Error updating contact:', error);
    res.status(500).json({ error: 'Failed to update contact' });
  }
});

// Delete contact
router.delete('/contacts/:id', authMiddleware, async (req, res) => {
  try {
    const contact = await prisma.contact.findFirst({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    await prisma.contact.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Contact deleted successfully' });
  } catch (error) {
    console.error('Error deleting contact:', error);
    res.status(500).json({ error: 'Failed to delete contact' });
  }
});

// ============================================
// DEALS
// ============================================

// Get all deals
router.get('/deals', authMiddleware, async (req, res) => {
  try {
    const { stage } = req.query;

    const where = { userId: req.user.id };
    if (stage) {
      where.stage = stage;
    }

    const deals = await prisma.deal.findMany({
      where,
      include: {
        contact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            company: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(deals);
  } catch (error) {
    console.error('Error fetching deals:', error);
    res.status(500).json({ error: 'Failed to fetch deals' });
  }
});

// Create deal
router.post('/deals', authMiddleware, async (req, res) => {
  try {
    const deal = await prisma.deal.create({
      data: {
        ...req.body,
        userId: req.user.id
      },
      include: {
        contact: true
      }
    });

    // Log activity
    await prisma.activity.create({
      data: {
        userId: req.user.id,
        contactId: deal.contactId,
        type: 'deal_created',
        title: 'Deal created',
        description: `Deal "${deal.title}" worth £${deal.value} created`
      }
    });

    res.json(deal);
  } catch (error) {
    console.error('Error creating deal:', error);
    res.status(500).json({ error: 'Failed to create deal' });
  }
});

// Update deal (move stage, etc.)
router.patch('/deals/:id', authMiddleware, async (req, res) => {
  try {
    const deal = await prisma.deal.findFirst({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!deal) {
      return res.status(404).json({ error: 'Deal not found' });
    }

    const updated = await prisma.deal.update({
      where: { id: req.params.id },
      data: req.body,
      include: { contact: true }
    });

    // Log stage change
    if (req.body.stage && req.body.stage !== deal.stage) {
      await prisma.activity.create({
        data: {
          userId: req.user.id,
          contactId: updated.contactId,
          type: 'deal_stage_changed',
          title: 'Deal stage updated',
          description: `Deal "${updated.title}" moved to ${req.body.stage}`
        }
      });
    }

    res.json(updated);
  } catch (error) {
    console.error('Error updating deal:', error);
    res.status(500).json({ error: 'Failed to update deal' });
  }
});

// Delete deal
router.delete('/deals/:id', authMiddleware, async (req, res) => {
  try {
    const deal = await prisma.deal.findFirst({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!deal) {
      return res.status(404).json({ error: 'Deal not found' });
    }

    await prisma.deal.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Deal deleted successfully' });
  } catch (error) {
    console.error('Error deleting deal:', error);
    res.status(500).json({ error: 'Failed to delete deal' });
  }
});

// ============================================
// TASKS
// ============================================

// Get all tasks
router.get('/tasks', authMiddleware, async (req, res) => {
  try {
    const { completed, contactId, view } = req.query;

    const where = { userId: req.user.id };

    if (completed !== undefined) {
      where.completed = completed === 'true';
    }

    if (contactId) {
      where.contactId = contactId;
    }

    // View filters
    if (view === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      where.dueDate = {
        gte: today,
        lt: tomorrow
      };
    } else if (view === 'week') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);

      where.dueDate = {
        gte: today,
        lt: nextWeek
      };
    } else if (view === 'overdue') {
      where.dueDate = {
        lt: new Date()
      };
      where.completed = false;
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        contact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: [
        { completed: 'asc' },
        { dueDate: 'asc' }
      ]
    });

    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Create task
router.post('/tasks', authMiddleware, async (req, res) => {
  try {
    const task = await prisma.task.create({
      data: {
        ...req.body,
        userId: req.user.id
      },
      include: {
        contact: true
      }
    });

    res.json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// Update task
router.patch('/tasks/:id', authMiddleware, async (req, res) => {
  try {
    const task = await prisma.task.findFirst({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const updated = await prisma.task.update({
      where: { id: req.params.id },
      data: req.body,
      include: { contact: true }
    });

    res.json(updated);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// Toggle task completion
router.patch('/tasks/:id/complete', authMiddleware, async (req, res) => {
  try {
    const task = await prisma.task.findFirst({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const updated = await prisma.task.update({
      where: { id: req.params.id },
      data: {
        completed: !task.completed,
        completedAt: !task.completed ? new Date() : null
      },
      include: { contact: true }
    });

    // Log activity if task has contact
    if (updated.contactId && updated.completed) {
      await prisma.activity.create({
        data: {
          userId: req.user.id,
          contactId: updated.contactId,
          type: 'task_completed',
          title: 'Task completed',
          description: `Task "${updated.title}" marked as complete`
        }
      });
    }

    res.json(updated);
  } catch (error) {
    console.error('Error toggling task:', error);
    res.status(500).json({ error: 'Failed to toggle task' });
  }
});

// Delete task
router.delete('/tasks/:id', authMiddleware, async (req, res) => {
  try {
    const task = await prisma.task.findFirst({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    await prisma.task.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// ============================================
// ACTIVITIES
// ============================================

// Get contact activities
router.get('/contacts/:contactId/activities', authMiddleware, async (req, res) => {
  try {
    const activities = await prisma.activity.findMany({
      where: {
        contactId: req.params.contactId,
        userId: req.user.id
      },
      orderBy: { createdAt: 'desc' },
      take: 100
    });

    res.json(activities);
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

// Create activity
router.post('/contacts/:contactId/activities', authMiddleware, async (req, res) => {
  try {
    const activity = await prisma.activity.create({
      data: {
        ...req.body,
        userId: req.user.id,
        contactId: req.params.contactId
      }
    });

    res.json(activity);
  } catch (error) {
    console.error('Error creating activity:', error);
    res.status(500).json({ error: 'Failed to create activity' });
  }
});

// ============================================
// STATISTICS
// ============================================

// Get CRM dashboard stats
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get counts
    const totalContacts = await prisma.contact.count({ where: { userId } });
    const activeDeals = await prisma.deal.count({
      where: {
        userId,
        stage: { notIn: ['closed_won', 'closed_lost'] }
      }
    });

    // New contacts this month
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const newContactsThisMonth = await prisma.contact.count({
      where: {
        userId,
        createdAt: { gte: monthStart }
      }
    });

    // Total pipeline value
    const deals = await prisma.deal.findMany({
      where: {
        userId,
        stage: { notIn: ['closed_won', 'closed_lost'] }
      }
    });

    const totalPipelineValue = deals.reduce((sum, deal) => sum + deal.value, 0);

    // Tasks due today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const tasksDueToday = await prisma.task.count({
      where: {
        userId,
        completed: false,
        dueDate: {
          gte: today,
          lt: tomorrow
        }
      }
    });

    res.json({
      totalContacts,
      newContactsThisMonth,
      activeDeals,
      totalPipelineValue,
      tasksDueToday
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

export default router;
