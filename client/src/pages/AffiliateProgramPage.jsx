/**
 * Affiliate Program Landing Page
 * Public page promoting the affiliate program
 */

import { useState, useEffect } from 'react';

export default function AffiliateProgramPage() {
  const [programInfo, setProgramInfo] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchProgramInfo();
  }, []);

  const fetchProgramInfo = async () => {
    try {
      const response = await fetch('/api/affiliate/program-info');
      const data = await response.json();
      setProgramInfo(data);
    } catch (error) {
      console.error('Error fetching program info:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50">

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-orange-500 to-pink-500 text-white py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Earn 20-30% Commission
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-orange-100">
              Join The dAItaniverse Affiliate Program and earn recurring income by sharing the #1 AI-powered business platform
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <button
                onClick={() => window.location.href = '/signup?ref=affiliate'}
                className="bg-white text-orange-500 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-all shadow-xl"
              >
                Join Now - It's Free
              </button>
              <button
                onClick={() => setActiveTab('how-it-works')}
                className="border-2 border-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white/10 transition-all"
              >
                How It Works
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="text-4xl font-bold mb-2">20-30%</div>
              <div className="text-orange-100">Commission Rate</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="text-4xl font-bold mb-2">£26</div>
              <div className="text-orange-100">Per Referral/Month</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="text-4xl font-bold mb-2">30 Days</div>
              <div className="text-orange-100">Cookie Duration</div>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <section className="border-b bg-white sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex gap-8 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'how-it-works', label: 'How It Works' },
              { id: 'tiers', label: 'Commission Tiers' },
              { id: 'materials', label: 'Marketing Materials' },
              { id: 'faq', label: 'FAQ' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-2 font-medium border-b-2 transition-colors whitespace-nowrap ${
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
      </section>

      {/* Content Sections */}
      <div className="max-w-6xl mx-auto px-6 py-16">

        {/* Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-12">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Why Join Our Affiliate Program?</h2>
              <p className="text-xl text-gray-600">
                Earn recurring revenue while helping entrepreneurs build their dream businesses
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <BenefitCard
                icon="💰"
                title="Recurring Income"
                description="Earn 20-30% commission every month for as long as your referrals stay subscribed"
              />
              <BenefitCard
                icon="🚀"
                title="High Conversion"
                description="SUPERNova-LTE is priced at £26/month - affordable and valuable for entrepreneurs"
              />
              <BenefitCard
                icon="🎯"
                title="30-Day Cookie"
                description="Your referral link stays active for 30 days, giving you credit for delayed signups"
              />
              <BenefitCard
                icon="📊"
                title="Real-Time Analytics"
                description="Track clicks, signups, and earnings in your dedicated affiliate dashboard"
              />
              <BenefitCard
                icon="🎨"
                title="Marketing Materials"
                description="Access banners, email templates, social graphics, and more to promote effectively"
              />
              <BenefitCard
                icon="💳"
                title="Easy Payouts"
                description="Get paid via PayPal, bank transfer, or Stripe. Minimum payout is just £50"
              />
            </div>
          </div>
        )}

        {/* How It Works */}
        {activeTab === 'how-it-works' && (
          <div className="space-y-12">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">How It Works</h2>
              <p className="text-xl text-gray-600">
                Start earning in 4 simple steps
              </p>
            </div>

            <div className="space-y-8">
              <StepCard
                number="1"
                title="Sign Up Free"
                description="Create your affiliate account in under 2 minutes. No approval needed - start immediately!"
              />
              <StepCard
                number="2"
                title="Get Your Unique Link"
                description="Receive your personal referral link (e.g., thedaitaniverse.com?ref=YOURCODE) and tracking dashboard"
              />
              <StepCard
                number="3"
                title="Share & Promote"
                description="Share your link via social media, blog posts, email, YouTube, or anywhere your audience hangs out"
              />
              <StepCard
                number="4"
                title="Earn Commission"
                description="When someone signs up and subscribes through your link, you earn 20-30% monthly recurring commission!"
              />
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-8 mt-12">
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <span>💡</span> Example Earnings
              </h3>
              <div className="space-y-3 text-lg">
                <p>
                  <strong>5 referrals</strong> @ £26/month = <strong className="text-orange-500">£26/month</strong> (20% commission)
                </p>
                <p>
                  <strong>15 referrals</strong> @ £26/month = <strong className="text-orange-500">£97.50/month</strong> (25% commission)
                </p>
                <p>
                  <strong>100 referrals</strong> @ £26/month = <strong className="text-orange-500">£780/month</strong> (30% commission)
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Commission Tiers */}
        {activeTab === 'tiers' && programInfo && (
          <div className="space-y-12">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Commission Tiers</h2>
              <p className="text-xl text-gray-600">
                Earn more as you refer more customers
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {programInfo.tiers.map((tier, index) => (
                <TierCard
                  key={tier.name}
                  tier={tier}
                  featured={index === 1}
                />
              ))}
            </div>

            <div className="bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">Tier Upgrades Are Automatic</h3>
              <p className="text-lg text-orange-100">
                As you hit each referral milestone, we automatically upgrade your commission rate. No application needed!
              </p>
            </div>
          </div>
        )}

        {/* Marketing Materials */}
        {activeTab === 'materials' && (
          <div className="space-y-12">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Marketing Materials</h2>
              <p className="text-xl text-gray-600">
                Everything you need to promote successfully
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <MaterialPreview
                icon="🎨"
                title="Banner Ads"
                description="Various sizes (728x90, 300x250, 160x600) ready to use on your website or blog"
              />
              <MaterialPreview
                icon="📧"
                title="Email Templates"
                description="Pre-written email sequences that convert. Just add your referral link!"
              />
              <MaterialPreview
                icon="📱"
                title="Social Media Graphics"
                description="Eye-catching graphics for Instagram, Facebook, Twitter, and LinkedIn"
              />
              <MaterialPreview
                icon="🎥"
                title="Video Scripts"
                description="Proven video scripts for YouTube, TikTok, and Instagram Reels"
              />
              <MaterialPreview
                icon="📝"
                title="Blog Post Templates"
                description="SEO-optimized article templates you can customize and publish"
              />
              <MaterialPreview
                icon="💬"
                title="Landing Page Copy"
                description="High-converting sales copy for your landing pages"
              />
            </div>

            <div className="text-center">
              <button
                onClick={() => window.location.href = '/signup?ref=affiliate'}
                className="bg-orange-500 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-orange-600 transition-all shadow-lg"
              >
                Join Now to Access All Materials
              </button>
            </div>
          </div>
        )}

        {/* FAQ */}
        {activeTab === 'faq' && programInfo && (
          <div className="space-y-12">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Frequently Asked Questions</h2>
            </div>

            <div className="space-y-6 max-w-3xl mx-auto">
              <FAQItem
                question="How much can I earn?"
                answer={`You earn ${programInfo.tiers[0].commissionRate * 100}%-${programInfo.tiers[2].commissionRate * 100}% commission on every paying customer you refer. With SUPERNova-LTE at £26/month, that's £5.20-£7.80 per referral per month, recurring!`}
              />
              <FAQItem
                question="When do I get paid?"
                answer={`Payouts are processed monthly. Minimum payout is £${programInfo.terms.minimumPayout}. We support ${programInfo.terms.paymentMethods.join(', ')}.`}
              />
              <FAQItem
                question="How long is the cookie duration?"
                answer={`${programInfo.terms.cookieDuration} days. If someone clicks your link and signs up within ${programInfo.terms.cookieDuration} days, you get credit for the referral.`}
              />
              <FAQItem
                question="Is there an approval process?"
                answer="No! Sign up and start promoting immediately. Your unique referral link is generated instantly."
              />
              <FAQItem
                question="What happens if someone cancels?"
                answer={`Commissions are held for ${programInfo.terms.commissionHoldPeriod} days to account for refunds. After ${programInfo.terms.commissionHoldPeriod} days, they're approved and included in your next payout. If someone cancels, you stop earning commission on that referral.`}
              />
              <FAQItem
                question="Can I promote on paid ads?"
                answer="Yes! You can promote via Google Ads, Facebook Ads, YouTube Ads, or any other advertising platform. Just make sure to follow our brand guidelines."
              />
              <FAQItem
                question="Do I need a website?"
                answer="No. While having a blog or website helps, you can promote via social media, YouTube, email lists, forums, or anywhere your audience is."
              />
              <FAQItem
                question="How are tiers determined?"
                answer="Tiers are based on your total active referrals (people currently subscribed). As you grow, your commission rate automatically increases."
              />
            </div>
          </div>
        )}

      </div>

      {/* Final CTA */}
      <section className="bg-gradient-to-r from-orange-500 to-pink-500 text-white py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Start Earning?
          </h2>
          <p className="text-xl mb-8 text-orange-100">
            Join hundreds of affiliates already earning recurring income with The dAItaniverse
          </p>
          <button
            onClick={() => window.location.href = '/signup?ref=affiliate'}
            className="bg-white text-orange-500 px-12 py-5 rounded-lg font-bold text-xl hover:bg-gray-100 transition-all shadow-2xl"
          >
            Join the Affiliate Program Now
          </button>
          <p className="mt-4 text-orange-100">
            Free to join • No monthly fees • Instant approval
          </p>
        </div>
      </section>

    </div>
  );
}

function BenefitCard({ icon, title, description }) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-all">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function StepCard({ number, title, description }) {
  return (
    <div className="flex gap-6 items-start">
      <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-orange-500 to-pink-500 text-white rounded-full flex items-center justify-center text-2xl font-bold">
        {number}
      </div>
      <div className="flex-1">
        <h3 className="text-2xl font-bold mb-2">{title}</h3>
        <p className="text-gray-600 text-lg">{description}</p>
      </div>
    </div>
  );
}

function TierCard({ tier, featured }) {
  return (
    <div className={`rounded-lg p-8 ${
      featured
        ? 'bg-gradient-to-br from-orange-500 to-pink-500 text-white shadow-2xl scale-105'
        : 'bg-white shadow-lg'
    }`}>
      {featured && (
        <div className="text-center mb-4">
          <span className="bg-white text-orange-500 px-4 py-1 rounded-full text-sm font-bold">
            MOST POPULAR
          </span>
        </div>
      )}
      <h3 className="text-3xl font-bold mb-2">{tier.name}</h3>
      <div className="text-5xl font-bold mb-4">
        {tier.commissionRate * 100}%
      </div>
      <p className={`text-sm mb-6 ${featured ? 'text-orange-100' : 'text-gray-600'}`}>
        {tier.requirements}
      </p>
      <div className="space-y-3">
        {tier.benefits.map((benefit, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className={featured ? 'text-white' : 'text-green-500'}>✓</span>
            <span className={featured ? 'text-orange-100' : 'text-gray-700'}>
              {benefit}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MaterialPreview({ icon, title, description }) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-lg border border-gray-200 hover:border-orange-300 transition-all">
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function FAQItem({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
      >
        <span className="font-bold text-lg">{question}</span>
        <span className="text-2xl text-orange-500">
          {isOpen ? '−' : '+'}
        </span>
      </button>
      {isOpen && (
        <div className="px-6 py-4 bg-gray-50 border-t">
          <p className="text-gray-700">{answer}</p>
        </div>
      )}
    </div>
  );
}
