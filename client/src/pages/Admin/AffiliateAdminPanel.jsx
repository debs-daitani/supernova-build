/**
 * Affiliate Admin Panel
 * Admin interface for managing affiliate program
 */

import { useState, useEffect } from 'react';

export default function AffiliateAdminPanel() {
  const [activeTab, setActiveTab] = useState('overview');
  const [analytics, setAnalytics] = useState(null);
  const [affiliates, setAffiliates] = useState([]);
  const [pendingPayouts, setPendingPayouts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [analyticsRes, affiliatesRes, payoutsRes] = await Promise.all([
        fetch('/api/affiliate/admin/analytics'),
        fetch('/api/affiliate/admin/affiliates?limit=50'),
        fetch('/api/affiliate/admin/payouts/pending')
      ]);

      const [analyticsData, affiliatesData, payoutsData] = await Promise.all([
        analyticsRes.json(),
        affiliatesRes.json(),
        payoutsRes.json()
      ]);

      setAnalytics(analyticsData);
      setAffiliates(affiliatesData.affiliates || []);
      setPendingPayouts(payoutsData.payouts || []);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const processPayout = async (payoutId, transactionId) => {
    try {
      const response = await fetch(`/api/affiliate/admin/payouts/${payoutId}/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId })
      });

      if (response.ok) {
        alert('Payout processed successfully!');
        loadData(); // Refresh
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to process payout');
      }
    } catch (error) {
      console.error('Error processing payout:', error);
      alert('Failed to process payout');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Affiliate Program Admin</h1>
        <p className="text-gray-600">
          Manage affiliates, process payouts, and view program analytics
        </p>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <AnalyticsCard
            title="Total Affiliates"
            value={analytics.affiliates.total}
            subtitle={`${analytics.affiliates.active} active`}
            icon="👥"
            color="blue"
          />
          <AnalyticsCard
            title="Total Referrals"
            value={analytics.referrals.total}
            icon="🎯"
            color="green"
          />
          <AnalyticsCard
            title="Pending Payouts"
            value={`£${analytics.payouts.pending.toFixed(2)}`}
            subtitle={`${pendingPayouts.length} requests`}
            icon="⏳"
            color="yellow"
          />
          <AnalyticsCard
            title="Total Paid"
            value={`£${analytics.payouts.completed.toFixed(2)}`}
            icon="💰"
            color="purple"
          />
        </div>
      )}

      {/* Tabs */}
      <div className="border-b mb-6">
        <div className="flex gap-6 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'affiliates', label: `Affiliates (${affiliates.length})` },
            { id: 'payouts', label: `Pending Payouts (${pendingPayouts.length})` }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-2 font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-orange-500 text-orange-500'
                  : 'border-transparent text-gray-600 hover:text-orange-500'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Recent Affiliates */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-bold mb-4">Recent Affiliates</h3>
            {affiliates.slice(0, 10).length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr className="text-left">
                      <th className="pb-3">Affiliate</th>
                      <th className="pb-3">Code</th>
                      <th className="pb-3">Tier</th>
                      <th className="pb-3">Referrals</th>
                      <th className="pb-3">Earnings</th>
                    </tr>
                  </thead>
                  <tbody>
                    {affiliates.slice(0, 10).map(affiliate => (
                      <tr key={affiliate.id} className="border-b">
                        <td className="py-3">
                          <div className="font-medium">{affiliate.user.name || 'N/A'}</div>
                          <div className="text-sm text-gray-500">{affiliate.user.email}</div>
                        </td>
                        <td className="py-3 font-mono text-sm">{affiliate.affiliateCode}</td>
                        <td className="py-3">
                          <TierBadge tier={affiliate.tier} />
                        </td>
                        <td className="py-3">{affiliate._count.referrals}</td>
                        <td className="py-3 font-bold text-green-600">
                          £{affiliate.totalEarnings.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No affiliates yet</p>
            )}
          </div>

          {/* Pending Payouts Summary */}
          {pendingPayouts.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                <span>⚠️</span>
                {pendingPayouts.length} Pending Payouts Require Attention
              </h3>
              <p className="text-gray-600 mb-4">
                Total pending: £{pendingPayouts.reduce((sum, p) => sum + p.amount, 0).toFixed(2)}
              </p>
              <button
                onClick={() => setActiveTab('payouts')}
                className="bg-orange-500 text-white px-6 py-2 rounded-lg font-bold hover:bg-orange-600"
              >
                Review Payouts
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'affiliates' && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-bold mb-4">All Affiliates</h3>
          {affiliates.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr className="text-left">
                    <th className="pb-3">Affiliate</th>
                    <th className="pb-3">Code</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Tier</th>
                    <th className="pb-3">Referrals</th>
                    <th className="pb-3">Commissions</th>
                    <th className="pb-3">Total Earnings</th>
                    <th className="pb-3">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {affiliates.map(affiliate => (
                    <tr key={affiliate.id} className="border-b hover:bg-gray-50">
                      <td className="py-3">
                        <div className="font-medium">{affiliate.user.name || 'N/A'}</div>
                        <div className="text-sm text-gray-500">{affiliate.user.email}</div>
                      </td>
                      <td className="py-3 font-mono text-sm">{affiliate.affiliateCode}</td>
                      <td className="py-3">
                        <StatusBadge status={affiliate.status} />
                      </td>
                      <td className="py-3">
                        <TierBadge tier={affiliate.tier} />
                      </td>
                      <td className="py-3">{affiliate._count.referrals}</td>
                      <td className="py-3">{affiliate._count.commissions}</td>
                      <td className="py-3 font-bold text-green-600">
                        £{affiliate.totalEarnings.toFixed(2)}
                      </td>
                      <td className="py-3 text-sm text-gray-500">
                        {new Date(affiliate.joinedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No affiliates yet</p>
          )}
        </div>
      )}

      {activeTab === 'payouts' && (
        <div className="space-y-6">
          {pendingPayouts.length > 0 ? (
            pendingPayouts.map(payout => (
              <PayoutCard
                key={payout.id}
                payout={payout}
                onProcess={processPayout}
              />
            ))
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
              <div className="text-4xl mb-4">✅</div>
              <h3 className="text-xl font-bold mb-2">No Pending Payouts</h3>
              <p className="text-gray-600">All payouts have been processed</p>
            </div>
          )}
        </div>
      )}

    </div>
  );
}

function AnalyticsCard({ title, value, subtitle, icon, color }) {
  const colors = {
    blue: 'from-blue-500 to-cyan-500',
    green: 'from-green-500 to-emerald-500',
    yellow: 'from-yellow-500 to-orange-500',
    purple: 'from-purple-500 to-pink-500'
  };

  return (
    <div className={`bg-gradient-to-br ${colors[color]} rounded-lg p-6 text-white shadow-lg`}>
      <div className="flex justify-between items-start mb-2">
        <div className="text-sm opacity-90">{title}</div>
        <div className="text-2xl">{icon}</div>
      </div>
      <div className="text-3xl font-bold mb-1">{value}</div>
      {subtitle && <div className="text-sm opacity-90">{subtitle}</div>}
    </div>
  );
}

function PayoutCard({ payout, onProcess }) {
  const [transactionId, setTransactionId] = useState('');
  const [showProcessForm, setShowProcessForm] = useState(false);

  const handleProcess = () => {
    if (!transactionId.trim()) {
      alert('Please enter transaction ID');
      return;
    }
    onProcess(payout.id, transactionId);
    setShowProcessForm(false);
    setTransactionId('');
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <div>
          <h3 className="text-xl font-bold mb-1">
            {payout.affiliate.user.name || 'Affiliate'}
          </h3>
          <p className="text-gray-600">{payout.affiliate.user.email}</p>
          <p className="text-sm text-gray-500 mt-1">
            Code: <span className="font-mono">{payout.affiliate.affiliateCode}</span>
          </p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-green-600">
            £{payout.amount.toFixed(2)}
          </div>
          <div className="text-sm text-gray-500">
            {payout.commissionCount} commissions
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <span className="text-gray-600">Method:</span>{' '}
          <span className="font-medium">{payout.method}</span>
        </div>
        <div>
          <span className="text-gray-600">Payment Email:</span>{' '}
          <span className="font-medium">{payout.paymentEmail || 'N/A'}</span>
        </div>
        <div>
          <span className="text-gray-600">Requested:</span>{' '}
          <span className="font-medium">
            {new Date(payout.requestedAt).toLocaleDateString()}
          </span>
        </div>
        <div>
          <span className="text-gray-600">Status:</span>{' '}
          <StatusBadge status={payout.status} />
        </div>
      </div>

      {showProcessForm ? (
        <div className="bg-gray-50 rounded-lg p-4">
          <label className="block text-sm font-medium mb-2">
            Transaction ID (from PayPal, Stripe, etc.)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              placeholder="TXN-123456789"
              className="flex-1 px-4 py-2 border rounded-lg"
            />
            <button
              onClick={handleProcess}
              className="bg-green-500 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-600"
            >
              Confirm
            </button>
            <button
              onClick={() => setShowProcessForm(false)}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowProcessForm(true)}
          className="w-full bg-orange-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-orange-600 transition-all"
        >
          Process Payout
        </button>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    ACTIVE: 'bg-green-100 text-green-700',
    PENDING: 'bg-yellow-100 text-yellow-700',
    SUSPENDED: 'bg-red-100 text-red-700',
    CLOSED: 'bg-gray-100 text-gray-700'
  };

  return (
    <span className={`${styles[status] || 'bg-gray-100 text-gray-700'} px-2 py-1 rounded text-xs font-medium`}>
      {status}
    </span>
  );
}

function TierBadge({ tier }) {
  const styles = {
    BRONZE: 'bg-orange-100 text-orange-700',
    SILVER: 'bg-gray-100 text-gray-700',
    GOLD: 'bg-yellow-100 text-yellow-700'
  };

  return (
    <span className={`${styles[tier] || 'bg-gray-100 text-gray-700'} px-2 py-1 rounded text-xs font-medium`}>
      {tier}
    </span>
  );
}
