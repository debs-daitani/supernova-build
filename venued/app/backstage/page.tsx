'use client';

import { useState, useEffect } from 'react';
import { Star, Plus, CheckCircle2, Rocket, ListChecks, Clock, FileEdit, Music, Zap, Play, Moon, Sun, Maximize2 } from 'lucide-react';
import Link from 'next/link';
import { Project, ProjectStatus, Tour, Action } from '@/lib/types';
import { getProjects, calculateStats, initializeSampleData } from '@/lib/storage';
import { getCrewTasks } from '@/lib/crew';
import { getTours, getActions, getTourStats, calculateTourProgress } from '@/lib/tours';
import BackstageStats from '@/components/backstage/BackstageStats';
import ProjectCard from '@/components/backstage/ProjectCard';
import EmptyState from '@/components/backstage/EmptyState';
import BackstageInbox from '@/components/backstage/Inbox';
import LFGChoiceModal from '@/components/LFGChoiceModal';
import QuickCaptureButton from '@/components/QuickCaptureButton';
import EndMyDayModal from '@/components/EndMyDayModal';
import NextBigHitCard from '@/components/backstage/NextBigHitCard';

// Storage key for tracking last visit time
const LAST_VISIT_KEY = 'venued_last_backstage_visit';
const VIEW_MODE_KEY = 'venued_backstage_view_mode';

export default function Backstage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tours, setTours] = useState<Tour[]>([]);
  const [actions, setActions] = useState<Action[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'planning' | 'development' | 'launch'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [upcomingTasks, setUpcomingTasks] = useState<any[]>([]);
  const [showLFGModal, setShowLFGModal] = useState(false);
  const [showQuickCapture, setShowQuickCapture] = useState(false);
  const [showEndMyDayModal, setShowEndMyDayModal] = useState(false);
  const [viewMode, setViewMode] = useState<'spotlight' | 'fullstage'>('spotlight');

  useEffect(() => {
    // Initialize sample data if no projects exist
    initializeSampleData();
    loadData();

    // Morning Launch Mode: Check if this is a fresh visit (>4 hours since last)
    const lastVisit = localStorage.getItem(LAST_VISIT_KEY);
    const savedMode = localStorage.getItem(VIEW_MODE_KEY) as 'spotlight' | 'fullstage' | null;
    const now = Date.now();
    const fourHoursMs = 4 * 60 * 60 * 1000; // 4 hours in milliseconds

    if (!lastVisit || (now - parseInt(lastVisit)) > fourHoursMs) {
      // First visit of the day (or >4 hours gap) - show Spotlight
      setViewMode('spotlight');
    } else if (savedMode) {
      // Restore previous mode if within same session
      setViewMode(savedMode);
    }

    // Update last visit timestamp
    localStorage.setItem(LAST_VISIT_KEY, now.toString());

    setIsLoading(false);
  }, []);

  const loadData = () => {
    // Load projects (legacy)
    const loadedProjects = getProjects();
    setProjects(loadedProjects);

    // Load tours and actions
    const loadedTours = getTours().filter(t => !t.isArchived);
    setTours(loadedTours);
    const loadedActions = getActions();
    setActions(loadedActions);

    // Load upcoming actions (new system) and tasks (legacy)
    const tasks = getCrewTasks();
    const today = new Date().toISOString().split('T')[0];

    // Combine legacy tasks with new actions
    const upcomingLegacyTasks = tasks
      .filter(t => !t.completed && t.scheduledDate && t.scheduledDate >= today)
      .map(t => ({ ...t, type: 'legacy' }));

    const upcomingNewActions = loadedActions
      .filter(a => !a.completed && a.scheduledDate && a.scheduledDate >= today)
      .map(a => ({ ...a, type: 'action' }));

    const combined = [...upcomingNewActions, ...upcomingLegacyTasks]
      .sort((a, b) => {
        const dateA = a.scheduledDate || '';
        const dateB = b.scheduledDate || '';
        return dateA.localeCompare(dateB);
      })
      .slice(0, 5);

    setUpcomingTasks(combined);
  };

  const stats = calculateStats();
  const tourStats = getTourStats();

  // Filter tours by stage
  const filteredTours = tours.filter((tour) => {
    if (activeFilter === 'all') return true;
    return tour.stage === activeFilter;
  });

  // Calculate filter counts (using tours)
  const filterCounts = {
    all: tours.length,
    planning: tours.filter((t) => t.stage === 'planning').length,
    development: tours.filter((t) => t.stage === 'development').length,
    launch: tours.filter((t) => t.stage === 'launch').length,
  };

  // Get loose actions count
  const looseActionsCount = actions.filter(a => a.tourId === null && !a.completed).length;

  // Toggle between Spotlight and Full Stage modes
  const toggleViewMode = () => {
    const newMode = viewMode === 'spotlight' ? 'fullstage' : 'spotlight';
    setViewMode(newMode);
    localStorage.setItem(VIEW_MODE_KEY, newMode);
  };

  const handleProjectClick = (projectId: string) => {
    console.log('Project clicked:', projectId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-magenta border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 font-josefin">Loading your shows...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 px-4 sm:px-6 lg:px-8 pb-24 md:pb-8">
      <div className="max-w-7xl mx-auto py-6 sm:py-12">
        {/* Header */}
        <div className="mb-8 sm:mb-12">
          <div className="rounded-2xl p-6 sm:p-8 mb-6 bg-gradient-to-r from-magenta/20 to-neon-cyan/20 border border-magenta/30 relative overflow-hidden">
            {/* Animated glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-magenta/30 via-transparent to-neon-cyan/30 animate-pulse" />
            <div className="absolute -inset-1 bg-gradient-to-r from-magenta to-neon-cyan opacity-20 blur-xl animate-pulse" />
            <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Star className="w-8 h-8 sm:w-10 sm:h-10 text-magenta drop-shadow-[0_0_10px_rgba(255,0,142,0.8)]" />
                <div>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-supernova tracking-tight bg-gradient-to-r from-magenta to-neon-cyan bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(255,0,142,0.5)]">
                    BACKSTAGE
                  </h1>
                  <p className="text-base sm:text-lg font-arp-display text-white/80 mt-1">
                    Your gig strategy hub
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                {/* Spotlight / Full Stage Toggle */}
                <button
                  onClick={toggleViewMode}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-full border-2 font-semibold text-sm transition-all duration-300 ${
                    viewMode === 'spotlight'
                      ? 'border-vivid-yellow-green bg-vivid-yellow-green/20 text-vivid-yellow-green hover:bg-vivid-yellow-green/30'
                      : 'border-neon-cyan bg-neon-cyan/20 text-neon-cyan hover:bg-neon-cyan/30'
                  }`}
                  title={viewMode === 'spotlight' ? 'Switch to Full Stage' : 'Switch to Spotlight'}
                >
                  {viewMode === 'spotlight' ? (
                    <>
                      <Sun className="w-4 h-4" />
                      <span className="hidden sm:inline">Spotlight</span>
                    </>
                  ) : (
                    <>
                      <Maximize2 className="w-4 h-4" />
                      <span className="hidden sm:inline">Full Stage</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowLFGModal(true)}
                  className="flex-1 sm:flex-none group flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-magenta to-neon-cyan text-black font-bold rounded-full hover:shadow-[0_0_30px_rgba(255,0,142,0.6)] transition-all duration-300"
                >
                  <span className="text-xl">🤘</span>
                  LFG!
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Your Next Big Hit - Smart Suggestion Card - ALWAYS VISIBLE */}
        <NextBigHitCard onRefresh={loadData} />

        {/* Stats Grid - 2x2 on mobile, clickable stage filters - FULL STAGE ONLY */}
        <div className={`grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 transition-all duration-500 ${
          viewMode === 'spotlight' ? 'opacity-0 max-h-0 overflow-hidden mb-0' : 'opacity-100 max-h-[500px]'
        }`}>
          <button
            onClick={() => setActiveFilter('all')}
            className={`p-4 sm:p-6 rounded-xl border-2 transition-all text-left ${
              activeFilter === 'all'
                ? 'border-magenta bg-magenta/10'
                : 'border-white/10 bg-white/5 hover:border-magenta/40'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Music className="w-5 h-5 text-magenta" />
              <span className="text-sm font-semibold text-gray-400">All Tours</span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-white">{filterCounts.all}</p>
          </button>

          <button
            onClick={() => setActiveFilter('planning')}
            className={`p-4 sm:p-6 rounded-xl border-2 transition-all text-left ${
              activeFilter === 'planning'
                ? 'border-azure bg-azure/10'
                : 'border-white/10 bg-white/5 hover:border-azure/40'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <FileEdit className="w-5 h-5 text-azure" />
              <span className="text-sm font-semibold text-gray-400">Planning</span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-white">{filterCounts.planning}</p>
          </button>

          <button
            onClick={() => setActiveFilter('development')}
            className={`p-4 sm:p-6 rounded-xl border-2 transition-all text-left ${
              activeFilter === 'development'
                ? 'border-magenta bg-magenta/10'
                : 'border-white/10 bg-white/5 hover:border-magenta/40'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Rocket className="w-5 h-5 text-magenta" />
              <span className="text-sm font-semibold text-gray-400">Development</span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-white">{filterCounts.development}</p>
          </button>

          <button
            onClick={() => setActiveFilter('launch')}
            className={`p-4 sm:p-6 rounded-xl border-2 transition-all text-left ${
              activeFilter === 'launch'
                ? 'border-vivid-yellow-green bg-vivid-yellow-green/10'
                : 'border-white/10 bg-white/5 hover:border-vivid-yellow-green/40'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-5 h-5 text-vivid-yellow-green" />
              <span className="text-sm font-semibold text-gray-400">Launch</span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-white">{filterCounts.launch}</p>
          </button>
        </div>

        {/* Inbox Section - Quick Capture items - ALWAYS VISIBLE (just badge in Spotlight) */}
        <BackstageInbox onRefresh={loadData} />

        {/* Quick Wins Section - 4 buttons - ALWAYS VISIBLE */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-magenta" />
            Quick Wins
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Button 1: LFG! */}
            <Link
              href="/crew"
              className="group flex flex-col items-center justify-center gap-2 p-4 sm:p-6 rounded-xl border-2 border-neon-cyan/30 bg-neon-cyan/10 hover:border-neon-cyan hover:bg-neon-cyan/20 hover:shadow-[0_0_30px_rgba(0,240,233,0.4)] transition-all"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-neon-cyan flex items-center justify-center group-hover:scale-110 transition-transform">
                <Play className="w-6 h-6 sm:w-7 sm:h-7 text-black ml-1" />
              </div>
              <span className="font-bold text-white text-sm sm:text-base">LFG!</span>
            </Link>

            {/* Button 2: Quick Capture */}
            <button
              onClick={() => setShowQuickCapture(true)}
              className="group flex flex-col items-center justify-center gap-2 p-4 sm:p-6 rounded-xl border-2 border-magenta/30 bg-magenta/10 hover:border-magenta hover:bg-magenta/20 hover:shadow-[0_0_30px_rgba(255,0,142,0.4)] transition-all"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-magenta flex items-center justify-center group-hover:scale-110 transition-transform">
                <Plus className="w-6 h-6 sm:w-7 sm:h-7 text-black" strokeWidth={3} />
              </div>
              <span className="font-bold text-white text-sm sm:text-base">Quick Capture</span>
            </button>

            {/* Button 3: Check Gig Vibe */}
            <Link
              href="/setlist#energy-tracker"
              className="group flex flex-col items-center justify-center gap-2 p-4 sm:p-6 rounded-xl border-2 border-vivid-yellow-green/30 bg-vivid-yellow-green/10 hover:border-vivid-yellow-green hover:bg-vivid-yellow-green/20 hover:shadow-[0_0_30px_rgba(211,255,44,0.4)] transition-all"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-vivid-yellow-green flex items-center justify-center group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6 sm:w-7 sm:h-7 text-black" />
              </div>
              <span className="font-bold text-white text-sm sm:text-base">Check Gig Vibe</span>
            </Link>

            {/* Button 4: End My Day */}
            <button
              onClick={() => setShowEndMyDayModal(true)}
              className="group flex flex-col items-center justify-center gap-2 p-4 sm:p-6 rounded-xl border-2 border-dark-cyan/30 bg-dark-cyan/10 hover:border-dark-cyan hover:bg-dark-cyan/20 hover:shadow-[0_0_30px_rgba(54,111,126,0.4)] transition-all"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-dark-cyan flex items-center justify-center group-hover:scale-110 transition-transform">
                <Moon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <span className="font-bold text-white text-sm sm:text-base">End My Day</span>
            </button>
          </div>
        </div>

        {/* Upcoming Actions Section - FULL STAGE ONLY */}
        {upcomingTasks.length > 0 && (
          <div className={`mb-8 p-4 sm:p-6 rounded-xl border-2 border-vivid-cyan/30 bg-vivid-cyan/10 transition-all duration-500 ${
            viewMode === 'spotlight' ? 'opacity-0 max-h-0 overflow-hidden p-0 mb-0 border-0' : 'opacity-100 max-h-[1000px]'
          }`}>
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-vivid-cyan" />
              <h3 className="text-lg font-semibold text-white">Upcoming Actions</h3>
            </div>
            <div className="space-y-2">
              {upcomingTasks.map((task: any) => {
                const gigVibe = task.gigVibe || task.energyLevel;
                return (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-[#3d3d3d]/60 border border-white/10"
                  >
                    <div>
                      <p className="font-semibold text-white">{task.title}</p>
                      <p className="text-sm text-gray-400">
                        {task.scheduledDate ? new Date(task.scheduledDate).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric'
                        }) : 'No date'}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      gigVibe === 'high' ? 'bg-vivid-yellow-green/20 text-vivid-yellow-green' :
                      gigVibe === 'medium' ? 'bg-magenta/20 text-magenta' :
                      'bg-vivid-cyan/20 text-vivid-cyan'
                    }`}>
                      {gigVibe}
                    </span>
                  </div>
                );
              })}
            </div>
            <Link
              href="/crew"
              className="mt-4 inline-flex items-center gap-2 text-vivid-cyan hover:text-white transition-colors text-sm font-semibold"
            >
              View all actions &rarr;
            </Link>
          </div>
        )}

        {/* Empty state for upcoming actions - FULL STAGE ONLY */}
        {upcomingTasks.length === 0 && viewMode === 'fullstage' && (
          <div className="mb-8 p-4 sm:p-6 rounded-xl border-2 border-white/10 bg-white/5 text-center transition-all duration-500">
            <Clock className="w-8 h-8 text-gray-500 mx-auto mb-2" />
            <p className="text-gray-400 font-josefin">All up to date - no upcoming actions!</p>
          </div>
        )}

        {/* Tours Grid or Empty State - FULL STAGE ONLY */}
        <div className={`transition-all duration-500 ${
          viewMode === 'spotlight' ? 'opacity-0 max-h-0 overflow-hidden' : 'opacity-100 max-h-[3000px]'
        }`}>
        {filteredTours.length === 0 ? (
          <EmptyState filter={activeFilter} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredTours.map((tour) => {
              const progress = calculateTourProgress(tour);
              const tourActions = actions.filter(a => a.tourId === tour.id);
              const incompleteCount = tourActions.filter(a => !a.completed).length;

              return (
                <Link
                  key={tour.id}
                  href="/crew"
                  className={`block p-5 rounded-xl border-2 transition-all hover:scale-[1.02] ${
                    tour.stage === 'planning'
                      ? 'border-azure/30 bg-azure/10 hover:border-azure/50'
                      : tour.stage === 'development'
                      ? 'border-magenta/30 bg-magenta/10 hover:border-magenta/50'
                      : 'border-vivid-yellow-green/30 bg-vivid-yellow-green/10 hover:border-vivid-yellow-green/50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-2 rounded-lg ${
                      tour.stage === 'planning'
                        ? 'bg-azure/20 text-azure'
                        : tour.stage === 'development'
                        ? 'bg-magenta/20 text-magenta'
                        : 'bg-vivid-yellow-green/20 text-vivid-yellow-green'
                    }`}>
                      <Music className="w-5 h-5" />
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-semibold capitalize ${
                      tour.stage === 'planning'
                        ? 'bg-azure/20 text-azure'
                        : tour.stage === 'development'
                        ? 'bg-magenta/20 text-magenta'
                        : 'bg-vivid-yellow-green/20 text-vivid-yellow-green'
                    }`}>
                      {tour.stage}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{tour.name}</h3>
                  {tour.description && (
                    <p className="text-sm text-gray-400 mb-3 line-clamp-2">{tour.description}</p>
                  )}
                  <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
                    <span>{incompleteCount} actions remaining</span>
                    <span className="font-bold text-white">{progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        tour.stage === 'planning'
                          ? 'bg-azure'
                          : tour.stage === 'development'
                          ? 'bg-magenta'
                          : 'bg-vivid-yellow-green'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Loose Actions Count - FULL STAGE ONLY */}
        {looseActionsCount > 0 && (
          <div className={`mt-6 p-4 rounded-xl border border-neon-cyan/30 bg-neon-cyan/10 transition-all duration-500 ${
            viewMode === 'spotlight' ? 'opacity-0 max-h-0 overflow-hidden p-0 mt-0 border-0' : 'opacity-100 max-h-[200px]'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-neon-cyan" />
                <span className="text-white font-semibold">{looseActionsCount} Loose Actions</span>
              </div>
              <Link
                href="/crew"
                className="text-neon-cyan hover:text-white transition-colors text-sm font-semibold"
              >
                View in Crew &rarr;
              </Link>
            </div>
          </div>
        )}
        </div>

        {/* LFG Choice Modal */}
        <LFGChoiceModal
          isOpen={showLFGModal}
          onClose={() => setShowLFGModal(false)}
          onCreated={() => {
            loadData();
            setShowLFGModal(false);
          }}
        />

        {/* End My Day Modal */}
        <EndMyDayModal
          isOpen={showEndMyDayModal}
          onClose={() => setShowEndMyDayModal(false)}
        />
      </div>

      {/* Quick Capture Modal - using existing component */}
      {showQuickCapture && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowQuickCapture(false);
            }
          }}
        >
          <QuickCaptureInlineModal
            onClose={() => setShowQuickCapture(false)}
            onSaved={() => {
              setShowQuickCapture(false);
              loadData();
            }}
          />
        </div>
      )}
    </div>
  );
}

// Inline Quick Capture Modal for the button (reuses logic from QuickCaptureButton)
function QuickCaptureInlineModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [text, setText] = useState('');
  const [selectedTag, setSelectedTag] = useState<'task' | 'idea' | 'note' | null>(null);

  const handleSave = () => {
    if (!text.trim()) return;

    interface InboxItem {
      id: number;
      text: string;
      tag: 'task' | 'idea' | 'note' | null;
      timestamp: number;
      processed: boolean;
    }

    const item: InboxItem = {
      id: Date.now(),
      text: text.trim(),
      tag: selectedTag,
      timestamp: Date.now(),
      processed: false
    };

    const existingItems = JSON.parse(localStorage.getItem('venued_inbox') || '[]');
    const updatedItems = [item, ...existingItems];
    localStorage.setItem('venued_inbox', JSON.stringify(updatedItems));

    setText('');
    setSelectedTag(null);
    onSaved();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSave();
    }
  };

  const tags = [
    { value: 'task' as const, label: 'Task', color: 'bg-neon-cyan text-black' },
    { value: 'idea' as const, label: 'Idea', color: 'bg-vivid-yellow-green text-black' },
    { value: 'note' as const, label: 'Note', color: 'bg-vivid-pink text-black' },
  ];

  return (
    <div className="w-full max-w-md bg-dark-grey-azure rounded-2xl border border-magenta/30 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <h2 className="text-lg font-supernova text-white">Quick Capture</h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <span className="text-2xl text-gray-400 hover:text-white">&times;</span>
        </button>
      </div>

      {/* Body */}
      <div className="p-4 space-y-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Capture your thought..."
          className="w-full h-32 p-4 bg-[#3d3d3d]/80 border border-white/10 rounded-xl text-white placeholder-gray-500 resize-none focus:outline-none focus:border-magenta/50 focus:ring-1 focus:ring-magenta/30 font-josefin"
          autoFocus
        />

        {/* Tag Selector */}
        <div className="space-y-2">
          <p className="text-sm text-gray-400 font-josefin">Tag (optional)</p>
          <div className="flex gap-2">
            {tags.map((tag) => {
              const isSelected = selectedTag === tag.value;
              return (
                <button
                  key={tag.value}
                  onClick={() => setSelectedTag(isSelected ? null : tag.value)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                    isSelected
                      ? tag.color
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  {tag.label}
                </button>
              );
            })}
          </div>
        </div>

        <p className="text-xs text-gray-500 text-center font-josefin">
          Press <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-gray-400">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-gray-400">Enter</kbd> to save
        </p>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <button
          onClick={handleSave}
          disabled={!text.trim()}
          className="w-full py-3 rounded-xl font-bold text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: text.trim() ? '#FF008E' : '#666',
            boxShadow: text.trim() ? '0 0 20px rgba(255, 0, 142, 0.4)' : 'none'
          }}
        >
          Capture It!
        </button>
      </div>
    </div>
  );
}
