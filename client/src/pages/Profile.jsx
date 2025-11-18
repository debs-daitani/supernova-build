import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useAuthStore } from '@/stores/authStore';

export default function Profile() {
  const { user, logout } = useAuthStore();

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

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <h2 className="text-3xl font-heading font-bold mb-8">Profile Settings</h2>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">{user?.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{user?.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Subscription</p>
                <p className="font-medium capitalize">{user?.subscriptionStatus}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button
          variant="destructive"
          onClick={() => {
            logout();
            window.location.href = '/';
          }}
        >
          Log Out
        </Button>
      </main>
    </div>
  );
}
