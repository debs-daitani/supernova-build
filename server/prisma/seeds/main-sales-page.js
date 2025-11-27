/**
 * Phase 2BE: YOUR Main Sales Page
 * Seed for The dAItaniverse Main Sales Page
 *
 * This creates the actual sales page for dAItaniverse.com using the Landing Page Builder
 */

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function seedMainSalesPage() {
  console.log('🌟 Seeding The dAItaniverse Main Sales Page...');

  try {
    // Find or create a default user for system pages
    let systemUser = await prisma.user.findFirst({
      where: {
        email: 'system@daitaniverse.com'
      }
    });

    if (!systemUser) {
      systemUser = await prisma.user.create({
        data: {
          email: 'system@daitaniverse.com',
          name: 'System',
          passwordHash: 'SYSTEM_USER_NO_LOGIN',
          role: 'admin'
        }
      });
      console.log('✅ Created system user');
    }

    // Check if main sales page already exists
    const existingPage = await prisma.landingPage.findFirst({
      where: {
        slug: 'join'
      }
    });

    if (existingPage) {
      console.log('⚠️  Main sales page already exists. Updating...');

      await prisma.landingPage.update({
        where: { id: existingPage.id },
        data: {
          title: 'The dAItaniverse - Replace 40+ Tools. Pay £26/Month.',
          templateType: 'sales',
          sections: getMainSalesPageSections(),
          primaryCTA: 'Start FREE Trial',
          ctaUrl: '/signup',
          metaTitle: 'The dAItaniverse - All-In-One Business Platform | Replace 40+ Tools',
          metaDescription: 'Stop paying £600+/mo for separate tools. Get website builder, CRM, ecommerce, email marketing, and 40+ features in one platform. Start free trial today.',
          ogImage: '/images/og-main-sales.png',
          customCSS: null,
          customJS: null,
          headerCode: `
<!-- Facebook Pixel -->
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', 'YOUR_PIXEL_ID');
fbq('track', 'PageView');
</script>
<!-- End Facebook Pixel -->

<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
<!-- End Google Analytics -->
          `.trim(),
          exitIntentEnabled: true,
          exitIntentContent: {
            headline: '⏰ WAIT! Before You Go...',
            subheadline: 'Get 50% OFF your first month',
            ctaText: 'Claim My Discount',
            ctaUrl: '/signup?promo=EXIT50',
            image: '/images/exit-intent.png'
          },
          isPublished: true,
          publishedAt: new Date()
        }
      });

      console.log('✅ Main sales page updated successfully!');
    } else {
      const salesPage = await prisma.landingPage.create({
        data: {
          userId: systemUser.id,
          title: 'The dAItaniverse - Replace 40+ Tools. Pay £26/Month.',
          slug: 'join',
          templateType: 'sales',
          sections: getMainSalesPageSections(),
          primaryCTA: 'Start FREE Trial',
          ctaUrl: '/signup',
          metaTitle: 'The dAItaniverse - All-In-One Business Platform | Replace 40+ Tools',
          metaDescription: 'Stop paying £600+/mo for separate tools. Get website builder, CRM, ecommerce, email marketing, and 40+ features in one platform. Start free trial today.',
          ogImage: '/images/og-main-sales.png',
          customCSS: null,
          customJS: null,
          headerCode: `
<!-- Facebook Pixel -->
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', 'YOUR_PIXEL_ID');
fbq('track', 'PageView');
</script>
<!-- End Facebook Pixel -->

<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
<!-- End Google Analytics -->
          `.trim(),
          exitIntentEnabled: true,
          exitIntentContent: {
            headline: '⏰ WAIT! Before You Go...',
            subheadline: 'Get 50% OFF your first month',
            ctaText: 'Claim My Discount',
            ctaUrl: '/signup?promo=EXIT50',
            image: '/images/exit-intent.png'
          },
          isPublished: true,
          publishedAt: new Date()
        }
      });

      console.log('✅ Main sales page created successfully!');
      console.log(`   URL: /join`);
      console.log(`   ID: ${salesPage.id}`);
    }

    console.log('🎉 Main sales page seeded!');

  } catch (error) {
    console.error('❌ Error seeding main sales page:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Get complete sections for The dAItaniverse main sales page
 */
function getMainSalesPageSections() {
  return [
    // ============================================
    // HERO SECTION
    // ============================================
    {
      type: 'hero',
      style: 'classic',
      content: {
        headline: 'Replace 40+ Tools. Pay £26/Month.',
        subheadline: 'Stop juggling subscriptions. Get website builder, CRM, ecommerce, email marketing, and 40+ features in one platform.',
        ctaText: 'Start FREE Trial',
        ctaUrl: '/signup',
        secondaryCTA: {
          text: 'See How It Works',
          url: '#video'
        },
        image: '/images/hero-dashboard.png',
        trustBadges: [
          '✅ No Credit Card Required',
          '✅ 7-Day Free Trial',
          '✅ Cancel Anytime'
        ]
      }
    },

    // ============================================
    // SOCIAL PROOF - QUICK WINS
    // ============================================
    {
      type: 'socialProof',
      style: 'stats',
      content: {
        title: 'Join 500+ Female Entrepreneurs Who Ditched Their Tool Stack',
        stats: [
          { number: '£658', label: 'Avg. Monthly Savings', icon: '💰' },
          { number: '40+', label: 'Tools Replaced', icon: '🔧' },
          { number: '95%', label: 'Customer Satisfaction', icon: '⭐' },
          { number: '24/7', label: 'Support Available', icon: '💬' }
        ]
      }
    },

    // ============================================
    // PROBLEM SECTION
    // ============================================
    {
      type: 'problem',
      content: {
        headline: '😩 Paying £600+/Month for Separate Tools?',
        description: 'Most entrepreneurs juggle 40+ different subscriptions. Sound familiar?',
        points: [
          {
            icon: '🌐',
            tool: 'Wix',
            price: '£30/mo',
            purpose: 'Website builder'
          },
          {
            icon: '🛒',
            tool: 'Shopify',
            price: '£29/mo',
            purpose: 'Online store'
          },
          {
            icon: '📊',
            tool: 'Salesforce',
            price: '£25/mo',
            purpose: 'CRM'
          },
          {
            icon: '📧',
            tool: 'Mailchimp',
            price: '£20/mo',
            purpose: 'Email marketing'
          },
          {
            icon: '📅',
            tool: 'Calendly',
            price: '£12/mo',
            purpose: 'Appointment booking'
          },
          {
            icon: '📝',
            tool: 'Typeform',
            price: '£25/mo',
            purpose: 'Forms & surveys'
          },
          {
            icon: '💬',
            tool: 'Intercom',
            price: '£74/mo',
            purpose: 'Live chat'
          },
          {
            icon: '🎓',
            tool: 'Teachable',
            price: '£39/mo',
            purpose: 'Online courses'
          },
          {
            icon: '👥',
            tool: 'Circle',
            price: '£39/mo',
            purpose: 'Community platform'
          },
          {
            icon: '📊',
            tool: 'ConvertKit',
            price: '£29/mo',
            purpose: 'Email automation'
          },
          {
            icon: '🎨',
            tool: 'Canva Pro',
            price: '£11/mo',
            purpose: 'Design tools'
          },
          {
            icon: '📈',
            tool: 'Google Analytics',
            price: 'Free',
            purpose: 'Analytics'
          },
          {
            icon: '🔗',
            tool: 'Linktree',
            price: '£5/mo',
            purpose: 'Bio links'
          },
          {
            icon: '💳',
            tool: 'Stripe',
            price: '2.9% fees',
            purpose: 'Payments'
          },
          {
            icon: '📱',
            tool: 'Buffer',
            price: '£12/mo',
            purpose: 'Social media'
          }
        ],
        totalCost: '£658/month + hours of frustration',
        painPoints: [
          '😤 Logging into 40+ different dashboards',
          '🔐 Managing dozens of passwords',
          '🤯 Learning new interfaces constantly',
          '💸 Subscription costs adding up',
          '⚠️ Tools not talking to each other',
          '⏰ Wasting time switching between platforms'
        ]
      }
    },

    // ============================================
    // SOLUTION SECTION
    // ============================================
    {
      type: 'solution',
      content: {
        headline: '✨ One Platform. Everything You Need. £26/Month.',
        subheadline: 'The dAItaniverse replaces your entire tool stack with one simple, powerful platform.',
        image: '/images/platform-overview.png',
        features: [
          {
            icon: '🌐',
            title: 'Website Builder',
            description: 'Drag-drop site creation. No code needed.',
            included: true
          },
          {
            icon: '🛒',
            title: 'Online Store',
            description: 'Sell products, services, and digital downloads.',
            included: true
          },
          {
            icon: '📊',
            title: 'CRM & Sales Pipeline',
            description: 'Manage customers and track deals.',
            included: true
          },
          {
            icon: '📧',
            title: 'Email Marketing',
            description: 'Unlimited emails, automation, sequences.',
            included: true
          },
          {
            icon: '🎓',
            title: 'Course Platform',
            description: 'Host unlimited courses and memberships.',
            included: true
          },
          {
            icon: '👥',
            title: 'Community',
            description: 'Built-in community and forums.',
            included: true
          },
          {
            icon: '📅',
            title: 'Appointment Booking',
            description: 'Calendar scheduling and reminders.',
            included: true
          },
          {
            icon: '💬',
            title: 'Live Chat',
            description: 'Customer support chat widget.',
            included: true
          },
          {
            icon: '📝',
            title: 'Forms & Surveys',
            description: 'Unlimited forms with logic branching.',
            included: true
          },
          {
            icon: '🎨',
            title: 'Design Tools',
            description: 'Built-in graphics and branding.',
            included: true
          },
          {
            icon: '📈',
            title: 'Analytics',
            description: 'Track everything in real-time.',
            included: true
          },
          {
            icon: '🤖',
            title: 'AI Assistant',
            description: 'AI-powered content and automation.',
            included: true
          }
        ],
        ctaText: 'Start FREE Trial',
        ctaUrl: '/signup'
      }
    },

    // ============================================
    // COMPARISON TABLE
    // ============================================
    {
      type: 'comparison',
      content: {
        headline: 'Your Old Way vs. The dAItaniverse',
        subheadline: 'See how much time and money you\'ll save',
        comparison: {
          columns: [
            {
              name: 'Your Current Stack',
              highlighted: false,
              price: '£658/month',
              rows: [
                { feature: 'Website Builder', value: 'Wix (£30/mo)', icon: '❌' },
                { feature: 'Online Store', value: 'Shopify (£29/mo)', icon: '❌' },
                { feature: 'CRM', value: 'Salesforce (£25/mo)', icon: '❌' },
                { feature: 'Email Marketing', value: 'Mailchimp (£20/mo)', icon: '❌' },
                { feature: 'Course Platform', value: 'Teachable (£39/mo)', icon: '❌' },
                { feature: 'Community', value: 'Circle (£39/mo)', icon: '❌' },
                { feature: 'Appointment Booking', value: 'Calendly (£12/mo)', icon: '❌' },
                { feature: 'Live Chat', value: 'Intercom (£74/mo)', icon: '❌' },
                { feature: 'Forms', value: 'Typeform (£25/mo)', icon: '❌' },
                { feature: 'Analytics', value: 'Multiple tools', icon: '❌' },
                { feature: 'AI Tools', value: 'Not included', icon: '❌' },
                { feature: '# of Logins', value: '40+ dashboards 🤯', icon: '❌' },
                { feature: 'Setup Time', value: 'Weeks', icon: '❌' },
                { feature: 'Support', value: 'Scattered', icon: '❌' },
                { feature: 'Total Cost', value: '£658/month', icon: '💸' }
              ]
            },
            {
              name: 'The dAItaniverse',
              highlighted: true,
              badge: '🎉 BEST VALUE',
              price: '£26/month',
              savings: 'Save £632/mo',
              rows: [
                { feature: 'Website Builder', value: 'Included', icon: '✅' },
                { feature: 'Online Store', value: 'Included', icon: '✅' },
                { feature: 'CRM', value: 'Included', icon: '✅' },
                { feature: 'Email Marketing', value: 'Included', icon: '✅' },
                { feature: 'Course Platform', value: 'Included', icon: '✅' },
                { feature: 'Community', value: 'Included', icon: '✅' },
                { feature: 'Appointment Booking', value: 'Included', icon: '✅' },
                { feature: 'Live Chat', value: 'Included', icon: '✅' },
                { feature: 'Forms', value: 'Included', icon: '✅' },
                { feature: 'Analytics', value: 'Included', icon: '✅' },
                { feature: 'AI Tools', value: 'Included', icon: '✅' },
                { feature: '# of Logins', value: 'Just ONE! 🎉', icon: '✅' },
                { feature: 'Setup Time', value: 'Minutes', icon: '✅' },
                { feature: 'Support', value: '24/7 Priority', icon: '✅' },
                { feature: 'Total Cost', value: '£26/month', icon: '💰' }
              ]
            }
          ]
        },
        ctaText: 'Start Saving Today',
        ctaUrl: '/signup'
      }
    },

    // ============================================
    // FEATURES GRID - ALL 40+ TOOLS
    // ============================================
    {
      type: 'features',
      style: 'grid',
      content: {
        headline: 'Everything You Need to Run Your Business',
        subheadline: 'All 40+ tools included. No hidden fees. No limits.',
        categories: [
          {
            name: 'Website & Design',
            features: [
              { icon: '🌐', name: 'Website Builder', description: 'Drag-drop pages' },
              { icon: '🎨', name: 'Design Studio', description: 'Graphics & branding' },
              { icon: '📱', name: 'Mobile Responsive', description: 'Perfect on any device' },
              { icon: '🔗', name: 'Custom Domains', description: 'Use your own domain' },
              { icon: '⚡', name: 'Fast Hosting', description: 'Lightning-fast CDN' },
              { icon: '🔒', name: 'SSL Certificates', description: 'Free SSL included' }
            ]
          },
          {
            name: 'Ecommerce & Payments',
            features: [
              { icon: '🛒', name: 'Online Store', description: 'Sell anything' },
              { icon: '💳', name: 'Payment Processing', description: 'Stripe integrated' },
              { icon: '📦', name: 'Product Management', description: 'Unlimited products' },
              { icon: '🏷️', name: 'Coupons & Discounts', description: 'Flexible pricing' },
              { icon: '🔁', name: 'Subscriptions', description: 'Recurring revenue' },
              { icon: '🎁', name: 'Upsells & Bundles', description: 'Boost revenue' }
            ]
          },
          {
            name: 'Marketing & Sales',
            features: [
              { icon: '📧', name: 'Email Marketing', description: 'Unlimited sends' },
              { icon: '🤖', name: 'Marketing Automation', description: 'Smart workflows' },
              { icon: '📊', name: 'CRM & Pipeline', description: 'Track customers' },
              { icon: '📝', name: 'Landing Pages', description: 'High-converting pages' },
              { icon: '🎯', name: 'Sales Funnels', description: 'Complete funnels' },
              { icon: '📈', name: 'Analytics', description: 'Track everything' }
            ]
          },
          {
            name: 'Courses & Content',
            features: [
              { icon: '🎓', name: 'Course Platform', description: 'Host courses' },
              { icon: '📹', name: 'Video Hosting', description: 'Unlimited videos' },
              { icon: '📚', name: 'Memberships', description: 'Recurring access' },
              { icon: '🏆', name: 'Certificates', description: 'Course completion' },
              { icon: '💬', name: 'Comments & Discussion', description: 'Student engagement' },
              { icon: '📊', name: 'Progress Tracking', description: 'Student analytics' }
            ]
          },
          {
            name: 'Community & Support',
            features: [
              { icon: '👥', name: 'Community Platform', description: 'Built-in forums' },
              { icon: '💬', name: 'Live Chat', description: 'Real-time support' },
              { icon: '📧', name: 'Help Desk', description: 'Ticket system' },
              { icon: '📚', name: 'Knowledge Base', description: 'Self-service docs' },
              { icon: '⭐', name: 'Reviews & Testimonials', description: 'Social proof' },
              { icon: '🔔', name: 'Notifications', description: 'Stay connected' }
            ]
          },
          {
            name: 'Automation & AI',
            features: [
              { icon: '🤖', name: 'AI Content Writer', description: 'Generate content' },
              { icon: '🧠', name: 'AI Assistant', description: 'Smart suggestions' },
              { icon: '⚡', name: 'Workflow Automation', description: 'Save time' },
              { icon: '🔗', name: 'Zapier Integration', description: 'Connect tools' },
              { icon: '🎯', name: 'Smart Segmentation', description: 'Target precisely' },
              { icon: '📊', name: 'AI Analytics', description: 'Insights & predictions' }
            ]
          }
        ]
      }
    },

    // ============================================
    // PRICING SECTION
    // ============================================
    {
      type: 'pricing',
      style: 'sideBySide',
      content: {
        headline: 'Simple Pricing. No Surprises.',
        subheadline: 'Start free. Upgrade anytime. Cancel anytime.',
        plans: [
          {
            name: 'FREE',
            price: '0',
            period: 'forever',
            description: 'Try everything free for 7 days',
            features: [
              '✅ Full platform access',
              '✅ All 40+ features',
              '✅ 7-day trial',
              '✅ No credit card required',
              '✅ Cancel anytime',
              '⚠️ Limited to 100 contacts',
              '⚠️ dAItaniverse branding'
            ],
            ctaText: 'Start FREE Trial',
            ctaUrl: '/signup',
            badge: null
          },
          {
            name: 'PRO',
            price: '26',
            period: 'month',
            popular: true,
            badge: '🎉 MOST POPULAR',
            description: 'Everything you need to grow',
            features: [
              '✅ Everything in FREE',
              '✅ Unlimited contacts',
              '✅ Remove branding',
              '✅ Custom domain',
              '✅ Priority support',
              '✅ Advanced analytics',
              '✅ AI features',
              '✅ White-label option',
              '✅ API access'
            ],
            ctaText: 'Start 7-Day Trial',
            ctaUrl: '/signup?plan=pro',
            savings: 'Save £632/mo vs other tools'
          },
          {
            name: 'ENTERPRISE',
            price: 'Custom',
            period: null,
            description: 'For agencies and teams',
            features: [
              '✅ Everything in PRO',
              '✅ Unlimited team members',
              '✅ Dedicated account manager',
              '✅ Custom features',
              '✅ White-label reseller',
              '✅ API priority',
              '✅ Custom integrations',
              '✅ SLA guarantee',
              '✅ Training & onboarding'
            ],
            ctaText: 'Contact Sales',
            ctaUrl: '/contact',
            badge: null
          }
        ],
        guarantee: {
          headline: '30-Day Money-Back Guarantee',
          description: 'Try it risk-free. If you\'re not happy, we\'ll refund 100%. No questions asked.',
          icon: '🛡️'
        }
      }
    },

    // ============================================
    // TESTIMONIALS
    // ============================================
    {
      type: 'testimonials',
      style: 'grid',
      content: {
        headline: 'Loved by Female Entrepreneurs',
        subheadline: 'Join 500+ women who ditched their tool stack',
        testimonials: [
          {
            quote: 'I was paying £623/month for separate tools. The dAItaniverse replaced ALL of them for £26/month. Game changer!',
            name: 'Sarah Mitchell',
            role: 'Online Coach',
            avatar: '/images/testimonial-sarah.jpg',
            rating: 5,
            results: 'Saved £597/month'
          },
          {
            quote: 'Finally! One platform that does EVERYTHING. No more juggling 40 different logins. My life is so much easier.',
            name: 'Emma Thompson',
            role: 'Course Creator',
            avatar: '/images/testimonial-emma.jpg',
            rating: 5,
            results: '10x productivity'
          },
          {
            quote: 'The AI features alone are worth it. It writes my emails, creates graphics, and automates my entire funnel. Mind-blowing!',
            name: 'Jessica Parker',
            role: 'Digital Marketer',
            avatar: '/images/testimonial-jessica.jpg',
            rating: 5,
            results: '5 hours saved daily'
          },
          {
            quote: 'I launched my entire online business in ONE weekend using The dAItaniverse. Website, course, email list - everything!',
            name: 'Rachel Green',
            role: 'Business Coach',
            avatar: '/images/testimonial-rachel.jpg',
            rating: 5,
            results: 'Launched in 2 days'
          },
          {
            quote: 'Best investment I\'ve made. The ROI is insane. I\'m saving £650/month and my business is growing faster than ever.',
            name: 'Amanda Chen',
            role: 'Wellness Entrepreneur',
            avatar: '/images/testimonial-amanda.jpg',
            rating: 5,
            results: '£650/mo saved'
          },
          {
            quote: 'Support is AMAZING. Any question I have, they respond within minutes. I feel so supported as I grow my business.',
            name: 'Lisa Rodriguez',
            role: 'Membership Site Owner',
            avatar: '/images/testimonial-lisa.jpg',
            rating: 5,
            results: '24/7 support'
          }
        ]
      }
    },

    // ============================================
    // FAQ SECTION
    // ============================================
    {
      type: 'faq',
      content: {
        headline: 'Frequently Asked Questions',
        subheadline: 'Everything you need to know',
        faqs: [
          {
            question: 'Can I really replace ALL my tools with this?',
            answer: 'Yes! The dAItaniverse includes website builder, ecommerce, CRM, email marketing, course platform, community, booking, forms, live chat, and 40+ more features. Most entrepreneurs save £600+/month by canceling their other subscriptions.'
          },
          {
            question: 'Is there really a free trial?',
            answer: 'Absolutely! You get 7 days to try EVERYTHING with full access. No credit card required. If you love it (you will!), upgrade to PRO for £26/month. If not, no worries - your trial ends automatically.'
          },
          {
            question: 'What if I\'m not technical?',
            answer: 'Perfect! The dAItaniverse is designed for non-tech entrepreneurs. Everything is drag-and-drop. Plus, our AI assistant helps you build pages, write content, and set up automations. And our support team is available 24/7 if you need help.'
          },
          {
            question: 'Can I cancel anytime?',
            answer: 'Yes! Cancel with one click. No questions asked. No cancellation fees. We want you to stay because you love it, not because you\'re locked in.'
          },
          {
            question: 'Do you offer refunds?',
            answer: '30-day money-back guarantee. If you\'re not happy for ANY reason in your first 30 days, we\'ll refund 100%. Just email support and we\'ll process it immediately.'
          },
          {
            question: 'How is this different from WordPress?',
            answer: 'WordPress requires plugins, hosting, security, updates, and technical knowledge. The dAItaniverse is all-in-one with zero setup, zero maintenance, and zero headaches. Just log in and start building.'
          },
          {
            question: 'How is this different from Wix/Squarespace?',
            answer: 'Wix/Squarespace are just website builders. The dAItaniverse includes website + store + CRM + email + courses + community + 40+ more tools. It\'s your entire business stack, not just a website.'
          },
          {
            question: 'How is this different from ClickFunnels?',
            answer: 'ClickFunnels is £127/month and only does funnels. The dAItaniverse is £26/month and includes funnels PLUS website, CRM, courses, community, and 40+ more features. Way more value, way less cost.'
          },
          {
            question: 'Can I use my own domain?',
            answer: 'Yes! Connect your custom domain with one click. We include free SSL certificates and handle all the technical setup for you.'
          },
          {
            question: 'Do you integrate with Stripe/PayPal?',
            answer: 'Yes! Stripe and PayPal are built-in. Connect your account and start accepting payments in minutes. We also support subscriptions, payment plans, and one-click upsells.'
          },
          {
            question: 'Can I host courses and memberships?',
            answer: 'Absolutely! Upload unlimited videos, create courses, drip content, issue certificates, and run memberships. It\'s all included.'
          },
          {
            question: 'Is there a limit on emails I can send?',
            answer: 'Unlimited emails on the PRO plan. Send as many as you want. No extra charges. (Free trial limited to 100 contacts.)'
          },
          {
            question: 'Do you have an affiliate program?',
            answer: 'Yes! Refer friends and earn 30% recurring commission. Perfect for agencies and coaches who want to recommend us to clients.'
          },
          {
            question: 'Can I white-label this for my clients?',
            answer: 'Yes! PRO plan includes white-label option. Remove our branding and add yours. ENTERPRISE plan lets you resell to clients.'
          },
          {
            question: 'What if I need help?',
            answer: 'We\'re here 24/7! Live chat, email support, knowledge base, video tutorials, and community forum. Plus, ENTERPRISE customers get a dedicated account manager.'
          }
        ]
      }
    },

    // ============================================
    // GUARANTEE SECTION
    // ============================================
    {
      type: 'guarantee',
      content: {
        headline: '🛡️ Our Iron-Clad 30-Day Money-Back Guarantee',
        subheadline: 'Try it risk-free. Love it or get 100% refund.',
        description: 'We\'re so confident you\'ll love The dAItaniverse that we offer a no-questions-asked 30-day money-back guarantee. If you\'re not thrilled with the platform in your first 30 days, just email support and we\'ll refund every penny. Immediately. No hoops to jump through.',
        points: [
          '✅ Full 30 days to try everything',
          '✅ 100% money-back guarantee',
          '✅ No questions asked',
          '✅ Instant refund processing',
          '✅ Keep everything you created'
        ],
        trustBadges: [
          { icon: '🔒', text: 'Secure Payments' },
          { icon: '✅', text: 'Trusted by 500+' },
          { icon: '⭐', text: '4.9/5 Rating' },
          { icon: '🛡️', text: 'Money-Back Guarantee' }
        ]
      }
    },

    // ============================================
    // FINAL CTA
    // ============================================
    {
      type: 'finalCTA',
      style: 'hero',
      content: {
        headline: 'Ready to Save £632/Month?',
        subheadline: 'Join 500+ female entrepreneurs who ditched their tool stack.',
        ctaText: 'Start FREE Trial Now',
        ctaUrl: '/signup',
        secondaryCTA: {
          text: 'Book a Demo',
          url: '/demo'
        },
        urgency: {
          type: 'limited',
          message: '⏰ 50% OFF ends tonight at midnight'
        },
        trustSignals: [
          '✅ No credit card required',
          '✅ 7-day free trial',
          '✅ Cancel anytime',
          '✅ 30-day money-back guarantee'
        ],
        image: '/images/final-cta-dashboard.png'
      }
    }
  ];
}

// Run the seed function if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedMainSalesPage()
    .then(() => {
      console.log('✅ Seeding complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}

export default seedMainSalesPage;
