/**
 * ConfirmDialog — Modal confirmation for destructive actions
 * Props: open, title, message, confirmLabel, onConfirm, onCancel, dangerous
 */
export default function ConfirmDialog({ open, title, message, confirmLabel = 'Confirm', onConfirm, onCancel, dangerous = false }) {
  if (!open) return null;

  return (
    <div className="confirm-dialog" role="dialog" aria-modal="true" aria-label={title}>
      <div className="confirm-box">
        <div style={{ fontSize: 36, marginBottom: 'var(--sp-4)' }}>
          {dangerous ? '⚠️' : '❓'}
        </div>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 'var(--sp-2)', color: 'var(--slate-800)' }}>
          {title}
        </h2>
        {message && (
          <p style={{ fontSize: 14, color: 'var(--slate-500)', marginBottom: 'var(--sp-6)', lineHeight: 1.6 }}>
            {message}
          </p>
        )}
        <div style={{ display: 'flex', gap: 'var(--sp-3)', justifyContent: 'center' }}>
          <button className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button
            className={dangerous ? 'btn btn-danger' : 'btn btn-primary'}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
