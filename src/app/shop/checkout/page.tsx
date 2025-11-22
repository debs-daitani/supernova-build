'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CreditCard, Lock, Package, ArrowLeft, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { formatCurrency, calculateCartTotal } from '@/lib/shop-utils'

export default function CheckoutPage() {
  const router = useRouter()
  const [cart, setCart] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [guestCheckout, setGuestCheckout] = useState(false)

  // Form data
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [cvv, setCvv] = useState('')

  useEffect(() => {
    fetchCart()
  }, [])

  const fetchCart = async () => {
    try {
      const res = await fetch('/api/shop/cart')
      const data = await res.json()
      setCart(data)

      // Pre-fill user info if logged in
      if (data.user) {
        setCustomerName(data.user.name || '')
        setCustomerEmail(data.user.email || '')
      } else {
        setGuestCheckout(true)
      }
    } catch (error) {
      console.error('Error fetching cart:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!customerName || !customerEmail) {
      alert('Please enter your name and email')
      return
    }

    if (!cardNumber || !expiryDate || !cvv) {
      alert('Please enter complete payment information')
      return
    }

    setProcessing(true)

    try {
      // In production, use Stripe Elements for secure payment processing
      // This is a simplified placeholder
      const res = await fetch('/api/shop/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartItems: cart.items,
          customerName,
          customerEmail,
          paymentMethod: 'card',
          // In production, this would be the Stripe payment intent ID
          paymentIntentId: `pi_${Date.now()}`,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        // Redirect to confirmation page
        router.push(`/shop/orders/confirmation?orders=${data.orders.map((o: any) => o.id).join(',')}`)
      } else {
        const error = await res.json()
        alert(error.error || 'Payment failed. Please try again.')
      }
    } catch (error) {
      console.error('Error processing checkout:', error)
      alert('Payment failed. Please try again.')
    } finally {
      setProcessing(false)
    }
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

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add some products before checking out</p>
          <Button
            onClick={() => router.push('/shop/products')}
            className="bg-gradient-to-r from-pink-500 to-purple-500"
          >
            Browse Products
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-orange-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Cart
          </button>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-orange-500 bg-clip-text text-transparent mb-2">
            Checkout
          </h1>
          <p className="text-gray-600">Complete your purchase securely</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Customer Information */}
              <Card className="p-6">
                <h2 className="text-xl font-bold mb-4">Customer Information</h2>

                {guestCheckout && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                    Checking out as guest. <a href="/login" className="underline">Sign in</a> to save your information.
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Full Name *
                    </label>
                    <Input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Email Address *
                    </label>
                    <Input
                      type="email"
                      required
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="john@example.com"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Order confirmation and download links will be sent to this email
                    </p>
                  </div>
                </div>
              </Card>

              {/* Payment Information */}
              <Card className="p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment Information
                </h2>

                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                  <strong>Demo Mode:</strong> This is a demo checkout. In production, this would integrate with Stripe for secure payment processing.
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Card Number *
                    </label>
                    <Input
                      type="text"
                      required
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="4242 4242 4242 4242"
                      maxLength={19}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Expiry Date *
                      </label>
                      <Input
                        type="text"
                        required
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(e.target.value)}
                        placeholder="MM/YY"
                        maxLength={5}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        CVV *
                      </label>
                      <Input
                        type="text"
                        required
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value)}
                        placeholder="123"
                        maxLength={4}
                      />
                    </div>
                  </div>
                </div>

                {/* Security Badge */}
                <div className="mt-6 pt-6 border-t flex items-center gap-3 text-sm text-gray-600">
                  <Lock className="w-5 h-5 text-green-500" />
                  <div>
                    <div className="font-medium text-gray-900">Secure Payment</div>
                    <div>Your payment information is encrypted and secure</div>
                  </div>
                </div>
              </Card>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={processing}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white text-lg py-6"
              >
                {processing ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Lock className="w-5 h-5" />
                    Complete Purchase - {formatCurrency(subtotal, 'GBP')}
                  </span>
                )}
              </Button>
            </form>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="p-6 sticky top-4">
              <h2 className="text-xl font-bold mb-6">Order Summary</h2>

              {/* Items */}
              <div className="space-y-4 mb-6 pb-6 border-b">
                {items.map((item: any, index: number) => (
                  <div key={index} className="flex gap-3">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                      {item.thumbnail ? (
                        <img
                          src={item.thumbnail}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm line-clamp-2">{item.name}</h4>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {formatCurrency(item.price * item.quantity, 'GBP')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="space-y-3 mb-6 pb-6 border-b">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal, 'GBP')}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax</span>
                  <span>{formatCurrency(0, 'GBP')}</span>
                </div>
              </div>

              <div className="flex justify-between text-xl font-bold mb-6">
                <span>Total</span>
                <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                  {formatCurrency(subtotal, 'GBP')}
                </span>
              </div>

              {/* What You Get */}
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Instant download access</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>24-hour download window</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>5 download attempts</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Email support</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
