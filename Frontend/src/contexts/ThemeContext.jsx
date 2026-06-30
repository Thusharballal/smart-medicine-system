import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

/**
 * ThemeContext – manages light/dark mode.
 *
 * Requirement 11.4-11.6:
 *   - Preference stored in localStorage under key "theme".
 *   - Falls back to OS prefers-color-scheme on first load.
 *   - Applies "dark" class to <html> element (Tailwind class-based dark mode).
 *   - Also writes data-theme="light|dark" for non-Tailwind CSS consumers.
 */

const STORAGE_KEY = 'theme'

function getInitialTheme() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'dark' || stored === 'light') return stored
  } catch {
    // localStorage unavailable (SSR / private mode)
  }
  // OS preference
  if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) return 'dark'
  return 'light'
}

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(getInitialTheme)

  const applyTheme = useCallback((value) => {
    const root = document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(value)
    root.setAttribute('data-theme', value)
  }, [])

  // Apply on mount and whenever theme changes
  useEffect(() => {
    applyTheme(theme)
    try {
      localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      // ignore
    }
  }, [theme, applyTheme])

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'))
  }, [])

  const setTheme = useCallback((value) => {
    if (value === 'light' || value === 'dark') setThemeState(value)
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>')
  return ctx
}

export default ThemeContext
