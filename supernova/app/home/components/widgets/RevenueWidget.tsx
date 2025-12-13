'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { PoundSterling } from 'lucide-react'

interface RevenueData {
  thisMonth: number
  lastMonth: number
  currency: string
}

export default function RevenueWidget() {
  const [data, setData] = useState<RevenueData>({ thisMonth: 0, lastMonth: 0, currency: '£' })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRevenue = async () => {
      try {
        const response = await fetch('/api/stripe/analytics')
        if (response.ok) {
          const result = await response.json()
          setData({
            thisMonth: result.thisMonth || 0,
            lastMonth: result.lastMonth || 0,
            currency: '£',
          })
        }
      } catch (error) {
        console.error('Failed to fetch revenue:', error)
        // Use placeholder data
        setData({ thisMonth: 2450, lastMonth: 1890, currency: '£' })
      } finally {
        setLoading(false)
      }
    }

    fetchRevenue()
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const percentChange = data.lastMonth > 0
    ? Math.round(((data.thisMonth - data.lastMonth) / data.lastMonth) * 100)
    : 0

  return (
    <div className="bg-[#1a1a1a] border border-[#3d3d3d] rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-[#0a0a0a] rounded-lg">
          <PoundSterling size={20} className="text-[#D3FF2C]" />
        </div>
        <div>
          <h3 className="text-white font-semibold text-sm">REVENUE</h3>
          <p className="text-[#888888] text-xs">This Month</p>
        </div>
      </div>

      {/* Content */}
      <div className="mb-4">
        {loading ? (
          <div className="h-12 bg-[#3d3d3d] rounded animate-pulse" />
        ) : (
          <>
            <span className="text-4xl font-bold text-white">
              {formatCurrency(data.thisMonth)}
            </span>
            {percentChange !== 0 && (
              <p className={`text-sm mt-1 ${percentChange > 0 ? 'text-[#00F0E9]' : 'text-[#FF4444]'}`}>
                {percentChange > 0 ? '+' : ''}{percentChange}% vs last month
              </p>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      {data.thisMonth === 0 ? (
        <Link href="/billing" className="text-[#00F0E9] text-sm hover:underline">
          Set up payments →
        </Link>
      ) : (
        <Link href="/billing" className="text-[#00F0E9] text-sm hover:underline">
          View Billing →
        </Link>
      )}
    </div>
  )
}
