const USER = {
  name: 'Alex Rivera',
  role: 'Senior Engineer',
  bio: 'Building developer tools at the intersection of DX and performance.',
  stats: [
    { value: '142', label: 'Commits' },
    { value: '38', label: 'PRs' },
    { value: '4.9', label: 'Rating' },
  ],
} as const

export function DemoCard() {
  return (
    <div className="w-full max-w-sm rounded-xl border border-slate-700 bg-slate-950 p-5 flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex-shrink-0 flex items-center justify-center text-white font-semibold text-sm select-none">
          AR
        </div>
        <div>
          <p className="text-sm font-semibold text-white">{USER.name}</p>
          <p className="text-xs text-slate-400">{USER.role}</p>
        </div>
      </div>
      <p className="text-sm text-slate-400 leading-relaxed">{USER.bio}</p>
      <div className="flex gap-6 pt-2 border-t border-slate-800">
        {USER.stats.map(s => (
          <div key={s.label} className="flex flex-col items-center gap-0.5">
            <span className="text-base font-bold text-white">{s.value}</span>
            <span className="text-xs text-slate-500">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
