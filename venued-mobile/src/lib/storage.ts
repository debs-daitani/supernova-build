import AsyncStorage from '@react-native-async-storage/async-storage';
import { Project, CrewTask, ADHDData } from '../types';

const KEYS = {
  PROJECTS: 'venued_projects',
  CREW_TASKS: 'venued_crew_tasks',
  ADHD_DATA: 'venued_adhd_data',
  DEMO_LOADED: 'demo_data_loaded',
};

// Projects
export const getProjects = async (): Promise<Project[]> => {
  try {
    const data = await AsyncStorage.getItem(KEYS.PROJECTS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading projects:', error);
    return [];
  }
};

export const saveProjects = async (projects: Project[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(KEYS.PROJECTS, JSON.stringify(projects));
  } catch (error) {
    console.error('Error saving projects:', error);
  }
};

export const addProject = async (project: Project): Promise<void> => {
  const projects = await getProjects();
  projects.push(project);
  await saveProjects(projects);
};

export const updateProject = async (projectId: string, updates: Partial<Project>): Promise<void> => {
  const projects = await getProjects();
  const index = projects.findIndex(p => p.id === projectId);
  if (index !== -1) {
    projects[index] = { ...projects[index], ...updates, updatedAt: new Date().toISOString() };
    await saveProjects(projects);
  }
};

export const deleteProject = async (projectId: string): Promise<void> => {
  const projects = await getProjects();
  const filtered = projects.filter(p => p.id !== projectId);
  await saveProjects(filtered);
};

// Crew Tasks
export const getCrewTasks = async (): Promise<CrewTask[]> => {
  try {
    const data = await AsyncStorage.getItem(KEYS.CREW_TASKS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading crew tasks:', error);
    return [];
  }
};

export const saveCrewTasks = async (tasks: CrewTask[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(KEYS.CREW_TASKS, JSON.stringify(tasks));
  } catch (error) {
    console.error('Error saving crew tasks:', error);
  }
};

export const addCrewTask = async (task: CrewTask): Promise<void> => {
  const tasks = await getCrewTasks();
  tasks.push(task);
  await saveCrewTasks(tasks);
};

export const updateCrewTask = async (taskId: string, updates: Partial<CrewTask>): Promise<void> => {
  const tasks = await getCrewTasks();
  const index = tasks.findIndex(t => t.id === taskId);
  if (index !== -1) {
    tasks[index] = { ...tasks[index], ...updates };
    await saveCrewTasks(tasks);
  }
};

export const deleteCrewTask = async (taskId: string): Promise<void> => {
  const tasks = await getCrewTasks();
  const filtered = tasks.filter(t => t.id !== taskId);
  await saveCrewTasks(filtered);
};

// ADHD Data
export const getADHDData = async (): Promise<ADHDData> => {
  try {
    const data = await AsyncStorage.getItem(KEYS.ADHD_DATA);
    return data ? JSON.parse(data) : { brainDumps: [], energyLogs: [], hyperfocusSessions: [] };
  } catch (error) {
    console.error('Error loading ADHD data:', error);
    return { brainDumps: [], energyLogs: [], hyperfocusSessions: [] };
  }
};

export const saveADHDData = async (data: ADHDData): Promise<void> => {
  try {
    await AsyncStorage.setItem(KEYS.ADHD_DATA, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving ADHD data:', error);
  }
};

// Demo Data
export const isDemoDataLoaded = async (): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem(KEYS.DEMO_LOADED);
    return value === 'true';
  } catch (error) {
    return false;
  }
};

export const markDemoDataLoaded = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(KEYS.DEMO_LOADED, 'true');
  } catch (error) {
    console.error('Error marking demo data:', error);
  }
};

// Clear all data
export const clearAllData = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([
      KEYS.PROJECTS,
      KEYS.CREW_TASKS,
      KEYS.ADHD_DATA,
      KEYS.DEMO_LOADED,
    ]);
  } catch (error) {
    console.error('Error clearing data:', error);
  }
};
