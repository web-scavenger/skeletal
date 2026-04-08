export interface HeadingProps {
  width?: string
  height?: string
  className?: string
}

export function Heading({ width = '70%', height = '1.4em', className }: HeadingProps) {
  return (
    <span
      className={`sk-base${className ? ` ${className}` : ''}`}
      style={{ display: 'block', width, height }}
      aria-hidden="true"
    />
  )
}
