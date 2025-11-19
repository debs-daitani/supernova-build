import { useState } from 'react';
import { aiContentGenerator } from '../../services/api';

const FORMATS = [
  { id: 'social', label: 'Instagram/Facebook Posts', desc: '5 posts with different angles', icon: '📱' },
  { id: 'twitter', label: 'Twitter Threads', desc: '3 threads (10-15 tweets each)', icon: '🐦' },
  { id: 'email', label: 'Email Newsletter', desc: 'Subject + body summary', icon: '📧' },
  { id: 'quotes', label: 'Quote Graphics', desc: '10 shareable quotes', icon: '💬' },
  { id: 'linkedin', label: 'LinkedIn Article', desc: 'Professional intro', icon: '💼' },
  { id: 'youtube', label: 'YouTube Description', desc: 'SEO-optimized with timestamps', icon: '🎥' },
];

export default function ContentRepurpose() {
  const [content, setContent] = useState('');
  const [selectedFormats, setSelectedFormats] = useState(['social', 'twitter', 'email']);
  const [repurposing, setRepurposing] = useState(false);
  const [result, setResult] = useState(null);

  const toggleFormat = (formatId) => {
    setSelectedFormats(prev =>
      prev.includes(formatId)
        ? prev.filter(id => id !== formatId)
        : [...prev, formatId]
    );
  };

  const handleRepurpose = async () => {
    if (!content.trim()) {
      alert('Please enter some content to repurpose');
      return;
    }

    if (selectedFormats.length === 0) {
      alert('Please select at least one format');
      return;
    }

    try {
      setRepurposing(true);
      const response = await aiContentGenerator.repurpose({
        content,
        repurposeInto: selectedFormats,
      });

      setResult(response);
    } catch (error) {
      console.error('Repurposing error:', error);
      alert('Failed to repurpose content. Please try again.');
    } finally {
      setRepurposing(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">🔄 Content Repurposing Tool</h1>
          <p className="text-indigo-200">Transform one piece of content into multiple formats</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input */}
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Original Content</h2>
                <span className="text-indigo-300 text-sm">
                  {content.split(/\s+/).filter(w => w).length} words
                </span>
              </div>

              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows="15"
                placeholder="Paste your blog post, article, or long-form content here..."
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-sans"
              />
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h2 className="text-xl font-bold text-white mb-4">Select Formats to Create</h2>

              <div className="space-y-3">
                {FORMATS.map(format => (
                  <label
                    key={format.id}
                    className={`flex items-start gap-3 p-4 rounded-lg cursor-pointer transition-all ${
                      selectedFormats.includes(format.id)
                        ? 'bg-indigo-500/20 border-2 border-indigo-400'
                        : 'bg-white/5 border border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedFormats.includes(format.id)}
                      onChange={() => toggleFormat(format.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl">{format.icon}</span>
                        <span className="text-white font-semibold">{format.label}</span>
                      </div>
                      <p className="text-indigo-300 text-sm">{format.desc}</p>
                    </div>
                  </label>
                ))}
              </div>

              <button
                onClick={handleRepurpose}
                disabled={repurposing || !content.trim() || selectedFormats.length === 0}
                className="w-full mt-6 bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-3 rounded-lg font-semibold hover:from-indigo-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {repurposing ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin">⚙️</span>
                    Repurposing Content...
                  </span>
                ) : (
                  `🔄 Repurpose into ${selectedFormats.length} Format${selectedFormats.length > 1 ? 's' : ''}`
                )}
              </button>
            </div>
          </div>

          {/* Results */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Repurposed Content</h2>
              {result && (
                <button
                  onClick={() => copyToClipboard(result.repurposed)}
                  className="px-3 py-1 bg-indigo-500 hover:bg-indigo-600 text-white text-sm rounded transition-all"
                >
                  Copy All
                </button>
              )}
            </div>

            {!result ? (
              <div className="text-center py-32">
                <p className="text-6xl mb-4">🔄</p>
                <p className="text-indigo-300 mb-2">Your repurposed content will appear here</p>
                <p className="text-indigo-400 text-sm">
                  Select formats and click repurpose to get started
                </p>
              </div>
            ) : (
              <div className="space-y-6 max-h-[800px] overflow-y-auto">
                <div className="bg-indigo-500/20 p-4 rounded-lg border border-indigo-400/30">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">🎉</span>
                    <span className="text-white font-semibold">
                      Successfully created {selectedFormats.length} format{selectedFormats.length > 1 ? 's' : ''}!
                    </span>
                  </div>
                  <p className="text-indigo-200 text-sm">
                    Scroll down to see all your repurposed content
                  </p>
                </div>

                <div className="bg-white/5 p-6 rounded-lg border border-white/10">
                  <pre className="text-white whitespace-pre-wrap font-sans text-sm leading-relaxed">
                    {result.repurposed}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
