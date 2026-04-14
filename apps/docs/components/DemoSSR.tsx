const POST = {
  category: 'Engineering',
  title: 'How we reduced TTI by 40% with skeleton screens',
  excerpt: 'Skeleton screens eliminate layout shift and improve perceived performance.',
  author: 'Jordan Kim',
  readTime: '5 min read',
  date: 'Apr 8, 2026',
} as const

export function DemoSSR() {
  return (
    <div className="w-full rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 overflow-hidden flex flex-col">
      <div className="bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40 h-32 flex items-center justify-center">
        <span className="text-3xl select-none">📝</span>
      </div>
      <div className="p-5 flex flex-col gap-3">
        <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
          {POST.category}
        </span>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white leading-snug">{POST.title}</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{POST.excerpt}</p>
        <div className="flex items-center gap-2 pt-1 border-t border-gray-100 dark:border-neutral-800 text-xs text-gray-400 dark:text-gray-500">
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
