export interface IconProps {
  size?: number
  className?: string
}

export function Icon({ size = 24, className }: IconProps) {
  return (
    <span
      className={`sk-base${className ? ` ${className}` : ''}`}
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        flexShrink: 0,
      }}
      aria-hidden="true"
    />
  )
}
