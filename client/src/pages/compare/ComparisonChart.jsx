import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import comparisonsService from '../../services/comparisons';

export default function ComparisonChart() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    loadData();
  }, [selectedCategory]);

  const loadData = async () => {
    try {
      setLoading(true);
      const params = selectedCategory !== 'all' ? { category: selectedCategory } : {};
      const result = await comparisonsService.getTools(params);
      setData(result);
    } catch (error) {
      console.error('Failed to load comparison data:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 'all', name: 'All Tools', icon: '🌟' },
    { id: 'website_builder', name: 'Website Builder', icon: '🌐' },
    { id: 'ecommerce', name: 'Ecommerce', icon: '🛒' },
    { id: 'crm', name: 'CRM & Sales', icon: '💼' },
    { id: 'email_marketing', name: 'Email Marketing', icon: '📧' },
    { id: 'content_creation', name: 'Content Creation', icon: '🎨' },
    { id: 'productivity', name: 'Productivity', icon: '✅' },
    { id: 'creative', name: 'Creative Tools', icon: '🖌️' },
  ];

  const formatPrice = (price) => {
    return `£${price.toFixed(2)}/mo`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading comparison...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-4">
              One Platform. {data?.tools.length || '40+'}+ Tools Replaced.
            </h1>
            <p className="text-2xl text-purple-100 mb-8">
              See exactly what you're getting - and how much you're saving
            </p>
            {data?.summary && (
              <div className="bg-white text-gray-900 rounded-lg p-8 inline-block">
                <div className="text-6xl font-bold text-green-600 mb-2">
                  {formatPrice(data.summary.monthlySavings)}
                </div>
                <div className="text-xl font-semibold">saved every month</div>
                <div className="text-gray-600 mt-2">
                  That's {formatPrice(data.summary.yearlySavings)} per year!
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="bg-white border-b sticky top-0 z-10 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedCategory === category.id
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="mr-2">{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider w-1/3">
                    Feature / Tool
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-purple-600 uppercase tracking-wider">
                    dAItaniverse<br />
                    <span className="text-2xl">£26/mo</span>
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-900 uppercase tracking-wider">
                    Competitors<br />
                    <span className="text-xs font-normal">Individual Prices</span>
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-green-600 uppercase tracking-wider">
                    You Save
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data?.tools.map((tool, index) => (
                  <tr key={tool.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {tool.logo && (
                          <img src={tool.logo} alt={tool.name} className="w-8 h-8 mr-3 rounded" />
                        )}
                        <div>
                          <div className="font-semibold text-gray-900">{tool.ourEquivalent}</div>
                          <div className="text-sm text-gray-500 capitalize">{tool.category.replace('_', ' ')}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full">
                        <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">Included</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="font-semibold text-gray-900">{tool.name}</div>
                      <div className="text-red-600 font-bold">{formatPrice(tool.priceMonthly)}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {formatPrice(tool.priceMonthly)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                <tr>
                  <td className="px-6 py-6 font-bold text-xl">TOTAL:</td>
                  <td className="px-6 py-6 text-center">
                    <div className="text-3xl font-bold">£26/month</div>
                    <div className="text-purple-100 text-sm">Everything included</div>
                  </td>
                  <td className="px-6 py-6 text-center">
                    <div className="text-3xl font-bold">{formatPrice(data?.summary.totalMonthly || 0)}</div>
                    <div className="text-purple-100 text-sm">If bought separately</div>
                  </td>
                  <td className="px-6 py-6 text-center">
                    <div className="text-4xl font-bold text-yellow-300">
                      {formatPrice(data?.summary.monthlySavings || 0)}
                    </div>
                    <div className="text-purple-100 text-sm font-semibold">
                      saved every month!
                    </div>
                    <div className="text-yellow-300 text-lg mt-2">
                      ({data?.summary.percentageSaved || 0}% discount!)
                    </div>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-12 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Save {formatPrice(data?.summary.monthlySavings || 0)}?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of entrepreneurs who've switched to The dAItaniverse
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/signup')}
              className="bg-purple-600 hover:bg-purple-700 text-white px-12 py-4 rounded-lg text-xl font-bold transition-colors shadow-lg"
            >
              Start Free Trial
            </button>
            <button
              onClick={() => navigate('/compare/calculator')}
              className="bg-white hover:bg-gray-50 text-purple-600 border-2 border-purple-600 px-12 py-4 rounded-lg text-xl font-bold transition-colors"
            >
              Calculate Your Savings
            </button>
          </div>
        </div>

        {/* Value Props */}
        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <div className="text-center p-6 bg-white rounded-lg shadow">
            <div className="text-5xl mb-4">💰</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">96% Savings</h3>
            <p className="text-gray-600">
              Get everything you need for a fraction of the cost
            </p>
          </div>
          <div className="text-center p-6 bg-white rounded-lg shadow">
            <div className="text-5xl mb-4">⚡</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">All-in-One</h3>
            <p className="text-gray-600">
              No more juggling 40+ different subscriptions
            </p>
          </div>
          <div className="text-center p-6 bg-white rounded-lg shadow">
            <div className="text-5xl mb-4">🚀</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Start Free</h3>
            <p className="text-gray-600">
              Try everything risk-free with our 14-day trial
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
