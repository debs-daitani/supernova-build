import { saveProjects } from './storage';
import { addCrewTask } from './crew';
import { addBrainDump, addEnergyLog, addHyperfocusSession, addTimeTrackingEntry } from './adhd';
import { Project, CrewTask, EnergyLevel } from './types';

export const generateDemoData = () => {
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
      description: 'Complete product launch from planning to release. Includes website, marketing materials, and initial customer outreach.',
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
      description: 'Develop and launch comprehensive online course including video content, workbooks, and community setup.',
      status: 'planning',
      startDate: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      targetDate: new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      progress: 25,
      tasksTotal: 18,
      tasksCompleted: 4,
      priority: 'medium',
      tags: ['Education', 'Content', 'Video'],
      createdAt: yesterday.toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'demo-3',
      name: 'Website Redesign',
      description: 'Complete overhaul of company website with modern design, improved UX, and better performance.',
      status: 'complete',
      startDate: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      targetDate: yesterday.toISOString().split('T')[0],
      progress: 100,
      tasksTotal: 15,
      tasksCompleted: 15,
      priority: 'low',
      tags: ['Design', 'Development', 'Web'],
      createdAt: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: yesterday.toISOString(),
    },
  ];

  // Demo Crew Tasks
  const demoTasks: Omit<CrewTask, 'id'>[] = [
    {
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
      title: 'Design social media graphics',
      description: 'Create Instagram and Twitter graphics for launch announcement',
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
    {
      title: 'Send outreach emails',
      description: 'Contact 10 potential partners',
      phaseId: 'outreach',
      energyLevel: 'low',
      estimatedHours: 1,
      difficulty: 'easy',
      isHyperfocus: false,
      isQuickWin: true,
      dependencies: [],
      completed: true,
      order: 4,
      createdAt: yesterday.toISOString(),
      timeSpent: 45,
      completedAt: yesterday.toISOString(),
    },
  ];

  // Demo Brain Dumps
  const demoBrainDumps = [
    {
      content: 'Need to remember to follow up with Sarah about the collaboration opportunity. She mentioned being interested in the Q2 launch.',
      timestamp: new Date(today.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      converted: false,
      archived: false,
    },
    {
      content: 'Idea: What if we created a template library for common project types? Could save users tons of time.',
      timestamp: new Date(today.getTime() - 5 * 60 * 60 * 1000).toISOString(),
      converted: false,
      archived: false,
    },
    {
      content: 'Remember to update the pricing page before launch. Also need to add FAQ section.',
      timestamp: yesterday.toISOString(),
      converted: true,
      archived: false,
    },
  ];

  // Demo Energy Logs
  const demoEnergyLogs = [
    { timestamp: new Date(today.setHours(9, 0, 0, 0)).toISOString(), level: 'high' as EnergyLevel },
    { timestamp: new Date(today.setHours(11, 0, 0, 0)).toISOString(), level: 'high' as EnergyLevel },
    { timestamp: new Date(today.setHours(14, 0, 0, 0)).toISOString(), level: 'medium' as EnergyLevel },
    { timestamp: new Date(today.setHours(16, 30, 0, 0)).toISOString(), level: 'low' as EnergyLevel },
    { timestamp: new Date(yesterday.setHours(10, 0, 0, 0)).toISOString(), level: 'high' as EnergyLevel },
    { timestamp: new Date(yesterday.setHours(15, 0, 0, 0)).toISOString(), level: 'medium' as EnergyLevel },
  ];

  // Demo Hyperfocus Sessions
  const demoHyperfocusSessions = [
    {
      startTime: new Date(yesterday.setHours(10, 0, 0, 0)).toISOString(),
      endTime: new Date(yesterday.setHours(13, 30, 0, 0)).toISOString(),
      duration: 210,
      trigger: 'Interesting problem',
      taskType: 'Coding',
      taskName: 'Build new feature',
      productivityRating: 5,
      notes: 'Got completely in the zone. Lost track of time but made amazing progress!',
    },
    {
      startTime: new Date(today.setHours(9, 0, 0, 0)).toISOString(),
      endTime: new Date(today.setHours(10, 45, 0, 0)).toISOString(),
      duration: 105,
      trigger: 'Creative flow',
      taskType: 'Design',
      taskName: 'Design landing page',
      productivityRating: 4,
      notes: 'Great flow state for design work.',
    },
  ];

  // Demo Time Tracking
  const demoTimeTracking = [
    {
      taskName: 'Write blog post',
      taskType: 'Writing',
      estimatedMinutes: 60,
      actualMinutes: 120,
      date: yesterday.toISOString().split('T')[0],
      energyLevel: 'high' as EnergyLevel,
    },
    {
      taskName: 'Code review',
      taskType: 'Review',
      estimatedMinutes: 30,
      actualMinutes: 45,
      date: yesterday.toISOString().split('T')[0],
      energyLevel: 'medium' as EnergyLevel,
    },
    {
      taskName: 'Design mockups',
      taskType: 'Design',
      estimatedMinutes: 90,
      actualMinutes: 150,
      date: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      energyLevel: 'high' as EnergyLevel,
    },
  ];

  // Save all demo data
  saveProjects(demoProjects);

  demoTasks.forEach(task => {
    addCrewTask({
      ...task,
      id: `demo-task-${Date.now()}-${Math.random()}`,
    });
  });

  demoBrainDumps.forEach(dump => {
    addBrainDump(dump);
  });

  demoEnergyLogs.forEach(log => {
    addEnergyLog(log);
  });

  demoHyperfocusSessions.forEach(session => {
    addHyperfocusSession(session);
  });

  demoTimeTracking.forEach(entry => {
    addTimeTrackingEntry(entry);
  });

  // Mark demo as loaded
  localStorage.setItem('demo_data_loaded', 'true');
};

export const clearAllData = () => {
  localStorage.clear();
};

export const isDemoDataLoaded = (): boolean => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('demo_data_loaded') === 'true';
};

export const exportData = () => {
  const data = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    data: {
      projects: localStorage.getItem('venued_projects'),
      crewTasks: localStorage.getItem('venued_crew_tasks'),
      adhdData: localStorage.getItem('venued_adhd_data'),
      userProfile: localStorage.getItem('venued_user_profile'),
      userPreferences: localStorage.getItem('venued_user_preferences'),
      achievements: localStorage.getItem('venued_achievements_unlocked'),
    },
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `venued-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);

  // Mark achievement
  try {
    const { markDataExportAchievement } = require('./achievements');
    markDataExportAchievement();
  } catch (e) {
    // Ignore if achievements not available
  }
};

export const importData = (file: File): Promise<void> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);

        if (data.data.projects) {
          localStorage.setItem('venued_projects', data.data.projects);
        }
        if (data.data.crewTasks) {
          localStorage.setItem('venued_crew_tasks', data.data.crewTasks);
        }
        if (data.data.adhdData) {
          localStorage.setItem('venued_adhd_data', data.data.adhdData);
        }
        if (data.data.userProfile) {
          localStorage.setItem('venued_user_profile', data.data.userProfile);
        }
        if (data.data.userPreferences) {
          localStorage.setItem('venued_user_preferences', data.data.userPreferences);
        }
        if (data.data.achievements) {
          localStorage.setItem('venued_achievements_unlocked', data.data.achievements);
        }

        resolve();
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
};
