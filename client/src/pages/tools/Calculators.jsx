import { useState } from 'react';

export default function Calculators() {
  const [activeCalculator, setActiveCalculator] = useState('pricing');

  const calculators = [
    { id: 'pricing', name: 'Pricing Calculator', icon: '💰', description: 'Calculate your pricing with margins' },
    { id: 'profit', name: 'Profit Margin', icon: '📊', description: 'Calculate profit margins' },
    { id: 'roi', name: 'ROI Calculator', icon: '📈', description: 'Calculate return on investment' },
    { id: 'breakeven', name: 'Break-Even', icon: '⚖️', description: 'Find your break-even point' },
    { id: 'hourly', name: 'Hourly Rate', icon: '⏰', description: 'Calculate your hourly rate' },
    { id: 'tax', name: 'UK Tax Estimator', icon: '💷', description: 'Estimate UK income tax' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Financial Calculators</h1>
        <p className="text-gray-600">Helpful tools for pricing, profits, and financial planning</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calculator Menu */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-4 sticky top-4">
            <h2 className="font-bold mb-4">Calculators</h2>
            <div className="space-y-2">
              {calculators.map((calc) => (
                <button
                  key={calc.id}
                  onClick={() => setActiveCalculator(calc.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    activeCalculator === calc.id
                      ? 'bg-pink-600 text-white'
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{calc.icon}</span>
                    <div>
                      <div className="font-medium text-sm">{calc.name}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Calculator Content */}
        <div className="lg:col-span-3">
          {activeCalculator === 'pricing' && <PricingCalculator />}
          {activeCalculator === 'profit' && <ProfitMarginCalculator />}
          {activeCalculator === 'roi' && <ROICalculator />}
          {activeCalculator === 'breakeven' && <BreakEvenCalculator />}
          {activeCalculator === 'hourly' && <HourlyRateCalculator />}
          {activeCalculator === 'tax' && <TaxEstimator />}
        </div>
      </div>
    </div>
  );
}

function PricingCalculator() {
  const [cost, setCost] = useState('');
  const [margin, setMargin] = useState('30');
  const [markup, setMarkup] = useState('');

  const calculatePricing = () => {
    const costNum = parseFloat(cost) || 0;
    const marginNum = parseFloat(margin) || 0;
    const markupNum = parseFloat(markup) || 0;

    if (marginNum > 0) {
      const price = costNum / (1 - marginNum / 100);
      const actualMarkup = ((price - costNum) / costNum * 100);
      return { price, margin: marginNum, markup: actualMarkup };
    } else if (markupNum > 0) {
      const price = costNum * (1 + markupNum / 100);
      const actualMargin = ((price - costNum) / price * 100);
      return { price, margin: actualMargin, markup: markupNum };
    }
    return { price: 0, margin: 0, markup: 0 };
  };

  const result = calculatePricing();

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">💰 Pricing Calculator</h2>

      <div className="space-y-4 mb-6">
        <div>
          <label className="label">Your Cost (£)</label>
          <input
            type="number"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            placeholder="100.00"
            className="input w-full"
            min="0"
            step="0.01"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Profit Margin (%)</label>
            <input
              type="number"
              value={margin}
              onChange={(e) => { setMargin(e.target.value); setMarkup(''); }}
              placeholder="30"
              className="input w-full"
              min="0"
              max="100"
            />
          </div>
          <div>
            <label className="label">OR Markup (%)</label>
            <input
              type="number"
              value={markup}
              onChange={(e) => { setMarkup(e.target.value); setMargin(''); }}
              placeholder="42.86"
              className="input w-full"
              min="0"
            />
          </div>
        </div>
      </div>

      {cost && (margin || markup) && (
        <div className="bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg p-6 text-white">
          <p className="text-pink-100 text-sm mb-2">Your Selling Price</p>
          <p className="text-4xl font-bold mb-4">£{result.price.toFixed(2)}</p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-pink-100">Profit Margin</p>
              <p className="font-bold">{result.margin.toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-pink-100">Markup</p>
              <p className="font-bold">{result.markup.toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-pink-100">Your Cost</p>
              <p className="font-bold">£{parseFloat(cost).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-pink-100">Your Profit</p>
              <p className="font-bold">£{(result.price - parseFloat(cost)).toFixed(2)}</p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-50 rounded-lg text-sm">
        <p className="font-semibold mb-2">💡 Understanding Margin vs Markup:</p>
        <ul className="list-disc list-inside space-y-1 text-gray-700">
          <li><strong>Margin</strong> = (Price - Cost) / Price × 100</li>
          <li><strong>Markup</strong> = (Price - Cost) / Cost × 100</li>
          <li>A 30% margin ≈ 42.86% markup</li>
        </ul>
      </div>
    </div>
  );
}

function ProfitMarginCalculator() {
  const [revenue, setRevenue] = useState('');
  const [cost, setCost] = useState('');

  const profit = (parseFloat(revenue) || 0) - (parseFloat(cost) || 0);
  const margin = revenue ? (profit / parseFloat(revenue) * 100).toFixed(2) : 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">📊 Profit Margin Calculator</h2>

      <div className="space-y-4 mb-6">
        <div>
          <label className="label">Revenue (£)</label>
          <input
            type="number"
            value={revenue}
            onChange={(e) => setRevenue(e.target.value)}
            placeholder="1000.00"
            className="input w-full"
            min="0"
            step="0.01"
          />
        </div>
        <div>
          <label className="label">Cost (£)</label>
          <input
            type="number"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            placeholder="700.00"
            className="input w-full"
            min="0"
            step="0.01"
          />
        </div>
      </div>

      {revenue && cost && (
        <div className="space-y-4">
          <div className={`rounded-lg p-6 ${profit >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
            <p className="text-gray-600 text-sm mb-2">Profit</p>
            <p className={`text-4xl font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              £{profit.toFixed(2)}
            </p>
          </div>
          <div className="bg-pink-50 rounded-lg p-6">
            <p className="text-gray-600 text-sm mb-2">Profit Margin</p>
            <p className="text-4xl font-bold text-pink-600">{margin}%</p>
          </div>
        </div>
      )}
    </div>
  );
}

function ROICalculator() {
  const [investment, setInvestment] = useState('');
  const [returns, setReturns] = useState('');

  const roi = investment ? (((parseFloat(returns) || 0) - parseFloat(investment)) / parseFloat(investment) * 100).toFixed(2) : 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">📈 ROI Calculator</h2>

      <div className="space-y-4 mb-6">
        <div>
          <label className="label">Initial Investment (£)</label>
          <input
            type="number"
            value={investment}
            onChange={(e) => setInvestment(e.target.value)}
            placeholder="5000.00"
            className="input w-full"
            min="0"
            step="0.01"
          />
        </div>
        <div>
          <label className="label">Total Returns (£)</label>
          <input
            type="number"
            value={returns}
            onChange={(e) => setReturns(e.target.value)}
            placeholder="7500.00"
            className="input w-full"
            min="0"
            step="0.01"
          />
        </div>
      </div>

      {investment && returns && (
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg p-6 text-white">
          <p className="text-green-100 text-sm mb-2">Return on Investment</p>
          <p className="text-4xl font-bold mb-4">{roi}%</p>
          <div className="text-sm">
            <p className="text-green-100">Net Gain: £{((parseFloat(returns) || 0) - parseFloat(investment)).toFixed(2)}</p>
          </div>
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-50 rounded-lg text-sm">
        <p className="font-semibold mb-2">💡 ROI Benchmarks:</p>
        <ul className="list-disc list-inside space-y-1 text-gray-700">
          <li>10-15%: Good ROI</li>
          <li>20-30%: Great ROI</li>
          <li>30%+: Excellent ROI</li>
        </ul>
      </div>
    </div>
  );
}

function BreakEvenCalculator() {
  const [fixedCosts, setFixedCosts] = useState('');
  const [pricePerUnit, setPricePerUnit] = useState('');
  const [costPerUnit, setCostPerUnit] = useState('');

  const breakEvenUnits = (pricePerUnit && costPerUnit && parseFloat(pricePerUnit) > parseFloat(costPerUnit))
    ? (parseFloat(fixedCosts) / (parseFloat(pricePerUnit) - parseFloat(costPerUnit))).toFixed(0)
    : 0;
  const breakEvenRevenue = (breakEvenUnits * parseFloat(pricePerUnit)).toFixed(2);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">⚖️ Break-Even Calculator</h2>

      <div className="space-y-4 mb-6">
        <div>
          <label className="label">Fixed Costs (£)</label>
          <input
            type="number"
            value={fixedCosts}
            onChange={(e) => setFixedCosts(e.target.value)}
            placeholder="10000.00"
            className="input w-full"
            min="0"
            step="0.01"
          />
        </div>
        <div>
          <label className="label">Price Per Unit (£)</label>
          <input
            type="number"
            value={pricePerUnit}
            onChange={(e) => setPricePerUnit(e.target.value)}
            placeholder="50.00"
            className="input w-full"
            min="0"
            step="0.01"
          />
        </div>
        <div>
          <label className="label">Variable Cost Per Unit (£)</label>
          <input
            type="number"
            value={costPerUnit}
            onChange={(e) => setCostPerUnit(e.target.value)}
            placeholder="20.00"
            className="input w-full"
            min="0"
            step="0.01"
          />
        </div>
      </div>

      {fixedCosts && pricePerUnit && costPerUnit && breakEvenUnits > 0 && (
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-6 text-white">
          <p className="text-purple-100 text-sm mb-2">Break-Even Point</p>
          <p className="text-4xl font-bold mb-4">{breakEvenUnits} units</p>
          <p className="text-purple-100 text-sm">Revenue needed: £{breakEvenRevenue}</p>
        </div>
      )}
    </div>
  );
}

function HourlyRateCalculator() {
  const [annualIncome, setAnnualIncome] = useState('');
  const [hoursPerWeek, setHoursPerWeek] = useState('40');
  const [weeksPerYear, setWeeksPerYear] = useState('48');

  const totalHours = (parseFloat(hoursPerWeek) || 0) * (parseFloat(weeksPerYear) || 0);
  const hourlyRate = totalHours > 0 ? ((parseFloat(annualIncome) || 0) / totalHours).toFixed(2) : 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">⏰ Hourly Rate Calculator</h2>

      <div className="space-y-4 mb-6">
        <div>
          <label className="label">Desired Annual Income (£)</label>
          <input
            type="number"
            value={annualIncome}
            onChange={(e) => setAnnualIncome(e.target.value)}
            placeholder="50000"
            className="input w-full"
            min="0"
          />
        </div>
        <div>
          <label className="label">Billable Hours Per Week</label>
          <input
            type="number"
            value={hoursPerWeek}
            onChange={(e) => setHoursPerWeek(e.target.value)}
            placeholder="40"
            className="input w-full"
            min="1"
          />
        </div>
        <div>
          <label className="label">Working Weeks Per Year</label>
          <input
            type="number"
            value={weeksPerYear}
            onChange={(e) => setWeeksPerYear(e.target.value)}
            placeholder="48"
            className="input w-full"
            min="1"
            max="52"
          />
        </div>
      </div>

      {annualIncome && hoursPerWeek && weeksPerYear && (
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
          <p className="text-blue-100 text-sm mb-2">Your Hourly Rate</p>
          <p className="text-4xl font-bold mb-4">£{hourlyRate}/hour</p>
          <p className="text-blue-100 text-sm">
            Based on {totalHours} billable hours per year
          </p>
        </div>
      )}
    </div>
  );
}

function TaxEstimator() {
  const [income, setIncome] = useState('');

  const calculateTax = () => {
    const incomeNum = parseFloat(income) || 0;
    let incomeTax = 0;

    if (incomeNum > 12570) {
      const basicRateTaxable = Math.min(incomeNum - 12570, 50270 - 12570);
      incomeTax += basicRateTaxable * 0.20;

      if (incomeNum > 50270) {
        const higherRateTaxable = Math.min(incomeNum - 50270, 125140 - 50270);
        incomeTax += higherRateTaxable * 0.40;

        if (incomeNum > 125140) {
          const additionalRateTaxable = incomeNum - 125140;
          incomeTax += additionalRateTaxable * 0.45;
        }
      }
    }

    const effectiveRate = incomeNum > 0 ? (incomeTax / incomeNum * 100).toFixed(2) : 0;
    const takeHome = incomeNum - incomeTax;

    return { incomeTax, effectiveRate, takeHome };
  };

  const result = calculateTax();

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">💷 UK Tax Estimator (2024/25)</h2>

      <div className="mb-6">
        <label className="label">Annual Income (£)</label>
        <input
          type="number"
          value={income}
          onChange={(e) => setIncome(e.target.value)}
          placeholder="50000"
          className="input w-full"
          min="0"
        />
      </div>

      {income && (
        <div className="space-y-4">
          <div className="bg-red-50 rounded-lg p-6">
            <p className="text-gray-600 text-sm mb-2">Estimated Income Tax</p>
            <p className="text-4xl font-bold text-red-600">£{result.incomeTax.toFixed(2)}</p>
            <p className="text-sm text-gray-600 mt-2">Effective rate: {result.effectiveRate}%</p>
          </div>
          <div className="bg-green-50 rounded-lg p-6">
            <p className="text-gray-600 text-sm mb-2">Take-Home Pay</p>
            <p className="text-4xl font-bold text-green-600">£{result.takeHome.toFixed(2)}</p>
          </div>
        </div>
      )}

      <div className="mt-6 p-4 bg-yellow-50 rounded-lg text-sm">
        <p className="font-semibold mb-2">⚠️ Note:</p>
        <p className="text-gray-700">
          This is a basic estimate for Income Tax only. It does not include National Insurance,
          student loan repayments, pension contributions, or other deductions.
          For accurate calculations, please consult an accountant.
        </p>
      </div>
    </div>
  );
}
