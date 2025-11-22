import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Layout, Megaphone, Globe } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      {/* Header */}
      <header className="border-b border-white/20 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-gradient-pink-purple flex items-center justify-center">
              <span className="text-white font-bold text-xl">dA</span>
            </div>
            <span className="text-xl font-bold bg-gradient-pink-purple bg-clip-text text-transparent">
              dAItaniverse
            </span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/websites">
              <Button variant="ghost">My Websites</Button>
            </Link>
            <Link href="/websites/new">
              <Button>Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-6xl font-bold mb-6 bg-gradient-pink-purple bg-clip-text text-transparent">
            Build Your Dream Website
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            AI-powered website builder and social media management platform.
            Create professional websites without code.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/websites/new">
              <Button size="lg" className="text-lg px-8 py-6">
                Create Website
              </Button>
            </Link>
            <Link href="/websites">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                View My Sites
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="h-12 w-12 rounded-lg bg-pink-100 flex items-center justify-center mb-4">
              <Layout className="h-6 w-6 text-pink-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Website Builder</h3>
            <p className="text-gray-600">
              Drag-and-drop website builder with pre-built templates and sections.
              Create landing pages, portfolios, and business sites.
            </p>
            <Link href="/websites/new" className="text-pink-600 hover:underline mt-4 inline-block">
              Start Building →
            </Link>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4">
              <Megaphone className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Social Media Management</h3>
            <p className="text-gray-600">
              Manage your social media presence with AI-powered content creation
              and scheduling tools.
            </p>
            <Link href="/social" className="text-purple-600 hover:underline mt-4 inline-block">
              Manage Social →
            </Link>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="h-12 w-12 rounded-lg bg-indigo-100 flex items-center justify-center mb-4">
              <Globe className="h-6 w-6 text-indigo-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Custom Domains</h3>
            <p className="text-gray-600">
              Publish your website to a custom subdomain or connect your own
              domain name.
            </p>
            <Link href="/websites" className="text-indigo-600 hover:underline mt-4 inline-block">
              Learn More →
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-20 py-8">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>&copy; 2025 dAItaniverse. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
