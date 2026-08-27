import { useState, useEffect } from 'react';
import { getTeacherAlerts } from '../../services/teacherService';

const TYPE_COLORS = {
  performance: 'var(--kumkum-red)',
  attendance: 'var(--marigold)',
  assignment: 'var(--ink-indigo)',
  behaviour: '#6B48A2',
  general: 'var(--slate-400)',
};

export default function NotificationCenter({ onClose }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTeacherAlerts().then((data) => {
      setAlerts(data);
      setLoading(false);
    });
  }, []);

  const unread = alerts.filter((a) => !a.read);

  const markRead = (id) => {
    setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, read: true } : a));
  };

  const formatTime = (iso) => {
    const d = new Date(iso);
    const now = new Date();
    const diff = (now - d) / 1000;
    if (diff < 3600) return `${Math.round(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.round(diff / 3600)}h ago`;
    return `${Math.round(diff / 86400)}d ago`;
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, zIndex: 149 }}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-label="Notification center"
        style={{
          position: 'fixed',
          top: 60, right: 16,
          width: 360,
          maxHeight: '80vh',
          background: 'var(--white)',
          borderRadius: 'var(--radius-modal)',
          boxShadow: 'var(--shadow-modal)',
          zIndex: 150,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'modalIn 0.2s ease',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--slate-100)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--slate-800)' }}>Notifications</div>
            {unread.length > 0 && (
              <div style={{ fontSize: 12, color: 'var(--kumkum-red)', fontWeight: 600 }}>
                {unread.length} unread
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close notifications"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate-400)', fontSize: 20 }}
          >
            ×
          </button>
        </div>

        {/* List */}
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {loading ? (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--slate-400)', fontSize: 14 }}>
              Loading...
            </div>
          ) : alerts.length === 0 ? (
            <div style={{ padding: 32, textAlign: 'center', color: 'var(--slate-400)', fontSize: 14 }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>🔔</div>
              No notifications yet
            </div>
          ) : (
            alerts.map((alert) => (
              <div
                key={alert.id}
                onClick={() => markRead(alert.id)}
                style={{
                  padding: '14px 20px',
                  borderBottom: '1px solid var(--slate-100)',
                  background: alert.read ? 'transparent' : 'rgba(30,58,95,0.03)',
                  cursor: 'pointer',
                  borderLeft: `3px solid ${TYPE_COLORS[alert.type] || 'var(--slate-300)'}`,
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--slate-100)'}
                onMouseLeave={(e) => e.currentTarget.style.background = alert.read ? 'transparent' : 'rgba(30,58,95,0.03)'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--slate-800)', marginBottom: 3 }}>
                      {alert.title}
                      {!alert.read && (
                        <span style={{
                          display: 'inline-block', width: 7, height: 7, borderRadius: '50%',
                          background: 'var(--kumkum-red)', marginLeft: 6, verticalAlign: 'middle',
                        }} />
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--slate-500)', lineHeight: 1.5, marginBottom: 4 }}>
                      {alert.message.length > 80 ? alert.message.slice(0, 80) + '…' : alert.message}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--slate-400)', display: 'flex', gap: 8 }}>
                      <span>→ {alert.studentName}</span>
                      <span>·</span>
                      <span>{formatTime(alert.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {alerts.length > 0 && (
          <div style={{ padding: '10px 20px', borderTop: '1px solid var(--slate-100)', textAlign: 'center' }}>
            <button
              onClick={() => setAlerts((prev) => prev.map((a) => ({ ...a, read: true })))}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-indigo)', fontSize: 13, fontWeight: 600 }}
            >
              Mark all as read
            </button>
          </div>
        )}
      </div>
    </>
  );
}
