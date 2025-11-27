import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { websites } from '../../services/api';
import toast from 'react-hot-toast';

export default function WebsiteSettings() {
  const { websiteId } = useParams();
  const navigate = useNavigate();
  const [website, setWebsite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general'); // 'general', 'theme', 'seo', 'domain'

  const [formData, setFormData] = useState({
    name: '',
    title: '',
    description: '',
    favicon: '',
    logo: '',
    customDomain: '',
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
    googleAnalyticsId: '',
    theme: {
      colors: {
        primary: '#FF1493',
        secondary: '#9333EA',
        background: '#FFFFFF',
        text: '#1F2937'
      },
      fonts: {
        heading: 'Inter',
        body: 'Inter'
      }
    }
  });

  useEffect(() => {
    fetchWebsite();
  }, [websiteId]);

  const fetchWebsite = async () => {
    try {
      const res = await websites.get(websiteId);
      const site = res.data;
      setWebsite(site);

      setFormData({
        name: site.name || '',
        title: site.title || '',
        description: site.description || '',
        favicon: site.favicon || '',
        logo: site.logo || '',
        customDomain: site.customDomain || '',
        seoTitle: site.seoTitle || '',
        seoDescription: site.seoDescription || '',
        seoKeywords: site.seoKeywords?.join(', ') || '',
        googleAnalyticsId: site.googleAnalyticsId || '',
        theme: site.theme || {
          colors: {
            primary: '#FF1493',
            secondary: '#9333EA',
            background: '#FFFFFF',
            text: '#1F2937'
          },
          fonts: {
            heading: 'Inter',
            body: 'Inter'
          }
        }
      });
    } catch (error) {
      console.error('Error fetching website:', error);
      toast.error('Failed to load website');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      // Convert keywords string to array
      const keywords = formData.seoKeywords
        .split(',')
        .map(k => k.trim())
        .filter(k => k);

      await websites.update(websiteId, {
        ...formData,
        seoKeywords: keywords
      });

      toast.success('Settings saved!');
      fetchWebsite();
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handlePublishToggle = async () => {
    try {
      await websites.publish(websiteId, !website.published);
      toast.success(website.published ? 'Website unpublished' : 'Website published!');
      fetchWebsite();
    } catch (error) {
      console.error('Error publishing:', error);
      toast.error('Failed to update website');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this website? This cannot be undone.')) return;

    try {
      await websites.delete(websiteId);
      toast.success('Website deleted');
      navigate('/tools/websites');
    } catch (error) {
      console.error('Error deleting:', error);
      toast.error('Failed to delete website');
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  if (!website) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Website not found</h2>
          <Link to="/tools/websites" className="text-pink-600 hover:underline">
            Back to Websites
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link to={`/tools/websites/${websiteId}/builder`} className="text-gray-600 hover:text-gray-900 text-sm">
          ← Back to Builder
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mt-2">Website Settings</h1>
        <p className="text-gray-600">{website.name}</p>
      </div>

      {/* Status Card */}
      <div className="card mb-6 bg-gradient-to-r from-pink-50 to-purple-50">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                website.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
              }`}>
                {website.published ? 'Published' : 'Draft'}
              </span>
            </div>
            {website.subdomain && (
              <div>
                <a
                  href={`https://${website.subdomain}.daitaniverse.space`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {website.subdomain}.daitaniverse.space 🔗
                </a>
              </div>
            )}
            {website.customDomain && (
              <div className="text-sm text-gray-600 mt-1">
                Custom domain: {website.customDomain}
              </div>
            )}
          </div>
          <button
            onClick={handlePublishToggle}
            className={website.published ? 'btn-secondary' : 'btn-primary'}
          >
            {website.published ? 'Unpublish' : 'Publish Website'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {['general', 'theme', 'seo', 'domain'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                activeTab === tab
                  ? 'border-pink-500 text-pink-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* General Tab */}
      {activeTab === 'general' && (
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4">General Settings</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Site Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input"
                  placeholder="My Awesome Website"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input"
                  rows={3}
                  placeholder="A brief description of your website"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Logo URL
                </label>
                <input
                  type="url"
                  value={formData.logo}
                  onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                  className="input"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Favicon URL
                </label>
                <input
                  type="url"
                  value={formData.favicon}
                  onChange={(e) => setFormData({ ...formData, favicon: e.target.value })}
                  className="input"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Google Analytics ID
                </label>
                <input
                  type="text"
                  value={formData.googleAnalyticsId}
                  onChange={(e) => setFormData({ ...formData, googleAnalyticsId: e.target.value })}
                  className="input"
                  placeholder="G-XXXXXXXXXX"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Theme Tab */}
      {activeTab === 'theme' && (
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Theme Colors</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={formData.theme.colors.primary}
                    onChange={(e) => setFormData({
                      ...formData,
                      theme: {
                        ...formData.theme,
                        colors: { ...formData.theme.colors, primary: e.target.value }
                      }
                    })}
                    className="w-16 h-10 rounded border"
                  />
                  <input
                    type="text"
                    value={formData.theme.colors.primary}
                    onChange={(e) => setFormData({
                      ...formData,
                      theme: {
                        ...formData.theme,
                        colors: { ...formData.theme.colors, primary: e.target.value }
                      }
                    })}
                    className="input flex-1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Secondary Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={formData.theme.colors.secondary}
                    onChange={(e) => setFormData({
                      ...formData,
                      theme: {
                        ...formData.theme,
                        colors: { ...formData.theme.colors, secondary: e.target.value }
                      }
                    })}
                    className="w-16 h-10 rounded border"
                  />
                  <input
                    type="text"
                    value={formData.theme.colors.secondary}
                    onChange={(e) => setFormData({
                      ...formData,
                      theme: {
                        ...formData.theme,
                        colors: { ...formData.theme.colors, secondary: e.target.value }
                      }
                    })}
                    className="input flex-1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Background Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={formData.theme.colors.background}
                    onChange={(e) => setFormData({
                      ...formData,
                      theme: {
                        ...formData.theme,
                        colors: { ...formData.theme.colors, background: e.target.value }
                      }
                    })}
                    className="w-16 h-10 rounded border"
                  />
                  <input
                    type="text"
                    value={formData.theme.colors.background}
                    onChange={(e) => setFormData({
                      ...formData,
                      theme: {
                        ...formData.theme,
                        colors: { ...formData.theme.colors, background: e.target.value }
                      }
                    })}
                    className="input flex-1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Text Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={formData.theme.colors.text}
                    onChange={(e) => setFormData({
                      ...formData,
                      theme: {
                        ...formData.theme,
                        colors: { ...formData.theme.colors, text: e.target.value }
                      }
                    })}
                    className="w-16 h-10 rounded border"
                  />
                  <input
                    type="text"
                    value={formData.theme.colors.text}
                    onChange={(e) => setFormData({
                      ...formData,
                      theme: {
                        ...formData.theme,
                        colors: { ...formData.theme.colors, text: e.target.value }
                      }
                    })}
                    className="input flex-1"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Fonts</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Heading Font
                </label>
                <select
                  value={formData.theme.fonts.heading}
                  onChange={(e) => setFormData({
                    ...formData,
                    theme: {
                      ...formData.theme,
                      fonts: { ...formData.theme.fonts, heading: e.target.value }
                    }
                  })}
                  className="input"
                >
                  <option value="Inter">Inter</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Poppins">Poppins</option>
                  <option value="Montserrat">Montserrat</option>
                  <option value="Playfair Display">Playfair Display</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Body Font
                </label>
                <select
                  value={formData.theme.fonts.body}
                  onChange={(e) => setFormData({
                    ...formData,
                    theme: {
                      ...formData.theme,
                      fonts: { ...formData.theme.fonts, body: e.target.value }
                    }
                  })}
                  className="input"
                >
                  <option value="Inter">Inter</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Poppins">Poppins</option>
                  <option value="Open Sans">Open Sans</option>
                  <option value="Lato">Lato</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SEO Tab */}
      {activeTab === 'seo' && (
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4">SEO Settings</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SEO Title
                </label>
                <input
                  type="text"
                  value={formData.seoTitle}
                  onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                  className="input"
                  placeholder="Appears in search results"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.seoTitle.length}/60 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SEO Description
                </label>
                <textarea
                  value={formData.seoDescription}
                  onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                  className="input"
                  rows={3}
                  placeholder="Description shown in search results"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.seoDescription.length}/160 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Keywords (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.seoKeywords}
                  onChange={(e) => setFormData({ ...formData, seoKeywords: e.target.value })}
                  className="input"
                  placeholder="keyword1, keyword2, keyword3"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Domain Tab */}
      {activeTab === 'domain' && (
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Domain Settings</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Subdomain
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={website.subdomain}
                    disabled
                    className="input bg-gray-50"
                  />
                  <span className="text-gray-600">.daitaniverse.space</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Your default subdomain cannot be changed
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Domain (Coming Soon)
                </label>
                <input
                  type="text"
                  value={formData.customDomain}
                  onChange={(e) => setFormData({ ...formData, customDomain: e.target.value })}
                  className="input"
                  placeholder="www.yourdomain.com"
                  disabled
                />
                <p className="text-xs text-gray-500 mt-1">
                  Connect your own domain with SSL certificate
                </p>
              </div>
            </div>
          </div>

          <div className="card bg-blue-50">
            <h3 className="font-semibold text-gray-900 mb-2">📌 Custom Domain Setup</h3>
            <p className="text-sm text-gray-700 mb-2">
              To use a custom domain, you'll need to:
            </p>
            <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
              <li>Add your domain in the field above</li>
              <li>Update your DNS settings with your domain provider</li>
              <li>Add a CNAME record pointing to: hosting.daitaniverse.space</li>
              <li>Wait for DNS propagation (up to 48 hours)</li>
              <li>SSL certificate will be automatically provisioned</li>
            </ol>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4 mt-8">
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary flex-1"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
        <button
          onClick={handleDelete}
          className="btn-secondary hover:bg-red-50 hover:text-red-600"
        >
          Delete Website
        </button>
      </div>
    </div>
  );
}
