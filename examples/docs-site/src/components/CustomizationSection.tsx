import { CodeBlock } from './CodeBlock'

const tailwindExample = `// skeletal.config.ts
export default defineConfig({
  devServer: 'http://localhost:3000',

  // Override Tailwind font-size values used during AST analysis.
  // Only specify entries you changed — rest keep their defaults.
  tailwind: {
    fontSizePx: { 'text-2xl': 28, 'text-3xl': 34 },
    pairedLineHeightPx: { 'text-2xl': 36 },
    spacingUnit: 4,          // px per Tailwind spacing unit (default: 4)
    textLengthThreshold: 60, // chars threshold for single-line <p> detection
  },
})`

const classifierExample = `// skeletal.config.ts
export default defineConfig({
  devServer: 'http://localhost:3000',

  // Geometry thresholds used to classify DOM elements from Playwright measurements.
  classifier: {
    lineHeightEstimate: 24,  // px per line for <p> line-count estimation
    avatarSmallMax: 40,      // max px for a square to be Avatar/Icon
    badgeMaxHeight: 24,      // max height (px) for badge detection
    imageAspectRatioMin: 0.75,
    imageAspectRatioMax: 1.3,
  },
})`

const primitivesConfigExample = `// skeletal.config.ts — affects codegen output AND runtime
export default defineConfig({
  devServer: 'http://localhost:3000',

  primitives: {
    avatar: { size: 32 },           // generated <Sk.Avatar /> renders at 32px
    list: { count: 4, gap: 16 },    // generated <Sk.List /> shows 4 items
    text: { lastLineWidth: '75%' },
    image: { aspectRatio: '4/3' },
  },
})`

const primitivesRuntimeExample = `// Override at runtime for a subtree — no config file needed
import { SkeletonProvider } from 'skeletal-ui'

<SkeletonProvider primitives={{ avatar: { size: 32 }, list: { count: 4 } }}>
  <App />
</SkeletonProvider>

// Three-layer resolution for every Sk.* prop:
// 1. Explicit prop   <Sk.Avatar size={64} />   — always wins
// 2. SkeletonProvider primitives context default
// 3. Hardcoded skeletal-ui default`

const customizations = [
  {
    id: 'tailwind',
    label: 'tailwind',
    title: 'Tailwind overrides',
    desc: 'Correct AST analysis for custom Tailwind configs — Tailwind v4 values, non-default spacing units, or custom font sizes.',
    code: tailwindExample,
  },
  {
    id: 'classifier',
    label: 'classifier',
    title: 'Classifier thresholds',
    desc: 'Tune how Playwright geometry is mapped to Sk.* types. Adjust when your design system uses dimensions outside the defaults.',
    code: classifierExample,
  },
  {
    id: 'primitives-config',
    label: 'primitives (config)',
    title: 'Primitive defaults — config file',
    desc: 'Set new default prop values for all Sk.* components. Generated files omit props matching the new defaults, and runtime components pick them up without explicit props.',
    code: primitivesConfigExample,
  },
  {
    id: 'primitives-runtime',
    label: 'primitives (runtime)',
    title: 'Primitive defaults — SkeletonProvider',
    desc: 'Override defaults at runtime for any subtree. Useful for theming different sections of your app without touching the config file.',
    code: primitivesRuntimeExample,
  },
] as const

export function CustomizationSection() {
  return (
    <section className="py-24 px-4">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-white mb-3">Customizing defaults</h2>
        <p className="text-slate-400 mb-2">
          Three optional config namespaces let you adapt every hardcoded size and threshold to
          your design system. All keys are optional and deep-merged with built-in defaults.
        </p>
        <p className="text-slate-500 text-sm mb-10">
          Types are exported:{' '}
          <code className="text-slate-400 font-mono">TailwindConfig</code>,{' '}
          <code className="text-slate-400 font-mono">ClassifierConfig</code>,{' '}
          <code className="text-slate-400 font-mono">PrimitivesConfig</code>
          {' '}from{' '}
          <code className="text-slate-400 font-mono">&apos;skeletal-ui&apos;</code>.
        </p>
        <div className="space-y-10">
          {customizations.map(item => (
            <div key={item.id} className="rounded-xl border border-slate-800 overflow-hidden">
              <div className="px-5 py-4 bg-slate-900/60 border-b border-slate-800 flex items-start gap-3">
                <span className="mt-0.5 shrink-0 inline-block px-2 py-0.5 rounded text-xs font-mono bg-indigo-950 text-indigo-400 border border-indigo-900">
                  {item.label}
                </span>
                <div>
                  <p className="text-white font-medium text-sm">{item.title}</p>
                  <p className="text-slate-400 text-sm mt-0.5">{item.desc}</p>
                </div>
              </div>
              <CodeBlock code={item.code} lang="typescript" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
