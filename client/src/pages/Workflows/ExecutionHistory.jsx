/**
 * Workflow Execution History
 * View all past workflow runs with details
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function ExecutionHistory() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workflow, setWorkflow] = useState(null);
  const [executions, setExecutions] = useState([]);
  const [selectedExecution, setSelectedExecution] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorkflow();
    loadExecutions();
  }, [id]);

  const loadWorkflow = async () => {
    try {
      const response = await fetch(`/api/workflows/${id}`);
      const data = await response.json();

      if (data.success) {
        setWorkflow(data.workflow);
      }
    } catch (error) {
      console.error('Error loading workflow:', error);
    }
  };

  const loadExecutions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/workflows/${id}/executions`);
      const data = await response.json();

      if (data.success) {
        setExecutions(data.executions);
      }
    } catch (error) {
      console.error('Error loading executions:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadExecutionDetails = async (executionId) => {
    try {
      const response = await fetch(`/api/workflows/executions/${executionId}`);
      const data = await response.json();

      if (data.success) {
        setSelectedExecution(data.execution);
      }
    } catch (error) {
      console.error('Error loading execution details:', error);
    }
  };

  if (!workflow) {
    return <div className="flex items-center justify-center h-screen bg-gray-900 text-white">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-6">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate('/workflows')}
            className="text-gray-400 hover:text-white mb-2"
          >
            ← Back to Workflows
          </button>
          <h1 className="text-3xl font-bold">{workflow.name}</h1>
          <p className="text-gray-400 mt-1">Execution History</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {loading ? (
          <div className="text-center py-12">Loading executions...</div>
        ) : executions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <h2 className="text-2xl font-bold mb-2">No Executions Yet</h2>
            <p className="text-gray-400">This workflow hasn't run yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Execution List */}
            <div className="space-y-3">
              <h2 className="text-xl font-bold mb-4">Recent Executions ({executions.length})</h2>

              {executions.map(execution => (
                <ExecutionListItem
                  key={execution.id}
                  execution={execution}
                  isSelected={selectedExecution?.id === execution.id}
                  onClick={() => loadExecutionDetails(execution.id)}
                />
              ))}
            </div>

            {/* Execution Details */}
            <div>
              {selectedExecution ? (
                <ExecutionDetails execution={selectedExecution} />
              ) : (
                <div className="bg-gray-800 rounded-lg p-12 text-center">
                  <div className="text-4xl mb-4">👈</div>
                  <p className="text-gray-400">Select an execution to view details</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ExecutionListItem({ execution, isSelected, onClick }) {
  const statusColors = {
    SUCCESS: 'bg-green-500',
    FAILED: 'bg-red-500',
    RUNNING: 'bg-yellow-500',
    CANCELLED: 'bg-gray-500',
    TIMEOUT: 'bg-orange-500'
  };

  const statusColor = statusColors[execution.status] || 'bg-gray-500';

  return (
    <div
      onClick={onClick}
      className={`bg-gray-800 rounded-lg p-4 cursor-pointer border-2 ${
        isSelected ? 'border-orange-500' : 'border-gray-700 hover:border-gray-600'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className={`inline-block px-3 py-1 rounded text-xs font-bold ${statusColor}`}>
            {execution.status}
          </div>
        </div>
        <div className="text-xs text-gray-400">
          {execution.duration ? `${(execution.duration / 1000).toFixed(2)}s` : '-'}
        </div>
      </div>

      <div className="text-sm text-gray-400">
        {new Date(execution.startedAt).toLocaleString()}
      </div>

      {execution.errors && (
        <div className="mt-2 text-xs text-red-400">
          {execution.errors.length} error(s)
        </div>
      )}
    </div>
  );
}

function ExecutionDetails({ execution }) {
  const statusColors = {
    SUCCESS: 'bg-green-500',
    FAILED: 'bg-red-500',
    RUNNING: 'bg-yellow-500',
    CANCELLED: 'bg-gray-500',
    TIMEOUT: 'bg-orange-500'
  };

  const statusColor = statusColors[execution.status] || 'bg-gray-500';

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h3 className="text-xl font-bold mb-4">Execution Details</h3>

      {/* Status */}
      <div className="mb-6">
        <div className="text-sm text-gray-400 mb-1">Status</div>
        <div className={`inline-block px-4 py-2 rounded font-bold ${statusColor}`}>
          {execution.status}
        </div>
      </div>

      {/* Timing */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <div className="text-sm text-gray-400 mb-1">Started</div>
          <div className="font-mono text-sm">
            {new Date(execution.startedAt).toLocaleString()}
          </div>
        </div>
        {execution.completedAt && (
          <div>
            <div className="text-sm text-gray-400 mb-1">Completed</div>
            <div className="font-mono text-sm">
              {new Date(execution.completedAt).toLocaleString()}
            </div>
          </div>
        )}
        {execution.duration && (
          <div>
            <div className="text-sm text-gray-400 mb-1">Duration</div>
            <div className="font-mono text-sm">{(execution.duration / 1000).toFixed(2)}s</div>
          </div>
        )}
      </div>

      {/* Trigger Data */}
      <div className="mb-6">
        <div className="text-sm font-bold mb-2">Trigger Data</div>
        <pre className="bg-gray-900 rounded p-4 text-xs overflow-x-auto">
          {JSON.stringify(execution.triggerData, null, 2)}
        </pre>
      </div>

      {/* Executed Actions */}
      {execution.executedActions && execution.executedActions.length > 0 && (
        <div className="mb-6">
          <div className="text-sm font-bold mb-2">
            Executed Actions ({execution.executedActions.length})
          </div>
          <div className="space-y-2">
            {execution.executedActions.map((action, index) => (
              <div key={index} className="bg-gray-900 rounded p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold">
                    {action.actionType || action.type}
                  </span>
                  {action.result?.success !== undefined && (
                    <span className={`text-xs px-2 py-1 rounded ${
                      action.result.success ? 'bg-green-500' : 'bg-red-500'
                    }`}>
                      {action.result.success ? 'Success' : 'Failed'}
                    </span>
                  )}
                </div>
                {action.result && (
                  <pre className="text-xs text-gray-400 overflow-x-auto">
                    {JSON.stringify(action.result, null, 2)}
                  </pre>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Errors */}
      {execution.errors && execution.errors.length > 0 && (
        <div className="mb-6">
          <div className="text-sm font-bold mb-2 text-red-400">
            Errors ({execution.errors.length})
          </div>
          <div className="space-y-2">
            {execution.errors.map((error, index) => (
              <div key={index} className="bg-red-900/20 border border-red-500 rounded p-3">
                <div className="text-sm font-bold mb-1">Node: {error.nodeId}</div>
                <div className="text-sm">{error.error}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Output */}
      {execution.output && (
        <div>
          <div className="text-sm font-bold mb-2">Output</div>
          <pre className="bg-gray-900 rounded p-4 text-xs overflow-x-auto">
            {JSON.stringify(execution.output, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
