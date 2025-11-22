'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { CheckCircle, Download, Package, Mail, ArrowRight, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { formatCurrency } from '@/lib/shop-utils'

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams()
  const orderIds = searchParams.get('orders')?.split(',') || []

  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (orderIds.length > 0) {
      fetchOrders()
    }
  }, [])

  const fetchOrders = async () => {
    try {
      const orderPromises = orderIds.map((id) =>
        fetch(`/api/shop/orders/${id}`).then((res) => res.json())
      )
      const ordersData = await Promise.all(orderPromises)
      setOrders(ordersData)
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const totalAmount = orders.reduce((sum, order) => sum + order.totalAmount, 0)

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
        {/* Success Header */}
        <div className="max-w-3xl mx-auto">
          <Card className="p-8 mb-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
            <p className="text-gray-600 mb-6">
              Thank you for your purchase. Your order has been successfully processed.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <Mail className="w-4 h-4" />
              <span>
                Order confirmation has been sent to{' '}
                <strong>{orders[0]?.customerEmail}</strong>
              </span>
            </div>
          </Card>

          {/* Order Details */}
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-bold mb-6">Order Details</h2>

            <div className="space-y-6">
              {orders.map((order) => (
                <div key={order.id} className="pb-6 border-b last:border-b-0 last:pb-0">
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                      {order.product?.thumbnail ? (
                        <img
                          src={order.product.thumbnail}
                          alt={order.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-1">
                        {order.product?.name || 'Product'}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        Quantity: {order.quantity} × {formatCurrency(order.unitPrice, 'GBP')}
                      </p>
                      <p className="text-lg font-bold text-purple-600">
                        {formatCurrency(order.totalAmount, 'GBP')}
                      </p>

                      {/* Download Button */}
                      {order.downloadUrl && (
                        <div className="mt-4">
                          <a
                            href={order.downloadUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block"
                          >
                            <Button className="bg-gradient-to-r from-pink-500 to-purple-500">
                              <Download className="w-4 h-4 mr-2" />
                              Download Now
                            </Button>
                          </a>
                          <div className="mt-2 text-sm text-gray-600 flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>
                              Download available until{' '}
                              {order.downloadExpiresAt
                                ? new Date(order.downloadExpiresAt).toLocaleString()
                                : '24 hours'}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            Downloads remaining: {order.maxDownloads - order.downloadCount}
                          </div>
                        </div>
                      )}

                      {/* Seller Info */}
                      <div className="mt-4 text-sm text-gray-600">
                        Sold by:{' '}
                        <Link
                          href={`/shop/products?sellerId=${order.sellerId}`}
                          className="text-purple-600 hover:underline font-medium"
                        >
                          {order.seller?.name || 'Seller'}
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Order ID */}
                  <div className="mt-4 pt-4 border-t text-sm text-gray-600">
                    Order ID: <span className="font-mono">{order.id}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="mt-6 pt-6 border-t flex justify-between items-center">
              <span className="text-lg font-semibold">Total Paid</span>
              <span className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                {formatCurrency(totalAmount, 'GBP')}
              </span>
            </div>
          </Card>

          {/* Important Information */}
          <Card className="p-6 mb-6">
            <h3 className="font-bold mb-3">Important Information</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>• Download links are valid for 24 hours from the time of purchase</p>
              <p>• You can download each product up to 5 times</p>
              <p>• Order confirmation and download links have been sent to your email</p>
              <p>• If you have any issues, please contact the seller or our support team</p>
            </div>
          </Card>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/shop/my-purchases" className="flex-1">
              <Button variant="outline" className="w-full">
                View My Purchases
              </Button>
            </Link>
            <Link href="/shop/products" className="flex-1">
              <Button className="w-full bg-gradient-to-r from-pink-500 to-purple-500">
                Continue Shopping
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          {/* Support */}
          <div className="mt-8 text-center text-sm text-gray-600">
            Need help?{' '}
            <Link href="/support" className="text-purple-600 hover:underline">
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
