import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { useAuthStore } from '@/stores/authStore';
import { conversationsAPI } from '@/lib/api';
import { formatDate, getPillarIcon } from '@/lib/utils';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [recentConversations, setRecentConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentConversations();
  }, []);

  const fetchRecentConversations = async () => {
    try {
      const response = await conversationsAPI.getAll({ limit: 5 });
      setRecentConversations(response.data.conversations);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const startNewChat = () => {
    navigate('/chat');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-heading font-bold gradient-text">
            SUPERNova AI
          </h1>
          <div className="flex items-center gap-4">
            <Link to="/profile">
              <Button variant="ghost">
                {user?.name || 'Profile'}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-12">
          <h2 className="text-4xl font-heading font-bold mb-2">
            Welcome back, {user?.name?.split(' ')[0]}! 👋
          </h2>
          <p className="text-gray-600 text-lg">
            Ready to continue your journey to confident living?
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <QuickActionCard
            icon="💬"
            title="Chat with SUPERNova"
            description="Start a new conversation"
            onClick={startNewChat}
          />
          <QuickActionCard
            icon="🧠"
            title="My Memories"
            description="View stored insights"
            onClick={() => navigate('/memories')}
          />
          <QuickActionCard
            icon="💼"
            title="i•DEA Marketplace"
            description="Browse ideas for sale"
            onClick={() => navigate('/marketplace')}
          />
          <QuickActionCard
            icon="👥"
            title="The Venue"
            description="Join the community"
            onClick={() => navigate('/community')}
          />
        </div>

        {/* Recent Conversations */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Recent Conversations</CardTitle>
                <CardDescription>
                  Continue where you left off
                </CardDescription>
              </div>
              <Link to="/chat">
                <Button size="sm">View All</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 skeleton rounded-lg"></div>
                ))}
              </div>
            ) : recentConversations.length > 0 ? (
              <div className="space-y-3">
                {recentConversations.map((conv) => (
                  <Link
                    key={conv.id}
                    to={`/chat/${conv.id}`}
                    className="block p-4 rounded-lg border hover:border-primary hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span>{getPillarIcon(conv.pillar)}</span>
                          <h3 className="font-semibold">{conv.title}</h3>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-1">
                          {conv.lastMessage || 'No messages yet'}
                        </p>
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatDate(conv.lastMessageAt)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p className="mb-4">No conversations yet</p>
                <Button onClick={startNewChat}>
                  Start Your First Chat
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Subscription Status */}
        {user?.subscriptionStatus === 'free' && (
          <Card className="mt-8 border-primary bg-gradient-to-r from-primary/5 to-secondary/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg mb-1">
                    Unlock Premium Features
                  </h3>
                  <p className="text-gray-600">
                    Upgrade to access the marketplace, exclusive content, and more
                  </p>
                </div>
                <Button>Upgrade Now</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}

function QuickActionCard({ icon, title, description, onClick }) {
  return (
    <button
      onClick={onClick}
      className="p-6 rounded-lg border-2 border-gray-200 hover:border-primary hover:shadow-lg transition-all text-left group"
    >
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
        {title}
      </h3>
      <p className="text-sm text-gray-600">{description}</p>
    </button>
  );
}
