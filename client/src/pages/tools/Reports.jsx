import { useState, useEffect } from 'react';
import { accountingReports } from '../../services/api';
import toast from 'react-hot-toast';

export default function Reports() {
  const [activeTab, setActiveTab] = useState('profit-loss');
  const [profitLossData, setProfitLossData] = useState(null);
  const [taxData, setTaxData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });
  const [taxYear, setTaxYear] = useState(new Date().getFullYear());

  useEffect(() => {
    if (activeTab === 'profit-loss') {
      loadProfitLoss();
    } else {
      loadTaxReport();
    }
  }, [activeTab, dateRange, taxYear]);

  const loadProfitLoss = async () => {
    setLoading(true);
    try {
      const response = await accountingReports.profitLoss({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      });
      setProfitLossData(response.data);
    } catch (error) {
      console.error('Error loading P&L report:', error);
      toast.error('Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  const loadTaxReport = async () => {
    setLoading(true);
    try {
      const response = await accountingReports.tax({ year: taxYear });
      setTaxData(response.data);
    } catch (error) {
      console.error('Error loading tax report:', error);
      toast.error('Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Financial Reports</h1>
        <p className="text-gray-600">View your profit & loss and tax estimates</p>
      </div>

      {/* Tabs */}
      <div className="border-b mb-6">
        <nav className="flex gap-4">
          <button
            onClick={() => setActiveTab('profit-loss')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'profit-loss'
                ? 'border-b-2 border-pink-600 text-pink-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📊 Profit & Loss
          </button>
          <button
            onClick={() => setActiveTab('tax')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'tax'
                ? 'border-b-2 border-pink-600 text-pink-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            💷 Tax Estimate (UK)
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
        </div>
      ) : activeTab === 'profit-loss' ? (
        <ProfitLossReport data={profitLossData} dateRange={dateRange} setDateRange={setDateRange} />
      ) : (
        <TaxReport data={taxData} taxYear={taxYear} setTaxYear={setTaxYear} />
      )}
    </div>
  );
}

function ProfitLossReport({ data, dateRange, setDateRange }) {
  if (!data) return null;

  const netProfit = data.totalIncome - data.totalExpenses;
  const profitMargin = data.totalIncome > 0 ? (netProfit / data.totalIncome * 100).toFixed(1) : 0;

  return (
    <div className="space-y-6">
      {/* Date Range Filter */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Start Date</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className="input w-full"
            />
          </div>
          <div>
            <label className="label">End Date</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className="input w-full"
            />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-600 text-sm mb-1">Total Income</p>
          <p className="text-3xl font-bold text-green-600">£{data.totalIncome.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-600 text-sm mb-1">Total Expenses</p>
          <p className="text-3xl font-bold text-red-600">£{data.totalExpenses.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-600 text-sm mb-1">Net Profit</p>
          <p className={`text-3xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            £{netProfit.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-1">{profitMargin}% margin</p>
        </div>
      </div>

      {/* Income Breakdown */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Income</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <span className="font-medium">Total Income</span>
            <span className="font-bold text-green-600">£{data.totalIncome.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Expenses Breakdown */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Expenses by Category</h2>
        {data.expensesByCategory && Object.keys(data.expensesByCategory).length > 0 ? (
          <div className="space-y-3">
            {Object.entries(data.expensesByCategory)
              .sort(([, a], [, b]) => b - a)
              .map(([category, amount]) => {
                const percentage = data.totalExpenses > 0 ? (amount / data.totalExpenses * 100).toFixed(1) : 0;
                return (
                  <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <span className="font-medium">{category}</span>
                      <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-pink-600 h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                    <div className="ml-4 text-right">
                      <p className="font-bold text-red-600">£{amount.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">{percentage}%</p>
                    </div>
                  </div>
                );
              })}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No expenses in this period</p>
        )}
      </div>
    </div>
  );
}

function TaxReport({ data, taxYear, setTaxYear }) {
  if (!data) return null;

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <div className="space-y-6">
      {/* Tax Year Selector */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <label className="label">Tax Year (April 6 - April 5)</label>
        <select
          value={taxYear}
          onChange={(e) => setTaxYear(parseInt(e.target.value))}
          className="input w-full md:w-64"
        >
          {years.map((year) => (
            <option key={year} value={year}>
              {year}/{(year + 1).toString().slice(-2)} (6 Apr {year} - 5 Apr {year + 1})
            </option>
          ))}
        </select>
      </div>

      {/* Tax Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold mb-4">Income Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Income</span>
              <span className="font-bold">£{data.totalIncome.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tax-Deductible Expenses</span>
              <span className="font-bold text-red-600">-£{data.deductibleExpenses.toLocaleString()}</span>
            </div>
            <div className="flex justify-between pt-3 border-t">
              <span className="font-bold">Taxable Income</span>
              <span className="font-bold text-pink-600">£{data.taxableIncome.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold mb-4">Tax Estimate</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Income Tax</span>
              <span className="font-bold">£{data.incomeTax.toLocaleString()}</span>
            </div>
            {data.nationalInsurance && (
              <div className="flex justify-between">
                <span className="text-gray-600">National Insurance</span>
                <span className="font-bold">£{data.nationalInsurance.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between pt-3 border-t">
              <span className="font-bold">Total Tax</span>
              <span className="font-bold text-pink-600">
                £{((data.incomeTax || 0) + (data.nationalInsurance || 0)).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Effective Rate</span>
              <span className="font-medium">{data.effectiveTaxRate}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tax Bands Breakdown */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold mb-4">UK Income Tax Bands (2024/25)</h3>
        <div className="space-y-3">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between mb-1">
              <span className="font-medium">Personal Allowance</span>
              <span>£0 - £12,570</span>
            </div>
            <p className="text-sm text-gray-600">Tax rate: 0%</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex justify-between mb-1">
              <span className="font-medium">Basic Rate</span>
              <span>£12,571 - £50,270</span>
            </div>
            <p className="text-sm text-gray-600">Tax rate: 20%</p>
          </div>
          <div className="p-4 bg-orange-50 rounded-lg">
            <div className="flex justify-between mb-1">
              <span className="font-medium">Higher Rate</span>
              <span>£50,271 - £125,140</span>
            </div>
            <p className="text-sm text-gray-600">Tax rate: 40%</p>
          </div>
          <div className="p-4 bg-red-50 rounded-lg">
            <div className="flex justify-between mb-1">
              <span className="font-medium">Additional Rate</span>
              <span>Over £125,140</span>
            </div>
            <p className="text-sm text-gray-600">Tax rate: 45%</p>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          <strong>⚠️ Note:</strong> This is an estimate based on UK Income Tax bands for 2024/25.
          It does not include student loan repayments, dividend tax, or other factors.
          Please consult with a qualified accountant for accurate tax calculations.
        </p>
      </div>
    </div>
  );
}
