/**
 * Pricing Page
 * Public pricing page showing all membership tiers
 */

import { useState, useEffect } from 'react';

export default function PricingPage() {
  const [tiers, setTiers] = useState([]);
  const [billingPeriod, setBillingPeriod] = useState('monthly'); // 'monthly' or 'yearly'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTiers();
  }, []);

  const fetchTiers = async () => {
    try {
      const response = await fetch('/api/membership/tiers');
      if (!response.ok) {
        throw new Error('Failed to fetch tiers');
      }
      const data = await response.json();
      setTiers(data);
    } catch (error) {
      console.error('Error fetching tiers:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading pricing...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50 py-20">
      <div className="max-w-7xl mx-auto px-4">

        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Build your empire at a price that doesn't require selling a kidney 💰
          </p>

          {/* Billing toggle */}
          <div className="inline-flex bg-white rounded-lg p-1 shadow-md">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                billingPeriod === 'monthly'
                  ? 'bg-orange-500 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                billingPeriod === 'yearly'
                  ? 'bg-orange-500 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Yearly
              <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                Save 17%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {tiers.map(tier => {
            const price = billingPeriod === 'yearly'
              ? tier.priceYearly || tier.priceMonthly * 12
              : tier.priceMonthly;

            const monthlyEquivalent = billingPeriod === 'yearly'
              ? (price / 12).toFixed(2)
              : price;

            return (
              <PricingCard
                key={tier.id}
                tier={tier}
                price={price}
                monthlyEquivalent={monthlyEquivalent}
                billingPeriod={billingPeriod}
              />
            );
          })}
        </div>

        {/* FAQ Section */}
        <FAQSection />

      </div>
    </div>
  );
}

/**
 * Individual Pricing Card
 */
function PricingCard({ tier, price, monthlyEquivalent, billingPeriod }) {
  const handleCTA = () => {
    if (tier.slug === 'enterprise') {
      window.location.href = '/contact-sales';
    } else {
      window.location.href = `/signup?tier=${tier.slug}&billing=${billingPeriod}`;
    }
  };

  return (
    <div
      className={`bg-white rounded-2xl shadow-xl p-8 relative transition-all hover:shadow-2xl ${
        tier.featured
          ? 'border-4 border-orange-500 transform md:scale-105'
          : 'border border-gray-200'
      }`}
    >
      {tier.featured && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-bold">
            {tier.tagline}
          </span>
        </div>
      )}

      {/* Icon & Name */}
      <div className="text-center mb-6">
        <div className="text-5xl mb-3">{tier.icon}</div>
        <h3 className="text-2xl font-bold text-gray-900">{tier.name}</h3>
        <p className="text-gray-600 mt-2">{tier.description}</p>
      </div>

      {/* Price */}
      <div className="text-center mb-8">
        {price === 0 ? (
          <div className="text-5xl font-bold">Free</div>
        ) : tier.slug === 'enterprise' ? (
          <div>
            <div className="text-3xl font-bold">Custom Pricing</div>
            <div className="text-sm text-gray-500 mt-2">Contact us for a quote</div>
          </div>
        ) : (
          <>
            <div className="text-5xl font-bold">
              £{monthlyEquivalent}
              <span className="text-xl text-gray-600">/mo</span>
            </div>
            {billingPeriod === 'yearly' && (
              <div className="text-sm text-gray-500 mt-2">
                £{price} billed annually
              </div>
            )}
            {tier.trialDays > 0 && (
              <div className="text-sm text-green-600 mt-2 font-medium">
                {tier.trialDays}-day free trial
              </div>
            )}
          </>
        )}
      </div>

      {/* CTA Button */}
      <button
        onClick={handleCTA}
        className={`w-full py-3 rounded-lg font-bold mb-8 transition-all ${
          tier.featured
            ? 'bg-orange-500 hover:bg-orange-600 text-white transform hover:scale-105'
            : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
        }`}
      >
        {tier.slug === 'enterprise' ? 'Contact Sales' : 'Get Started'}
      </button>

      {/* Features */}
      <div className="space-y-3">
        {tier.features.map((feature, i) => (
          <div key={i} className="flex items-start gap-3">
            <span className={`text-xl flex-shrink-0 ${
              feature.included ? 'text-green-500' : 'text-gray-300'
            }`}>
              {feature.included ? '✓' : '✗'}
            </span>
            <span className={`${
              feature.included ? 'text-gray-700' : 'text-gray-400 line-through'
            }`}>
              {feature.name}
            </span>
          </div>
        ))}
      </div>

    </div>
  );
}

/**
 * FAQ Section
 */
function FAQSection() {
  const faqs = [
    {
      question: 'Can I change plans later?',
      answer: 'Absolutely! Upgrade or downgrade anytime. Changes take effect immediately, and we\'ll prorate any charges.'
    },
    {
      question: 'Is there a free trial?',
      answer: 'Yes! SUPERNova-LTE comes with a 14-day free trial. No credit card required to start.'
    },
    {
      question: 'What if I hit my limits?',
      answer: 'You can upgrade your plan or purchase add-ons for extra storage, emails, or other resources. We\'ll notify you before you hit any limits.'
    },
    {
      question: 'Can I cancel anytime?',
      answer: 'Yes, cancel anytime with no penalties or questions asked. You\'ll keep access until the end of your billing period.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, Mastercard, Amex) via Stripe. For Enterprise plans, we also accept bank transfers and purchase orders.'
    },
    {
      question: 'Do you offer refunds?',
      answer: 'Yes, we offer a 30-day money-back guarantee. If you\'re not happy, we\'ll refund you - no questions asked.'
    },
    {
      question: 'What about taxes?',
      answer: 'Prices shown are before any applicable taxes. VAT will be added for UK customers. We handle all tax calculations automatically at checkout.'
    },
    {
      question: 'Can I get a custom plan?',
      answer: 'Absolutely! For unique requirements or high-volume needs, check out our Enterprise plan or contact us to create a custom solution.'
    }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-xl p-12">
      <h2 className="text-3xl font-bold text-center mb-8">
        Frequently Asked Questions
      </h2>

      <div className="grid md:grid-cols-2 gap-8">
        {faqs.map((faq, index) => (
          <div key={index}>
            <h3 className="font-bold text-lg mb-2 text-gray-900">
              {faq.question}
            </h3>
            <p className="text-gray-600">
              {faq.answer}
            </p>
          </div>
        ))}
      </div>

      {/* Contact CTA */}
      <div className="mt-12 pt-8 border-t border-gray-200 text-center">
        <p className="text-gray-600 mb-4">
          Still have questions?
        </p>
        <a
          href="/contact"
          className="inline-block bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-bold transition-all"
        >
          Contact Us
        </a>
      </div>
    </div>
  );
}
