'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ShoppingCart, Trash2, Plus, Minus, Package, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { formatCurrency, calculateCartTotal } from '@/lib/shop-utils'

export default function CartPage() {
  const router = useRouter()
  const [cart, setCart] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null)

  useEffect(() => {
    fetchCart()
  }, [])

  const fetchCart = async () => {
    try {
      const res = await fetch('/api/shop/cart')
      const data = await res.json()
      setCart(data)
    } catch (error) {
      console.error('Error fetching cart:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = async (itemIndex: number, newQuantity: number) => {
    if (newQuantity < 1) return

    const updatedItems = [...(cart.items || [])]
    updatedItems[itemIndex].quantity = newQuantity

    const totalAmount = calculateCartTotal(updatedItems)

    try {
      const res = await fetch('/api/shop/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: updatedItems,
          totalAmount,
        }),
      })

      if (res.ok) {
        fetchCart()
      }
    } catch (error) {
      console.error('Error updating cart:', error)
    }
  }

  const removeItem = async (itemIndex: number) => {
    const updatedItems = [...(cart.items || [])]
    updatedItems.splice(itemIndex, 1)

    const totalAmount = calculateCartTotal(updatedItems)

    try {
      const res = await fetch('/api/shop/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: updatedItems,
          totalAmount,
        }),
      })

      if (res.ok) {
        fetchCart()
      }
    } catch (error) {
      console.error('Error removing item:', error)
    }
  }

  const clearCart = async () => {
    if (!confirm('Are you sure you want to clear your cart?')) return

    try {
      const res = await fetch('/api/shop/cart', {
        method: 'DELETE',
      })

      if (res.ok) {
        fetchCart()
      }
    } catch (error) {
      console.error('Error clearing cart:', error)
    }
  }

  const applyCoupon = async () => {
    if (!couponCode.trim()) return

    try {
      const res = await fetch('/api/shop/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode }),
      })

      if (res.ok) {
        const data = await res.json()
        setAppliedCoupon(data.coupon)
        alert('Coupon applied successfully!')
      } else {
        const error = await res.json()
        alert(error.error || 'Invalid coupon code')
      }
    } catch (error) {
      console.error('Error applying coupon:', error)
      alert('Failed to apply coupon')
    }
  }

  const removeCoupon = () => {
    setAppliedCoupon(null)
    setCouponCode('')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-orange-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  const items = cart?.items || []
  const subtotal = calculateCartTotal(items)

  let discount = 0
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'PERCENTAGE') {
      discount = subtotal * (appliedCoupon.discountValue / 100)
    } else {
      discount = Math.min(appliedCoupon.discountValue, subtotal)
    }
  }

  const total = subtotal - discount

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-orange-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-orange-500 bg-clip-text text-transparent mb-2">
            Shopping Cart
          </h1>
          <p className="text-gray-600">
            {items.length} {items.length === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-16">
            <Card className="max-w-md mx-auto p-8">
              <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
              <p className="text-gray-600 mb-6">
                Start adding products to your cart to see them here
              </p>
              <Link href="/shop/products">
                <Button className="bg-gradient-to-r from-pink-500 to-purple-500">
                  Browse Products
                </Button>
              </Link>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item: any, index: number) => (
                <Card key={index} className="p-6">
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200">
                      {item.thumbnail ? (
                        <img
                          src={item.thumbnail}
                          alt={item.name}
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
                      <h3 className="font-bold text-lg mb-1">{item.name}</h3>
                      {item.variantName && (
                        <p className="text-sm text-gray-600 mb-2">
                          Variant: {item.variantName}
                        </p>
                      )}
                      <p className="text-xl font-bold text-purple-600">
                        {formatCurrency(item.price, 'GBP')}
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex flex-col items-end gap-3">
                      <button
                        onClick={() => removeItem(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>

                      <div className="flex items-center gap-2 border border-gray-300 rounded-lg">
                        <button
                          onClick={() => updateQuantity(index, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="px-3 py-1 hover:bg-gray-100 disabled:opacity-50"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(index, item.quantity + 1)}
                          className="px-3 py-1 hover:bg-gray-100"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <p className="font-semibold">
                        {formatCurrency(item.price * item.quantity, 'GBP')}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}

              <Button variant="outline" onClick={clearCart} className="w-full">
                <Trash2 className="w-4 h-4 mr-2" />
                Clear Cart
              </Button>
            </div>

            {/* Order Summary */}
            <div>
              <Card className="p-6 sticky top-4">
                <h2 className="text-xl font-bold mb-6">Order Summary</h2>

                {/* Coupon Code */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">
                    Coupon Code
                  </label>
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div>
                        <div className="font-medium text-green-700">
                          {appliedCoupon.code}
                        </div>
                        <div className="text-sm text-green-600">
                          {appliedCoupon.discountType === 'PERCENTAGE'
                            ? `${appliedCoupon.discountValue}% off`
                            : `${formatCurrency(appliedCoupon.discountValue, 'GBP')} off`}
                        </div>
                      </div>
                      <button
                        onClick={removeCoupon}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        placeholder="Enter code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                      />
                      <Button onClick={applyCoupon} variant="outline">
                        Apply
                      </Button>
                    </div>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 mb-6 pb-6 border-b">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>{formatCurrency(subtotal, 'GBP')}</span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-{formatCurrency(discount, 'GBP')}</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between text-xl font-bold mb-6">
                  <span>Total</span>
                  <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                    {formatCurrency(total, 'GBP')}
                  </span>
                </div>

                <Link href="/shop/checkout">
                  <Button className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white text-lg py-6">
                    Proceed to Checkout
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>

                <Link href="/shop/products">
                  <Button variant="outline" className="w-full mt-3">
                    Continue Shopping
                  </Button>
                </Link>

                {/* Trust Badges */}
                <div className="mt-6 pt-6 border-t">
                  <div className="text-sm text-gray-600 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      </div>
                      <span>Secure checkout</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      </div>
                      <span>Instant delivery for digital products</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      </div>
                      <span>24/7 customer support</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
