import AsyncStorage from '@react-native-async-storage/async-storage';
import { Project, CrewTask, ADHDData } from '../types';

const KEYS = {
  PROJECTS: 'venued_projects',
  CREW_TASKS: 'venued_crew_tasks',
  ADHD_DATA: 'venued_adhd_data',
  DEMO_LOADED: 'demo_data_loaded',
  PHASES: 'venued_phases',
  CREW_STATS: 'venued_crew_stats',
  EXECUTIVE_FUNCTION: 'venued_executive_function',
  FOCUS_SESSIONS: 'venued_focus_sessions',
  TIME_TRACKING: 'venued_time_tracking',
  POWER_MESSAGE_LAST_SHOWN: 'venued_power_message_last_shown',
  POWER_MESSAGE_FAVOURITES: 'venued_power_message_favourites',
  POWER_MESSAGE_DISABLED: 'venued_power_message_disabled',
  FUCK_IT_DO_IT: 'venued_fuck_it_do_it',
};

// FUCK IT DO IT Types
export interface FuckItDoItTask {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  deadline: string; // 48 hours from creation
  completed: boolean;
  completedAt?: string;
  expired: boolean;
  notes?: string; // Notes on why they didn't hit target
}

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

// Phases
export const getPhases = async (): Promise<any[]> => {
  try {
    const data = await AsyncStorage.getItem(KEYS.PHASES);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading phases:', error);
    return [];
  }
};

export const savePhases = async (phases: any[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(KEYS.PHASES, JSON.stringify(phases));
  } catch (error) {
    console.error('Error saving phases:', error);
  }
};

// Crew Stats
export const getCrewStats = async (): Promise<any> => {
  try {
    const data = await AsyncStorage.getItem(KEYS.CREW_STATS);
    return data ? JSON.parse(data) : {
      totalPoints: 0,
      level: 1,
      tasksCompleted: 0,
      currentStreak: 0,
      longestStreak: 0,
      tasksByRole: {
        roadie: 0,
        sound_engineer: 0,
        stage_manager: 0,
        lighting_tech: 0,
        tour_manager: 0,
      },
    };
  } catch (error) {
    console.error('Error loading crew stats:', error);
    return {
      totalPoints: 0,
      level: 1,
      tasksCompleted: 0,
      currentStreak: 0,
      longestStreak: 0,
      tasksByRole: {
        roadie: 0,
        sound_engineer: 0,
        stage_manager: 0,
        lighting_tech: 0,
        tour_manager: 0,
      },
    };
  }
};

export const saveCrewStats = async (stats: any): Promise<void> => {
  try {
    await AsyncStorage.setItem(KEYS.CREW_STATS, JSON.stringify(stats));
  } catch (error) {
    console.error('Error saving crew stats:', error);
  }
};

// Executive Function Tasks
export const getExecutiveFunctionTasks = async (): Promise<any[]> => {
  try {
    const data = await AsyncStorage.getItem(KEYS.EXECUTIVE_FUNCTION);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading executive function tasks:', error);
    return [];
  }
};

export const saveExecutiveFunctionTasks = async (tasks: any[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(KEYS.EXECUTIVE_FUNCTION, JSON.stringify(tasks));
  } catch (error) {
    console.error('Error saving executive function tasks:', error);
  }
};

// Focus Sessions
export const getFocusSessions = async (): Promise<any[]> => {
  try {
    const data = await AsyncStorage.getItem(KEYS.FOCUS_SESSIONS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading focus sessions:', error);
    return [];
  }
};

export const saveFocusSession = async (session: any): Promise<void> => {
  try {
    const sessions = await getFocusSessions();
    await AsyncStorage.setItem(KEYS.FOCUS_SESSIONS, JSON.stringify([session, ...sessions]));
  } catch (error) {
    console.error('Error saving focus session:', error);
  }
};

// Time Tracking
export const getTimeTrackingData = async (): Promise<any[]> => {
  try {
    const data = await AsyncStorage.getItem(KEYS.TIME_TRACKING);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading time tracking:', error);
    return [];
  }
};

export const saveTimeTrackingEntry = async (entry: any): Promise<void> => {
  try {
    const entries = await getTimeTrackingData();
    await AsyncStorage.setItem(KEYS.TIME_TRACKING, JSON.stringify([entry, ...entries]));
  } catch (error) {
    console.error('Error saving time tracking:', error);
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
      KEYS.PHASES,
      KEYS.CREW_STATS,
      KEYS.EXECUTIVE_FUNCTION,
      KEYS.FOCUS_SESSIONS,
      KEYS.TIME_TRACKING,
    ]);
  } catch (error) {
    console.error('Error clearing data:', error);
  }
};

// Power Message Functions

// Get the date string for today (YYYY-MM-DD format)
const getTodayString = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

// Check if we should show the daily power message
export const shouldShowPowerMessage = async (): Promise<boolean> => {
  try {
    // Check if disabled
    const disabled = await AsyncStorage.getItem(KEYS.POWER_MESSAGE_DISABLED);
    if (disabled === 'true') return false;

    // Check last shown date
    const lastShown = await AsyncStorage.getItem(KEYS.POWER_MESSAGE_LAST_SHOWN);
    const today = getTodayString();

    return lastShown !== today;
  } catch (error) {
    console.error('Error checking power message:', error);
    return true; // Default to showing if error
  }
};

// Mark power message as shown today
export const markPowerMessageShown = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(KEYS.POWER_MESSAGE_LAST_SHOWN, getTodayString());
  } catch (error) {
    console.error('Error marking power message shown:', error);
  }
};

// Get favourite message IDs
export const getFavouriteMessages = async (): Promise<string[]> => {
  try {
    const data = await AsyncStorage.getItem(KEYS.POWER_MESSAGE_FAVOURITES);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting favourite messages:', error);
    return [];
  }
};

// Add a message to favourites
export const addFavouriteMessage = async (messageId: string): Promise<void> => {
  try {
    const favourites = await getFavouriteMessages();
    if (!favourites.includes(messageId)) {
      favourites.push(messageId);
      await AsyncStorage.setItem(KEYS.POWER_MESSAGE_FAVOURITES, JSON.stringify(favourites));
    }
  } catch (error) {
    console.error('Error adding favourite message:', error);
  }
};

// Remove a message from favourites
export const removeFavouriteMessage = async (messageId: string): Promise<void> => {
  try {
    const favourites = await getFavouriteMessages();
    const filtered = favourites.filter(id => id !== messageId);
    await AsyncStorage.setItem(KEYS.POWER_MESSAGE_FAVOURITES, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error removing favourite message:', error);
  }
};

// Toggle favourite status
export const toggleFavouriteMessage = async (messageId: string): Promise<boolean> => {
  try {
    const favourites = await getFavouriteMessages();
    const isFavourite = favourites.includes(messageId);

    if (isFavourite) {
      await removeFavouriteMessage(messageId);
      return false;
    } else {
      await addFavouriteMessage(messageId);
      return true;
    }
  } catch (error) {
    console.error('Error toggling favourite message:', error);
    return false;
  }
};

// Check if power messages are disabled
export const isPowerMessageDisabled = async (): Promise<boolean> => {
  try {
    const disabled = await AsyncStorage.getItem(KEYS.POWER_MESSAGE_DISABLED);
    return disabled === 'true';
  } catch (error) {
    return false;
  }
};

// Set power message disabled state
export const setPowerMessageDisabled = async (disabled: boolean): Promise<void> => {
  try {
    await AsyncStorage.setItem(KEYS.POWER_MESSAGE_DISABLED, disabled ? 'true' : 'false');
  } catch (error) {
    console.error('Error setting power message disabled:', error);
  }
};

// FUCK IT DO IT Functions

// Get all FUCK IT DO IT tasks
export const getFuckItDoItTasks = async (): Promise<FuckItDoItTask[]> => {
  try {
    const data = await AsyncStorage.getItem(KEYS.FUCK_IT_DO_IT);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading FUCK IT DO IT tasks:', error);
    return [];
  }
};

// Save all FUCK IT DO IT tasks
export const saveFuckItDoItTasks = async (tasks: FuckItDoItTask[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(KEYS.FUCK_IT_DO_IT, JSON.stringify(tasks));
  } catch (error) {
    console.error('Error saving FUCK IT DO IT tasks:', error);
  }
};

// Create a new FUCK IT DO IT task (48hr deadline)
export const createFuckItDoItTask = async (title: string, description: string): Promise<FuckItDoItTask> => {
  const now = new Date();
  const deadline = new Date(now.getTime() + 48 * 60 * 60 * 1000); // 48 hours from now

  const newTask: FuckItDoItTask = {
    id: `fidi-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title,
    description,
    createdAt: now.toISOString(),
    deadline: deadline.toISOString(),
    completed: false,
    expired: false,
  };

  const tasks = await getFuckItDoItTasks();
  tasks.unshift(newTask); // Add to beginning
  await saveFuckItDoItTasks(tasks);

  return newTask;
};

// Complete a FUCK IT DO IT task
export const completeFuckItDoItTask = async (taskId: string): Promise<void> => {
  const tasks = await getFuckItDoItTasks();
  const index = tasks.findIndex(t => t.id === taskId);
  if (index !== -1) {
    tasks[index].completed = true;
    tasks[index].completedAt = new Date().toISOString();
    await saveFuckItDoItTasks(tasks);
  }
};

// Mark task as expired and add notes
export const expireFuckItDoItTask = async (taskId: string, notes: string): Promise<void> => {
  const tasks = await getFuckItDoItTasks();
  const index = tasks.findIndex(t => t.id === taskId);
  if (index !== -1) {
    tasks[index].expired = true;
    tasks[index].notes = notes;
    await saveFuckItDoItTasks(tasks);
  }
};

// Delete a FUCK IT DO IT task
export const deleteFuckItDoItTask = async (taskId: string): Promise<void> => {
  const tasks = await getFuckItDoItTasks();
  const filtered = tasks.filter(t => t.id !== taskId);
  await saveFuckItDoItTasks(filtered);
};

// Get active FUCK IT DO IT task (not completed, not expired)
export const getActiveFuckItDoItTask = async (): Promise<FuckItDoItTask | null> => {
  const tasks = await getFuckItDoItTasks();
  const now = new Date();

  // Find active task and check if any need to be expired
  for (const task of tasks) {
    if (!task.completed && !task.expired) {
      const deadline = new Date(task.deadline);
      if (now > deadline) {
        // Task has expired - don't auto-expire, let UI handle it
        return task;
      }
      return task;
    }
  }
  return null;
};
