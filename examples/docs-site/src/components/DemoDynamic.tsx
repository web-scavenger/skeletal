const CHART_DATA = [40, 65, 55, 80, 70, 90, 75] as const

// Simulates a dynamically-imported heavy component (next/dynamic / React.lazy pattern)
export default function DemoDynamic() {
  const max = Math.max(...CHART_DATA)
  return (
    <div className="w-full rounded-xl border border-slate-700 bg-slate-950 p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-white">Weekly activity</p>
        <span className="text-xs text-indigo-400 font-medium">+12%</span>
      </div>
      <div className="flex items-end gap-1.5 h-20">
        {CHART_DATA.map((v, i) => (
          <div
            key={i}
            className="flex-1 rounded-t bg-indigo-500/70"
            style={{ height: `${(v / max) * 100}%` }}
          />
        ))}
      </div>
      <div className="flex justify-between text-xs text-slate-500">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
          <span key={d}>{d}</span>
        ))}
      </div>
    </div>
  )
}
