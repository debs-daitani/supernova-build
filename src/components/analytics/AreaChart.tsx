'use client'

interface DataPoint {
  label: string
  value: number
}

interface AreaChartProps {
  data: DataPoint[]
  height?: number
  color?: string
  gradient?: boolean
}

export function AreaChart({
  data,
  height = 200,
  color = '#EC4899',
  gradient = true,
}: AreaChartProps) {
  if (data.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-gray-400"
        style={{ height: `${height}px` }}
      >
        No data available
      </div>
    )
  }

  const maxValue = Math.max(...data.map((d) => d.value), 1)
  const minValue = Math.min(...data.map((d) => d.value), 0)
  const range = maxValue - minValue || 1

  const points = data.map((point, index) => {
    const x = (index / (data.length - 1)) * 100
    const y = 100 - ((point.value - minValue) / range) * 90 // Leave 10% padding
    return { x, y, ...point }
  })

  const pathD = points
    .map((point, index) => {
      const command = index === 0 ? 'M' : 'L'
      return `${command} ${point.x} ${point.y}`
    })
    .join(' ')

  const areaD = `${pathD} L 100 100 L 0 100 Z`

  const gradientId = `area-gradient-${Math.random().toString(36).substr(2, 9)}`

  return (
    <div style={{ height: `${height}px` }} className="relative">
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="w-full h-full"
      >
        {gradient && (
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity="0.4" />
              <stop offset="100%" stopColor={color} stopOpacity="0.05" />
            </linearGradient>
          </defs>
        )}

        {/* Grid lines */}
        <line x1="0" y1="25" x2="100" y2="25" stroke="#e5e7eb" strokeWidth="0.2" />
        <line x1="0" y1="50" x2="100" y2="50" stroke="#e5e7eb" strokeWidth="0.2" />
        <line x1="0" y1="75" x2="100" y2="75" stroke="#e5e7eb" strokeWidth="0.2" />

        {/* Area fill */}
        <path
          d={areaD}
          fill={gradient ? `url(#${gradientId})` : color}
          fillOpacity={gradient ? 1 : 0.2}
          className="transition-all duration-300"
        />

        {/* Line */}
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth="0.8"
          className="transition-all duration-300"
        />

        {/* Data points */}
        {points.map((point, index) => (
          <g key={index}>
            <circle
              cx={point.x}
              cy={point.y}
              r="1.5"
              fill={color}
              className="hover:r-3 transition-all cursor-pointer"
            />
            <title>
              {point.label}: {point.value}
            </title>
          </g>
        ))}
      </svg>

      {/* Y-axis labels */}
      <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-500 -ml-12">
        <span>{maxValue.toLocaleString()}</span>
        <span>{Math.floor(maxValue * 0.75).toLocaleString()}</span>
        <span>{Math.floor(maxValue * 0.5).toLocaleString()}</span>
        <span>{Math.floor(maxValue * 0.25).toLocaleString()}</span>
        <span>{minValue.toLocaleString()}</span>
      </div>

      {/* X-axis labels */}
      <div className="flex justify-between text-xs text-gray-500 mt-2">
        <span>{data[0].label}</span>
        {data.length > 2 && (
          <span>{data[Math.floor(data.length / 2)].label}</span>
        )}
        <span>{data[data.length - 1].label}</span>
      </div>
    </div>
  )
}
