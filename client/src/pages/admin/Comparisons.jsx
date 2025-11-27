import React, { useState, useEffect } from 'react';
import comparisonsService from '../../services/comparisons';

export default function ComparisonsAdmin() {
  const [activeTab, setActiveTab] = useState('tools');
  const [tools, setTools] = useState([]);
  const [features, setFeatures] = useState([]);
  const [calculations, setCalculations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showToolForm, setShowToolForm] = useState(false);
  const [editingTool, setEditingTool] = useState(null);

  const [toolForm, setToolForm] = useState({
    name: '',
    category: '',
    logo: '',
    website: '',
    priceMonthly: '',
    priceYearly: '',
    features: [],
    limitations: [],
    ourEquivalent: '',
    order: 0,
    isActive: true
  });

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'tools') {
        const result = await comparisonsService.getAdminTools();
        setTools(result);
      } else if (activeTab === 'roi') {
        const result = await comparisonsService.getROICalculations({ limit: 100 });
        setCalculations(result.calculations);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTool = async (e) => {
    e.preventDefault();

    try {
      if (editingTool) {
        await comparisonsService.updateTool(editingTool.id, toolForm);
        alert('Tool updated successfully!');
      } else {
        await comparisonsService.createTool(toolForm);
        alert('Tool created successfully!');
      }

      setShowToolForm(false);
      setEditingTool(null);
      resetToolForm();
      loadData();
    } catch (error) {
      console.error('Failed to save tool:', error);
      alert('Failed to save tool');
    }
  };

  const handleDeleteTool = async (id) => {
    if (!confirm('Are you sure you want to delete this tool?')) return;

    try {
      await comparisonsService.deleteTool(id);
      alert('Tool deleted successfully!');
      loadData();
    } catch (error) {
      console.error('Failed to delete tool:', error);
      alert('Failed to delete tool');
    }
  };

  const handleEditTool = (tool) => {
    setEditingTool(tool);
    setToolForm(tool);
    setShowToolForm(true);
  };

  const resetToolForm = () => {
    setToolForm({
      name: '',
      category: '',
      logo: '',
      website: '',
      priceMonthly: '',
      priceYearly: '',
      features: [],
      limitations: [],
      ourEquivalent: '',
      order: 0,
      isActive: true
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Comparisons Manager</h1>
            <p className="text-gray-600 mt-1">Manage competitor tools and ROI calculations</p>
          </div>
          {activeTab === 'tools' && (
            <button
              onClick={() => {
                setShowToolForm(true);
                setEditingTool(null);
                resetToolForm();
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold"
            >
              + Add New Tool
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('tools')}
            className={`px-6 py-3 rounded-lg font-semibold ${
              activeTab === 'tools'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Competitor Tools
          </button>
          <button
            onClick={() => setActiveTab('roi')}
            className={`px-6 py-3 rounded-lg font-semibold ${
              activeTab === 'roi'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            ROI Calculations
          </button>
        </div>

        {/* Tool Form Modal */}
        {showToolForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b">
                <h2 className="text-2xl font-bold">
                  {editingTool ? 'Edit Tool' : 'Add New Tool'}
                </h2>
              </div>

              <form onSubmit={handleSaveTool} className="p-6 space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Tool Name *</label>
                    <input
                      type="text"
                      required
                      value={toolForm.name}
                      onChange={(e) => setToolForm({ ...toolForm, name: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Category *</label>
                    <select
                      required
                      value={toolForm.category}
                      onChange={(e) => setToolForm({ ...toolForm, category: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                    >
                      <option value="">Select category</option>
                      <option value="website_builder">Website Builder</option>
                      <option value="ecommerce">Ecommerce</option>
                      <option value="crm">CRM & Sales</option>
                      <option value="email_marketing">Email Marketing</option>
                      <option value="content_creation">Content Creation</option>
                      <option value="productivity">Productivity</option>
                      <option value="creative">Creative Tools</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Price Monthly (£) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={toolForm.priceMonthly}
                      onChange={(e) => setToolForm({ ...toolForm, priceMonthly: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Price Yearly (£)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={toolForm.priceYearly}
                      onChange={(e) => setToolForm({ ...toolForm, priceYearly: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Our Equivalent *</label>
                  <input
                    type="text"
                    required
                    value={toolForm.ourEquivalent}
                    onChange={(e) => setToolForm({ ...toolForm, ourEquivalent: e.target.value })}
                    placeholder="e.g., Website Builder, CRM System"
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Logo URL</label>
                    <input
                      type="url"
                      value={toolForm.logo}
                      onChange={(e) => setToolForm({ ...toolForm, logo: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Website</label>
                    <input
                      type="url"
                      value={toolForm.website}
                      onChange={(e) => setToolForm({ ...toolForm, website: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={toolForm.isActive}
                      onChange={(e) => setToolForm({ ...toolForm, isActive: e.target.checked })}
                      className="mr-2"
                    />
                    <span className="text-sm">Active</span>
                  </label>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold"
                  >
                    {editingTool ? 'Update Tool' : 'Create Tool'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowToolForm(false);
                      setEditingTool(null);
                      resetToolForm();
                    }}
                    className="px-6 py-3 border rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          </div>
        ) : (
          <>
            {activeTab === 'tools' && (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tool</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Our Equivalent</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {tools.map((tool) => (
                      <tr key={tool.id}>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            {tool.logo && <img src={tool.logo} alt="" className="w-8 h-8 mr-3 rounded" />}
                            <span className="font-medium">{tool.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm capitalize">{tool.category.replace('_', ' ')}</td>
                        <td className="px-6 py-4 text-sm font-semibold">£{tool.priceMonthly}/mo</td>
                        <td className="px-6 py-4 text-sm">{tool.ourEquivalent}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs rounded ${tool.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {tool.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-medium">
                          <button
                            onClick={() => handleEditTool(tool)}
                            className="text-purple-600 hover:text-purple-900 mr-4"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteTool(tool.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'roi' && (
              <div className="space-y-4">
                {calculations.map((calc) => (
                  <div key={calc.id} className="bg-white rounded-lg shadow p-6">
                    <div className="grid md:grid-cols-4 gap-4">
                      <div>
                        <div className="text-sm text-gray-600">Contact</div>
                        <div className="font-semibold">{calc.name || calc.email || 'Anonymous'}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(calc.calculatedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Current Cost</div>
                        <div className="text-xl font-bold text-red-600">£{calc.currentCost.toFixed(2)}/mo</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Monthly Savings</div>
                        <div className="text-xl font-bold text-green-600">£{calc.monthlySavings.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Yearly Savings</div>
                        <div className="text-xl font-bold text-purple-600">£{calc.yearlySavings.toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
