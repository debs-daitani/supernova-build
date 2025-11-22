'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import {
  ShoppingCart,
  Star,
  Package,
  Download,
  FileText,
  User,
  TrendingUp,
  Heart,
  Share2,
  CheckCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { formatCurrency, formatFileSize, calculateAverageRating } from '@/lib/shop-utils'

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedVariant, setSelectedVariant] = useState<any>(null)
  const [quantity, setQuantity] = useState(1)
  const [addingToCart, setAddingToCart] = useState(false)
  const [activeTab, setActiveTab] = useState<'description' | 'reviews'>('description')

  useEffect(() => {
    if (slug) {
      fetchProduct()
    }
  }, [slug])

  const fetchProduct = async () => {
    try {
      // Fetch by slug - need to get ID first
      const listRes = await fetch(`/api/shop/products?search=${slug}`)
      const listData = await listRes.json()
      const productMatch = listData.products?.find((p: any) => p.slug === slug)

      if (!productMatch) {
        router.push('/shop/products')
        return
      }

      const res = await fetch(`/api/shop/products/${productMatch.id}`)
      const data = await res.json()
      setProduct(data)

      // Select first variant if available
      if (data.variants?.length > 0) {
        setSelectedVariant(data.variants[0])
      }
    } catch (error) {
      console.error('Error fetching product:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = async () => {
    setAddingToCart(true)
    try {
      const res = await fetch('/api/shop/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          variantId: selectedVariant?.id || null,
          quantity,
        }),
      })

      if (res.ok) {
        // Show success message
        alert('Added to cart!')
      } else {
        throw new Error('Failed to add to cart')
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
      alert('Failed to add to cart. Please try again.')
    } finally {
      setAddingToCart(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-orange-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Product not found</h2>
          <Link href="/shop/products">
            <Button>Browse Products</Button>
          </Link>
        </div>
      </div>
    )
  }

  const rating = calculateAverageRating(product.reviews || [])
  const currentPrice = selectedVariant?.price || product.price
  const currentCurrency = product.currency

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-orange-50">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6 text-sm text-gray-600">
          <Link href="/shop" className="hover:text-purple-600">
            Shop
          </Link>
          {' / '}
          <Link href="/shop/products" className="hover:text-purple-600">
            Products
          </Link>
          {product.category && (
            <>
              {' / '}
              <Link
                href={`/shop/products?category=${encodeURIComponent(product.category)}`}
                className="hover:text-purple-600"
              >
                {product.category}
              </Link>
            </>
          )}
          {' / '}
          <span className="text-gray-900">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Product Image */}
          <div>
            <Card className="overflow-hidden mb-4">
              <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                {product.thumbnail ? (
                  <img
                    src={product.thumbnail}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Package className="w-32 h-32 text-gray-400" />
                )}
              </div>
            </Card>

            {/* Additional Images */}
            {product.images && product.images.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((img: string, idx: number) => (
                  <Card key={idx} className="overflow-hidden cursor-pointer hover:ring-2 ring-purple-500">
                    <div className="aspect-square bg-gray-200 flex items-center justify-center">
                      <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            {product.isFeatured && (
              <div className="inline-block bg-gradient-to-r from-pink-500 to-purple-500 text-white text-sm px-3 py-1 rounded-full mb-3">
                Featured Product
              </div>
            )}

            <h1 className="text-4xl font-bold mb-4">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-5 h-5 ${
                        star <= Math.round(rating.average)
                          ? 'text-yellow-500 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="font-medium">{rating.average.toFixed(1)}</span>
                <span className="text-gray-500">({rating.count} reviews)</span>
              </div>
              <div className="text-sm text-gray-600">
                {product.salesCount || 0} sales
              </div>
            </div>

            {/* Price */}
            <div className="mb-6">
              <div className="text-4xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-orange-500 bg-clip-text text-transparent">
                {formatCurrency(currentPrice, currentCurrency)}
              </div>
            </div>

            {/* Variants */}
            {product.variants && product.variants.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Select Option</h3>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant: any) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant)}
                      className={`px-4 py-2 border rounded-lg transition-all ${
                        selectedVariant?.id === variant.id
                          ? 'border-purple-500 bg-purple-50 text-purple-700 font-medium'
                          : 'border-gray-300 hover:border-purple-300'
                      }`}
                    >
                      <div>{variant.name}</div>
                      <div className="text-sm">
                        {formatCurrency(variant.price, product.currency)}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Quantity</h3>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  -
                </Button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <Button
                  variant="outline"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  +
                </Button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mb-6">
              <Button
                onClick={handleAddToCart}
                disabled={addingToCart}
                className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-lg py-6"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                {addingToCart ? 'Adding...' : 'Add to Cart'}
              </Button>
              <Button variant="outline" className="p-6">
                <Heart className="w-5 h-5" />
              </Button>
              <Button variant="outline" className="p-6">
                <Share2 className="w-5 h-5" />
              </Button>
            </div>

            {/* Product Type Badge */}
            <div className="flex gap-2 mb-6">
              <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm">
                <Download className="w-4 h-4" />
                {product.productType || 'Digital Product'}
              </div>
              {product.fileSize && (
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm">
                  <FileText className="w-4 h-4" />
                  {formatFileSize(product.fileSize)}
                </div>
              )}
            </div>

            {/* Seller Info */}
            <Card className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold">
                  {product.user?.profilePhotoUrl ? (
                    <img
                      src={product.user.profilePhotoUrl}
                      alt={product.user.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-6 h-6" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-semibold">{product.user?.name || 'Unknown Seller'}</div>
                  {product.user?.username && (
                    <div className="text-sm text-gray-600">@{product.user.username}</div>
                  )}
                </div>
                <Link href={`/shop/products?sellerId=${product.userId}`}>
                  <Button variant="outline" size="sm">
                    View Store
                  </Button>
                </Link>
              </div>
              {product.user?.bio && (
                <p className="mt-3 text-sm text-gray-600">{product.user.bio}</p>
              )}
            </Card>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200 mb-6">
            <div className="flex gap-8">
              <button
                onClick={() => setActiveTab('description')}
                className={`pb-3 px-1 font-medium transition-colors ${
                  activeTab === 'description'
                    ? 'border-b-2 border-purple-500 text-purple-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Description
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`pb-3 px-1 font-medium transition-colors ${
                  activeTab === 'reviews'
                    ? 'border-b-2 border-purple-500 text-purple-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Reviews ({rating.count})
              </button>
            </div>
          </div>

          {activeTab === 'description' ? (
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">Product Description</h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {product.description || 'No description provided.'}
                </p>
              </div>

              {product.tags && product.tags.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag: string) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          ) : (
            <div className="space-y-4">
              {product.reviews && product.reviews.length > 0 ? (
                product.reviews.map((review: any) => (
                  <Card key={review.id} className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold">
                        {review.user?.profilePhotoUrl ? (
                          <img
                            src={review.user.profilePhotoUrl}
                            alt={review.user.name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          review.user?.name?.[0] || 'U'
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <div className="font-semibold">{review.user?.name || 'Anonymous'}</div>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`w-4 h-4 ${
                                      star <= review.rating
                                        ? 'text-yellow-500 fill-current'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-gray-500">
                                {new Date(review.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          {review.isVerifiedPurchase && (
                            <div className="flex items-center gap-1 text-sm text-green-600">
                              <CheckCircle className="w-4 h-4" />
                              Verified Purchase
                            </div>
                          )}
                        </div>
                        <p className="text-gray-700">{review.comment}</p>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <Card className="p-12 text-center">
                  <Star className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold mb-2">No reviews yet</h3>
                  <p className="text-gray-600">Be the first to review this product!</p>
                </Card>
              )}
            </div>
          )}
        </div>

        {/* Related Products */}
        <div>
          <h2 className="text-2xl font-bold mb-6">More from this seller</h2>
          <div className="text-center py-8 text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-2 text-gray-400" />
            <p>No other products from this seller yet</p>
          </div>
        </div>
      </div>
    </div>
  )
}
