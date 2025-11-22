'use client'

import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'
import { Card } from '@/components/ui/card'

interface MetricCardProps {
  title: string
  value: string | number
  change?: number
  icon: LucideIcon
  color?: string
  suffix?: string
}

export function MetricCard({
  title,
  value,
  change,
  icon: Icon,
  color = 'from-pink-500 to-purple-500',
  suffix = '',
}: MetricCardProps) {
  const isPositive = change !== undefined && change >= 0
  const ChangeIcon = isPositive ? TrendingUp : TrendingDown

  return (
    <Card className="p-6 hover:shadow-xl transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div
          className={`w-12 h-12 rounded-full bg-gradient-to-r ${color} flex items-center justify-center`}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>
        {change !== undefined && (
          <div
            className={`flex items-center gap-1 text-sm ${
              isPositive ? 'text-green-600' : 'text-red-600'
            }`}
          >
            <ChangeIcon className="w-4 h-4" />
            <span>{Math.abs(change).toFixed(1)}%</span>
          </div>
        )}
      </div>
      <h3 className="text-gray-600 text-sm mb-1">{title}</h3>
      <p className="text-3xl font-bold">
        {value}
        {suffix && <span className="text-lg text-gray-500 ml-1">{suffix}</span>}
      </p>
    </Card>
  )
}
