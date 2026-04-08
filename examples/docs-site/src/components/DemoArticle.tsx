const ARTICLE = {
  category: 'Developer Tools',
  title: 'Building zero-config skeleton loaders with static analysis',
  excerpt: 'How we use TypeScript AST traversal and Playwright geometry extraction to generate pixel-perfect skeleton screens without writing a single line of skeleton code.',
  author: { initials: 'AR', color: 'from-indigo-500 to-purple-600', name: 'Alex Rivera', date: 'Apr 8, 2026' },
  readTime: '6 min read',
} as const

export function DemoArticle() {
  return (
    <div className="w-full rounded-xl border border-slate-700 bg-slate-950 overflow-hidden">
      <div className="aspect-video bg-gradient-to-br from-indigo-900/60 via-slate-800 to-purple-900/60 flex items-center justify-center">
        <span className="text-5xl select-none">⚡</span>
      </div>
      <div className="p-5 flex flex-col gap-3">
        <span className="text-xs font-medium text-indigo-400 uppercase tracking-wide">{ARTICLE.category}</span>
        <h3 className="text-sm font-bold text-white leading-snug">{ARTICLE.title}</h3>
        <p className="text-xs text-slate-400 leading-relaxed">{ARTICLE.excerpt}</p>
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${ARTICLE.author.color} flex-shrink-0 flex items-center justify-center text-white text-xs font-semibold select-none`}>
              {ARTICLE.author.initials}
            </div>
            <span className="text-xs text-slate-400">{ARTICLE.author.name}</span>
          </div>
          <span className="text-xs text-slate-500">{ARTICLE.readTime}</span>
        </div>
      </div>
    </div>
  )
}
