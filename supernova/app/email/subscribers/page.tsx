'use client';

import { useState, useEffect } from 'react';

interface Subscriber {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  status: string;
  source: string;
  subscribedAt: string;
  lists: any[];
}

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    try {
      const res = await fetch('/api/email/subscribers');
      const data = await res.json();
      setSubscribers(data);
    } catch (error) {
      console.error('Error fetching subscribers:', error);
    } finally {
      setLoading(false);
    }
  };

  const addSubscriber = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/email/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newEmail,
          firstName: newFirstName,
          lastName: newLastName,
          source: 'MANUAL'
        })
      });

      if (res.ok) {
        setShowAddModal(false);
        setNewEmail('');
        setNewFirstName('');
        setNewLastName('');
        fetchSubscribers();
      }
    } catch (error) {
      console.error('Error adding subscriber:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUBSCRIBED': return 'text-green-400';
      case 'UNSUBSCRIBED': return 'text-red-400';
      case 'BOUNCED': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: 'Supernova, sans-serif', color: '#FF008E' }}>
              Subscribers
            </h1>
            <p className="text-gray-300">Manage all your email subscribers</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 rounded-lg font-semibold"
            style={{ background: 'linear-gradient(135deg, #FF008E, #00F0E9)', color: '#000' }}
          >
            + Add Subscriber
          </button>
        </div>

        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Source</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Lists</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Subscribed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {subscribers.map((sub) => (
                <tr key={sub.id} className="hover:bg-white/5">
                  <td className="px-6 py-4 text-white">{sub.email}</td>
                  <td className="px-6 py-4 text-white">
                    {[sub.firstName, sub.lastName].filter(Boolean).join(' ') || '-'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-sm font-semibold ${getStatusColor(sub.status)}`}>
                      {sub.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-300 text-sm">{sub.source}</td>
                  <td className="px-6 py-4 text-gray-300 text-sm">{sub.lists?.length || 0}</td>
                  <td className="px-6 py-4 text-gray-300 text-sm">
                    {new Date(sub.subscribedAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gray-900 border border-white/20 rounded-xl p-8 max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold mb-6 text-white">Add Subscriber</h2>
              <form onSubmit={addSubscriber}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email *</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">First Name</label>
                  <input
                    type="text"
                    value={newFirstName}
                    onChange={(e) => setNewFirstName(e.target.value)}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Last Name</label>
                  <input
                    type="text"
                    value={newLastName}
                    onChange={(e) => setNewLastName(e.target.value)}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 rounded-lg font-semibold"
                    style={{ background: 'linear-gradient(135deg, #FF008E, #00F0E9)', color: '#000' }}
                  >
                    Add
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
