/**
 * Submit Support Ticket Page
 * Customer form for creating new support tickets
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SubmitTicket() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    category: 'OTHER',
    priority: 'MEDIUM'
  });
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length + files.length > 5) {
      alert('Maximum 5 files allowed');
      return;
    }
    setFiles([...files, ...selectedFiles]);
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const askAI = async () => {
    // TODO: Integrate with SUPERNova AI
    setAiSuggestion({
      answer: 'Based on your question, here are some helpful resources...',
      helpful: false
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('subject', formData.subject);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('priority', formData.priority);

      files.forEach(file => {
        formDataToSend.append('files', file);
      });

      const response = await fetch('/api/support/tickets', {
        method: 'POST',
        body: formDataToSend
      });

      const data = await response.json();

      if (response.ok) {
        alert(`Ticket created! Ticket #${data.ticket.ticketNumber}`);
        navigate('/support/tickets');
      } else {
        alert(data.error || 'Failed to create ticket');
      }
    } catch (error) {
      console.error('Error submitting ticket:', error);
      alert('Failed to submit ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-2">Submit Support Ticket</h1>
      <p className="text-gray-600 mb-8">
        Need help? We're here for you. Describe your issue and we'll respond as soon as possible.
      </p>

      {/* AI Assistant */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6 mb-8">
        <div className="flex items-start gap-4">
          <div className="text-4xl">🤖</div>
          <div className="flex-1">
            <h3 className="font-bold mb-2">Try SUPERNova AI First</h3>
            <p className="text-sm text-gray-600 mb-4">
              Get instant answers from our AI assistant before submitting a ticket
            </p>
            <button
              onClick={askAI}
              className="bg-purple-500 text-white px-6 py-2 rounded-lg hover:bg-purple-600 transition-all"
            >
              Ask SUPERNova AI
            </button>
          </div>
        </div>

        {aiSuggestion && (
          <div className="mt-4 p-4 bg-white rounded-lg">
            <p className="mb-4">{aiSuggestion.answer}</p>
            <div className="flex gap-3">
              <button className="text-green-600 hover:underline text-sm">
                ✓ This helped!
              </button>
              <button className="text-gray-600 hover:underline text-sm">
                Still need help
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Ticket Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8">
        {/* Subject */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Subject <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            required
            placeholder="Brief summary of your issue"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>

        {/* Description */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows="8"
            placeholder="Please provide as much detail as possible..."
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
          <p className="text-sm text-gray-500 mt-1">
            Include steps to reproduce, error messages, and what you expected to happen
          </p>
        </div>

        {/* Category & Priority */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
            >
              <option value="BUG">Bug Report</option>
              <option value="FEATURE_REQUEST">Feature Request</option>
              <option value="QUESTION">Question</option>
              <option value="BILLING">Billing</option>
              <option value="ACCOUNT">Account</option>
              <option value="TECHNICAL">Technical Issue</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Priority</label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
            >
              <option value="LOW">Low - Can wait</option>
              <option value="MEDIUM">Medium - Normal</option>
              <option value="HIGH">High - Important</option>
              <option value="URGENT">Urgent - Critical</option>
            </select>
          </div>
        </div>

        {/* File Attachments */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Attachments (Optional)
          </label>
          <input
            type="file"
            multiple
            accept="image/*,.pdf,.doc,.docx,.txt,.zip"
            onChange={handleFileChange}
            className="w-full"
          />
          <p className="text-sm text-gray-500 mt-1">
            Max 5 files, 10MB each. Accepts images, PDFs, documents
          </p>

          {files.length > 0 && (
            <div className="mt-4 space-y-2">
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">📎</span>
                    <div>
                      <div className="font-medium text-sm">{file.name}</div>
                      <div className="text-xs text-gray-500">
                        {(file.size / 1024).toFixed(2)} KB
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-orange-500 text-white px-8 py-3 rounded-lg font-bold hover:bg-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Submitting...' : 'Submit Ticket'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/support/tickets')}
            className="px-8 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
          >
            Cancel
          </button>
        </div>
      </form>

      {/* Response Time Info */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-bold mb-2">What to Expect</h3>
        <ul className="text-sm text-gray-700 space-y-2">
          <li>• <strong>Urgent:</strong> Response within 1 hour</li>
          <li>• <strong>High:</strong> Response within 4 hours</li>
          <li>• <strong>Medium:</strong> Response within 24 hours</li>
          <li>• <strong>Low:</strong> Response within 48 hours</li>
        </ul>
      </div>
    </div>
  );
}
