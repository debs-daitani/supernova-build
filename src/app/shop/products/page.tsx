'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { ShoppingCart, Star, Package, Filter, Search, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { formatCurrency } from '@/lib/shop-utils'
import { PRODUCT_CATEGORIES } from '@/lib/shop-config'

export default function ProductCatalogPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(1)
  const [showFilters, setShowFilters] = useState(false)

  // Query params
  const category = searchParams.get('category') || ''
  const search = searchParams.get('search') || ''
  const sort = searchParams.get('sort') || 'recent'
  const page = parseInt(searchParams.get('page') || '1')

  useEffect(() => {
    fetchProducts()
  }, [category, search, sort, page])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (category) params.set('category', category)
      if (search) params.set('search', search)
      if (sort) params.set('sort', sort)
      params.set('page', page.toString())
      params.set('limit', '12')

      const res = await fetch(`/api/shop/products?${params}`)
      const data = await res.json()

      setProducts(data.products || [])
      setTotalPages(data.pages || 1)
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    params.delete('page') // Reset to page 1 when filters change
    router.push(`/shop/products?${params}`)
  }

  const handleSearch = (value: string) => {
    updateFilters('search', value)
  }

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', newPage.toString())
    router.push(`/shop/products?${params}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-orange-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-orange-500 bg-clip-text text-transparent mb-2">
            Product Catalog
          </h1>
          <p className="text-gray-600">
            Browse digital products, courses, and templates from entrepreneurs
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Input
                type="search"
                placeholder="Search products..."
                defaultValue={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>

            {/* Sort */}
            <select
              value={sort}
              onChange={(e) => updateFilters('sort', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md bg-white"
            >
              <option value="recent">Newest First</option>
              <option value="popular">Most Popular</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>

            {/* Filter Toggle (Mobile) */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden"
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>

          {/* Active Filters */}
          <div className="flex flex-wrap gap-2">
            {category && (
              <div className="flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                {category}
                <button
                  onClick={() => updateFilters('category', '')}
                  className="hover:text-purple-900"
                >
                  ×
                </button>
              </div>
            )}
            {search && (
              <div className="flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                Search: {search}
                <button
                  onClick={() => updateFilters('search', '')}
                  className="hover:text-purple-900"
                >
                  ×
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <aside className={`${showFilters ? 'block' : 'hidden'} md:block w-full md:w-64 flex-shrink-0`}>
            <Card className="p-6 sticky top-4">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filters
              </h3>

              {/* Categories */}
              <div className="mb-6">
                <h4 className="font-semibold mb-3 text-sm text-gray-700">Category</h4>
                <div className="space-y-2">
                  <button
                    onClick={() => updateFilters('category', '')}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      !category
                        ? 'bg-purple-100 text-purple-700 font-medium'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    All Categories
                  </button>
                  {PRODUCT_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => updateFilters('category', cat)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        category === cat
                          ? 'bg-purple-100 text-purple-700 font-medium'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear All */}
              {(category || search) && (
                <Button
                  variant="outline"
                  onClick={() => router.push('/shop/products')}
                  className="w-full"
                >
                  Clear All Filters
                </Button>
              )}
            </Card>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full mx-auto"></div>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No products found</h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your filters or search terms
                </p>
                <Button
                  variant="outline"
                  onClick={() => router.push('/shop/products')}
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <>
                {/* Results Count */}
                <div className="mb-4 text-sm text-gray-600">
                  Showing {products.length} product{products.length !== 1 ? 's' : ''}
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {products.map((product) => (
                    <Link key={product.id} href={`/shop/products/${product.slug}`}>
                      <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
                        <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative overflow-hidden">
                          {product.thumbnail ? (
                            <img
                              src={product.thumbnail}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package className="w-16 h-16 text-gray-400" />
                          )}
                          {product.isFeatured && (
                            <div className="absolute top-2 right-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs px-2 py-1 rounded-full">
                              Featured
                            </div>
                          )}
                        </div>
                        <div className="p-4 flex-1 flex flex-col">
                          <div className="mb-2">
                            <span className="text-xs text-purple-600 font-medium">
                              {product.category || 'Uncategorized'}
                            </span>
                          </div>
                          <h3 className="font-bold mb-2 line-clamp-2 flex-1">
                            {product.name}
                          </h3>
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {product.description}
                          </p>
                          <div className="flex items-center justify-between mt-auto">
                            <span className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                              {formatCurrency(product.price, product.currency)}
                            </span>
                            <div className="flex items-center gap-1 text-sm">
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                              <span className="font-medium">4.8</span>
                              <span className="text-gray-400">
                                ({product._count?.reviews || 0})
                              </span>
                            </div>
                          </div>
                          <div className="mt-2 text-xs text-gray-500">
                            by {product.user?.name || 'Unknown'}
                          </div>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>

                    <div className="flex gap-2">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                        <Button
                          key={pageNum}
                          variant={pageNum === page ? 'default' : 'outline'}
                          onClick={() => handlePageChange(pageNum)}
                          className={
                            pageNum === page
                              ? 'bg-gradient-to-r from-pink-500 to-purple-500'
                              : ''
                          }
                        >
                          {pageNum}
                        </Button>
                      ))}
                    </div>

                    <Button
                      variant="outline"
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
