import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import AdminLayout from '../pages/admin/AdminLayout.jsx'
import AdminDashboard from '../pages/admin/AdminDashboard.jsx'
import Schools from '../pages/admin/Schools.jsx'
import Programs from '../pages/admin/Programs.jsx'
import Analytics from '../pages/admin/Analytics.jsx'
import Comparisons from '../pages/admin/Comparisons.jsx'
import Teachers from '../pages/admin/Teachers.jsx'
import Reports from '../pages/admin/Reports.jsx'

export default function AppRoutes() {
  return (
    <Routes>
      {/* Redirect root to admin */}
      <Route path="/" element={<Navigate to="/admin" replace />} />

      {/* Admin routes — wrapped in shared layout */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="schools"     element={<Schools />} />
        <Route path="programs"    element={<Programs />} />
        <Route path="analytics"   element={<Analytics />} />
        <Route path="comparisons" element={<Comparisons />} />
        <Route path="teachers"    element={<Teachers />} />
        <Route path="reports"     element={<Reports />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  )
}
