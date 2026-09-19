import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'

type CommonProps = {
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md'
  className?: string
  children?: ReactNode
}

type ButtonProps = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: undefined
  }

type LinkProps = CommonProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string
  }

export function Button(props: ButtonProps | LinkProps) {
  const { variant = 'primary', size, children, className = '', ...rest } = props
  const cls = `${variant === 'primary' ? 'bp-btn-primary' : 'bp-btn-secondary'}${
    size === 'sm' ? ' bp-btn-sm' : ''
  }${className ? ` ${className}` : ''}`

  if ('href' in rest && rest.href !== undefined) {
    const { href, ...anchorRest } = rest as AnchorHTMLAttributes<HTMLAnchorElement>
    return (
      <a href={href} className={cls} {...anchorRest}>
        {children}
      </a>
    )
  }

  const buttonRest = rest as ButtonHTMLAttributes<HTMLButtonElement>
  return (
    <button className={cls} {...buttonRest}>
      {children}
    </button>
  )
}
