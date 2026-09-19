import type { ReactNode } from 'react'
import { InvReveal } from './InvReveal'
import { DecorSeccion } from './DecorFloral'
import { SepSlot, type SepVariant } from './SepHojas'

type SectionProps = {
  tone: 'leaf' | 'pearl' | 'mist'
  align?: 'left' | 'center' | 'right'
  label?: string
  title?: string
  className?: string
  children?: ReactNode
  revealActive?: boolean
  flores?: boolean | 'left' | 'right' | 'both'
  sectionId?: string
  commentMode?: boolean
  sepArriba?: SepVariant
  sepDesde?: 'izq' | 'der'
  sepAbajo?: boolean
}

/** Banda de sección genérica: título + label opcionales, decoración floral y separador de hojas. */
export function Section({
  tone,
  align = 'left',
  label,
  title,
  className = '',
  children,
  revealActive,
  flores = false,
  sectionId,
  commentMode = false,
  sepArriba,
  sepDesde,
  sepAbajo = false,
}: SectionProps) {
  const floresSide = flores === true ? 'both' : flores === false ? null : flores
  return (
    <section
      className={[
        `inv-band inv-band--tall inv-band--fiesta-bg inv-band--${tone} inv-band--align-${align}${className ? ` ${className}` : ''}`,
        sepArriba ? 'inv-band--sep-arriba' : '',
        sepAbajo ? 'inv-band--sep-abajo' : '',
        commentMode ? 'inv-section--commentable' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      data-inv-section={sectionId}
      data-inv-label={title ?? label ?? sectionId ?? 'Sección'}
    >
      {sepArriba && sepDesde ? <SepSlot active={revealActive} variant={sepArriba} desde={sepDesde} /> : null}
      {floresSide ? <DecorSeccion side={floresSide} /> : null}
      <div className="inv-band-inner">
        {label ? (
          <InvReveal active={revealActive}>
            <p className="inv-label">{label}</p>
          </InvReveal>
        ) : null}
        {title ? (
          <InvReveal active={revealActive} delay={label ? 1 : 0}>
            <h2 className="inv-title">{title}</h2>
          </InvReveal>
        ) : null}
        <InvReveal active={revealActive} delay={label && title ? 2 : label || title ? 1 : 0}>
          {children}
        </InvReveal>
      </div>
    </section>
  )
}
