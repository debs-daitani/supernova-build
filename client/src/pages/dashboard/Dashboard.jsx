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
