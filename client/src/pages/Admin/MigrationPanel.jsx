/**
 * User Migration Admin Panel
 * Interface for importing users from external systems
 */

import { useState, useEffect } from 'react';

export default function MigrationPanel() {
  const [activeTab, setActiveTab] = useState('upload');
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [uploadedFilePath, setUploadedFilePath] = useState(null);
  const [migrationResult, setMigrationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);

  useEffect(() => {
    loadStats();
    loadLogs();
  }, []);

  const loadStats = async () => {
    try {
      const response = await fetch('/api/migration/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadLogs = async () => {
    try {
      const response = await fetch('/api/migration/logs');
      const data = await response.json();
      setLogs(data.logs || []);
    } catch (error) {
      console.error('Error loading logs:', error);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setFilePreview(null);
      setUploadedFilePath(null);
      setMigrationResult(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Please select a file first');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('/api/migration/upload', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        setFilePreview(data);
        setUploadedFilePath(data.filepath);
        alert(`File uploaded! Found ${data.totalRows} users.`);
      } else {
        alert(data.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async () => {
    if (!uploadedFilePath) {
      alert('Please upload a file first');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/migration/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filepath: uploadedFilePath })
      });

      const data = await response.json();

      if (response.ok) {
        alert(`Preview: ${data.preview.successCount} would be created, ${data.preview.duplicateCount} duplicates, ${data.preview.errorCount} errors`);
      } else {
        alert(data.error || 'Preview failed');
      }
    } catch (error) {
      console.error('Error previewing:', error);
      alert('Preview failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRunMigration = async () => {
    if (!uploadedFilePath) {
      alert('Please upload a file first');
      return;
    }

    const confirmed = confirm(
      `This will import users from the uploaded file. Are you sure?`
    );

    if (!confirmed) return;

    setLoading(true);
    try {
      const response = await fetch('/api/migration/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filepath: uploadedFilePath,
          sendEmails: true
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMigrationResult(data.result);
        alert(`Migration complete! ${data.result.successCount} users created.`);
        loadStats();
        loadLogs();
        setActiveTab('results');
      } else {
        alert(data.error || 'Migration failed');
      }
    } catch (error) {
      console.error('Error running migration:', error);
      alert('Migration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmails = async (batchId) => {
    const confirmed = confirm('Resend welcome emails for this batch?');
    if (!confirmed) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/migration/resend-emails/${batchId}`, {
        method: 'POST'
      });

      const data = await response.json();

      if (response.ok) {
        alert(`Emails resent! ${data.sent} sent, ${data.failed} failed.`);
      } else {
        alert(data.error || 'Failed to resend emails');
      }
    } catch (error) {
      console.error('Error resending emails:', error);
      alert('Failed to resend emails');
    } finally {
      setLoading(false);
    }
  };

  const viewLogDetails = async (batchId) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/migration/logs/${batchId}`);
      const data = await response.json();

      if (response.ok) {
        setSelectedLog(data);
        setActiveTab('log-details');
      } else {
        alert('Failed to load log details');
      }
    } catch (error) {
      console.error('Error loading log details:', error);
      alert('Failed to load log details');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">User Migration</h1>
        <p className="text-gray-600">
          Import users from Wix or other external systems
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Migrations"
            value={stats.totalMigrations}
            icon="📊"
            color="blue"
          />
          <StatCard
            title="Total Users Imported"
            value={stats.totalUsers}
            icon="👥"
            color="green"
          />
          <StatCard
            title="Successful"
            value={stats.successfulUsers}
            icon="✅"
            color="green"
          />
          <StatCard
            title="Quiz Testers"
            value={stats.quizTesters}
            icon="🎯"
            color="purple"
          />
        </div>
      )}

      {/* Tabs */}
      <div className="border-b mb-6">
        <div className="flex gap-6 overflow-x-auto">
          {[
            { id: 'upload', label: 'Upload & Import' },
            { id: 'results', label: 'Results' },
            { id: 'logs', label: `History (${logs.length})` },
            { id: 'log-details', label: 'Log Details' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-2 font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-orange-500 text-orange-500'
                  : 'border-transparent text-gray-600 hover:text-orange-500'
              } ${tab.id === 'log-details' && !selectedLog ? 'hidden' : ''}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'upload' && (
        <div className="space-y-6">
          {/* Upload Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Step 1: Upload CSV File</h2>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                Select CSV file containing user data
              </label>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-semibold
                  file:bg-orange-50 file:text-orange-700
                  hover:file:bg-orange-100"
              />
            </div>

            {selectedFile && (
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="font-medium">Selected: {selectedFile.name}</p>
                <p className="text-sm text-gray-600">
                  Size: {(selectedFile.size / 1024).toFixed(2)} KB
                </p>
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={!selectedFile || loading}
              className="bg-orange-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Uploading...' : 'Upload File'}
            </button>
          </div>

          {/* Preview Section */}
          {filePreview && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">Step 2: Preview Data</h2>

              <div className="mb-4">
                <p className="text-gray-700">
                  <strong>Total Rows:</strong> {filePreview.totalRows}
                </p>
                <p className="text-gray-700">
                  <strong>Headers:</strong> {filePreview.headers.join(', ')}
                </p>
              </div>

              <div className="overflow-x-auto mb-4">
                <table className="w-full border">
                  <thead className="bg-gray-100">
                    <tr>
                      {filePreview.headers.map(header => (
                        <th key={header} className="px-4 py-2 text-left border">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filePreview.preview.map((row, i) => (
                      <tr key={i} className="border-b">
                        {filePreview.headers.map(header => (
                          <td key={header} className="px-4 py-2 border">
                            {row[header]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handlePreview}
                  disabled={loading}
                  className="bg-blue-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-600 transition-all disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Run Preview (Dry Run)'}
                </button>
                <button
                  onClick={handleRunMigration}
                  disabled={loading}
                  className="bg-green-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-600 transition-all disabled:opacity-50"
                >
                  {loading ? 'Importing...' : 'Import Users'}
                </button>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="font-bold mb-2">CSV Format Required:</h3>
            <p className="text-sm text-gray-700 mb-2">
              Your CSV file should have the following columns:
            </p>
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
              <li><code>email</code> - User email (required)</li>
              <li><code>name</code> - Full name (optional)</li>
              <li><code>signup_date</code> - Original signup date (optional)</li>
              <li><code>source</code> - Where they signed up (optional)</li>
              <li><code>tags</code> - Comma-separated tags (optional)</li>
            </ul>
          </div>
        </div>
      )}

      {activeTab === 'results' && migrationResult && (
        <div className="space-y-6">
          {/* Summary Card */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Migration Results</h2>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              <ResultStat label="Total Processed" value={migrationResult.totalProcessed} />
              <ResultStat label="Successfully Created" value={migrationResult.successCount} color="green" />
              <ResultStat label="Duplicates Skipped" value={migrationResult.duplicateCount} color="yellow" />
              <ResultStat label="Errors" value={migrationResult.errorCount} color="red" />
              <ResultStat label="Emails Sent" value={migrationResult.emailsSent} color="blue" />
              <ResultStat label="Emails Failed" value={migrationResult.emailsFailed} color="orange" />
            </div>

            <div className="mb-4">
              <span className={`px-4 py-2 rounded-lg font-bold ${
                migrationResult.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                migrationResult.status === 'FAILED' ? 'bg-red-100 text-red-700' :
                'bg-yellow-100 text-yellow-700'
              }`}>
                {migrationResult.status}
              </span>
            </div>

            <p className="text-gray-600">
              Batch ID: <code className="font-mono text-sm">{migrationResult.batchId}</code>
            </p>
          </div>

          {/* Quiz Testers */}
          {migrationResult.quizTesters && migrationResult.quizTesters.length > 0 && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-bold mb-4">
                🎉 Quiz Testers (Lifetime Free Access)
              </h3>
              <div className="space-y-2">
                {migrationResult.quizTesters.map((qt, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                    <span className="text-2xl">👑</span>
                    <div>
                      <div className="font-medium">{qt.name}</div>
                      <div className="text-sm text-gray-600">{qt.email}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Errors */}
          {migrationResult.errors && migrationResult.errors.length > 0 && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-bold mb-4 text-red-600">
                ❌ Errors ({migrationResult.errors.length})
              </h3>
              <div className="space-y-2">
                {migrationResult.errors.map((err, i) => (
                  <div key={i} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="font-medium">{err.email || err.name}</div>
                    <div className="text-sm text-red-600">{err.error}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Migration History</h2>

          {logs.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No migrations yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr className="text-left">
                    <th className="pb-3">Date</th>
                    <th className="pb-3">Source</th>
                    <th className="pb-3">Total</th>
                    <th className="pb-3">Success</th>
                    <th className="pb-3">Errors</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map(log => (
                    <tr key={log.id} className="border-b hover:bg-gray-50">
                      <td className="py-3">
                        {new Date(log.startedAt).toLocaleString()}
                      </td>
                      <td className="py-3">{log.source}</td>
                      <td className="py-3">{log.totalProcessed}</td>
                      <td className="py-3 text-green-600">{log.successCount}</td>
                      <td className="py-3 text-red-600">{log.errorCount}</td>
                      <td className="py-3">
                        <StatusBadge status={log.status} />
                      </td>
                      <td className="py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => viewLogDetails(log.batchId)}
                            className="text-blue-600 hover:underline text-sm"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleResendEmails(log.batchId)}
                            className="text-orange-600 hover:underline text-sm"
                          >
                            Resend Emails
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'log-details' && selectedLog && (
        <div className="space-y-6">
          <button
            onClick={() => setActiveTab('logs')}
            className="text-blue-600 hover:underline mb-4"
          >
            ← Back to History
          </button>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Migration Details</h2>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              <div>
                <div className="text-sm text-gray-600">Batch ID</div>
                <div className="font-mono text-sm">{selectedLog.log.batchId}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Status</div>
                <StatusBadge status={selectedLog.log.status} />
              </div>
              <div>
                <div className="text-sm text-gray-600">Started</div>
                <div className="text-sm">{new Date(selectedLog.log.startedAt).toLocaleString()}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Success</div>
                <div className="text-green-600 font-bold">{selectedLog.log.successCount}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Duplicates</div>
                <div className="text-yellow-600 font-bold">{selectedLog.log.duplicateCount}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Errors</div>
                <div className="text-red-600 font-bold">{selectedLog.log.errorCount}</div>
              </div>
            </div>

            {/* Detailed Records */}
            <h3 className="font-bold mb-3">Imported Users ({selectedLog.records.length})</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-gray-50">
                  <tr className="text-left">
                    <th className="p-2">Email</th>
                    <th className="p-2">Name</th>
                    <th className="p-2">Status</th>
                    <th className="p-2">Email Sent</th>
                    <th className="p-2">Error</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedLog.records.map(record => (
                    <tr key={record.id} className="border-b">
                      <td className="p-2">{record.originalEmail}</td>
                      <td className="p-2">{record.originalName || '-'}</td>
                      <td className="p-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          record.status === 'success' ? 'bg-green-100 text-green-700' :
                          record.status === 'duplicate' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="p-2">
                        {record.emailSent ? '✅' : '❌'}
                      </td>
                      <td className="p-2 text-red-600 text-xs">
                        {record.errorMessage || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function StatCard({ title, value, icon, color }) {
  const colors = {
    blue: 'from-blue-500 to-cyan-500',
    green: 'from-green-500 to-emerald-500',
    purple: 'from-purple-500 to-pink-500'
  };

  return (
    <div className={`bg-gradient-to-br ${colors[color] || colors.blue} rounded-lg p-6 text-white shadow-lg`}>
      <div className="flex justify-between items-start mb-2">
        <div className="text-sm opacity-90">{title}</div>
        <div className="text-2xl">{icon}</div>
      </div>
      <div className="text-3xl font-bold">{value}</div>
    </div>
  );
}

function ResultStat({ label, value, color = 'gray' }) {
  const colors = {
    green: 'text-green-600',
    yellow: 'text-yellow-600',
    red: 'text-red-600',
    blue: 'text-blue-600',
    orange: 'text-orange-600',
    gray: 'text-gray-700'
  };

  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <div className="text-sm text-gray-600 mb-1">{label}</div>
      <div className={`text-2xl font-bold ${colors[color]}`}>{value}</div>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    COMPLETED: 'bg-green-100 text-green-700',
    IN_PROGRESS: 'bg-blue-100 text-blue-700',
    FAILED: 'bg-red-100 text-red-700',
    PARTIAL: 'bg-yellow-100 text-yellow-700',
    PENDING: 'bg-gray-100 text-gray-700'
  };

  return (
    <span className={`${styles[status] || styles.PENDING} px-2 py-1 rounded text-xs font-medium`}>
      {status}
    </span>
  );
}
