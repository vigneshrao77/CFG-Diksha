import React from 'react'

/**
 * StatCard — white surface card with Fraunces display number and optional trend
 *
 * Props:
 *  label       string
 *  value       string | number
 *  sub         string (optional secondary detail)
 *  trend       string  e.g. "+5.2%"
 *  trendUp     bool
 *  accent      'indigo' | 'green' | 'marigold' | 'red' (optional colored left edge)
 *  icon        ReactNode (lucide icon)
 */
export default function StatCard({ label, value, sub, trend, trendUp, accent, icon }) {
  return (
    <div className={`card ${accent ? `card-accent-${accent}` : ''}`} style={{ position: 'relative' }}>
      <div className="flex items-center justify-between mb-4">
        <span style={{
          fontSize: 11,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.07em',
          color: 'var(--slate-500)',
        }}>
          {label}
        </span>
        {icon && (
          <div style={{
            width: 36,
            height: 36,
            background: accent === 'green'
              ? 'var(--banyan-green-10)'
              : accent === 'red'
                ? 'var(--kumkum-red-10)'
                : accent === 'marigold'
                  ? 'var(--marigold-10)'
                  : 'var(--ink-indigo-10)',
            borderRadius: 'var(--radius-btn)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: accent === 'green'
              ? 'var(--banyan-green)'
              : accent === 'red'
                ? 'var(--kumkum-red)'
                : accent === 'marigold'
                  ? '#9a6200'
                  : 'var(--ink-indigo)',
          }}>
            {icon}
          </div>
        )}
      </div>

      <div className="display-num" style={{ fontSize: 32 }}>{value}</div>

      {sub && (
        <div className="text-muted text-sm mt-2">{sub}</div>
      )}

      {trend && (
        <div className="flex items-center gap-1 mt-2">
          <span style={{
            fontSize: 12,
            fontWeight: 600,
            color: trendUp ? 'var(--banyan-green)' : 'var(--kumkum-red)',
          }}>
            {trend}
          </span>
          <span className="text-sm text-muted">vs last period</span>
        </div>
      )}
    </div>
  )
}
