import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import TeacherSidebar from './TeacherSidebar';
import NotificationToast from './NotificationToast';
import NotificationCenter from './NotificationCenter';
import { useNotification } from '../../contexts/NotificationContext';
import { TEACHER_PROFILE } from '../../data/mockData';

const NAV_ITEMS = [
  { path: '/teacher', label: 'Dashboard', exact: true, icon: (
    <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
      <path d="M2 11l8-8 8 8v8a1 1 0 01-1 1H3a1 1 0 01-1-1v-8z"/>
      <path d="M7 21V13h6v8"/>
    </svg>
  )},
  { path: '/teacher/students', label: 'Students', icon: (
    <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
    </svg>
  )},
  { path: '/teacher/attendance', label: 'Attendance', icon: (
    <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
    </svg>
  )},
  { path: '/teacher/health', label: 'Health Checkup', icon: (
    <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"/>
    </svg>
  )},
  { path: '/teacher/assessments', label: 'Assessments', icon: (
    <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
      <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
    </svg>
  )},
  { path: '/teacher/behaviour', label: 'Behaviour & AI', icon: (
    <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
      <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd"/>
    </svg>
  )},
  { path: '/teacher/alerts', label: 'Alerts', icon: (
    <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
      <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/>
    </svg>
  )},
];

export { NAV_ITEMS };

export default function TeacherLayout({ children }) {
  const { toasts, removeToast } = useNotification();
  const [notifOpen, setNotifOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const currentNav = NAV_ITEMS.find((item) =>
    item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path)
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--warm-neutral)' }}>
      {/* Sidebar — desktop/tablet */}
      <TeacherSidebar
        navItems={NAV_ITEMS}
        currentPath={location.pathname}
        teacher={TEACHER_PROFILE}
        notifOpen={notifOpen}
        onNotifToggle={() => setNotifOpen((o) => !o)}
      />

      {/* Main Content */}
      <div style={{
        flex: 1,
        marginLeft: 'var(--sidebar-width)',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        overflowX: 'hidden',
      }}
        className="layout-main"
      >
        {children}
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="bottom-nav" aria-label="Teacher navigation">
        {NAV_ITEMS.slice(0, 5).map((item) => {
          const active = item.exact
            ? location.pathname === item.path
            : location.pathname.startsWith(item.path);
          return (
            <button
              key={item.path}
              className={`bottom-nav-item${active ? ' active' : ''}`}
              onClick={() => navigate(item.path)}
              aria-label={item.label}
              aria-current={active ? 'page' : undefined}
            >
              {item.icon}
              <span>{item.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </nav>

      {/* Toast Notifications */}
      <NotificationToast toasts={toasts} onRemove={removeToast} />

      {/* Notification Center */}
      {notifOpen && <NotificationCenter onClose={() => setNotifOpen(false)} />}

      <style>{`
        @media (max-width: 640px) {
          .layout-main { margin-left: 0 !important; }
        }
        @media (max-width: 1024px) and (min-width: 641px) {
          .layout-main { margin-left: var(--sidebar-collapsed) !important; }
        }
      `}</style>
    </div>
  );
}
