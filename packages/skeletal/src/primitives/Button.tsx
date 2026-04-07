export interface ButtonProps {
  width?: string | number
  height?: number
  className?: string
}

export function Button({ width = 120, height = 36, className }: ButtonProps) {
  return (
    <span
      className={`sk-base${className ? ` ${className}` : ''}`}
      style={{
        display: 'inline-block',
        width,
        height,
        borderRadius: 'var(--sk-radius)',
      }}
      aria-hidden="true"
    />
  )
}
