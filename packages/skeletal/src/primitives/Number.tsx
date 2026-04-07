export interface NumberProps {
  width?: number
  className?: string
}

export function Number({ width = 80, className }: NumberProps) {
  return (
    <span
      className={`sk-base${className ? ` ${className}` : ''}`}
      style={{
        display: 'inline-block',
        width,
        height: '1em',
      }}
      aria-hidden="true"
    />
  )
}
