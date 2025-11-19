import { useState } from 'react';
import { aiContentGenerator } from '../../services/api';

const TONES = ['professional', 'casual', 'friendly', 'authoritative', 'inspirational', 'humorous'];
const LENGTHS = [
  { value: 'short', label: 'Short (500 words)', words: 500 },
  { value: 'medium', label: 'Medium (1000 words)', words: 1000 },
  { value: 'long', label: 'Long (1500-2000 words)', words: 1500 },
];

export default function BlogGenerator() {
  const [generating, setGenerating] = useState(false);
  const [formData, setFormData] = useState({
    topic: '',
    keywords: '',
    targetAudience: '',
    tone: 'professional',
    length: 'medium',
    outline: '',
    includeIntro: true,
    includeStats: false,
    includeExamples: true,
    includeTips: true,
    includeFAQ: false,
    includeConclusion: true,
  });
  const [result, setResult] = useState(null);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleGenerate = async () => {
    if (!formData.topic.trim()) {
      alert('Please enter a blog topic');
      return;
    }

    try {
      setGenerating(true);
      const keywordsArray = formData.keywords
        .split(',')
        .map(k => k.trim())
        .filter(k => k);

      const outlineArray = formData.outline
        .split('\n')
        .map(p => p.trim())
        .filter(p => p);

      const response = await aiContentGenerator.generateBlog({
        ...formData,
        keywords: keywordsArray,
        outline: outlineArray,
      });

      setResult(response);
    } catch (error) {
      console.error('Blog generation error:', error);
      alert('Failed to generate blog post. Please try again.');
    } finally {
      setGenerating(false);
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
          <h1 className="text-4xl font-bold text-white mb-2">📝 AI Blog Post Generator</h1>
          <p className="text-indigo-200">Generate SEO-optimized blog posts in seconds</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Form */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h2 className="text-xl font-bold text-white mb-4">Blog Details</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-indigo-200 text-sm font-medium mb-2">
                  Blog Topic *
                </label>
                <input
                  type="text"
                  name="topic"
                  value={formData.topic}
                  onChange={handleInputChange}
                  placeholder="e.g., How to Start a Successful Online Business"
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-indigo-200 text-sm font-medium mb-2">Tone</label>
                  <select
                    name="tone"
                    value={formData.tone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {TONES.map(tone => (
                      <option key={tone} value={tone} className="bg-gray-800">
                        {tone.charAt(0).toUpperCase() + tone.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-indigo-200 text-sm font-medium mb-2">Length</label>
                  <select
                    name="length"
                    value={formData.length}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {LENGTHS.map(({ value, label }) => (
                      <option key={value} value={value} className="bg-gray-800">
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-indigo-200 text-sm font-medium mb-2">
                  SEO Keywords (comma-separated)
                </label>
                <input
                  type="text"
                  name="keywords"
                  value={formData.keywords}
                  onChange={handleInputChange}
                  placeholder="online business, entrepreneurship, startups"
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-indigo-200 text-sm font-medium mb-2">
                  Target Audience
                </label>
                <input
                  type="text"
                  name="targetAudience"
                  value={formData.targetAudience}
                  onChange={handleInputChange}
                  placeholder="e.g., aspiring entrepreneurs, small business owners"
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-indigo-200 text-sm font-medium mb-2">
                  Outline (optional, one point per line)
                </label>
                <textarea
                  name="outline"
                  value={formData.outline}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Enter specific points to cover..."
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-indigo-200 text-sm font-medium mb-2">
                  Include
                </label>
                <div className="space-y-2">
                  {[
                    { name: 'includeIntro', label: 'Introduction' },
                    { name: 'includeStats', label: 'Statistics/Data' },
                    { name: 'includeExamples', label: 'Examples' },
                    { name: 'includeTips', label: 'Actionable Tips' },
                    { name: 'includeFAQ', label: 'FAQ Section' },
                    { name: 'includeConclusion', label: 'Conclusion with CTA' },
                  ].map(({ name, label }) => (
                    <label key={name} className="flex items-center text-indigo-200">
                      <input
                        type="checkbox"
                        name={name}
                        checked={formData[name]}
                        onChange={handleInputChange}
                        className="mr-2 rounded"
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={generating}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-3 rounded-lg font-semibold hover:from-indigo-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generating ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin">⚙️</span>
                    Generating Blog Post...
                  </span>
                ) : (
                  '✨ Generate Blog Post with AI'
                )}
              </button>
            </div>
          </div>

          {/* Result */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h2 className="text-xl font-bold text-white mb-4">Generated Blog Post</h2>

            {!result ? (
              <div className="text-center py-12">
                <p className="text-6xl mb-4">📝</p>
                <p className="text-indigo-300">
                  Fill in the form and click generate to create your blog post
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* SEO Title */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-indigo-200 font-semibold">SEO Title</h3>
                    <button
                      onClick={() => copyToClipboard(result.title)}
                      className="text-xs text-indigo-300 hover:text-white"
                    >
                      Copy
                    </button>
                  </div>
                  <p className="text-white font-bold text-lg">{result.title}</p>
                </div>

                {/* Meta Description */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-indigo-200 font-semibold">Meta Description</h3>
                    <button
                      onClick={() => copyToClipboard(result.metaDescription)}
                      className="text-xs text-indigo-300 hover:text-white"
                    >
                      Copy
                    </button>
                  </div>
                  <p className="text-indigo-100 text-sm">{result.metaDescription}</p>
                </div>

                {/* Word Count */}
                <div className="flex items-center gap-4">
                  <span className="px-3 py-1 bg-indigo-500/20 text-indigo-200 rounded text-sm">
                    {result.wordCount} words
                  </span>
                </div>

                {/* Full Content */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-indigo-200 font-semibold">Full Blog Post</h3>
                    <button
                      onClick={() => copyToClipboard(result.content)}
                      className="px-3 py-1 bg-indigo-500 hover:bg-indigo-600 text-white text-sm rounded transition-all"
                    >
                      Copy Full Post
                    </button>
                  </div>
                  <div className="bg-white/5 p-4 rounded-lg border border-white/10 max-h-[600px] overflow-y-auto">
                    <div className="prose prose-invert max-w-none">
                      <pre className="text-indigo-100 whitespace-pre-wrap font-sans text-sm leading-relaxed">
                        {result.content}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
