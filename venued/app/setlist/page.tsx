'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { ListChecks, Save, Shuffle, Minimize2, Sparkles, Plus } from 'lucide-react';
import { Phase, Task, ProjectBuilder } from '@/lib/types';
import { addProject } from '@/lib/storage';
import { templates } from '@/lib/templates';
import PhaseColumn from '@/components/setlist/PhaseColumn';
import TaskFormModal from '@/components/setlist/TaskFormModal';
import RealityCheck from '@/components/setlist/RealityCheck';
import TaskCard from '@/components/setlist/TaskCard';

export default function Setlist() {
  const router = useRouter();
  const [project, setProject] = useState<Partial<ProjectBuilder>>({
    name: '',
    description: '',
    goal: '',
    startDate: new Date().toISOString().split('T')[0],
    targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    priority: 'medium',
    tags: [],
    status: 'planning',
    phases: [],
  });

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [activePhaseId, setActivePhaseId] = useState<string>('');
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [showTemplates, setShowTemplates] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Auto-save effect
  useEffect(() => {
    if (!project.name || project.phases?.length === 0) return;

    const timer = setTimeout(() => {
      console.log('Auto-saving...');
      // Auto-save logic here
    }, 30000);

    return () => clearTimeout(timer);
  }, [project]);

  const loadTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    setProject(prev => ({
      ...prev,
      phases: template.phases.map(p => ({
        ...p,
        tasks: [],
      })),
    }));
    setShowTemplates(false);
  };

  const createCustomPhases = () => {
    setProject(prev => ({
      ...prev,
      phases: [
        {
          id: `phase-${Date.now()}`,
          name: 'Phase 1',
          description: 'First phase',
          order: 0,
          tasks: [],
          color: '#FF1B8D',
        },
      ],
    }));
    setShowTemplates(false);
  };

  const addPhase = () => {
    const newPhase: Phase = {
      id: `phase-${Date.now()}`,
      name: `Phase ${(project.phases?.length ?? 0) + 1}`,
      description: '',
      order: (project.phases?.length ?? 0),
      tasks: [],
      color: ['#FF1B8D', '#9D4EDD', '#39FF14', '#00D9FF'][(project.phases?.length ?? 0) % 4],
    };

    setProject(prev => ({
      ...prev,
      phases: [...(prev.phases ?? []), newPhase],
    }));
  };

  const addTask = (phaseId: string) => {
    setActivePhaseId(phaseId);
    setEditingTask(null);
    setIsTaskModalOpen(true);
  };

  const editTask = (task: Task) => {
    setEditingTask(task);
    setActivePhaseId(task.phaseId);
    setIsTaskModalOpen(true);
  };

  const saveTask = (taskData: Partial<Task>) => {
    if (editingTask) {
      // Update existing task
      setProject(prev => ({
        ...prev,
        phases: prev.phases?.map(phase => ({
          ...phase,
          tasks: phase.tasks.map(task =>
            task.id === editingTask.id
              ? { ...task, ...taskData }
              : task
          ),
        })),
      }));
    } else {
      // Create new task
      const { id: _, ...taskDataWithoutId } = taskData as Task;
      const newTask: Task = {
        id: `task-${Date.now()}`,
        ...taskDataWithoutId,
        phaseId: activePhaseId,
        dependencies: [],
        completed: false,
        order: (project.phases?.find(p => p.id === activePhaseId)?.tasks.length ?? 0),
        createdAt: new Date().toISOString(),
      };

      setProject(prev => ({
        ...prev,
        phases: prev.phases?.map(phase =>
          phase.id === activePhaseId
            ? { ...phase, tasks: [...phase.tasks, newTask] }
            : phase
        ),
      }));
    }
  };

  const toggleTaskComplete = (phaseId: string, taskId: string) => {
    setProject(prev => ({
      ...prev,
      phases: prev.phases?.map(phase =>
        phase.id === phaseId
          ? {
              ...phase,
              tasks: phase.tasks.map(task =>
                task.id === taskId
                  ? { ...task, completed: !task.completed }
                  : task
              ),
            }
          : phase
      ),
    }));
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveTaskId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find which phase the task is being dragged to
    const activePhase = project.phases?.find(p => p.tasks.some(t => t.id === activeId));
    const overPhase = project.phases?.find(p => p.id === overId || p.tasks.some(t => t.id === overId));

    if (!activePhase || !overPhase) return;

    if (activePhase.id !== overPhase.id) {
      setProject(prev => {
        const newPhases = prev.phases?.map(phase => {
          if (phase.id === activePhase.id) {
            return {
              ...phase,
              tasks: phase.tasks.filter(t => t.id !== activeId),
            };
          }
          if (phase.id === overPhase.id) {
            const task = activePhase.tasks.find(t => t.id === activeId);
            if (task) {
              return {
                ...phase,
                tasks: [...phase.tasks, { ...task, phaseId: overPhase.id }],
              };
            }
          }
          return phase;
        });

        return { ...prev, phases: newPhases };
      });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTaskId(null);

    if (!over || active.id === over.id) return;

    setProject(prev => {
      const newPhases = prev.phases?.map(phase => {
        const activeIndex = phase.tasks.findIndex(t => t.id === active.id);
        const overIndex = phase.tasks.findIndex(t => t.id === over.id);

        if (activeIndex !== -1 && overIndex !== -1) {
          return {
            ...phase,
            tasks: arrayMove(phase.tasks, activeIndex, overIndex).map((task, i) => ({
              ...task,
              order: i,
            })),
          };
        }

        return phase;
      });

      return { ...prev, phases: newPhases };
    });
  };

  const randomizeTaskPriority = () => {
    const allTasks = (project.phases?.flatMap(p => p.tasks.filter(t => !t.completed)) ?? []);
    if (allTasks.length === 0) return;

    const randomTask = allTasks[Math.floor(Math.random() * allTasks.length)];
    alert(`Focus on: "${randomTask.title}" - ${randomTask.energyLevel} energy, ${randomTask.estimatedHours}h`);
  };

  const simplifyProject = () => {
    if (confirm('Remove all non-quick-win tasks? This will help you focus on essential items.')) {
      setProject(prev => ({
        ...prev,
        phases: prev.phases?.map(phase => ({
          ...phase,
          tasks: phase.tasks.filter(t => t.isQuickWin || t.completed),
        })),
      }));
    }
  };

  const saveProject = async () => {
    if (!project.name) {
      alert('Please add a project name');
      return;
    }

    if (!project.phases || project.phases?.length === 0) {
      alert('Please add at least one phase');
      return;
    }

    setIsSaving(true);

    const allTasks = (project.phases?.flatMap(p => p.tasks) ?? []);
    const completedTasks = allTasks.filter(t => t.completed).length;

    const fullProject = {
      id: `project-${Date.now()}`,
      name: project.name!,
      description: project.description || '',
      status: project.status || 'planning',
      startDate: project.startDate!,
      targetDate: project.targetDate!,
      progress: allTasks.length > 0 ? Math.round((completedTasks / allTasks.length) * 100) : 0,
      tasksTotal: allTasks.length,
      tasksCompleted: completedTasks,
      priority: project.priority || 'medium',
      tags: project.tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addProject(fullProject);

    setTimeout(() => {
      setIsSaving(false);
      router.push('/backstage');
    }, 500);
  };

  const activeTask = activeTaskId
    ? project.phases?.flatMap(p => p.tasks).find(t => t.id === activeTaskId)
    : null;

  if (showTemplates) {
    return (
      <div className="min-h-screen bg-black pt-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto py-12">
          <div className="text-center mb-12">
            <Sparkles className="w-16 h-16 text-electric-purple mx-auto mb-4" />
            <h1 className="text-5xl font-black text-white mb-4">Choose Your Starting Point</h1>
            <p className="text-xl text-gray-400">Pick a template or start from scratch</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {templates.map(template => (
              <button
                key={template.id}
                onClick={() => loadTemplate(template.id)}
                className="p-6 rounded-2xl border-2 border-white/10 bg-white/5 hover:border-electric-purple hover:bg-electric-purple/10 transition-all text-left group"
              >
                <div className="text-4xl mb-4">{template.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-electric-purple">
                  {template.name}
                </h3>
                <p className="text-sm text-gray-400 mb-4">{template.description}</p>
                <div className="text-xs text-gray-500">
                  {template.phases.length} phases • {template.suggestedTasks.length} suggested tasks
                </div>
              </button>
            ))}
          </div>

          <div className="text-center">
            <button
              onClick={createCustomPhases}
              className="px-8 py-4 bg-gradient-to-r from-neon-pink to-electric-purple rounded-full text-black font-bold hover:shadow-[0_0_40px_rgba(255,27,141,0.6)] transition-all"
            >
              <Plus className="w-5 h-5 inline mr-2" />
              Start From Scratch
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="min-h-screen bg-black pt-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1800px] mx-auto py-6">
          {/* Header with Project Form */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <ListChecks className="w-8 h-8 text-electric-purple" />
                <input
                  type="text"
                  value={project.name}
                  onChange={(e) => setProject(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Project Name"
                  className="text-4xl font-black text-white bg-transparent border-b-2 border-transparent hover:border-white/20 focus:border-electric-purple focus:outline-none px-2"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={randomizeTaskPriority}
                  className="px-4 py-2 rounded-lg border-2 border-yellow-500/30 text-yellow-400 font-semibold hover:bg-yellow-500/10 transition-all flex items-center gap-2"
                  title="Stuck? Pick one random task to focus on"
                >
                  <Shuffle className="w-4 h-4" />
                  Stuck?
                </button>
                <button
                  onClick={simplifyProject}
                  className="px-4 py-2 rounded-lg border-2 border-blue-500/30 text-blue-400 font-semibold hover:bg-blue-500/10 transition-all flex items-center gap-2"
                  title="Simplify to quick wins only"
                >
                  <Minimize2 className="w-4 h-4" />
                  Simplify
                </button>
                <button
                  onClick={saveProject}
                  disabled={isSaving}
                  className="px-6 py-3 bg-neon-pink rounded-full text-black font-bold hover:bg-white transition-all shadow-[0_0_20px_rgba(255,27,141,0.4)] flex items-center gap-2 disabled:opacity-50"
                >
                  <Save className="w-5 h-5" />
                  {isSaving ? 'Saving...' : 'Save & Launch'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 max-w-2xl">
              <input
                type="date"
                value={project.startDate}
                onChange={(e) => setProject(prev => ({ ...prev, startDate: e.target.value }))}
                className="px-4 py-2 bg-black border-2 border-white/10 rounded-lg text-white focus:border-neon-pink focus:outline-none"
              />
              <input
                type="date"
                value={project.targetDate}
                onChange={(e) => setProject(prev => ({ ...prev, targetDate: e.target.value }))}
                className="px-4 py-2 bg-black border-2 border-white/10 rounded-lg text-white focus:border-neon-pink focus:outline-none"
              />
            </div>
          </div>

          {/* Main Content: Phases + Reality Check */}
          <div className="flex gap-6">
            {/* Phases Area */}
            <div className="flex-1 overflow-x-auto">
              <div className="flex gap-6 pb-4">
                {project.phases?.map(phase => (
                  <PhaseColumn
                    key={phase.id}
                    phase={phase}
                    onAddTask={() => addTask(phase.id)}
                    onEditTask={editTask}
                    onToggleTaskComplete={(taskId) => toggleTaskComplete(phase.id, taskId)}
                  />
                ))}

                {/* Add Phase Button */}
                <button
                  onClick={addPhase}
                  className="min-w-[320px] h-64 rounded-xl border-2 border-dashed border-white/20 hover:border-electric-purple flex flex-col items-center justify-center gap-3 text-gray-500 hover:text-electric-purple transition-all"
                >
                  <Plus className="w-8 h-8" />
                  <span className="font-bold">Add Phase</span>
                </button>
              </div>
            </div>

            {/* Reality Check Sidebar */}
            <div className="w-80 flex-shrink-0">
              <RealityCheck
                phases={project.phases ?? []}
                targetDate={project.targetDate ?? ''}
              />
            </div>
          </div>
        </div>

        {/* Task Form Modal */}
        <TaskFormModal
          isOpen={isTaskModalOpen}
          onClose={() => setIsTaskModalOpen(false)}
          onSave={saveTask}
          task={editingTask}
          phaseId={activePhaseId}
        />

        {/* Drag Overlay */}
        <DragOverlay>
          {activeTask && (
            <div className="opacity-50">
              <TaskCard
                task={activeTask}
                onEdit={() => {}}
                onToggleComplete={() => {}}
              />
            </div>
          )}
        </DragOverlay>
      </div>
    </DndContext>
  );
}
