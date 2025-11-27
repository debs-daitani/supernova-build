import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { videoScripts, videoTemplates } from '../../services/api';

const TONES = ['professional', 'casual', 'enthusiastic', 'educational', 'inspirational'];
const TEMPLATES = [
  { id: 'tutorial', name: 'Tutorial', icon: '📚', description: 'Step-by-step how-to videos' },
  { id: 'product', name: 'Product Demo', icon: '🛍️', description: 'Showcase product features' },
  { id: 'educational', name: 'Educational', icon: '🎓', description: 'Teach complex concepts' },
  { id: 'listicle', name: 'Listicle', icon: '📋', description: 'Top X lists and rankings' },
  { id: 'testimonial', name: 'Testimonial', icon: '💬', description: 'Customer success stories' },
];

export default function ScriptGenerator() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const scriptId = searchParams.get('id');

  const [mode, setMode] = useState('create'); // 'create' or 'view'
  const [selectedTemplate, setSelectedTemplate] = useState('tutorial');
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [myScripts, setMyScripts] = useState([]);
  const [currentScript, setCurrentScript] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    topic: '',
    duration: 5,
    tone: 'professional',
    keyPoints: '',
    callToAction: '',
    targetAudience: '',
  });

  useEffect(() => {
    loadMyScripts();
    if (scriptId) {
      loadScript(scriptId);
    }
  }, [scriptId]);

  const loadMyScripts = async () => {
    try {
      const scripts = await videoScripts.list({ limit: 50 });
      setMyScripts(scripts);
    } catch (error) {
      console.error('Failed to load scripts:', error);
    }
  };

  const loadScript = async (id) => {
    try {
      setLoading(true);
      const script = await videoScripts.get(id);
      setCurrentScript(script);
      setMode('view');
      setFormData({
        title: script.title,
        topic: script.topic,
        duration: script.duration,
        tone: script.tone,
        keyPoints: '',
        callToAction: '',
        targetAudience: '',
      });
    } catch (error) {
      console.error('Failed to load script:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGenerateScript = async () => {
    if (!formData.title || !formData.topic) {
      alert('Please fill in title and topic');
      return;
    }

    try {
      setGenerating(true);
      const keyPointsArray = formData.keyPoints
        .split('\n')
        .map(p => p.trim())
        .filter(p => p);

      const script = await videoScripts.generate({
        ...formData,
        keyPoints: keyPointsArray,
        templateType: selectedTemplate,
      });

      setCurrentScript(script);
      setMode('view');
      await loadMyScripts();
    } catch (error) {
      console.error('Failed to generate script:', error);
      alert('Failed to generate script. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleDeleteScript = async (id) => {
    if (!confirm('Are you sure you want to delete this script?')) return;

    try {
      await videoScripts.delete(id);
      await loadMyScripts();
      if (currentScript?.id === id) {
        setCurrentScript(null);
        setMode('create');
        navigate('/video/script-generator');
      }
    } catch (error) {
      console.error('Failed to delete script:', error);
      alert('Failed to delete script');
    }
  };

  const handleUpdateScript = async () => {
    if (!currentScript) return;

    try {
      const updated = await videoScripts.update(currentScript.id, {
        title: formData.title,
        script: currentScript.script,
      });
      setCurrentScript(updated);
      await loadMyScripts();
      alert('Script updated successfully');
    } catch (error) {
      console.error('Failed to update script:', error);
      alert('Failed to update script');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">📝 AI Video Script Generator</h1>
          <p className="text-purple-200">Generate professional video scripts with AI</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar - My Scripts */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 sticky top-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">My Scripts</h2>
                <button
                  onClick={() => {
                    setMode('create');
                    setCurrentScript(null);
                    navigate('/video/script-generator');
                    setFormData({
                      title: '',
                      topic: '',
                      duration: 5,
                      tone: 'professional',
                      keyPoints: '',
                      callToAction: '',
                      targetAudience: '',
                    });
                  }}
                  className="text-purple-300 hover:text-white"
                >
                  + New
                </button>
              </div>

              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {myScripts.length === 0 ? (
                  <p className="text-purple-300 text-sm text-center py-4">No scripts yet</p>
                ) : (
                  myScripts.map(script => (
                    <div
                      key={script.id}
                      onClick={() => navigate(`/video/script-generator?id=${script.id}`)}
                      className={`p-3 rounded-lg cursor-pointer transition-all ${
                        currentScript?.id === script.id
                          ? 'bg-purple-500/30 border border-purple-400'
                          : 'bg-white/5 hover:bg-white/10 border border-white/10'
                      }`}
                    >
                      <h3 className="text-white font-semibold text-sm mb-1">{script.title}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-purple-300 text-xs">{script.tone}</span>
                        <span className="text-purple-400 text-xs">{script.duration} min</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {mode === 'create' ? (
              <div className="space-y-6">
                {/* Template Selection */}
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                  <h2 className="text-xl font-bold text-white mb-4">Choose a Template</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {TEMPLATES.map(template => (
                      <button
                        key={template.id}
                        onClick={() => setSelectedTemplate(template.id)}
                        className={`p-4 rounded-lg transition-all ${
                          selectedTemplate === template.id
                            ? 'bg-gradient-to-br from-purple-500 to-pink-500 border-2 border-purple-300'
                            : 'bg-white/5 border border-white/10 hover:bg-white/10'
                        }`}
                      >
                        <div className="text-3xl mb-2">{template.icon}</div>
                        <h3 className="text-white font-semibold text-sm mb-1">{template.name}</h3>
                        <p className="text-purple-300 text-xs">{template.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Script Details Form */}
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                  <h2 className="text-xl font-bold text-white mb-4">Script Details</h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-purple-200 text-sm font-medium mb-2">
                        Video Title *
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="e.g., How to Build a Website in 10 Minutes"
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-purple-200 text-sm font-medium mb-2">
                        Main Topic *
                      </label>
                      <input
                        type="text"
                        name="topic"
                        value={formData.topic}
                        onChange={handleInputChange}
                        placeholder="e.g., Website building, drag and drop builders"
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-purple-200 text-sm font-medium mb-2">
                          Duration (minutes)
                        </label>
                        <input
                          type="number"
                          name="duration"
                          value={formData.duration}
                          onChange={handleInputChange}
                          min="1"
                          max="30"
                          className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>

                      <div>
                        <label className="block text-purple-200 text-sm font-medium mb-2">
                          Tone
                        </label>
                        <select
                          name="tone"
                          value={formData.tone}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          {TONES.map(tone => (
                            <option key={tone} value={tone} className="bg-gray-800">
                              {tone.charAt(0).toUpperCase() + tone.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-purple-200 text-sm font-medium mb-2">
                        Key Points (one per line)
                      </label>
                      <textarea
                        name="keyPoints"
                        value={formData.keyPoints}
                        onChange={handleInputChange}
                        rows="4"
                        placeholder="Enter main points to cover in your video..."
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-purple-200 text-sm font-medium mb-2">
                        Call to Action
                      </label>
                      <input
                        type="text"
                        name="callToAction"
                        value={formData.callToAction}
                        onChange={handleInputChange}
                        placeholder="e.g., Subscribe for more tutorials"
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-purple-200 text-sm font-medium mb-2">
                        Target Audience
                      </label>
                      <input
                        type="text"
                        name="targetAudience"
                        value={formData.targetAudience}
                        onChange={handleInputChange}
                        placeholder="e.g., Beginners, Small business owners"
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <button
                      onClick={handleGenerateScript}
                      disabled={generating || !formData.title || !formData.topic}
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {generating ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="animate-spin">⚙️</span>
                          Generating Script with AI...
                        </span>
                      ) : (
                        '✨ Generate Script with AI'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Script View */}
                {currentScript && (
                  <>
                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            className="w-full text-2xl font-bold text-white bg-transparent border-b border-white/20 pb-2 focus:outline-none focus:border-purple-400"
                          />
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-purple-300 text-sm">
                              📝 {currentScript.tone}
                            </span>
                            <span className="text-purple-300 text-sm">
                              ⏱️ {currentScript.duration} min
                            </span>
                            <span className="text-purple-400 text-sm">
                              {new Date(currentScript.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={handleUpdateScript}
                            className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-all"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => handleDeleteScript(currentScript.id)}
                            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all"
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                      {/* Hooks Section */}
                      {currentScript.hooks && currentScript.hooks.length > 0 && (
                        <div className="mb-6">
                          <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                            🎣 Opening Hooks
                            <button
                              onClick={() => copyToClipboard(currentScript.hooks.join('\n\n'))}
                              className="text-xs text-purple-300 hover:text-white"
                            >
                              Copy All
                            </button>
                          </h3>
                          <div className="space-y-2">
                            {currentScript.hooks.map((hook, idx) => (
                              <div key={idx} className="bg-white/5 p-3 rounded-lg border border-white/10">
                                <p className="text-purple-100">{hook}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Full Script */}
                      <div className="mb-6">
                        <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                          📜 Full Script
                          <button
                            onClick={() => copyToClipboard(currentScript.script)}
                            className="text-xs text-purple-300 hover:text-white"
                          >
                            Copy Script
                          </button>
                        </h3>
                        <div className="bg-white/5 p-4 rounded-lg border border-white/10 max-h-[500px] overflow-y-auto">
                          <pre className="text-purple-100 whitespace-pre-wrap font-sans">{currentScript.script}</pre>
                        </div>
                      </div>

                      {/* Sections with Timestamps */}
                      {currentScript.sections && currentScript.sections.length > 0 && (
                        <div className="mb-6">
                          <h3 className="text-white font-semibold mb-2">⏰ Sections</h3>
                          <div className="space-y-2">
                            {currentScript.sections.map((section, idx) => (
                              <div key={idx} className="bg-white/5 p-3 rounded-lg border border-white/10">
                                <div className="flex items-start gap-3">
                                  <span className="text-purple-400 font-mono text-sm">{section.timestamp}</span>
                                  <div className="flex-1">
                                    <h4 className="text-white font-semibold text-sm mb-1">{section.title}</h4>
                                    <p className="text-purple-200 text-sm">{section.content}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* CTAs */}
                      {currentScript.ctas && currentScript.ctas.length > 0 && (
                        <div>
                          <h3 className="text-white font-semibold mb-2">📢 Calls to Action</h3>
                          <div className="space-y-2">
                            {currentScript.ctas.map((cta, idx) => (
                              <div key={idx} className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-3 rounded-lg border border-purple-400/30">
                                <p className="text-white">{cta}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
