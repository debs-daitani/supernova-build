import { Project, BackstageStats } from './types';

const STORAGE_KEYS = {
  PROJECTS: 'venued_projects',
  STATS: 'venued_stats',
};

// Projects
export const getProjects = (): Project[] => {
  if (typeof window === 'undefined') return [];

  try {
    const data = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading projects:', error);
    return [];
  }
};

export const saveProjects = (projects: Project[]): void => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  } catch (error) {
    console.error('Error saving projects:', error);
  }
};

export const addProject = (project: Project): void => {
  const projects = getProjects();
  projects.unshift(project); // Add to beginning
  saveProjects(projects);
};

export const updateProject = (id: string, updates: Partial<Project>): void => {
  const projects = getProjects();
  const index = projects.findIndex(p => p.id === id);

  if (index !== -1) {
    projects[index] = {
      ...projects[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    saveProjects(projects);
  }
};

export const deleteProject = (id: string): void => {
  const projects = getProjects();
  const filtered = projects.filter(p => p.id !== id);
  saveProjects(filtered);
};

// Stats
export const getStats = (): BackstageStats => {
  if (typeof window === 'undefined') {
    return {
      activeProjects: 0,
      tasksCompleted: 0,
      hoursLogged: 0,
      milestonesHit: 0,
    };
  }

  try {
    const data = localStorage.getItem(STORAGE_KEYS.STATS);
    return data ? JSON.parse(data) : {
      activeProjects: 0,
      tasksCompleted: 0,
      hoursLogged: 0,
      milestonesHit: 0,
    };
  } catch (error) {
    console.error('Error loading stats:', error);
    return {
      activeProjects: 0,
      tasksCompleted: 0,
      hoursLogged: 0,
      milestonesHit: 0,
    };
  }
};

export const updateStats = (stats: Partial<BackstageStats>): void => {
  if (typeof window === 'undefined') return;

  try {
    const currentStats = getStats();
    const newStats = { ...currentStats, ...stats };
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(newStats));
  } catch (error) {
    console.error('Error saving stats:', error);
  }
};

export const calculateStats = (): BackstageStats => {
  const projects = getProjects();

  const activeProjects = projects.filter(
    p => p.status === 'planning' || p.status === 'live'
  ).length;

  const tasksCompleted = projects.reduce(
    (sum, p) => sum + p.tasksCompleted,
    0
  );

  // For now, hours and milestones are from stored stats
  const currentStats = getStats();

  return {
    activeProjects,
    tasksCompleted,
    hoursLogged: currentStats.hoursLogged,
    milestonesHit: currentStats.milestonesHit,
  };
};

// Sample data generator
export const generateSampleProjects = (): Project[] => {
  return [
    {
      id: 'sample-1',
      name: 'Product Launch Tour 2025',
      description: 'Launch our flagship product with a bang. Full marketing campaign, press kit, and demo videos.',
      status: 'live',
      startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      progress: 65,
      tasksTotal: 23,
      tasksCompleted: 15,
      priority: 'high',
      tags: ['marketing', 'product', 'launch'],
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'sample-2',
      name: 'Website Redesign World Tour',
      description: 'Complete overhaul of the company website. New design, better UX, faster performance.',
      status: 'planning',
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      targetDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      progress: 20,
      tasksTotal: 35,
      tasksCompleted: 7,
      priority: 'medium',
      tags: ['design', 'web', 'development'],
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'sample-3',
      name: 'Content Creation Summer Series',
      description: 'Create 12 weeks of content: blog posts, videos, podcasts, and social media campaigns.',
      status: 'complete',
      startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      targetDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      progress: 100,
      tasksTotal: 48,
      tasksCompleted: 48,
      priority: 'medium',
      tags: ['content', 'marketing', 'social'],
      createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];
};

export const initializeSampleData = (): void => {
  const existing = getProjects();

  if (existing.length === 0) {
    const samples = generateSampleProjects();
    saveProjects(samples);

    // Update stats based on sample data
    const stats = calculateStats();
    updateStats(stats);
  }
};
