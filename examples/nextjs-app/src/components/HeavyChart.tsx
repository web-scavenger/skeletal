'use client'
// Pattern 3 — lazy: loaded via React.lazy() inside SkeletonWrapper
// skeletal will detect the React.lazy() call in dashboard/page.tsx

interface DataPoint {
  month: string
  value: number
}

const DATA: DataPoint[] = [
  { month: 'Jan', value: 420 },
  { month: 'Feb', value: 380 },
  { month: 'Mar', value: 510 },
  { month: 'Apr', value: 490 },
  { month: 'May', value: 620 },
  { month: 'Jun', value: 580 },
]

export function HeavyChart({ title }: { title: string }) {
  const max = Math.max(...DATA.map(d => d.value))

  return (
    <div className="chart">
      <h3 className="chart__title">{title}</h3>
      <div className="chart__bars">
        {DATA.map(d => (
          <div key={d.month} className="chart__bar-group">
            <div
              className="chart__bar"
              style={{ height: `${(d.value / max) * 120}px` }}
            />
            <span className="chart__label">{d.month}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
