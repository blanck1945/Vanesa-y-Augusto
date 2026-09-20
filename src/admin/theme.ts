export type AdminTheme = 'light' | 'dark'

const STORAGE_KEY = 'casamiento-admin-theme'

export function getStoredAdminTheme(): AdminTheme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'dark' || stored === 'light') return stored
  } catch {
    /* ignore */
  }
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  }
  return 'light'
}

export function applyAdminTheme(theme: AdminTheme): void {
  document.documentElement.dataset.adminTheme = theme
}

export function setAdminTheme(theme: AdminTheme): void {
  try {
    localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    /* ignore */
  }
  applyAdminTheme(theme)
}

export function clearAdminTheme(): void {
  delete document.documentElement.dataset.adminTheme
}
