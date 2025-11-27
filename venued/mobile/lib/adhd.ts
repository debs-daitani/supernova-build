import {
  ADHDData,
  TimeTrackingEntry,
  HyperfocusSession,
  EnergyLog,
  BrainDump,
  DopamineReward,
  TimeBlindnessStats,
  HyperfocusStats,
  EnergyStats,
  EnergyLevel,
} from './types';

const STORAGE_KEY = 'venued_adhd_data';

// Get all ADHD data
export const getADHDData = (): ADHDData => {
  if (typeof window === 'undefined') {
    return {
      timeTracking: [],
      hyperfocusSessions: [],
      energyLogs: [],
      brainDumps: [],
      dopamineMenu: [],
    };
  }

  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {
      timeTracking: [],
      hyperfocusSessions: [],
      energyLogs: [],
      brainDumps: [],
      dopamineMenu: [],
    };
  } catch (error) {
    console.error('Error loading ADHD data:', error);
    return {
      timeTracking: [],
      hyperfocusSessions: [],
      energyLogs: [],
      brainDumps: [],
      dopamineMenu: [],
    };
  }
};

// Save all ADHD data
export const saveADHDData = (data: ADHDData): void => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving ADHD data:', error);
  }
};

// ============ TIME TRACKING ============

export const addTimeTrackingEntry = (entry: Omit<TimeTrackingEntry, 'id'>): void => {
  const data = getADHDData();
  const newEntry: TimeTrackingEntry = {
    ...entry,
    id: `time-${Date.now()}`,
  };
  data.timeTracking.push(newEntry);
  saveADHDData(data);
};

export const getTimeTrackingEntries = (): TimeTrackingEntry[] => {
  return getADHDData().timeTracking;
};

export const deleteTimeTrackingEntry = (id: string): void => {
  const data = getADHDData();
  data.timeTracking = data.timeTracking.filter(e => e.id !== id);
  saveADHDData(data);
};

export const calculateTimeBlindnessStats = (): TimeBlindnessStats => {
  const entries = getTimeTrackingEntries();

  if (entries.length === 0) {
    return {
      averageMultiplier: 1.0,
      totalEntries: 0,
      byTaskType: {},
      byEnergyLevel: { high: 1.0, medium: 1.0, low: 1.0 },
    };
  }

  const multipliers = entries.map(e => e.actualMinutes / e.estimatedMinutes);
  const averageMultiplier = multipliers.reduce((sum, m) => sum + m, 0) / multipliers.length;

  const byTaskType: { [key: string]: number } = {};
  const byEnergyLevel: { [key in EnergyLevel]: number } = { high: 1.0, medium: 1.0, low: 1.0 };

  const taskTypeGroups: { [key: string]: number[] } = {};
  const energyGroups: { [key in EnergyLevel]: number[] } = { high: [], medium: [], low: [] };

  entries.forEach(entry => {
    const multiplier = entry.actualMinutes / entry.estimatedMinutes;

    if (!taskTypeGroups[entry.taskType]) {
      taskTypeGroups[entry.taskType] = [];
    }
    taskTypeGroups[entry.taskType].push(multiplier);

    energyGroups[entry.energyLevel].push(multiplier);
  });

  Object.keys(taskTypeGroups).forEach(type => {
    const mults = taskTypeGroups[type];
    byTaskType[type] = mults.reduce((sum, m) => sum + m, 0) / mults.length;
  });

  (['high', 'medium', 'low'] as EnergyLevel[]).forEach(level => {
    if (energyGroups[level].length > 0) {
      byEnergyLevel[level] = energyGroups[level].reduce((sum, m) => sum + m, 0) / energyGroups[level].length;
    }
  });

  return {
    averageMultiplier,
    totalEntries: entries.length,
    byTaskType,
    byEnergyLevel,
  };
};

// ============ HYPERFOCUS SESSIONS ============

export const addHyperfocusSession = (session: Omit<HyperfocusSession, 'id'>): void => {
  const data = getADHDData();
  const newSession: HyperfocusSession = {
    ...session,
    id: `hyperfocus-${Date.now()}`,
  };
  data.hyperfocusSessions.push(newSession);
  saveADHDData(data);
};

export const getHyperfocusSessions = (): HyperfocusSession[] => {
  return getADHDData().hyperfocusSessions;
};

export const deleteHyperfocusSession = (id: string): void => {
  const data = getADHDData();
  data.hyperfocusSessions = data.hyperfocusSessions.filter(s => s.id !== id);
  saveADHDData(data);
};

export const calculateHyperfocusStats = (): HyperfocusStats => {
  const sessions = getHyperfocusSessions();

  if (sessions.length === 0) {
    return {
      averageDuration: 0,
      totalSessions: 0,
      commonTriggers: [],
      bestTimeOfDay: 'No data yet',
      productivityAverage: 0,
    };
  }

  const averageDuration = sessions.reduce((sum, s) => sum + s.duration, 0) / sessions.length;
  const productivityAverage = sessions.reduce((sum, s) => sum + s.productivityRating, 0) / sessions.length;

  // Count triggers
  const triggerCounts: { [key: string]: number } = {};
  sessions.forEach(s => {
    triggerCounts[s.trigger] = (triggerCounts[s.trigger] || 0) + 1;
  });
  const commonTriggers = Object.entries(triggerCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([trigger]) => trigger);

  // Best time of day
  const hourCounts: { [hour: number]: number } = {};
  sessions.forEach(s => {
    const hour = new Date(s.startTime).getHours();
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
  });
  const bestHour = Object.entries(hourCounts).sort(([, a], [, b]) => b - a)[0];
  const bestTimeOfDay = bestHour ? `${bestHour[0]}:00` : 'No pattern yet';

  return {
    averageDuration,
    totalSessions: sessions.length,
    commonTriggers,
    bestTimeOfDay,
    productivityAverage,
  };
};

// ============ ENERGY LOGS ============

export const addEnergyLog = (log: Omit<EnergyLog, 'id'>): void => {
  const data = getADHDData();
  const newLog: EnergyLog = {
    ...log,
    id: `energy-${Date.now()}`,
  };
  data.energyLogs.push(newLog);
  saveADHDData(data);
};

export const getEnergyLogs = (): EnergyLog[] => {
  return getADHDData().energyLogs;
};

export const deleteEnergyLog = (id: string): void => {
  const data = getADHDData();
  data.energyLogs = data.energyLogs.filter(l => l.id !== id);
  saveADHDData(data);
};

export const calculateEnergyStats = (): EnergyStats => {
  const logs = getEnergyLogs();

  if (logs.length === 0) {
    return {
      peakTimes: [],
      averageByHour: {},
      patterns: ['Log more energy data to see patterns'],
    };
  }

  // Group by hour
  const hourGroups: { [hour: number]: EnergyLevel[] } = {};
  logs.forEach(log => {
    const hour = new Date(log.timestamp).getHours();
    if (!hourGroups[hour]) {
      hourGroups[hour] = [];
    }
    hourGroups[hour].push(log.level);
  });

  // Calculate average by hour
  const averageByHour: { [hour: number]: EnergyLevel } = {};
  const energyValues = { high: 3, medium: 2, low: 1 };
  const reverseMap: { [key: number]: EnergyLevel } = { 3: 'high', 2: 'medium', 1: 'low' };

  Object.entries(hourGroups).forEach(([hour, levels]) => {
    const avg = levels.reduce((sum, level) => sum + energyValues[level], 0) / levels.length;
    averageByHour[Number(hour)] = reverseMap[Math.round(avg)];
  });

  // Find peak times (hours with 'high' average)
  const peakTimes = Object.entries(averageByHour)
    .filter(([, level]) => level === 'high')
    .map(([hour]) => `${hour}:00`);

  // Generate patterns
  const patterns: string[] = [];
  if (peakTimes.length > 0) {
    patterns.push(`Energy peaks at ${peakTimes.join(', ')}`);
  }

  const morningEnergy = [6, 7, 8, 9, 10].filter(h => averageByHour[h] === 'high').length;
  const eveningEnergy = [18, 19, 20, 21, 22].filter(h => averageByHour[h] === 'high').length;

  if (morningEnergy > eveningEnergy) {
    patterns.push('You\'re a morning person');
  } else if (eveningEnergy > morningEnergy) {
    patterns.push('You\'re a night owl');
  }

  return {
    peakTimes,
    averageByHour,
    patterns: patterns.length > 0 ? patterns : ['No clear patterns yet'],
  };
};

// ============ BRAIN DUMPS ============

export const addBrainDump = (dump: Omit<BrainDump, 'id'>): void => {
  const data = getADHDData();
  const newDump: BrainDump = {
    ...dump,
    id: `dump-${Date.now()}`,
  };
  data.brainDumps.push(newDump);
  saveADHDData(data);
};

export const getBrainDumps = (): BrainDump[] => {
  return getADHDData().brainDumps;
};

export const updateBrainDump = (id: string, updates: Partial<BrainDump>): void => {
  const data = getADHDData();
  const index = data.brainDumps.findIndex(d => d.id === id);
  if (index !== -1) {
    data.brainDumps[index] = { ...data.brainDumps[index], ...updates };
    saveADHDData(data);
  }
};

export const deleteBrainDump = (id: string): void => {
  const data = getADHDData();
  data.brainDumps = data.brainDumps.filter(d => d.id !== id);
  saveADHDData(data);
};

// ============ DOPAMINE MENU ============

export const addDopamineReward = (reward: Omit<DopamineReward, 'id'>): void => {
  const data = getADHDData();
  const newReward: DopamineReward = {
    ...reward,
    id: `reward-${Date.now()}`,
  };
  data.dopamineMenu.push(newReward);
  saveADHDData(data);
};

export const getDopamineRewards = (): DopamineReward[] => {
  return getADHDData().dopamineMenu;
};

export const updateDopamineReward = (id: string, updates: Partial<DopamineReward>): void => {
  const data = getADHDData();
  const index = data.dopamineMenu.findIndex(r => r.id === id);
  if (index !== -1) {
    data.dopamineMenu[index] = { ...data.dopamineMenu[index], ...updates };
    saveADHDData(data);
  }
};

export const incrementRewardUsage = (id: string): void => {
  const data = getADHDData();
  const reward = data.dopamineMenu.find(r => r.id === id);
  if (reward) {
    reward.usageCount += 1;
    saveADHDData(data);
  }
};

export const deleteDopamineReward = (id: string): void => {
  const data = getADHDData();
  data.dopamineMenu = data.dopamineMenu.filter(r => r.id !== id);
  saveADHDData(data);
};

export const getRandomReward = (): DopamineReward | null => {
  const rewards = getDopamineRewards();
  if (rewards.length === 0) return null;
  return rewards[Math.floor(Math.random() * rewards.length)];
};

// ============ SAMPLE DATA ============

export const generateSampleADHDData = (): void => {
  const data = getADHDData();

  if (data.timeTracking.length === 0) {
    const today = new Date().toISOString().split('T')[0];
    data.timeTracking = [
      {
        id: 'time-1',
        taskName: 'Write documentation',
        taskType: 'Writing',
        estimatedMinutes: 60,
        actualMinutes: 120,
        date: today,
        energyLevel: 'high',
      },
      {
        id: 'time-2',
        taskName: 'Code review',
        taskType: 'Review',
        estimatedMinutes: 30,
        actualMinutes: 45,
        date: today,
        energyLevel: 'medium',
      },
    ];
  }

  if (data.hyperfocusSessions.length === 0) {
    const now = new Date();
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
    data.hyperfocusSessions = [
      {
        id: 'hyper-1',
        startTime: twoHoursAgo.toISOString(),
        endTime: now.toISOString(),
        duration: 120,
        trigger: 'Interesting problem',
        taskType: 'Coding',
        taskName: 'Build new feature',
        productivityRating: 5,
        notes: 'Got into the zone!',
      },
    ];
  }

  if (data.energyLogs.length === 0) {
    const now = new Date();
    data.energyLogs = [
      { id: 'energy-1', timestamp: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(), level: 'high' },
      { id: 'energy-2', timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(), level: 'medium' },
      { id: 'energy-3', timestamp: now.toISOString(), level: 'low' },
    ];
  }

  if (data.dopamineMenu.length === 0) {
    data.dopamineMenu = [
      { id: 'reward-1', reward: '5-minute walk', category: 'movement', usageCount: 0 },
      { id: 'reward-2', reward: 'Favorite snack', category: 'treat', usageCount: 0 },
      { id: 'reward-3', reward: 'Quick game', category: 'break', usageCount: 0 },
      { id: 'reward-4', reward: 'Text a friend', category: 'social', usageCount: 0 },
      { id: 'reward-5', reward: 'Doodle break', category: 'creative', usageCount: 0 },
    ];
  }

  saveADHDData(data);
};
