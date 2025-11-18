import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { legalDocuments } from '../../services/api';

const DOCUMENT_TYPES = [
  { type: 'terms', name: 'Terms & Conditions', icon: '📜', color: 'from-blue-500 to-cyan-500' },
  { type: 'privacy', name: 'Privacy Policy', icon: '🔒', color: 'from-purple-500 to-pink-500' },
  { type: 'contract', name: 'Service Contract', icon: '📝', color: 'from-green-500 to-emerald-500' },
  { type: 'nda', name: 'NDA', icon: '🤐', color: 'from-orange-500 to-red-500' },
  { type: 'disclaimer', name: 'Disclaimer', icon: '⚠️', color: 'from-yellow-500 to-orange-500' },
  { type: 'refund', name: 'Refund Policy', icon: '💸', color: 'from-indigo-500 to-purple-500' },
];

export default function LegalDashboard() {
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const data = await legalDocuments.list();
      setDocuments(data);
    } catch (error) {
      console.error('Failed to load documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDocumentInfo = (type) => {
    return DOCUMENT_TYPES.find(d => d.type === type) || {
      type,
      name: type,
      icon: '📄',
      color: 'from-gray-500 to-gray-600',
    };
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      await legalDocuments.delete(id);
      setDocuments(docs => docs.filter(d => d.id !== id));
    } catch (error) {
      console.error('Failed to delete document:', error);
      alert('Failed to delete document');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <div className="text-6xl mb-4 animate-pulse">⚖️</div>
            <p className="text-blue-300">Loading legal documents...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">⚖️ Legal Templates</h1>
          <p className="text-blue-200">Protect your business with professional legal documents</p>
        </div>

        {/* Document Type Cards */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Generate Documents</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {DOCUMENT_TYPES.map(doc => (
              <Link
                key={doc.type}
                to={`/legal/generate/${doc.type}`}
                className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:border-white/40 transition-all text-center group"
              >
                <div className={`w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-r ${doc.color} flex items-center justify-center text-3xl group-hover:scale-110 transition-transform`}>
                  {doc.icon}
                </div>
                <p className="text-white font-semibold text-sm">{doc.name}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* GDPR Checker */}
        <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-lg rounded-xl p-6 border border-green-400/30 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-500/30 flex items-center justify-center text-2xl">
                ✅
              </div>
              <div>
                <h3 className="text-white font-bold">GDPR Compliance Checker</h3>
                <p className="text-green-200 text-sm">Scan your website for GDPR compliance issues</p>
              </div>
            </div>
            <Link
              to="/legal/gdpr-checker"
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-semibold transition-all"
            >
              Run Check
            </Link>
          </div>
        </div>

        {/* Your Documents */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Your Documents</h2>
            <span className="text-blue-300 text-sm">{documents.length} document{documents.length !== 1 ? 's' : ''}</span>
          </div>

          {documents.length === 0 ? (
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-12 border border-white/20 text-center">
              <p className="text-5xl mb-4">📄</p>
              <h3 className="text-white text-2xl font-bold mb-2">No documents yet</h3>
              <p className="text-blue-300 mb-6">
                Generate your first legal document to protect your business
              </p>
              <Link
                to="/legal/generate/terms"
                className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-all"
              >
                Generate Terms & Conditions
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {documents.map(doc => {
                const info = getDocumentInfo(doc.documentType);
                return (
                  <div
                    key={doc.id}
                    className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:border-white/40 transition-all"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${info.color} flex items-center justify-center text-2xl flex-shrink-0`}>
                        {info.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-bold truncate">{doc.title}</h3>
                        <p className="text-blue-300 text-sm capitalize">{info.name}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {doc.isActive && (
                          <span className="bg-green-500/20 text-green-300 text-xs px-2 py-1 rounded border border-green-400/30">
                            Active
                          </span>
                        )}
                        <span className="text-blue-400 text-xs">
                          v{doc.version}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-4 text-sm text-blue-300">
                      <span>Updated {formatDate(doc.updatedAt)}</span>
                      {doc.publishedAt && (
                        <span>Published {formatDate(doc.publishedAt)}</span>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Link
                        to={`/legal/documents/${doc.id}`}
                        className="flex-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 px-4 py-2 rounded-lg text-center text-sm font-semibold transition-all border border-blue-400/30"
                      >
                        View
                      </Link>
                      <Link
                        to={`/legal/documents/${doc.id}/edit`}
                        className="flex-1 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-200 px-4 py-2 rounded-lg text-center text-sm font-semibold transition-all border border-indigo-400/30"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="bg-red-500/20 hover:bg-red-500/30 text-red-200 px-4 py-2 rounded-lg text-sm font-semibold transition-all border border-red-400/30"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Tips Section */}
        <div className="mt-8 bg-blue-500/10 backdrop-blur-lg rounded-xl p-6 border border-blue-400/20">
          <h3 className="text-white font-bold mb-3">💡 Legal Document Tips</h3>
          <ul className="space-y-2 text-blue-200 text-sm">
            <li>• Review and update your terms and privacy policy annually</li>
            <li>• Always keep previous versions for record-keeping</li>
            <li>• Consult with a legal professional for complex situations</li>
            <li>• Make sure your privacy policy covers all data you collect</li>
            <li>• Include clear refund and cancellation policies to avoid disputes</li>
            <li>• Use NDAs when sharing confidential business information</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
