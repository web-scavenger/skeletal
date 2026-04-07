export interface AvatarProps {
  size?: number
  shape?: 'circle' | 'square'
  className?: string
}

export function Avatar({ size = 40, shape = 'circle', className }: AvatarProps) {
  return (
    <span
      className={`sk-base${className ? ` ${className}` : ''}`}
      style={{
        display: 'block',
        width: size,
        height: size,
        borderRadius: shape === 'circle' ? '50%' : 'var(--sk-radius)',
        flexShrink: 0,
      }}
      aria-hidden="true"
    />
  )
}
