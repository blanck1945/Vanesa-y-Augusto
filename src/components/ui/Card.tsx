import type { HTMLAttributes, ReactNode } from 'react'

export function Card({
  children,
  className = '',
  ...rest
}: HTMLAttributes<HTMLDivElement> & { children?: ReactNode }) {
  return (
    <div className={`bp-card${className ? ` ${className}` : ''}`} {...rest}>
      {children}
    </div>
  )
}
