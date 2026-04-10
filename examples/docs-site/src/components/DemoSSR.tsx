const POST = {
  category: 'Engineering',
  title: 'How we reduced TTI by 40% with skeleton screens',
  excerpt:
    'Skeleton screens eliminate layout',
  author: 'Jordan Kim',
  readTime: '5 min read',
  date: 'Apr 8, 2026',
} as const

// Simulates an RSC: data is already resolved when the component renders
export function DemoSSR() {
  return (
    <div className="w-full rounded-xl border border-slate-700 bg-slate-950 overflow-hidden flex flex-col">
      <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 h-32 flex items-center justify-center">
        <span className="text-3xl select-none">📝</span>
      </div>
      <div className="p-5 flex flex-col gap-3">
        <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
          {POST.category}
        </span>
        <h3 className="text-sm font-semibold text-white leading-snug">{POST.title}</h3>
        <p className="text-xs text-slate-400 leading-relaxed">{POST.excerpt}</p>
        <div className="flex items-center gap-2 pt-1 border-t border-slate-800 text-xs text-slate-500">

          <span>{POST.author}</span>
          <span>·</span>
          <span>{POST.readTime}</span>
          <span>·</span>
          <span>{POST.date}</span> 
        </div>
      </div>
    </div>
  )
}
