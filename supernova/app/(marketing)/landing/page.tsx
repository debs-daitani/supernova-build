'use client'

import Hero from '@/components/marketing/Hero'
import FeatureGrid from '@/components/marketing/FeatureGrid'
import PricingCard from '@/components/marketing/PricingCard'
import Testimonials from '@/components/marketing/Testimonial'
import Footer from '@/components/marketing/Footer'

export default function LandingPage() {
  const features = [
    {
      icon: (
        <svg className="w-8 h-8 text-hot-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
      ),
      title: 'SUPERNova AI Coach',
      description: 'Your personal AI coaching assistant. Bold, direct, ADHD-friendly guidance for your body, brain, and business.'
    },
    {
      icon: (
        <svg className="w-8 h-8 text-light-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3v3m-6-1v-6a2 2 0 012-2h12a2 2 0 012 2v6m-15-3v6a2 2 0 002 2h12a2 2 0 002-2v-6" />
        </svg>
      ),
      title: 'Quiz Builder',
      description: 'Create engaging quizzes and assessments in minutes. No coding required. Powerful segmentation and analytics.'
    },
    {
      icon: (
        <svg className="w-8 h-8 text-neon-lime" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-2a6 6 0 0112 0v2zm0 0h6v-2a6 6 0 00-9-5.666" />
        </svg>
      ),
      title: 'CRM System',
      description: 'Manage all your customer relationships. Track leads, nurture relationships, and close deals faster.'
    },
    {
      icon: (
        <svg className="w-8 h-8 text-hot-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      title: 'Email Marketing',
      description: 'Send beautiful email campaigns. Automate sequences, segment audiences, and track performance in real-time.'
    },
    {
      icon: (
        <svg className="w-8 h-8 text-light-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      title: 'VENUED Project Management',
      description: 'Organize your projects, tasks, and deadlines. Built with ADHD brains in mind. Simple, visual, powerful.'
    },
    {
      icon: (
        <svg className="w-8 h-8 text-neon-lime" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C6.5 6.253 2 10.998 2 17.25c0 5.25 3.07 9.338 7.5 11.286m0-13c5.5 0 10 4.745 10 10.25 0 5.25-2.07 9.338-6.5 11.286" />
        </svg>
      ),
      title: 'Knowledge Library',
      description: 'Access a library of resources, guides, and training materials. Everything you need to succeed.'
    },
  ]

  const testimonials = [
    {
      quote: 'This platform has been a game-changer for my business. Finally, everything in one place!',
      author: 'Sarah Johnson',
      role: 'Course Creator & Coach',
    },
    {
      quote: 'The AI coaching feature is incredible. It\'s like having a business coach available 24/7.',
      author: 'Marcus Chen',
      role: 'Digital Entrepreneur',
    },
    {
      quote: 'As an ADHD entrepreneur, this is the only platform that actually gets how I work.',
      author: 'Jessica Williams',
      role: 'E-commerce Owner',
    },
  ]

  return (
    <main>
      {/* Hero Section */}
      <Hero
        title="The All-in-One Platform for ADHD Entrepreneurs"
        subtitle="AI Coaching + Project Management + Quiz Builder + CRM + Email Marketing. No BS. Just Results."
        ctaText="Start Free Trial"
        ctaHref="/checkout"
      />

      {/* Features Section */}
      <FeatureGrid features={features} columns={3} />

      {/* Social Proof Section */}
      <Testimonials testimonials={testimonials} />

      {/* Pricing Teaser Section */}
      <section className="py-20 px-6 bg-black relative">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-hot-pink rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-light-teal rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="font-supernova text-4xl md:text-5xl font-bold text-white mb-6">
            Simple, Transparent Pricing
          </h2>
          <p className="font-josefin text-xl text-gray-300 mb-12">
            One plan. Everything included. No hidden fees. Cancel anytime.
          </p>

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
              ]}
              highlighted={true}
              trial="7-day free trial"
            />
          </div>

          <p className="font-josefin text-gray-400 mt-8">
            No credit card required for free trial. Cancel anytime, no questions asked.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-hot-pink/10 to-light-teal/10 border-t border-b border-charcoal">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-supernova text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to transform your business?
          </h2>
          <p className="font-josefin text-lg text-gray-300 mb-8">
            Join thousands of ADHD entrepreneurs who are already using dAItaniverse to build their dream businesses.
          </p>
          <a
            href="/checkout"
            className="inline-block px-10 py-4 bg-hot-pink hover:bg-[#ff1b7f] text-white font-bold text-lg rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-[0_0_30px_rgba(255,0,142,0.5)]"
          >
            Start Your Free Trial Today
          </a>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </main>
  )
}
