/**
 * TrendIndicator — Shows % change with direction arrow
 * Props: change (number), size ('sm'|'md')
 */
export default function TrendIndicator({ change, size = 'sm' }) {
  if (change === undefined || change === null) return null;

  const abs = Math.abs(change);
  const isUp = change > 0;
  const isDown = change < 0;
  const isNeutral = change === 0;

  const color = isUp
    ? 'var(--banyan-green)'
    : isDown
    ? 'var(--kumkum-red)'
    : 'var(--slate-400)';

  const arrow = isUp ? '↑' : isDown ? '↓' : '→';
  const fontSize = size === 'md' ? 14 : 12;

  return (
    <span
      aria-label={`${isUp ? 'Increased' : isDown ? 'Decreased' : 'No change'} by ${abs.toFixed(1)}%`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 2,
        color,
        fontSize,
        fontWeight: 700,
        fontFamily: 'var(--font-mono)',
      }}
    >
      {arrow} {abs.toFixed(1)}%
    </span>
  );
}
