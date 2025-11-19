import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { imageProjects } from '../../services/api';

export default function ImageProjects() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const data = await imageProjects.list();
      setProjects(data);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      await imageProjects.delete(id);
      setProjects(projects.filter(p => p.id !== id));
    } catch (error) {
      console.error('Failed to delete project:', error);
      alert('Failed to delete project');
    }
  };

  const handleDuplicate = async (id) => {
    try {
      const duplicate = await imageProjects.duplicate(id);
      setProjects([duplicate, ...projects]);
    } catch (error) {
      console.error('Failed to duplicate project:', error);
      alert('Failed to duplicate project');
    }
  };

  const handleNewProject = async (template) => {
    try {
      const project = await imageProjects.create({
        name: `Untitled ${projects.length + 1}`,
        ...template,
      });
      navigate(`/image-editor/${project.id}`);
    } catch (error) {
      console.error('Failed to create project:', error);
      alert('Failed to create project');
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-pink-900 to-purple-900 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <div className="text-6xl mb-4 animate-pulse">🎨</div>
            <p className="text-pink-300">Loading your projects...</p>
          </div>
        </div>
      </div>
    );
  }

  const templates = [
    { name: 'Custom', width: 1920, height: 1080, icon: '✨' },
    { name: 'Instagram Post', width: 1080, height: 1080, icon: '📱' },
    { name: 'Instagram Story', width: 1080, height: 1920, icon: '📲' },
    { name: 'Facebook Post', width: 1200, height: 630, icon: '👥' },
    { name: 'YouTube Thumbnail', width: 1280, height: 720, icon: '🎬' },
    { name: 'Twitter Header', width: 1500, height: 500, icon: '🐦' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-pink-900 to-purple-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">🎨 Image Editor</h1>
          <p className="text-pink-200">Professional photo editing and graphic design</p>
        </div>

        {/* New Project Templates */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Create New Project</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {templates.map(template => (
              <button
                key={template.name}
                onClick={() => handleNewProject(template)}
                className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:border-pink-400/50 transition-all text-center group"
              >
                <div className="text-4xl mb-2">{template.icon}</div>
                <p className="text-white font-semibold text-sm mb-1">{template.name}</p>
                <p className="text-pink-300 text-xs">{template.width}×{template.height}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Your Projects */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Your Projects</h2>
            <span className="text-pink-300 text-sm">{projects.length} project{projects.length !== 1 ? 's' : ''}</span>
          </div>

          {projects.length === 0 ? (
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-12 border border-white/20 text-center">
              <p className="text-6xl mb-4">🖼️</p>
              <h3 className="text-white text-2xl font-bold mb-2">No projects yet</h3>
              <p className="text-pink-300 mb-6">
                Create your first image editing project to get started
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map(project => (
                <div
                  key={project.id}
                  className="bg-white/10 backdrop-blur-lg rounded-xl overflow-hidden border border-white/20 hover:border-pink-400/50 transition-all group"
                >
                  {/* Thumbnail */}
                  <Link
                    to={`/image-editor/${project.id}`}
                    className="block aspect-video bg-gray-800 relative overflow-hidden"
                  >
                    {project.thumbnail ? (
                      <img
                        src={project.thumbnail}
                        alt={project.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-6xl">
                        🎨
                      </div>
                    )}
                  </Link>

                  {/* Info */}
                  <div className="p-4">
                    <Link to={`/image-editor/${project.id}`}>
                      <h3 className="text-white font-bold mb-1 group-hover:text-pink-300 transition-colors">
                        {project.name}
                      </h3>
                    </Link>
                    <p className="text-pink-300 text-sm mb-3">
                      {project.width}×{project.height}px
                    </p>
                    <p className="text-pink-400 text-xs mb-4">
                      Updated {formatDate(project.updatedAt)}
                    </p>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Link
                        to={`/image-editor/${project.id}`}
                        className="flex-1 bg-pink-500/20 hover:bg-pink-500/30 text-pink-200 px-3 py-2 rounded-lg text-center text-sm font-semibold transition-all border border-pink-400/30"
                      >
                        Open
                      </Link>
                      <button
                        onClick={() => handleDuplicate(project.id)}
                        className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 px-3 py-2 rounded-lg text-sm font-semibold transition-all border border-purple-400/30"
                        title="Duplicate"
                      >
                        📋
                      </button>
                      <button
                        onClick={() => handleDelete(project.id)}
                        className="bg-red-500/20 hover:bg-red-500/30 text-red-200 px-3 py-2 rounded-lg text-sm font-semibold transition-all border border-red-400/30"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="mt-8 bg-pink-500/10 backdrop-blur-lg rounded-xl p-6 border border-pink-400/20">
          <h3 className="text-white font-bold mb-3">💡 Coming Soon</h3>
          <ul className="space-y-2 text-pink-200 text-sm">
            <li>• Full canvas-based image editor with Fabric.js</li>
            <li>• Layers system with blend modes</li>
            <li>• Selection tools (rectangle, lasso, magic wand)</li>
            <li>• Drawing tools (brush, eraser, shapes, text)</li>
            <li>• Adjustments (brightness, contrast, saturation, curves)</li>
            <li>• Filters (blur, sharpen, artistic effects)</li>
            <li>• AI tools (background removal, object removal, upscaling)</li>
            <li>• Export to PNG, JPG, WEBP, PDF</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
