import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { projects, tasks as tasksApi, projectSections } from '../../services/api';
import toast from 'react-hot-toast';

export default function Projects() {
  const { projectId } = useParams();
  const [projectsList, setProjectsList] = useState([]);
  const [activeProject, setActiveProject] = useState(null);
  const [projectTasks, setProjectTasks] = useState([]);
  const [view, setView] = useState('list'); // list, board
  const [loading, setLoading] = useState(true);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [draggedTask, setDraggedTask] = useState(null);

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (projectId && projectsList.length > 0) {
      const project = projectsList.find((p) => p.id === projectId);
      if (project) {
        setActiveProject(project);
        setView(project.view || 'list');
        loadProjectTasks(projectId);
      }
    } else if (!projectId && projectsList.length > 0) {
      setActiveProject(projectsList[0]);
      loadProjectTasks(projectsList[0].id);
    }
  }, [projectId, projectsList]);

  const loadProjects = async () => {
    try {
      const response = await projects.list({ archived: false });
      setProjectsList(response.data);
    } catch (error) {
      console.error('Error loading projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const loadProjectTasks = async (id) => {
    try {
      const response = await tasksApi.list({ projectId: id });
      setProjectTasks(response.data);
    } catch (error) {
      console.error('Error loading tasks:', error);
      toast.error('Failed to load tasks');
    }
  };

  const handleCreateProject = async (data) => {
    try {
      const response = await projects.create(data);
      toast.success('Project created!');
      setShowCreateProject(false);
      loadProjects();
      setActiveProject(response.data);
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Failed to create project');
    }
  };

  const handleCreateTask = async (data) => {
    try {
      await tasksApi.create({
        ...data,
        projectId: activeProject.id,
      });
      toast.success('Task created!');
      setShowCreateTask(false);
      if (activeProject) {
        loadProjectTasks(activeProject.id);
      }
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task');
    }
  };

  const handleCompleteTask = async (taskId) => {
    try {
      await tasksApi.complete(taskId);
      toast.success('Task completed! 🎉');
      if (activeProject) {
        loadProjectTasks(activeProject.id);
      }
    } catch (error) {
      console.error('Error completing task:', error);
      toast.error('Failed to complete task');
    }
  };

  const handleChangeView = async (newView) => {
    if (!activeProject) return;

    try {
      await projects.update(activeProject.id, { view: newView });
      setView(newView);
      setActiveProject({ ...activeProject, view: newView });
    } catch (error) {
      console.error('Error updating view:', error);
      toast.error('Failed to update view');
    }
  };

  const handleDragStart = (task) => {
    setDraggedTask(task);
  };

  const handleDrop = async (newStatus) => {
    if (!draggedTask || draggedTask.status === newStatus) return;

    try {
      await tasksApi.update(draggedTask.id, { status: newStatus });
      setDraggedTask(null);
      if (activeProject) {
        loadProjectTasks(activeProject.id);
      }
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - Projects List */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold mb-4">Projects</h2>
          <button
            onClick={() => setShowCreateProject(true)}
            className="w-full btn-primary text-sm"
          >
            + New Project
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {projectsList.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              No projects yet. Create your first project!
            </div>
          ) : (
            <div className="p-2">
              {projectsList.map((project) => (
                <Link
                  key={project.id}
                  to={`/tasks/projects/${project.id}`}
                  className={`block p-3 rounded-lg mb-2 transition-colors ${
                    activeProject?.id === project.id
                      ? 'bg-pink-50 text-pink-600 font-semibold'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>{project.icon || '📁'}</span>
                    <span className="flex-1 truncate">{project.name}</span>
                    {project.tasks && project.tasks.length > 0 && (
                      <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
                        {project.tasks.length}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-200">
          <Link
            to="/tasks"
            className="block text-center text-sm text-gray-600 hover:text-pink-600 transition-colors"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {activeProject ? (
          <>
            {/* Project Header */}
            <div className="bg-white border-b border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{activeProject.icon || '📁'}</span>
                  <div>
                    <h1 className="text-2xl font-bold">{activeProject.name}</h1>
                    {activeProject.description && (
                      <p className="text-gray-600 text-sm mt-1">{activeProject.description}</p>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => setShowCreateTask(true)}
                  className="btn-primary"
                >
                  + Add Task
                </button>
              </div>

              {/* View Switcher */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleChangeView('list')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    view === 'list'
                      ? 'bg-pink-100 text-pink-600'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  📋 List
                </button>
                <button
                  onClick={() => handleChangeView('board')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    view === 'board'
                      ? 'bg-pink-100 text-pink-600'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  📊 Board
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-auto p-6">
              {view === 'list' ? (
                <ListView
                  tasks={projectTasks}
                  onComplete={handleCompleteTask}
                />
              ) : (
                <BoardView
                  tasks={projectTasks}
                  onComplete={handleCompleteTask}
                  onDragStart={handleDragStart}
                  onDrop={handleDrop}
                />
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-500 mb-4">Select a project to get started</p>
              <button
                onClick={() => setShowCreateProject(true)}
                className="btn-primary"
              >
                Create Your First Project
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateProject && (
        <CreateProjectModal
          onClose={() => setShowCreateProject(false)}
          onCreate={handleCreateProject}
        />
      )}

      {showCreateTask && activeProject && (
        <CreateTaskModal
          onClose={() => setShowCreateTask(false)}
          onCreate={handleCreateTask}
        />
      )}
    </div>
  );
}

function ListView({ tasks, onComplete }) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-2">No tasks yet</p>
        <p className="text-sm text-gray-400">Add your first task to get started!</p>
      </div>
    );
  }

  const incompleteTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  return (
    <div className="space-y-6">
      {/* Incomplete Tasks */}
      {incompleteTasks.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-600 mb-3">
            TO DO ({incompleteTasks.length})
          </h3>
          <div className="space-y-2">
            {incompleteTasks.map((task) => (
              <TaskCard key={task.id} task={task} onComplete={onComplete} />
            ))}
          </div>
        </div>
      )}

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-600 mb-3">
            ✅ COMPLETED ({completedTasks.length})
          </h3>
          <div className="space-y-2">
            {completedTasks.map((task) => (
              <TaskCard key={task.id} task={task} onComplete={onComplete} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function BoardView({ tasks, onComplete, onDragStart, onDrop }) {
  const COLUMNS = [
    { id: 'todo', name: 'To Do', icon: '📝', color: 'bg-gray-100' },
    { id: 'in_progress', name: 'In Progress', icon: '🔄', color: 'bg-blue-100' },
    { id: 'done', name: 'Done', icon: '✅', color: 'bg-green-100' },
  ];

  const getTasksByStatus = (status) => {
    return tasks.filter((t) => t.status === status);
  };

  return (
    <div className="grid grid-cols-3 gap-4 h-full">
      {COLUMNS.map((column) => (
        <div
          key={column.id}
          className={`${column.color} rounded-lg p-4 flex flex-col`}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => onDrop(column.id)}
        >
          <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
            <span>{column.icon}</span>
            <span>{column.name}</span>
            <span className="ml-auto text-xs bg-white px-2 py-1 rounded-full">
              {getTasksByStatus(column.id).length}
            </span>
          </h3>

          <div className="space-y-2 flex-1 overflow-y-auto">
            {getTasksByStatus(column.id).map((task) => (
              <div
                key={task.id}
                draggable
                onDragStart={() => onDragStart(task)}
                className="cursor-move"
              >
                <TaskCard task={task} onComplete={onComplete} compact />
              </div>
            ))}

            {getTasksByStatus(column.id).length === 0 && (
              <p className="text-sm text-gray-400 text-center py-8">
                No tasks
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function TaskCard({ task, onComplete, compact = false }) {
  const getPriorityColor = (priority) => {
    const colors = {
      urgent: 'border-l-red-500',
      high: 'border-l-orange-500',
      medium: 'border-l-blue-500',
      low: 'border-l-gray-400',
    };
    return colors[priority] || colors.medium;
  };

  return (
    <div className={`bg-white rounded-lg p-4 border-l-4 ${getPriorityColor(task.priority)} hover:shadow-md transition-shadow`}>
      <div className="flex items-start gap-3">
        <button
          onClick={() => onComplete(task.id)}
          className="mt-1 w-5 h-5 rounded-full border-2 border-gray-300 hover:border-pink-600 hover:bg-pink-50 transition-colors flex items-center justify-center flex-shrink-0"
        >
          {task.completed && <span className="text-pink-600 text-xs">✓</span>}
        </button>

        <div className="flex-1 min-w-0">
          <Link to={`/tasks/${task.id}`}>
            <p className={`font-medium text-sm ${task.completed ? 'line-through text-gray-400' : ''}`}>
              {task.title}
            </p>
          </Link>

          {!compact && task.description && (
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
              {task.description}
            </p>
          )}

          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {task.dueDate && (
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                📅 {new Date(task.dueDate).toLocaleDateString()}
              </span>
            )}

            {task.subtasks && task.subtasks.length > 0 && (
              <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded">
                ✓ {task.subtasks.filter((st) => st.completed).length}/{task.subtasks.length}
              </span>
            )}

            {task.tags && task.tags.length > 0 && (
              <span className="text-xs bg-pink-100 text-pink-600 px-2 py-1 rounded">
                🏷️ {task.tags[0]}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CreateProjectModal({ onClose, onCreate }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '📁',
    color: '#FF1493',
    view: 'list',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreate(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-4">Create New Project</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Project Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input w-full"
              required
            />
          </div>

          <div>
            <label className="label">Description (optional)</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input w-full"
              rows={3}
            />
          </div>

          <div>
            <label className="label">Icon</label>
            <input
              type="text"
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              className="input w-full"
              placeholder="📁"
            />
          </div>

          <div>
            <label className="label">Color</label>
            <input
              type="color"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              className="input w-full h-12"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1">
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CreateTaskModal({ onClose, onCreate }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreate(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-4">Create New Task</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Task Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="input w-full"
              required
            />
          </div>

          <div>
            <label className="label">Description (optional)</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input w-full"
              rows={3}
            />
          </div>

          <div>
            <label className="label">Priority</label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="input w-full"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div>
            <label className="label">Due Date (optional)</label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="input w-full"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1">
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
