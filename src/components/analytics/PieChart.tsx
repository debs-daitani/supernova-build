'use client'

interface DataPoint {
  label: string
  value: number
  color?: string
}

interface PieChartProps {
  data: DataPoint[]
  size?: number
}

const DEFAULT_COLORS = [
  '#EC4899', // Pink
  '#A855F7', // Purple
  '#F97316', // Orange
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#06B6D4', // Cyan
]

export function PieChart({ data, size = 200 }: PieChartProps) {
  if (data.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-gray-400"
        style={{ width: `${size}px`, height: `${size}px` }}
      >
        No data available
      </div>
    )
  }

  const total = data.reduce((sum, item) => sum + item.value, 0)
  if (total === 0) {
    return (
      <div
        className="flex items-center justify-center text-gray-400"
        style={{ width: `${size}px`, height: `${size}px` }}
      >
        No data available
      </div>
    )
  }

  let currentAngle = -90 // Start from top

  const slices = data.map((item, index) => {
    const percentage = (item.value / total) * 100
    const angle = (item.value / total) * 360
    const color = item.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]

    const startAngle = currentAngle
    const endAngle = currentAngle + angle
    currentAngle = endAngle

    // Calculate arc path
    const radius = 45
    const centerX = 50
    const centerY = 50

    const startX = centerX + radius * Math.cos((startAngle * Math.PI) / 180)
    const startY = centerY + radius * Math.sin((startAngle * Math.PI) / 180)
    const endX = centerX + radius * Math.cos((endAngle * Math.PI) / 180)
    const endY = centerY + radius * Math.sin((endAngle * Math.PI) / 180)

    const largeArcFlag = angle > 180 ? 1 : 0

    const pathD = [
      `M ${centerX} ${centerY}`,
      `L ${startX} ${startY}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`,
      'Z',
    ].join(' ')

    return {
      pathD,
      color,
      label: item.label,
      value: item.value,
      percentage: percentage.toFixed(1),
    }
  })

  return (
    <div className="flex items-center gap-6">
      {/* Pie Chart */}
      <div style={{ width: `${size}px`, height: `${size}px` }}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {slices.map((slice, index) => (
            <g key={index} className="cursor-pointer hover:opacity-80 transition-opacity">
              <path d={slice.pathD} fill={slice.color} />
              <title>
                {slice.label}: {slice.value} ({slice.percentage}%)
              </title>
            </g>
          ))}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex-1 space-y-2">
        {slices.map((slice, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: slice.color }}
            ></div>
            <span className="flex-1 truncate">{slice.label}</span>
            <span className="font-semibold">{slice.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
