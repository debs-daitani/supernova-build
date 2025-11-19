import { useState } from 'react';
import { aiContentGenerator } from '../../services/api';

const ACTIONS = [
  { value: 'improve', label: '✨ Improve', desc: 'Make it better overall' },
  { value: 'shorten', label: '📉 Shorten', desc: 'Condense to 50% length' },
  { value: 'expand', label: '📈 Expand', desc: 'Add more detail' },
  { value: 'change_tone', label: '🎭 Change Tone', desc: 'Adjust the voice' },
  { value: 'fix_grammar', label: '✅ Fix Grammar', desc: 'Fix errors only' },
  { value: 'simplify', label: '📚 Simplify', desc: 'Make easier to read' },
  { value: 'add_emotion', label: '❤️ Add Emotion', desc: 'More engaging' },
  { value: 'seo_optimize', label: '🔍 SEO Optimize', desc: 'Add keywords' },
];

const TONES = ['professional', 'casual', 'friendly', 'authoritative', 'enthusiastic', 'humorous'];

export default function WritingAssistant() {
  const [content, setContent] = useState('');
  const [action, setAction] = useState('improve');
  const [targetTone, setTargetTone] = useState('professional');
  const [keywords, setKeywords] = useState('');
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);

  const handleImprove = async () => {
    if (!content.trim()) {
      alert('Please enter some content to improve');
      return;
    }

    try {
      setProcessing(true);
      const keywordsArray = keywords.split(',').map(k => k.trim()).filter(k => k);

      const response = await aiContentGenerator.improve({
        content,
        action,
        targetTone: action === 'change_tone' ? targetTone : undefined,
        keywords: action === 'seo_optimize' ? keywordsArray : undefined,
      });

      setResult(response);
    } catch (error) {
      console.error('Improvement error:', error);
      alert('Failed to improve content. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const useImproved = () => {
    setContent(result.improved);
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">✨ AI Writing Assistant</h1>
          <p className="text-indigo-200">Improve, optimize, and transform your existing content with AI</p>
        </div>

        {/* Action Selection */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">Choose Action</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {ACTIONS.map(({ value, label, desc }) => (
              <button
                key={value}
                onClick={() => setAction(value)}
                className={`p-4 rounded-lg transition-all ${
                  action === value
                    ? 'bg-gradient-to-br from-indigo-500 to-purple-500 border-2 border-indigo-300'
                    : 'bg-white/5 border border-white/10 hover:bg-white/10'
                }`}
              >
                <div className="text-2xl mb-1">{label.split(' ')[0]}</div>
                <h3 className="text-white font-semibold text-sm mb-1">{label.split(' ').slice(1).join(' ')}</h3>
                <p className="text-indigo-300 text-xs">{desc}</p>
              </button>
            ))}
          </div>

          {/* Additional Options */}
          {action === 'change_tone' && (
            <div className="mt-4">
              <label className="block text-indigo-200 text-sm font-medium mb-2">Target Tone</label>
              <select
                value={targetTone}
                onChange={(e) => setTargetTone(e.target.value)}
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {TONES.map(tone => (
                  <option key={tone} value={tone} className="bg-gray-800">
                    {tone.charAt(0).toUpperCase() + tone.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          )}

          {action === 'seo_optimize' && (
            <div className="mt-4">
              <label className="block text-indigo-200 text-sm font-medium mb-2">Keywords (comma-separated)</label>
              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="keyword1, keyword2, keyword3"
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Original Content */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Original Content</h2>
              <span className="text-indigo-300 text-sm">{content.length} characters</span>
            </div>

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows="20"
              placeholder="Paste your content here..."
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-sans"
            />

            <button
              onClick={handleImprove}
              disabled={processing || !content.trim()}
              className="w-full mt-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-3 rounded-lg font-semibold hover:from-indigo-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⚙️</span>
                  Processing...
                </span>
              ) : (
                `✨ ${ACTIONS.find(a => a.value === action)?.label}`
              )}
            </button>
          </div>

          {/* Improved Content */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Improved Content</h2>
              {result && (
                <div className="flex gap-2">
                  <button
                    onClick={() => copyToClipboard(result.improved)}
                    className="px-3 py-1 bg-indigo-500 hover:bg-indigo-600 text-white text-sm rounded transition-all"
                  >
                    Copy
                  </button>
                  <button
                    onClick={useImproved}
                    className="px-3 py-1 bg-purple-500 hover:bg-purple-600 text-white text-sm rounded transition-all"
                  >
                    Use This
                  </button>
                </div>
              )}
            </div>

            {!result ? (
              <div className="text-center py-32">
                <p className="text-6xl mb-4">🤖</p>
                <p className="text-indigo-300">Your improved content will appear here</p>
              </div>
            ) : (
              <div>
                <div className="mb-4 flex items-center gap-4">
                  <span className="px-3 py-1 bg-indigo-500/20 text-indigo-200 rounded text-sm">
                    {result.improved.length} characters
                  </span>
                  {action === 'shorten' && (
                    <span className="px-3 py-1 bg-green-500/20 text-green-200 rounded text-sm">
                      {Math.round(((content.length - result.improved.length) / content.length) * 100)}% shorter
                    </span>
                  )}
                  {action === 'expand' && (
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-200 rounded text-sm">
                      {Math.round(((result.improved.length - content.length) / content.length) * 100)}% longer
                    </span>
                  )}
                </div>

                <div className="bg-white/5 p-4 rounded-lg border border-white/10 max-h-[600px] overflow-y-auto">
                  <pre className="text-white whitespace-pre-wrap font-sans leading-relaxed">{result.improved}</pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
