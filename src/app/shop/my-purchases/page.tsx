'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Download, Package, Star, Clock, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { formatCurrency, formatFileSize } from '@/lib/shop-utils'

export default function MyPurchasesPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending'>('all')

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/shop/orders/my-purchases')
      const data = await res.json()
      setOrders(data.orders || [])
    } catch (error) {
      console.error('Error fetching purchases:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (orderId: string, downloadUrl: string) => {
    try {
      // Track download
      await fetch(`/api/shop/orders/${orderId}/download`, {
        method: 'POST',
      })

      // Open download link
      window.open(downloadUrl, '_blank')
    } catch (error) {
      console.error('Error downloading:', error)
    }
  }

  const filteredOrders = orders.filter((order) => {
    if (filter === 'all') return true
    if (filter === 'completed') return order.status === 'COMPLETED' || order.status === 'PAID'
    if (filter === 'pending') return order.status === 'PENDING'
    return true
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-orange-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-orange-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-orange-500 bg-clip-text text-transparent mb-2">
            My Purchases
          </h1>
          <p className="text-gray-600">View and download your purchased products</p>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
            className={filter === 'all' ? 'bg-gradient-to-r from-pink-500 to-purple-500' : ''}
          >
            All Orders ({orders.length})
          </Button>
          <Button
            variant={filter === 'completed' ? 'default' : 'outline'}
            onClick={() => setFilter('completed')}
            className={filter === 'completed' ? 'bg-gradient-to-r from-pink-500 to-purple-500' : ''}
          >
            Completed ({orders.filter((o) => o.status === 'COMPLETED' || o.status === 'PAID').length})
          </Button>
          <Button
            variant={filter === 'pending' ? 'default' : 'outline'}
            onClick={() => setFilter('pending')}
            className={filter === 'pending' ? 'bg-gradient-to-r from-pink-500 to-purple-500' : ''}
          >
            Pending ({orders.filter((o) => o.status === 'PENDING').length})
          </Button>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <Card className="p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">No purchases yet</h2>
            <p className="text-gray-600 mb-6">
              Start exploring products and make your first purchase
            </p>
            <Link href="/shop/products">
              <Button className="bg-gradient-to-r from-pink-500 to-purple-500">
                Browse Products
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <Card key={order.id} className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Product Image */}
                  <div className="w-full md:w-32 h-32 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                    {order.product?.thumbnail ? (
                      <img
                        src={order.product.thumbnail}
                        alt={order.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Order Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <Link
                          href={`/shop/products/${order.product?.slug || order.productId}`}
                          className="text-xl font-bold hover:text-purple-600"
                        >
                          {order.product?.name || 'Product'}
                        </Link>
                        <p className="text-sm text-gray-600 mt-1">
                          Order #{order.id.substring(0, 8)}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-purple-600">
                          {formatCurrency(order.totalAmount, 'GBP')}
                        </div>
                        <div className="text-sm text-gray-600">
                          Qty: {order.quantity}
                        </div>
                      </div>
                    </div>

                    {/* Order Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-gray-600">Purchase Date</div>
                        <div className="font-medium">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Status</div>
                        <div>
                          <span
                            className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                              order.status === 'PAID' || order.status === 'COMPLETED'
                                ? 'bg-green-100 text-green-700'
                                : order.status === 'PENDING'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {order.status}
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Seller</div>
                        <Link
                          href={`/shop/products?sellerId=${order.sellerId}`}
                          className="font-medium text-purple-600 hover:underline"
                        >
                          {order.seller?.name || 'Unknown'}
                        </Link>
                      </div>
                    </div>

                    {/* Download Section */}
                    {order.downloadUrl && (order.status === 'PAID' || order.status === 'COMPLETED') && (
                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="font-semibold mb-1">Download Available</div>
                            <div className="text-sm text-gray-600 space-y-1">
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                <span>
                                  Expires:{' '}
                                  {order.downloadExpiresAt
                                    ? new Date(order.downloadExpiresAt).toLocaleString()
                                    : 'N/A'}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Download className="w-4 h-4" />
                                <span>
                                  Downloads: {order.downloadCount} / {order.maxDownloads}
                                </span>
                              </div>
                              {order.product?.fileSize && (
                                <div className="flex items-center gap-2">
                                  <FileText className="w-4 h-4" />
                                  <span>Size: {formatFileSize(order.product.fileSize)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <Button
                            onClick={() => handleDownload(order.id, order.downloadUrl)}
                            disabled={
                              order.downloadCount >= order.maxDownloads ||
                              (order.downloadExpiresAt &&
                                new Date(order.downloadExpiresAt) < new Date())
                            }
                            className="bg-gradient-to-r from-pink-500 to-purple-500"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 mt-4">
                      <Link href={`/shop/orders/${order.id}`}>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </Link>
                      {order.status === 'COMPLETED' && !order.reviewId && (
                        <Link href={`/shop/products/${order.product?.slug}?review=true`}>
                          <Button variant="outline" size="sm">
                            <Star className="w-4 h-4 mr-1" />
                            Write Review
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
