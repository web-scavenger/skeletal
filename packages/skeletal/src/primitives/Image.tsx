export interface ImageProps {
  width?: string | number
  height?: string | number
  aspectRatio?: string
  className?: string
}

export function Image({
  width = '100%',
  height,
  aspectRatio = '16/9',
  className,
}: ImageProps) {
  return (
    <span
      className={`sk-base${className ? ` ${className}` : ''}`}
      style={{
        display: 'block',
        width,
        height: height ?? undefined,
        aspectRatio: height === undefined ? aspectRatio : undefined,
      }}
      aria-hidden="true"
    />
  )
}
