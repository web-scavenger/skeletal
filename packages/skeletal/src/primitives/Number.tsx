export interface NumberProps {
  width?: number
  height?: number | string
  outerHeight?: string
  className?: string
}

export function Number({ width = 80, height = '1em', outerHeight, className }: NumberProps) {
  if (outerHeight) {
    // Outer wrapper matches real bounding box height (no layout jump).
    // Inner bar matches font-size (visually natural).
    return (
      <span
        style={{ display: 'inline-flex', alignItems: 'center', height: outerHeight }}
        aria-hidden="true"
      >
        <span
          className={`sk-base${className ? ` ${className}` : ''}`}
          style={{ display: 'inline-block', width, height }}
        />
      </span>
    )
  }
  return (
    <span
      className={`sk-base${className ? ` ${className}` : ''}`}
      style={{
        display: 'inline-block',
        width,
        height,
      }}
      aria-hidden="true"
    />
  )
}
