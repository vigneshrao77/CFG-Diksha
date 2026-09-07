import React, { useState } from 'react';
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, TrendingUp, Trophy, Brain, 
  Bell, Sparkles, X, HeartHandshake
} from 'lucide-react';

// Auth pages & guards
import TeacherLogin from '../pages/auth/TeacherLogin';
import TeacherRegister from '../pages/auth/TeacherRegister';
import ProtectedRoute from '../components/auth/ProtectedRoute';

// Teacher pages
import TeacherDashboard from '../pages/teacher/TeacherDashboard';
import TeacherStudents from '../pages/teacher/TeacherStudents';
import Attendance from '../pages/teacher/Attendance';
import HealthCheckup from '../pages/teacher/HealthCheckup';
import Assessments from '../pages/teacher/Assessments';
import Behaviour from '../pages/teacher/Behaviour';
import Alerts from '../pages/teacher/Alerts';

// Admin pages & layout
import AdminLayout from '../pages/admin/AdminLayout.jsx';
import AdminDashboard from '../pages/admin/AdminDashboard.jsx';
import Schools from '../pages/admin/Schools.jsx';
import Programs from '../pages/admin/Programs.jsx';
import Analytics from '../pages/admin/Analytics.jsx';
import Comparisons from '../pages/admin/Comparisons.jsx';
import Teachers from '../pages/admin/Teachers.jsx';
import Reports from '../pages/admin/Reports.jsx';

// Student pages
import StudentDashboard from '../pages/student/StudentDashboard';
import MyProgress from '../pages/student/MyProgress';
import Leaderboard from '../pages/student/Leaderboard';
import SELAnalysis from '../pages/student/SELAnalysis';
import Achievements from '../pages/student/Achievements';
import Notifications from '../pages/student/Notifications';

function StudentLayout({ children }) {
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);

  const navItems = [
    { path: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/student/progress', label: 'My Progress', icon: TrendingUp },
    { path: '/student/leaderboard', label: 'Leaderboard', icon: Trophy },
    { path: '/student/sel-analysis', label: 'SEL Analysis', icon: Brain }
  ];

  return (
    <div style={styles.appShell}>
      {/* Fixed Ink Indigo Sidebar (#1E3A5F) */}
      <aside style={styles.sidebar}>
        <div style={styles.sidebarBrand}>
          <div style={styles.brandIconBox}>
            <Sparkles size={20} color="#F2A93B" />
          </div>
          <div style={styles.brandTextGroup}>
            <div style={styles.brandName}>CFG-Diksha</div>
            <div style={styles.brandSubtitle}>Student Module</div>
          </div>
        </div>

        <nav style={styles.sidebarNav}>
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link 
                key={item.path} 
                to={item.path} 
                style={isActive ? styles.navItemActive : styles.navItem}
              >
                <div style={isActive ? styles.marigoldActiveIndicator : styles.inactiveIndicator}></div>
                <Icon size={18} style={styles.navIcon} />
                <span style={styles.navLabel}>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Marigold Action Button */}
        <div style={styles.sidebarFooter}>
          <Link to="/student/sel-analysis" style={styles.marigoldGiveBtn}>
            <HeartHandshake size={16} /> Start SEL Analysis
          </Link>
        </div>
      </aside>

      {/* Main Container Area */}
      <div style={styles.mainContainer}>
        {/* Top Header Bar */}
        <header style={styles.topHeader}>
          <div style={styles.headerLeft}>
            <span style={styles.portalTag}>DIKSHA STUDENT PLATFORM</span>
          </div>

          <div style={styles.headerRight}>
            <button 
              onClick={() => setShowNotifications(!showNotifications)} 
              style={styles.bellBtn}
              title="Notifications"
            >
              <Bell size={18} color="#1E3A5F" />
              <span style={styles.bellDot}></span>
            </button>
            <div style={styles.userProfilePill}>
              <div style={styles.avatar}>S</div>
              <span style={styles.userName}>Sahasra V.</span>
            </div>
          </div>
        </header>

        {/* Notification Overlay */}
        {showNotifications && (
          <div style={styles.notificationOverlay}>
            <div style={styles.notifHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Bell size={16} color="#1E3A5F" />
                <h4 style={{ margin: 0, fontFamily: 'var(--font-serif)', color: '#1E3A5F' }}>Notifications Center</h4>
              </div>
              <button onClick={() => setShowNotifications(false)} style={styles.closeBtn}>
                <X size={16} />
              </button>
            </div>

            <div style={styles.notifBody}>
              <div style={styles.dayGroup}>
                <span style={styles.dayTag}>TODAY</span>
                <div style={styles.toastCard}>
                  <div style={{ ...styles.toastColorBar, backgroundColor: '#3F8F5F' }}></div>
                  <div style={{ flex: 1 }}>
                    <div style={styles.toastTitle}>SEL Voice Analysis Completed</div>
                    <div style={styles.toastMsg}>Overall SEL Development reached 82%.</div>
                    <div style={styles.toastTime}>10:30 AM</div>
                  </div>
                </div>
              </div>

              <div style={styles.dayGroup}>
                <span style={styles.dayTag}>YESTERDAY</span>
                <div style={styles.toastCard}>
                  <div style={{ ...styles.toastColorBar, backgroundColor: '#F2A93B' }}></div>
                  <div style={{ flex: 1 }}>
                    <div style={styles.toastTitle}>Monthly Assignment Result</div>
                    <div style={styles.toastMsg}>Scored 18/20 marks in monthly assignment.</div>
                    <div style={styles.toastTime}>Yesterday</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Page Content View */}
        <main style={styles.contentBody}>
          {children}
        </main>
      </div>
    </div>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* ── Public Auth Routes ──────────────────────────────────── */}
      <Route path="/login" element={<TeacherLogin />} />
      <Route path="/register" element={<TeacherRegister />} />
      <Route path="/teacher/login" element={<Navigate to="/login" replace />} />

      {/* ── Protected Teacher Module ────────────────────────────── */}
      <Route
        path="/teacher"
        element={
          <ProtectedRoute>
            <TeacherDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/students"
        element={
          <ProtectedRoute>
            <TeacherStudents />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/attendance"
        element={
          <ProtectedRoute>
            <Attendance />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/health"
        element={
          <ProtectedRoute>
            <HealthCheckup />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/assessments"
        element={
          <ProtectedRoute>
            <Assessments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/behaviour"
        element={
          <ProtectedRoute>
            <Behaviour />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/alerts"
        element={
          <ProtectedRoute>
            <Alerts />
          </ProtectedRoute>
        }
      />

      {/* ── Admin Module ────────────────────────────────────────── */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="schools" element={<Schools />} />
        <Route path="programs" element={<Programs />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="comparisons" element={<Comparisons />} />
        <Route path="teachers" element={<Teachers />} />
        <Route path="reports" element={<Reports />} />
      </Route>

      {/* ── Student Module ──────────────────────────────────────── */}
      <Route path="/student" element={<Navigate to="/student/dashboard" replace />} />
      <Route path="/student/dashboard" element={<StudentLayout><StudentDashboard /></StudentLayout>} />
      <Route path="/student/progress" element={<StudentLayout><MyProgress /></StudentLayout>} />
      <Route path="/student/leaderboard" element={<StudentLayout><Leaderboard /></StudentLayout>} />
      <Route path="/student/sel-analysis" element={<StudentLayout><SELAnalysis /></StudentLayout>} />
      <Route path="/student/sel-assessment" element={<StudentLayout><SELAnalysis /></StudentLayout>} />
      <Route path="/student/communication" element={<StudentLayout><SELAnalysis /></StudentLayout>} />
      <Route path="/student/achievements" element={<StudentLayout><Achievements /></StudentLayout>} />
      <Route path="/student/notifications" element={<StudentLayout><Notifications /></StudentLayout>} />

      {/* Default & Catch-all */}
      <Route path="/" element={<Navigate to="/student/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/student/dashboard" replace />} />
    </Routes>
  );
}

const styles = {
  appShell: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#F7F7F5'
  },
  sidebar: {
    width: '250px',
    backgroundColor: '#1E3A5F',
    color: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    top: 0,
    bottom: 0,
    left: 0,
    zIndex: 100,
    boxShadow: '4px 0 16px rgba(0,0,0,0.06)'
  },
  sidebarBrand: {
    padding: '24px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
  },
  brandIconBox: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  brandTextGroup: {
    display: 'flex',
    flexDirection: 'column'
  },
  brandName: {
    fontFamily: 'var(--font-serif)',
    fontSize: '18px',
    fontWeight: '800',
    color: '#ffffff',
    lineHeight: 1
  },
  brandSubtitle: {
    fontSize: '11px',
    color: '#94A3B8',
    marginTop: '3px'
  },
  sidebarNav: {
    flex: 1,
    padding: '16px 0',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    overflowY: 'auto'
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 16px',
    color: '#94A3B8',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '500',
    position: 'relative',
    transition: 'all 0.2s ease'
  },
  navItemActive: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 16px',
    color: '#ffffff',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '700',
    position: 'relative'
  },
  marigoldActiveIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '4px',
    backgroundColor: '#F2A93B'
  },
  inactiveIndicator: {
    display: 'none'
  },
  navIcon: {
    marginRight: '12px'
  },
  navLabel: {
    fontFamily: 'var(--font-sans)'
  },
  sidebarFooter: {
    padding: '16px 20px 24px 20px',
    borderTop: '1px solid rgba(255, 255, 255, 0.08)'
  },
  marigoldGiveBtn: {
    backgroundColor: '#F2A93B',
    color: '#1E3A5F',
    padding: '10px 16px',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: '800',
    fontSize: '13px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    boxShadow: '0 4px 12px rgba(242, 169, 59, 0.25)'
  },
  mainContainer: {
    flex: 1,
    marginLeft: '250px',
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh'
  },
  topHeader: {
    height: '64px',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #E2E8F0',
    padding: '0 32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'sticky',
    top: 0,
    zIndex: 90
  },
  portalTag: {
    fontFamily: 'var(--font-mono)',
    fontSize: '11px',
    fontWeight: '600',
    color: '#64748B',
    letterSpacing: '0.05em'
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  bellBtn: {
    backgroundColor: '#F1F5F9',
    border: 'none',
    width: '38px',
    height: '38px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    position: 'relative'
  },
  bellDot: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#F2A93B'
  },
  userProfilePill: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '4px 12px 4px 4px',
    backgroundColor: '#F8FAFC',
    borderRadius: '9999px',
    border: '1px solid #E2E8F0'
  },
  avatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: '#1E3A5F',
    color: '#ffffff',
    fontWeight: '800',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px'
  },
  userName: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#1E293B'
  },
  contentBody: {
    flex: 1,
    paddingBottom: '60px'
  },
  notificationOverlay: {
    position: 'fixed',
    top: '72px',
    right: '32px',
    width: '340px',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #E2E8F0',
    boxShadow: 'var(--shadow-dropdown)',
    zIndex: 200,
    padding: '16px'
  },
  notifHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '12px',
    borderBottom: '1px solid #F1F5F9'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#64748B'
  },
  notifBody: {
    marginTop: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  dayGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  dayTag: {
    fontFamily: 'var(--font-mono)',
    fontSize: '10px',
    fontWeight: '700',
    color: '#94A3B8'
  },
  toastCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: '8px',
    padding: '10px 12px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    border: '1px solid #E2E8F0',
    position: 'relative',
    overflow: 'hidden'
  },
  toastColorBar: {
    width: '4px',
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0
  },
  toastTitle: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#1E293B',
    paddingLeft: '6px'
  },
  toastMsg: {
    fontSize: '12px',
    color: '#475569',
    marginTop: '2px',
    paddingLeft: '6px'
  },
  toastTime: {
    fontFamily: 'var(--font-mono)',
    fontSize: '10px',
    color: '#94A3B8',
    marginTop: '4px',
    paddingLeft: '6px'
  }
};
