/**
 * ScoreInput — Validated numeric score input
 * Props: label, value, onChange, max, min (default 0), id, disabled
 */
export default function ScoreInput({ label, value, onChange, max, min = 0, id, disabled = false }) {
  const handleChange = (e) => {
    const raw = e.target.value;
    if (raw === '' || raw === '-') {
      onChange('');
      return;
    }
    const num = parseInt(raw, 10);
    if (isNaN(num)) return;
    const clamped = Math.max(min, Math.min(max, num));
    onChange(clamped);
  };

  const isInvalid = value !== '' && value !== undefined && (value < min || value > max);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <label htmlFor={id} style={{ fontSize: 11, fontWeight: 600, color: 'var(--slate-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label} <span style={{ color: 'var(--slate-400)', fontWeight: 400 }}>/{max}</span>
      </label>
      <input
        id={id}
        type="number"
        min={min}
        max={max}
        value={value ?? ''}
        onChange={handleChange}
        disabled={disabled}
        aria-label={`${label}, maximum ${max}`}
        aria-invalid={isInvalid}
        style={{
          width: 64,
          padding: '6px 8px',
          border: `1px solid ${isInvalid ? 'var(--kumkum-red)' : 'var(--slate-300)'}`,
          borderRadius: 'var(--radius-btn)',
          fontFamily: 'var(--font-mono)',
          fontSize: 14,
          fontWeight: 600,
          textAlign: 'center',
          outline: 'none',
          background: disabled ? 'var(--slate-100)' : 'var(--white)',
          color: isInvalid ? 'var(--kumkum-red)' : 'var(--slate-800)',
          transition: 'border-color 0.15s',
        }}
        onFocus={(e) => e.target.style.borderColor = 'var(--ink-indigo)'}
        onBlur={(e) => e.target.style.borderColor = isInvalid ? 'var(--kumkum-red)' : 'var(--slate-300)'}
      />
      {isInvalid && (
        <span style={{ fontSize: 11, color: 'var(--kumkum-red)' }}>0–{max}</span>
      )}
    </div>
  );
}
