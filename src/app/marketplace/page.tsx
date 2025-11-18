'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface Listing {
  id: string
  title: string
  description: string
  niche: string
  price: number
  progress: number
  images: string[]
  viewsCount: number
  seller: {
    name: string | null
  }
  _count: {
    reviews: number
  }
}

export default function MarketplacePage() {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [priceFilter, setPriceFilter] = useState<'all' | 'low' | 'mid' | 'high'>('all')
  const [sortBy, setSortBy] = useState('newest')

  useEffect(() => {
    loadListings()
  }, [sortBy])

  const loadListings = async () => {
    try {
      const params = new URLSearchParams()
      if (sortBy) params.append('sort', sortBy)

      const res = await fetch(`/api/marketplace/listings?${params}`)
      if (!res.ok) throw new Error('Failed to load listings')

      const data = await res.json()
      setListings(data.listings)
    } catch (error) {
      toast.error('Failed to load listings')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const filteredListings = listings.filter(listing => {
    // Search filter
    if (search && !listing.title.toLowerCase().includes(search.toLowerCase()) &&
        !listing.description.toLowerCase().includes(search.toLowerCase())) {
      return false
    }

    // Price filter
    if (priceFilter === 'low' && listing.price > 100) return false
    if (priceFilter === 'mid' && (listing.price < 100 || listing.price > 500)) return false
    if (priceFilter === 'high' && listing.price < 500) return false

    return true
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-daitani-pink to-daitani-cyan text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-display font-bold mb-4">
            i•DEA Marketplace
          </h1>
          <p className="text-xl mb-6">
            Buy, sell, and collaborate on unfinished business ideas. Turn "failures" into assets.
          </p>
          <Link
            href="/marketplace/create"
            className="inline-block bg-white text-daitani-pink px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors"
          >
            + List Your Idea
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <input
              type="text"
              placeholder="Search ideas..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus-ring"
            />

            {/* Price Filter */}
            <select
              value={priceFilter}
              onChange={e => setPriceFilter(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus-ring"
            >
              <option value="all">All Prices</option>
              <option value="low">Under £100</option>
              <option value="mid">£100 - £500</option>
              <option value="high">£500+</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus-ring"
            >
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="popular">Most Viewed</option>
            </select>
          </div>
        </div>

        {/* Listings Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-pulse text-daitani-pink text-xl">Loading ideas...</div>
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💡</div>
            <h3 className="text-2xl font-bold mb-2">No ideas found</h3>
            <p className="text-gray-600">Be the first to list an idea!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map(listing => (
              <Link
                key={listing.id}
                href={`/marketplace/${listing.id}`}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
              >
                {/* Image */}
                <div className="h-48 bg-gradient-to-br from-daitani-pink/20 to-daitani-cyan/20 flex items-center justify-center">
                  {listing.images.length > 0 ? (
                    <img
                      src={listing.images[0]}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-6xl">💡</div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="text-sm text-gray-500 mb-1">{listing.niche}</div>
                  <h3 className="text-xl font-bold mb-2 text-gray-900 line-clamp-2">
                    {listing.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {listing.description}
                  </p>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{listing.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-daitani-pink rounded-full h-2"
                        style={{ width: `${listing.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex justify-between items-center">
                    <div className="text-2xl font-bold text-daitani-pink">
                      £{listing.price.toFixed(0)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {listing.viewsCount} views
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
