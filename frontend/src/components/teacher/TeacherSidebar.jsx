import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function TeacherSidebar({ navItems, currentPath, teacher, notifOpen, onNotifToggle }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const activeTeacher = user || teacher;

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <aside style={{
      position: 'fixed',
      top: 0, left: 0, bottom: 0,
      width: 'var(--sidebar-width)',
      background: 'var(--ink-indigo)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 100,
      boxShadow: 'var(--shadow-sidebar)',
    }}
      className="teacher-sidebar"
    >
      {/* Logo / Brand */}
      <div style={{ padding: '24px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'var(--marigold)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18,
          }}>📚</div>
          <div>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: '#fff', fontSize: 15, lineHeight: 1.2 }}>
              Diksha
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Teacher Portal
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '12px 0', overflowY: 'auto' }} aria-label="Teacher navigation">
        {navItems.map((item) => {
          const active = item.exact
            ? currentPath === item.path
            : currentPath.startsWith(item.path);
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              aria-current={active ? 'page' : undefined}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                width: '100%', padding: '11px 20px',
                background: active ? 'rgba(242,169,59,0.12)' : 'transparent',
                color: active ? '#fff' : 'rgba(255,255,255,0.65)',
                border: 'none',
                borderLeft: `3px solid ${active ? 'var(--marigold)' : 'transparent'}`,
                cursor: 'pointer',
                fontFamily: 'var(--font-ui)',
                fontSize: 14,
                fontWeight: active ? 700 : 500,
                transition: 'all 0.15s ease',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => {
                if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.07)';
              }}
              onMouseLeave={(e) => {
                if (!active) e.currentTarget.style.background = 'transparent';
              }}
            >
              <span style={{ opacity: active ? 1 : 0.7, flexShrink: 0 }}>{item.icon}</span>
              <span className="sidebar-label">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Notification bell */}
      <div style={{ padding: '12px 20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <button
          onClick={onNotifToggle}
          aria-label="Open notifications"
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            width: '100%', padding: '10px 0',
            background: 'transparent', border: 'none',
            color: 'rgba(255,255,255,0.7)',
            cursor: 'pointer', fontFamily: 'var(--font-ui)',
            fontSize: 13, fontWeight: 500,
          }}
        >
          <span style={{ position: 'relative' }}>
            <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
              <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/>
            </svg>
            <span className="notif-badge">2</span>
          </span>
          <span className="sidebar-label">Notifications</span>
        </button>
      </div>

      {/* Teacher profile & Logout */}
      <div style={{ padding: '12px 20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
            <div style={{
              width: 34, height: 34, borderRadius: '50%',
              background: 'rgba(255,255,255,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0,
            }}>
              {activeTeacher?.initial || 'AR'}
            </div>
            <div className="sidebar-label" style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {activeTeacher?.name || 'Teacher'}
              </div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)' }}>Teacher</div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Sign out"
            aria-label="Sign out"
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: 'none',
              borderRadius: 6,
              color: 'rgba(255,255,255,0.7)',
              padding: '6px 8px',
              cursor: 'pointer',
              fontSize: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--kumkum-red)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
          >
            <svg viewBox="0 0 20 20" fill="currentColor" width="15" height="15">
              <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h6a1 1 0 100-2H4V5h5a1 1 0 100-2H3zm9.707 4.293a1 1 0 00-1.414 1.414L13.586 11H7a1 1 0 100 2h6.586l-2.293 2.293a1 1 0 101.414 1.414l4-4a1 1 0 000-1.414l-4-4z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .teacher-sidebar { display: none; }
        }
        @media (max-width: 1024px) and (min-width: 641px) {
          .teacher-sidebar { width: var(--sidebar-collapsed); }
          .sidebar-label { display: none; }
          .teacher-sidebar button { justify-content: center; padding-left: 0; padding-right: 0; }
          .teacher-sidebar .notif-badge { font-size: 8px; width: 12px; height: 12px; }
        }
      `}</style>
    </aside>
  );
}
