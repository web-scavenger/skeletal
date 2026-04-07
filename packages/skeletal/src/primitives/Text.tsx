export interface TextProps {
  lines?: number
  lastLineWidth?: string
  width?: string
  className?: string
}

export function Text({
  lines = 1,
  lastLineWidth = '60%',
  width = '100%',
  className,
}: TextProps) {
  const lineHeight = '1em'
  const gap = '0.4em'

  if (lines === 1) {
    return (
      <span
        className={`sk-base${className ? ` ${className}` : ''}`}
        style={{ display: 'block', width, height: lineHeight }}
        aria-hidden="true"
      />
    )
  }

  return (
    <span
      style={{ display: 'flex', flexDirection: 'column', gap }}
      aria-hidden="true"
    >
      {Array.from({ length: lines }).map((_, i) => (
        <span
          key={i}
          className={`sk-base${className ? ` ${className}` : ''}`}
          style={{
            display: 'block',
            width: i === lines - 1 ? lastLineWidth : width,
            height: lineHeight,
          }}
        />
      ))}
    </span>
  )
}
