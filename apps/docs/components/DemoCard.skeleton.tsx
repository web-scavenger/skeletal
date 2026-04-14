'use client'

import { Sk } from 'skeletal-ui'

export function DemoCardSkeleton() {
  return (
    <div className="w-full rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-5 flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Sk.Avatar size={48} />
        <div className="flex-1 min-w-0">
          <Sk.Text height="14px" lineHeight="20px" width="90px" />
          <Sk.Text height="12px" lineHeight="16px" width="90px" />
        </div>
      </div>
      <Sk.Text lines={2} height="14px" gap="18px" width="89%" />
      <div className="flex gap-6 pt-2 border-t border-gray-100 dark:border-neutral-800">
        <div className="flex flex-col items-center gap-0.5">
          <Sk.Number width={28} height="16px" outerHeight="24px" />
          <Sk.Text height="12px" lineHeight="16px" width="50px" />
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <Sk.Number width={21} height="16px" outerHeight="24px" />
          <Sk.Text height="12px" lineHeight="16px" width="22px" />
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <Sk.Number width={26} height="16px" outerHeight="24px" />
          <Sk.Text height="12px" lineHeight="16px" width="36px" />
        </div>
      </div>
    </div>
  )
}

export { DemoCardSkeleton as skeleton }
