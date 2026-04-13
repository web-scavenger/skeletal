import { useSkeletalContext } from './context.js'

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
  lines,
  lastLineWidth,
  width,
  height,
  lineHeight,
  gap,
  className,
}: TextProps) {
  const ctx = useSkeletalContext()
  const resolvedLines = lines ?? ctx.primitives?.text?.lines ?? 1
  const resolvedLastLineWidth = lastLineWidth ?? ctx.primitives?.text?.lastLineWidth ?? '60%'
  const resolvedWidth = width ?? '100%'
  const barHeight = height ?? ctx.primitives?.text?.height ?? '1em'
  const lineGap = gap ?? ctx.primitives?.text?.gap ?? '0.4em'

  if (resolvedLines === 1) {
    if (lineHeight) {
      // Outer wrapper matches real bounding box height (no layout jump).
      // Inner bar matches font-size (visually natural thin bar).
      // width goes on the outer span so percentage values resolve correctly in
      // flex containers that have align-items:center (no implicit stretch).
      return (
        <span
          className={className}
          style={{ display: 'flex', alignItems: 'center', height: lineHeight, width: resolvedWidth }}
          aria-hidden="true"
        >
          <span
            className="sk-base"
            style={{ display: 'block', width: '100%', height: barHeight }}
          />
        </span>
      )
    }
    return (
      <span
        className={`sk-base${className ? ` ${className}` : ''}`}
        style={{ display: 'block', width: resolvedWidth, height: barHeight }}
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
      {Array.from({ length: resolvedLines }).map((_, i) => (
        <span
          key={i}
          className="sk-base"
          style={{
            display: 'block',
            width: i === resolvedLines - 1 ? resolvedLastLineWidth : resolvedWidth,
            height: barHeight,
          }}
        />
      ))}
    </span>
  )
}
