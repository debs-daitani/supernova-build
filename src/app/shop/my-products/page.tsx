'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Package, TrendingUp, DollarSign, Edit, Trash2, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { formatCurrency } from '@/lib/shop-utils'
import { TIER_LIMITS } from '@/lib/shop-config'

export default function MyProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [userTier, setUserTier] = useState<'BRAVE' | 'BOLD' | 'BADASS'>('BOLD')
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all')

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const userId = 'user_placeholder' // TODO: Get from auth
      const res = await fetch(`/api/shop/products?sellerId=${userId}`)
      const data = await res.json()
      setProducts(data.products || [])
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleProductStatus = async (productId: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/shop/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      })

      if (res.ok) {
        fetchProducts()
      }
    } catch (error) {
      console.error('Error updating product:', error)
    }
  }

  const deleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return
    }

    try {
      const res = await fetch(`/api/shop/products/${productId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        fetchProducts()
      }
    } catch (error) {
      console.error('Error deleting product:', error)
    }
  }

  const filteredProducts = products.filter((product) => {
    if (filter === 'all') return true
    if (filter === 'active') return product.isActive
    if (filter === 'inactive') return !product.isActive
    return true
  })

  const tierLimits = TIER_LIMITS[userTier]
  const canAddMore =
    tierLimits.maxProducts === -1 || products.length < tierLimits.maxProducts

  const totalRevenue = products.reduce((sum, p) => sum + (p.revenue || 0), 0)
  const totalSales = products.reduce((sum, p) => sum + (p.salesCount || 0), 0)
  const activeProducts = products.filter((p) => p.isActive).length

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
              My Products
            </h1>
            <p className="text-gray-600">
              Manage your digital products and track performance
            </p>
          </div>
          <Link href="/shop/my-products/new">
            <Button
              disabled={!canAddMore}
              className="bg-gradient-to-r from-pink-500 to-purple-500"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Product
            </Button>
          </Link>
        </div>

        {/* Tier Limits Warning */}
        {!tierLimits.canSell && (
          <Card className="p-4 mb-6 bg-yellow-50 border-yellow-200">
            <p className="text-yellow-800">
              <strong>Upgrade Required:</strong> You need to upgrade to BOLD or BADASS tier to
              sell products.{' '}
              <Link href="/settings/billing" className="underline">
                Upgrade now
              </Link>
            </p>
          </Card>
        )}

        {!canAddMore && tierLimits.maxProducts > 0 && (
          <Card className="p-4 mb-6 bg-yellow-50 border-yellow-200">
            <p className="text-yellow-800">
              <strong>Product Limit Reached:</strong> You've reached your product limit (
              {tierLimits.maxProducts}). Upgrade to BADASS for unlimited products.{' '}
              <Link href="/settings/billing" className="underline">
                Upgrade now
              </Link>
            </p>
          </Card>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Total Products</span>
              <Package className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-3xl font-bold">{products.length}</div>
            <div className="text-sm text-gray-500">
              {tierLimits.maxProducts === -1
                ? 'Unlimited'
                : `${tierLimits.maxProducts - products.length} slots remaining`}
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Active Products</span>
              <Eye className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-3xl font-bold">{activeProducts}</div>
            <div className="text-sm text-gray-500">
              {products.length - activeProducts} inactive
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Total Sales</span>
              <TrendingUp className="w-5 h-5 text-purple-500" />
            </div>
            <div className="text-3xl font-bold">{totalSales}</div>
            <div className="text-sm text-gray-500">All time</div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Total Revenue</span>
              <DollarSign className="w-5 h-5 text-orange-500" />
            </div>
            <div className="text-3xl font-bold">{formatCurrency(totalRevenue, 'GBP')}</div>
            <div className="text-sm text-gray-500">
              Platform fee: {tierLimits.platformFee * 100}%
            </div>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
            className={filter === 'all' ? 'bg-gradient-to-r from-pink-500 to-purple-500' : ''}
          >
            All ({products.length})
          </Button>
          <Button
            variant={filter === 'active' ? 'default' : 'outline'}
            onClick={() => setFilter('active')}
            className={filter === 'active' ? 'bg-gradient-to-r from-pink-500 to-purple-500' : ''}
          >
            Active ({activeProducts})
          </Button>
          <Button
            variant={filter === 'inactive' ? 'default' : 'outline'}
            onClick={() => setFilter('inactive')}
            className={filter === 'inactive' ? 'bg-gradient-to-r from-pink-500 to-purple-500' : ''}
          >
            Inactive ({products.length - activeProducts})
          </Button>
        </div>

        {/* Products List */}
        {filteredProducts.length === 0 ? (
          <Card className="p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">
              {products.length === 0 ? 'No products yet' : 'No products match the filter'}
            </h2>
            <p className="text-gray-600 mb-6">
              {products.length === 0
                ? 'Create your first product to start selling'
                : 'Try adjusting your filters'}
            </p>
            {products.length === 0 && canAddMore && (
              <Link href="/shop/my-products/new">
                <Button className="bg-gradient-to-r from-pink-500 to-purple-500">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Product
                </Button>
              </Link>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden">
                {/* Product Image */}
                <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative">
                  {product.thumbnail ? (
                    <img
                      src={product.thumbnail}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package className="w-16 h-16 text-gray-400" />
                  )}
                  {!product.isActive && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                        Inactive
                      </span>
                    </div>
                  )}
                  {product.isFeatured && (
                    <div className="absolute top-2 right-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs px-2 py-1 rounded-full">
                      Featured
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-1 line-clamp-2">{product.name}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {product.description}
                  </p>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2 mb-4 pb-4 border-b">
                    <div>
                      <div className="text-xs text-gray-600">Price</div>
                      <div className="font-bold text-purple-600">
                        {formatCurrency(product.price, product.currency)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600">Sales</div>
                      <div className="font-bold">{product.salesCount || 0}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600">Revenue</div>
                      <div className="font-bold">
                        {formatCurrency(product.revenue || 0, product.currency)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600">Category</div>
                      <div className="font-medium text-sm truncate">
                        {product.category || 'None'}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link href={`/shop/my-products/${product.id}/edit`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleProductStatus(product.id, product.isActive)}
                    >
                      {product.isActive ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteProduct(product.id)}
                      className="text-red-500 hover:text-red-700 hover:border-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* View Product Link */}
                  <Link
                    href={`/shop/products/${product.slug}`}
                    className="block mt-3 text-center text-sm text-purple-600 hover:underline"
                  >
                    View on Shop →
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
