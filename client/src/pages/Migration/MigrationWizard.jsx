/**
 * Platform Migration Wizard
 * 7-step wizard to migrate from other platforms to The dAItaniverse
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PLATFORMS = [
  { id: 'WIX', name: 'Wix', icon: '🌐', color: 'blue' },
  { id: 'SHOPIFY', name: 'Shopify', icon: '🛍️', color: 'green' },
  { id: 'WORDPRESS', name: 'WordPress', icon: '📝', color: 'blue' },
  { id: 'SQUARESPACE', name: 'Squarespace', icon: '⬛', color: 'gray' },
  { id: 'KAJABI', name: 'Kajabi', icon: '🎓', color: 'purple' },
  { id: 'TEACHABLE', name: 'Teachable', icon: '📚', color: 'orange' },
  { id: 'MAILCHIMP', name: 'Mailchimp', icon: '✉️', color: 'yellow' },
  { id: 'CONVERTKIT', name: 'ConvertKit', icon: '📧', color: 'pink' },
  { id: 'WEBFLOW', name: 'Webflow', icon: '🌊', color: 'blue' },
  { id: 'GHOST', name: 'Ghost', icon: '👻', color: 'gray' },
  { id: 'MEDIUM', name: 'Medium', icon: 'Ⓜ️', color: 'green' },
  { id: 'SUBSTACK', name: 'Substack', icon: '📰', color: 'orange' },
  { id: 'CARRD', name: 'Carrd', icon: '🃏', color: 'purple' },
  { id: 'OTHER', name: 'Other', icon: '📦', color: 'gray' }
];

const DATA_TYPES = [
  { id: 'pages', name: 'Pages', icon: '📄', description: 'Website pages and content' },
  { id: 'products', name: 'Products', icon: '🛍️', description: 'E-commerce products and variants' },
  { id: 'customers', name: 'Customers', icon: '👥', description: 'Customer accounts and data' },
  { id: 'posts', name: 'Blog Posts', icon: '📝', description: 'Blog posts and articles' },
  { id: 'media', name: 'Media', icon: '🖼️', description: 'Images, videos, and files' },
  { id: 'orders', name: 'Orders', icon: '🛒', description: 'Order history and transactions' }
];

export default function MigrationWizard() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [projectId, setProjectId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Step 1: Platform selection
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [projectName, setProjectName] = useState('');

  // Step 2: Connection/Upload
  const [connectionMethod, setConnectionMethod] = useState('upload'); // 'api' or 'upload'
  const [apiKey, setApiKey] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [analysis, setAnalysis] = useState(null);

  // Step 3: Data selection
  const [selectedDataTypes, setSelectedDataTypes] = useState([]);

  // Step 4: Field mapping
  const [fieldMappings, setFieldMappings] = useState({});

  // Step 5: Preview
  const [previewData, setPreviewData] = useState([]);

  // Step 6: Execution
  const [migrationProgress, setMigrationProgress] = useState(null);
  const [isExecuting, setIsExecuting] = useState(false);

  // Step 7: Results
  const [migrationReport, setMigrationReport] = useState(null);

  // Poll migration progress
  useEffect(() => {
    if (isExecuting && projectId) {
      const interval = setInterval(async () => {
        try {
          const response = await fetch(`/api/platform-migration/${projectId}/status`);
          const data = await response.json();
          setMigrationProgress(data.progress);

          if (['COMPLETED', 'COMPLETED_WITH_ERRORS', 'FAILED'].includes(data.progress.status)) {
            setIsExecuting(false);
            clearInterval(interval);
            loadReport();
          }
        } catch (error) {
          console.error('Error checking progress:', error);
        }
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [isExecuting, projectId]);

  // Step 1: Start migration project
  const handleStartProject = async () => {
    if (!selectedPlatform) {
      setError('Please select a platform');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/platform-migration/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourcePlatform: selectedPlatform,
          projectName: projectName || `Migration from ${PLATFORMS.find(p => p.id === selectedPlatform)?.name}`
        })
      });

      const data = await response.json();

      if (data.success) {
        setProjectId(data.project.id);
        setCurrentStep(2);
      } else {
        setError(data.error || 'Failed to start migration project');
      }
    } catch (error) {
      setError('Error starting migration project');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Upload files
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      files.forEach(file => formData.append('files', file));

      const response = await fetch(`/api/platform-migration/${projectId}/upload`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setUploadedFiles(data.files);
        setAnalysis(data.analysis);
      } else {
        setError(data.error || 'Failed to upload files');
      }
    } catch (error) {
      setError('Error uploading files');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Select data types
  const handleDataSelection = async () => {
    if (selectedDataTypes.length === 0) {
      setError('Please select at least one data type to migrate');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/platform-migration/${projectId}/select-data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataToMigrate: selectedDataTypes })
      });

      const data = await response.json();

      if (data.success) {
        setCurrentStep(4);
        loadDefaultMappings();
      } else {
        setError(data.error || 'Failed to save data selection');
      }
    } catch (error) {
      setError('Error saving data selection');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Step 4: Load default field mappings
  const loadDefaultMappings = async () => {
    setLoading(true);

    try {
      const mappings = {};
      for (const dataType of selectedDataTypes) {
        const response = await fetch(`/api/platform-migration/${projectId}/default-mapping?itemType=${dataType}`);
        const data = await response.json();
        mappings[dataType] = data.mapping;
      }
      setFieldMappings(mappings);
    } catch (error) {
      console.error('Error loading default mappings:', error);
    } finally {
      setLoading(false);
    }
  };

  // Step 4: Save field mappings
  const handleSaveMappings = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/platform-migration/${projectId}/mapping`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fieldMapping: fieldMappings })
      });

      const data = await response.json();

      if (data.success) {
        setCurrentStep(5);
        loadPreview();
      } else {
        setError(data.error || 'Failed to save field mappings');
      }
    } catch (error) {
      setError('Error saving field mappings');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Step 5: Load preview
  const loadPreview = async () => {
    setLoading(true);

    try {
      const response = await fetch(`/api/platform-migration/${projectId}/preview?limit=5`);
      const data = await response.json();
      setPreviewData(data.preview);
    } catch (error) {
      console.error('Error loading preview:', error);
    } finally {
      setLoading(false);
    }
  };

  // Step 6: Execute migration
  const handleExecuteMigration = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/platform-migration/${projectId}/execute`, {
        method: 'POST'
      });

      const data = await response.json();

      if (data.success) {
        setIsExecuting(true);
        setCurrentStep(6);
      } else {
        setError(data.error || 'Failed to start migration');
      }
    } catch (error) {
      setError('Error starting migration');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Step 7: Load report
  const loadReport = async () => {
    try {
      const response = await fetch(`/api/platform-migration/${projectId}/report`);
      const data = await response.json();
      setMigrationReport(data.report);
      setCurrentStep(7);
    } catch (error) {
      console.error('Error loading report:', error);
    }
  };

  // Retry failed items
  const handleRetry = async () => {
    setLoading(true);

    try {
      const response = await fetch(`/api/platform-migration/${projectId}/retry`, {
        method: 'POST'
      });

      const data = await response.json();

      if (data.success) {
        alert(`Retry completed: ${data.successCount} succeeded, ${data.failedCount} failed`);
        loadReport();
      }
    } catch (error) {
      console.error('Error retrying failed items:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">Step 1: Choose Your Platform</h2>
            <p className="text-gray-600 mb-8">
              Select the platform you want to migrate from
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {PLATFORMS.map(platform => (
                <button
                  key={platform.id}
                  onClick={() => setSelectedPlatform(platform.id)}
                  className={`p-6 border-2 rounded-lg text-center transition-all ${
                    selectedPlatform === platform.id
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-4xl mb-2">{platform.icon}</div>
                  <div className="font-medium">{platform.name}</div>
                </button>
              ))}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                Project Name (optional)
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder={`Migration from ${PLATFORMS.find(p => p.id === selectedPlatform)?.name || '...'}`}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <button
              onClick={handleStartProject}
              disabled={!selectedPlatform || loading}
              className="w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white py-3 rounded-lg font-bold disabled:opacity-50"
            >
              {loading ? 'Starting...' : 'Next: Upload Data'}
            </button>
          </div>
        );

      case 2:
        return (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">Step 2: Upload Your Data</h2>
            <p className="text-gray-600 mb-8">
              Upload export files from {PLATFORMS.find(p => p.id === selectedPlatform)?.name}
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <h3 className="font-bold mb-2">📚 Need help exporting?</h3>
              <p className="text-sm text-gray-700 mb-3">
                View our step-by-step guide for exporting data from {PLATFORMS.find(p => p.id === selectedPlatform)?.name}
              </p>
              <button
                onClick={() => window.open(`/migration/guides/${selectedPlatform.toLowerCase()}`, '_blank')}
                className="text-sm text-blue-600 hover:underline"
              >
                View Export Guide →
              </button>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center mb-6">
              <div className="text-6xl mb-4">📤</div>
              <h3 className="text-lg font-bold mb-2">Upload Export Files</h3>
              <p className="text-gray-600 mb-4">
                Supported formats: CSV, JSON, XML, ZIP (up to 50MB)
              </p>
              <label className="inline-block bg-orange-500 text-white px-6 py-2 rounded-lg cursor-pointer hover:bg-orange-600">
                Choose Files
                <input
                  type="file"
                  multiple
                  accept=".csv,.json,.xml,.zip"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {uploadedFiles.length > 0 && (
              <div className="mb-6">
                <h3 className="font-bold mb-3">Uploaded Files:</h3>
                <div className="space-y-2">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">{file.originalName}</div>
                        <div className="text-sm text-gray-600">{(file.size / 1024).toFixed(2)} KB</div>
                      </div>
                      <div className="text-green-600">✓</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {analysis && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                <h3 className="font-bold mb-3">✓ Analysis Complete</h3>
                <div className="grid grid-cols-3 gap-4">
                  {analysis.pages > 0 && <Stat label="Pages" value={analysis.pages} />}
                  {analysis.products > 0 && <Stat label="Products" value={analysis.products} />}
                  {analysis.customers > 0 && <Stat label="Customers" value={analysis.customers} />}
                  {analysis.posts > 0 && <Stat label="Posts" value={analysis.posts} />}
                  {analysis.media > 0 && <Stat label="Media" value={analysis.media} />}
                  {analysis.orders > 0 && <Stat label="Orders" value={analysis.orders} />}
                </div>
                <div className="mt-4 font-bold text-lg">
                  Total items found: {analysis.total}
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={() => setCurrentStep(1)}
                className="flex-1 border border-gray-300 py-3 rounded-lg font-bold hover:bg-gray-50"
              >
                ← Back
              </button>
              <button
                onClick={() => setCurrentStep(3)}
                disabled={!analysis || loading}
                className="flex-1 bg-gradient-to-r from-orange-500 to-pink-500 text-white py-3 rounded-lg font-bold disabled:opacity-50"
              >
                {loading ? 'Analyzing...' : 'Next: Select Data'}
              </button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">Step 3: Select Data to Migrate</h2>
            <p className="text-gray-600 mb-8">
              Choose what you want to import into The dAItaniverse
            </p>

            <div className="space-y-3 mb-6">
              {DATA_TYPES.map(dataType => (
                <label
                  key={dataType.id}
                  className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedDataTypes.includes(dataType.id)
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedDataTypes.includes(dataType.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedDataTypes([...selectedDataTypes, dataType.id]);
                      } else {
                        setSelectedDataTypes(selectedDataTypes.filter(id => id !== dataType.id));
                      }
                    }}
                    className="mr-4 w-5 h-5"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 font-bold mb-1">
                      <span>{dataType.icon}</span>
                      <span>{dataType.name}</span>
                      {analysis && analysis[dataType.id] > 0 && (
                        <span className="ml-auto text-orange-600">
                          {analysis[dataType.id]} found
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{dataType.description}</p>
                  </div>
                </label>
              ))}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={() => setCurrentStep(2)}
                className="flex-1 border border-gray-300 py-3 rounded-lg font-bold hover:bg-gray-50"
              >
                ← Back
              </button>
              <button
                onClick={handleDataSelection}
                disabled={selectedDataTypes.length === 0 || loading}
                className="flex-1 bg-gradient-to-r from-orange-500 to-pink-500 text-white py-3 rounded-lg font-bold disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Next: Map Fields'}
              </button>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">Step 4: Field Mapping</h2>
            <p className="text-gray-600 mb-8">
              We've auto-detected field mappings. Review and adjust if needed.
            </p>

            {loading ? (
              <div className="text-center py-12">Loading mappings...</div>
            ) : (
              <div className="space-y-6 mb-6">
                {Object.entries(fieldMappings).map(([dataType, mapping]) => (
                  <div key={dataType} className="border rounded-lg p-6">
                    <h3 className="font-bold text-lg mb-4 capitalize">{dataType} Mapping</h3>
                    <div className="space-y-2">
                      {Object.entries(mapping).map(([targetField, sourceField]) => (
                        <div key={targetField} className="flex items-center gap-4">
                          <div className="w-1/3 text-sm font-medium">{sourceField}</div>
                          <div className="text-gray-400">→</div>
                          <div className="w-1/3 text-sm text-gray-600">{targetField}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={() => setCurrentStep(3)}
                className="flex-1 border border-gray-300 py-3 rounded-lg font-bold hover:bg-gray-50"
              >
                ← Back
              </button>
              <button
                onClick={handleSaveMappings}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-orange-500 to-pink-500 text-white py-3 rounded-lg font-bold disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Next: Preview'}
              </button>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">Step 5: Preview Migration</h2>
            <p className="text-gray-600 mb-8">
              Review a sample of your data before running the full migration
            </p>

            {loading ? (
              <div className="text-center py-12">Loading preview...</div>
            ) : previewData.length === 0 ? (
              <div className="text-center py-12 text-gray-500">No preview data available</div>
            ) : (
              <div className="space-y-4 mb-6">
                {previewData.map((item, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="font-bold mb-2">{item.itemType}</div>
                    <pre className="text-sm bg-gray-50 p-3 rounded overflow-x-auto">
                      {JSON.stringify(item.originalData, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
              <h3 className="font-bold mb-2">⚠️ Ready to migrate?</h3>
              <p className="text-sm text-gray-700">
                This will import {analysis?.total || 0} items into your dAItaniverse account.
                Existing items will be skipped automatically.
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setCurrentStep(4)}
                className="flex-1 border border-gray-300 py-3 rounded-lg font-bold hover:bg-gray-50"
              >
                ← Back
              </button>
              <button
                onClick={handleExecuteMigration}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-orange-500 to-pink-500 text-white py-3 rounded-lg font-bold disabled:opacity-50"
              >
                {loading ? 'Starting...' : 'Start Migration'}
              </button>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">Step 6: Migrating...</h2>
            <p className="text-gray-600 mb-8">
              Please wait while we migrate your data
            </p>

            {migrationProgress && (
              <div className="mb-8">
                <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
                  <div
                    className="bg-gradient-to-r from-orange-500 to-pink-500 h-4 rounded-full transition-all"
                    style={{ width: `${migrationProgress.percentage}%` }}
                  />
                </div>

                <div className="text-4xl font-bold mb-4">{migrationProgress.percentage}%</div>

                <div className="grid grid-cols-4 gap-4 max-w-2xl mx-auto">
                  <Stat label="Total" value={migrationProgress.itemsTotal} />
                  <Stat label="Migrated" value={migrationProgress.itemsMigrated} color="green" />
                  <Stat label="Failed" value={migrationProgress.itemsFailed} color="red" />
                  <Stat label="Skipped" value={migrationProgress.itemsSkipped} color="yellow" />
                </div>

                <div className="mt-6">
                  <div className="text-sm text-gray-600">Status: {migrationProgress.status}</div>
                </div>
              </div>
            )}

            {!isExecuting && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="text-6xl mb-4">✅</div>
                <h3 className="text-xl font-bold mb-2">Migration Complete!</h3>
                <p className="text-gray-600">Loading final report...</p>
              </div>
            )}
          </div>
        );

      case 7:
        return (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">Step 7: Migration Complete!</h2>

            {migrationReport && (
              <>
                <div className="grid grid-cols-4 gap-4 mb-8">
                  <StatCard
                    label="Total Items"
                    value={migrationReport.summary.total}
                    icon="📊"
                    color="blue"
                  />
                  <StatCard
                    label="Migrated"
                    value={migrationReport.summary.migrated}
                    icon="✅"
                    color="green"
                  />
                  <StatCard
                    label="Failed"
                    value={migrationReport.summary.failed}
                    icon="❌"
                    color="red"
                  />
                  <StatCard
                    label="Skipped"
                    value={migrationReport.summary.skipped}
                    icon="⏭️"
                    color="yellow"
                  />
                </div>

                {migrationReport.summary.failed > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
                    <h3 className="font-bold mb-3">⚠️ Some items failed to migrate</h3>
                    <p className="text-sm text-gray-700 mb-4">
                      {migrationReport.summary.failed} items encountered errors during migration.
                      You can retry failed items or view the detailed error log.
                    </p>
                    <button
                      onClick={handleRetry}
                      disabled={loading}
                      className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600"
                    >
                      {loading ? 'Retrying...' : 'Retry Failed Items'}
                    </button>
                  </div>
                )}

                <div className="border rounded-lg p-6 mb-6">
                  <h3 className="font-bold mb-4">Migration Breakdown</h3>
                  <div className="space-y-2">
                    {Object.entries(migrationReport.itemsByType).map(([type, count]) => (
                      <div key={type} className="flex justify-between items-center">
                        <span className="text-gray-700">{type}</span>
                        <span className="font-bold">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div className="flex gap-4">
              <button
                onClick={() => navigate('/migration/dashboard')}
                className="flex-1 border border-gray-300 py-3 rounded-lg font-bold hover:bg-gray-50"
              >
                View All Migrations
              </button>
              <button
                onClick={() => navigate('/')}
                className="flex-1 bg-gradient-to-r from-orange-500 to-pink-500 text-white py-3 rounded-lg font-bold"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      {/* Progress Steps */}
      <div className="max-w-6xl mx-auto mb-12">
        <div className="flex justify-between items-center">
          {[1, 2, 3, 4, 5, 6, 7].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  step < currentStep
                    ? 'bg-green-500 text-white'
                    : step === currentStep
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {step < currentStep ? '✓' : step}
              </div>
              {step < 7 && (
                <div
                  className={`w-16 h-1 mx-2 ${
                    step < currentStep ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-600">
          <span>Platform</span>
          <span>Upload</span>
          <span>Select</span>
          <span>Map</span>
          <span>Preview</span>
          <span>Execute</span>
          <span>Results</span>
        </div>
      </div>

      {/* Current Step */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        {renderStep()}
      </div>
    </div>
  );
}

function Stat({ label, value, color = 'gray' }) {
  const colors = {
    gray: 'text-gray-700',
    green: 'text-green-600',
    red: 'text-red-600',
    yellow: 'text-yellow-600'
  };

  return (
    <div className="text-center">
      <div className={`text-2xl font-bold ${colors[color]}`}>{value}</div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  );
}

function StatCard({ label, value, icon, color }) {
  const colors = {
    blue: 'from-blue-500 to-cyan-500',
    green: 'from-green-500 to-emerald-500',
    red: 'from-red-500 to-pink-500',
    yellow: 'from-yellow-500 to-orange-500'
  };

  return (
    <div className={`bg-gradient-to-br ${colors[color]} rounded-lg p-6 text-white`}>
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm opacity-90">{label}</div>
    </div>
  );
}
