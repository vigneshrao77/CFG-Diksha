/**
 * NotificationToast — Fixed top-right toast container
 * Receives toasts array from NotificationContext
 */
export default function NotificationToast({ toasts, onRemove }) {
  if (!toasts || toasts.length === 0) return null;

  const icons = {
    success: '✓',
    error: '✕',
    warning: '!',
    info: 'ℹ',
  };

  const colors = {
    success: 'var(--banyan-green)',
    error: 'var(--kumkum-red)',
    warning: 'var(--marigold)',
    info: 'var(--ink-indigo)',
  };

  return (
    <div className="toast-container" role="region" aria-label="Notifications" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast-${toast.type}`} role="alert">
          <div style={{
            width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
            background: `${colors[toast.type]}18`,
            color: colors[toast.type],
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: 13,
          }}>
            {icons[toast.type]}
          </div>
          <div style={{ flex: 1 }}>
            {toast.title && (
              <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--slate-800)', marginBottom: 2 }}>
                {toast.title}
              </div>
            )}
            <div style={{ fontSize: 13, color: 'var(--slate-600)', lineHeight: 1.4 }}>{toast.message}</div>
          </div>
          <button
            onClick={() => onRemove(toast.id)}
            aria-label="Dismiss notification"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--slate-400)', fontSize: 16, lineHeight: 1,
              padding: 2, flexShrink: 0,
            }}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
