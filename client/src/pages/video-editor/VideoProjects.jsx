import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { videoProjects } from '../../services/api';

export default function VideoProjects() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [showTemplates, setShowTemplates] = useState(false);

  const templates = [
    { name: 'Custom', resolution: '1920x1080', aspectRatio: '16:9', frameRate: 30, icon: '✨', description: 'Your own dimensions' },
    { name: 'YouTube', resolution: '1920x1080', aspectRatio: '16:9', frameRate: 30, icon: '🎬', description: '1080p landscape' },
    { name: 'TikTok/Reels', resolution: '1080x1920', aspectRatio: '9:16', frameRate: 30, icon: '📱', description: 'Vertical video' },
    { name: 'Instagram Square', resolution: '1080x1080', aspectRatio: '1:1', frameRate: 30, icon: '⬜', description: 'Square format' },
    { name: '4K Landscape', resolution: '3840x2160', aspectRatio: '16:9', frameRate: 60, icon: '🎥', description: 'Ultra HD' },
    { name: 'Podcast', resolution: '1920x1080', aspectRatio: '16:9', frameRate: 24, icon: '🎙️', description: 'Audio-focused' },
  ];

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const data = await videoProjects.list();
      setProjects(data);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (template) => {
    try {
      let projectData = {
        name: `${template.name} Project`,
        resolution: template.resolution,
        aspectRatio: template.aspectRatio,
        frameRate: template.frameRate,
        timeline: {
          tracks: [
            { id: 'video1', type: 'video', clips: [] },
            { id: 'audio1', type: 'audio', clips: [] },
          ],
          duration: 0,
        },
      };

      // For custom, prompt for dimensions
      if (template.name === 'Custom') {
        const name = prompt('Project name:') || 'Untitled Project';
        const width = prompt('Width (px):', '1920') || '1920';
        const height = prompt('Height (px):', '1080') || '1080';
        const fps = prompt('Frame rate (fps):', '30') || '30';

        projectData = {
          ...projectData,
          name,
          resolution: `${width}x${height}`,
          frameRate: parseInt(fps),
        };
      }

      const project = await videoProjects.create(projectData);
      // For now, navigate back to projects list
      // TODO: Navigate to video editor when built
      alert('Video editor canvas coming soon! Project created successfully.');
      loadProjects();
    } catch (error) {
      console.error('Failed to create project:', error);
      alert('Failed to create project. Please try again.');
    } finally {
      setShowTemplates(false);
    }
  };

  const handleOpenProject = (projectId) => {
    // TODO: Navigate to video editor when built
    alert('Video editor canvas coming soon!');
  };

  const handleDuplicateProject = async (e, projectId) => {
    e.stopPropagation();

    if (!confirm('Duplicate this project?')) return;

    try {
      await videoProjects.duplicate(projectId);
      loadProjects();
    } catch (error) {
      console.error('Failed to duplicate project:', error);
      alert('Failed to duplicate project.');
    }
  };

  const handleDeleteProject = async (e, projectId) => {
    e.stopPropagation();

    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      await videoProjects.delete(projectId);
      loadProjects();
    } catch (error) {
      console.error('Failed to delete project:', error);
      alert('Failed to delete project.');
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-pink-900 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <div className="text-6xl mb-4 animate-pulse">🎬</div>
            <p className="text-purple-300">Loading your video projects...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-pink-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">🎬 Video Editor</h1>
              <p className="text-purple-200">Create and edit professional videos</p>
            </div>
            <button
              onClick={() => setShowTemplates(true)}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg"
            >
              + New Project
            </button>
          </div>
        </div>

        {/* Template Selection Modal */}
        {showTemplates && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 rounded-xl max-w-4xl w-full p-6 border border-white/20">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Choose Template</h2>
                <button
                  onClick={() => setShowTemplates(false)}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map((template) => (
                  <button
                    key={template.name}
                    onClick={() => handleCreateProject(template)}
                    className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:border-purple-400/50 transition-all text-left group"
                  >
                    <div className="text-4xl mb-3">{template.icon}</div>
                    <h3 className="text-white text-lg font-bold mb-1 group-hover:text-purple-300 transition-colors">
                      {template.name}
                    </h3>
                    <p className="text-purple-300 text-sm mb-2">{template.description}</p>
                    <div className="text-purple-400 text-xs">
                      {template.resolution} • {template.aspectRatio} • {template.frameRate}fps
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-12 border border-white/20 text-center">
            <p className="text-6xl mb-4">🎥</p>
            <h3 className="text-white text-2xl font-bold mb-2">No video projects yet</h3>
            <p className="text-purple-300 mb-6">
              Create your first video project to get started!
            </p>
            <button
              onClick={() => setShowTemplates(true)}
              className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold transition-all"
            >
              Create Your First Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                onClick={() => handleOpenProject(project.id)}
                className="bg-white/10 backdrop-blur-lg rounded-xl overflow-hidden border border-white/20 hover:border-purple-400/50 transition-all cursor-pointer group"
              >
                {/* Thumbnail */}
                <div className="aspect-video bg-gradient-to-br from-purple-900/50 to-pink-900/50 flex items-center justify-center">
                  {project.thumbnail ? (
                    <img
                      src={project.thumbnail}
                      alt={project.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-6xl opacity-50">🎬</div>
                  )}
                </div>

                {/* Project Info */}
                <div className="p-4">
                  <h3 className="text-white font-bold text-lg mb-1 truncate group-hover:text-purple-300 transition-colors">
                    {project.name}
                  </h3>
                  <div className="flex items-center gap-2 text-purple-300 text-sm mb-3">
                    <span>{project.resolution}</span>
                    <span>•</span>
                    <span>{project.frameRate}fps</span>
                    {project.duration && (
                      <>
                        <span>•</span>
                        <span>{formatDuration(project.duration)}</span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-purple-400">
                    <span>
                      {new Date(project.updatedAt).toLocaleDateString()}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => handleDuplicateProject(e, project.id)}
                        className="hover:text-purple-200 transition-colors"
                        title="Duplicate"
                      >
                        📋
                      </button>
                      <button
                        onClick={(e) => handleDeleteProject(e, project.id)}
                        className="hover:text-red-300 transition-colors"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Coming Soon Features */}
        <div className="mt-12 bg-purple-500/10 backdrop-blur-lg rounded-xl p-6 border border-purple-400/20">
          <h3 className="text-white font-bold mb-3">🎥 Coming Soon</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-purple-200 text-sm">
            <div className="flex items-start gap-2">
              <span>✓</span>
              <span>Multi-track timeline editor (video + audio tracks)</span>
            </div>
            <div className="flex items-start gap-2">
              <span>✓</span>
              <span>Video trimming, cutting, and splitting</span>
            </div>
            <div className="flex items-start gap-2">
              <span>✓</span>
              <span>Transitions (fade, dissolve, wipe, slide)</span>
            </div>
            <div className="flex items-start gap-2">
              <span>✓</span>
              <span>Text overlays and animated titles</span>
            </div>
            <div className="flex items-start gap-2">
              <span>✓</span>
              <span>Effects and filters (blur, color correction)</span>
            </div>
            <div className="flex items-start gap-2">
              <span>✓</span>
              <span>Color grading tools</span>
            </div>
            <div className="flex items-start gap-2">
              <span>✓</span>
              <span>Speed controls (slow-mo, time-lapse)</span>
            </div>
            <div className="flex items-start gap-2">
              <span>✓</span>
              <span>Export to MP4 (4K, 1080p, 720p, 480p)</span>
            </div>
            <div className="flex items-start gap-2">
              <span>✓</span>
              <span>Stock video library (Pexels integration)</span>
            </div>
            <div className="flex items-start gap-2">
              <span>✓</span>
              <span>Royalty-free music library</span>
            </div>
            <div className="flex items-start gap-2">
              <span>✓</span>
              <span>Render queue with progress tracking</span>
            </div>
            <div className="flex items-start gap-2">
              <span>✓</span>
              <span>Keyboard shortcuts (J/K/L playback control)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
