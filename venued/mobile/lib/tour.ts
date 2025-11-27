import { CrewTask, DayWorkload, Project, TimelineProject } from './types';
import { getCrewTasks } from './crew';
import { getProjects } from './storage';

// Generate colors for projects
const PROJECT_COLORS = [
  '#FF1B8D', // Neon Pink
  '#9D4EDD', // Electric Purple
  '#39FF14', // Neon Green
  '#00D9FF', // Cyan
  '#FF6B35', // Orange
  '#F72585', // Magenta
  '#4895EF', // Blue
  '#06FFA5', // Mint
];

export const getProjectColor = (projectId: string, index: number): string => {
  return PROJECT_COLORS[index % PROJECT_COLORS.length];
};

export const getTimelineProjects = (): TimelineProject[] => {
  const projects = getProjects();
  const tasks = getCrewTasks();

  return projects.map((project, index) => {
    const projectTasks = tasks.filter(t => t.phaseId.startsWith(project.id));
    return {
      ...project,
      color: getProjectColor(project.id, index),
      tasksCount: projectTasks.length,
    };
  });
};

// Get all tasks for a specific date range
export const getTasksForDateRange = (startDate: string, endDate: string): CrewTask[] => {
  const tasks = getCrewTasks();
  return tasks.filter(task => {
    if (!task.scheduledDate) return false;
    return task.scheduledDate >= startDate && task.scheduledDate <= endDate;
  });
};

// Calculate workload for a specific day
export const calculateDayWorkload = (date: string): DayWorkload => {
  const tasks = getCrewTasks().filter(t => t.scheduledDate === date);

  const totalHours = tasks.reduce((sum, task) => sum + task.estimatedHours, 0);

  const energyDistribution = {
    high: tasks.filter(t => t.energyLevel === 'high').reduce((sum, t) => sum + t.estimatedHours, 0),
    medium: tasks.filter(t => t.energyLevel === 'medium').reduce((sum, t) => sum + t.estimatedHours, 0),
    low: tasks.filter(t => t.energyLevel === 'low').reduce((sum, t) => sum + t.estimatedHours, 0),
  };

  return {
    date,
    tasks,
    totalHours,
    energyDistribution,
    isOverloaded: totalHours > 8,
    isUnrealistic: totalHours > 12,
  };
};

// Get week days (Mon-Sun) from a start date
export const getWeekDays = (startDate: Date): Date[] => {
  const days: Date[] = [];
  const current = new Date(startDate);

  // Get Monday of the week
  const day = current.getDay();
  const diff = current.getDate() - day + (day === 0 ? -6 : 1);
  current.setDate(diff);

  // Generate 7 days
  for (let i = 0; i < 7; i++) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return days;
};

// Format date for display
export const formatDate = (date: Date, format: 'short' | 'long' = 'short'): string => {
  if (format === 'short') {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
};

export const formatDateKey = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// Check if date is today
export const isToday = (date: Date): boolean => {
  const today = new Date();
  return formatDateKey(date) === formatDateKey(today);
};

// Check if date is in the past
export const isPast = (date: Date): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  return checkDate < today;
};

// Get workload summary for a week
export const getWeekWorkloadSummary = (startDate: Date) => {
  const days = getWeekDays(startDate);
  const workloads = days.map(day => calculateDayWorkload(formatDateKey(day)));

  const totalHours = workloads.reduce((sum, w) => sum + w.totalHours, 0);
  const overloadedDays = workloads.filter(w => w.isOverloaded).length;
  const unrealisticDays = workloads.filter(w => w.isUnrealistic).length;
  const avgHoursPerDay = totalHours / 7;

  return {
    totalHours,
    avgHoursPerDay,
    overloadedDays,
    unrealisticDays,
    workloads,
  };
};

// Get realistic multiplier suggestion
export const getRealisticMultiplier = (): number => {
  // ADHD time blindness: usually underestimate by 1.5-2x
  return 1.8;
};

// Calculate realistic timeline
export const getRealisticEstimate = (optimisticHours: number): number => {
  return optimisticHours * getRealisticMultiplier();
};

// Detect conflicts
export const detectConflicts = (date: string): string[] => {
  const workload = calculateDayWorkload(date);
  const conflicts: string[] = [];

  if (workload.isUnrealistic) {
    conflicts.push(`🚨 ${workload.totalHours}h scheduled - This is unrealistic!`);
  } else if (workload.isOverloaded) {
    conflicts.push(`⚠️ ${workload.totalHours}h scheduled - Overloaded day`);
  }

  // Check energy distribution
  const highEnergyTasks = workload.tasks.filter(t => t.energyLevel === 'high' && !t.completed);
  if (highEnergyTasks.length > 2) {
    conflicts.push(`🔥 ${highEnergyTasks.length} high-energy tasks - Too draining`);
  }

  // Check for back-to-back hyperfocus tasks
  const hyperfocusTasks = workload.tasks.filter(t => t.isHyperfocus && !t.completed);
  if (hyperfocusTasks.length > 1) {
    conflicts.push(`🧠 ${hyperfocusTasks.length} hyperfocus tasks - Needs breaks between`);
  }

  return conflicts;
};

// Suggest optimizations
export const getSuggestions = (date: string): string[] => {
  const workload = calculateDayWorkload(date);
  const suggestions: string[] = [];

  if (workload.totalHours < 4 && workload.tasks.length > 0) {
    suggestions.push(`💡 Light day - Good for recovery or quick wins`);
  }

  if (workload.tasks.filter(t => t.isQuickWin).length > 0) {
    suggestions.push(`🚀 Has quick wins - Great for momentum`);
  }

  const realistic = getRealisticEstimate(workload.totalHours);
  if (realistic > 8) {
    suggestions.push(`⏰ Realistically ${realistic.toFixed(1)}h - Consider spreading tasks`);
  }

  return suggestions;
};
