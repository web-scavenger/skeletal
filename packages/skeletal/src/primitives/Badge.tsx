export interface BadgeProps {
  width?: number
  height?: number
  className?: string
}

export function Badge({ width = 60, height = 20, className }: BadgeProps) {
  return (
    <span
      className={`sk-base${className ? ` ${className}` : ''}`}
      style={{
        display: 'inline-block',
        width,
        height,
        borderRadius: 999,
      }}
      aria-hidden="true"
    />
  )
}
