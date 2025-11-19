import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

export default function Community() {
  const categories = [
    { name: 'Confident Body', slug: 'confident-body', icon: '💪', count: 24 },
    { name: 'Confident Brain', slug: 'confident-brain', icon: '🧠', count: 42 },
    { name: 'Confident Business', slug: 'confident-business', icon: '💼', count: 38 },
    { name: 'Introductions', slug: 'introductions', icon: '👋', count: 56 },
    { name: 'Celebrations', slug: 'celebrations', icon: '🎉', count: 31 },
    { name: 'General Chat', slug: 'general-chat', icon: '💬', count: 89 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/dashboard">
            <h1 className="text-2xl font-heading font-bold gradient-text">
              The Venue
            </h1>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-heading font-bold mb-2">
            Community Forums
          </h2>
          <p className="text-gray-600">
            Connect, share, and grow with fellow members
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {categories.map((category) => (
            <Link key={category.slug} to={`/forum/${category.slug}`}>
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-4xl">{category.icon}</div>
                      <div>
                        <h3 className="font-semibold text-lg">{category.name}</h3>
                        <p className="text-sm text-gray-600">
                          {category.count} discussions
                        </p>
                      </div>
                    </div>
                    <span className="text-gray-400">→</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
