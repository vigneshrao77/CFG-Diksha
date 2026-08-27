import React, { useEffect, useRef } from 'react'
import './Modal.css'

/**
 * Props:
 *  open        bool
 *  onClose     fn
 *  title       string
 *  children    ReactNode
 *  size        'sm' | 'md' | 'lg' (default 'md')
 *  footer      ReactNode
 */
export default function Modal({ open, onClose, title, children, size = 'md', footer }) {
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    function onKey(e) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="modal-backdrop" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className={`modal modal-${size}`} ref={ref} role="dialog" aria-modal="true">
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">{children}</div>

        {/* Footer */}
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  )
}
