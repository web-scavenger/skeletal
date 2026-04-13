import { useSkeletalContext } from './context.js'

export interface IconProps {
  size?: number
  className?: string
}

export function Icon({ size, className }: IconProps) {
  const ctx = useSkeletalContext()
  const resolvedSize = size ?? ctx.primitives?.icon?.size ?? 24

  return (
    <span
      className={`sk-base${className ? ` ${className}` : ''}`}
      style={{
        display: 'inline-block',
        width: resolvedSize,
        height: resolvedSize,
        flexShrink: 0,
      }}
      aria-hidden="true"
    />
  )
}
