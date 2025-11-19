/**
 * Membership Tiers Configuration
 * Default tier definitions for The dAItaniverse
 */

export const DEFAULT_TIERS = [
  {
    name: "Free",
    slug: "free",
    description: "Try The dAItaniverse with limited features",
    tagline: "Get started for free",
    priceMonthly: 0,
    priceYearly: 0,
    color: "#6B7280",
    icon: "🎁",
    order: 0,
    featured: false,
    trialDays: 0,
    isActive: true,
    isPublic: true,
    isLegacy: false,

    features: [
      { name: "1 Website", included: true },
      { name: "5 Pages", included: true },
      { name: "Basic Templates", included: true },
      { name: "Community Support", included: true },
      { name: "SUPERNova AI (5 msgs/day)", included: true },
      { name: "Ecommerce", included: false },
      { name: "Courses", included: false },
      { name: "Email Marketing", included: false },
      { name: "Custom Domain", included: false }
    ],

    limits: {
      websites: 1,
      pages: 5,
      blog_posts: 10,
      products: 0,
      courses: 0,
      students: 0,
      contacts: 100,
      emails_per_month: 0,
      storage_gb: 0.5,
      supernova_messages_per_day: 5,
      video_minutes: 0,
      team_members: 1,
      custom_domains: 0
    }
  },

  {
    name: "SUPERNova-LTE",
    slug: "supernova-lte",
    description: "Full platform access - everything you need to build your empire",
    tagline: "Most Popular - Best Value!",
    priceMonthly: 26,
    priceYearly: 260, // ~17% discount (2 months free)
    color: "#FF5722",
    icon: "🚀",
    order: 1,
    featured: true, // "Most Popular" badge
    trialDays: 14,
    isActive: true,
    isPublic: true,
    isLegacy: false,

    features: [
      { name: "EVERYTHING in Free", included: true },
      { name: "Unlimited Websites", included: true },
      { name: "Unlimited Pages", included: true },
      { name: "All Premium Templates", included: true },
      { name: "SUPERNova AI Unlimited", included: true },
      { name: "Full Ecommerce Suite", included: true },
      { name: "Course Platform", included: true },
      { name: "Email Marketing (10k/mo)", included: true },
      { name: "Custom Domains", included: true },
      { name: "Advanced Analytics", included: true },
      { name: "Priority Support", included: true }
    ],

    limits: {
      websites: -1, // -1 = unlimited
      pages: -1,
      blog_posts: -1,
      products: -1,
      courses: -1,
      students: -1,
      contacts: 10000,
      emails_per_month: 10000,
      storage_gb: 50,
      supernova_messages_per_day: -1,
      video_minutes: 1000,
      team_members: 5,
      custom_domains: 5
    }
  },

  {
    name: "Enterprise",
    slug: "enterprise",
    description: "Custom solutions for agencies and high-volume businesses",
    tagline: "For serious businesses",
    priceMonthly: 0, // Custom pricing - contact sales
    priceYearly: 0,
    color: "#8B5CF6",
    icon: "👑",
    order: 2,
    featured: false,
    trialDays: 30,
    isActive: true,
    isPublic: true,
    isLegacy: false,

    features: [
      { name: "EVERYTHING in SUPERNova-LTE", included: true },
      { name: "Unlimited Everything", included: true },
      { name: "White Label Options", included: true },
      { name: "Dedicated Account Manager", included: true },
      { name: "Custom Integrations", included: true },
      { name: "Advanced API Access", included: true },
      { name: "SLA Guarantee", included: true },
      { name: "Onboarding & Training", included: true }
    ],

    limits: {
      websites: -1,
      pages: -1,
      blog_posts: -1,
      products: -1,
      courses: -1,
      students: -1,
      contacts: -1,
      emails_per_month: -1,
      storage_gb: 500,
      supernova_messages_per_day: -1,
      video_minutes: -1,
      team_members: -1,
      custom_domains: -1
    }
  }
];

export const DEFAULT_FEATURES = [
  {
    key: "website_builder",
    name: "Website Builder",
    description: "Create and manage websites",
    category: "content",
    availableInTiers: ["free", "supernova-lte", "enterprise"],
    isActive: true
  },
  {
    key: "blog_platform",
    name: "Blog Platform",
    description: "Write and publish blog posts",
    category: "content",
    availableInTiers: ["free", "supernova-lte", "enterprise"],
    isActive: true
  },
  {
    key: "ecommerce",
    name: "Ecommerce",
    description: "Sell products online",
    category: "sales",
    availableInTiers: ["supernova-lte", "enterprise"],
    isActive: true
  },
  {
    key: "course_platform",
    name: "Course Platform",
    description: "Create and sell courses",
    category: "sales",
    availableInTiers: ["supernova-lte", "enterprise"],
    isActive: true
  },
  {
    key: "email_marketing",
    name: "Email Marketing",
    description: "Send marketing emails and newsletters",
    category: "marketing",
    availableInTiers: ["supernova-lte", "enterprise"],
    isActive: true
  },
  {
    key: "crm",
    name: "CRM",
    description: "Manage contacts and deals",
    category: "sales",
    availableInTiers: ["free", "supernova-lte", "enterprise"],
    isActive: true
  },
  {
    key: "analytics",
    name: "Advanced Analytics",
    description: "Detailed insights and reporting",
    category: "tools",
    availableInTiers: ["supernova-lte", "enterprise"],
    isActive: true
  },
  {
    key: "custom_domains",
    name: "Custom Domains",
    description: "Use your own domain name",
    category: "tools",
    availableInTiers: ["supernova-lte", "enterprise"],
    isActive: true
  },
  {
    key: "api_access",
    name: "API Access",
    description: "Developer API access",
    category: "tools",
    availableInTiers: ["enterprise"],
    isActive: true
  },
  {
    key: "white_label",
    name: "White Label",
    description: "Remove dAItaniverse branding",
    category: "tools",
    availableInTiers: ["enterprise"],
    isActive: true
  },
  {
    key: "priority_support",
    name: "Priority Support",
    description: "Get priority email and chat support",
    category: "tools",
    availableInTiers: ["supernova-lte", "enterprise"],
    isActive: true
  },
  {
    key: "automations",
    name: "Automation Builder",
    description: "Create automated workflows",
    category: "tools",
    availableInTiers: ["supernova-lte", "enterprise"],
    isActive: true
  },
  {
    key: "memberships",
    name: "Membership Sites",
    description: "Create members-only content",
    category: "sales",
    availableInTiers: ["supernova-lte", "enterprise"],
    isActive: true
  },
  {
    key: "webinars",
    name: "Webinars",
    description: "Host live webinars",
    category: "marketing",
    availableInTiers: ["supernova-lte", "enterprise"],
    isActive: true
  }
];

export const DEFAULT_ADDONS = [
  {
    name: "Extra Storage (50GB)",
    slug: "storage-50gb",
    description: "Add 50GB of additional storage for videos, images, and files",
    priceMonthly: 5,
    feature: null,
    extraLimit: { storage_gb: 50 },
    isActive: true
  },
  {
    name: "Extra Email Sends (25k/mo)",
    slug: "emails-25k",
    description: "Send 25,000 additional emails per month",
    priceMonthly: 10,
    feature: null,
    extraLimit: { emails_per_month: 25000 },
    isActive: true
  },
  {
    name: "Extra Storage (200GB)",
    slug: "storage-200gb",
    description: "Add 200GB of additional storage for large media libraries",
    priceMonthly: 15,
    feature: null,
    extraLimit: { storage_gb: 200 },
    isActive: true
  },
  {
    name: "Extra Contacts (25k)",
    slug: "contacts-25k",
    description: "Add 25,000 additional contact slots to your CRM",
    priceMonthly: 15,
    feature: null,
    extraLimit: { contacts: 25000 },
    isActive: true
  },
  {
    name: "Extra Team Members (10 seats)",
    slug: "team-10",
    description: "Add 10 additional team member seats",
    priceMonthly: 20,
    feature: null,
    extraLimit: { team_members: 10 },
    isActive: true
  },
  {
    name: "Extra Video Storage (500 min)",
    slug: "video-500min",
    description: "Add 500 additional minutes of video hosting",
    priceMonthly: 10,
    feature: null,
    extraLimit: { video_minutes: 500 },
    isActive: true
  }
];

/**
 * Helper: Get tier by slug
 */
export function getTierBySlug(slug) {
  return DEFAULT_TIERS.find(tier => tier.slug === slug);
}

/**
 * Helper: Get feature by key
 */
export function getFeatureByKey(key) {
  return DEFAULT_FEATURES.find(feature => feature.key === key);
}

/**
 * Helper: Get add-on by slug
 */
export function getAddOnBySlug(slug) {
  return DEFAULT_ADDONS.find(addOn => addOn.slug === slug);
}

/**
 * Helper: Check if tier has feature
 */
export function tierHasFeature(tierSlug, featureKey) {
  const feature = getFeatureByKey(featureKey);
  if (!feature) return false;
  return feature.availableInTiers.includes(tierSlug);
}
