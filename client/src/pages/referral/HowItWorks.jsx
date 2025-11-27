import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function HowItWorks() {
  const navigate = useNavigate();

  const milestones = [
    { count: 5, reward: '1 extra month free', icon: '🎖️', color: 'from-blue-500 to-cyan-500' },
    { count: 10, reward: '3 months free', icon: '🏆', color: 'from-purple-500 to-pink-500' },
    { count: 25, reward: '6 months free', icon: '⭐', color: 'from-yellow-500 to-orange-500' },
    { count: 50, reward: 'Lifetime FREE!', icon: '👑', color: 'from-green-500 to-emerald-500' }
  ];

  const faqs = [
    {
      question: 'Is there a limit to how many people I can refer?',
      answer: 'No! You can refer unlimited people and earn unlimited rewards.'
    },
    {
      question: 'When do I get my reward?',
      answer: 'You receive your reward immediately when your referral subscribes to a paid plan. The reward is automatically applied to your account.'
    },
    {
      question: 'Can I cash out my rewards?',
      answer: 'Yes! Once you accumulate £50 or more in credits, you can withdraw to PayPal. Otherwise, rewards are applied as free months to your subscription.'
    },
    {
      question: 'Do rewards expire?',
      answer: 'No, your rewards never expire. They roll over and accumulate as you refer more people.'
    },
    {
      question: 'What if someone uses my link but doesn\'t subscribe right away?',
      answer: 'The referral cookie lasts for 30 days, so if they sign up within 30 days of clicking your link and later subscribe, you still get credit!'
    },
    {
      question: 'What happens if my referral cancels their subscription?',
      answer: 'You keep the reward you already earned. However, to qualify for milestone bonuses, only currently active subscribers count.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-4">How The Referral Program Works</h1>
          <p className="text-2xl text-purple-100">
            It's simple: Share your link, earn rewards!
          </p>
        </div>
      </div>

      {/* Steps */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {/* Step 1 */}
          <div className="text-center">
            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">1. Share Your Link</h3>
            <p className="text-gray-600">
              Get your unique referral link from your dashboard and share it with friends, family, or your audience via email, social media, or WhatsApp.
            </p>
          </div>

          {/* Step 2 */}
          <div className="text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">2. They Sign Up</h3>
            <p className="text-gray-600">
              Your friends get <strong>1 month FREE</strong> when they use your link to sign up. You'll get notified when someone joins.
            </p>
          </div>

          {/* Step 3 */}
          <div className="text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">3. You Get Rewarded</h3>
            <p className="text-gray-600">
              When they become a paying customer, you get <strong>1 month FREE</strong> (or £26 credit) automatically added to your account!
            </p>
          </div>
        </div>

        {/* Bonus Milestones */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">Bonus Milestones</h2>
          <p className="text-xl text-gray-600 text-center mb-8">
            The more you refer, the bigger the rewards!
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {milestones.map((milestone, index) => (
              <div key={index} className="text-center">
                <div className={`bg-gradient-to-br ${milestone.color} rounded-2xl p-6 text-white mb-4`}>
                  <div className="text-6xl mb-3">{milestone.icon}</div>
                  <div className="text-4xl font-bold mb-2">{milestone.count}</div>
                  <div className="text-sm opacity-90">referrals</div>
                </div>
                <div className="font-bold text-gray-900 text-lg">{milestone.reward}</div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border-2 border-yellow-300">
            <div className="flex items-start gap-4">
              <div className="text-4xl">🎁</div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">Milestone Bonuses Stack!</h3>
                <p className="text-gray-700">
                  These bonuses are <strong>in addition</strong> to your regular referral rewards. Refer 50 people and you've earned:
                </p>
                <ul className="mt-3 space-y-1 text-gray-700">
                  <li>• 50 months free (one for each referral)</li>
                  <li>• 1 bonus month (5 referrals milestone)</li>
                  <li>• 3 bonus months (10 referrals milestone)</li>
                  <li>• 6 bonus months (25 referrals milestone)</li>
                  <li>• <strong>Lifetime FREE</strong> (50 referrals milestone)</li>
                </ul>
                <p className="mt-3 font-bold text-purple-600">That's over 60 months of value + lifetime access!</p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Frequently Asked Questions</h2>

          <div className="space-y-4 max-w-3xl mx-auto">
            {faqs.map((faq, index) => (
              <details key={index} className="bg-white rounded-lg shadow p-6 group">
                <summary className="font-semibold text-gray-900 cursor-pointer list-none flex items-center justify-between">
                  {faq.question}
                  <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <p className="mt-4 text-gray-600">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <button
            onClick={() => navigate('/referrals')}
            className="bg-purple-600 hover:bg-purple-700 text-white px-12 py-4 rounded-lg text-xl font-bold transition-colors shadow-lg"
          >
            Start Referring Now
          </button>
          <p className="mt-4 text-gray-600">
            Ready to earn rewards? Get your referral link and start sharing!
          </p>
        </div>
      </div>
    </div>
  );
}
