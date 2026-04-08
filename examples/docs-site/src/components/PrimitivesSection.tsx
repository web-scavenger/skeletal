const primitives = [
  { name: 'Sk.Text', props: 'lines?, width?, height?, lineHeight?, gap?', desc: 'Single or multi-line text placeholder. height = font-size (visual bar), lineHeight = outer height (layout stability)' },
  { name: 'Sk.Heading', props: 'width?, height?', desc: 'Heading-height shimmer block. height is set from bounding box so multi-line headings match real layout' },
  { name: 'Sk.Avatar', props: 'size?, shape?', desc: 'Circle or square avatar placeholder. Detected from border-radius ≥ 50% or rounded-full class' },
  { name: 'Sk.Image', props: 'width?, height?, aspectRatio?', desc: 'Image or aspect-ratio container placeholder. Auto-detected from img tags and aspect-* classes' },
  { name: 'Sk.Card', props: 'width?, height?, padding?, children?', desc: 'Container block with shimmer background' },
  { name: 'Sk.List', props: 'count?, gap?, renderItem?', desc: 'Repeated list of skeleton items' },
  { name: 'Sk.Badge', props: 'width?, height?', desc: 'Badge or chip placeholder' },
  { name: 'Sk.Button', props: 'width?, height?', desc: 'Button-shaped shimmer block' },
  { name: 'Sk.Icon', props: 'size?', desc: 'Square icon placeholder' },
  { name: 'Sk.Number', props: 'width?, height?, outerHeight?', desc: 'Numeric value placeholder. height = font-size (visual bar), outerHeight = bounding box height (layout stability)' },
] as const

export function PrimitivesSection() {
  return (
    <section className="py-24 px-4">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-white mb-3">Sk.* Primitives</h2>
        <p className="text-slate-400 mb-8">
          Pure CSS shimmer components — no runtime dependencies. Used in auto-generated{' '}
          <code className="text-slate-300 text-sm font-mono">.skeleton.tsx</code> files
          and available for manual use via{' '}
          <code className="text-slate-300 text-sm font-mono">{'import { Sk } from \'skeletal-ui\''}</code>.
        </p>
        <div className="rounded-xl border border-slate-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900">
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Component
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider hidden sm:table-cell">
                  Key props
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider hidden md:table-cell">
                  Description
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Preview
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {primitives.map(p => (
                <tr key={p.name} className="hover:bg-slate-900/50 transition-colors">
                  <td className="px-5 py-4">
                    <code className="text-indigo-400 font-mono text-sm">{p.name}</code>
                  </td>
                  <td className="px-5 py-4 hidden sm:table-cell">
                    <code className="text-slate-500 font-mono text-xs">{p.props}</code>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell text-slate-400 text-sm">
                    {p.desc}
                  </td>
                  <td className="px-5 py-4">
                    <PrimitivePreview name={p.name} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs text-slate-600">
          All primitives apply the{' '}
          <code className="text-slate-500">sk-base</code> CSS class.
          Import styles via{' '}
          <code className="text-slate-500">import &apos;skeletal-ui/styles.css&apos;</code>.
        </p>
      </div>
    </section>
  )
}

function PrimitivePreview({ name }: { name: string }) {
  switch (name) {
  case 'Sk.Text':
    return <span className="sk-base h-3 w-24" />
  case 'Sk.Heading':
    return <span className="sk-base h-5 w-28" />
  case 'Sk.Avatar':
    return <span className="sk-base w-8 h-8 rounded-full" />
  case 'Sk.Image':
    return <span className="sk-base block w-24 h-14" />
  case 'Sk.Card':
    return <span className="sk-base block w-24 h-12 rounded-lg" />
  case 'Sk.List':
    return (
      <div className="flex flex-col gap-1.5">
        {[0, 1, 2].map(i => (
          <span key={i} className="sk-base h-2.5 w-20" />
        ))}
      </div>
    )
  case 'Sk.Badge':
    return <span className="sk-base h-5 w-12 rounded-full" />
  case 'Sk.Button':
    return <span className="sk-base block h-8 w-20 rounded-md" />
  case 'Sk.Icon':
    return <span className="sk-base w-6 h-6" />
  case 'Sk.Number':
    return <span className="sk-base h-6 w-14" />
  default:
    return <span className="sk-base h-4 w-20" />
  }
}
