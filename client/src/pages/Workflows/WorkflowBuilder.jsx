/**
 * Visual Workflow Builder
 * Drag-and-drop workflow automation builder
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// Node types with colors
const NODE_TYPES = {
  trigger: {
    label: 'Trigger',
    color: 'bg-green-500',
    icon: '⚡'
  },
  action: {
    label: 'Action',
    color: 'bg-blue-500',
    icon: '⚙️'
  },
  condition: {
    label: 'Condition',
    color: 'bg-yellow-500',
    icon: '❓'
  },
  delay: {
    label: 'Delay',
    color: 'bg-orange-500',
    icon: '⏱️'
  }
};

export default function WorkflowBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workflow, setWorkflow] = useState(null);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [showNodeEditor, setShowNodeEditor] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    if (id && id !== 'new') {
      loadWorkflow();
    } else {
      // New workflow
      setWorkflow({
        name: 'Untitled Workflow',
        description: '',
        trigger: { type: '' },
        isActive: false
      });
      setNodes([]);
      setEdges([]);
    }
  }, [id]);

  const loadWorkflow = async () => {
    try {
      const response = await fetch(`/api/workflows/${id}`);
      const data = await response.json();

      if (data.success) {
        setWorkflow(data.workflow);
        setNodes(data.workflow.nodes || []);
        setEdges(data.workflow.edges || []);
      }
    } catch (error) {
      console.error('Error loading workflow:', error);
    }
  };

  const saveWorkflow = async () => {
    try {
      setSaving(true);

      const payload = {
        ...workflow,
        nodes,
        edges
      };

      const url = id && id !== 'new' ? `/api/workflows/${id}` : '/api/workflows';
      const method = id && id !== 'new' ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.success) {
        alert('Workflow saved!');
        if (id === 'new') {
          navigate(`/workflows/${data.workflow.id}/edit`);
        }
      }
    } catch (error) {
      console.error('Error saving workflow:', error);
      alert('Failed to save workflow');
    } finally {
      setSaving(false);
    }
  };

  const testWorkflow = async () => {
    try {
      setTesting(true);

      const response = await fetch(`/api/workflows/${id}/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testData: {
            user: {
              id: 'test_user',
              email: 'test@example.com',
              name: 'Test User'
            }
          }
        })
      });

      const data = await response.json();

      if (data.success) {
        alert(`Test completed!\n\nExecuted ${data.result.executedActions?.length || 0} actions\n${data.result.errors ? `Errors: ${data.result.errors.length}` : 'No errors'}`);
      }
    } catch (error) {
      console.error('Error testing workflow:', error);
      alert('Failed to test workflow');
    } finally {
      setTesting(false);
    }
  };

  const toggleActive = async () => {
    try {
      const endpoint = workflow.isActive ? 'deactivate' : 'activate';
      const response = await fetch(`/api/workflows/${id}/${endpoint}`, {
        method: 'POST'
      });

      const data = await response.json();

      if (data.success) {
        setWorkflow({ ...workflow, isActive: !workflow.isActive });
      }
    } catch (error) {
      console.error('Error toggling workflow:', error);
    }
  };

  const addNode = (type) => {
    const newNode = {
      id: `node_${Date.now()}`,
      type,
      data: getDefaultNodeData(type),
      position: { x: 100 + nodes.length * 50, y: 100 + nodes.length * 50 }
    };

    setNodes([...nodes, newNode]);
  };

  const getDefaultNodeData = (type) => {
    switch (type) {
      case 'trigger':
        return { triggerType: 'user_signup', config: {} };
      case 'action':
        return { actionType: 'send_email', config: {} };
      case 'condition':
        return { condition: { field: '', operator: 'equals', value: '' } };
      case 'delay':
        return { delay: { value: 1, unit: 'minutes' } };
      default:
        return {};
    }
  };

  const deleteNode = (nodeId) => {
    setNodes(nodes.filter(n => n.id !== nodeId));
    setEdges(edges.filter(e => e.source !== nodeId && e.target !== nodeId));
    if (selectedNode?.id === nodeId) {
      setSelectedNode(null);
    }
  };

  const connectNodes = (sourceId, targetId) => {
    // Check if connection already exists
    const exists = edges.some(e => e.source === sourceId && e.target === targetId);
    if (exists) return;

    const newEdge = {
      id: `edge_${Date.now()}`,
      source: sourceId,
      target: targetId
    };

    setEdges([...edges, newEdge]);
  };

  if (!workflow) {
    return <div className="flex items-center justify-center h-screen bg-gray-900 text-white">Loading...</div>;
  }

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Left Sidebar - Node Palette */}
      <div className="w-64 bg-gray-800 border-r border-gray-700 overflow-y-auto p-4">
        <button
          onClick={() => navigate('/workflows')}
          className="w-full mb-4 px-3 py-2 text-left hover:bg-gray-700 rounded"
        >
          ← Back to Workflows
        </button>

        <h3 className="font-bold mb-4">Add Nodes</h3>

        <div className="space-y-2">
          {Object.entries(NODE_TYPES).map(([type, config]) => (
            <button
              key={type}
              onClick={() => addNode(type)}
              className={`w-full ${config.color} px-4 py-3 rounded hover:opacity-80 flex items-center gap-2`}
            >
              <span className="text-2xl">{config.icon}</span>
              <span className="font-bold">{config.label}</span>
            </button>
          ))}
        </div>

        <div className="mt-8 p-4 bg-gray-700 rounded">
          <h4 className="font-bold mb-2 text-sm">Quick Tips</h4>
          <ul className="text-xs text-gray-400 space-y-1">
            <li>• Click nodes to edit</li>
            <li>• Delete with ✕ button</li>
            <li>• Connect by clicking nodes</li>
            <li>• Save often!</li>
          </ul>
        </div>
      </div>

      {/* Main Canvas */}
      <div className="flex-1 flex flex-col">
        {/* Top Toolbar */}
        <div className="bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between">
          <div className="flex-1">
            <input
              type="text"
              value={workflow.name}
              onChange={(e) => setWorkflow({ ...workflow, name: e.target.value })}
              className="text-xl font-bold bg-transparent border-b border-transparent hover:border-gray-600 focus:border-orange-500 outline-none px-2 py-1"
            />
            <div className="mt-1">
              <input
                type="text"
                value={workflow.description || ''}
                onChange={(e) => setWorkflow({ ...workflow, description: e.target.value })}
                placeholder="Add description..."
                className="text-sm bg-transparent border-b border-transparent hover:border-gray-600 focus:border-orange-500 outline-none px-2 py-1 text-gray-400"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {id && id !== 'new' && (
              <>
                <button
                  onClick={testWorkflow}
                  disabled={testing}
                  className="px-4 py-2 bg-purple-500 rounded hover:bg-purple-600 disabled:opacity-50"
                >
                  {testing ? 'Testing...' : 'Test'}
                </button>

                <button
                  onClick={toggleActive}
                  className={`px-4 py-2 rounded ${
                    workflow.isActive
                      ? 'bg-green-500 hover:bg-green-600'
                      : 'bg-gray-600 hover:bg-gray-500'
                  }`}
                >
                  {workflow.isActive ? '✓ Active' : 'Inactive'}
                </button>
              </>
            )}

            <button
              onClick={saveWorkflow}
              disabled={saving}
              className="px-6 py-2 bg-orange-500 rounded hover:bg-orange-600 disabled:opacity-50 font-bold"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 overflow-auto bg-gray-950 bg-grid-pattern relative">
          {nodes.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">🤖</div>
                <h3 className="text-xl font-bold mb-2">Start Building Your Workflow</h3>
                <p className="text-gray-400">Add nodes from the left sidebar to get started</p>
              </div>
            </div>
          ) : (
            <div className="p-8 min-w-max min-h-max">
              {/* Render nodes */}
              {nodes.map((node, index) => (
                <WorkflowNode
                  key={node.id}
                  node={node}
                  index={index}
                  isSelected={selectedNode?.id === node.id}
                  onClick={() => {
                    setSelectedNode(node);
                    setShowNodeEditor(true);
                  }}
                  onDelete={() => deleteNode(node.id)}
                  onUpdate={(updates) => {
                    const updated = nodes.map(n =>
                      n.id === node.id ? { ...n, ...updates } : n
                    );
                    setNodes(updated);
                    if (selectedNode?.id === node.id) {
                      setSelectedNode({ ...node, ...updates });
                    }
                  }}
                />
              ))}

              {/* Render edges (connections) */}
              {edges.map(edge => (
                <div key={edge.id} className="text-xs text-gray-600 mt-2">
                  {edge.source} → {edge.target}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar - Node Editor */}
      {showNodeEditor && selectedNode && (
        <div className="w-96 bg-gray-800 border-l border-gray-700 overflow-y-auto p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Edit Node</h3>
            <button
              onClick={() => setShowNodeEditor(false)}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          <NodeEditor
            node={selectedNode}
            onChange={(updates) => {
              const updated = nodes.map(n =>
                n.id === selectedNode.id ? { ...n, ...updates } : n
              );
              setNodes(updated);
              setSelectedNode({ ...selectedNode, ...updates });
            }}
          />
        </div>
      )}
    </div>
  );
}

function WorkflowNode({ node, index, isSelected, onClick, onDelete, onUpdate }) {
  const config = NODE_TYPES[node.type];

  return (
    <div
      onClick={onClick}
      className={`inline-block mb-4 mr-4 ${config.color} rounded-lg p-4 cursor-pointer border-2 ${
        isSelected ? 'border-white' : 'border-transparent'
      } hover:border-gray-500 transition-all relative`}
      style={{
        minWidth: '200px'
      }}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="absolute top-1 right-1 w-6 h-6 bg-red-500 rounded-full text-white text-xs hover:bg-red-600"
      >
        ✕
      </button>

      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">{config.icon}</span>
        <div>
          <div className="font-bold">{config.label} {index + 1}</div>
          <div className="text-xs opacity-75">{getNodeDescription(node)}</div>
        </div>
      </div>
    </div>
  );
}

function getNodeDescription(node) {
  switch (node.type) {
    case 'trigger':
      return node.data.triggerType || 'Not configured';
    case 'action':
      return node.data.actionType || 'Not configured';
    case 'condition':
      return 'If/Then logic';
    case 'delay':
      return `Wait ${node.data.delay?.value} ${node.data.delay?.unit}`;
    default:
      return '';
  }
}

function NodeEditor({ node, onChange }) {
  const updateData = (key, value) => {
    onChange({
      data: {
        ...node.data,
        [key]: value
      }
    });
  };

  return (
    <div className="space-y-4">
      {node.type === 'trigger' && (
        <TriggerEditor data={node.data} onChange={updateData} />
      )}

      {node.type === 'action' && (
        <ActionEditor data={node.data} onChange={updateData} />
      )}

      {node.type === 'condition' && (
        <ConditionEditor data={node.data} onChange={updateData} />
      )}

      {node.type === 'delay' && (
        <DelayEditor data={node.data} onChange={updateData} />
      )}
    </div>
  );
}

function TriggerEditor({ data, onChange }) {
  const TRIGGERS = [
    { value: 'user_signup', label: 'User Signup' },
    { value: 'purchase_complete', label: 'Purchase Complete' },
    { value: 'course_completed', label: 'Course Completed' },
    { value: 'course_enrolled', label: 'Course Enrolled' },
    { value: 'form_submitted', label: 'Form Submitted' },
    { value: 'ticket_created', label: 'Support Ticket Created' },
    { value: 'schedule', label: 'Schedule (Time-based)' }
  ];

  return (
    <div>
      <label className="block text-sm font-bold mb-2">Trigger Type</label>
      <select
        value={data.triggerType}
        onChange={(e) => onChange('triggerType', e.target.value)}
        className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
      >
        <option value="">Select trigger...</option>
        {TRIGGERS.map(t => (
          <option key={t.value} value={t.value}>{t.label}</option>
        ))}
      </select>
    </div>
  );
}

function ActionEditor({ data, onChange }) {
  const ACTIONS = [
    { value: 'send_email', label: 'Send Email' },
    { value: 'send_sms', label: 'Send SMS' },
    { value: 'grant_course_access', label: 'Grant Course Access' },
    { value: 'add_tag', label: 'Add Tag' },
    { value: 'create_contact', label: 'Create Contact' },
    { value: 'update_user_field', label: 'Update User Field' },
    { value: 'log_message', label: 'Log Message' }
  ];

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-bold mb-2">Action Type</label>
        <select
          value={data.actionType}
          onChange={(e) => onChange('actionType', e.target.value)}
          className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
        >
          <option value="">Select action...</option>
          {ACTIONS.map(a => (
            <option key={a.value} value={a.value}>{a.label}</option>
          ))}
        </select>
      </div>

      {data.actionType === 'send_email' && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm mb-1">To</label>
            <input
              type="text"
              placeholder="{{user.email}}"
              value={data.config?.to || ''}
              onChange={(e) => onChange('config', { ...data.config, to: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Subject</label>
            <input
              type="text"
              placeholder="Welcome {{user.name}}!"
              value={data.config?.subject || ''}
              onChange={(e) => onChange('config', { ...data.config, subject: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Body</label>
            <textarea
              placeholder="Hi {{user.name}}, welcome to our platform!"
              value={data.config?.body || ''}
              onChange={(e) => onChange('config', { ...data.config, body: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
              rows="4"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function ConditionEditor({ data, onChange }) {
  const condition = data.condition || {};

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm mb-1">Field</label>
        <input
          type="text"
          placeholder="user.membershipTier"
          value={condition.field || ''}
          onChange={(e) => onChange('condition', { ...condition, field: e.target.value })}
          className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm mb-1">Operator</label>
        <select
          value={condition.operator || 'equals'}
          onChange={(e) => onChange('condition', { ...condition, operator: e.target.value })}
          className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
        >
          <option value="equals">Equals</option>
          <option value="not_equals">Not Equals</option>
          <option value="greater_than">Greater Than</option>
          <option value="less_than">Less Than</option>
          <option value="contains">Contains</option>
        </select>
      </div>

      <div>
        <label className="block text-sm mb-1">Value</label>
        <input
          type="text"
          placeholder="free"
          value={condition.value || ''}
          onChange={(e) => onChange('condition', { ...condition, value: e.target.value })}
          className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
        />
      </div>
    </div>
  );
}

function DelayEditor({ data, onChange }) {
  const delay = data.delay || { value: 1, unit: 'minutes' };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm mb-1">Wait Duration</label>
        <div className="flex gap-2">
          <input
            type="number"
            value={delay.value}
            onChange={(e) => onChange('delay', { ...delay, value: parseInt(e.target.value) })}
            className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2"
            min="1"
          />
          <select
            value={delay.unit}
            onChange={(e) => onChange('delay', { ...delay, unit: e.target.value })}
            className="bg-gray-700 border border-gray-600 rounded px-3 py-2"
          >
            <option value="seconds">Seconds</option>
            <option value="minutes">Minutes</option>
            <option value="hours">Hours</option>
            <option value="days">Days</option>
          </select>
        </div>
      </div>
    </div>
  );
}
