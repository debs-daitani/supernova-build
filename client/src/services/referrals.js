import api from './api';

const referralsService = {
  // ============================================
  // PUBLIC ENDPOINTS
  // ============================================

  // Track referral click
  trackClick: async (code) => {
    const response = await api.get(`/referrals/track/${code}`);
    return response.data;
  },

  // Get leaderboard
  getLeaderboard: async (period = 'all') => {
    const response = await api.get(`/referrals/leaderboard?period=${period}`);
    return response.data;
  },

  // ============================================
  // USER ENDPOINTS
  // ============================================

  // Get user's referral code
  getMyCode: async () => {
    const response = await api.get('/referrals/my-code');
    return response.data;
  },

  // Get dashboard stats
  getDashboard: async () => {
    const response = await api.get('/referrals/dashboard');
    return response.data;
  },

  // Get user's rewards
  getRewards: async () => {
    const response = await api.get('/referrals/rewards');
    return response.data;
  },

  // Redeem reward
  redeemReward: async (rewardId) => {
    const response = await api.post(`/referrals/redeem/${rewardId}`);
    return response.data;
  },

  // ============================================
  // ADMIN ENDPOINTS
  // ============================================

  // Get analytics
  getAnalytics: async () => {
    const response = await api.get('/referrals/admin/analytics');
    return response.data;
  },

  // Get all referral codes
  getAllCodes: async () => {
    const response = await api.get('/referrals/admin/codes');
    return response.data;
  },

  // Get all campaigns
  getCampaigns: async () => {
    const response = await api.get('/referrals/admin/campaigns');
    return response.data;
  },

  // Create campaign
  createCampaign: async (campaignData) => {
    const response = await api.post('/referrals/admin/campaigns', campaignData);
    return response.data;
  },

  // Update campaign
  updateCampaign: async (id, campaignData) => {
    const response = await api.patch(`/referrals/admin/campaigns/${id}`, campaignData);
    return response.data;
  },

  // Delete campaign
  deleteCampaign: async (id) => {
    const response = await api.delete(`/referrals/admin/campaigns/${id}`);
    return response.data;
  },

  // ============================================
  // SHARE HELPERS
  // ============================================

  // Generate share URLs
  generateShareUrls: (code, referralUrl) => {
    const encodedUrl = encodeURIComponent(referralUrl);
    const message = encodeURIComponent(`Join The dAItaniverse and get your first month FREE! ${referralUrl}`);

    return {
      email: `mailto:?subject=${encodeURIComponent('You need to check this out!')}&body=${message}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Just saved £600/month by switching to @dAItaniverse 🚀\n\nOne platform = 40+ tools replaced.\n\nGet your first month FREE with my link:`)}&url=${encodedUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      whatsapp: `https://api.whatsapp.com/send?text=${message}`
    };
  },

  // Get pre-written messages
  getShareMessages: (referralUrl, userName = 'a friend') => {
    return {
      email: {
        subject: 'You need to check this out!',
        body: `Hey,\n\nI've been using The dAItaniverse and it's incredible - I'm saving £600/month by replacing 40+ tools with one platform.\n\nThought you might be interested! Use my link and get your first month FREE:\n\n${referralUrl}\n\nIt has everything - website builder, CRM, ecommerce, courses, social media tools, and so much more. All for £26/month.\n\nLet me know what you think!\n\n${userName}`
      },
      twitter: `Just saved £600/month by switching to @dAItaniverse 🚀\n\nOne platform = 40+ tools replaced.\n\nGet your first month FREE with my link: ${referralUrl}\n\n#entrepreneur #solopreneur #productivity`,
      linkedin: `Game changer for entrepreneurs 🎯\n\nI replaced Wix, Shopify, Salesforce, Adobe CC, and 36 other tools with ONE platform: The dAItaniverse.\n\nNow I'm saving £600/month and everything's in one place.\n\nFirst month FREE with my link: ${referralUrl}\n\nPerfect for coaches, creators, and consultants who are tired of juggling subscriptions!`,
      instagram: `💰 Saving £600/month feels GOOD!\n\nI consolidated 40+ tools into ONE platform and my life is so much simpler.\n\n✅ Website builder\n✅ CRM & sales\n✅ Ecommerce store\n✅ Course platform\n✅ Social media tools\n✅ And 35+ more features\n\nAll for £26/month 🤯\n\nLink in bio - first month FREE! 🎁\n\n#entrepreneurlife #productivity #solopreneur`,
      whatsapp: `Hey! I've been using The dAItaniverse and it's amazing - saving me £600/month by replacing 40+ tools with one platform. Get your first month FREE with my link: ${referralUrl}`
    };
  }
};

export default referralsService;
