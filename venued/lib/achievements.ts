import { getProjects } from './storage';
import { getCrewTasks } from './crew';
import {
  getTimeTrackingEntries,
  getHyperfocusSessions,
  getEnergyLogs,
  getBrainDumps,
} from './adhd';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'projects' | 'tasks' | 'focus' | 'tracking' | 'consistency' | 'special';
  unlockedAt?: string;
  progress: number;
  maxProgress: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'cosmic';
}

export interface UserStats {
  totalProjects: number;
  completedProjects: number;
  totalTasks: number;
  completedTasks: number;
  totalFocusMinutes: number;
  hyperfocusSessions: number;
  energyLogsCount: number;
  brainDumpsCount: number;
  timeTrackingEntries: number;
  streak: number;
  level: number;
  xp: number;
}

const ACHIEVEMENT_DEFINITIONS: Omit<Achievement, 'progress' | 'unlockedAt'>[] = [
  // Project Achievements
  {
    id: 'first-project',
    name: 'First Gig',
    description: 'Create your first project',
    icon: '🎸',
    category: 'projects',
    maxProgress: 1,
    tier: 'bronze',
  },
  {
    id: 'project-5',
    name: 'Opening Act',
    description: 'Complete 5 projects',
    icon: '🎤',
    category: 'projects',
    maxProgress: 5,
    tier: 'silver',
  },
  {
    id: 'project-10',
    name: 'Headliner',
    description: 'Complete 10 projects',
    icon: '⭐',
    category: 'projects',
    maxProgress: 10,
    tier: 'gold',
  },
  {
    id: 'project-25',
    name: 'Tour Legend',
    description: 'Complete 25 projects',
    icon: '🏆',
    category: 'projects',
    maxProgress: 25,
    tier: 'platinum',
  },

  // Task Achievements
  {
    id: 'first-task',
    name: 'Sound Check',
    description: 'Complete your first task',
    icon: '✅',
    category: 'tasks',
    maxProgress: 1,
    tier: 'bronze',
  },
  {
    id: 'task-25',
    name: 'Getting Rhythm',
    description: 'Complete 25 tasks',
    icon: '🎵',
    category: 'tasks',
    maxProgress: 25,
    tier: 'silver',
  },
  {
    id: 'task-100',
    name: 'Productivity Rockstar',
    description: 'Complete 100 tasks',
    icon: '🌟',
    category: 'tasks',
    maxProgress: 100,
    tier: 'gold',
  },
  {
    id: 'task-500',
    name: 'Execution Machine',
    description: 'Complete 500 tasks',
    icon: '⚡',
    category: 'tasks',
    maxProgress: 500,
    tier: 'platinum',
  },
  {
    id: 'task-1000',
    name: 'SUPERNova',
    description: 'Complete 1000 tasks',
    icon: '💫',
    category: 'tasks',
    maxProgress: 1000,
    tier: 'cosmic',
  },

  // Focus Achievements
  {
    id: 'focus-10h',
    name: 'Focus Novice',
    description: 'Log 10 hours of focus time',
    icon: '⏱️',
    category: 'focus',
    maxProgress: 600,
    tier: 'bronze',
  },
  {
    id: 'focus-50h',
    name: 'Focus Master',
    description: 'Log 50 hours of focus time',
    icon: '🎯',
    category: 'focus',
    maxProgress: 3000,
    tier: 'silver',
  },
  {
    id: 'focus-100h',
    name: 'Flow State Legend',
    description: 'Log 100 hours of focus time',
    icon: '🧠',
    category: 'focus',
    maxProgress: 6000,
    tier: 'gold',
  },

  // Hyperfocus Achievements
  {
    id: 'hyperfocus-5',
    name: 'Zone Explorer',
    description: 'Log 5 hyperfocus sessions',
    icon: '🤘',
    category: 'focus',
    maxProgress: 5,
    tier: 'bronze',
  },
  {
    id: 'hyperfocus-25',
    name: 'Zone Warrior',
    description: 'Log 25 hyperfocus sessions',
    icon: '💪',
    category: 'focus',
    maxProgress: 25,
    tier: 'silver',
  },
  {
    id: 'hyperfocus-marathon',
    name: 'Marathon Session',
    description: 'Complete a 4+ hour hyperfocus session',
    icon: '🏃',
    category: 'focus',
    maxProgress: 1,
    tier: 'gold',
  },

  // Tracking Achievements
  {
    id: 'time-tracking-10',
    name: 'Time Detective',
    description: 'Track time for 10 tasks',
    icon: '🕵️',
    category: 'tracking',
    maxProgress: 10,
    tier: 'bronze',
  },
  {
    id: 'time-tracking-50',
    name: 'Reality Mapper',
    description: 'Track time for 50 tasks',
    icon: '🗺️',
    category: 'tracking',
    maxProgress: 50,
    tier: 'silver',
  },
  {
    id: 'energy-tracking-20',
    name: 'Energy Analyst',
    description: 'Log 20 energy check-ins',
    icon: '⚡',
    category: 'tracking',
    maxProgress: 20,
    tier: 'bronze',
  },
  {
    id: 'energy-tracking-100',
    name: 'Energy Master',
    description: 'Log 100 energy check-ins',
    icon: '🔋',
    category: 'tracking',
    maxProgress: 100,
    tier: 'gold',
  },

  // Consistency Achievements
  {
    id: 'streak-3',
    name: '3-Day Streak',
    description: 'Complete tasks for 3 days in a row',
    icon: '🤘',
    category: 'consistency',
    maxProgress: 3,
    tier: 'bronze',
  },
  {
    id: 'streak-7',
    name: 'Week Warrior',
    description: 'Complete tasks for 7 days in a row',
    icon: '📆',
    category: 'consistency',
    maxProgress: 7,
    tier: 'silver',
  },
  {
    id: 'streak-30',
    name: 'Momentum Master',
    description: 'Complete tasks for 30 days in a row',
    icon: '🌙',
    category: 'consistency',
    maxProgress: 30,
    tier: 'gold',
  },
  {
    id: 'streak-100',
    name: 'Unstoppable',
    description: 'Complete tasks for 100 days in a row',
    icon: '💎',
    category: 'consistency',
    maxProgress: 100,
    tier: 'cosmic',
  },

  // Special Achievements
  {
    id: 'brain-dump-champion',
    name: 'Brain Dump Champion',
    description: 'Create 50 brain dumps',
    icon: '🧩',
    category: 'special',
    maxProgress: 50,
    tier: 'silver',
  },
  {
    id: 'early-adopter',
    name: 'Early Adopter',
    description: 'One of the first to use VENUED',
    icon: '🚀',
    category: 'special',
    maxProgress: 1,
    tier: 'gold',
  },
  {
    id: 'data-export',
    name: 'Backup Pro',
    description: 'Export your data for the first time',
    icon: '💾',
    category: 'special',
    maxProgress: 1,
    tier: 'bronze',
  },
];

// Get user stats
export const getUserStats = (): UserStats => {
  const projects = getProjects();
  const tasks = getCrewTasks();
  const timeTracking = getTimeTrackingEntries();
  const hyperfocus = getHyperfocusSessions();
  const energyLogs = getEnergyLogs();
  const brainDumps = getBrainDumps();

  const completedProjects = projects.filter(p => p.status === 'complete').length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const totalFocusMinutes = tasks.reduce((sum, t) => sum + t.timeSpent, 0);

  // Calculate streak
  const streak = calculateStreak();

  // Calculate level and XP
  const xp = calculateXP(completedTasks, completedProjects, hyperfocus.length);
  const level = calculateLevel(xp);

  return {
    totalProjects: projects.length,
    completedProjects,
    totalTasks: tasks.length,
    completedTasks,
    totalFocusMinutes,
    hyperfocusSessions: hyperfocus.length,
    energyLogsCount: energyLogs.length,
    brainDumpsCount: brainDumps.length,
    timeTrackingEntries: timeTracking.length,
    streak,
    level,
    xp,
  };
};

// Calculate user level from XP
const calculateLevel = (xp: number): number => {
  // Level formula: sqrt(xp / 100)
  return Math.floor(Math.sqrt(xp / 100)) + 1;
};

// Calculate XP from various activities
const calculateXP = (
  completedTasks: number,
  completedProjects: number,
  hyperfocusSessions: number
): number => {
  return (
    completedTasks * 10 +
    completedProjects * 100 +
    hyperfocusSessions * 50
  );
};

// Calculate current streak
const calculateStreak = (): number => {
  const tasks = getCrewTasks();
  const completedTasks = tasks
    .filter(t => t.completed && t.completedAt)
    .sort((a, b) => {
      const dateA = new Date(a.completedAt ?? '').getTime();
      const dateB = new Date(b.completedAt ?? '').getTime();
      return dateB - dateA;
    });

  if (completedTasks.length === 0) return 0;

  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  const uniqueDates = new Set<string>();
  completedTasks.forEach(task => {
    if (task.completedAt) {
      const date = new Date(task.completedAt);
      date.setHours(0, 0, 0, 0);
      uniqueDates.add(date.toISOString().split('T')[0]);
    }
  });

  const sortedDates = Array.from(uniqueDates)
    .sort()
    .reverse();

  for (const dateStr of sortedDates) {
    const taskDate = new Date(dateStr);
    const expectedDate = new Date(currentDate);
    expectedDate.setDate(expectedDate.getDate() - streak);

    if (taskDate.toISOString().split('T')[0] === expectedDate.toISOString().split('T')[0]) {
      streak++;
    } else if (streak > 0) {
      break;
    }
  }

  return streak;
};

// Get achievements with progress
export const getAchievements = (): Achievement[] => {
  const stats = getUserStats();
  const tasks = getCrewTasks();
  const hyperfocus = getHyperfocusSessions();
  const unlocked = getUnlockedAchievements();

  return ACHIEVEMENT_DEFINITIONS.map(def => {
    let progress = 0;

    switch (def.id) {
      // Projects
      case 'first-project':
      case 'project-5':
      case 'project-10':
      case 'project-25':
        progress = stats.completedProjects;
        break;

      // Tasks
      case 'first-task':
      case 'task-25':
      case 'task-100':
      case 'task-500':
      case 'task-1000':
        progress = stats.completedTasks;
        break;

      // Focus time
      case 'focus-10h':
      case 'focus-50h':
      case 'focus-100h':
        progress = stats.totalFocusMinutes;
        break;

      // Hyperfocus
      case 'hyperfocus-5':
      case 'hyperfocus-25':
        progress = stats.hyperfocusSessions;
        break;
      case 'hyperfocus-marathon':
        const longestSession = hyperfocus.reduce(
          (max, s) => Math.max(max, s.duration),
          0
        );
        progress = longestSession >= 240 ? 1 : 0;
        break;

      // Tracking
      case 'time-tracking-10':
      case 'time-tracking-50':
        progress = stats.timeTrackingEntries;
        break;
      case 'energy-tracking-20':
      case 'energy-tracking-100':
        progress = stats.energyLogsCount;
        break;

      // Consistency
      case 'streak-3':
      case 'streak-7':
      case 'streak-30':
      case 'streak-100':
        progress = stats.streak;
        break;

      // Special
      case 'brain-dump-champion':
        progress = stats.brainDumpsCount;
        break;
      case 'early-adopter':
        progress = 1; // Auto-unlock for everyone
        break;
      case 'data-export':
        progress = unlocked.includes('data-export') ? 1 : 0;
        break;
    }

    const isUnlocked = progress >= def.maxProgress;
    const unlockedAt = unlocked.includes(def.id)
      ? localStorage.getItem(`achievement_${def.id}_date`) ?? undefined
      : undefined;

    return {
      ...def,
      progress: Math.min(progress, def.maxProgress),
      unlockedAt: isUnlocked ? unlockedAt ?? new Date().toISOString() : undefined,
    };
  });
};

// Get unlocked achievement IDs
const getUnlockedAchievements = (): string[] => {
  if (typeof window === 'undefined') return [];
  const unlocked = localStorage.getItem('venued_achievements_unlocked');
  return unlocked ? JSON.parse(unlocked) : [];
};

// Save unlocked achievement
export const unlockAchievement = (achievementId: string): void => {
  const unlocked = getUnlockedAchievements();
  if (!unlocked.includes(achievementId)) {
    unlocked.push(achievementId);
    localStorage.setItem('venued_achievements_unlocked', JSON.stringify(unlocked));
    localStorage.setItem(`achievement_${achievementId}_date`, new Date().toISOString());
  }
};

// Check for newly unlocked achievements
export const checkAchievements = (): Achievement[] => {
  const achievements = getAchievements();
  const newlyUnlocked: Achievement[] = [];

  achievements.forEach(achievement => {
    if (achievement.progress >= achievement.maxProgress && !achievement.unlockedAt) {
      unlockAchievement(achievement.id);
      newlyUnlocked.push(achievement);
    }
  });

  return newlyUnlocked;
};

// Mark data export achievement
export const markDataExportAchievement = (): void => {
  unlockAchievement('data-export');
};
