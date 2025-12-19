'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Campaign {
  id: string;
  name: string;
  subject: string;
  status: string;
  sentCount: number;
  openCount: number;
  clickCount: number;
  createdAt: string;
  sentAt: string | null;
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const router = useRouter();

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

  const handleResetToDraft = async (campaignId: string) => {
    if (!confirm('Reset this campaign to draft status? This will clear all stats and queued emails.')) return;

    try {
      const response = await fetch(`/api/email/campaigns/${campaignId}/reset`, {
        method: 'POST',
      });

      if (response.ok) {
        await fetchCampaigns();
        setOpenMenuId(null);
      } else {
        alert('Failed to reset campaign');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to reset campaign');
    }
  };

  const handleDelete = async (campaignId: string, campaignName: string) => {
    if (!confirm(`Are you sure you want to delete "${campaignName}"? This cannot be undone.`)) return;

    try {
      const response = await fetch(`/api/email/campaigns/${campaignId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchCampaigns();
        setOpenMenuId(null);
      } else {
        alert('Failed to delete campaign');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to delete campaign');
    }
  };

  const handleDuplicate = async (campaignId: string) => {
    try {
      const response = await fetch(`/api/email/campaigns/${campaignId}/duplicate`, {
        method: 'POST',
      });

      if (response.ok) {
        const newCampaign = await response.json();
        await fetchCampaigns();
        router.push(`/email/campaigns/${newCampaign.id}`);
        setOpenMenuId(null);
      } else {
        alert('Failed to duplicate campaign');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to duplicate campaign');
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
    return ((campaign.openCount / campaign.sentCount) * 100).toFixed(1);
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
                  <td className="px-6 py-4 text-center text-white">{campaign.openCount}</td>
                  <td className="px-6 py-4 text-center text-white">{campaign.clickCount}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-green-400 font-semibold">{getOpenRate(campaign)}%</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="relative">
                      <button
                        onClick={() => setOpenMenuId(openMenuId === campaign.id ? null : campaign.id)}
                        className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold transition-all"
                      >
                        Actions ▾
                      </button>

                      {openMenuId === campaign.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-white/20 rounded-lg shadow-xl z-50">
                          <div className="py-1">
                            <Link
                              href={`/email/campaigns/${campaign.id}`}
                              className="block px-4 py-2 text-sm text-white hover:bg-white/10 transition-all"
                              onClick={() => setOpenMenuId(null)}
                            >
                              {campaign.status === 'draft' || campaign.status === 'DRAFT' ? 'Edit' : 'View'}
                            </Link>

                            {(campaign.status === 'sent' || campaign.status === 'SENT' || campaign.status === 'sending') && (
                              <button
                                onClick={() => handleResetToDraft(campaign.id)}
                                className="w-full text-left px-4 py-2 text-sm text-yellow-400 hover:bg-white/10 transition-all"
                              >
                                Reset to Draft
                              </button>
                            )}

                            <button
                              onClick={() => handleDuplicate(campaign.id)}
                              className="w-full text-left px-4 py-2 text-sm text-blue-400 hover:bg-white/10 transition-all"
                            >
                              Duplicate
                            </button>

                            <div className="border-t border-white/10 my-1"></div>

                            <button
                              onClick={() => handleDelete(campaign.id, campaign.name)}
                              className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/10 transition-all"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
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
