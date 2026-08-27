import React, { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, School, BookOpen, BarChart3,
  GitCompareArrows, Users, FileText, ChevronLeft,
  ChevronRight, Leaf
} from 'lucide-react'
import './AdminSidebar.css'

const navItems = [
  { to: '/admin',             label: 'Dashboard',    icon: LayoutDashboard, end: true },
  { to: '/admin/schools',     label: 'Schools',      icon: School },
  { to: '/admin/programs',    label: 'Programs',     icon: BookOpen },
  { to: '/admin/analytics',   label: 'Analytics',    icon: BarChart3 },
  { to: '/admin/comparisons', label: 'Comparisons',  icon: GitCompareArrows },
  { to: '/admin/teachers',    label: 'Teachers',     icon: Users },
  { to: '/admin/reports',     label: 'Reports',      icon: FileText },
]

export default function AdminSidebar({ collapsed, onToggle }) {
  return (
    <>
      {/* Desktop / Tablet Sidebar */}
      <aside className={`admin-sidebar ${collapsed ? 'collapsed' : ''}`}>
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="sidebar-logo">
            <Leaf size={20} />
          </div>
          {!collapsed && (
            <div className="sidebar-brand-text">
              <span className="brand-name">Diksha</span>
              <span className="brand-sub">Foundation</span>
            </div>
          )}
        </div>

        {/* Toggle */}
        <button className="sidebar-toggle" onClick={onToggle} title={collapsed ? 'Expand' : 'Collapse'}>
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

        {/* Nav */}
        <nav className="sidebar-nav">
          {!collapsed && <span className="nav-section-label">Navigation</span>}
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              title={collapsed ? label : undefined}
            >
              <Icon size={18} className="nav-icon" />
              {!collapsed && <span className="nav-label">{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        {!collapsed && (
          <div className="sidebar-footer">
            <div className="sidebar-admin-tag">
              <div className="avatar avatar-indigo" style={{ width: 30, height: 30, fontSize: 11 }}>AD</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>Admin</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-mono)' }}>Diksha Foundation</div>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Mobile Bottom Tab Bar */}
      <nav className="mobile-tab-bar">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => `mobile-tab-item ${isActive ? 'active' : ''}`}
          >
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  )
}
