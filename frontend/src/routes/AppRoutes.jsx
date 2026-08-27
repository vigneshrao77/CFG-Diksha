import React from 'react';
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

// Admin pages & layout
import AdminLayout from '../pages/admin/AdminLayout.jsx';
import AdminDashboard from '../pages/admin/AdminDashboard.jsx';
import Schools from '../pages/admin/Schools.jsx';
import Programs from '../pages/admin/Programs.jsx';
import Analytics from '../pages/admin/Analytics.jsx';
import Comparisons from '../pages/admin/Comparisons.jsx';
import Teachers from '../pages/admin/Teachers.jsx';
import Reports from '../pages/admin/Reports.jsx';

// Student Module stub
import StudentDashboard from '../pages/student/StudentDashboard';

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

      {/* ── Student Module stub ─────────────────────────────────── */}
      <Route path="/student/*" element={<StudentDashboard />} />

      {/* Default & Catch-all */}
      <Route path="/" element={<Navigate to="/teacher" replace />} />
      <Route path="*" element={<Navigate to="/teacher" replace />} />
    </Routes>
  );
}
