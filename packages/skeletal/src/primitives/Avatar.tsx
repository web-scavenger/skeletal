import { useSkeletalContext } from './context.js'

export interface AvatarProps {
  size?: number
  shape?: 'circle' | 'square'
  className?: string
}

export function Avatar({ size, shape, className }: AvatarProps) {
  const ctx = useSkeletalContext()
  const resolvedSize = size ?? ctx.primitives?.avatar?.size ?? 40
  const resolvedShape = shape ?? ctx.primitives?.avatar?.shape ?? 'circle'

  return (
    <span
      className={`sk-base${className ? ` ${className}` : ''}`}
      style={{
        display: 'block',
        width: resolvedSize,
        height: resolvedSize,
        borderRadius: resolvedShape === 'circle' ? '50%' : 'var(--sk-radius)',
        flexShrink: 0,
      }}
      aria-hidden="true"
    />
  )
}
