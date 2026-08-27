import React from 'react'

export default function Spinner({ size = 24, color = 'var(--ink-indigo)' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-8)' }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ animation: 'spin 0.8s linear infinite' }}
      >
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2.5" strokeOpacity="0.2" />
        <path d="M12 3a9 9 0 0 1 9 9" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    </div>
  )
}
