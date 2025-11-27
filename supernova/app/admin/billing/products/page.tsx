'use client';

import { useState, useEffect } from 'react';
import { formatAmount } from '@/lib/stripe';

export default function AdminProductsPage() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    features: '',
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/stripe/products');
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      setProducts(data.products);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/stripe/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          features: formData.features.split('\n').filter((f) => f.trim()),
        }),
      });
      if (!response.ok) throw new Error('Failed to create product');
      await fetchProducts();
      setShowCreateForm(false);
      setFormData({ name: '', description: '', features: '' });
      alert('Product created successfully');
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1
          className="text-3xl font-bold"
          style={{ fontFamily: 'Supernova, sans-serif' }}
        >
          Product Management
        </h1>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 rounded-xl font-medium transition-all"
          style={{ fontFamily: 'Josefin Sans, sans-serif' }}
        >
          {showCreateForm ? 'Cancel' : 'Create Product'}
        </button>
      </div>

      {showCreateForm && (
        <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-6 mb-8">
          <h2
            className="text-xl font-bold mb-4"
            style={{ fontFamily: 'Supernova, sans-serif' }}
          >
            Create New Product
          </h2>
          <form onSubmit={handleCreateProduct} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Product Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:border-pink-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:border-pink-500 focus:outline-none"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Features (one per line)
              </label>
              <textarea
                value={formData.features}
                onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:border-pink-500 focus:outline-none"
                rows={5}
                placeholder="Access to all programs&#10;Priority support&#10;Monthly coaching calls"
              />
            </div>
            <button
              type="submit"
              className="w-full px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 rounded-xl font-medium transition-all"
            >
              Create Product
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-6"
          >
            <div className="flex justify-between items-start mb-4">
              <h3
                className="text-xl font-bold"
                style={{ fontFamily: 'Supernova, sans-serif' }}
              >
                {product.name}
              </h3>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  product.active
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-gray-500/20 text-gray-400'
                }`}
              >
                {product.active ? 'Active' : 'Inactive'}
              </span>
            </div>

            <p className="text-gray-400 mb-4 text-sm">{product.description}</p>

            {product.prices && product.prices.length > 0 && (
              <div className="space-y-2 mb-4">
                <p className="text-sm font-medium">Prices:</p>
                {product.prices.map((price: any) => (
                  <div
                    key={price.id}
                    className="flex justify-between items-center p-2 bg-white/5 rounded-lg text-sm"
                  >
                    <span>{price.nickname || price.interval}</span>
                    <span className="font-medium">
                      {formatAmount(price.amount, price.currency)}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {product.features && product.features.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium mb-2">Features:</p>
                <ul className="space-y-1">
                  {product.features.slice(0, 3).map((feature: string, idx: number) => (
                    <li key={idx} className="text-sm text-gray-400 flex items-center gap-2">
                      <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {feature}
                    </li>
                  ))}
                  {product.features.length > 3 && (
                    <li className="text-sm text-gray-500">
                      +{product.features.length - 3} more
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>

      {products.length === 0 && !loading && (
        <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-12 text-center">
          <p className="text-gray-400">No products yet. Create your first product above.</p>
        </div>
      )}
    </div>
  );
}
