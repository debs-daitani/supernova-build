'use client';

import { useState, useEffect } from 'react';
import { X, Moon, ChevronRight, ChevronLeft, Check, Music, Sparkles, Plus, Guitar } from 'lucide-react';
import confetti from 'canvas-confetti';
import { getCrewTasks } from '@/lib/crew';
import { getActions, getTours, createAction, addAction } from '@/lib/tours';
import { CrewTask, Action, Tour } from '@/lib/types';

interface EndMyDayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DailyReview {
  id: string;
  date: string;
  completedTasks: { id: string; title: string; type: 'crew' | 'action' }[];
  missedBeats: string[];
  tomorrowMIT: { id: string; title: string; isNew: boolean } | null;
  closingLine: string;
  createdAt: string;
}

export default function EndMyDayModal({ isOpen, onClose }: EndMyDayModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [toast, setToast] = useState<string | null>(null);

  // Step 1: Completed tasks
  const [completedTasks, setCompletedTasks] = useState<{ id: string; title: string; type: 'crew' | 'action'; checked: boolean }[]>([]);

  // Step 2: Missed beats
  const [missedBeatsText, setMissedBeatsText] = useState('');

  // Step 3: Tomorrow's WIN
  const [existingTasks, setExistingTasks] = useState<{ id: string; title: string; tourName?: string }[]>([]);
  const [tours, setTours] = useState<Tour[]>([]);
  const [selectedMIT, setSelectedMIT] = useState<string | null>(null);
  const [showNewTaskInput, setShowNewTaskInput] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskTourId, setNewTaskTourId] = useState<string>('');

  // Step 4: Curtain Call
  const [closingLine, setClosingLine] = useState('');

  const steps = [
    { title: 'What You Rocked', icon: '🤘' },
    { title: 'Missed Beats', icon: '🎵' },
    { title: "Tomorrow's WIN", icon: '🎸' },
    { title: 'Curtain Call', icon: '🌙' },
  ];

  // Load data when modal opens
  useEffect(() => {
    if (isOpen) {
      loadCompletedTasks();
      loadExistingTasks();
      loadTours();
      setCurrentStep(0);
      setMissedBeatsText('');
      setSelectedMIT(null);
      setShowNewTaskInput(false);
      setNewTaskTitle('');
      setNewTaskTourId('');
      setClosingLine('');
    }
  }, [isOpen]);

  const loadCompletedTasks = () => {
    const today = new Date().toISOString().split('T')[0];

    // Get completed crew tasks from today
    const crewTasks = getCrewTasks();
    const todayCompletedCrew = crewTasks
      .filter(t => t.completed && t.completedAt?.startsWith(today))
      .map(t => ({ id: t.id, title: t.title, type: 'crew' as const, checked: true }));

    // Get completed actions from today
    const actions = getActions();
    const todayCompletedActions = actions
      .filter(a => a.completed && a.completedAt?.startsWith(today))
      .map(a => ({ id: a.id, title: a.title, type: 'action' as const, checked: true }));

    setCompletedTasks([...todayCompletedCrew, ...todayCompletedActions]);
  };

  const loadExistingTasks = () => {
    const allTours = getTours();

    // Get incomplete crew tasks
    const crewTasks = getCrewTasks();
    const incompleteCrew = crewTasks
      .filter(t => !t.completed)
      .map(t => ({ id: t.id, title: t.title }));

    // Get incomplete actions with tour names
    const actions = getActions();
    const incompleteActions = actions
      .filter(a => !a.completed)
      .map(a => {
        const tour = a.tourId ? allTours.find(t => t.id === a.tourId) : null;
        return { id: a.id, title: a.title, tourName: tour?.name };
      });

    setExistingTasks([...incompleteCrew, ...incompleteActions]);
  };

  const loadTours = () => {
    const allTours = getTours().filter(t => !t.isArchived);
    setTours(allTours);
  };

  const toggleCompletedTask = (id: string) => {
    setCompletedTasks(prev =>
      prev.map(t => t.id === id ? { ...t, checked: !t.checked } : t)
    );
  };

  const handleAddMissedBeats = () => {
    if (!missedBeatsText.trim()) return;

    // Split by newlines and add each as inbox item
    const lines = missedBeatsText.split('\n').filter(line => line.trim());

    const stored = localStorage.getItem('venued_inbox');
    const existingItems = stored ? JSON.parse(stored) : [];

    const newItems = lines.map((line, index) => ({
      id: Date.now() + index,
      text: line.trim(),
      tag: null,
      timestamp: Date.now(),
      processed: false,
    }));

    localStorage.setItem('venued_inbox', JSON.stringify([...newItems, ...existingItems]));
  };

  const handleCreateNewTask = () => {
    if (!newTaskTitle.trim()) return;

    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const newAction = createAction({
      title: newTaskTitle.trim(),
      tourId: newTaskTourId || null,
      scheduledDate: tomorrow,
      difficulty: 'medium',
      estimatedHours: 1,
    });

    addAction(newAction);

    // Add to existing tasks and select it
    setExistingTasks(prev => [...prev, {
      id: newAction.id,
      title: newAction.title,
      tourName: newTaskTourId ? tours.find(t => t.id === newTaskTourId)?.name : undefined
    }]);
    setSelectedMIT(newAction.id);
    setShowNewTaskInput(false);
    setNewTaskTitle('');
    setNewTaskTourId('');
  };

  const handleComplete = () => {
    // Save daily review
    const review: DailyReview = {
      id: `review-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      completedTasks: completedTasks.filter(t => t.checked).map(t => ({ id: t.id, title: t.title, type: t.type })),
      missedBeats: missedBeatsText.split('\n').filter(line => line.trim()),
      tomorrowMIT: selectedMIT ? {
        id: selectedMIT,
        title: existingTasks.find(t => t.id === selectedMIT)?.title || '',
        isNew: false,
      } : null,
      closingLine,
      createdAt: new Date().toISOString(),
    };

    // Save to localStorage
    const stored = localStorage.getItem('venued_daily_reviews');
    const existingReviews = stored ? JSON.parse(stored) : [];
    localStorage.setItem('venued_daily_reviews', JSON.stringify([review, ...existingReviews]));

    // Add missed beats to inbox
    if (missedBeatsText.trim()) {
      handleAddMissedBeats();
    }

    // Trigger celebration with pyrotechnics!
    celebrateGigDone();

    // Show toast and close
    setToast('Gig = DONE! 🤘');
    setTimeout(() => {
      setToast(null);
      onClose();
    }, 4000);
  };

  const celebrateGigDone = () => {
    // Firework-style pyrotechnics celebration!
    const duration = 4000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    // Firework bursts from different positions
    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      // Firework burst from random positions
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ['#FF008E', '#00F0E9', '#D3FF2C'],
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ['#FF008E', '#9D4EDD', '#00F0E9'],
      });
    }, 250);

    // Big central burst at start
    confetti({
      particleCount: 100,
      spread: 100,
      origin: { y: 0.6, x: 0.5 },
      colors: ['#FF008E', '#00F0E9', '#D3FF2C', '#9D4EDD'],
    });

    // Side cannons
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 80,
        origin: { x: 0, y: 0.8 },
        colors: ['#FF008E', '#D3FF2C'],
      });
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 80,
        origin: { x: 1, y: 0.8 },
        colors: ['#00F0E9', '#9D4EDD'],
      });
    }, 500);
  };

  const canProceed = () => {
    return true; // All steps are optional
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <div className="bg-dark-grey-azure rounded-2xl border border-dark-cyan/30 max-w-lg w-full max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-magenta to-dark-cyan">
                <Moon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-supernova text-white">End My Day</h2>
                <p className="text-sm text-gray-400">Close out today's gig</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400 hover:text-white" />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="px-6 py-4 border-b border-white/5 flex-shrink-0">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all ${
                      index === currentStep
                        ? 'bg-gradient-to-br from-magenta to-neon-cyan scale-110'
                        : index < currentStep
                          ? 'bg-dark-cyan'
                          : 'bg-white/10'
                    }`}
                  >
                    {index < currentStep ? <Check className="w-5 h-5 text-white" /> : step.icon}
                  </div>
                  <span className={`text-xs mt-1 font-josefin ${
                    index === currentStep ? 'text-white' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto flex-grow">
            {/* Step 1: What You Rocked Today */}
            {currentStep === 0 && (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-supernova text-white mb-2">What You Rocked Today 🤘</h3>
                  <p className="text-gray-400 font-josefin">
                    These are the actions you smashed today.
                    <br />
                    Uncheck any that didn't make it onto the stage today.
                  </p>
                </div>

                {completedTasks.length === 0 ? (
                  <div className="text-center py-8 px-4 rounded-xl bg-white/5 border border-white/10">
                    <Music className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-white font-semibold mb-1">No impactful actions today - and that's OK!</p>
                    <p className="text-white font-semibold mb-4">Some days are for doing sweet F/A!</p>
                    <p className="text-gray-400 text-sm">
                      YES - doing NOTHING is actually doing SOMETHING!
                      <br />
                      Or maybe you planned, maybe you practised, procrastinated and pondered... but as long as you did it with passion and purpose - it's ALL productive!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {completedTasks.map((task) => (
                      <button
                        key={task.id}
                        onClick={() => toggleCompletedTask(task.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                          task.checked
                            ? 'bg-dark-cyan/20 border border-dark-cyan/40'
                            : 'bg-white/5 border border-white/10 opacity-50'
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-md flex items-center justify-center border-2 transition-all ${
                          task.checked
                            ? 'bg-dark-cyan border-dark-cyan'
                            : 'border-gray-500'
                        }`}>
                          {task.checked && <Check className="w-4 h-4 text-white" />}
                        </div>
                        <span className={`text-left flex-1 font-josefin ${
                          task.checked ? 'text-white' : 'text-gray-400 line-through'
                        }`}>
                          {task.title}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          task.type === 'crew' ? 'bg-magenta/20 text-magenta' : 'bg-neon-cyan/20 text-neon-cyan'
                        }`}>
                          Action
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                <div className="mt-4 p-3 rounded-lg bg-vivid-yellow-green/10 border border-vivid-yellow-green/30">
                  <p className="text-vivid-yellow-green text-sm font-semibold">
                    🤘 {completedTasks.filter(t => t.checked).length} win{completedTasks.filter(t => t.checked).length !== 1 ? 's' : ''} today!
                  </p>
                </div>
              </div>
            )}

            {/* Step 2: Any Missed Beats */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-supernova text-white mb-2">Any Missed Beats? 🎵</h3>
                  <p className="text-gray-400 font-josefin">
                    What's still running riot in your head?
                    <br />
                    Get those spare lyrics OUT and ready to be reconsidered tomorrow.
                  </p>
                </div>

                <textarea
                  value={missedBeatsText}
                  onChange={(e) => setMissedBeatsText(e.target.value)}
                  placeholder="Type anything you need to remember...&#10;&#10;Each line becomes a separate inbox item"
                  className="w-full h-48 px-4 py-3 bg-[#3d3d3d]/80 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-magenta/50 resize-none font-josefin"
                />

                <div className="p-3 rounded-lg bg-magenta/10 border border-magenta/30">
                  <p className="text-magenta text-sm font-josefin">
                    <Sparkles className="w-4 h-4 inline mr-1" />
                    They'll be safe in your Backstage Inbox til then - turn them into fresh actions or use as inspo for ideas and projects!
                  </p>
                </div>
              </div>
            )}

            {/* Step 3: Tomorrow's WIN */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-supernova text-white mb-2">Tomorrow's WIN 🎸</h3>
                  <p className="text-gray-400 font-josefin">
                    Pick ONE action that would make tomorrow feel like a sell-out gig.
                  </p>
                </div>

                {!showNewTaskInput ? (
                  <>
                    {/* Existing tasks dropdown-style list */}
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {existingTasks.slice(0, 10).map((task) => (
                        <button
                          key={task.id}
                          onClick={() => setSelectedMIT(task.id === selectedMIT ? null : task.id)}
                          className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                            selectedMIT === task.id
                              ? 'bg-gradient-to-r from-magenta/30 to-neon-cyan/30 border-2 border-magenta'
                              : 'bg-white/5 border border-white/10 hover:bg-white/10'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            selectedMIT === task.id ? 'border-magenta bg-magenta' : 'border-gray-500'
                          }`}>
                            {selectedMIT === task.id && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <span className="text-white text-left flex-1 font-josefin">{task.title}</span>
                          {task.tourName && (
                            <span className="text-xs px-2 py-0.5 rounded bg-dark-cyan/20 text-dark-cyan">
                              {task.tourName}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-white/10"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-dark-grey-azure text-gray-400">or</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setShowNewTaskInput(true)}
                      className="w-full flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-white/20 text-gray-400 hover:border-magenta/50 hover:text-magenta transition-all"
                    >
                      <Plus className="w-5 h-5" />
                      <span className="font-semibold">Add something new</span>
                    </button>
                  </>
                ) : (
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      placeholder="What's the one thing?"
                      className="w-full px-4 py-3 bg-[#3d3d3d]/80 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-magenta/50 font-josefin"
                      autoFocus
                    />

                    <select
                      value={newTaskTourId}
                      onChange={(e) => setNewTaskTourId(e.target.value)}
                      className="w-full px-4 py-3 bg-[#3d3d3d]/80 border border-white/10 rounded-xl text-white focus:outline-none focus:border-magenta/50 font-josefin"
                    >
                      <option value="">No Tour (Loose Action)</option>
                      {tours.map((tour) => (
                        <option key={tour.id} value={tour.id}>{tour.name}</option>
                      ))}
                    </select>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setShowNewTaskInput(false);
                          setNewTaskTitle('');
                          setNewTaskTourId('');
                        }}
                        className="flex-1 py-3 rounded-xl border border-white/20 text-gray-400 font-semibold hover:bg-white/5"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleCreateNewTask}
                        disabled={!newTaskTitle.trim()}
                        className="flex-1 py-3 rounded-xl bg-magenta text-black font-bold hover:bg-neon-cyan transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Add & Select
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Curtain Call */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-supernova text-white mb-2">Curtain Call 🌙</h3>
                  <p className="text-gray-400 font-josefin">
                    Take a bow! Any final words?
                    <br />
                    A win to celebrate? A reframe or reset required?
                  </p>
                </div>

                <textarea
                  value={closingLine}
                  onChange={(e) => setClosingLine(e.target.value)}
                  placeholder="How are you feeling about today's gig?&#10;&#10;(Totally optional - your solo review!)"
                  className="w-full h-36 px-4 py-3 bg-[#3d3d3d]/80 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-dark-cyan/50 resize-none font-josefin"
                />

                {/* Summary */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-magenta/20 to-neon-cyan/20 border border-magenta/30 space-y-3">
                  <h4 className="text-white font-semibold">Tonight's Setlist:</h4>

                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-neon-cyan">🤘</span>
                    <span className="text-gray-300">
                      {completedTasks.filter(t => t.checked).length} action{completedTasks.filter(t => t.checked).length !== 1 ? 's' : ''} rocked
                    </span>
                  </div>

                  {missedBeatsText.trim() && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-magenta">🎵</span>
                      <span className="text-gray-300">
                        {missedBeatsText.split('\n').filter(l => l.trim()).length} item{missedBeatsText.split('\n').filter(l => l.trim()).length !== 1 ? 's' : ''} → Inbox
                      </span>
                    </div>
                  )}

                  {selectedMIT && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-vivid-yellow-green">🎸</span>
                      <span className="text-gray-300 truncate">
                        Tomorrow: {existingTasks.find(t => t.id === selectedMIT)?.title}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer Navigation */}
          <div className="p-6 border-t border-white/10 flex-shrink-0">
            <div className="flex gap-3">
              {currentStep > 0 && (
                <button
                  onClick={handleBack}
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-white/20 text-gray-400 font-semibold hover:bg-white/5 transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </button>
              )}

              {currentStep < steps.length - 1 ? (
                <button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-magenta to-neon-cyan text-black font-bold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleComplete}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-magenta to-neon-cyan text-black font-bold hover:opacity-90 transition-all"
                >
                  <Sparkles className="w-5 h-5" />
                  Leave the Stage!
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[70] px-6 py-3 bg-gradient-to-r from-magenta to-neon-cyan text-black rounded-xl shadow-lg animate-in fade-in slide-in-from-bottom-4 font-bold text-lg">
          {toast}
        </div>
      )}
    </>
  );
}
