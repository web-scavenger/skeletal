import { Sk } from 'skeletal-ui'

export function DemoSkeleton() {
  return (
    <div className="w-full max-w-sm rounded-xl border border-slate-800 bg-slate-950 p-5 flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Sk.Avatar size={48} shape="circle" />
        <div className="flex-1 flex flex-col gap-2">
          <Sk.Text width="8rem" />
          <Sk.Text width="5rem" />
        </div>
      </div>
      <Sk.Text lines={3} lastLineWidth="60%" />
      <div className="flex gap-6 pt-2 border-t border-slate-800">
        {[0, 1, 2].map(i => (
          <div key={i} className="flex flex-col gap-1.5 items-center">
            <Sk.Number width={40} />
            <Sk.Text width="3rem" />
          </div>
        ))}
      </div>
    </div>
  )
}
