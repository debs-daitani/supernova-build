import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import comparisonsService from '../../services/comparisons';

export default function ROICalculator() {
  const navigate = useNavigate();
  const [selectedTools, setSelectedTools] = useState([]);
  const [customTool, setCustomTool] = useState({ name: '', monthly: '' });
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const commonTools = [
    { name: 'Wix / Squarespace', monthly: 30, category: 'Website' },
    { name: 'Shopify', monthly: 29, category: 'Ecommerce' },
    { name: 'Salesforce / HubSpot', monthly: 45, category: 'CRM' },
    { name: 'Mailchimp', monthly: 20, category: 'Email' },
    { name: 'ClickUp / Asana', monthly: 12, category: 'Tasks' },
    { name: 'Canva Pro', monthly: 10, category: 'Design' },
    { name: 'Calendly', monthly: 12, category: 'Scheduling' },
    { name: 'Typeform', monthly: 25, category: 'Forms' },
    { name: 'Google Workspace', monthly: 6, category: 'Productivity' },
    { name: 'Adobe Creative Cloud', monthly: 55, category: 'Creative' },
    { name: 'Zoom', monthly: 12, category: 'Video' },
    { name: 'vidIQ', monthly: 39, category: 'Video SEO' },
    { name: 'ManyChat', monthly: 15, category: 'Chatbot' },
    { name: 'Dropbox', monthly: 10, category: 'Storage' },
    { name: 'Buffer / Hootsuite', monthly: 15, category: 'Social Media' },
    { name: 'ConvertKit', monthly: 29, category: 'Email' },
  ];

  const toggleTool = (tool) => {
    setSelectedTools(prev => {
      const exists = prev.find(t => t.name === tool.name);
      if (exists) {
        return prev.filter(t => t.name !== tool.name);
      } else {
        return [...prev, tool];
      }
    });
  };

  const addCustomTool = () => {
    if (customTool.name && customTool.monthly) {
      setSelectedTools(prev => [...prev, {
        name: customTool.name,
        monthly: parseFloat(customTool.monthly),
        category: 'Custom'
      }]);
      setCustomTool({ name: '', monthly: '' });
    }
  };

  const removeTool = (toolName) => {
    setSelectedTools(prev => prev.filter(t => t.name !== toolName));
  };

  const calculateROI = async () => {
    if (selectedTools.length === 0) {
      alert('Please select at least one tool');
      return;
    }

    try {
      setLoading(true);
      const result = await comparisonsService.calculateROI({
        currentTools: selectedTools,
        email,
        name
      });
      setResults(result);
    } catch (error) {
      console.error('Failed to calculate ROI:', error);
      alert('Failed to calculate savings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const currentTotal = selectedTools.reduce((sum, tool) => sum + tool.monthly, 0);

  if (results) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          {/* Results Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">Your Savings Report</h1>
            <p className="text-xl text-gray-600">Here's how much you'll save with The dAItaniverse</p>
          </div>

          {/* Big Savings Number */}
          <div className="bg-white rounded-2xl shadow-2xl p-12 text-center mb-8">
            <div className="text-gray-600 text-xl mb-2">You're currently spending</div>
            <div className="text-4xl font-bold text-red-600 mb-6">
              £{results.currentCost.toFixed(2)}/month
            </div>

            <div className="text-6xl font-bold mb-2">↓</div>

            <div className="text-gray-600 text-xl mb-2">With The dAItaniverse</div>
            <div className="text-4xl font-bold text-green-600 mb-8">
              £{results.daitaniverseCost}/month
            </div>

            <div className="border-t-4 border-purple-600 pt-8">
              <div className="text-gray-600 text-2xl mb-2">Monthly Savings</div>
              <div className="text-7xl font-bold text-purple-600 mb-4">
                £{results.monthlySavings.toFixed(2)}
              </div>
              <div className="text-3xl font-semibold text-gray-900">
                ({results.percentageSaved}% discount!)
              </div>
            </div>
          </div>

          {/* Breakdown */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <div className="text-gray-600 mb-2">Yearly Savings</div>
              <div className="text-3xl font-bold text-green-600">
                £{results.yearlySavings.toFixed(2)}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <div className="text-gray-600 mb-2">5-Year Savings</div>
              <div className="text-3xl font-bold text-green-600">
                £{results.fiveYearSavings.toFixed(2)}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <div className="text-gray-600 mb-2">Tools Replaced</div>
              <div className="text-3xl font-bold text-purple-600">
                {results.toolsReplaced}
              </div>
            </div>
          </div>

          {/* What You're Replacing */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">What You're Replacing:</h3>
            <div className="space-y-3">
              {selectedTools.map((tool, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="font-medium text-gray-900">{tool.name}</span>
                  <span className="text-red-600 font-semibold">£{tool.monthly}/mo</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTAs */}
          <div className="text-center space-y-4">
            <button
              onClick={() => navigate('/signup')}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white px-12 py-6 rounded-lg text-2xl font-bold transition-colors shadow-lg"
            >
              Lock In These Savings - Start Free Trial
            </button>
            <button
              onClick={() => setResults(null)}
              className="w-full bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-300 px-12 py-4 rounded-lg text-lg font-semibold transition-colors"
            >
              Calculate Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Calculate Your Savings</h1>
          <p className="text-xl text-gray-600">
            See exactly how much you'll save by switching to The dAItaniverse
          </p>
        </div>

        {/* Running Total */}
        {currentTotal > 0 && (
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg p-6 mb-8 shadow-xl">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm text-purple-100">Current Monthly Spend</div>
                <div className="text-4xl font-bold">£{currentTotal.toFixed(2)}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-purple-100">With dAItaniverse</div>
                <div className="text-4xl font-bold">£26.00</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-green-300">You'll Save</div>
                <div className="text-4xl font-bold text-yellow-300">
                  £{(currentTotal - 26).toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Step 1 */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Step 1: What tools do you currently use?
            </h2>
            <p className="text-gray-600 mb-6">Select all that apply:</p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {commonTools.map((tool, index) => {
                const isSelected = selectedTools.find(t => t.name === tool.name);
                return (
                  <button
                    key={index}
                    onClick={() => toggleTool(tool)}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      isSelected
                        ? 'border-purple-600 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-semibold text-gray-900">{tool.name}</div>
                        <div className="text-sm text-gray-500">{tool.category}</div>
                      </div>
                      <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                        isSelected ? 'bg-purple-600 border-purple-600' : 'border-gray-300'
                      }`}>
                        {isSelected && (
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <div className="text-red-600 font-bold mt-2">£{tool.monthly}/mo</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Tool */}
          <div className="mb-8 p-6 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Add a custom tool:</h3>
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Tool name"
                value={customTool.name}
                onChange={(e) => setCustomTool({ ...customTool, name: e.target.value })}
                className="flex-1 px-4 py-2 border rounded-lg"
              />
              <input
                type="number"
                placeholder="Monthly cost"
                value={customTool.monthly}
                onChange={(e) => setCustomTool({ ...customTool, monthly: e.target.value })}
                className="w-32 px-4 py-2 border rounded-lg"
              />
              <button
                onClick={addCustomTool}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold"
              >
                Add
              </button>
            </div>
          </div>

          {/* Selected Tools */}
          {selectedTools.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Selected Tools:</h3>
              <div className="space-y-2">
                {selectedTools.map((tool, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                    <span className="font-medium text-gray-900">{tool.name}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-red-600 font-semibold">£{tool.monthly}/mo</span>
                      <button
                        onClick={() => removeTool(tool.name)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Email Capture (Optional) */}
          <div className="mb-8 p-6 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              📧 Email me my savings report (optional)
            </h3>
            <p className="text-sm text-gray-600 mb-4">We'll send you a detailed breakdown you can share with your team</p>
            <div className="grid md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="px-4 py-2 border rounded-lg"
              />
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="px-4 py-2 border rounded-lg"
              />
            </div>
          </div>

          {/* Calculate Button */}
          <button
            onClick={calculateROI}
            disabled={loading || selectedTools.length === 0}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-12 py-6 rounded-lg text-2xl font-bold transition-colors shadow-lg"
          >
            {loading ? 'Calculating...' : 'Calculate My Savings'}
          </button>
        </div>
      </div>
    </div>
  );
}
