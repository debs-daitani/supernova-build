// Gamification System for VENUED Mobile
// Rock concert crew roles, points, levels, and achievements

export type CrewRole = 'roadie' | 'sound_engineer' | 'stage_manager' | 'lighting_tech' | 'tour_manager';

export interface CrewStats {
  totalPoints: number;
  level: number;
  tasksCompleted: number;
  currentStreak: number;
  longestStreak: number;
  tasksByRole: Record<CrewRole, number>;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  points: number;
  requirement: {
    type: 'tasks' | 'streak' | 'points' | 'level' | 'role_tasks';
    value: number;
    role?: CrewRole;
  };
}

// Crew role definitions
export const CREW_ROLES: Record<CrewRole, { name: string; icon: string; description: string }> = {
  roadie: {
    name: 'Roadie',
    icon: '🔧',
    description: 'Setup and logistics tasks',
  },
  sound_engineer: {
    name: 'Sound Engineer',
    icon: '🎚️',
    description: 'Technical and system tasks',
  },
  stage_manager: {
    name: 'Stage Manager',
    icon: '📋',
    description: 'Coordination and organization',
  },
  lighting_tech: {
    name: 'Lighting Tech',
    icon: '💡',
    description: 'Creative and design tasks',
  },
  tour_manager: {
    name: 'Tour Manager',
    icon: '🎤',
    description: 'Planning and strategy',
  },
};

// Points system
export const POINTS = {
  TASK_COMPLETE: 10,
  QUICK_WIN: 5,
  HYPERFOCUS_TASK: 20,
  STREAK_BONUS: 5, // Per day in streak
  LEVEL_UP: 50,
};

// Level thresholds
export const LEVEL_THRESHOLDS = [
  0,    // Level 1
  100,  // Level 2
  250,  // Level 3
  500,  // Level 4
  1000, // Level 5
  2000, // Level 6
  3500, // Level 7
  5500, // Level 8
  8000, // Level 9
  12000, // Level 10
];

// Calculate level from points
export function getLevelFromPoints(points: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (points >= LEVEL_THRESHOLDS[i]) {
      return i + 1;
    }
  }
  return 1;
}

// Get points needed for next level
export function getPointsToNextLevel(currentPoints: number): number {
  const currentLevel = getLevelFromPoints(currentPoints);
  if (currentLevel >= LEVEL_THRESHOLDS.length) {
    return 0; // Max level reached
  }
  return LEVEL_THRESHOLDS[currentLevel] - currentPoints;
}

// Get progress to next level (0-100)
export function getProgressToNextLevel(currentPoints: number): number {
  const currentLevel = getLevelFromPoints(currentPoints);
  if (currentLevel >= LEVEL_THRESHOLDS.length) {
    return 100;
  }
  const currentThreshold = LEVEL_THRESHOLDS[currentLevel - 1];
  const nextThreshold = LEVEL_THRESHOLDS[currentLevel];
  const progress = ((currentPoints - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
  return Math.min(100, Math.max(0, progress));
}

// Calculate points for completing a task
export function calculateTaskPoints(task: {
  isQuickWin: boolean;
  isHyperfocus: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
}): number {
  let points = POINTS.TASK_COMPLETE;

  if (task.isQuickWin) {
    points += POINTS.QUICK_WIN;
  }

  if (task.isHyperfocus) {
    points += POINTS.HYPERFOCUS_TASK;
  }

  // Difficulty bonus
  if (task.difficulty === 'medium') {
    points += 5;
  } else if (task.difficulty === 'hard') {
    points += 10;
  }

  return points;
}

// Assign crew role based on task characteristics
export function assignCrewRole(task: {
  difficulty: 'easy' | 'medium' | 'hard';
  energyLevel: 'high' | 'medium' | 'low';
  isHyperfocus: boolean;
  title: string;
}): CrewRole {
  const titleLower = task.title.toLowerCase();

  // Check title keywords
  if (titleLower.includes('plan') || titleLower.includes('strategy') || titleLower.includes('schedule')) {
    return 'tour_manager';
  }
  if (titleLower.includes('design') || titleLower.includes('creative') || titleLower.includes('visual')) {
    return 'lighting_tech';
  }
  if (titleLower.includes('technical') || titleLower.includes('code') || titleLower.includes('build')) {
    return 'sound_engineer';
  }
  if (titleLower.includes('organize') || titleLower.includes('coordinate') || titleLower.includes('manage')) {
    return 'stage_manager';
  }

  // Fallback based on characteristics
  if (task.difficulty === 'hard' && task.isHyperfocus) {
    return 'sound_engineer';
  }
  if (task.energyLevel === 'high') {
    return 'lighting_tech';
  }
  if (task.difficulty === 'easy') {
    return 'roadie';
  }

  return 'stage_manager';
}

// Default achievements
export const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_task',
    title: 'First Gig',
    description: 'Complete your first task',
    icon: '🎸',
    unlocked: false,
    points: 25,
    requirement: { type: 'tasks', value: 1 },
  },
  {
    id: 'ten_tasks',
    title: 'Opening Act',
    description: 'Complete 10 tasks',
    icon: '🎤',
    unlocked: false,
    points: 50,
    requirement: { type: 'tasks', value: 10 },
  },
  {
    id: 'fifty_tasks',
    title: 'Headliner',
    description: 'Complete 50 tasks',
    icon: '⭐',
    unlocked: false,
    points: 100,
    requirement: { type: 'tasks', value: 50 },
  },
  {
    id: 'streak_7',
    title: 'Week of Shows',
    description: 'Maintain a 7-day streak',
    icon: '🔥',
    unlocked: false,
    points: 75,
    requirement: { type: 'streak', value: 7 },
  },
  {
    id: 'level_5',
    title: 'Tour Veteran',
    description: 'Reach level 5',
    icon: '🏆',
    unlocked: false,
    points: 100,
    requirement: { type: 'level', value: 5 },
  },
  {
    id: 'roadie_master',
    title: 'Master Roadie',
    description: 'Complete 20 roadie tasks',
    icon: '🔧',
    unlocked: false,
    points: 60,
    requirement: { type: 'role_tasks', value: 20, role: 'roadie' },
  },
  {
    id: 'sound_master',
    title: 'Sound Master',
    description: 'Complete 20 sound engineer tasks',
    icon: '🎚️',
    unlocked: false,
    points: 60,
    requirement: { type: 'role_tasks', value: 20, role: 'sound_engineer' },
  },
  {
    id: 'thousand_points',
    title: 'Sold Out Show',
    description: 'Earn 1000 total points',
    icon: '💎',
    unlocked: false,
    points: 150,
    requirement: { type: 'points', value: 1000 },
  },
];

// Check if achievement should be unlocked
export function checkAchievementUnlock(
  achievement: Achievement,
  stats: CrewStats
): boolean {
  if (achievement.unlocked) return false;

  const { type, value, role } = achievement.requirement;

  switch (type) {
    case 'tasks':
      return stats.tasksCompleted >= value;
    case 'streak':
      return stats.currentStreak >= value;
    case 'points':
      return stats.totalPoints >= value;
    case 'level':
      return stats.level >= value;
    case 'role_tasks':
      if (!role) return false;
      return stats.tasksByRole[role] >= value;
    default:
      return false;
  }
}
