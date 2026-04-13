import { useSkeletalContext } from './context.js'

export interface HeadingProps {
  width?: string
  height?: string
  className?: string
}

export function Heading({ width, height, className }: HeadingProps) {
  const ctx = useSkeletalContext()
  const resolvedWidth = width ?? ctx.primitives?.heading?.width ?? '70%'
  const resolvedHeight = height ?? ctx.primitives?.heading?.height ?? '1.4em'

  return (
    <span
      className={`sk-base${className ? ` ${className}` : ''}`}
      style={{ display: 'block', width: resolvedWidth, height: resolvedHeight }}
      aria-hidden="true"
    />
  )
}
