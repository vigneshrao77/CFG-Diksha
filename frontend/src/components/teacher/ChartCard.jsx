/**
 * ChartCard — Wrapper card for Recharts charts
 * Props: title, subtitle, actions (JSX), children
 */
export default function ChartCard({ title, subtitle, actions, children, style = {} }) {
  return (
    <div className="card" style={style}>
      <div className="card-header">
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--slate-800)' }}>{title}</div>
          {subtitle && <div style={{ fontSize: 12, color: 'var(--slate-400)', marginTop: 2 }}>{subtitle}</div>}
        </div>
        {actions && <div>{actions}</div>}
      </div>
      <div style={{ padding: '16px 8px 8px' }}>
        {children}
      </div>
    </div>
  );
}
