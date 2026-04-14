'use client'

import { Sk } from 'skeletal-ui'

export function DemoSSRSkeleton() {
  return (
    <div className="w-full rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 overflow-hidden flex flex-col">
      <Sk.Image width="100%" height={128} />
      <div className="p-5 flex flex-col gap-3">
        <Sk.Text height="12px" lineHeight="16px" width="80px" />
        <Sk.Heading height="19px" />
        <Sk.Text height="12px" lineHeight="20px" />
        <div className="flex items-center gap-2 pt-1 border-t border-gray-100 dark:border-neutral-800">
          <Sk.Text height="12px" lineHeight="16px" width="70px" />
          <Sk.Text height="12px" lineHeight="16px" width="12px" />
          <Sk.Text height="12px" lineHeight="16px" width="55px" />
          <Sk.Text height="12px" lineHeight="16px" width="12px" />
          <Sk.Text height="12px" lineHeight="16px" width="65px" />
        </div>
      </div>
    </div>
  )
}

export { DemoSSRSkeleton as skeleton }
