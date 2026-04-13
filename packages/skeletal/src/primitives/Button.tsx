import { useSkeletalContext } from './context.js'

export interface ButtonProps {
  width?: string | number
  height?: number
  className?: string
}

export function Button({ width, height, className }: ButtonProps) {
  const ctx = useSkeletalContext()
  const resolvedWidth = width ?? ctx.primitives?.button?.width ?? 120
  const resolvedHeight = height ?? ctx.primitives?.button?.height ?? 36

  return (
    <span
      className={`sk-base${className ? ` ${className}` : ''}`}
      style={{
        display: 'inline-block',
        width: resolvedWidth,
        height: resolvedHeight,
        borderRadius: 'var(--sk-radius)',
      }}
      aria-hidden="true"
    />
  )
}
