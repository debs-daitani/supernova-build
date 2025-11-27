import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { marketplaceAPI } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';

export default function Marketplace() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const response = await marketplaceAPI.getListings();
      setListings(response.data.listings);
    } catch (error) {
      console.error('Failed to fetch listings:', error);
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
              i•DEA Marketplace
            </h1>
          </Link>
          <Link to="/seller-dashboard">
            <Button variant="outline">Sell Your Idea</Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-heading font-bold mb-2">
            Browse Unfinished Ideas
          </h2>
          <p className="text-gray-600 mb-6">
            Turn someone's abandoned project into your next success story
          </p>

          <Input
            type="search"
            placeholder="Search ideas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-md"
          />
        </div>

        {loading ? (
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 skeleton rounded-lg"></div>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="text-6xl mb-4">💡</div>
              <h3 className="text-xl font-semibold mb-2">No listings yet</h3>
              <p className="text-gray-600 mb-6">
                Be the first to list your unfinished idea!
              </p>
              <Link to="/marketplace/create">
                <Button>Create Listing</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {listings
              .filter((l) =>
                l.title.toLowerCase().includes(search.toLowerCase())
              )
              .map((listing) => (
                <Link
                  key={listing.id}
                  to={`/marketplace/${listing.id}`}
                  className="block"
                >
                  <Card className="hover:shadow-lg transition-shadow h-full">
                    <CardContent className="p-6">
                      <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg mb-4"></div>
                      <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                        {listing.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {listing.description}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold text-primary">
                          {formatCurrency(listing.price)}
                        </span>
                        <span className="text-sm text-gray-500">
                          {listing.progressPercentage}% complete
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
          </div>
        )}
      </main>
    </div>
  );
}
