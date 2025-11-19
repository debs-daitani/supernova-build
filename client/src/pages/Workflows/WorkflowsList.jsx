/**
 * Workflows List
 * Dashboard view of all workflows
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function WorkflowsList() {
  const navigate = useNavigate();
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, active, inactive

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/workflows');
      const data = await response.json();

      if (data.success) {
        setWorkflows(data.workflows);
      }
    } catch (error) {
      console.error('Error loading workflows:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteWorkflow = async (workflowId) => {
    if (!confirm('Delete this workflow? This cannot be undone.')) return;

    try {
      await fetch(`/api/workflows/${workflowId}`, {
        method: 'DELETE'
      });
      loadWorkflows();
    } catch (error) {
      console.error('Error deleting workflow:', error);
    }
  };

  const toggleActive = async (workflowId, isActive) => {
    try {
      const endpoint = isActive ? 'deactivate' : 'activate';
      await fetch(`/api/workflows/${workflowId}/${endpoint}`, {
        method: 'POST'
      });
      loadWorkflows();
    } catch (error) {
      console.error('Error toggling workflow:', error);
    }
  };

  const filteredWorkflows = workflows.filter(w => {
    if (filter === 'active') return w.isActive;
    if (filter === 'inactive') return !w.isActive;
    return true;
  });

  if (loading) {
    return <div className="flex items-center justify-center h-screen bg-gray-900 text-white">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Workflow Automation</h1>
            <p className="text-gray-400 mt-1">Build visual workflows to automate everything</p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/workflows/templates')}
              className="px-6 py-3 bg-gray-700 rounded hover:bg-gray-600"
            >
              Browse Templates
            </button>
            <button
              onClick={() => navigate('/workflows/new/edit')}
              className="px-6 py-3 bg-orange-500 rounded hover:bg-orange-600 font-bold"
            >
              + Create Workflow
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded ${
              filter === 'all' ? 'bg-orange-500' : 'bg-gray-800 hover:bg-gray-700'
            }`}
          >
            All ({workflows.length})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded ${
              filter === 'active' ? 'bg-orange-500' : 'bg-gray-800 hover:bg-gray-700'
            }`}
          >
            Active ({workflows.filter(w => w.isActive).length})
          </button>
          <button
            onClick={() => setFilter('inactive')}
            className={`px-4 py-2 rounded ${
              filter === 'inactive' ? 'bg-orange-500' : 'bg-gray-800 hover:bg-gray-700'
            }`}
          >
            Inactive ({workflows.filter(w => !w.isActive).length})
          </button>
        </div>

        {/* Workflows Grid */}
        {filteredWorkflows.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🤖</div>
            <h2 className="text-2xl font-bold mb-2">No Workflows Yet</h2>
            <p className="text-gray-400 mb-6">Create your first workflow to automate tasks</p>
            <button
              onClick={() => navigate('/workflows/new/edit')}
              className="px-6 py-3 bg-orange-500 rounded hover:bg-orange-600 font-bold"
            >
              Create Workflow
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWorkflows.map(workflow => (
              <WorkflowCard
                key={workflow.id}
                workflow={workflow}
                onEdit={() => navigate(`/workflows/${workflow.id}/edit`)}
                onDelete={() => deleteWorkflow(workflow.id)}
                onToggleActive={() => toggleActive(workflow.id, workflow.isActive)}
                onViewHistory={() => navigate(`/workflows/${workflow.id}/history`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function WorkflowCard({ workflow, onEdit, onDelete, onToggleActive, onViewHistory }) {
  const nodeCount = workflow.nodes?.length || 0;
  const executionCount = workflow._count?.executions || workflow.executionCount || 0;

  return (
    <div className="bg-gray-800 rounded-lg p-6 border-2 border-gray-700 hover:border-gray-600 transition-all">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold mb-1">{workflow.name}</h3>
          {workflow.description && (
            <p className="text-sm text-gray-400 line-clamp-2">{workflow.description}</p>
          )}
        </div>

        <div className={`px-3 py-1 rounded text-sm font-bold ${
          workflow.isActive ? 'bg-green-500' : 'bg-gray-600'
        }`}>
          {workflow.isActive ? 'Active' : 'Inactive'}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-700 rounded p-3">
          <div className="text-xs text-gray-400">Nodes</div>
          <div className="text-2xl font-bold">{nodeCount}</div>
        </div>
        <div className="bg-gray-700 rounded p-3">
          <div className="text-xs text-gray-400">Executions</div>
          <div className="text-2xl font-bold">{executionCount}</div>
        </div>
      </div>

      {/* Success Rate */}
      {workflow.successCount + workflow.failureCount > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-gray-400">Success Rate</span>
            <span>
              {Math.round((workflow.successCount / (workflow.successCount + workflow.failureCount)) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full"
              style={{
                width: `${(workflow.successCount / (workflow.successCount + workflow.failureCount)) * 100}%`
              }}
            />
          </div>
        </div>
      )}

      {/* Last Executed */}
      {workflow.lastExecutedAt && (
        <div className="text-xs text-gray-400 mb-4">
          Last run: {new Date(workflow.lastExecutedAt).toLocaleString()}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={onEdit}
          className="flex-1 px-3 py-2 bg-blue-500 rounded hover:bg-blue-600 text-sm font-bold"
        >
          Edit
        </button>
        <button
          onClick={onToggleActive}
          className="px-3 py-2 bg-gray-700 rounded hover:bg-gray-600 text-sm"
        >
          {workflow.isActive ? 'Deactivate' : 'Activate'}
        </button>
        <button
          onClick={onViewHistory}
          className="px-3 py-2 bg-gray-700 rounded hover:bg-gray-600 text-sm"
        >
          📊
        </button>
        <button
          onClick={onDelete}
          className="px-3 py-2 bg-red-500 rounded hover:bg-red-600 text-sm"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}
