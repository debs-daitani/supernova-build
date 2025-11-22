'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  DollarSign,
  TrendingUp,
  Package,
  Clock,
  Download,
  Eye,
  Calendar,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { formatCurrency, calculatePlatformFee, calculateSellerPayout } from '@/lib/shop-utils'

export default function SalesDashboardPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'all'>('30d')
  const [userTier, setUserTier] = useState<'BOLD' | 'BADASS'>('BOLD')

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const userId = 'user_placeholder' // TODO: Get from auth
      const res = await fetch(`/api/shop/orders?sellerId=${userId}`)
      const data = await res.json()
      setOrders(data.orders || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter orders by time range
  const filteredOrders = orders.filter((order) => {
    if (timeRange === 'all') return true
    const orderDate = new Date(order.createdAt)
    const now = new Date()
    const daysAgo = timeRange === '7d' ? 7 : 30
    const cutoffDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000)
    return orderDate >= cutoffDate
  })

  // Calculate stats
  const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.totalAmount, 0)
  const totalOrders = filteredOrders.length
  const platformFees = calculatePlatformFee(totalRevenue, userTier)
  const netEarnings = calculateSellerPayout(totalRevenue, userTier)

  const completedOrders = filteredOrders.filter(
    (o) => o.status === 'PAID' || o.status === 'COMPLETED'
  ).length
  const pendingOrders = filteredOrders.filter((o) => o.status === 'PENDING').length

  // Product performance
  const productStats = filteredOrders.reduce((acc: any, order) => {
    const key = order.productId
    if (!acc[key]) {
      acc[key] = {
        product: order.product,
        sales: 0,
        revenue: 0,
      }
    }
    acc[key].sales += order.quantity
    acc[key].revenue += order.totalAmount
    return acc
  }, {})

  const topProducts = Object.values(productStats)
    .sort((a: any, b: any) => b.revenue - a.revenue)
    .slice(0, 5)

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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-orange-500 bg-clip-text text-transparent mb-2">
              Sales Dashboard
            </h1>
            <p className="text-gray-600">Track your sales performance and earnings</p>
          </div>

          {/* Time Range Selector */}
          <div className="flex gap-2">
            <Button
              variant={timeRange === '7d' ? 'default' : 'outline'}
              onClick={() => setTimeRange('7d')}
              className={timeRange === '7d' ? 'bg-gradient-to-r from-pink-500 to-purple-500' : ''}
            >
              Last 7 Days
            </Button>
            <Button
              variant={timeRange === '30d' ? 'default' : 'outline'}
              onClick={() => setTimeRange('30d')}
              className={
                timeRange === '30d' ? 'bg-gradient-to-r from-pink-500 to-purple-500' : ''
              }
            >
              Last 30 Days
            </Button>
            <Button
              variant={timeRange === 'all' ? 'default' : 'outline'}
              onClick={() => setTimeRange('all')}
              className={timeRange === 'all' ? 'bg-gradient-to-r from-pink-500 to-purple-500' : ''}
            >
              All Time
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Total Revenue</span>
              <DollarSign className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              {formatCurrency(totalRevenue, 'GBP')}
            </div>
            <div className="text-sm text-gray-500 mt-1">Before platform fees</div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Net Earnings</span>
              <TrendingUp className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-3xl font-bold text-blue-600">
              {formatCurrency(netEarnings, 'GBP')}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              After {userTier === 'BOLD' ? '5%' : '3%'} platform fee
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Total Orders</span>
              <Package className="w-5 h-5 text-purple-500" />
            </div>
            <div className="text-3xl font-bold">{totalOrders}</div>
            <div className="text-sm text-gray-500 mt-1">
              {completedOrders} completed, {pendingOrders} pending
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Platform Fees</span>
              <DollarSign className="w-5 h-5 text-orange-500" />
            </div>
            <div className="text-3xl font-bold text-orange-600">
              {formatCurrency(platformFees, 'GBP')}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {userTier === 'BOLD' ? '5%' : '3%'} of revenue
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Top Products */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Top Performing Products</h2>
            {topProducts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p>No sales yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {topProducts.map((stat: any, index: number) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-12 h-12 rounded bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold">
                      #{index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold line-clamp-1">
                        {stat.product?.name || 'Unknown Product'}
                      </div>
                      <div className="text-sm text-gray-600">{stat.sales} sales</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-purple-600">
                        {formatCurrency(stat.revenue, 'GBP')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Quick Actions */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link href="/shop/my-products/new">
                <Button className="w-full justify-start" variant="outline">
                  <Package className="w-4 h-4 mr-2" />
                  Create New Product
                </Button>
              </Link>
              <Link href="/shop/my-products">
                <Button className="w-full justify-start" variant="outline">
                  <Eye className="w-4 h-4 mr-2" />
                  Manage Products
                </Button>
              </Link>
              <Link href="/shop/payouts">
                <Button className="w-full justify-start" variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Request Payout
                </Button>
              </Link>
              <Link href="/shop/sales">
                <Button className="w-full justify-start" variant="outline">
                  <Calendar className="w-4 h-4 mr-2" />
                  View All Orders
                </Button>
              </Link>
            </div>
          </Card>
        </div>

        {/* Recent Orders */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Recent Orders</h2>
            <Link href="/shop/sales/orders">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
              <p>Orders will appear here once customers purchase your products</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2">Order ID</th>
                    <th className="text-left py-3 px-2">Product</th>
                    <th className="text-left py-3 px-2">Customer</th>
                    <th className="text-left py-3 px-2">Date</th>
                    <th className="text-left py-3 px-2">Status</th>
                    <th className="text-right py-3 px-2">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.slice(0, 10).map((order) => (
                    <tr key={order.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-2">
                        <Link
                          href={`/shop/orders/${order.id}`}
                          className="text-purple-600 hover:underline font-mono text-sm"
                        >
                          #{order.id.substring(0, 8)}
                        </Link>
                      </td>
                      <td className="py-3 px-2">
                        <div className="font-medium line-clamp-1">
                          {order.product?.name || 'Unknown'}
                        </div>
                        <div className="text-sm text-gray-600">Qty: {order.quantity}</div>
                      </td>
                      <td className="py-3 px-2">
                        <div className="line-clamp-1">{order.customerName || 'Guest'}</div>
                        <div className="text-sm text-gray-600 line-clamp-1">
                          {order.customerEmail}
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <div>{new Date(order.createdAt).toLocaleDateString()}</div>
                        <div className="text-sm text-gray-600">
                          {new Date(order.createdAt).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="py-3 px-2">
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
                      </td>
                      <td className="py-3 px-2 text-right font-bold text-purple-600">
                        {formatCurrency(order.totalAmount, 'GBP')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
