/**
 * Export Guide
 * Step-by-step instructions for exporting data from various platforms
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const PLATFORM_INFO = {
  wix: { name: 'Wix', icon: '🌐', color: 'blue' },
  shopify: { name: 'Shopify', icon: '🛍️', color: 'green' },
  wordpress: { name: 'WordPress', icon: '📝', color: 'blue' },
  squarespace: { name: 'Squarespace', icon: '⬛', color: 'gray' },
  kajabi: { name: 'Kajabi', icon: '🎓', color: 'purple' },
  teachable: { name: 'Teachable', icon: '📚', color: 'orange' },
  mailchimp: { name: 'Mailchimp', icon: '✉️', color: 'yellow' },
  convertkit: { name: 'ConvertKit', icon: '📧', color: 'pink' },
  webflow: { name: 'Webflow', icon: '🌊', color: 'blue' },
  ghost: { name: 'Ghost', icon: '👻', color: 'gray' },
  medium: { name: 'Medium', icon: 'Ⓜ️', color: 'green' },
  substack: { name: 'Substack', icon: '📰', color: 'orange' },
  carrd: { name: 'Carrd', icon: '🃏', color: 'purple' }
};

export default function ExportGuide() {
  const { platform } = useParams();
  const navigate = useNavigate();
  const [guide, setGuide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [helpful, setHelpful] = useState(null);

  useEffect(() => {
    loadGuide();
  }, [platform]);

  const loadGuide = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/platform-migration/guides/${platform}`);

      if (response.ok) {
        const data = await response.json();
        setGuide(data.guide);
        setError(null);
      } else {
        setError('Guide not found for this platform');
      }
    } catch (error) {
      console.error('Error loading guide:', error);
      setError('Failed to load export guide');
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = async (isHelpful) => {
    setHelpful(isHelpful);
    // In a real app, you'd send this feedback to the server
    try {
      await fetch(`/api/platform-migration/guides/${platform}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ helpful: isHelpful })
      });
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="text-center py-12">
          <div className="animate-pulse text-xl">Loading guide...</div>
        </div>
      </div>
    );
  }

  if (error || !guide) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
          {error || 'Export guide not available'}
        </div>
        <button
          onClick={() => navigate('/migration/new')}
          className="mt-6 text-orange-600 hover:underline"
        >
          ← Back to Migration
        </button>
      </div>
    );
  }

  const platformInfo = PLATFORM_INFO[platform] || { name: platform, icon: '📦', color: 'gray' };

  return (
    <div className="max-w-4xl mx-auto p-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/migration/new')}
          className="text-orange-600 hover:underline mb-4"
        >
          ← Back to Migration
        </button>

        <div className="flex items-center gap-4 mb-4">
          <div className="text-6xl">{platformInfo.icon}</div>
          <div>
            <h1 className="text-3xl font-bold">{guide.title}</h1>
            <p className="text-gray-600">{guide.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>👁️ {guide.views} views</span>
          <span>•</span>
          <span>📅 Last updated: {new Date(guide.updatedAt).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Video Tutorial */}
      {guide.videoUrl && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">📹 Video Tutorial</h2>
          <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
            <iframe
              src={guide.videoUrl}
              className="w-full h-full"
              allowFullScreen
              title="Export Tutorial"
            />
          </div>
        </div>
      )}

      {/* Steps */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">📋 Step-by-Step Instructions</h2>
        <div className="space-y-6">
          {guide.steps.map((step, index) => (
            <div key={index} className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-full flex items-center justify-center font-bold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                  <p className="text-gray-700 mb-3 whitespace-pre-line">{step.description}</p>

                  {step.screenshot && (
                    <div className="mb-3">
                      <img
                        src={step.screenshot}
                        alt={`Step ${index + 1}`}
                        className="rounded-lg border shadow-sm max-w-full"
                      />
                    </div>
                  )}

                  {step.notes && step.notes.length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-3">
                      <div className="font-medium text-sm mb-2">💡 Notes:</div>
                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                        {step.notes.map((note, noteIndex) => (
                          <li key={noteIndex}>{note}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {step.code && (
                    <div className="mt-3">
                      <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                        <code className="text-sm font-mono">{step.code}</code>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tips */}
      {guide.tips && guide.tips.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">💡 Helpful Tips</h2>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <ul className="space-y-2">
              {guide.tips.map((tip, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-yellow-600 flex-shrink-0">•</span>
                  <span className="text-gray-700">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Common Issues */}
      {guide.commonIssues && guide.commonIssues.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">⚠️ Common Issues & Solutions</h2>
          <div className="space-y-4">
            {guide.commonIssues.map((issue, index) => (
              <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h3 className="font-bold text-red-900 mb-2">{issue.problem}</h3>
                <p className="text-gray-700">{issue.solution}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Official Documentation */}
      {guide.officialDocsUrl && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">📚 Official Documentation</h2>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <p className="text-gray-700 mb-4">
              For more detailed information, refer to {platformInfo.name}'s official documentation:
            </p>
            <a
              href={guide.officialDocsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-gradient-to-r from-orange-500 to-pink-500 text-white px-6 py-3 rounded-lg font-bold hover:shadow-lg"
            >
              View Official Docs →
            </a>
          </div>
        </div>
      )}

      {/* Feedback */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="font-bold mb-4">Was this guide helpful?</h3>
        {helpful === null ? (
          <div className="flex gap-4">
            <button
              onClick={() => handleFeedback(true)}
              className="flex-1 border-2 border-green-500 text-green-700 py-3 rounded-lg font-bold hover:bg-green-50"
            >
              👍 Yes, helpful
            </button>
            <button
              onClick={() => handleFeedback(false)}
              className="flex-1 border-2 border-red-500 text-red-700 py-3 rounded-lg font-bold hover:bg-red-50"
            >
              👎 Needs improvement
            </button>
          </div>
        ) : (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            Thank you for your feedback!
          </div>
        )}

        <div className="mt-4 text-center">
          <button
            onClick={() => navigate('/migration/new')}
            className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-6 py-3 rounded-lg font-bold hover:shadow-lg"
          >
            Start Migration →
          </button>
        </div>
      </div>
    </div>
  );
}
