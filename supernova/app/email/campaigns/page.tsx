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
  const [menuPosition, setMenuPosition] = useState<{ top: number; right: number } | null>(null);
  const router = useRouter();

  const handleMenuClick = (campaignId: string, event: React.MouseEvent<HTMLButtonElement>) => {
    if (openMenuId === campaignId) {
      setOpenMenuId(null);
      setMenuPosition(null);
    } else {
      const rect = event.currentTarget.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + window.scrollY,
        right: window.innerWidth - rect.right
      });
      setOpenMenuId(campaignId);
    }
  };

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

  const handleResend = async (campaignId: string, campaignName: string) => {
    const campaign = campaigns.find(c => c.id === campaignId);
    if (!campaign) return;

    const subscriberCount = campaign.sentCount || 0;
    if (!confirm(`Resend "${campaignName}" to all active subscribers?`)) return;

    try {
      const response = await fetch(`/api/email/campaigns/${campaignId}/send`, {
        method: 'POST',
      });

      if (response.ok) {
        alert('Campaign is being sent! Emails are being queued and will be sent automatically.');
        await fetchCampaigns();
        setOpenMenuId(null);
        setMenuPosition(null);
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to send campaign');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to send campaign');
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
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl overflow-x-auto">
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
                    <button
                      onClick={(e) => handleMenuClick(campaign.id, e)}
                      className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold transition-all"
                    >
                      Actions ▾
                    </button>
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

        {/* Dropdown Menu Portal */}
        {openMenuId && menuPosition && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => {
                setOpenMenuId(null);
                setMenuPosition(null);
              }}
            />
            <div
              className="fixed w-56 rounded-xl shadow-2xl z-50 overflow-hidden"
              style={{
                top: `${menuPosition.top + 4}px`,
                right: `${menuPosition.right}px`,
                background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.98), rgba(31, 41, 55, 0.98))',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 0, 142, 0.3)'
              }}
            >
              {campaigns.find(c => c.id === openMenuId) && (
                <div className="py-1">
                  <Link
                    href={`/email/campaigns/${openMenuId}`}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-white hover:bg-gradient-to-r hover:from-pink-500/10 hover:to-cyan-500/10 transition-all font-medium"
                    onClick={() => {
                      setOpenMenuId(null);
                      setMenuPosition(null);
                    }}
                  >
                    <span className="text-base">{campaigns.find(c => c.id === openMenuId)?.status === 'draft' || campaigns.find(c => c.id === openMenuId)?.status === 'DRAFT' ? '✏️' : '👁️'}</span>
                    <span>{campaigns.find(c => c.id === openMenuId)?.status === 'draft' || campaigns.find(c => c.id === openMenuId)?.status === 'DRAFT' ? 'Edit' : 'View'}</span>
                  </Link>

                  {(campaigns.find(c => c.id === openMenuId)?.status === 'sent' ||
                    campaigns.find(c => c.id === openMenuId)?.status === 'SENT' ||
                    campaigns.find(c => c.id === openMenuId)?.status === 'sending') && (
                    <button
                      onClick={() => handleResend(openMenuId, campaigns.find(c => c.id === openMenuId)?.name || '')}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-gradient-to-r hover:from-pink-500/10 hover:to-cyan-500/10 transition-all font-medium"
                      style={{ color: '#00F0E9' }}
                    >
                      <span className="text-base">📧</span>
                      <span>Resend</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleDuplicate(openMenuId)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-cyan-400 hover:bg-gradient-to-r hover:from-pink-500/10 hover:to-cyan-500/10 transition-all font-medium"
                  >
                    <span className="text-base">📋</span>
                    <span>Duplicate</span>
                  </button>

                  {(campaigns.find(c => c.id === openMenuId)?.status === 'sent' ||
                    campaigns.find(c => c.id === openMenuId)?.status === 'SENT' ||
                    campaigns.find(c => c.id === openMenuId)?.status === 'sending') && (
                    <button
                      onClick={() => handleResetToDraft(openMenuId)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-yellow-400 hover:bg-gradient-to-r hover:from-pink-500/10 hover:to-cyan-500/10 transition-all font-medium"
                    >
                      <span className="text-base">🔄</span>
                      <span>Reset to Draft</span>
                    </button>
                  )}

                  <div className="my-1" style={{ height: '1px', background: 'linear-gradient(90deg, rgba(255,0,142,0.3), rgba(0,240,233,0.3))' }}></div>

                  <button
                    onClick={() => handleDelete(openMenuId, campaigns.find(c => c.id === openMenuId)?.name || '')}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/20 transition-all font-medium"
                  >
                    <span className="text-base">🗑️</span>
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
