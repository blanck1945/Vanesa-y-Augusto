/** Pantalla de espera — anillos + ramita, paleta de la invitación. */
export function InvitacionLoader() {
  return (
    <div className="inv-loader" role="status" aria-label="Preparando invitación">
      <svg className="inv-loader-svg" viewBox="0 0 120 120" fill="none" aria-hidden>
        <g className="inv-loader-floral">
          <path
            d="M60 18c-2 8-8 12-14 11 6 1 10 5 12 13 2-8 6-12 14-13-6-1-12-5-12-11z"
            fill="currentColor"
            opacity="0.35"
          />
          <path
            d="M28 52c4-5 10-6 15-2-5-1-9 2-11 8 4-4 9-5 14-2-4-4-9-5-18-4z"
            fill="currentColor"
            opacity="0.22"
          />
          <path
            d="M92 52c-4-5-10-6-15-2 5-1 9 2 11 8-4-4-9-5-14-2 4-4 9-5 18-4z"
            fill="currentColor"
            opacity="0.22"
          />
        </g>
        <g className="inv-loader-rings">
          <circle className="inv-loader-ring inv-loader-ring--left" cx="48" cy="68" r="18" />
          <circle className="inv-loader-ring inv-loader-ring--right" cx="72" cy="68" r="18" />
        </g>
        <path
          className="inv-loader-heart"
          d="M60 82c-5 4-12 8-12 14a6 6 0 0 0 12 0c0-6-7-10-12-14z"
          fill="currentColor"
          opacity="0.5"
        />
      </svg>
      <p className="inv-loader-caption">Vanesa &amp; Augusto</p>
    </div>
  )
}
