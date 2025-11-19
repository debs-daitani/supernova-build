import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-heading font-bold gradient-text">
            SUPERNova AI
          </h1>
          <div className="flex gap-4">
            <Link to="/login">
              <Button variant="ghost">Log In</Button>
            </Link>
            <Link to="/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-5xl md:text-6xl font-heading font-bold mb-6">
          Confident <span className="gradient-text">Living</span> Made Easy
        </h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Your ADHD-friendly AI coach for mastering Body, Brain & Business.
          Chat with SUPERNova AI and unlock your full potential.
        </p>
        <Link to="/signup">
          <Button size="lg" className="text-xl px-12">
            Start Free Chat
          </Button>
        </Link>
      </section>

      {/* Three Pillars */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-heading font-bold text-center mb-12">
            The Three Pillars
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <PillarCard
              icon="💪"
              title="Confident Body"
              description="Health, fitness, nutrition & energy optimisation. Build a body that supports your ambitions."
              color="green"
            />
            <PillarCard
              icon="🧠"
              title="Confident Brain"
              description="Mental clarity, ADHD strategies & personal growth. Master your mindset and unlock peak performance."
              color="purple"
            />
            <PillarCard
              icon="💼"
              title="Confident Business"
              description="Entrepreneurship, marketing & business growth. Turn your ideas into profitable realities."
              color="blue"
            />
          </div>
        </div>
      </section>

      {/* SUPERNova Preview */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-3xl font-heading font-bold text-center mb-6">
            Meet SUPERNova AI
          </h3>
          <p className="text-center text-gray-600 mb-12">
            Your personalised AI coach that remembers everything about you
          </p>
          <div className="bg-gray-900 rounded-lg p-6 text-white shadow-2xl">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <div className="space-y-4">
              <div className="bg-gray-800 rounded-lg p-4 ml-auto max-w-md">
                <p className="text-sm">How can I improve my morning routine?</p>
              </div>
              <div className="bg-gradient-to-r from-primary to-secondary rounded-lg p-4 max-w-2xl">
                <p className="text-sm">
                  Great question! Based on what you've told me about your ADHD and early
                  morning struggles, here's a tailored approach...
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-heading font-bold text-center mb-12">
            Simple, Transparent Pricing
          </h3>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <PricingCard
              title="Free Chat"
              price="£0"
              period="forever"
              features={[
                'Unlimited conversations',
                'AI memory system',
                'All three pillars',
                'Community access',
              ]}
              cta="Get Started"
              ctaLink="/signup"
            />
            <PricingCard
              title="Upgrade"
              price="£26"
              period="one-time"
              features={[
                'Everything in Free',
                '78 Prompts PDF',
                'AI Amplified Guide',
                'Badass Bonus Pack',
              ]}
              cta="Upgrade Now"
              ctaLink="/signup"
              featured
            />
            <PricingCard
              title="Full Membership"
              price="£26/mo"
              period="or £260/year"
              features={[
                'Everything in Upgrade',
                'i•DEA Marketplace access',
                'Priority support',
                'Exclusive content library',
              ]}
              cta="Join Now"
              ctaLink="/signup"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>&copy; 2024 SUPERNova AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function PillarCard({ icon, title, description, color }) {
  const colors = {
    green: 'border-green-200 bg-green-50',
    purple: 'border-purple-200 bg-purple-50',
    blue: 'border-blue-200 bg-blue-50',
  };

  return (
    <div className={`border-2 rounded-lg p-8 ${colors[color]}`}>
      <div className="text-5xl mb-4">{icon}</div>
      <h4 className="text-2xl font-heading font-bold mb-3">{title}</h4>
      <p className="text-gray-700">{description}</p>
    </div>
  );
}

function PricingCard({ title, price, period, features, cta, ctaLink, featured }) {
  return (
    <div
      className={`border-2 rounded-lg p-8 ${
        featured ? 'border-primary shadow-lg scale-105' : 'border-gray-200'
      }`}
    >
      {featured && (
        <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">
          MOST POPULAR
        </span>
      )}
      <h4 className="text-2xl font-heading font-bold mt-4 mb-2">{title}</h4>
      <div className="mb-6">
        <span className="text-4xl font-bold">{price}</span>
        <span className="text-gray-600 ml-2">{period}</span>
      </div>
      <ul className="space-y-3 mb-8">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="text-green-500 mt-1">✓</span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <Link to={ctaLink}>
        <Button
          className="w-full"
          variant={featured ? 'default' : 'outline'}
        >
          {cta}
        </Button>
      </Link>
    </div>
  );
}
