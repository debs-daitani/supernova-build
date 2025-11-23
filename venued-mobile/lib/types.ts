export type ProjectStatus = 'planning' | 'live' | 'complete';

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  startDate: string;
  targetDate: string;
  progress: number; // 0-100
  tasksTotal: number;
  tasksCompleted: number;
  priority: 'low' | 'medium' | 'high';
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface BackstageStats {
  activeProjects: number;
  tasksCompleted: number;
  hoursLogged: number;
  milestonesHit: number;
}

export interface ProjectFormData {
  name: string;
  description: string;
  startDate: string;
  targetDate: string;
  priority: 'low' | 'medium' | 'high';
  tags: string[];
}

// Setlist Builder Types
export type EnergyLevel = 'high' | 'medium' | 'low';
export type TaskDifficulty = 'easy' | 'medium' | 'hard';

export interface Task {
  id: string;
  title: string;
  description: string;
  phaseId: string;
  energyLevel: EnergyLevel;
  estimatedHours: number;
  difficulty: TaskDifficulty;
  isHyperfocus: boolean; // Needs deep focus
  isQuickWin: boolean; // Easy win for motivation
  dependencies: string[]; // Task IDs this depends on
  completed: boolean;
  order: number;
  createdAt: string;
}

export interface Phase {
  id: string;
  name: string;
  description: string;
  order: number;
  tasks: Task[];
  color: string; // For visual distinction
}

export interface ProjectBuilder extends Omit<Project, 'progress' | 'tasksTotal' | 'tasksCompleted'> {
  phases: Phase[];
  goal: string; // What success looks like
}

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  phases: Omit<Phase, 'tasks'>[];
  suggestedTasks: Omit<Task, 'id' | 'phaseId' | 'createdAt' | 'order'>[];
}

// Crew (Task Manager) Types
export type CrewView = 'list' | 'energy' | 'timeline';
export type DateFilter = 'today' | 'tomorrow' | 'week';

export interface FocusSession {
  taskId: string;
  startTime: string;
  duration: number; // minutes
  completed: boolean;
}

export interface CrewTask extends Task {
  scheduledDate?: string;
  scheduledTime?: string; // HH:MM format
  timeSpent: number; // minutes
  completedAt?: string;
}

export interface CrewStats {
  todayCompleted: number;
  todayTotal: number;
  focusMinutes: number;
  currentEnergy: EnergyLevel;
}

// Tour (Timeline) Types
export type TourView = 'week' | 'month' | 'gantt';

export interface DayWorkload {
  date: string; // YYYY-MM-DD
  tasks: CrewTask[];
  totalHours: number;
  energyDistribution: {
    high: number;
    medium: number;
    low: number;
  };
  isOverloaded: boolean; // > 8 hours
  isUnrealistic: boolean; // > 12 hours
}

export interface TimelineProject extends Project {
  color: string;
  tasksCount: number;
}

// Entourage (ADHD Support Tools) Types
export interface TimeTrackingEntry {
  id: string;
  taskId?: string;
  taskName: string;
  taskType: string;
  estimatedMinutes: number;
  actualMinutes: number;
  date: string;
  energyLevel: EnergyLevel;
}

export interface HyperfocusSession {
  id: string;
  startTime: string;
  endTime: string;
  duration: number; // minutes
  trigger: string;
  taskType: string;
  taskName: string;
  productivityRating: number; // 1-5
  notes?: string;
}

export interface EnergyLog {
  id: string;
  timestamp: string;
  level: EnergyLevel;
  notes?: string;
}

export interface BrainDump {
  id: string;
  content: string;
  timestamp: string;
  converted: boolean;
  convertedToTaskId?: string;
  archived: boolean;
  tags?: string[];
}

export interface DopamineReward {
  id: string;
  reward: string;
  category: 'break' | 'treat' | 'social' | 'movement' | 'creative' | 'other';
  usageCount: number;
  motivationRating?: number; // 1-5
}

export interface ADHDData {
  timeTracking: TimeTrackingEntry[];
  hyperfocusSessions: HyperfocusSession[];
  energyLogs: EnergyLog[];
  brainDumps: BrainDump[];
  dopamineMenu: DopamineReward[];
}

export interface TimeBlindnessStats {
  averageMultiplier: number;
  totalEntries: number;
  byTaskType: { [key: string]: number };
  byEnergyLevel: { [key in EnergyLevel]: number };
}

export interface HyperfocusStats {
  averageDuration: number;
  totalSessions: number;
  commonTriggers: string[];
  bestTimeOfDay: string;
  productivityAverage: number;
}

export interface EnergyStats {
  peakTimes: string[];
  averageByHour: { [hour: number]: EnergyLevel };
  patterns: string[];
}
