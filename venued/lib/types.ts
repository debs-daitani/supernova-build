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
