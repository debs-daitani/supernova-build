'use client';

import { Plus, Clock, CheckCircle } from 'lucide-react';
import { Phase, Task } from '@/lib/types';
import TaskCard from './TaskCard';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

interface PhaseColumnProps {
  phase: Phase;
  onAddTask: () => void;
  onEditTask: (task: Task) => void;
  onToggleTaskComplete: (taskId: string) => void;
}

export default function PhaseColumn({ phase, onAddTask, onEditTask, onToggleTaskComplete }: PhaseColumnProps) {
  const { setNodeRef } = useDroppable({
    id: phase.id,
  });

  const totalHours = phase.tasks.reduce((sum, task) => sum + task.estimatedHours, 0);
  const completedTasks = phase.tasks.filter(t => t.completed).length;

  return (
    <div className="flex flex-col h-full min-w-[320px]">
      {/* Phase Header */}
      <div
        className="p-4 rounded-t-xl border-2 border-b-0"
        style={{
          borderColor: phase.color,
          background: `linear-gradient(135deg, ${phase.color}15, transparent)`,
        }}
      >
        <h3 className="text-xl font-black text-white mb-2">{phase.name}</h3>
        {phase.description && (
          <p className="text-sm text-gray-400 mb-3">{phase.description}</p>
        )}

        {/* Phase Stats */}
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <CheckCircle className="w-4 h-4" />
            <span>{completedTasks}/{phase.tasks.length} tasks</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{totalHours}h estimated</span>
          </div>
        </div>
      </div>

      {/* Tasks Area */}
      <div
        ref={setNodeRef}
        className="flex-1 p-4 rounded-b-xl border-2 border-t-0 bg-black/20 backdrop-blur-sm overflow-y-auto"
        style={{ borderColor: phase.color }}
      >
        <SortableContext
          items={phase.tasks.map(t => t.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {phase.tasks.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-gray-600 text-sm">
                No tasks yet. Add one to get started!
              </div>
            ) : (
              phase.tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={() => onEditTask(task)}
                  onToggleComplete={() => onToggleTaskComplete(task.id)}
                />
              ))
            )}
          </div>
        </SortableContext>

        {/* Add Task Button */}
        <button
          onClick={onAddTask}
          className="w-full mt-4 py-3 rounded-lg border-2 border-dashed border-gray-700 hover:border-electric-purple text-gray-500 hover:text-electric-purple flex items-center justify-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span className="font-semibold">Add Task</span>
        </button>
      </div>
    </div>
  );
}
