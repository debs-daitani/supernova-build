import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { shopStats, shopOrders, shopProducts } from '../../services/api';
import toast from 'react-hot-toast';

export default function ShopDashboard() {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [statsRes, ordersRes, productsRes] = await Promise.all([
        shopStats.get(),
        shopOrders.list({ limit: 5 }),
        shopProducts.list({ status: 'published', limit: 5 })
      ]);

      setStats(statsRes.data);
      setRecentOrders(ordersRes.data);
      setTopProducts(productsRes.data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

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
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Shop Dashboard</h1>
        <p className="text-gray-600">Manage your e-commerce store</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon="💰"
          title="Revenue (All Time)"
          value={`£${(stats?.totalRevenue || 0).toLocaleString()}`}
          subtitle={`£${(stats?.revenueThisMonth || 0).toLocaleString()} this month`}
          link="/shop/orders"
        />
        <StatCard
          icon="📦"
          title="Total Orders"
          value={stats?.totalOrders || 0}
          subtitle={`${stats?.ordersThisMonth || 0} this month`}
          link="/shop/orders"
        />
        <StatCard
          icon="🛍️"
          title="Active Products"
          value={stats?.publishedProducts || 0}
          subtitle={`${stats?.totalProducts || 0} total products`}
          link="/shop/products"
        />
        <StatCard
          icon="📊"
          title="Avg Order Value"
          value={`£${(stats?.averageOrderValue || 0).toFixed(2)}`}
          subtitle={`${stats?.unfulfilledOrders || 0} unfulfilled`}
        />
      </div>

      {/* Alerts */}
      {stats?.lowStockCount > 0 && (
        <div className="mb-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="font-semibold text-yellow-800">Low Stock Alert</p>
              <p className="text-sm text-yellow-700">
                {stats.lowStockCount} product{stats.lowStockCount !== 1 ? 's are' : ' is'} running low on stock.{' '}
                <Link to="/shop/products?filter=low-stock" className="underline">
                  View products
                </Link>
              </p>
            </div>
          </div>
        </div>
      )}

      {stats?.pendingOrders > 0 && (
        <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔔</span>
            <div>
              <p className="font-semibold text-blue-800">Pending Orders</p>
              <p className="text-sm text-blue-700">
                You have {stats.pendingOrders} pending order{stats.pendingOrders !== 1 ? 's' : ''}.{' '}
                <Link to="/shop/orders?status=pending" className="underline">
                  View orders
                </Link>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Revenue Chart Placeholder */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Revenue Overview</h2>
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
          <p className="text-gray-500">Revenue chart coming soon...</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Recent Orders</h2>
            <Link to="/shop/orders" className="text-pink-600 hover:text-pink-700 text-sm">
              View All →
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No orders yet</p>
              <p className="text-sm text-gray-400">Share your shop link to start selling!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <OrderItem key={order.id} order={order} />
              ))}
            </div>
          )}
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Your Products</h2>
            <Link to="/shop/products" className="text-pink-600 hover:text-pink-700 text-sm">
              View All →
            </Link>
          </div>

          {topProducts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No products yet</p>
              <Link to="/shop/products/new" className="btn-primary">
                Add Your First Product
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {topProducts.map((product) => (
                <ProductItem key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg shadow-md p-6 text-white">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickAction icon="➕" text="Add Product" link="/shop/products/new" />
          <QuickAction icon="📦" text="View Orders" link="/shop/orders" />
          <QuickAction icon="🎫" text="Discounts" link="/shop/discounts" />
          <QuickAction icon="⭐" text="Reviews" link="/shop/reviews" />
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, subtitle, link }) {
  const content = (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <span className="text-3xl">{icon}</span>
      </div>
      <h3 className="text-gray-600 text-sm mb-1">{title}</h3>
      <p className="text-2xl font-bold mb-1">{value}</p>
      {subtitle && <p className="text-gray-500 text-sm">{subtitle}</p>}
    </div>
  );

  return link ? <Link to={link}>{content}</Link> : content;
}

function OrderItem({ order }) {
  const getStatusBadge = (status) => {
    const badges = {
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
      paid: { color: 'bg-green-100 text-green-800', text: 'Paid' },
      failed: { color: 'bg-red-100 text-red-800', text: 'Failed' },
      refunded: { color: 'bg-gray-100 text-gray-800', text: 'Refunded' },
    };
    const badge = badges[status] || badges.pending;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.text}
      </span>
    );
  };

  return (
    <Link
      to={`/shop/orders/${order.id}`}
      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
    >
      <div className="flex-1">
        <p className="text-sm font-medium">{order.orderNumber}</p>
        <p className="text-xs text-gray-500 mt-1">
          {order.customerEmail} • {new Date(order.createdAt).toLocaleDateString()}
        </p>
      </div>
      <div className="text-right ml-4">
        <p className="text-sm font-bold">£{order.total.toLocaleString()}</p>
        <div className="mt-1">{getStatusBadge(order.paymentStatus)}</div>
      </div>
    </Link>
  );
}

function ProductItem({ product }) {
  return (
    <Link
      to={`/shop/products/${product.id}`}
      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
    >
      {product.images && product.images[0] ? (
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-12 h-12 rounded object-cover"
        />
      ) : (
        <div className="w-12 h-12 rounded bg-gray-200 flex items-center justify-center">
          <span className="text-gray-400 text-xs">No image</span>
        </div>
      )}
      <div className="flex-1">
        <p className="text-sm font-medium">{product.name}</p>
        <p className="text-xs text-gray-500 mt-1">
          {product.productType} • £{product.price.toFixed(2)}
        </p>
      </div>
      <div className="text-right">
        {product.published ? (
          <span className="text-xs text-green-600 font-medium">Published</span>
        ) : (
          <span className="text-xs text-gray-400 font-medium">Draft</span>
        )}
      </div>
    </Link>
  );
}

function QuickAction({ icon, text, link }) {
  return (
    <Link
      to={link}
      className="flex flex-col items-center justify-center p-4 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
    >
      <span className="text-2xl mb-2">{icon}</span>
      <span className="text-sm font-medium text-center">{text}</span>
    </Link>
  );
}
