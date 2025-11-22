'use client'

interface DataPoint {
  label: string
  value: number
  color?: string
}

interface BarChartProps {
  data: DataPoint[]
  height?: number
  horizontal?: boolean
}

export function BarChart({ data, height = 300, horizontal = false }: BarChartProps) {
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

  return (
    <div style={{ height: `${height}px` }} className="flex flex-col">
      <div className="flex-1 flex items-end gap-2">
        {data.map((item, index) => {
          const barHeight = (item.value / maxValue) * 100
          const color = item.color || '#EC4899'

          return (
            <div key={index} className="flex-1 flex flex-col items-center group">
              <div className="relative w-full flex items-end" style={{ height: '100%' }}>
                <div
                  className="w-full rounded-t-lg transition-all duration-300 hover:opacity-80 cursor-pointer"
                  style={{
                    height: `${barHeight}%`,
                    background: `linear-gradient(to top, ${color}, ${color}dd)`,
                  }}
                  title={`${item.label}: ${item.value}`}
                >
                  <div className="absolute -top-6 left-0 right-0 text-center text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.value}
                  </div>
                </div>
              </div>
              <div className="text-xs text-gray-600 mt-2 text-center truncate w-full">
                {item.label}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
