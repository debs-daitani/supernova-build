'use client'

import Footer from '@/components/marketing/Footer'

export default function AboutPage() {
  return (
    <main>
      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden pt-20 pb-16">
        <div className="absolute inset-0 bg-black"></div>
        <div className="absolute top-10 left-10 w-40 h-40 bg-light-teal rounded-full blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-hot-pink rounded-full blur-3xl opacity-20 animate-pulse"></div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <h1 className="font-supernova text-5xl md:text-7xl font-bold mb-6 text-white leading-tight">
            About dAItaniverse
          </h1>
          <p className="font-josefin text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            We're building the future of entrepreneurship. Bold. Direct. Authentic. No BS.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-6 bg-black">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-supernova text-4xl font-bold text-white mb-8 text-center">
            Our Mission
          </h2>
          <div className="prose prose-invert max-w-none">
            <p className="font-josefin text-lg text-gray-300 mb-6 leading-relaxed">
              We believe entrepreneurs—especially those with ADHD—deserve better. Better tools. Better support. Better outcomes.
            </p>
            <p className="font-josefin text-lg text-gray-300 mb-6 leading-relaxed">
              Tired of juggling 10+ different tools? Drowning in complexity when you should be building? Struggling with tools that don't understand how your brain works?
            </p>
            <p className="font-josefin text-lg text-gray-300 mb-6 leading-relaxed">
              dAItaniverse is different. We've built one integrated platform that brings together everything you need: AI coaching, project management, quiz building, CRM, email marketing, and more.
            </p>
            <p className="font-josefin text-lg text-gray-300 leading-relaxed">
              <strong>Life-first entrepreneurship.</strong> Your business should support your life, not consume it. We're committed to building a platform that respects your time, energy, and authentic self.
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 px-6 bg-charcoal/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-supernova text-4xl font-bold text-white mb-12 text-center">
            Why We Built This
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 rounded-2xl bg-gradient-to-br from-charcoal/50 to-charcoal/20 border border-charcoal">
              <h3 className="font-supernova text-2xl font-bold text-hot-pink mb-4">The Problem</h3>
              <ul className="font-josefin text-gray-300 space-y-3">
                <li className="flex items-start">
                  <span className="text-hot-pink mr-3">✕</span>
                  <span>10+ different tools to manage</span>
                </li>
                <li className="flex items-start">
                  <span className="text-hot-pink mr-3">✕</span>
                  <span>Constant context switching</span>
                </li>
                <li className="flex items-start">
                  <span className="text-hot-pink mr-3">✕</span>
                  <span>ADHD brains overwhelmed by complexity</span>
                </li>
                <li className="flex items-start">
                  <span className="text-hot-pink mr-3">✕</span>
                  <span>Expensive subscriptions adding up</span>
                </li>
                <li className="flex items-start">
                  <span className="text-hot-pink mr-3">✕</span>
                  <span>No AI support when you need it</span>
                </li>
              </ul>
            </div>

            <div className="p-8 rounded-2xl bg-gradient-to-br from-light-teal/20 to-charcoal/20 border border-light-teal">
              <h3 className="font-supernova text-2xl font-bold text-light-teal mb-4">Our Solution</h3>
              <ul className="font-josefin text-gray-300 space-y-3">
                <li className="flex items-start">
                  <span className="text-light-teal mr-3">✓</span>
                  <span>One integrated platform</span>
                </li>
                <li className="flex items-start">
                  <span className="text-light-teal mr-3">✓</span>
                  <span>Zero context switching</span>
                </li>
                <li className="flex items-start">
                  <span className="text-light-teal mr-3">✓</span>
                  <span>ADHD-friendly design</span>
                </li>
                <li className="flex items-start">
                  <span className="text-light-teal mr-3">✓</span>
                  <span>Just £26/month. Everything included.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-light-teal mr-3">✓</span>
                  <span>AI coaching 24/7</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Founder Section */}
      <section className="py-20 px-6 bg-black">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-supernova text-4xl font-bold text-white mb-12">
            Meet the Founder
          </h2>
          <div className="flex flex-col items-center">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-hot-pink to-light-teal mb-6 flex items-center justify-center">
              <span className="text-5xl">👩‍💻</span>
            </div>
            <h3 className="font-supernova text-3xl font-bold text-white mb-2">
              Deb Daitani
            </h3>
            <p className="font-josefin text-light-teal text-lg mb-6">
              Founder & CEO of dAItaniverse
            </p>
            <p className="font-josefin text-gray-300 text-lg max-w-2xl leading-relaxed mb-6">
              After building multiple successful businesses while managing ADHD, Deb realized the entrepreneurship world wasn't built for ADHD brains. Instead of accepting that, she built dAItaniverse—the platform she needed.
            </p>
            <p className="font-josefin text-gray-300 text-lg max-w-2xl leading-relaxed">
              Deb is passionate about helping other ADHD entrepreneurs build bold, authentic businesses without sacrificing their wellbeing. She believes in radical transparency, direct communication, and putting life first.
            </p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-6 bg-charcoal/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-supernova text-4xl font-bold text-white mb-16 text-center">
            Our Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="p-8 rounded-2xl bg-gradient-to-br from-charcoal/50 to-charcoal/20 border border-charcoal text-center">
              <div className="text-5xl mb-4">⚡</div>
              <h3 className="font-supernova text-2xl font-bold text-hot-pink mb-3">Bold</h3>
              <p className="font-josefin text-gray-300">
                We say what we think. No corporate speak. No BS. Just honest, direct communication.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-gradient-to-br from-charcoal/50 to-charcoal/20 border border-charcoal text-center">
              <div className="text-5xl mb-4">🎯</div>
              <h3 className="font-supernova text-2xl font-bold text-light-teal mb-3">Direct</h3>
              <p className="font-josefin text-gray-300">
                No fluff. No complexity. Simple, straightforward solutions that actually work.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-gradient-to-br from-charcoal/50 to-charcoal/20 border border-charcoal text-center">
              <div className="text-5xl mb-4">✨</div>
              <h3 className="font-supernova text-2xl font-bold text-neon-lime mb-3">Authentic</h3>
              <p className="font-josefin text-gray-300">
                We celebrate your weirdness. Your quirks. Your ADHD. That's where the magic happens.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-gradient-to-br from-charcoal/50 to-charcoal/20 border border-charcoal text-center">
              <div className="text-5xl mb-4">❤️</div>
              <h3 className="font-supernova text-2xl font-bold text-hot-pink mb-3">Compassionate</h3>
              <p className="font-josefin text-gray-300">
                We get it. Running a business is hard. We're here to support, not judge.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-hot-pink/10 to-light-teal/10 border-t border-b border-charcoal">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-supernova text-4xl md:text-5xl font-bold text-white mb-6">
            Join the Movement
          </h2>
          <p className="font-josefin text-lg text-gray-300 mb-8">
            Be part of a community of ADHD entrepreneurs building bold, authentic businesses.
          </p>
          <a
            href="/checkout"
            className="inline-block px-10 py-4 bg-hot-pink hover:bg-[#ff1b7f] text-white font-bold text-lg rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-[0_0_30px_rgba(255,0,142,0.5)]"
          >
            Start Your Free Trial
          </a>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </main>
  )
}
