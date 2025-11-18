import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { memoriesAPI } from '@/lib/api';
import { getPillarIcon, formatDate } from '@/lib/utils';

export default function Memories() {
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMemories();
  }, []);

  const fetchMemories = async () => {
    try {
      const response = await memoriesAPI.getAll();
      setMemories(response.data.memories);
    } catch (error) {
      console.error('Failed to fetch memories:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/dashboard">
            <h1 className="text-2xl font-heading font-bold gradient-text">
              SUPERNova AI
            </h1>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-heading font-bold mb-2">My Memories</h2>
          <p className="text-gray-600">
            Things SUPERNova AI has learned about you
          </p>
        </div>

        {loading ? (
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 skeleton rounded-lg"></div>
            ))}
          </div>
        ) : memories.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="text-6xl mb-4">🧠</div>
              <h3 className="text-xl font-semibold mb-2">No memories yet</h3>
              <p className="text-gray-600 mb-6">
                Start chatting with SUPERNova to build your memory bank
              </p>
              <Link to="/chat">
                <Button>Start a Conversation</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {memories.map((memory) => (
              <Card key={memory.id}>
                <CardContent className="py-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {memory.pillar && (
                          <span>{getPillarIcon(memory.pillar)}</span>
                        )}
                        <span className="text-xs font-semibold uppercase text-gray-500">
                          {memory.type}
                        </span>
                      </div>
                      <p className="text-gray-900">{memory.content}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        From: {memory.conversationTitle || 'Manual entry'} •{' '}
                        {formatDate(memory.createdAt)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
