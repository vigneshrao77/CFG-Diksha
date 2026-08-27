import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import AdminSidebar from '../../components/Sidebar/AdminSidebar.jsx'
import AdminTopBar from '../../components/Navbar/AdminTopBar.jsx'

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="admin-shell">
      <AdminSidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
      <div className={`admin-content ${collapsed ? 'sidebar-collapsed' : ''}`}>
        <AdminTopBar />
        <Outlet />
      </div>
    </div>
  )
}
