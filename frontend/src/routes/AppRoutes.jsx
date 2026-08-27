import { Routes, Route, Navigate } from 'react-router-dom';

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

// Stub pages (maintained by Student/Admin teams — do not modify)
import StudentDashboard from '../pages/student/StudentDashboard';
import AdminDashboard from '../pages/admin/AdminDashboard';

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

      {/* ── Student Module (stub — maintained by student team) ─── */}
      <Route path="/student/*" element={<StudentDashboard />} />

      {/* ── Admin Module (stub — maintained by admin team) ───── */}
      <Route path="/admin/*" element={<AdminDashboard />} />

      {/* Default & Catch-all */}
      <Route path="/" element={<Navigate to="/teacher" replace />} />
      <Route path="*" element={<Navigate to="/teacher" replace />} />
    </Routes>
  );
}
