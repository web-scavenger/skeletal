export function HeroSection() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32 px-4">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/30 via-slate-950 to-slate-950 pointer-events-none" />
      <div className="relative max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
          CLI + React Library
        </div>
        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-white mb-6">
          Skeleton screens,{' '}
          <span className="text-indigo-400">automated.</span>
        </h1>
        <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Point skeletal-ui at your React&nbsp;/&nbsp;Next.js codebase. It scans your
          components, captures real geometry via Playwright, and generates pixel-perfect
          loading states — without you writing a single shimmer div.
        </p>
        <div className="flex flex-wrap gap-4 justify-center mb-16">
          <a
            href="#install"
            className="px-6 py-3 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white font-medium transition-colors"
          >
            Get started
          </a>
          <a
            href="https://github.com/web-scavenger/skeletal"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-lg border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white font-medium transition-colors flex items-center gap-2"
          >
            <GitHubIcon />
            GitHub
          </a>
        </div>
        <div className="inline-flex items-center gap-3 px-4 py-2.5 rounded-lg bg-slate-900 border border-slate-800 font-mono text-sm text-slate-300">
          <span className="text-slate-500 select-none">$</span>
          <span>npx skeletal-ui analyze</span>
        </div>
      </div>
    </section>
  )
}

function GitHubIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  )
}
