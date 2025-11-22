import { Project, CrewTask, ADHDData, EnergyLevel } from '../types';
import { saveProjects, saveCrewTasks, saveADHDData, markDemoDataLoaded } from './storage';

export const generateDemoData = async () => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  // Demo Projects
  const demoProjects: Project[] = [
    {
      id: 'demo-1',
      name: 'Launch Digital Product',
      description: 'Complete product launch from planning to release',
      status: 'live',
      startDate: yesterday.toISOString().split('T')[0],
      targetDate: nextWeek.toISOString().split('T')[0],
      progress: 65,
      tasksTotal: 24,
      tasksCompleted: 16,
      priority: 'high',
      tags: ['Product', 'Launch', 'Marketing'],
      createdAt: yesterday.toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'demo-2',
      name: 'Create Online Course',
      description: 'Develop comprehensive online course with video content',
      status: 'planning',
      startDate: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      targetDate: new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      progress: 25,
      tasksTotal: 18,
      tasksCompleted: 4,
      priority: 'medium',
      tags: ['Education', 'Content'],
      createdAt: yesterday.toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'demo-3',
      name: 'Website Redesign',
      description: 'Complete overhaul with modern design and improved UX',
      status: 'complete',
      startDate: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      targetDate: yesterday.toISOString().split('T')[0],
      progress: 100,
      tasksTotal: 15,
      tasksCompleted: 15,
      priority: 'low',
      tags: ['Design', 'Development'],
      createdAt: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: yesterday.toISOString(),
    },
  ];

  // Demo Crew Tasks
  const demoTasks: CrewTask[] = [
    {
      id: 'task-1',
      title: 'Finalize landing page copy',
      description: 'Write compelling copy for the main hero section',
      phaseId: 'content',
      energyLevel: 'high',
      estimatedHours: 2,
      difficulty: 'medium',
      isHyperfocus: true,
      isQuickWin: false,
      dependencies: [],
      completed: false,
      order: 0,
      createdAt: new Date().toISOString(),
      timeSpent: 45,
      scheduledDate: today.toISOString().split('T')[0],
      scheduledTime: '10:00',
    },
    {
      id: 'task-2',
      title: 'Review customer feedback',
      description: 'Go through all customer survey responses',
      phaseId: 'research',
      energyLevel: 'low',
      estimatedHours: 1,
      difficulty: 'easy',
      isHyperfocus: false,
      isQuickWin: true,
      dependencies: [],
      completed: false,
      order: 1,
      createdAt: new Date().toISOString(),
      timeSpent: 0,
      scheduledDate: today.toISOString().split('T')[0],
      scheduledTime: '14:00',
    },
    {
      id: 'task-3',
      title: 'Design social media graphics',
      description: 'Create Instagram and Twitter graphics',
      phaseId: 'marketing',
      energyLevel: 'high',
      estimatedHours: 3,
      difficulty: 'medium',
      isHyperfocus: true,
      isQuickWin: false,
      dependencies: [],
      completed: false,
      order: 2,
      createdAt: new Date().toISOString(),
      timeSpent: 0,
      scheduledDate: new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      scheduledTime: '11:00',
    },
    {
      id: 'task-4',
      title: 'Update documentation',
      description: 'Add API documentation for new endpoints',
      phaseId: 'development',
      energyLevel: 'medium',
      estimatedHours: 2,
      difficulty: 'medium',
      isHyperfocus: false,
      isQuickWin: false,
      dependencies: [],
      completed: true,
      order: 3,
      createdAt: yesterday.toISOString(),
      timeSpent: 120,
      completedAt: yesterday.toISOString(),
    },
  ];

  // Demo ADHD Data
  const demoADHDData: ADHDData = {
    brainDumps: [
      {
        id: 'dump-1',
        content: 'Need to follow up with Sarah about collaboration',
        timestamp: new Date(today.getTime() - 2 * 60 * 60 * 1000).toISOString(),
        converted: false,
        archived: false,
      },
      {
        id: 'dump-2',
        content: 'Idea: Template library for common project types',
        timestamp: new Date(today.getTime() - 5 * 60 * 60 * 1000).toISOString(),
        converted: false,
        archived: false,
      },
    ],
    energyLogs: [
      {
        id: 'energy-1',
        timestamp: new Date(today.setHours(9, 0, 0, 0)).toISOString(),
        level: 'high',
      },
      {
        id: 'energy-2',
        timestamp: new Date(today.setHours(14, 0, 0, 0)).toISOString(),
        level: 'medium',
      },
    ],
    hyperfocusSessions: [
      {
        id: 'focus-1',
        startTime: new Date(yesterday.setHours(10, 0, 0, 0)).toISOString(),
        endTime: new Date(yesterday.setHours(13, 30, 0, 0)).toISOString(),
        duration: 210,
        trigger: 'Interesting problem',
        taskType: 'Coding',
        taskName: 'Build new feature',
        productivityRating: 5,
        notes: 'Got completely in the zone!',
      },
    ],
  };

  // Save all demo data
  await saveProjects(demoProjects);
  await saveCrewTasks(demoTasks);
  await saveADHDData(demoADHDData);
  await markDemoDataLoaded();
};
