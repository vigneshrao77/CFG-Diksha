/**
 * EmptyState — Shown when a list/table has no data
 * Props: icon, title, message, action (JSX)
 */
export default function EmptyState({ icon = '📭', title = 'No data found', message, action }) {
  return (
    <div style={{
      textAlign: 'center',
      padding: 'var(--sp-12) var(--sp-6)',
      color: 'var(--slate-400)',
    }}>
      <div style={{ fontSize: 48, marginBottom: 'var(--sp-4)', lineHeight: 1 }}>{icon}</div>
      <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--slate-600)', marginBottom: 'var(--sp-2)' }}>{title}</div>
      {message && <div style={{ fontSize: 14, maxWidth: 320, margin: '0 auto var(--sp-4)', lineHeight: 1.6 }}>{message}</div>}
      {action && <div style={{ marginTop: 'var(--sp-4)' }}>{action}</div>}
    </div>
  );
}
