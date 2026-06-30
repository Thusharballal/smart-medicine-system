import React from 'react'

/**
 * PMBJPLogo – Custom SVG recreation of the Jan Aushadhi brand identity.
 *
 * This is an original SVG artwork inspired by the official
 * Pradhan Mantri Bhartiya Janaushadhi Pariyojana (PMBJP) colour scheme
 * (green #1a7a3c + saffron #FF6B00 + white) created for Final Year
 * Project demonstration purposes only.
 *
 * It is NOT a reproduction of the official government logo.
 * The official logo is the property of BPPI / Department of Pharmaceuticals,
 * Government of India. See: https://janaushadhi.gov.in
 *
 * Props:
 *   size     – pixel size (default: 40)
 *   variant  – 'full' (icon + text) | 'icon' | 'text'
 *   theme    – 'color' | 'white' | 'dark'
 *   className
 */

// ── Official Jan Aushadhi green & orange ──────────────────────────────
const GREEN  = '#1a7a3c'
const ORANGE = '#ff6b00'
const WHITE  = '#ffffff'

/** Pill + leaf mark – original SVG artwork */
function PillMark({ size = 40, theme = 'color' }) {
  const g  = theme === 'white' ? WHITE  : GREEN
  const o  = theme === 'white' ? WHITE  : ORANGE
  const bg = theme === 'dark'  ? 'rgba(255,255,255,0.12)' : 'transparent'

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      role="presentation"
    >
      {/* Background circle */}
      {theme === 'dark' && (
        <circle cx="24" cy="24" r="23" fill={bg} stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
      )}

      {/* ── Capsule / pill shape ─────────────────────────────────── */}
      {/* Left (green) half */}
      <path
        d="M24 10 C16.268 10 10 16.268 10 24 C10 31.732 16.268 38 24 38 L24 10 Z"
        fill={g}
        opacity="0.95"
      />
      {/* Right (orange/white) half */}
      <path
        d="M24 10 C31.732 10 38 16.268 38 24 C38 31.732 31.732 38 24 38 L24 10 Z"
        fill={o}
        opacity="0.9"
      />
      {/* Centre divider */}
      <line x1="24" y1="9" x2="24" y2="39" stroke={WHITE} strokeWidth="1.5" opacity="0.8" />

      {/* ── Leaf accent on green half ────────────────────────────── */}
      <path
        d="M19 20 Q16 24 19 28 Q22 25 22 24 Q22 22 19 20 Z"
        fill={WHITE}
        opacity="0.7"
      />

      {/* ── Rx symbol on orange half ─────────────────────────────── */}
      <text
        x="30"
        y="27"
        textAnchor="middle"
        fontSize="9"
        fontWeight="700"
        fontFamily="Arial, sans-serif"
        fill={WHITE}
        opacity="0.85"
      >
        Rx
      </text>

      {/* ── Outer ring ───────────────────────────────────────────── */}
      <circle
        cx="24"
        cy="24"
        r="13.5"
        stroke={theme === 'white' ? 'rgba(255,255,255,0.4)' : g}
        strokeWidth="1"
        fill="none"
        opacity="0.5"
      />
    </svg>
  )
}

/** Full wordmark with logo + official scheme text */
export function PMBJPWordmark({ size = 40, theme = 'color', showSubtitle = true, className = '' }) {
  const titleColor    = theme === 'white' ? '#ffffff' : '#1a7a3c'
  const subtitleColor = theme === 'white' ? 'rgba(255,255,255,0.75)' : '#555555'
  const accentColor   = theme === 'white' ? '#ffd580' : ORANGE

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`} aria-label="Jan Aushadhi – Pradhan Mantri Bhartiya Janaushadhi Pariyojana">
      <PillMark size={size} theme={theme} />
      <div className="flex flex-col leading-none">
        <span style={{ color: titleColor, fontSize: size * 0.45, fontWeight: 800, fontFamily: "'Sora','Inter',sans-serif", letterSpacing: '-0.02em', lineHeight: 1.1 }}>
          <span style={{ color: accentColor }}>Jan</span>
          <span>Aushadhi</span>
        </span>
        {showSubtitle && (
          <span style={{ color: subtitleColor, fontSize: size * 0.22, fontWeight: 500, marginTop: 2, letterSpacing: '0.01em' }}>
            Smart Medicine System
          </span>
        )}
      </div>
    </div>
  )
}

/** Compact icon-only mark */
export function PMBJPIcon({ size = 36, theme = 'color', className = '' }) {
  return (
    <span className={className} aria-label="Jan Aushadhi">
      <PillMark size={size} theme={theme} />
    </span>
  )
}

/** Official scheme name badge – text only */
export function PMBJPBadge({ theme = 'color', className = '' }) {
  const bg     = theme === 'white' ? 'rgba(255,255,255,0.12)' : 'rgba(26,122,60,0.08)'
  const border = theme === 'white' ? 'rgba(255,255,255,0.25)' : 'rgba(26,122,60,0.25)'
  const text   = theme === 'white' ? 'rgba(255,255,255,0.85)' : '#1a7a3c'

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${className}`}
      style={{ background: bg, border: `1px solid ${border}`, color: text }}
      aria-label="Pradhan Mantri Bhartiya Janaushadhi Pariyojana – Government of India"
    >
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
        <circle cx="6" cy="6" r="5.5" stroke="currentColor" strokeWidth="1" opacity="0.5" />
        <path d="M6 1 C3.79 1 1 3.79 1 6 C1 8.21 3.79 11 6 11 L6 1 Z" fill="currentColor" opacity="0.8" />
      </svg>
      🇮🇳 PMBJP · Govt. of India
    </div>
  )
}

/** Tagline component – official scheme tagline */
export function PMBJPTagline({ theme = 'white', className = '' }) {
  const color = theme === 'white' ? 'rgba(255,255,255,0.7)' : '#555'
  return (
    <p className={`text-xs font-medium italic ${className}`} style={{ color }} lang="hi">
      "सस्ती भी, अच्छी भी" — <span lang="en">Affordable and Good</span>
    </p>
  )
}

/** Full splash/hero branding block */
export function PMBJPHeroBrand({ className = '' }) {
  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <PillMark size={72} theme="dark" />
      <div className="text-center">
        <h1 style={{ fontFamily: "'Sora','Inter',sans-serif", fontWeight: 800, fontSize: '1.75rem', color: 'white', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
          <span style={{ color: '#4ade80' }}>Jan</span>
          <span>Aushadhi</span>
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginTop: '4px', fontWeight: 500 }}>
          Smart Medicine Recommendation System
        </p>
      </div>
      <PMBJPBadge theme="white" />
      <PMBJPTagline theme="white" />
    </div>
  )
}

export default PMBJPWordmark
