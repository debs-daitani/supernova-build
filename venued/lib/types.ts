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
