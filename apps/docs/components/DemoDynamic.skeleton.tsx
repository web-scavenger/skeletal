'use client'

import { Sk } from 'skeletal-ui'

export function DemoDynamicSkeleton() {
  return (
    <div className="w-full rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Sk.Text height="14px" lineHeight="20px" width="104px" />
        <Sk.Text height="12px" lineHeight="16px" width="32px" />
      </div>
      <Sk.Card width="100%" height={80} padding={0} />
      <div className="flex justify-between">
        {['25px', '21px', '26px', '22px', '14px', '18px', '22px'].map((w, i) => (
          <Sk.Text key={i} height="12px" lineHeight="16px" width={w} />
        ))}
      </div>
    </div>
  )
}

export { DemoDynamicSkeleton as skeleton }
