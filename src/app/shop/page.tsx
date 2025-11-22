'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ShoppingCart, Star, TrendingUp, Package, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { formatCurrency } from '@/lib/shop-utils'
import { PRODUCT_CATEGORIES } from '@/lib/shop-config'

export default function ShopHomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFeaturedProducts()
  }, [])

  const fetchFeaturedProducts = async () => {
    try {
      const res = await fetch('/api/shop/products?featured=true&limit=6')
      const data = await res.json()
      setFeaturedProducts(data.products || [])
    } catch (error) {
      console.error('Error fetching featured products:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-orange-50">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-orange-500 bg-clip-text text-transparent mb-4">
            dAItaniverse Shop
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Discover digital products, courses, and templates from fellow entrepreneurs
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Input
                type="search"
                placeholder="Search products..."
                className="pl-12 py-6 text-lg"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>
          </div>

          <Link href="/shop/products">
            <Button className="bg-gradient-to-r from-pink-500 to-purple-500 text-white text-lg px-8 py-6">
              Browse All Products
            </Button>
          </Link>
        </div>

        {/* Categories */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {PRODUCT_CATEGORIES.map((category) => (
              <Link key={category} href={`/shop/products?category=${encodeURIComponent(category)}`}>
                <Card className="p-4 text-center hover:shadow-xl transition-shadow cursor-pointer">
                  <Package className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                  <p className="text-sm font-medium">{category}</p>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Featured Products */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Featured Products</h2>
            <Link href="/shop/products?featured=true">
              <Button variant="outline">View All</Button>
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full mx-auto"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProducts.map((product) => (
                <Link key={product.id} href={`/shop/products/${product.slug}`}>
                  <Card className="overflow-hidden hover:shadow-xl transition-shadow">
                    <div className="aspect-video bg-gray-200 flex items-center justify-center">
                      {product.thumbnail ? (
                        <img
                          src={product.thumbnail}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package className="w-16 h-16 text-gray-400" />
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold mb-2 line-clamp-2">{product.name}</h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {product.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-purple-600">
                          {formatCurrency(product.price, product.currency)}
                        </span>
                        <div className="flex items-center gap-1 text-sm">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span>4.8</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 text-center">
            <Package className="w-12 h-12 mx-auto mb-3 text-blue-500" />
            <h3 className="text-3xl font-bold mb-1">0</h3>
            <p className="text-gray-600">Products Available</p>
          </Card>
          <Card className="p-6 text-center">
            <TrendingUp className="w-12 h-12 mx-auto mb-3 text-green-500" />
            <h3 className="text-3xl font-bold mb-1">0</h3>
            <p className="text-gray-600">Happy Customers</p>
          </Card>
          <Card className="p-6 text-center">
            <Star className="w-12 h-12 mx-auto mb-3 text-yellow-500" />
            <h3 className="text-3xl font-bold mb-1">4.9</h3>
            <p className="text-gray-600">Average Rating</p>
          </Card>
        </div>
      </div>
    </div>
  )
}
