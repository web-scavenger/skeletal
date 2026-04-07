export interface DefaultPulseSkeletonProps {
  width?: string | number
  height?: string | number
  className?: string
}

export function DefaultPulseSkeleton({
  width = '100%',
  height = 200,
  className,
}: DefaultPulseSkeletonProps) {
  return (
    <span
      className={`sk-base${className ? ` ${className}` : ''}`}
      style={{ display: 'block', width, height }}
      aria-hidden="true"
    />
  )
}
