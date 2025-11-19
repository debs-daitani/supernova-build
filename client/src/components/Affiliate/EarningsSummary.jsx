/**
 * Earnings Summary Component
 * Shows affiliate earnings breakdown
 */

export default function EarningsSummary({ stats }) {
  if (!stats) return null;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-bold mb-4">Earnings Summary</h3>

      <div className="space-y-4">
        {/* Total Earnings */}
        <div className="flex justify-between items-center pb-4 border-b">
          <div>
            <div className="text-sm text-gray-600">Total Earnings</div>
            <div className="text-3xl font-bold text-green-600">
              £{stats.totalEarnings?.toFixed(2) || '0.00'}
            </div>
          </div>
          <div className="text-4xl">💰</div>
        </div>

        {/* Breakdown */}
        <div className="space-y-3">
          <EarningRow
            label="Pending"
            amount={stats.pendingEarnings || 0}
            color="yellow"
            icon="⏳"
            description="Awaiting 30-day approval period"
          />
          <EarningRow
            label="Available for Payout"
            amount={stats.paidEarnings || 0}
            color="green"
            icon="✓"
            description="Ready to withdraw (min. £50)"
          />
          <EarningRow
            label="Already Paid"
            amount={stats.paidEarnings || 0}
            color="blue"
            icon="💵"
            description="Total withdrawn"
          />
        </div>

        {/* This Month */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mt-4">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-sm text-purple-700 font-medium">This Month</div>
              <div className="text-2xl font-bold text-purple-900">
                £{stats.thisMonthEarnings?.toFixed(2) || '0.00'}
              </div>
            </div>
            <div className="text-3xl">📈</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EarningRow({ label, amount, color, icon, description }) {
  const colors = {
    yellow: 'text-yellow-600',
    green: 'text-green-600',
    blue: 'text-blue-600'
  };

  return (
    <div className="flex items-center gap-3">
      <span className="text-2xl">{icon}</span>
      <div className="flex-1">
        <div className="font-medium">{label}</div>
        {description && (
          <div className="text-xs text-gray-500">{description}</div>
        )}
      </div>
      <div className={`text-lg font-bold ${colors[color]}`}>
        £{amount.toFixed(2)}
      </div>
    </div>
  );
}
