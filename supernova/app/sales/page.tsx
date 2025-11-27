'use client'

import Hero from '@/components/marketing/Hero'
import PricingCard from '@/components/marketing/PricingCard'
import FAQ from '@/components/marketing/FAQ'
import Footer from '@/components/marketing/Footer'

export default function SalesPage() {
  const faqItems = [
    {
      question: 'What\'s included in the £26/month membership?',
      answer: 'Everything. Unlimited AI coaching, quiz builder, CRM, email marketing, VENUED project management, knowledge library, and priority support. No hidden fees, no upsells.'
    },
    {
      question: 'Is there really a 7-day free trial?',
      answer: 'Yes. No credit card required. Full access to all features. If you love it, continue at £26/month. If not, cancel anytime.'
    },
    {
      question: 'What happens after my free trial ends?',
      answer: 'We\'ll send you a reminder before your trial ends. If you want to continue, you\'ll be charged £26 on the first day of your billing cycle. If you want to cancel, just let us know.'
    },
    {
      question: 'Can I cancel anytime?',
      answer: 'Yes. No long-term contracts. No penalties. Cancel anytime from your account settings. Your access ends immediately.'
    },
    {
      question: 'Who is this for?',
      answer: 'ADHD entrepreneurs, coaches, course creators, and small business owners who are tired of juggling multiple tools. If you need one integrated platform, this is for you.'
    },
    {
      question: 'How does the AI coach work?',
      answer: 'The AI coach is available 24/7 in the app. Ask questions about your business, get coaching on challenges, brainstorm ideas, or just vent. It\'s like having a business coach in your pocket.'
    },
    {
      question: 'Can I use this for my team?',
      answer: 'Currently designed for individuals and solopreneurs. Team features are coming soon. Join our waitlist if you\'re interested.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit and debit cards through Stripe. Payments are secure and encrypted.'
    },
    {
      question: 'Do you offer refunds?',
      answer: 'We offer a 7-day free trial so you can test everything risk-free. After that, refunds aren\'t available, but you can cancel anytime.'
    },
    {
      question: 'Is my data safe?',
      answer: 'Yes. We use enterprise-grade security, encrypt all data in transit and at rest, and comply with GDPR. Your data is yours. Read our privacy policy for details.'
    },
  ]

  const features = [
    {
      title: 'SUPERNova AI Coach',
      items: [
        'Real-time AI coaching conversations',
        'Personalized advice for your business',
        'Available 24/7',
        'ADHD-friendly coaching style',
      ]
    },
    {
      title: 'Quiz Builder',
      items: [
        'Unlimited quizzes and surveys',
        'Beautiful, mobile-responsive designs',
        'Instant analytics and insights',
        'Email capture and lead segmentation',
      ]
    },
    {
      title: 'CRM System',
      items: [
        'Manage unlimited contacts',
        'Track communication history',
        'Automate workflows',
        'Advanced search and filtering',
      ]
    },
    {
      title: 'Email Marketing',
      items: [
        'Create beautiful email campaigns',
        'Automated email sequences',
        'Segment your audience',
        'Detailed performance tracking',
      ]
    },
    {
      title: 'VENUED Project Management',
      items: [
        'Visual project boards',
        'Task management with deadlines',
        'Collaboration tools',
        'Progress tracking and reporting',
      ]
    },
    {
      title: 'Knowledge Library',
      items: [
        'Curated resources and guides',
        'Video tutorials',
        'Best practices and strategies',
        'Regular updates and new content',
      ]
    },
  ]

  return (
    <main>
      {/* Hero Section */}
      <Hero
        title="Stop Juggling 10 Tools"
        subtitle="Get one integrated platform for everything. AI coaching, project management, quiz builder, CRM, email marketing. Everything you need. Nothing you don't. £26/month."
        ctaText="Start Your Free Trial"
        ctaHref="/checkout"
      />

      {/* Problem Section */}
      <section className="py-20 px-6 bg-charcoal/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-supernova text-4xl font-bold text-white mb-12 text-center">
            The Problem
          </h2>
          <div className="space-y-6">
            <div className="flex items-start">
              <div className="text-3xl mr-4">🔴</div>
              <div>
                <h3 className="font-bold text-white text-lg mb-2 font-supernova">Tool Overload</h3>
                <p className="font-josefin text-gray-300">You're paying for 10+ different subscriptions. Email marketing here, CRM there, project management somewhere else. It's chaos.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="text-3xl mr-4">🔴</div>
              <div>
                <h3 className="font-bold text-white text-lg mb-2 font-supernova">Context Switching Kills Productivity</h3>
                <p className="font-josefin text-gray-300">Every tool switch costs mental energy. For ADHD brains, that's a killer.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="text-3xl mr-4">🔴</div>
              <div>
                <h3 className="font-bold text-white text-lg mb-2 font-supernova">Data Lives in Silos</h3>
                <p className="font-josefin text-gray-300">Your customer info is scattered across platforms. You can't get a unified view of what's actually happening in your business.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="text-3xl mr-4">🔴</div>
              <div>
                <h3 className="font-bold text-white text-lg mb-2 font-supernova">No Real Support</h3>
                <p className="font-josefin text-gray-300">You're stuck with generic AI chatbots and outdated help docs. You need real coaching, not autoresponders.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="text-3xl mr-4">🔴</div>
              <div>
                <h3 className="font-bold text-white text-lg mb-2 font-supernova">Costs Are Out of Control</h3>
                <p className="font-josefin text-gray-300">£50 for CRM + £40 for email + £30 for project management + coaching... it adds up fast.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20 px-6 bg-black">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-supernova text-4xl font-bold text-white mb-12 text-center">
            The Solution
          </h2>
          <div className="space-y-6">
            <div className="flex items-start">
              <div className="text-3xl mr-4">✅</div>
              <div>
                <h3 className="font-bold text-white text-lg mb-2 font-supernova">One Integrated Platform</h3>
                <p className="font-josefin text-gray-300">Everything in one place. No switching between apps. No learning curves. Just intuitive, ADHD-friendly design.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="text-3xl mr-4">✅</div>
              <div>
                <h3 className="font-bold text-white text-lg mb-2 font-supernova">Unified Data Ecosystem</h3>
                <p className="font-josefin text-gray-300">Your customers, leads, projects, and campaigns all connected. See the complete picture of your business.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="text-3xl mr-4">✅</div>
              <div>
                <h3 className="font-bold text-white text-lg mb-2 font-supernova">AI Coaching Available 24/7</h3>
                <p className="font-josefin text-gray-300">Bold, direct, ADHD-friendly coaching whenever you need it. Ask questions. Get advice. Build faster.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="text-3xl mr-4">✅</div>
              <div>
                <h3 className="font-bold text-white text-lg mb-2 font-supernova">Built for ADHD Brains</h3>
                <p className="font-josefin text-gray-300">Clean interface. Clear workflows. Minimal decision paralysis. Everything designed to work with your brain, not against it.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="text-3xl mr-4">✅</div>
              <div>
                <h3 className="font-bold text-white text-lg mb-2 font-supernova">Transparent, Affordable Pricing</h3>
                <p className="font-josefin text-gray-300">Just £26/month. Everything included. No hidden fees. Cancel anytime.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Breakdown Section */}
      <section className="py-20 px-6 bg-charcoal/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-supernova text-4xl font-bold text-white mb-16 text-center">
            Feature Breakdown
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-8 rounded-2xl bg-gradient-to-br from-charcoal/50 to-charcoal/20 border border-charcoal hover:border-hot-pink/50 transition-all"
              >
                <h3 className="font-supernova text-2xl font-bold text-hot-pink mb-6">
                  {feature.title}
                </h3>
                <ul className="space-y-3">
                  {feature.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start">
                      <svg className="w-5 h-5 text-light-teal mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="font-josefin text-gray-300 text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-6 bg-black">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-supernova text-4xl font-bold text-white mb-16 text-center">
            Transparent Pricing
          </h2>
          <div className="flex justify-center">
            <PricingCard
              title="Full Access"
              price="£26"
              period="month"
              description="Everything you need to run your business"
              features={[
                'Unlimited AI coaching conversations',
                'Quiz builder with unlimited quizzes',
                'CRM with unlimited contacts',
                'Email marketing with unlimited campaigns',
                'VENUED project management',
                'Knowledge library access',
                'Priority support',
                '7-day free trial',
                'Cancel anytime, no questions asked',
              ]}
              highlighted={true}
              trial="7-day free trial"
            />
          </div>
          <p className="font-josefin text-gray-400 text-center mt-8">
            No credit card required for your free trial. No hidden fees. No surprises. Cancel anytime from your account.
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <FAQ items={faqItems} title="Questions? We've Got Answers" />

      {/* Guarantee Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-hot-pink/10 to-light-teal/10 border-y border-charcoal">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-6xl mb-6">🛡️</div>
          <h2 className="font-supernova text-4xl font-bold text-white mb-6">
            Our Guarantee
          </h2>
          <p className="font-josefin text-lg text-gray-300 mb-8">
            Try it free for 7 days. No credit card required. If you don't love it, cancel anytime. No questions. No judgment. Your satisfaction is the only thing that matters to us.
          </p>
          <a
            href="/checkout"
            className="inline-block px-10 py-4 bg-hot-pink hover:bg-[#ff1b7f] text-white font-bold text-lg rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-[0_0_30px_rgba(255,0,142,0.5)]"
          >
            Start Your Free Trial Now
          </a>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </main>
  )
}
