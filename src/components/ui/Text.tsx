import type { ElementType, HTMLAttributes, ReactNode } from 'react'

type TextProps = HTMLAttributes<HTMLElement> & {
  as?: ElementType
  muted?: boolean
  className?: string
  children?: ReactNode
}

export function Text({ as: As = 'p', muted = false, children, className = '', ...rest }: TextProps) {
  const cls = `${muted ? 'bp-muted' : ''}${className ? (muted ? ' ' : '') + className : ''}`.trim()
  const Component = As as ElementType
  return (
    <Component className={cls || undefined} {...rest}>
      {children}
    </Component>
  )
}
