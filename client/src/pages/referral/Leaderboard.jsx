import React, { useState, useEffect } from 'react';
import referralsService from '../../services/referrals';
import useAuthStore from '../../stores/authStore';

export default function Leaderboard() {
  const { user } = useAuthStore();
  const [period, setPeriod] = useState('all');
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState(null);

  useEffect(() => {
    loadLeaderboard();
  }, [period]);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const data = await referralsService.getLeaderboard(period);
      setLeaderboard(data);

      // Find user's rank
      const rank = data.findIndex(item => item.userId === user?.id);
      setUserRank(rank >= 0 ? rank + 1 : null);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMedalIcon = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getPrize = (rank) => {
    if (rank === 1) return 'Lifetime free + £500 cash';
    if (rank === 2) return '1 year free + £300 cash';
    if (rank === 3) return '6 months free + £100 cash';
    if (rank <= 10) return '3 months free';
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-4">Referral Leaderboard</h1>
            <p className="text-2xl text-purple-100 mb-8">
              See how you stack up against top referrers
            </p>

            {userRank && (
              <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-lg p-6 inline-block">
                <div className="text-purple-100 mb-2">Your Current Rank</div>
                <div className="text-6xl font-bold">{getMedalIcon(userRank)}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Period Toggle */}
      <div className="bg-white border-b sticky top-0 z-10 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-center gap-4">
            <button
              onClick={() => setPeriod('month')}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                period === 'month'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => setPeriod('all')}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                period === 'all'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Time
            </button>
          </div>
        </div>
      </div>

      {/* Prizes */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 text-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-5xl mb-3">🥇</div>
            <div className="text-2xl font-bold mb-2">#1 Prize</div>
            <div className="text-yellow-100">Lifetime FREE</div>
            <div className="text-yellow-100">+ £500 cash</div>
          </div>

          <div className="bg-gradient-to-br from-gray-300 to-gray-500 text-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-5xl mb-3">🥈</div>
            <div className="text-2xl font-bold mb-2">#2 Prize</div>
            <div className="text-gray-100">1 year FREE</div>
            <div className="text-gray-100">+ £300 cash</div>
          </div>

          <div className="bg-gradient-to-br from-orange-400 to-orange-600 text-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-5xl mb-3">🥉</div>
            <div className="text-2xl font-bold mb-2">#3 Prize</div>
            <div className="text-orange-100">6 months FREE</div>
            <div className="text-orange-100">+ £100 cash</div>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            </div>
          ) : (
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase">Rank</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase">User</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-900 uppercase">Referrals</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-900 uppercase">Prize</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {leaderboard.slice(0, 50).map((item, index) => {
                  const rank = index + 1;
                  const isCurrentUser = item.userId === user?.id;
                  const prize = getPrize(rank);

                  return (
                    <tr
                      key={item.id}
                      className={`${
                        isCurrentUser ? 'bg-purple-50 border-l-4 border-purple-600' : 'hover:bg-gray-50'
                      } transition-colors`}
                    >
                      <td className="px-6 py-4">
                        <div className="text-2xl font-bold text-gray-900">
                          {getMedalIcon(rank)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {item.user.avatar ? (
                            <img
                              src={item.user.avatar}
                              alt={item.user.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                              <span className="text-purple-600 font-semibold">
                                {item.user.name.charAt(0)}
                              </span>
                            </div>
                          )}
                          <div>
                            <div className={`font-semibold ${isCurrentUser ? 'text-purple-600' : 'text-gray-900'}`}>
                              {item.user.name}
                              {isCurrentUser && <span className="ml-2 text-sm">(You)</span>}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="text-2xl font-bold text-purple-600">{item.conversions}</div>
                        <div className="text-xs text-gray-500">{item.clicks} clicks</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {prize ? (
                          <div className="text-sm font-semibold text-green-600">{prize}</div>
                        ) : (
                          <div className="text-sm text-gray-400">-</div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
