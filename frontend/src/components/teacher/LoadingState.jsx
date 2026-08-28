/**
 * LoadingState — Skeleton placeholder while data is loading
 * Props: rows (number), type ('table'|'cards'|'full')
 */
function SkeletonLine({ width = '100%', height = 14, style = {} }) {
  return (
    <div
      className="skeleton"
      style={{ width, height, borderRadius: 4, marginBottom: 8, ...style }}
      aria-hidden="true"
    />
  );
}

export default function LoadingState({ rows = 5, type = 'table' }) {
  if (type === 'full') {
    return (
      <div style={{ padding: 'var(--sp-8)' }} aria-busy="true" aria-label="Loading">
        <SkeletonLine width="40%" height={28} style={{ marginBottom: 16 }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
          {[1,2,3,4].map((i) => (
            <div key={i} className="card" style={{ padding: 20 }}>
              <SkeletonLine width="60%" height={12} />
              <SkeletonLine width="40%" height={28} style={{ marginTop: 8 }} />
              <SkeletonLine width="80%" height={10} />
            </div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {[1,2].map((i) => (
            <div key={i} className="card" style={{ padding: 20, height: 200 }}>
              <SkeletonLine width="50%" height={14} />
              <SkeletonLine width="100%" height={140} style={{ marginTop: 12 }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'cards') {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px,1fr))', gap: 16, padding: 4 }} aria-busy="true">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
              <div className="skeleton" style={{ width: 40, height: 40, borderRadius: '50%' }} />
              <div style={{ flex: 1 }}>
                <SkeletonLine width="70%" height={14} />
                <SkeletonLine width="40%" height={11} />
              </div>
            </div>
            <SkeletonLine />
            <SkeletonLine width="80%" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div aria-busy="true" aria-label="Loading data">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ display: 'flex', gap: 12, padding: '14px 16px', borderBottom: '1px solid var(--slate-100)' }}>
          <div className="skeleton" style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <SkeletonLine width="40%" height={13} />
            <SkeletonLine width="60%" height={11} />
          </div>
          <SkeletonLine width={60} height={24} style={{ borderRadius: 12, alignSelf: 'center', marginBottom: 0 }} />
        </div>
      ))}
    </div>
  );
}
