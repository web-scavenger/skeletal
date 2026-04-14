'use client'

const primitives = [
  { name: 'Sk.Text', props: 'lines?, width?, height?, lineHeight?, gap?', desc: 'Single or multi-line text placeholder' },
  { name: 'Sk.Heading', props: 'width?, height?', desc: 'Heading-height shimmer block' },
  { name: 'Sk.Avatar', props: 'size?, shape?', desc: 'Circle or square avatar placeholder' },
  { name: 'Sk.Image', props: 'width?, height?, aspectRatio?', desc: 'Image or aspect-ratio container placeholder' },
  { name: 'Sk.Card', props: 'width?, height?, padding?, children?', desc: 'Container block with shimmer background' },
  { name: 'Sk.List', props: 'count?, gap?, renderItem?', desc: 'Repeated list of skeleton items' },
  { name: 'Sk.Badge', props: 'width?, height?', desc: 'Badge or chip placeholder' },
  { name: 'Sk.Button', props: 'width?, height?', desc: 'Button-shaped shimmer block' },
  { name: 'Sk.Icon', props: 'size?', desc: 'Square icon placeholder' },
  { name: 'Sk.Number', props: 'width?, height?, outerHeight?', desc: 'Numeric value placeholder' },
] as const

export function PrimitiveDemo() {
  return (
    <div className="my-6 rounded-xl border border-gray-200 dark:border-neutral-800 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-900">
            <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Component
            </th>
            <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">
              Key props
            </th>
            <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">
              Description
            </th>
            <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Preview
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-neutral-800">
          {primitives.map(p => (
            <tr key={p.name} className="hover:bg-gray-50 dark:hover:bg-neutral-900/50 transition-colors">
              <td className="px-5 py-4">
                <code className="text-indigo-600 dark:text-indigo-400 font-mono text-sm">{p.name}</code>
              </td>
              <td className="px-5 py-4 hidden sm:table-cell">
                <code className="text-gray-400 dark:text-gray-600 font-mono text-xs">{p.props}</code>
              </td>
              <td className="px-5 py-4 hidden md:table-cell text-gray-600 dark:text-gray-400 text-sm">
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
