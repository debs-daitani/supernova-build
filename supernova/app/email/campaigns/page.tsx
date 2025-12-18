'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Campaign {
  id: string;
  name: string;
  subject: string;
  status: string;
  sentCount: number;
  openedCount: number;
  clickedCount: number;
  createdAt: string;
  sentAt: string | null;
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const res = await fetch('/api/email/campaigns');
      const data = await res.json();
      setCampaigns(data);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'text-gray-400';
      case 'SCHEDULED': return 'text-yellow-400';
      case 'SENDING': return 'text-blue-400';
      case 'SENT': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const getOpenRate = (campaign: Campaign) => {
    if (campaign.sentCount === 0) return '0';
    return ((campaign.openedCount / campaign.sentCount) * 100).toFixed(1);
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
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: 'Supernova, sans-serif', color: '#FF008E' }}>
              Email Campaigns
            </h1>
            <p className="text-gray-300">Create and manage your email broadcasts</p>
          </div>
          <Link
            href="/email/campaigns/create"
            className="px-6 py-3 rounded-lg font-semibold transition-all"
            style={{ background: 'linear-gradient(135deg, #FF008E, #00F0E9)', color: '#000' }}
          >
            + Create Campaign
          </Link>
        </div>

        {/* Campaigns Table */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Campaign</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Status</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">Sent</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">Opens</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">Clicks</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">Open Rate</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {campaigns.map((campaign) => (
                <tr key={campaign.id} className="hover:bg-white/5">
                  <td className="px-6 py-4">
                    <Link href={`/email/campaigns/${campaign.id}`} className="block hover:opacity-80">
                      <p className="font-medium text-white">{campaign.name}</p>
                      <p className="text-sm text-gray-400">{campaign.subject}</p>
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-sm font-semibold ${getStatusColor(campaign.status)}`}>
                      {campaign.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-white">{campaign.sentCount}</td>
                  <td className="px-6 py-4 text-center text-white">{campaign.openedCount}</td>
                  <td className="px-6 py-4 text-center text-white">{campaign.clickedCount}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-green-400 font-semibold">{getOpenRate(campaign)}%</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      {campaign.status === 'draft' && (
                        <Link
                          href={`/email/campaigns/${campaign.id}`}
                          className="text-sm hover:underline font-semibold"
                          style={{ color: '#FF008E' }}
                        >
                          Edit & Send
                        </Link>
                      )}
                      {campaign.status === 'sent' && (
                        <Link
                          href={`/email/campaigns/${campaign.id}/stats`}
                          className="text-sm hover:underline"
                          style={{ color: '#00F0E9' }}
                        >
                          View Stats
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {campaigns.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-400 text-lg">No campaigns yet. Create your first campaign!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
