const commands = [
  {
    name: 'init',
    args: '',
    desc: 'Validate config, check Playwright install, run a test crawl',
  },
  {
    name: 'analyze',
    args: '[--only <pattern>] [--dry-run] [--no-browser]',
    desc: 'Scan components, crawl with Playwright, generate skeleton files',
  },
  {
    name: 'check',
    args: '[--json]',
    desc: 'Verify generated skeletons are not stale (exits non-zero if outdated)',
  },
  {
    name: 'watch',
    args: '',
    desc: 'Re-run analyze automatically on file changes',
  },
  {
    name: 'preview',
    args: '',
    desc: 'Serve a local preview of all generated skeletons',
  },
  {
    name: 'eject',
    args: '<ComponentName>',
    desc: 'Copy a generated skeleton into your source for manual editing',
  },
] as const

export function CliSection() {
  return (
    <section className="py-24 px-4 bg-slate-900/20">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-white mb-3">CLI Reference</h2>
        <p className="text-slate-400 mb-8">
          All commands accept a{' '}
          <code className="text-slate-300 font-mono text-sm">--config &lt;path&gt;</code>{' '}
          flag to specify a custom config file location.
        </p>
        <div className="rounded-xl border border-slate-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900">
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Command
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider hidden sm:table-cell">
                  Arguments
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Description
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {commands.map(cmd => (
                <tr key={cmd.name} className="hover:bg-slate-900/50 transition-colors">
                  <td className="px-5 py-4 whitespace-nowrap">
                    <code className="text-indigo-400 font-mono text-sm">
                      skeletal-ui {cmd.name}
                    </code>
                  </td>
                  <td className="px-5 py-4 hidden sm:table-cell">
                    <code className="text-slate-500 font-mono text-xs">
                      {cmd.args !== '' ? cmd.args : '—'}
                    </code>
                  </td>
                  <td className="px-5 py-4 text-slate-400 text-sm">{cmd.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
