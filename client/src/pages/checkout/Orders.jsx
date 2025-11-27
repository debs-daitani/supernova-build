/**
 * Phase 2BC: Checkout Pages
 * Orders - View and manage customer orders
 */

import React, { useState, useEffect } from 'react';
import checkoutService from '../../services/checkout';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetail, setShowOrderDetail] = useState(false);

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      const data = await checkoutService.getOrders(params);
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Failed to load orders:', error);
      alert('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = async (orderId) => {
    try {
      const data = await checkoutService.getOrder(orderId);
      setSelectedOrder(data.order);
      setShowOrderDetail(true);
    } catch (error) {
      console.error('Failed to load order:', error);
      alert('Failed to load order details');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-600'
    };
    return colors[status] || 'bg-gray-100 text-gray-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
        <p className="text-gray-600 mt-1">Manage customer orders and process refunds</p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            statusFilter === 'all'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All Orders
        </button>
        <button
          onClick={() => setStatusFilter('paid')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            statusFilter === 'paid'
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Paid
        </button>
        <button
          onClick={() => setStatusFilter('pending')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            statusFilter === 'pending'
              ? 'bg-yellow-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Pending
        </button>
        <button
          onClick={() => setStatusFilter('failed')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            statusFilter === 'failed'
              ? 'bg-red-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Failed
        </button>
        <button
          onClick={() => setStatusFilter('refunded')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            statusFilter === 'refunded'
              ? 'bg-gray-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Refunded
        </button>
      </div>

      {/* Orders Table */}
      {orders.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="text-6xl mb-4">📦</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            No {statusFilter !== 'all' ? statusFilter : ''} orders yet
          </h2>
          <p className="text-gray-600">
            {statusFilter !== 'all'
              ? `No orders with status "${statusFilter}"`
              : 'Orders will appear here once customers start purchasing'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-mono text-sm font-semibold text-gray-900">
                      {order.orderNumber}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{order.customerName}</div>
                    <div className="text-sm text-gray-600">{order.customerEmail}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-600">
                      {new Date(order.createdAt).toLocaleTimeString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold text-gray-900">
                      {checkoutService.formatCurrency(order.total, order.currency)}
                    </div>
                    {order.discount > 0 && (
                      <div className="text-xs text-gray-600">
                        -{checkoutService.formatCurrency(order.discount, order.currency)} discount
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(order.paymentStatus)}`}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleViewOrder(order.id)}
                      className="text-purple-600 hover:text-purple-700 font-semibold text-sm"
                    >
                      View Details →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Order Detail Modal */}
      {showOrderDetail && selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => {
            setShowOrderDetail(false);
            setSelectedOrder(null);
          }}
          onRefresh={loadOrders}
        />
      )}
    </div>
  );
}

// Order Detail Modal
function OrderDetailModal({ order, onClose, onRefresh }) {
  const [processing, setProcessing] = useState(false);

  const handleRefund = async () => {
    if (!confirm(`Issue full refund for order ${order.orderNumber}?`)) {
      return;
    }

    try {
      setProcessing(true);
      await checkoutService.refundOrder(order.id, {
        amount: order.total,
        reason: 'Customer request'
      });
      alert('Refund issued successfully');
      onRefresh();
      onClose();
    } catch (error) {
      console.error('Failed to refund order:', error);
      alert('Failed to issue refund');
    } finally {
      setProcessing(false);
    }
  };

  const handleFulfill = async () => {
    try {
      setProcessing(true);
      await checkoutService.fulfillOrder(order.id, {});
      alert('Order marked as fulfilled');
      onRefresh();
      onClose();
    } catch (error) {
      console.error('Failed to fulfill order:', error);
      alert('Failed to fulfill order');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
              <p className="text-gray-600 mt-1 font-mono">{order.orderNumber}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Customer Info */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Customer Information</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div>
                <span className="text-sm text-gray-600">Name:</span>{' '}
                <span className="text-sm font-medium text-gray-900">{order.customerName}</span>
              </div>
              <div>
                <span className="text-sm text-gray-600">Email:</span>{' '}
                <span className="text-sm font-medium text-gray-900">{order.customerEmail}</span>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Items</h3>
            <div className="space-y-2">
              {Array.isArray(order.items) && order.items.map((item, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">{item.name}</div>
                    <div className="text-sm text-gray-600">Quantity: {item.quantity || 1}</div>
                  </div>
                  <div className="font-semibold text-gray-900">
                    {checkoutService.formatCurrency(item.price, order.currency)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Pricing</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Subtotal:</span>
                <span className="text-sm font-medium text-gray-900">
                  {checkoutService.formatCurrency(order.subtotal, order.currency)}
                </span>
              </div>
              {order.discount > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    Discount {order.couponCode && `(${order.couponCode})`}:
                  </span>
                  <span className="text-sm font-medium text-green-600">
                    -{checkoutService.formatCurrency(order.discount, order.currency)}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                <span className="font-semibold text-gray-900">Total:</span>
                <span className="font-bold text-gray-900 text-lg">
                  {checkoutService.formatCurrency(order.total, order.currency)}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Payment Information</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div>
                <span className="text-sm text-gray-600">Status:</span>{' '}
                <span className={`text-sm font-semibold px-2 py-1 rounded ${
                  order.paymentStatus === 'paid'
                    ? 'bg-green-100 text-green-800'
                    : order.paymentStatus === 'refunded'
                    ? 'bg-gray-100 text-gray-600'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {order.paymentStatus}
                </span>
              </div>
              <div>
                <span className="text-sm text-gray-600">Method:</span>{' '}
                <span className="text-sm font-medium text-gray-900 capitalize">{order.paymentMethod}</span>
              </div>
              {order.paidAt && (
                <div>
                  <span className="text-sm text-gray-600">Paid At:</span>{' '}
                  <span className="text-sm font-medium text-gray-900">
                    {new Date(order.paidAt).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-between">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors"
          >
            Close
          </button>
          <div className="flex gap-3">
            {order.paymentStatus === 'paid' && order.fulfillmentStatus !== 'completed' && (
              <button
                onClick={handleFulfill}
                disabled={processing}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:bg-gray-300"
              >
                Mark as Fulfilled
              </button>
            )}
            {order.paymentStatus === 'paid' && (
              <button
                onClick={handleRefund}
                disabled={processing}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:bg-gray-300"
              >
                Issue Refund
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
