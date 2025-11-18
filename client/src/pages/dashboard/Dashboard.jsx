import useAuthStore from '../../stores/authStore';
import { Link } from 'react-router-dom';
import { ChatBubbleLeftRightIcon, ShoppingBagIcon, UserGroupIcon, BookOpenIcon } from '@heroicons/react/24/outline';

export default function Dashboard() {
  const { user } = useAuthStore();

  const quickLinks = [
    { name: 'Chat with SUPERNova', href: '/chat', icon: ChatBubbleLeftRightIcon, color: 'primary' },
    { name: 'Explore Marketplace', href: '/marketplace', icon: ShoppingBagIcon, color: 'secondary' },
    { name: 'Join Community', href: '/community', icon: UserGroupIcon, color: 'primary' },
    { name: 'Browse Content', href: '/content', icon: BookOpenIcon, color: 'secondary' },
  ];

  const tools = [
    { name: 'Quiz Builder', href: '/tools/quiz-builder', description: 'Create custom quizzes', icon: '📋' },
    { name: 'Links Page', href: '/tools/links-page', description: 'Your link-in-bio page', icon: '🔗' },
    { name: 'Short Links', href: '/tools/short-links', description: 'Trackable short links', icon: '⚡' },
    { name: 'Brand Hub', href: '/tools/brand-hub', description: 'Your portfolio site', icon: '🎨' },
    { name: 'Chatbot Builder', href: '/tools/chatbot-dashboard', description: 'Automated conversations', icon: '🤖' },
    { name: 'Social Automation', href: '/tools/social-automation', description: 'Instagram & Facebook DMs', icon: '📱' },
    { name: 'Website Builder', href: '/tools/websites', description: 'Drag-and-drop websites', icon: '🌐' },
    { name: 'E-Commerce Shop', href: '/shop', description: 'Sell products online', icon: '🛒' },
    { name: 'CRM', href: '/tools/crm', description: 'Manage contacts & deals', icon: '👥' },
    { name: 'Accounting', href: '/tools/accounting', description: 'Invoices & expenses', icon: '💰' },
    { name: 'Calculators', href: '/tools/accounting/calculators', description: 'Financial tools', icon: '🧮' },
    { name: 'Task Manager', href: '/tasks', description: 'Projects, habits & goals', icon: '✅' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.name}! 👋
        </h1>
        <p className="mt-2 text-gray-600">
          Ready to work on your Body, Brain, or Business today?
        </p>
      </div>

      {/* Account Status */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-2">Account Status</h2>
        <p className="text-sm text-gray-600">
          Account Type: <span className="font-semibold text-primary-600">{user?.accountType}</span>
        </p>
        {user?.accountType === 'FREE' && (
          <div className="mt-4">
            <Link to="/upgrade" className="btn btn-primary">
              Upgrade to Access More Features
            </Link>
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Links</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className="card hover:shadow-md transition-shadow flex items-center gap-4 group"
            >
              <div className={`p-3 rounded-lg bg-${link.color}-100`}>
                <link.icon className={`h-6 w-6 text-${link.color}-600`} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                  {link.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* User Empowerment Tools */}
      <div>
        <h2 className="text-xl font-semibold mb-4">🛠️ Your Business Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tools.map((tool) => (
            <Link key={tool.name} to={tool.href} className="card hover:shadow-md transition-shadow group">
              <div className="flex items-start gap-3">
                <div className="text-3xl">{tool.icon}</div>
                <div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                    {tool.name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">{tool.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Three Pillars */}
      <div>
        <h2 className="text-xl font-semibold mb-4">The Three Pillars</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card">
            <h3 className="text-lg font-semibold mb-2">💪 BODY</h3>
            <p className="text-sm text-gray-600">
              Build physical confidence without toxic diet culture
            </p>
          </div>
          <div className="card">
            <h3 className="text-lg font-semibold mb-2">🧠 BRAIN</h3>
            <p className="text-sm text-gray-600">
              Master mindset, ADHD support, and overcome limiting beliefs
            </p>
          </div>
          <div className="card">
            <h3 className="text-lg font-semibold mb-2">💼 BUSINESS</h3>
            <p className="text-sm text-gray-600">
              Build the business you've been dreaming about
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
