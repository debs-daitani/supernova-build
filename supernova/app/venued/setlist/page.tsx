'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import VenuedNav from '../components/VenuedNav';
import {
  Plus,
  X,
  ChevronDown,
  ChevronRight,
  Save,
  Trash2,
  GripVertical,
} from 'lucide-react';

interface Phase {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  order: number;
  tasks: Task[];
}

interface Task {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  energyLevel: string;
  difficulty: string;
  order: number;
}

interface Project {
  id: string;
  name: string;
  description: string | null;
  status: string;
  priority: string;
  color: string | null;
  startDate: string | null;
  targetDate: string | null;
  phases: Phase[];
  tasks: Task[];
}

function SetlistContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get('project');
  const isNew = searchParams.get('new') === 'true';

  const [project, setProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewProject, setShowNewProject] = useState(isNew);
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set());
  const [newProjectForm, setNewProjectForm] = useState({
    name: '',
    description: '',
    priority: 'MEDIUM',
    color: '#FF008E',
  });
  const [newPhaseForm, setNewPhaseForm] = useState({ name: '', projectId: '' });
  const [newTaskForm, setNewTaskForm] = useState({ title: '', phaseId: '' });

  useEffect(() => {
    fetchProjects();
    if (projectId) {
      fetchProject(projectId);
    }
  }, [projectId]);

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/venued/projects');
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects || []);
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    }
  };

  const fetchProject = async (id: string) => {
    try {
      const res = await fetch(`/api/venued/projects/${id}`);
      if (res.ok) {
        const data = await res.json();
        setProject(data.project);
        // Expand all phases by default
        setExpandedPhases(new Set(data.project.phases.map((p: Phase) => p.id)));
      }
    } catch (error) {
      console.error('Failed to fetch project:', error);
    } finally {
      setLoading(false);
    }
  };

  const createProject = async () => {
    if (!newProjectForm.name.trim()) return;
    try {
      const res = await fetch('/api/venued/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProjectForm),
      });
      if (res.ok) {
        const data = await res.json();
        router.push(`/venued/setlist?project=${data.project.id}`);
        setShowNewProject(false);
        setNewProjectForm({ name: '', description: '', priority: 'MEDIUM', color: '#FF008E' });
      }
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  const createPhase = async () => {
    if (!newPhaseForm.name.trim() || !projectId) return;
    try {
      await fetch('/api/venued/phases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, name: newPhaseForm.name }),
      });
      fetchProject(projectId);
      setNewPhaseForm({ name: '', projectId: '' });
    } catch (error) {
      console.error('Failed to create phase:', error);
    }
  };

  const createTask = async (phaseId: string) => {
    if (!newTaskForm.title.trim()) return;
    try {
      await fetch('/api/venued/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          phaseId,
          title: newTaskForm.title,
        }),
      });
      if (projectId) fetchProject(projectId);
      setNewTaskForm({ title: '', phaseId: '' });
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const togglePhase = (phaseId: string) => {
    const newExpanded = new Set(expandedPhases);
    if (newExpanded.has(phaseId)) {
      newExpanded.delete(phaseId);
    } else {
      newExpanded.add(phaseId);
    }
    setExpandedPhases(newExpanded);
  };

  const toggleTask = async (task: Task) => {
    try {
      await fetch(`/api/venued/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !task.completed }),
      });
      if (projectId) fetchProject(projectId);
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const colors = ['#FF008E', '#00F0E9', '#FFE500', '#9D00FF', '#00FF88', '#FF6B00'];

  return (
    <div className="min-h-screen bg-black">
      <VenuedNav />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex gap-6">
          {/* Project Sidebar */}
          <div className="w-64 flex-shrink-0">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">Projects</h2>
              <button
                onClick={() => setShowNewProject(true)}
                className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20"
              >
                <Plus size={18} />
              </button>
            </div>
            <div className="space-y-2">
              {projects.map((p) => (
                <button
                  key={p.id}
                  onClick={() => router.push(`/venued/setlist?project=${p.id}`)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    projectId === p.id
                      ? 'bg-white/10 border border-[#00F0E9]/50'
                      : 'bg-white/5 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: p.color || '#FF008E' }}
                    />
                    <span className="font-medium text-white truncate">{p.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {showNewProject ? (
              <div className="bg-white/5 rounded-xl border border-white/10 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">New Project</h2>
                  <button onClick={() => setShowNewProject(false)} className="text-gray-400 hover:text-white">
                    <X size={24} />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Project Name</label>
                    <input
                      type="text"
                      value={newProjectForm.name}
                      onChange={(e) => setNewProjectForm({ ...newProjectForm, name: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#00F0E9]"
                      placeholder="My Awesome Project"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Description</label>
                    <textarea
                      value={newProjectForm.description}
                      onChange={(e) => setNewProjectForm({ ...newProjectForm, description: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#00F0E9] h-24"
                      placeholder="What's this project about?"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Color</label>
                    <div className="flex gap-2">
                      {colors.map((c) => (
                        <button
                          key={c}
                          onClick={() => setNewProjectForm({ ...newProjectForm, color: c })}
                          className={`w-8 h-8 rounded-lg ${newProjectForm.color === c ? 'ring-2 ring-white' : ''}`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={createProject}
                    className="w-full py-3 rounded-lg font-medium"
                    style={{ background: 'linear-gradient(135deg, #FF008E, #00F0E9)', color: '#000' }}
                  >
                    Create Project
                  </button>
                </div>
              </div>
            ) : project ? (
              <div>
                {/* Project Header */}
                <div className="flex items-center gap-4 mb-6">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                    style={{ backgroundColor: project.color || '#FF008E' }}
                  >
                    🎸
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-white">{project.name}</h1>
                    {project.description && <p className="text-gray-400">{project.description}</p>}
                  </div>
                </div>

                {/* Phases */}
                <div className="space-y-4">
                  {project.phases.map((phase) => (
                    <div key={phase.id} className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                      <button
                        onClick={() => togglePhase(phase.id)}
                        className="w-full flex items-center gap-3 p-4 hover:bg-white/5"
                      >
                        {expandedPhases.has(phase.id) ? (
                          <ChevronDown size={20} className="text-gray-400" />
                        ) : (
                          <ChevronRight size={20} className="text-gray-400" />
                        )}
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: phase.color || '#00F0E9' }}
                        />
                        <span className="font-medium text-white">{phase.name}</span>
                        <span className="text-gray-400 text-sm ml-auto">{phase.tasks.length} tasks</span>
                      </button>

                      {expandedPhases.has(phase.id) && (
                        <div className="px-4 pb-4">
                          <div className="space-y-2 ml-8">
                            {phase.tasks.map((task) => (
                              <div
                                key={task.id}
                                className="flex items-center gap-3 p-3 bg-white/5 rounded-lg"
                              >
                                <GripVertical size={16} className="text-gray-600 cursor-move" />
                                <button onClick={() => toggleTask(task)}>
                                  <div
                                    className={`w-5 h-5 rounded-full border-2 ${
                                      task.completed
                                        ? 'bg-green-500 border-green-500'
                                        : 'border-gray-400'
                                    }`}
                                  />
                                </button>
                                <span className={task.completed ? 'line-through text-gray-500' : 'text-white'}>
                                  {task.title}
                                </span>
                              </div>
                            ))}

                            {/* Add Task */}
                            {newTaskForm.phaseId === phase.id ? (
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={newTaskForm.title}
                                  onChange={(e) => setNewTaskForm({ ...newTaskForm, title: e.target.value })}
                                  onKeyDown={(e) => e.key === 'Enter' && createTask(phase.id)}
                                  className="flex-1 px-3 py-2 bg-white/10 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-[#00F0E9]"
                                  placeholder="Task name..."
                                  autoFocus
                                />
                                <button
                                  onClick={() => createTask(phase.id)}
                                  className="px-3 py-2 bg-[#00F0E9] text-black rounded-lg text-sm font-medium"
                                >
                                  Add
                                </button>
                                <button
                                  onClick={() => setNewTaskForm({ title: '', phaseId: '' })}
                                  className="px-3 py-2 bg-white/10 text-white rounded-lg"
                                >
                                  <X size={16} />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setNewTaskForm({ title: '', phaseId: phase.id })}
                                className="flex items-center gap-2 text-gray-400 hover:text-white text-sm"
                              >
                                <Plus size={16} /> Add task
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Add Phase */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newPhaseForm.name}
                      onChange={(e) => setNewPhaseForm({ ...newPhaseForm, name: e.target.value })}
                      onKeyDown={(e) => e.key === 'Enter' && createPhase()}
                      className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#00F0E9]"
                      placeholder="Add new phase..."
                    />
                    <button
                      onClick={createPhase}
                      className="px-4 py-3 rounded-lg font-medium"
                      style={{ background: 'linear-gradient(135deg, #FF008E, #00F0E9)', color: '#000' }}
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-16">
                <h2 className="text-xl font-bold text-white mb-2">Select a Project</h2>
                <p className="text-gray-400 mb-6">Choose a project from the sidebar or create a new one</p>
                <button
                  onClick={() => setShowNewProject(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium"
                  style={{ background: 'linear-gradient(135deg, #FF008E, #00F0E9)', color: '#000' }}
                >
                  <Plus size={18} />
                  New Project
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VenuedSetlistPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>}>
      <SetlistContent />
    </Suspense>
  );
}
