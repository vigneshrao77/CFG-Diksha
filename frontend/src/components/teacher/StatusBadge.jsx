/**
 * StatusBadge — Semantic colored pill badge
 * variant: 'present' | 'absent' | 'improving' | 'stable' | 'declining' | 'active' | 'inactive' | 'attention' | string
 */
const VARIANTS = {
  present:   { bg: 'var(--banyan-green-light)',  color: 'var(--banyan-green)',  dot: 'var(--banyan-green)',  label: 'Present' },
  absent:    { bg: 'var(--kumkum-red-light)',    color: 'var(--kumkum-red)',    dot: 'var(--kumkum-red)',    label: 'Absent' },
  improving: { bg: '#e8f5ee',                    color: 'var(--banyan-green)',  dot: 'var(--banyan-green)',  label: 'Improving' },
  stable:    { bg: 'var(--slate-100)',           color: 'var(--slate-500)',     dot: 'var(--slate-400)',     label: 'Stable' },
  declining: { bg: 'var(--kumkum-red-light)',    color: 'var(--kumkum-red)',    dot: 'var(--kumkum-red)',    label: 'Declining' },
  active:    { bg: '#e8f5ee',                    color: 'var(--banyan-green)',  dot: 'var(--banyan-green)',  label: 'Active' },
  inactive:  { bg: 'var(--slate-100)',           color: 'var(--slate-500)',     dot: 'var(--slate-400)',     label: 'Inactive' },
  attention: { bg: 'var(--marigold-light)',      color: '#b5720a',             dot: 'var(--marigold)',      label: 'Needs Attention' },
  high:      { bg: '#e8f5ee',                    color: 'var(--banyan-green)',  dot: 'var(--banyan-green)',  label: 'High' },
  medium:    { bg: 'var(--ink-indigo-light)',    color: 'var(--ink-indigo)',    dot: 'var(--ink-indigo)',    label: 'Medium' },
  low:       { bg: 'var(--kumkum-red-light)',    color: 'var(--kumkum-red)',    dot: 'var(--kumkum-red)',    label: 'Low' },
};

export default function StatusBadge({ variant = 'stable', label, showDot = true }) {
  const v = VARIANTS[variant] || VARIANTS.stable;
  const displayLabel = label || v.label;

  return (
    <span
      role="status"
      aria-label={displayLabel}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '2px 10px',
        borderRadius: 'var(--radius-pill)',
        background: v.bg,
        color: v.color,
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: '0.01em',
        whiteSpace: 'nowrap',
      }}
    >
      {showDot && (
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: v.dot, flexShrink: 0 }} />
      )}
      {displayLabel}
    </span>
  );
}
