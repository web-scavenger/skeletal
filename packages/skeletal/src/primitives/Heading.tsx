export interface HeadingProps {
  width?: string
  className?: string
}

export function Heading({ width = '70%', className }: HeadingProps) {
  return (
    <span
      className={`sk-base${className ? ` ${className}` : ''}`}
      style={{ display: 'block', width, height: '1.4em' }}
      aria-hidden="true"
    />
  )
}
