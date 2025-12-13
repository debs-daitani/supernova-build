import { Tour, Action, GigVibe, TourStage } from './types';

const STORAGE_KEYS = {
  TOURS: 'venued_tours',
  ACTIONS: 'venued_actions',
};

// Tours
export const getTours = (): Tour[] => {
  if (typeof window === 'undefined') return [];

  try {
    const data = localStorage.getItem(STORAGE_KEYS.TOURS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading tours:', error);
    return [];
  }
};

export const saveTours = (tours: Tour[]): void => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEYS.TOURS, JSON.stringify(tours));
  } catch (error) {
    console.error('Error saving tours:', error);
  }
};

export const addTour = (tour: Tour): void => {
  const tours = getTours();
  tours.unshift(tour);
  saveTours(tours);
};

export const updateTour = (id: string, updates: Partial<Tour>): void => {
  const tours = getTours();
  const index = tours.findIndex(t => t.id === id);

  if (index !== -1) {
    tours[index] = {
      ...tours[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    saveTours(tours);
  }
};

export const deleteTour = (id: string): void => {
  const tours = getTours();
  const filtered = tours.filter(t => t.id !== id);
  saveTours(filtered);
};

export const getTourById = (id: string): Tour | undefined => {
  const tours = getTours();
  return tours.find(t => t.id === id);
};

// Actions
export const getActions = (): Action[] => {
  if (typeof window === 'undefined') return [];

  try {
    const data = localStorage.getItem(STORAGE_KEYS.ACTIONS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading actions:', error);
    return [];
  }
};

export const saveActions = (actions: Action[]): void => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEYS.ACTIONS, JSON.stringify(actions));
  } catch (error) {
    console.error('Error saving actions:', error);
  }
};

export const addAction = (action: Action): void => {
  const actions = getActions();
  actions.unshift(action);
  saveActions(actions);

  // If linked to a tour, update the tour's actionIds
  if (action.tourId) {
    const tour = getTourById(action.tourId);
    if (tour) {
      updateTour(action.tourId, {
        actionIds: [...tour.actionIds, action.id],
      });
    }
  }
};

export const updateAction = (id: string, updates: Partial<Action>): void => {
  const actions = getActions();
  const index = actions.findIndex(a => a.id === id);

  if (index !== -1) {
    const oldAction = actions[index];
    const newAction = {
      ...oldAction,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    actions[index] = newAction;
    saveActions(actions);

    // Handle tour linkage changes
    if (updates.tourId !== undefined && updates.tourId !== oldAction.tourId) {
      // Remove from old tour
      if (oldAction.tourId) {
        const oldTour = getTourById(oldAction.tourId);
        if (oldTour) {
          updateTour(oldAction.tourId, {
            actionIds: oldTour.actionIds.filter(aid => aid !== id),
            completedActionIds: oldTour.completedActionIds.filter(aid => aid !== id),
          });
        }
      }
      // Add to new tour
      if (updates.tourId) {
        const newTour = getTourById(updates.tourId);
        if (newTour) {
          updateTour(updates.tourId, {
            actionIds: [...newTour.actionIds, id],
          });
        }
      }
    }

    // Handle completion status changes
    if (updates.completed !== undefined && newAction.tourId) {
      const tour = getTourById(newAction.tourId);
      if (tour) {
        if (updates.completed) {
          updateTour(newAction.tourId, {
            completedActionIds: [...new Set([...tour.completedActionIds, id])],
          });
        } else {
          updateTour(newAction.tourId, {
            completedActionIds: tour.completedActionIds.filter(aid => aid !== id),
          });
        }
      }
    }
  }
};

export const deleteAction = (id: string): void => {
  const actions = getActions();
  const action = actions.find(a => a.id === id);

  // Remove from tour if linked
  if (action?.tourId) {
    const tour = getTourById(action.tourId);
    if (tour) {
      updateTour(action.tourId, {
        actionIds: tour.actionIds.filter(aid => aid !== id),
        completedActionIds: tour.completedActionIds.filter(aid => aid !== id),
      });
    }
  }

  const filtered = actions.filter(a => a.id !== id);
  saveActions(filtered);
};

export const getActionById = (id: string): Action | undefined => {
  const actions = getActions();
  return actions.find(a => a.id === id);
};

export const getActionsByTourId = (tourId: string): Action[] => {
  const actions = getActions();
  return actions.filter(a => a.tourId === tourId);
};

export const getLooseActions = (): Action[] => {
  const actions = getActions();
  return actions.filter(a => a.tourId === null);
};

export const toggleActionComplete = (id: string): Action | undefined => {
  const actions = getActions();
  const action = actions.find(a => a.id === id);

  if (action) {
    const newCompleted = !action.completed;
    updateAction(id, {
      completed: newCompleted,
      completedAt: newCompleted ? new Date().toISOString() : undefined,
    });
    return { ...action, completed: newCompleted };
  }
  return undefined;
};

// Stats and helpers
export const calculateTourProgress = (tour: Tour): number => {
  if (tour.actionIds.length === 0) return 0;
  return Math.round((tour.completedActionIds.length / tour.actionIds.length) * 100);
};

export const getTourStats = () => {
  const tours = getTours();
  const actions = getActions();

  const activeTours = tours.filter(t => !t.isArchived);
  const looseActions = actions.filter(a => a.tourId === null && !a.completed);
  const completedActions = actions.filter(a => a.completed);

  return {
    totalTours: activeTours.length,
    toursInPlanning: activeTours.filter(t => t.stage === 'planning').length,
    toursInDevelopment: activeTours.filter(t => t.stage === 'development').length,
    toursInLaunch: activeTours.filter(t => t.stage === 'launch').length,
    looseActionsCount: looseActions.length,
    completedActionsCount: completedActions.length,
    totalActionsCount: actions.length,
  };
};

// Create new action helper
export const createAction = (data: {
  title: string;
  description?: string;
  tourId?: string | null;
  gigVibe?: GigVibe;
  difficulty?: 'easy' | 'medium' | 'hard';
  estimatedHours?: number;
  scheduledDate?: string;
  links?: string[];
}): Action => {
  const now = new Date().toISOString();
  return {
    id: `action-${Date.now()}`,
    title: data.title,
    description: data.description || '',
    tourId: data.tourId ?? null,
    gigVibe: data.gigVibe || 'medium',
    difficulty: data.difficulty || 'medium',
    estimatedHours: data.estimatedHours || 1,
    scheduledDate: data.scheduledDate || new Date().toISOString().split('T')[0],
    completed: false,
    timeSpent: 0,
    createdAt: now,
    updatedAt: now,
    isHyperfocus: false,
    isQuickWin: data.difficulty === 'easy',
    order: 0,
    links: data.links || [],
  };
};

// Create new tour helper
export const createTour = (data: {
  name: string;
  description?: string;
  stage?: TourStage;
  targetDate?: string;
  links?: string[];
}): Tour => {
  const now = new Date().toISOString();
  return {
    id: `tour-${Date.now()}`,
    name: data.name,
    description: data.description || '',
    stage: data.stage || 'planning',
    createdAt: now,
    updatedAt: now,
    targetDate: data.targetDate,
    actionIds: [],
    completedActionIds: [],
    isArchived: false,
    links: data.links || [],
  };
};
