const FEED = [
  { id: 1, initials: 'MK', color: 'from-emerald-500 to-teal-600', user: 'Maya K.', action: 'opened a pull request', repo: 'skeletal-ui', time: '2m ago' },
  { id: 2, initials: 'TC', color: 'from-blue-500 to-indigo-600', user: 'Tom Chen', action: 'merged branch main', repo: 'dashboard', time: '14m ago' },
  { id: 3, initials: 'SO', color: 'from-orange-500 to-pink-600', user: 'Sara Obi', action: 'commented on issue #42', repo: 'api-gateway', time: '1h ago' },
  { id: 4, initials: 'DB', color: 'from-violet-500 to-purple-600', user: 'Dev Bot', action: 'deployed to production', repo: 'web-app', time: '3h ago' },
] as const

export function DemoFeed() {
  return (
    <div className="w-full rounded-xl border border-slate-700 bg-slate-950 divide-y divide-slate-800">
      {FEED.map(item => (
        <div key={item.id} className="flex items-start gap-3 p-4">
          <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${item.color} flex-shrink-0 flex items-center justify-center text-white text-xs font-semibold select-none`}>
            {item.initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white">
              <span className="font-medium">{item.user}</span>
              {' '}
              <span className="text-slate-400">{item.action}</span>
            </p>
            <p className="text-xs text-slate-500 mt-1">{item.repo} · {item.time}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
