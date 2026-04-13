import { useSkeletalContext } from './context.js'

export interface ImageProps {
  width?: string | number
  height?: string | number
  aspectRatio?: string
  className?: string
}

export function Image({
  width,
  height,
  aspectRatio,
  className,
}: ImageProps) {
  const ctx = useSkeletalContext()
  const resolvedWidth = width ?? '100%'
  const resolvedAspectRatio = aspectRatio ?? ctx.primitives?.image?.aspectRatio ?? '16/9'

  return (
    <span
      className={`sk-base${className ? ` ${className}` : ''}`}
      style={{
        display: 'block',
        width: resolvedWidth,
        height: height ?? undefined,
        aspectRatio: height === undefined ? resolvedAspectRatio : undefined,
      }}
      aria-hidden="true"
    />
  )
}
