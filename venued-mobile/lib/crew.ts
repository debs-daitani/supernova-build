import { CrewTask, CrewStats } from './types';
import confetti from 'canvas-confetti';

const STORAGE_KEYS = {
  CREW_TASKS: 'venued_crew_tasks',
  CREW_STATS: 'venued_crew_stats',
  ACTIVE_FOCUS: 'venued_active_focus',
};

// Tasks
export const getCrewTasks = (): CrewTask[] => {
  if (typeof window === 'undefined') return [];

  try {
    const data = localStorage.getItem(STORAGE_KEYS.CREW_TASKS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading crew tasks:', error);
    return [];
  }
};

export const saveCrewTasks = (tasks: CrewTask[]): void => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEYS.CREW_TASKS, JSON.stringify(tasks));
  } catch (error) {
    console.error('Error saving crew tasks:', error);
  }
};

export const addCrewTask = (task: CrewTask): void => {
  const tasks = getCrewTasks();
  tasks.push(task);
  saveCrewTasks(tasks);
};

export const updateCrewTask = (id: string, updates: Partial<CrewTask>): void => {
  const tasks = getCrewTasks();
  const index = tasks.findIndex(t => t.id === id);

  if (index !== -1) {
    tasks[index] = { ...tasks[index], ...updates };
    saveCrewTasks(tasks);
  }
};

export const deleteCrewTask = (id: string): void => {
  const tasks = getCrewTasks();
  const filtered = tasks.filter(t => t.id !== id);
  saveCrewTasks(filtered);
};

export const toggleCrewTaskComplete = (id: string): CrewTask | null => {
  const tasks = getCrewTasks();
  const task = tasks.find(t => t.id === id);

  if (task) {
    const wasCompleted = task.completed;
    const now = new Date().toISOString();

    task.completed = !wasCompleted;
    task.completedAt = task.completed ? now : undefined;

    saveCrewTasks(tasks);

    // Trigger confetti if completing
    if (task.completed && !wasCompleted) {
      celebrateCompletion();
    }

    return task;
  }

  return null;
};

// Stats
export const getCrewStats = (): CrewStats => {
  if (typeof window === 'undefined') {
    return {
      todayCompleted: 0,
      todayTotal: 0,
      focusMinutes: 0,
      currentEnergy: 'medium',
    };
  }

  try {
    const data = localStorage.getItem(STORAGE_KEYS.CREW_STATS);
    return data ? JSON.parse(data) : {
      todayCompleted: 0,
      todayTotal: 0,
      focusMinutes: 0,
      currentEnergy: 'medium',
    };
  } catch (error) {
    console.error('Error loading crew stats:', error);
    return {
      todayCompleted: 0,
      todayTotal: 0,
      focusMinutes: 0,
      currentEnergy: 'medium',
    };
  }
};

export const updateCrewStats = (stats: Partial<CrewStats>): void => {
  if (typeof window === 'undefined') return;

  try {
    const currentStats = getCrewStats();
    const newStats = { ...currentStats, ...stats };
    localStorage.setItem(STORAGE_KEYS.CREW_STATS, JSON.stringify(newStats));
  } catch (error) {
    console.error('Error saving crew stats:', error);
  }
};

export const calculateCrewStats = (): CrewStats => {
  const tasks = getCrewTasks();
  const today = new Date().toISOString().split('T')[0];

  const todayTasks = tasks.filter(t => {
    if (!t.scheduledDate) return false;
    return t.scheduledDate === today;
  });

  const todayCompleted = todayTasks.filter(t => t.completed).length;
  const focusMinutes = tasks.reduce((sum, t) => sum + t.timeSpent, 0);

  const currentStats = getCrewStats();

  return {
    todayCompleted,
    todayTotal: todayTasks.length,
    focusMinutes,
    currentEnergy: currentStats.currentEnergy,
  };
};

// Confetti celebration
export const celebrateCompletion = (): void => {
  if (typeof window === 'undefined') return;

  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#FF1B8D', '#9D4EDD', '#39FF14', '#FFFFFF'],
  });
};

export const celebrateAllComplete = (): void => {
  if (typeof window === 'undefined') return;

  // Big celebration
  const duration = 3000;
  const end = Date.now() + duration;

  const frame = () => {
    confetti({
      particleCount: 7,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ['#FF1B8D', '#9D4EDD', '#39FF14'],
    });
    confetti({
      particleCount: 7,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ['#FF1B8D', '#9D4EDD', '#39FF14'],
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };

  frame();
};

// Sample crew tasks
export const generateSampleCrewTasks = (): CrewTask[] => {
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  return [
    {
      id: 'crew-task-1',
      title: 'Review pull requests',
      description: 'Check the 3 PRs waiting for review',
      phaseId: 'daily',
      energyLevel: 'medium',
      estimatedHours: 1,
      difficulty: 'medium',
      isHyperfocus: false,
      isQuickWin: false,
      dependencies: [],
      completed: false,
      order: 0,
      createdAt: new Date().toISOString(),
      scheduledDate: today,
      scheduledTime: '09:00',
      timeSpent: 0,
    },
    {
      id: 'crew-task-2',
      title: 'Write blog post outline',
      description: 'Draft structure for next week\'s post',
      phaseId: 'content',
      energyLevel: 'high',
      estimatedHours: 2,
      difficulty: 'medium',
      isHyperfocus: true,
      isQuickWin: false,
      dependencies: [],
      completed: false,
      order: 1,
      createdAt: new Date().toISOString(),
      scheduledDate: today,
      scheduledTime: '10:00',
      timeSpent: 0,
    },
    {
      id: 'crew-task-3',
      title: 'Update project README',
      description: 'Add installation instructions',
      phaseId: 'docs',
      energyLevel: 'low',
      estimatedHours: 0.5,
      difficulty: 'easy',
      isHyperfocus: false,
      isQuickWin: true,
      dependencies: [],
      completed: false,
      order: 2,
      createdAt: new Date().toISOString(),
      scheduledDate: today,
      scheduledTime: '14:00',
      timeSpent: 0,
    },
    {
      id: 'crew-task-4',
      title: 'Plan sprint goals',
      description: 'Define objectives for next sprint',
      phaseId: 'planning',
      energyLevel: 'medium',
      estimatedHours: 1.5,
      difficulty: 'medium',
      isHyperfocus: false,
      isQuickWin: false,
      dependencies: [],
      completed: false,
      order: 3,
      createdAt: new Date().toISOString(),
      scheduledDate: tomorrow,
      scheduledTime: '09:00',
      timeSpent: 0,
    },
  ];
};

export const initializeSampleCrewTasks = (): void => {
  const existing = getCrewTasks();

  if (existing.length === 0) {
    const samples = generateSampleCrewTasks();
    saveCrewTasks(samples);

    const stats = calculateCrewStats();
    updateCrewStats(stats);
  }
};
