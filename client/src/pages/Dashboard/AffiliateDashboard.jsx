/**
 * Affiliate Dashboard
 * Main dashboard for affiliates to track performance and earnings
 */

import { useState, useEffect } from 'react';

export default function AffiliateDashboard() {
  const [stats, setStats] = useState(null);
  const [profile, setProfile] = useState(null);
  const [referrals, setReferrals] = useState([]);
  const [commissions, setCommissions] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [payoutAmount, setPayoutAmount] = useState('');
  const [showPayoutModal, setShowPayoutModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [profileRes, statsRes, referralsRes, commissionsRes, payoutsRes] = await Promise.all([
        fetch('/api/affiliate/my-profile'),
        fetch('/api/affiliate/my-stats'),
        fetch('/api/affiliate/my-referrals?limit=10'),
        fetch('/api/affiliate/my-commissions?limit=20'),
        fetch('/api/affiliate/my-payouts?limit=10')
      ]);

      const [profileData, statsData, referralsData, commissionsData, payoutsData] = await Promise.all([
        profileRes.json(),
        statsRes.json(),
        referralsRes.json(),
        commissionsRes.json(),
        payoutsRes.json()
      ]);

      setProfile(profileData);
      setStats(statsData);
      setReferrals(referralsData.referrals || []);
      setCommissions(commissionsData.commissions || []);
      setPayouts(payoutsData.payouts || []);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const requestPayout = async () => {
    try {
      const amount = parseFloat(payoutAmount);
      if (isNaN(amount) || amount < 50) {
        alert('Minimum payout is £50');
        return;
      }

      const response = await fetch('/api/affiliate/request-payout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
      });

      const data = await response.json();

      if (response.ok) {
        alert('Payout requested successfully!');
        setShowPayoutModal(false);
        setPayoutAmount('');
        loadData(); // Refresh data
      } else {
        alert(data.error || 'Failed to request payout');
      }
    } catch (error) {
      console.error('Error requesting payout:', error);
      alert('Failed to request payout');
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

  if (!profile) {
    return (
      <div className="max-w-7xl mx-auto p-8">
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-8 text-center">
          <div className="text-4xl mb-4">🎯</div>
          <h2 className="text-2xl font-bold mb-4">You're Not an Affiliate Yet</h2>
          <p className="text-gray-600 mb-6">
            Join our affiliate program to start earning recurring commissions
          </p>
          <button
            onClick={() => window.location.href = '/affiliate-program'}
            className="bg-orange-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-orange-600"
          >
            Learn More & Join
          </button>
        </div>
      </div>
    );
  }

  const availableBalance = stats?.stats?.pendingEarnings || 0;

  return (
    <div className="max-w-7xl mx-auto p-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Affiliate Dashboard</h1>
        <p className="text-gray-600">
          Welcome back! Track your performance and earnings below.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Earnings"
          value={`£${stats?.stats?.totalEarnings?.toFixed(2) || '0.00'}`}
          icon="💰"
          color="green"
        />
        <StatCard
          title="Pending"
          value={`£${stats?.stats?.pendingEarnings?.toFixed(2) || '0.00'}`}
          icon="⏳"
          color="yellow"
        />
        <StatCard
          title="Active Referrals"
          value={stats?.stats?.activeReferrals || 0}
          icon="👥"
          color="blue"
        />
        <StatCard
          title="This Month"
          value={`£${stats?.stats?.thisMonthEarnings?.toFixed(2) || '0.00'}`}
          icon="📈"
          color="purple"
        />
      </div>

      {/* Tier Badge & Quick Stats */}
      <div className="bg-gradient-to-r from-orange-500 to-pink-500 rounded-lg p-6 text-white mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="text-sm text-orange-100 mb-1">Current Tier</div>
            <div className="text-3xl font-bold">{profile.tier}</div>
            <div className="text-orange-100 mt-1">
              {profile.commissionRate * 100}% commission rate
            </div>
          </div>
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold">{stats?.stats?.totalClicks || 0}</div>
              <div className="text-orange-100 text-sm">Total Clicks</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{stats?.stats?.totalSignups || 0}</div>
              <div className="text-orange-100 text-sm">Signups</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{stats?.stats?.conversionRate || 0}%</div>
              <div className="text-orange-100 text-sm">Conversion</div>
            </div>
          </div>
        </div>
      </div>

      {/* Referral Link */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Your Referral Link</h2>
        <div className="flex gap-3">
          <input
            type="text"
            value={profile.referralLink}
            readOnly
            className="flex-1 px-4 py-3 border rounded-lg bg-gray-50 font-mono text-sm"
          />
          <button
            onClick={() => copyToClipboard(profile.referralLink)}
            className="bg-orange-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-orange-600 transition-all"
          >
            Copy Link
          </button>
        </div>
        <div className="mt-4 flex gap-3">
          <button
            onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(profile.referralLink)}&text=Check out The dAItaniverse!`, '_blank')}
            className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-all"
          >
            Share on Twitter
          </button>
          <button
            onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(profile.referralLink)}`, '_blank')}
            className="flex-1 bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-all"
          >
            Share on Facebook
          </button>
          <button
            onClick={() => window.location.href = '/dashboard/affiliate/materials'}
            className="flex-1 bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-all"
          >
            Get Marketing Materials
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b mb-6">
        <div className="flex gap-6 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'referrals', label: `Referrals (${referrals.length})` },
            { id: 'commissions', label: `Commissions (${commissions.length})` },
            { id: 'payouts', label: `Payouts (${payouts.length})` }
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
          {/* Recent Referrals */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-bold mb-4">Recent Referrals</h3>
            {stats?.recentReferrals?.length > 0 ? (
              <div className="space-y-3">
                {stats.recentReferrals.slice(0, 5).map(referral => (
                  <ReferralRow key={referral.id} referral={referral} />
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No referrals yet. Start sharing your link!</p>
            )}
          </div>

          {/* Recent Commissions */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-bold mb-4">Recent Commissions</h3>
            {stats?.recentCommissions?.length > 0 ? (
              <div className="space-y-3">
                {stats.recentCommissions.slice(0, 5).map(commission => (
                  <CommissionRow key={commission.id} commission={commission} />
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No commissions yet</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'referrals' && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-bold mb-4">All Referrals</h3>
          {referrals.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr className="text-left">
                    <th className="pb-3">User</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Signed Up</th>
                    <th className="pb-3">Total Value</th>
                  </tr>
                </thead>
                <tbody>
                  {referrals.map(referral => (
                    <tr key={referral.id} className="border-b">
                      <td className="py-3">{referral.referredUser?.email || 'N/A'}</td>
                      <td className="py-3">
                        <StatusBadge status={referral.status} />
                      </td>
                      <td className="py-3">
                        {new Date(referral.signupDate).toLocaleDateString()}
                      </td>
                      <td className="py-3 font-bold">£{referral.totalValue.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No referrals yet</p>
          )}
        </div>
      )}

      {activeTab === 'commissions' && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-bold mb-4">Commission History</h3>
          {commissions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr className="text-left">
                    <th className="pb-3">Date</th>
                    <th className="pb-3">Description</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {commissions.map(commission => (
                    <tr key={commission.id} className="border-b">
                      <td className="py-3">
                        {new Date(commission.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3">{commission.description}</td>
                      <td className="py-3">
                        <StatusBadge status={commission.status} />
                      </td>
                      <td className="py-3 font-bold text-green-600">
                        £{commission.amount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No commissions yet</p>
          )}
        </div>
      )}

      {activeTab === 'payouts' && (
        <div className="space-y-6">
          {/* Payout Request Card */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg p-6 text-white">
            <h3 className="text-xl font-bold mb-2">Available Balance</h3>
            <div className="text-4xl font-bold mb-4">£{availableBalance.toFixed(2)}</div>
            <p className="text-green-100 mb-4">Minimum payout: £50.00</p>
            <button
              onClick={() => setShowPayoutModal(true)}
              disabled={availableBalance < 50}
              className="bg-white text-green-600 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Request Payout
            </button>
          </div>

          {/* Payout History */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-bold mb-4">Payout History</h3>
            {payouts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr className="text-left">
                      <th className="pb-3">Date</th>
                      <th className="pb-3">Amount</th>
                      <th className="pb-3">Method</th>
                      <th className="pb-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payouts.map(payout => (
                      <tr key={payout.id} className="border-b">
                        <td className="py-3">
                          {new Date(payout.requestedAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 font-bold">£{payout.amount.toFixed(2)}</td>
                        <td className="py-3">{payout.method}</td>
                        <td className="py-3">
                          <StatusBadge status={payout.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No payouts yet</p>
            )}
          </div>
        </div>
      )}

      {/* Payout Modal */}
      {showPayoutModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-2xl font-bold mb-4">Request Payout</h3>
            <p className="text-gray-600 mb-4">
              Available balance: <strong>£{availableBalance.toFixed(2)}</strong>
            </p>
            <div className="mb-4">
              <label className="block font-medium mb-2">Amount (£)</label>
              <input
                type="number"
                min="50"
                max={availableBalance}
                step="0.01"
                value={payoutAmount}
                onChange={(e) => setPayoutAmount(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="50.00"
              />
              <p className="text-sm text-gray-500 mt-1">Minimum: £50.00</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowPayoutModal(false)}
                className="flex-1 bg-gray-200 px-4 py-3 rounded-lg font-medium hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={requestPayout}
                className="flex-1 bg-orange-500 text-white px-4 py-3 rounded-lg font-bold hover:bg-orange-600"
              >
                Request
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function StatCard({ title, value, icon, color }) {
  const colors = {
    green: 'from-green-500 to-emerald-500',
    yellow: 'from-yellow-500 to-orange-500',
    blue: 'from-blue-500 to-cyan-500',
    purple: 'from-purple-500 to-pink-500'
  };

  return (
    <div className={`bg-gradient-to-br ${colors[color]} rounded-lg p-6 text-white shadow-lg`}>
      <div className="flex justify-between items-start mb-2">
        <div className="text-sm opacity-90">{title}</div>
        <div className="text-2xl">{icon}</div>
      </div>
      <div className="text-3xl font-bold">{value}</div>
    </div>
  );
}

function ReferralRow({ referral }) {
  return (
    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
      <div>
        <div className="font-medium">{referral.referredUser?.email || 'User'}</div>
        <div className="text-sm text-gray-500">
          {new Date(referral.signupDate).toLocaleDateString()}
        </div>
      </div>
      <StatusBadge status={referral.status} />
    </div>
  );
}

function CommissionRow({ commission }) {
  return (
    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
      <div>
        <div className="font-medium">{commission.description}</div>
        <div className="text-sm text-gray-500">
          {new Date(commission.createdAt).toLocaleDateString()}
        </div>
      </div>
      <div className="text-right">
        <div className="font-bold text-green-600">£{commission.amount.toFixed(2)}</div>
        <StatusBadge status={commission.status} small />
      </div>
    </div>
  );
}

function StatusBadge({ status, small }) {
  const styles = {
    SIGNED_UP: 'bg-blue-100 text-blue-700',
    TRIAL: 'bg-purple-100 text-purple-700',
    SUBSCRIBED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-red-100 text-red-700',
    REFUNDED: 'bg-gray-100 text-gray-700',
    PENDING: 'bg-yellow-100 text-yellow-700',
    APPROVED: 'bg-green-100 text-green-700',
    PAID: 'bg-blue-100 text-blue-700',
    COMPLETED: 'bg-green-100 text-green-700',
    PROCESSING: 'bg-yellow-100 text-yellow-700',
    FAILED: 'bg-red-100 text-red-700'
  };

  return (
    <span className={`${styles[status] || 'bg-gray-100 text-gray-700'} px-2 py-1 rounded text-xs font-medium ${small ? 'text-xs' : ''}`}>
      {status}
    </span>
  );
}
