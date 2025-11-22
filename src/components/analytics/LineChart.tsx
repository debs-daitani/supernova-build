'use client'

interface DataPoint {
  label: string
  value: number
}

interface LineChartProps {
  data: DataPoint[]
  height?: number
  color?: string
}

export function LineChart({ data, height = 200, color = '#EC4899' }: LineChartProps) {
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
    const y = 100 - ((point.value - minValue) / range) * 100
    return { x, y, ...point }
  })

  const pathD = points
    .map((point, index) => {
      const command = index === 0 ? 'M' : 'L'
      return `${command} ${point.x} ${point.y}`
    })
    .join(' ')

  const areaD = `${pathD} L 100 100 L 0 100 Z`

  return (
    <div style={{ height: `${height}px` }} className="relative">
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="w-full h-full"
      >
        {/* Area fill */}
        <path
          d={areaD}
          fill={color}
          fillOpacity="0.1"
          className="transition-all duration-300"
        />

        {/* Line */}
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth="0.5"
          className="transition-all duration-300"
        />

        {/* Data points */}
        {points.map((point, index) => (
          <g key={index}>
            <circle
              cx={point.x}
              cy={point.y}
              r="1"
              fill={color}
              className="hover:r-2 transition-all cursor-pointer"
            />
            <title>
              {point.label}: {point.value}
            </title>
          </g>
        ))}
      </svg>

      {/* Labels */}
      <div className="flex justify-between text-xs text-gray-500 mt-2">
        <span>{data[0].label}</span>
        <span>{data[data.length - 1].label}</span>
      </div>
    </div>
  )
}
