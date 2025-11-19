import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-daitani-pink to-daitani-cyan">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h1 className="text-6xl font-display font-bold mb-6">
            Welcome to The dAItaniverse
          </h1>

          <p className="text-2xl mb-8 text-balance">
            AI-powered coaching, community, and marketplace for midlife female entrepreneurs.
          </p>

          <p className="text-xl mb-12">
            Anti-establishment pricing. ADHD-friendly design. No corporate BS.
          </p>

          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/auth/register"
              className="bg-white text-daitani-pink px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors focus-ring"
            >
              Get Started Free
            </Link>

            <Link
              href="/auth/login"
              className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white hover:text-daitani-pink transition-colors focus-ring"
            >
              Log In
            </Link>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div className="bg-white/10 backdrop-blur p-6 rounded-lg">
              <h3 className="text-2xl font-bold mb-3">Confident Body</h3>
              <p>Physical confidence, health, and navigating midlife body changes.</p>
            </div>

            <div className="bg-white/10 backdrop-blur p-6 rounded-lg">
              <h3 className="text-2xl font-bold mb-3">Confident Brain</h3>
              <p>Mindset, ADHD support, mental health, and breaking limiting beliefs.</p>
            </div>

            <div className="bg-white/10 backdrop-blur p-6 rounded-lg">
              <h3 className="text-2xl font-bold mb-3">Confident Business</h3>
              <p>Entrepreneurship, strategy, marketing, sales, and operations.</p>
            </div>
          </div>

          <div className="mt-16 bg-white/10 backdrop-blur p-8 rounded-lg">
            <h2 className="text-3xl font-bold mb-4">£26/month. That's it.</h2>
            <p className="text-xl">
              While others charge £99+ and gatekeep entrepreneurship, we're here to democratise it.
              <br />
              <span className="font-bold">Let's fucking GO!</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
