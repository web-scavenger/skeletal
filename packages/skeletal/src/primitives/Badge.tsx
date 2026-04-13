import { useSkeletalContext } from './context.js'

export interface BadgeProps {
  width?: number
  height?: number
  className?: string
}

export function Badge({ width, height, className }: BadgeProps) {
  const ctx = useSkeletalContext()
  const resolvedWidth = width ?? ctx.primitives?.badge?.width ?? 60
  const resolvedHeight = height ?? ctx.primitives?.badge?.height ?? 20

  return (
    <span
      className={`sk-base${className ? ` ${className}` : ''}`}
      style={{
        display: 'inline-block',
        width: resolvedWidth,
        height: resolvedHeight,
        borderRadius: 999,
      }}
      aria-hidden="true"
    />
  )
}
