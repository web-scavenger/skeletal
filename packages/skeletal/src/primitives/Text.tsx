export interface TextProps {
  lines?: number
  lastLineWidth?: string
  width?: string
  height?: string
  lineHeight?: string
  gap?: string
  className?: string
}

export function Text({
  lines = 1,
  lastLineWidth = '60%',
  width = '100%',
  height,
  lineHeight,
  gap,
  className,
}: TextProps) {
  const barHeight = height ?? '1em'
  const lineGap = gap ?? '0.4em'

  if (lines === 1) {
    if (lineHeight) {
      // Outer wrapper matches real bounding box height (no layout jump).
      // Inner bar matches font-size (visually natural thin bar).
      return (
        <span
          className={className}
          style={{ display: 'flex', alignItems: 'center', height: lineHeight }}
          aria-hidden="true"
        >
          <span
            className="sk-base"
            style={{ display: 'block', width, height: barHeight }}
          />
        </span>
      )
    }
    return (
      <span
        className={`sk-base${className ? ` ${className}` : ''}`}
        style={{ display: 'block', width, height: barHeight }}
        aria-hidden="true"
      />
    )
  }

  // Multi-line: className (margin classes) on outer wrapper; sk-base on each bar.
  return (
    <span
      className={className}
      style={{ display: 'flex', flexDirection: 'column', gap: lineGap }}
      aria-hidden="true"
    >
      {Array.from({ length: lines }).map((_, i) => (
        <span
          key={i}
          className="sk-base"
          style={{
            display: 'block',
            width: i === lines - 1 ? lastLineWidth : width,
            height: barHeight,
          }}
        />
      ))}
    </span>
  )
}
