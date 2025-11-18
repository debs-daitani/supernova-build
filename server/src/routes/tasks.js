const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');

const prisma = new PrismaClient();

// ============================================================================
// PROJECTS
// ============================================================================

// Create project
router.post('/projects', authMiddleware, async (req, res) => {
  try {
    const { name, description, color, icon, view, startDate, dueDate, teamMembers } = req.body;

    const project = await prisma.project.create({
      data: {
        userId: req.user.id,
        name,
        description,
        color: color || '#FF1493',
        icon,
        view: view || 'list',
        startDate: startDate ? new Date(startDate) : null,
        dueDate: dueDate ? new Date(dueDate) : null,
        teamMembers: teamMembers || [],
      },
      include: {
        sections: true,
        tasks: {
          include: {
            subtasks: true,
            comments: true,
          },
        },
      },
    });

    res.json(project);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// Get all projects
router.get('/projects', authMiddleware, async (req, res) => {
  try {
    const { archived } = req.query;

    const projects = await prisma.project.findMany({
      where: {
        userId: req.user.id,
        archived: archived === 'true',
      },
      include: {
        sections: {
          orderBy: { order: 'asc' },
        },
        tasks: {
          where: { completed: false },
          include: {
            subtasks: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Get single project
router.get('/projects/:id', authMiddleware, async (req, res) => {
  try {
    const project = await prisma.project.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
      include: {
        sections: {
          orderBy: { order: 'asc' },
          include: {
            tasks: {
              include: {
                subtasks: true,
                comments: true,
              },
            },
          },
        },
        tasks: {
          where: { sectionId: null },
          include: {
            subtasks: true,
            comments: true,
          },
        },
      },
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// Update project
router.patch('/projects/:id', authMiddleware, async (req, res) => {
  try {
    const { name, description, color, icon, view, startDate, dueDate, teamMembers, archived } = req.body;

    const project = await prisma.project.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const updated = await prisma.project.update({
      where: { id: req.params.id },
      data: {
        name,
        description,
        color,
        icon,
        view,
        startDate: startDate ? new Date(startDate) : undefined,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        teamMembers,
        archived,
        updatedAt: new Date(),
      },
      include: {
        sections: true,
        tasks: {
          include: {
            subtasks: true,
            comments: true,
          },
        },
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// Delete project
router.delete('/projects/:id', authMiddleware, async (req, res) => {
  try {
    const project = await prisma.project.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    await prisma.project.delete({
      where: { id: req.params.id },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

// ============================================================================
// PROJECT SECTIONS
// ============================================================================

// Create section
router.post('/sections', authMiddleware, async (req, res) => {
  try {
    const { projectId, name, order } = req.body;

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: req.user.id,
      },
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const section = await prisma.projectSection.create({
      data: {
        projectId,
        name,
        order: order || 0,
      },
      include: {
        tasks: true,
      },
    });

    res.json(section);
  } catch (error) {
    console.error('Error creating section:', error);
    res.status(500).json({ error: 'Failed to create section' });
  }
});

// Update section
router.patch('/sections/:id', authMiddleware, async (req, res) => {
  try {
    const { name, order } = req.body;

    const section = await prisma.projectSection.update({
      where: { id: req.params.id },
      data: {
        name,
        order,
      },
    });

    res.json(section);
  } catch (error) {
    console.error('Error updating section:', error);
    res.status(500).json({ error: 'Failed to update section' });
  }
});

// Delete section
router.delete('/sections/:id', authMiddleware, async (req, res) => {
  try {
    await prisma.projectSection.delete({
      where: { id: req.params.id },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting section:', error);
    res.status(500).json({ error: 'Failed to delete section' });
  }
});

// ============================================================================
// TASKS
// ============================================================================

// Create task
router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      title,
      description,
      projectId,
      sectionId,
      status,
      priority,
      dueDate,
      startDate,
      assignedTo,
      tags,
      estimatedTime,
      dependsOn,
      blockedBy,
      attachments,
      subtasks,
    } = req.body;

    const task = await prisma.projectTask.create({
      data: {
        userId: req.user.id,
        projectId,
        sectionId,
        title,
        description,
        status: status || 'todo',
        priority: priority || 'medium',
        dueDate: dueDate ? new Date(dueDate) : null,
        startDate: startDate ? new Date(startDate) : null,
        assignedTo,
        tags: tags || [],
        estimatedTime,
        dependsOn: dependsOn || [],
        blockedBy: blockedBy || [],
        attachments: attachments || [],
        subtasks: subtasks ? {
          create: subtasks.map((st, idx) => ({
            title: st.title,
            completed: st.completed || false,
            order: idx,
          })),
        } : undefined,
      },
      include: {
        subtasks: {
          orderBy: { order: 'asc' },
        },
        comments: {
          orderBy: { createdAt: 'desc' },
        },
        timeEntries: true,
      },
    });

    res.json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// Get all tasks with filters
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { projectId, status, priority, assignedTo, dueDate, tags, view } = req.query;

    const where = {
      userId: req.user.id,
    };

    if (projectId) where.projectId = projectId;
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assignedTo) where.assignedTo = assignedTo;
    if (tags) where.tags = { hasSome: tags.split(',') };

    // Due date filters
    if (dueDate === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      where.dueDate = {
        gte: today,
        lt: tomorrow,
      };
    } else if (dueDate === 'overdue') {
      where.dueDate = {
        lt: new Date(),
      };
      where.completed = false;
    } else if (dueDate === 'week') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);
      where.dueDate = {
        gte: today,
        lt: nextWeek,
      };
    }

    // View-specific filters
    if (view === 'inbox') {
      where.projectId = null;
    }

    const tasks = await prisma.projectTask.findMany({
      where,
      include: {
        subtasks: {
          orderBy: { order: 'asc' },
        },
        comments: {
          orderBy: { createdAt: 'desc' },
        },
        project: {
          select: {
            id: true,
            name: true,
            color: true,
            icon: true,
          },
        },
        section: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [
        { completed: 'asc' },
        { priority: 'desc' },
        { dueDate: 'asc' },
      ],
    });

    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Get single task
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const task = await prisma.projectTask.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
      include: {
        subtasks: {
          orderBy: { order: 'asc' },
        },
        comments: {
          orderBy: { createdAt: 'desc' },
        },
        timeEntries: {
          orderBy: { startTime: 'desc' },
        },
        project: {
          select: {
            id: true,
            name: true,
            color: true,
            icon: true,
          },
        },
        section: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
});

// Update task
router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    const task = await prisma.projectTask.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const {
      title,
      description,
      projectId,
      sectionId,
      status,
      priority,
      dueDate,
      startDate,
      assignedTo,
      tags,
      estimatedTime,
      actualTime,
      dependsOn,
      blockedBy,
      attachments,
    } = req.body;

    const updated = await prisma.projectTask.update({
      where: { id: req.params.id },
      data: {
        title,
        description,
        projectId,
        sectionId,
        status,
        priority,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        startDate: startDate ? new Date(startDate) : undefined,
        assignedTo,
        tags,
        estimatedTime,
        actualTime,
        dependsOn,
        blockedBy,
        attachments,
        updatedAt: new Date(),
      },
      include: {
        subtasks: {
          orderBy: { order: 'asc' },
        },
        comments: {
          orderBy: { createdAt: 'desc' },
        },
        timeEntries: true,
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// Toggle task completion
router.patch('/:id/complete', authMiddleware, async (req, res) => {
  try {
    const task = await prisma.projectTask.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const updated = await prisma.projectTask.update({
      where: { id: req.params.id },
      data: {
        completed: !task.completed,
        completedAt: !task.completed ? new Date() : null,
        status: !task.completed ? 'done' : 'todo',
      },
      include: {
        subtasks: true,
        comments: true,
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('Error toggling task completion:', error);
    res.status(500).json({ error: 'Failed to toggle task completion' });
  }
});

// Delete task
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const task = await prisma.projectTask.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    await prisma.projectTask.delete({
      where: { id: req.params.id },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// ============================================================================
// SUBTASKS
// ============================================================================

// Add subtask
router.post('/:id/subtasks', authMiddleware, async (req, res) => {
  try {
    const { title } = req.body;

    const task = await prisma.projectTask.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
      include: { subtasks: true },
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const subtask = await prisma.subtask.create({
      data: {
        taskId: req.params.id,
        title,
        order: task.subtasks.length,
      },
    });

    res.json(subtask);
  } catch (error) {
    console.error('Error creating subtask:', error);
    res.status(500).json({ error: 'Failed to create subtask' });
  }
});

// Toggle subtask completion
router.patch('/subtasks/:id/complete', authMiddleware, async (req, res) => {
  try {
    const subtask = await prisma.subtask.findUnique({
      where: { id: req.params.id },
      include: {
        task: {
          select: { userId: true },
        },
      },
    });

    if (!subtask || subtask.task.userId !== req.user.id) {
      return res.status(404).json({ error: 'Subtask not found' });
    }

    const updated = await prisma.subtask.update({
      where: { id: req.params.id },
      data: {
        completed: !subtask.completed,
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('Error toggling subtask:', error);
    res.status(500).json({ error: 'Failed to toggle subtask' });
  }
});

// Delete subtask
router.delete('/subtasks/:id', authMiddleware, async (req, res) => {
  try {
    const subtask = await prisma.subtask.findUnique({
      where: { id: req.params.id },
      include: {
        task: {
          select: { userId: true },
        },
      },
    });

    if (!subtask || subtask.task.userId !== req.user.id) {
      return res.status(404).json({ error: 'Subtask not found' });
    }

    await prisma.subtask.delete({
      where: { id: req.params.id },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting subtask:', error);
    res.status(500).json({ error: 'Failed to delete subtask' });
  }
});

// ============================================================================
// COMMENTS
// ============================================================================

// Add comment to task
router.post('/:id/comments', authMiddleware, async (req, res) => {
  try {
    const { content, mentions } = req.body;

    const task = await prisma.projectTask.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const comment = await prisma.taskComment.create({
      data: {
        taskId: req.params.id,
        userId: req.user.id,
        content,
        mentions: mentions || [],
      },
    });

    res.json(comment);
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ error: 'Failed to create comment' });
  }
});

// Delete comment
router.delete('/comments/:id', authMiddleware, async (req, res) => {
  try {
    const comment = await prisma.taskComment.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    await prisma.taskComment.delete({
      where: { id: req.params.id },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

// ============================================================================
// TIME TRACKING
// ============================================================================

// Start time entry (timer)
router.post('/:id/time/start', authMiddleware, async (req, res) => {
  try {
    const { description } = req.body;

    const task = await prisma.projectTask.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Check if there's already a running timer
    const runningTimer = await prisma.timeEntry.findFirst({
      where: {
        userId: req.user.id,
        endTime: null,
      },
    });

    if (runningTimer) {
      return res.status(400).json({ error: 'You already have a running timer' });
    }

    const timeEntry = await prisma.timeEntry.create({
      data: {
        userId: req.user.id,
        taskId: req.params.id,
        description,
        startTime: new Date(),
      },
      include: {
        task: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    res.json(timeEntry);
  } catch (error) {
    console.error('Error starting timer:', error);
    res.status(500).json({ error: 'Failed to start timer' });
  }
});

// Stop time entry (timer)
router.patch('/time/:id/stop', authMiddleware, async (req, res) => {
  try {
    const timeEntry = await prisma.timeEntry.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
        endTime: null,
      },
    });

    if (!timeEntry) {
      return res.status(404).json({ error: 'Running timer not found' });
    }

    const endTime = new Date();
    const duration = Math.floor((endTime - timeEntry.startTime) / 1000 / 60); // Minutes

    const updated = await prisma.timeEntry.update({
      where: { id: req.params.id },
      data: {
        endTime,
        duration,
      },
      include: {
        task: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    // Update task's actual time
    const task = await prisma.projectTask.findUnique({
      where: { id: timeEntry.taskId },
      select: { actualTime: true },
    });

    await prisma.projectTask.update({
      where: { id: timeEntry.taskId },
      data: {
        actualTime: (task.actualTime || 0) + duration,
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('Error stopping timer:', error);
    res.status(500).json({ error: 'Failed to stop timer' });
  }
});

// Log time entry manually
router.post('/:id/time', authMiddleware, async (req, res) => {
  try {
    const { duration, description, date } = req.body;

    const task = await prisma.projectTask.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const startTime = date ? new Date(date) : new Date();
    const endTime = new Date(startTime.getTime() + duration * 60000);

    const timeEntry = await prisma.timeEntry.create({
      data: {
        userId: req.user.id,
        taskId: req.params.id,
        description,
        startTime,
        endTime,
        duration: parseInt(duration),
      },
      include: {
        task: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    // Update task's actual time
    await prisma.projectTask.update({
      where: { id: req.params.id },
      data: {
        actualTime: (task.actualTime || 0) + parseInt(duration),
      },
    });

    res.json(timeEntry);
  } catch (error) {
    console.error('Error logging time:', error);
    res.status(500).json({ error: 'Failed to log time' });
  }
});

// Get time entries for a task
router.get('/:id/time', authMiddleware, async (req, res) => {
  try {
    const task = await prisma.projectTask.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const timeEntries = await prisma.timeEntry.findMany({
      where: {
        taskId: req.params.id,
        userId: req.user.id,
      },
      orderBy: { startTime: 'desc' },
      include: {
        task: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    res.json(timeEntries);
  } catch (error) {
    console.error('Error fetching time entries:', error);
    res.status(500).json({ error: 'Failed to fetch time entries' });
  }
});

// Get active timer
router.get('/time/active', authMiddleware, async (req, res) => {
  try {
    const activeTimer = await prisma.timeEntry.findFirst({
      where: {
        userId: req.user.id,
        endTime: null,
      },
      include: {
        task: {
          select: {
            id: true,
            title: true,
            project: {
              select: {
                id: true,
                name: true,
                color: true,
              },
            },
          },
        },
      },
    });

    res.json(activeTimer);
  } catch (error) {
    console.error('Error fetching active timer:', error);
    res.status(500).json({ error: 'Failed to fetch active timer' });
  }
});

// Delete time entry
router.delete('/time/:id', authMiddleware, async (req, res) => {
  try {
    const timeEntry = await prisma.timeEntry.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!timeEntry) {
      return res.status(404).json({ error: 'Time entry not found' });
    }

    // Update task's actual time
    if (timeEntry.duration) {
      const task = await prisma.projectTask.findUnique({
        where: { id: timeEntry.taskId },
        select: { actualTime: true },
      });

      await prisma.projectTask.update({
        where: { id: timeEntry.taskId },
        data: {
          actualTime: Math.max(0, (task.actualTime || 0) - timeEntry.duration),
        },
      });
    }

    await prisma.timeEntry.delete({
      where: { id: req.params.id },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting time entry:', error);
    res.status(500).json({ error: 'Failed to delete time entry' });
  }
});

// ============================================================================
// HABITS
// ============================================================================

// Create habit
router.post('/habits', authMiddleware, async (req, res) => {
  try {
    const { name, description, icon, color, frequency, targetDays } = req.body;

    const habit = await prisma.habit.create({
      data: {
        userId: req.user.id,
        name,
        description,
        icon,
        color: color || '#FF1493',
        frequency: frequency || 'daily',
        targetDays: targetDays || [],
      },
      include: {
        completions: {
          orderBy: { date: 'desc' },
          take: 30,
        },
      },
    });

    res.json(habit);
  } catch (error) {
    console.error('Error creating habit:', error);
    res.status(500).json({ error: 'Failed to create habit' });
  }
});

// Get all habits
router.get('/habits', authMiddleware, async (req, res) => {
  try {
    const { archived } = req.query;

    const habits = await prisma.habit.findMany({
      where: {
        userId: req.user.id,
        archived: archived === 'true',
      },
      include: {
        completions: {
          orderBy: { date: 'desc' },
          take: 30,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(habits);
  } catch (error) {
    console.error('Error fetching habits:', error);
    res.status(500).json({ error: 'Failed to fetch habits' });
  }
});

// Update habit
router.patch('/habits/:id', authMiddleware, async (req, res) => {
  try {
    const habit = await prisma.habit.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' });
    }

    const { name, description, icon, color, frequency, targetDays, archived } = req.body;

    const updated = await prisma.habit.update({
      where: { id: req.params.id },
      data: {
        name,
        description,
        icon,
        color,
        frequency,
        targetDays,
        archived,
        updatedAt: new Date(),
      },
      include: {
        completions: {
          orderBy: { date: 'desc' },
          take: 30,
        },
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('Error updating habit:', error);
    res.status(500).json({ error: 'Failed to update habit' });
  }
});

// Mark habit complete for today
router.post('/habits/:id/complete', authMiddleware, async (req, res) => {
  try {
    const { date } = req.body;
    const completionDate = date ? new Date(date) : new Date();
    completionDate.setHours(0, 0, 0, 0);

    const habit = await prisma.habit.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
      include: {
        completions: {
          orderBy: { date: 'desc' },
        },
      },
    });

    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' });
    }

    // Check if already completed for this date
    const existingCompletion = await prisma.habitCompletion.findUnique({
      where: {
        habitId_date: {
          habitId: req.params.id,
          date: completionDate,
        },
      },
    });

    if (existingCompletion) {
      // Uncomplete (delete)
      await prisma.habitCompletion.delete({
        where: { id: existingCompletion.id },
      });

      // Recalculate streak
      const completions = await prisma.habitCompletion.findMany({
        where: { habitId: req.params.id },
        orderBy: { date: 'desc' },
      });

      let currentStreak = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (let i = 0; i < completions.length; i++) {
        const completionDate = new Date(completions[i].date);
        const expectedDate = new Date(today);
        expectedDate.setDate(expectedDate.getDate() - i);

        if (completionDate.getTime() === expectedDate.getTime()) {
          currentStreak++;
        } else {
          break;
        }
      }

      await prisma.habit.update({
        where: { id: req.params.id },
        data: { streak: currentStreak },
      });

      const updated = await prisma.habit.findUnique({
        where: { id: req.params.id },
        include: {
          completions: {
            orderBy: { date: 'desc' },
            take: 30,
          },
        },
      });

      return res.json(updated);
    }

    // Create completion
    await prisma.habitCompletion.create({
      data: {
        habitId: req.params.id,
        date: completionDate,
      },
    });

    // Calculate streak
    const completions = await prisma.habitCompletion.findMany({
      where: { habitId: req.params.id },
      orderBy: { date: 'desc' },
    });

    let currentStreak = 0;
    let longestStreak = habit.longestStreak || 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < completions.length; i++) {
      const completionDate = new Date(completions[i].date);
      const expectedDate = new Date(today);
      expectedDate.setDate(expectedDate.getDate() - i);

      if (completionDate.getTime() === expectedDate.getTime()) {
        currentStreak++;
      } else {
        break;
      }
    }

    if (currentStreak > longestStreak) {
      longestStreak = currentStreak;
    }

    await prisma.habit.update({
      where: { id: req.params.id },
      data: {
        streak: currentStreak,
        longestStreak,
      },
    });

    const updated = await prisma.habit.findUnique({
      where: { id: req.params.id },
      include: {
        completions: {
          orderBy: { date: 'desc' },
          take: 30,
        },
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('Error completing habit:', error);
    res.status(500).json({ error: 'Failed to complete habit' });
  }
});

// Delete habit
router.delete('/habits/:id', authMiddleware, async (req, res) => {
  try {
    const habit = await prisma.habit.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' });
    }

    await prisma.habit.delete({
      where: { id: req.params.id },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting habit:', error);
    res.status(500).json({ error: 'Failed to delete habit' });
  }
});

// ============================================================================
// GOALS
// ============================================================================

// Create goal
router.post('/goals', authMiddleware, async (req, res) => {
  try {
    const { title, description, goalType, targetValue, currentValue, unit, startDate, targetDate } = req.body;

    const goal = await prisma.goal.create({
      data: {
        userId: req.user.id,
        title,
        description,
        goalType,
        targetValue: parseFloat(targetValue),
        currentValue: currentValue ? parseFloat(currentValue) : 0,
        unit,
        startDate: startDate ? new Date(startDate) : new Date(),
        targetDate: new Date(targetDate),
      },
    });

    res.json(goal);
  } catch (error) {
    console.error('Error creating goal:', error);
    res.status(500).json({ error: 'Failed to create goal' });
  }
});

// Get all goals
router.get('/goals', authMiddleware, async (req, res) => {
  try {
    const { status } = req.query;

    const where = {
      userId: req.user.id,
    };

    if (status) {
      where.status = status;
    }

    const goals = await prisma.goal.findMany({
      where,
      orderBy: [
        { status: 'asc' },
        { targetDate: 'asc' },
      ],
    });

    res.json(goals);
  } catch (error) {
    console.error('Error fetching goals:', error);
    res.status(500).json({ error: 'Failed to fetch goals' });
  }
});

// Update goal (including progress)
router.patch('/goals/:id', authMiddleware, async (req, res) => {
  try {
    const goal = await prisma.goal.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    const {
      title,
      description,
      goalType,
      targetValue,
      currentValue,
      unit,
      startDate,
      targetDate,
      status,
    } = req.body;

    const updateData = {
      title,
      description,
      goalType,
      targetValue: targetValue ? parseFloat(targetValue) : undefined,
      currentValue: currentValue !== undefined ? parseFloat(currentValue) : undefined,
      unit,
      startDate: startDate ? new Date(startDate) : undefined,
      targetDate: targetDate ? new Date(targetDate) : undefined,
      status,
      updatedAt: new Date(),
    };

    // Check if goal is achieved
    if (currentValue !== undefined && targetValue !== undefined) {
      const current = parseFloat(currentValue);
      const target = parseFloat(targetValue);
      if (current >= target && status !== 'completed') {
        updateData.status = 'completed';
        updateData.achievedAt = new Date();
      }
    }

    const updated = await prisma.goal.update({
      where: { id: req.params.id },
      data: updateData,
    });

    res.json(updated);
  } catch (error) {
    console.error('Error updating goal:', error);
    res.status(500).json({ error: 'Failed to update goal' });
  }
});

// Delete goal
router.delete('/goals/:id', authMiddleware, async (req, res) => {
  try {
    const goal = await prisma.goal.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    await prisma.goal.delete({
      where: { id: req.params.id },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting goal:', error);
    res.status(500).json({ error: 'Failed to delete goal' });
  }
});

// ============================================================================
// STATISTICS
// ============================================================================

// Get dashboard stats
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - 7);

    // Tasks stats
    const [
      totalTasks,
      completedTasks,
      dueToday,
      overdue,
      completedThisWeek,
    ] = await Promise.all([
      prisma.projectTask.count({
        where: { userId: req.user.id },
      }),
      prisma.projectTask.count({
        where: { userId: req.user.id, completed: true },
      }),
      prisma.projectTask.count({
        where: {
          userId: req.user.id,
          completed: false,
          dueDate: {
            gte: today,
            lt: tomorrow,
          },
        },
      }),
      prisma.projectTask.count({
        where: {
          userId: req.user.id,
          completed: false,
          dueDate: {
            lt: today,
          },
        },
      }),
      prisma.projectTask.count({
        where: {
          userId: req.user.id,
          completed: true,
          completedAt: {
            gte: weekStart,
          },
        },
      }),
    ]);

    // Projects stats
    const activeProjects = await prisma.project.count({
      where: {
        userId: req.user.id,
        archived: false,
      },
    });

    // Habits stats
    const habits = await prisma.habit.findMany({
      where: {
        userId: req.user.id,
        archived: false,
      },
      select: {
        streak: true,
      },
    });

    const currentStreak = habits.reduce((max, h) => Math.max(max, h.streak || 0), 0);

    // Goals stats
    const [activeGoals, completedGoals] = await Promise.all([
      prisma.goal.count({
        where: {
          userId: req.user.id,
          status: 'in_progress',
        },
      }),
      prisma.goal.count({
        where: {
          userId: req.user.id,
          status: 'completed',
        },
      }),
    ]);

    // Time tracking stats
    const timeThisWeek = await prisma.timeEntry.aggregate({
      where: {
        userId: req.user.id,
        startTime: {
          gte: weekStart,
        },
      },
      _sum: {
        duration: true,
      },
    });

    res.json({
      tasks: {
        total: totalTasks,
        completed: completedTasks,
        dueToday,
        overdue,
        completedThisWeek,
      },
      projects: {
        active: activeProjects,
      },
      habits: {
        currentStreak,
      },
      goals: {
        active: activeGoals,
        completed: completedGoals,
      },
      timeTracking: {
        minutesThisWeek: timeThisWeek._sum.duration || 0,
        hoursThisWeek: ((timeThisWeek._sum.duration || 0) / 60).toFixed(1),
      },
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

module.exports = router;
