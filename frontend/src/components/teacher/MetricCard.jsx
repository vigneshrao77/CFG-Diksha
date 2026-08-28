/**
 * MetricCard — Dashboard stat card
 * Props: title, value, subtitle, accentColor, icon, trend, trendValue
 */
export default function MetricCard({ title, value, subtitle, accentColor, icon, trend, trendValue }) {
  const trendColors = {
    up: 'var(--banyan-green)',
    down: 'var(--kumkum-red)',
    neutral: 'var(--slate-400)',
  };

  return (
    <div
      className="card"
      style={{
        borderLeft: `4px solid ${accentColor || 'var(--ink-indigo)'}`,
        padding: 'var(--sp-5)',
        position: 'relative',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'var(--shadow-card)';
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--sp-3)' }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--slate-400)', marginBottom: 4 }}>
            {title}
          </div>
          <div className="metric-number" style={{ fontSize: '2rem' }}>{value}</div>
        </div>
        {icon && (
          <div style={{
            width: 44, height: 44, borderRadius: 10,
            background: `${accentColor || 'var(--ink-indigo)'}18`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20,
          }}>
            {icon}
          </div>
        )}
      </div>

      {(subtitle || trend) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', flexWrap: 'wrap' }}>
          {trend && trendValue !== undefined && (
            <span style={{
              fontSize: 12, fontWeight: 700,
              color: trendColors[trend] || 'var(--slate-400)',
              display: 'flex', alignItems: 'center', gap: 2,
            }}>
              {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {Math.abs(trendValue)}%
            </span>
          )}
          {subtitle && (
            <span style={{ fontSize: 12, color: 'var(--slate-400)' }}>{subtitle}</span>
          )}
        </div>
      )}
    </div>
  );
}
