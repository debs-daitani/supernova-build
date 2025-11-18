import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { shopProducts } from '../../services/api';
import toast from 'react-hot-toast';

export default function ShopProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, published, draft
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadProducts();
  }, [filter, typeFilter, searchTerm]);

  const loadProducts = async () => {
    try {
      const params = {};
      if (filter === 'published') params.status = 'published';
      if (filter === 'draft') params.status = 'draft';
      if (typeFilter !== 'all') params.type = typeFilter;
      if (searchTerm) params.search = searchTerm;

      const response = await shopProducts.list(params);
      setProducts(response.data);
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      await shopProducts.delete(id);
      toast.success('Product deleted');
      loadProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  const handleTogglePublish = async (id, currentStatus) => {
    try {
      await shopProducts.publish(id, !currentStatus);
      toast.success(currentStatus ? 'Product unpublished' : 'Product published');
      loadProducts();
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Failed to update product');
    }
  };

  const filters = [
    { value: 'all', label: 'All Products' },
    { value: 'published', label: 'Published' },
    { value: 'draft', label: 'Drafts' },
  ];

  const typeFilters = [
    { value: 'all', label: 'All Types' },
    { value: 'physical', label: 'Physical' },
    { value: 'digital', label: 'Digital' },
    { value: 'service', label: 'Service' },
    { value: 'subscription', label: 'Subscription' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Products</h1>
          <p className="text-gray-600">Manage your shop inventory</p>
        </div>
        <Link to="/shop/products/new" className="btn-primary flex items-center gap-2">
          <span>➕</span>
          Add Product
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <input
              type="text"
              placeholder="🔍 Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input w-full"
            />
          </div>

          {/* Status Filter */}
          <div className="flex gap-2">
            {filters.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === f.value
                    ? 'bg-pink-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="input w-full"
            >
              {typeFilters.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {products.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-gray-500 mb-4">No products found</p>
          <Link to="/shop/products/new" className="btn-primary">
            Add Your First Product
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onDelete={handleDelete}
              onTogglePublish={handleTogglePublish}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ProductCard({ product, onDelete, onTogglePublish }) {
  const getTypeBadge = (type) => {
    const badges = {
      physical: { color: 'bg-blue-100 text-blue-800', icon: '📦' },
      digital: { color: 'bg-purple-100 text-purple-800', icon: '💾' },
      service: { color: 'bg-green-100 text-green-800', icon: '⚙️' },
      subscription: { color: 'bg-orange-100 text-orange-800', icon: '🔄' },
    };
    const badge = badges[type] || badges.physical;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.icon} {type}
      </span>
    );
  };

  const isLowStock = product.trackInventory &&
    product.inventoryCount !== null &&
    product.lowStockAlert &&
    product.inventoryCount <= product.lowStockAlert;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* Image */}
      <div className="relative">
        {product.images && product.images[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400">No image</span>
          </div>
        )}
        {!product.published && (
          <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded">
            DRAFT
          </div>
        )}
        {isLowStock && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            LOW STOCK
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="mb-2">
          <h3 className="font-bold text-lg mb-1">{product.name}</h3>
          {getTypeBadge(product.productType)}
        </div>

        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl font-bold text-pink-600">
            £{product.price.toFixed(2)}
          </span>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="text-sm text-gray-500 line-through">
              £{product.compareAtPrice.toFixed(2)}
            </span>
          )}
        </div>

        {product.trackInventory && (
          <div className="text-sm text-gray-600 mb-3">
            Stock: {product.inventoryCount !== null ? product.inventoryCount : 'N/A'}
          </div>
        )}

        {product._count && (
          <div className="flex items-center gap-4 mb-3 text-xs text-gray-500">
            <span>⭐ {product._count.reviews || 0} reviews</span>
            <span>🛒 {product._count.orderItems || 0} sales</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-3 border-t">
          <Link
            to={`/shop/products/${product.id}`}
            className="flex-1 btn-secondary text-sm text-center"
          >
            ✏️ Edit
          </Link>
          <button
            onClick={() => onTogglePublish(product.id, product.published)}
            className={`flex-1 text-sm px-3 py-2 rounded-lg font-medium transition-colors ${
              product.published
                ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                : 'bg-green-100 text-green-800 hover:bg-green-200'
            }`}
          >
            {product.published ? '👁️ Unpublish' : '🚀 Publish'}
          </button>
          <button
            onClick={() => onDelete(product.id)}
            className="text-red-600 hover:text-red-700 px-3"
            title="Delete"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
}
