import { useEffect, useRef, useState, type ReactNode } from 'react'

type InvRevealProps = {
  children?: ReactNode
  className?: string
  delay?: number
  active?: boolean
}

/** Revela el contenido con fade + blur cuando entra en viewport (o cuando `active` pasa a true). */
export function InvReveal({ children, className = '', delay = 0, active = true }: InvRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    if (!active || inView) return
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => setInView(true))
          })
          observer.disconnect()
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [active, inView])

  const cls = [
    'inv-reveal',
    delay ? `inv-reveal--delay-${delay}` : '',
    inView ? 'inv-reveal--in' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return <div ref={ref} className={cls}>{children}</div>
}
