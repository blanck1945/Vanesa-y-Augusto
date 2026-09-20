type AdminThemeToggleProps = {
  theme: 'light' | 'dark'
  onToggle: () => void
}

function IconSun() {
  return (
    <svg className="admin-theme-icon" viewBox="0 0 24 24" width={18} height={18} aria-hidden="true">
      <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
      />
    </svg>
  )
}

function IconMoon() {
  return (
    <svg className="admin-theme-icon" viewBox="0 0 24 24" width={18} height={18} aria-hidden="true">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20 14.5A8.5 8.5 0 0 1 9.5 4 10 10 0 0 0 20 14.5z"
      />
    </svg>
  )
}

export function AdminThemeToggle({ theme, onToggle }: AdminThemeToggleProps) {
  const label = theme === 'dark' ? 'Modo claro' : 'Modo oscuro'

  return (
    <button
      type="button"
      className="admin-theme-toggle bp-btn-secondary bp-btn-sm"
      onClick={onToggle}
      aria-pressed={theme === 'dark'}
      aria-label={label}
      title={label}
    >
      {theme === 'dark' ? <IconSun /> : <IconMoon />}
    </button>
  )
}
