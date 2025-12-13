'use client';

import { useState, useEffect } from 'react';
import { Star, Zap, Clock, AlertTriangle, Shuffle, Play, SkipForward, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Action, Tour, GigVibe, CrewTask } from '@/lib/types';
import { getActions, getTours, getTourById } from '@/lib/tours';
import { getCrewTasks } from '@/lib/crew';

interface EnergyLog {
  id: string;
  level: GigVibe;
  timestamp: string;
}

interface SuggestedTask {
  type: 'action' | 'crew';
  action?: Action;
  crewTask?: CrewTask;
  tour?: Tour;
  reasoning: string;
  elaboration: string;
  priority: 'overdue' | 'high' | 'medium' | 'low' | 'quickwin';
}

interface NextBigHitCardProps {
  onRefresh?: () => void;
}

// Get energy logs from localStorage
const getEnergyLogs = (): EnergyLog[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem('venued_energy_logs');
  return data ? JSON.parse(data) : [];
};

// Get current gig vibe (most recent energy log)
const getCurrentGigVibe = (): { level: GigVibe | null; isStale: boolean; timestamp: string | null } => {
  const logs = getEnergyLogs();
  if (logs.length === 0) {
    return { level: null, isStale: true, timestamp: null };
  }

  const latest = logs[0];
  const timestamp = new Date(latest.timestamp);
  const now = new Date();
  const hoursDiff = (now.getTime() - timestamp.getTime()) / (1000 * 60 * 60);

  return {
    level: latest.level,
    isStale: hoursDiff > 2,
    timestamp: latest.timestamp,
  };
};

// AI Elaboration generator - context-aware and task-specific
const generateElaboration = (task: SuggestedTask): string => {
  const { type, action, crewTask, tour, priority } = task;
  const taskTitle = type === 'action' ? action?.title : crewTask?.title;
  const taskDescription = type === 'action' ? action?.description : crewTask?.description;
  const isQuickWin = type === 'action' ? action?.isQuickWin : crewTask?.isQuickWin;
  const estimatedHours = type === 'action' ? action?.estimatedHours : crewTask?.estimatedHours;
  const difficulty = type === 'action' ? action?.difficulty : crewTask?.difficulty;

  // Analyze task title for context-specific elaboration
  const titleLower = (taskTitle || '').toLowerCase();
  const descLower = (taskDescription || '').toLowerCase();

  // Social media / marketing tasks
  if (titleLower.includes('social') || titleLower.includes('post') || titleLower.includes('instagram') || titleLower.includes('twitter') || titleLower.includes('linkedin')) {
    const timeHint = estimatedHours && estimatedHours <= 0.5 ? 'Quick 15-30 min task.' : '';
    return `${timeHint} Getting this posted keeps your presence active and your audience engaged. Done is better than perfect here.`.trim();
  }

  // Email / communication tasks
  if (titleLower.includes('email') || titleLower.includes('reply') || titleLower.includes('message') || titleLower.includes('respond')) {
    return `Clearing this from your inbox removes a mental niggle. Quick response = good vibes all round.`;
  }

  // Meeting / call tasks
  if (titleLower.includes('meeting') || titleLower.includes('call') || titleLower.includes('schedule') || titleLower.includes('book')) {
    return `Lock this in and it's off your plate. One less thing to remember.`;
  }

  // Writing / content tasks
  if (titleLower.includes('write') || titleLower.includes('draft') || titleLower.includes('blog') || titleLower.includes('content') || titleLower.includes('copy')) {
    return `Creative work benefits from your current headspace. Start with a rough draft - polish later.`;
  }

  // Design / creative tasks
  if (titleLower.includes('design') || titleLower.includes('logo') || titleLower.includes('graphic') || titleLower.includes('visual') || titleLower.includes('mockup')) {
    return `Visual work flows best when you're in the zone. Get the first version done and iterate from there.`;
  }

  // Review / feedback tasks
  if (titleLower.includes('review') || titleLower.includes('feedback') || titleLower.includes('check') || titleLower.includes('approve')) {
    return `Fresh eyes catch things you'd miss later. Quick review now saves bigger headaches down the line.`;
  }

  // Planning / strategy tasks
  if (titleLower.includes('plan') || titleLower.includes('strategy') || titleLower.includes('roadmap') || titleLower.includes('outline')) {
    return `Planning work sets you up for smoother execution. Worth the time investment now.`;
  }

  // Research tasks
  if (titleLower.includes('research') || titleLower.includes('find') || titleLower.includes('explore') || titleLower.includes('investigate')) {
    return `Gather what you need now so you're not blocked later. Focused research beats scattered Googling.`;
  }

  // Update / fix tasks
  if (titleLower.includes('update') || titleLower.includes('fix') || titleLower.includes('change') || titleLower.includes('edit')) {
    return `Small updates prevent bigger issues. Knock this out while it's fresh in your mind.`;
  }

  // If linked to a tour/project, mention that context
  if (tour) {
    const stageText = tour.stage === 'planning' ? 'still in planning' : tour.stage === 'development' ? 'in active development' : 'heading to launch';
    return `Part of "${tour.name}" which is ${stageText}. Completing this moves the whole project forward.`;
  }

  // Priority-based fallbacks (more concise)
  if (priority === 'overdue') {
    return `This has been waiting. Getting it done clears mental space and stops the guilt drain.`;
  }

  if (priority === 'high' || difficulty === 'hard') {
    return `Your energy is right for this. Tackle it now while you've got the momentum.`;
  }

  if (isQuickWin || (estimatedHours && estimatedHours <= 0.5)) {
    return `Fast task, quick win. Cross it off and build momentum for what's next.`;
  }

  // Generic fallback - still useful
  return `Good time to make progress on this. Your current vibe matches the effort needed.`;
};

// Main suggestion algorithm
const getSuggestedTask = (
  actions: Action[],
  crewTasks: CrewTask[],
  tours: Tour[],
  currentVibe: GigVibe | null
): SuggestedTask | null => {
  const today = new Date().toISOString().split('T')[0];
  const effectiveVibe = currentVibe || 'medium';

  // Combine all incomplete tasks
  const incompleteActions = actions.filter(a => !a.completed);
  const incompleteCrewTasks = crewTasks.filter(t => !t.completed);

  // Priority 1: Overdue tasks
  const overdueActions = incompleteActions.filter(a =>
    a.scheduledDate && a.scheduledDate < today
  );
  const overdueCrewTasks = incompleteCrewTasks.filter(t =>
    t.scheduledDate && t.scheduledDate < today
  );

  if (overdueActions.length > 0) {
    const task = overdueActions[0];
    const tour = task.tourId ? getTourById(task.tourId) : undefined;
    return {
      type: 'action',
      action: task,
      tour,
      reasoning: "Overdue task: get this back on track",
      elaboration: '',
      priority: 'overdue',
    };
  }

  if (overdueCrewTasks.length > 0) {
    const task = overdueCrewTasks[0];
    return {
      type: 'crew',
      crewTask: task,
      reasoning: "Overdue task: get this back on track",
      elaboration: '',
      priority: 'overdue',
    };
  }

  // Priority 2: High energy + high priority/difficulty
  if (effectiveVibe === 'high') {
    const hardActions = incompleteActions.filter(a =>
      a.difficulty === 'hard' || a.gigVibe === 'high'
    );
    const hardCrewTasks = incompleteCrewTasks.filter(t =>
      t.difficulty === 'hard' || t.energyLevel === 'high'
    );

    if (hardActions.length > 0) {
      const task = hardActions[0];
      const tour = task.tourId ? getTourById(task.tourId) : undefined;
      return {
        type: 'action',
        action: task,
        tour,
        reasoning: "Based on your high energy: tackle this priority deadline",
        elaboration: '',
        priority: 'high',
      };
    }

    if (hardCrewTasks.length > 0) {
      return {
        type: 'crew',
        crewTask: hardCrewTasks[0],
        reasoning: "Based on your high energy: tackle this priority deadline",
        elaboration: '',
        priority: 'high',
      };
    }
  }

  // Priority 3: Low energy + quick wins
  if (effectiveVibe === 'low') {
    const quickWinActions = incompleteActions.filter(a =>
      a.isQuickWin || a.difficulty === 'easy' || (a.estimatedHours && a.estimatedHours <= 0.5)
    );
    const quickWinCrewTasks = incompleteCrewTasks.filter(t =>
      t.isQuickWin || t.difficulty === 'easy' || (t.estimatedHours && t.estimatedHours <= 0.5)
    );

    if (quickWinActions.length > 0) {
      const task = quickWinActions[0];
      const tour = task.tourId ? getTourById(task.tourId) : undefined;
      return {
        type: 'action',
        action: task,
        tour,
        reasoning: "Low energy? This quick win builds momentum",
        elaboration: '',
        priority: 'quickwin',
      };
    }

    if (quickWinCrewTasks.length > 0) {
      return {
        type: 'crew',
        crewTask: quickWinCrewTasks[0],
        reasoning: "Low energy? This quick win builds momentum",
        elaboration: '',
        priority: 'quickwin',
      };
    }
  }

  // Priority 4: Match energy level
  const matchingActions = incompleteActions.filter(a =>
    a.gigVibe === effectiveVibe
  );
  const matchingCrewTasks = incompleteCrewTasks.filter(t =>
    t.energyLevel === effectiveVibe
  );

  if (matchingActions.length > 0) {
    const task = matchingActions[0];
    const tour = task.tourId ? getTourById(task.tourId) : undefined;
    return {
      type: 'action',
      action: task,
      tour,
      reasoning: `Good energy for focused work on this ${effectiveVibe}-vibe task`,
      elaboration: '',
      priority: 'medium',
    };
  }

  if (matchingCrewTasks.length > 0) {
    return {
      type: 'crew',
      crewTask: matchingCrewTasks[0],
      reasoning: `Good energy for focused work on this ${effectiveVibe}-vibe task`,
      elaboration: '',
      priority: 'medium',
    };
  }

  // Fallback: Any available task
  if (incompleteActions.length > 0) {
    const task = incompleteActions[0];
    const tour = task.tourId ? getTourById(task.tourId) : undefined;
    return {
      type: 'action',
      action: task,
      tour,
      reasoning: "Here's a task waiting for your attention",
      elaboration: '',
      priority: 'medium',
    };
  }

  if (incompleteCrewTasks.length > 0) {
    return {
      type: 'crew',
      crewTask: incompleteCrewTasks[0],
      reasoning: "Here's a task waiting for your attention",
      elaboration: '',
      priority: 'medium',
    };
  }

  return null;
};

// Get all available tasks for cycling
const getAllAvailableTasks = (
  actions: Action[],
  crewTasks: CrewTask[],
  tours: Tour[]
): SuggestedTask[] => {
  const incompleteActions = actions.filter(a => !a.completed);
  const incompleteCrewTasks = crewTasks.filter(t => !t.completed);

  const result: SuggestedTask[] = [];

  incompleteActions.forEach(action => {
    const tour = action.tourId ? getTourById(action.tourId) : undefined;
    result.push({
      type: 'action',
      action,
      tour,
      reasoning: '',
      elaboration: '',
      priority: 'medium',
    });
  });

  incompleteCrewTasks.forEach(crewTask => {
    result.push({
      type: 'crew',
      crewTask,
      reasoning: '',
      elaboration: '',
      priority: 'medium',
    });
  });

  return result;
};

export default function NextBigHitCard({ onRefresh }: NextBigHitCardProps) {
  const [actions, setActions] = useState<Action[]>([]);
  const [crewTasks, setCrewTasks] = useState<CrewTask[]>([]);
  const [tours, setTours] = useState<Tour[]>([]);
  const [currentVibe, setCurrentVibe] = useState<{ level: GigVibe | null; isStale: boolean; timestamp: string | null }>({ level: null, isStale: true, timestamp: null });
  const [suggestion, setSuggestion] = useState<SuggestedTask | null>(null);
  const [skippedIds, setSkippedIds] = useState<Set<string>>(new Set());
  const [allTasks, setAllTasks] = useState<SuggestedTask[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const loadedActions = getActions();
    const loadedCrewTasks = getCrewTasks();
    const loadedTours = getTours();
    const vibe = getCurrentGigVibe();

    setActions(loadedActions);
    setCrewTasks(loadedCrewTasks);
    setTours(loadedTours);
    setCurrentVibe(vibe);

    const allAvailable = getAllAvailableTasks(loadedActions, loadedCrewTasks, loadedTours);
    setAllTasks(allAvailable);

    // Get initial suggestion
    const suggested = getSuggestedTask(loadedActions, loadedCrewTasks, loadedTours, vibe.level);
    if (suggested) {
      suggested.elaboration = generateElaboration(suggested);
    }
    setSuggestion(suggested);
    setSkippedIds(new Set());
  };

  const handleSkip = () => {
    if (!suggestion) return;

    const currentId = suggestion.type === 'action' ? suggestion.action?.id : suggestion.crewTask?.id;
    if (!currentId) return;

    const newSkipped = new Set(skippedIds);
    newSkipped.add(currentId);
    setSkippedIds(newSkipped);

    // Filter out skipped tasks
    const availableActions = actions.filter(a => !a.completed && !newSkipped.has(a.id));
    const availableCrewTasks = crewTasks.filter(t => !t.completed && !newSkipped.has(t.id));

    // Get next suggestion from filtered list
    const nextSuggestion = getSuggestedTask(availableActions, availableCrewTasks, tours, currentVibe.level);
    if (nextSuggestion) {
      nextSuggestion.elaboration = generateElaboration(nextSuggestion);
    }
    setSuggestion(nextSuggestion);
  };

  const handlePickRandom = () => {
    const available = allTasks.filter(t => {
      const id = t.type === 'action' ? t.action?.id : t.crewTask?.id;
      const currentId = suggestion?.type === 'action' ? suggestion.action?.id : suggestion?.crewTask?.id;
      return id !== currentId;
    });

    if (available.length === 0) return;

    const randomIndex = Math.floor(Math.random() * available.length);
    const randomTask = available[randomIndex];
    randomTask.reasoning = "Random pick - sometimes variety is what you need!";
    randomTask.elaboration = generateElaboration(randomTask);
    setSuggestion(randomTask);
  };

  const getVibeIcon = (level: GigVibe) => {
    switch (level) {
      case 'high': return <Zap className="w-4 h-4 text-vivid-yellow-green" />;
      case 'medium': return <Star className="w-4 h-4 text-magenta" />;
      case 'low': return <Clock className="w-4 h-4 text-vivid-cyan" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'overdue': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'high': return 'bg-vivid-yellow-green/20 text-vivid-yellow-green border-vivid-yellow-green/30';
      case 'quickwin': return 'bg-neon-cyan/20 text-neon-cyan border-neon-cyan/30';
      default: return 'bg-magenta/20 text-magenta border-magenta/30';
    }
  };

  const taskTitle = suggestion?.type === 'action' ? suggestion.action?.title : suggestion?.crewTask?.title;
  const taskId = suggestion?.type === 'action' ? suggestion.action?.id : suggestion?.crewTask?.id;
  const hasTasks = allTasks.length > 0;

  return (
    <div className="mb-8">
      <div className="p-6 sm:p-8 rounded-2xl border-2 border-magenta/50 bg-gradient-to-br from-magenta/20 via-dark-grey-azure to-neon-cyan/10 relative overflow-hidden">
        {/* Animated glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-magenta/20 via-transparent to-neon-cyan/20 animate-pulse opacity-50" />
        <div className="absolute -inset-1 bg-gradient-to-r from-magenta to-neon-cyan opacity-10 blur-2xl" />

        <div className="relative">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-supernova text-white mb-1 flex items-center gap-2">
                <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-magenta" />
                Your Next Big Hit
              </h2>
              <p className="text-gray-400 font-josefin text-sm sm:text-base">
                Based on your current vibe and priorities
              </p>
            </div>

            {/* Current Vibe Badge */}
            {currentVibe.level && !currentVibe.isStale && (
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${
                currentVibe.level === 'high' ? 'bg-vivid-yellow-green/20 border-vivid-yellow-green/30' :
                currentVibe.level === 'medium' ? 'bg-magenta/20 border-magenta/30' :
                'bg-vivid-cyan/20 border-vivid-cyan/30'
              }`}>
                {getVibeIcon(currentVibe.level)}
                <span className="text-white text-sm font-semibold capitalize">{currentVibe.level} Vibe</span>
              </div>
            )}
          </div>

          {/* Stale/Missing Vibe Prompt */}
          {(!currentVibe.level || currentVibe.isStale) && (
            <div className="mb-4 p-3 rounded-lg bg-white/5 border border-white/10">
              <p className="text-gray-400 text-sm mb-2">
                {currentVibe.isStale && currentVibe.level
                  ? "Your vibe check is over 2 hours old. Want to update it?"
                  : "Set your vibe first for better suggestions!"}
              </p>
              <Link
                href="/setlist#energy-tracker"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-vivid-yellow-green/20 text-vivid-yellow-green text-sm font-semibold hover:bg-vivid-yellow-green/30 transition-all"
              >
                <Zap className="w-4 h-4" />
                Check Gig Vibe
              </Link>
            </div>
          )}

          {/* Suggestion Content */}
          {suggestion && hasTasks ? (
            <div className="space-y-4">
              {/* Task Display */}
              <div className="p-4 sm:p-5 rounded-xl bg-[#3d3d3d]/60 border border-white/10">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h3 className="text-xl sm:text-2xl font-supernova text-white leading-tight">
                    {taskTitle}
                  </h3>
                  {suggestion.priority && (
                    <span className={`px-2 py-1 rounded text-xs font-bold border flex-shrink-0 ${getPriorityColor(suggestion.priority)}`}>
                      {suggestion.priority === 'overdue' && <AlertTriangle className="w-3 h-3 inline mr-1" />}
                      {suggestion.priority === 'quickwin' ? 'Quick Win' : suggestion.priority.charAt(0).toUpperCase() + suggestion.priority.slice(1)}
                    </span>
                  )}
                </div>

                {/* Tour Badge - Clickable to view project */}
                {suggestion.tour && (
                  <div className="mb-3">
                    <Link
                      href={`/crew?tour=${suggestion.tour.id}`}
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold transition-all hover:scale-105 ${
                        suggestion.tour.stage === 'planning' ? 'bg-azure/20 text-azure hover:bg-azure/30' :
                        suggestion.tour.stage === 'development' ? 'bg-magenta/20 text-magenta hover:bg-magenta/30' :
                        'bg-vivid-yellow-green/20 text-vivid-yellow-green hover:bg-vivid-yellow-green/30'
                      }`}
                    >
                      Tour: {suggestion.tour.name} →
                    </Link>
                  </div>
                )}

                {/* Reasoning */}
                <p className="text-magenta font-semibold text-sm mb-2">
                  {suggestion.reasoning}
                </p>

                {/* AI Elaboration */}
                <p className="text-gray-300 text-sm leading-relaxed">
                  {suggestion.elaboration}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                {/* Primary: LFG! */}
                <Link
                  href="/crew"
                  className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-6 py-3 bg-neon-cyan text-black font-bold rounded-xl hover:shadow-[0_0_30px_rgba(0,240,233,0.6)] transition-all"
                >
                  <Play className="w-5 h-5" />
                  LFG!
                </Link>

                {/* Secondary: Skip It - #c9005c */}
                <button
                  onClick={handleSkip}
                  className="flex items-center justify-center gap-2 px-5 py-3 bg-[#c9005c]/20 text-[#c9005c] font-semibold rounded-xl hover:bg-[#c9005c]/30 transition-all border border-[#c9005c]/30"
                >
                  <SkipForward className="w-5 h-5" />
                  Skip It
                </button>

                {/* Tertiary: Pick Next Track - #00a29d */}
                <button
                  onClick={handlePickRandom}
                  className="flex items-center justify-center gap-2 px-5 py-3 bg-[#00a29d]/15 text-[#00a29d] font-semibold rounded-xl hover:bg-[#00a29d]/25 transition-all border border-[#00a29d]/30"
                >
                  <Shuffle className="w-5 h-5" />
                  Random Track
                </button>
              </div>
            </div>
          ) : !hasTasks ? (
            /* Empty State */
            <div className="text-center py-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                <Star className="w-8 h-8 text-gray-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">All caught up - or time to plan?</h3>
              <p className="text-gray-400 mb-6 max-w-md mx-auto">
                You have no tasks waiting. Time to create something new or take a well-deserved break!
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link
                  href="/backstage"
                  onClick={() => {
                    // Trigger the LFG modal on backstage
                    localStorage.setItem('venued_trigger_lfg', 'true');
                  }}
                  className="px-5 py-2.5 bg-magenta/20 text-magenta font-semibold rounded-lg hover:bg-magenta/30 transition-all"
                >
                  Create a Project
                </Link>
                <Link
                  href="/entourage"
                  className="px-5 py-2.5 bg-neon-cyan/20 text-neon-cyan font-semibold rounded-lg hover:bg-neon-cyan/30 transition-all"
                >
                  Brain Dump
                </Link>
                <Link
                  href="/setlist"
                  className="px-5 py-2.5 bg-white/10 text-gray-300 font-semibold rounded-lg hover:bg-white/20 transition-all"
                >
                  Chill Mode
                </Link>
              </div>
            </div>
          ) : (
            /* No more suggestions after skipping all */
            <div className="text-center py-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-vivid-yellow-green/10 flex items-center justify-center">
                <Star className="w-8 h-8 text-vivid-yellow-green" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">All caught up!</h3>
              <p className="text-gray-400 mb-6 max-w-md mx-auto">
                You've skipped through all available tasks. Time for a break or something new?
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <button
                  onClick={loadData}
                  className="px-5 py-2.5 bg-magenta/20 text-magenta font-semibold rounded-lg hover:bg-magenta/30 transition-all"
                >
                  Start Fresh
                </button>
                <Link
                  href="/entourage"
                  className="px-5 py-2.5 bg-neon-cyan/20 text-neon-cyan font-semibold rounded-lg hover:bg-neon-cyan/30 transition-all"
                >
                  Brain Dump
                </Link>
                <Link
                  href="/setlist"
                  className="px-5 py-2.5 bg-vivid-yellow-green/20 text-vivid-yellow-green font-semibold rounded-lg hover:bg-vivid-yellow-green/30 transition-all"
                >
                  Check Vibe
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
