import { useSkeletalContext } from './context.js'

export interface DefaultPulseSkeletonProps {
  width?: string | number
  height?: string | number
  className?: string
}

export function DefaultPulseSkeleton({
  width,
  height,
  className,
}: DefaultPulseSkeletonProps) {
  const ctx = useSkeletalContext()
  const resolvedWidth = width ?? '100%'
  const resolvedHeight = height ?? ctx.primitives?.defaultPulseSkeleton?.height ?? 200

  return (
    <span
      className={`sk-base${className ? ` ${className}` : ''}`}
      style={{ display: 'block', width: resolvedWidth, height: resolvedHeight }}
      aria-hidden="true"
    />
  )
}
