import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { pdfDocuments, pdfTemplates } from '../../services/api';

export default function PDFDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState([]);
  const [showTemplates, setShowTemplates] = useState(false);

  const tools = [
    { name: 'Edit PDF', icon: '✏️', description: 'Modify text and images', action: 'edit' },
    { name: 'Fill & Sign', icon: '✍️', description: 'Fill forms and add signatures', action: 'fill' },
    { name: 'Merge PDFs', icon: '📑', description: 'Combine multiple PDFs', action: 'merge' },
    { name: 'Split PDF', icon: '✂️', description: 'Extract pages', action: 'split' },
    { name: 'Compress', icon: '🗜️', description: 'Reduce file size', action: 'compress' },
    { name: 'Convert', icon: '🔄', description: 'To/from PDF', action: 'convert' },
    { name: 'Protect', icon: '🔒', description: 'Add password & permissions', action: 'protect' },
    { name: 'OCR', icon: '🔍', description: 'Extract text from scans', action: 'ocr' },
    { name: 'Watermark', icon: '💧', description: 'Add watermarks', action: 'watermark' },
    { name: 'Annotate', icon: '💬', description: 'Comments & highlights', action: 'annotate' },
  ];

  const templates = [
    { id: '1', name: 'Invoice', category: 'invoice', icon: '🧾', description: 'Professional invoice template' },
    { id: '2', name: 'Contract', category: 'contract', icon: '📜', description: 'Legal contract template' },
    { id: '3', name: 'Certificate', category: 'certificate', icon: '🏆', description: 'Certificate of completion' },
    { id: '4', name: 'Resume', category: 'form', icon: '📄', description: 'Professional resume' },
    { id: '5', name: 'NDA', category: 'contract', icon: '🤝', description: 'Non-disclosure agreement' },
    { id: '6', name: 'Receipt', category: 'invoice', icon: '🧾', description: 'Payment receipt' },
  ];

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const data = await pdfDocuments.list();
      setDocuments(data);
    } catch (error) {
      console.error('Failed to load documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = () => {
    // TODO: Implement file upload
    alert('PDF upload coming soon! This will allow uploading PDFs for editing.');
  };

  const handleCreateFromTemplate = (templateId) => {
    // TODO: Navigate to template editor
    alert('Template-based PDF creation coming soon!');
    setShowTemplates(false);
  };

  const handleToolClick = (action) => {
    // TODO: Navigate to appropriate tool
    const messages = {
      edit: 'PDF editing canvas coming soon! Edit text, add images, rearrange pages.',
      fill: 'Form filling & signing coming soon! Auto-detect fields, draw/type signatures.',
      merge: 'PDF merging tool coming soon! Drag and drop PDFs to combine.',
      split: 'PDF splitting tool coming soon! Extract specific pages or ranges.',
      compress: 'PDF compression coming soon! Reduce file size while maintaining quality.',
      convert: 'PDF conversion coming soon! Convert to/from Word, Excel, Images.',
      protect: 'PDF protection coming soon! Add passwords, set permissions, watermarks.',
      ocr: 'OCR text extraction coming soon! Make scanned PDFs searchable.',
      watermark: 'Watermark tool coming soon! Add text or image watermarks.',
      annotate: 'Annotation tools coming soon! Add comments, highlights, drawings.',
    };
    alert(messages[action]);
  };

  const handleOpenDocument = (docId) => {
    // TODO: Navigate to PDF viewer/editor
    alert('PDF viewer coming soon!');
  };

  const handleDeleteDocument = async (e, docId) => {
    e.stopPropagation();

    if (!confirm('Are you sure you want to delete this PDF?')) return;

    try {
      await pdfDocuments.delete(docId);
      loadDocuments();
    } catch (error) {
      console.error('Failed to delete document:', error);
      alert('Failed to delete document.');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-orange-900 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <div className="text-6xl mb-4 animate-pulse">📄</div>
            <p className="text-red-300">Loading your PDFs...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-orange-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">📄 PDF Editor</h1>
              <p className="text-red-200">Edit, sign, merge, and convert PDFs</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowTemplates(true)}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-lg"
              >
                📋 Templates
              </button>
              <button
                onClick={handleUpload}
                className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-red-600 hover:to-orange-600 transition-all shadow-lg"
              >
                + Upload PDF
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">🛠️ Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {tools.map((tool) => (
              <button
                key={tool.action}
                onClick={() => handleToolClick(tool.action)}
                className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 hover:border-red-400/50 transition-all text-center group"
              >
                <div className="text-3xl mb-2">{tool.icon}</div>
                <h3 className="text-white font-semibold mb-1 group-hover:text-red-300 transition-colors">
                  {tool.name}
                </h3>
                <p className="text-red-200 text-xs">{tool.description}</p>
              </button>
            ))}
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
                    key={template.id}
                    onClick={() => handleCreateFromTemplate(template.id)}
                    className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:border-red-400/50 transition-all text-left group"
                  >
                    <div className="text-4xl mb-3">{template.icon}</div>
                    <h3 className="text-white text-lg font-bold mb-1 group-hover:text-red-300 transition-colors">
                      {template.name}
                    </h3>
                    <p className="text-red-300 text-sm mb-2">{template.description}</p>
                    <span className="text-red-400 text-xs capitalize">{template.category}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Recent PDFs */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4">📚 Recent PDFs</h2>

          {documents.length === 0 ? (
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-12 border border-white/20 text-center">
              <p className="text-6xl mb-4">📄</p>
              <h3 className="text-white text-2xl font-bold mb-2">No PDFs yet</h3>
              <p className="text-red-300 mb-6">
                Upload a PDF or create one from a template to get started!
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleUpload}
                  className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-semibold transition-all"
                >
                  Upload PDF
                </button>
                <button
                  onClick={() => setShowTemplates(true)}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-all"
                >
                  Use Template
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => handleOpenDocument(doc.id)}
                  className="bg-white/10 backdrop-blur-lg rounded-xl overflow-hidden border border-white/20 hover:border-red-400/50 transition-all cursor-pointer group"
                >
                  {/* Thumbnail */}
                  <div className="aspect-[3/4] bg-gradient-to-br from-red-900/50 to-orange-900/50 flex items-center justify-center">
                    {doc.thumbnail ? (
                      <img
                        src={doc.thumbnail}
                        alt={doc.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-6xl opacity-50">📄</div>
                    )}
                  </div>

                  {/* Document Info */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-white font-bold text-lg truncate flex-1 group-hover:text-red-300 transition-colors">
                        {doc.name}
                      </h3>
                      <button
                        onClick={(e) => handleDeleteDocument(e, doc.id)}
                        className="text-red-300 hover:text-red-200 text-sm ml-2"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>

                    <div className="flex items-center gap-2 text-red-300 text-sm mb-2">
                      <span>{doc.pageCount} {doc.pageCount === 1 ? 'page' : 'pages'}</span>
                      <span>•</span>
                      <span>{formatFileSize(doc.fileSize)}</span>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      {doc.isEdited && (
                        <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded border border-blue-400/30">
                          Edited
                        </span>
                      )}
                      {doc.isProtected && (
                        <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded border border-green-400/30">
                          🔒 Protected
                        </span>
                      )}
                    </div>

                    <div className="mt-2 text-red-400 text-xs">
                      {new Date(doc.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Coming Soon Features */}
        <div className="mt-12 bg-red-500/10 backdrop-blur-lg rounded-xl p-6 border border-red-400/20">
          <h3 className="text-white font-bold mb-3">📄 Coming Soon</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-red-200 text-sm">
            <div className="flex items-start gap-2">
              <span>✓</span>
              <span>PDF.js viewer with zoom & navigation</span>
            </div>
            <div className="flex items-start gap-2">
              <span>✓</span>
              <span>Edit text and images with pdf-lib</span>
            </div>
            <div className="flex items-start gap-2">
              <span>✓</span>
              <span>Auto-detect and fill form fields</span>
            </div>
            <div className="flex items-start gap-2">
              <span>✓</span>
              <span>Electronic signatures (draw/type/upload)</span>
            </div>
            <div className="flex items-start gap-2">
              <span>✓</span>
              <span>Annotations (comments, highlights, drawings)</span>
            </div>
            <div className="flex items-start gap-2">
              <span>✓</span>
              <span>Merge & split PDFs</span>
            </div>
            <div className="flex items-start gap-2">
              <span>✓</span>
              <span>Compress PDFs (Ghostscript)</span>
            </div>
            <div className="flex items-start gap-2">
              <span>✓</span>
              <span>Convert to/from Word, Excel, Images</span>
            </div>
            <div className="flex items-start gap-2">
              <span>✓</span>
              <span>Password protection & permissions</span>
            </div>
            <div className="flex items-start gap-2">
              <span>✓</span>
              <span>Watermarks (text/image)</span>
            </div>
            <div className="flex items-start gap-2">
              <span>✓</span>
              <span>OCR with Tesseract.js</span>
            </div>
            <div className="flex items-start gap-2">
              <span>✓</span>
              <span>PDF templates (contracts, invoices, forms)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
