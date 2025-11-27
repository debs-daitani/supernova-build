export type ProjectStatus = 'planning' | 'live' | 'complete';
export type EnergyLevel = 'high' | 'medium' | 'low';
export type TaskDifficulty = 'easy' | 'medium' | 'hard';
export type CrewView = 'list' | 'energy' | 'timeline';
export type DateFilter = 'today' | 'tomorrow' | 'week';

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  startDate: string;
  targetDate: string;
  progress: number;
  tasksTotal: number;
  tasksCompleted: number;
  priority: 'low' | 'medium' | 'high';
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  phaseId: string;
  energyLevel: EnergyLevel;
  estimatedHours: number;
  difficulty: TaskDifficulty;
  isHyperfocus: boolean;
  isQuickWin: boolean;
  dependencies: string[];
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
  color: string;
}

export interface ProjectBuilder extends Omit<Project, 'progress' | 'tasksTotal' | 'tasksCompleted'> {
  phases: Phase[];
  goal: string;
}

export interface CrewTask extends Task {
  scheduledDate?: string;
  scheduledTime?: string;
  timeSpent: number;
  completedAt?: string;
}

export type CrewRole = 'roadie' | 'sound_engineer' | 'stage_manager' | 'lighting_tech' | 'tour_manager';

export interface CrewStats {
  todayCompleted: number;
  todayTotal: number;
  focusMinutes: number;
  currentEnergy: EnergyLevel;
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

export interface DayWorkload {
  date: string;
  tasks: CrewTask[];
  totalHours: number;
  energyDistribution: {
    high: number;
    medium: number;
    low: number;
  };
  isOverloaded: boolean;
  isUnrealistic: boolean;
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

export interface EnergyLog {
  id: string;
  timestamp: string;
  level: EnergyLevel;
  notes?: string;
}

export interface HyperfocusSession {
  id: string;
  startTime: string;
  endTime: string;
  duration: number;
  trigger: string;
  taskType: string;
  taskName: string;
  productivityRating: number;
  notes?: string;
}

export interface ADHDData {
  brainDumps: BrainDump[];
  energyLogs: EnergyLog[];
  hyperfocusSessions: HyperfocusSession[];
}
