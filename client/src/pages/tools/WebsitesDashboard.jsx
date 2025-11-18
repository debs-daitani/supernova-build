import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { websites } from '../../services/api';
import toast from 'react-hot-toast';

export default function WebsitesDashboard() {
  const [websitesList, setWebsitesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    templateId: null
  });

  useEffect(() => {
    fetchWebsites();
  }, []);

  const fetchWebsites = async () => {
    try {
      const res = await websites.list();
      setWebsitesList(res.data);
    } catch (error) {
      console.error('Error fetching websites:', error);
      toast.error('Failed to load websites');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();

    if (!createForm.name.trim()) {
      toast.error('Please enter a website name');
      return;
    }

    try {
      const res = await websites.create(createForm);
      toast.success('Website created!');
      setShowCreateModal(false);
      setCreateForm({ name: '', templateId: null });
      fetchWebsites();
    } catch (error) {
      console.error('Error creating website:', error);
      toast.error(error.response?.data?.error || 'Failed to create website');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this website? This cannot be undone.')) return;

    try {
      await websites.delete(id);
      toast.success('Website deleted');
      fetchWebsites();
    } catch (error) {
      console.error('Error deleting:', error);
      toast.error('Failed to delete website');
    }
  };

  const handleTogglePublish = async (website) => {
    try {
      await websites.publish(website.id, !website.published);
      toast.success(website.published ? 'Website unpublished' : 'Website published!');
      fetchWebsites();
    } catch (error) {
      console.error('Error publishing:', error);
      toast.error('Failed to update website');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Websites</h1>
          <p className="text-gray-600 mt-1">Build professional websites with drag-and-drop</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary"
        >
          + Create Website
        </button>
      </div>

      {/* Websites Grid */}
      {websitesList.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">🌐</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Websites Yet</h3>
          <p className="text-gray-600 mb-6">
            Create your first website to get started
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary"
          >
            Create Your First Website
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {websitesList.map(site => (
            <div key={site.id} className="card hover:shadow-lg transition-shadow">
              {/* Preview/Thumbnail */}
              <div className="h-40 bg-gradient-to-br from-pink-100 to-purple-100 rounded-lg mb-4 flex items-center justify-center">
                {site.logo ? (
                  <img src={site.logo} alt={site.name} className="max-h-full" />
                ) : (
                  <div className="text-6xl">🌐</div>
                )}
              </div>

              {/* Website Info */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-lg text-gray-900">{site.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    site.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {site.published ? 'Published' : 'Draft'}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  {site._count?.pages || 0} pages
                </div>
                {site.subdomain && (
                  <div className="text-xs text-blue-600 mt-1 truncate">
                    {site.subdomain}.daitaniverse.space
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Link
                  to={`/tools/websites/${site.id}/builder`}
                  className="flex-1 btn-primary text-sm text-center"
                >
                  Edit
                </Link>
                <Link
                  to={`/tools/websites/${site.id}/settings`}
                  className="btn-secondary text-sm"
                >
                  ⚙️
                </Link>
                <button
                  onClick={() => handleTogglePublish(site)}
                  className="btn-secondary text-sm"
                  title={site.published ? 'Unpublish' : 'Publish'}
                >
                  {site.published ? '👁️' : '🚀'}
                </button>
                <button
                  onClick={() => handleDelete(site.id)}
                  className="btn-secondary text-sm hover:bg-red-50 hover:text-red-600"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Create New Website</h2>

            <form onSubmit={handleCreate}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website Name
                </label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  className="input"
                  placeholder="My Awesome Website"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start From Template (Optional)
                </label>
                <select
                  value={createForm.templateId || ''}
                  onChange={(e) => setCreateForm({ ...createForm, templateId: e.target.value || null })}
                  className="input"
                >
                  <option value="">Blank Website</option>
                  <option value="business">Business Template</option>
                  <option value="portfolio">Portfolio Template</option>
                  <option value="landing">Landing Page Template</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">Templates coming soon - starting with blank for now</p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary"
                >
                  Create Website
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Feature Info */}
      <div className="card bg-gradient-to-r from-pink-50 to-purple-50 mt-8">
        <h3 className="text-xl font-bold text-gray-900 mb-4">🎨 Wix Killer Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">✅ Infrastructure Ready:</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Database models for websites, pages, templates</li>
              <li>• Server-side rendering engine</li>
              <li>• Subdomain hosting (*.daitaniverse.space)</li>
              <li>• Custom domain support</li>
              <li>• Theme system with colors and fonts</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">🎯 Page Builder Blocks:</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Sections with styling</li>
              <li>• Headings and paragraphs</li>
              <li>• Buttons with links</li>
              <li>• Images with styling</li>
              <li>• Video embeds (YouTube)</li>
              <li>• Dividers</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">🔧 Ready for Enhancement:</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Visual drag-and-drop builder</li>
              <li>• Professional templates</li>
              <li>• SEO optimization tools</li>
              <li>• Blog functionality</li>
              <li>• E-commerce integration</li>
              <li>• AI content generation</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
