import { CodeBlock } from './CodeBlock'
import { PackageManagerSwitcher } from './PackageManagerSwitcher'

const CONFIG_CODE = `// skeletal.config.ts
import { defineConfig } from 'skeletal-ui'

export default defineConfig({
  devServer: 'http://localhost:3000',
  routes: ['/'],
  include: ['src/**/*.tsx'],
  exclude: ['**/*.skeleton.tsx'],
  output: 'colocated',
  animation: 'shimmer',
})`

export function InstallSection() {
  return (
    <section id="install" className="py-24 px-4">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-white mb-3">Installation</h2>
        <p className="text-slate-400 mb-10">
          Requires{' '}
          <code className="text-slate-300 font-mono text-sm">typescript &gt;= 5.0</code>{' '}
          and{' '}
          <code className="text-slate-300 font-mono text-sm">react &gt;= 18</code>{' '}
          as peer dependencies.
        </p>
        <PackageManagerSwitcher configBlock={<CodeBlock code={CONFIG_CODE} lang="ts" />} />
      </div>
    </section>
  )
}
