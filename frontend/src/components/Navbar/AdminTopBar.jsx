import React, { useState, useRef, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Search, Bell, X, CheckCircle, AlertTriangle, Info } from 'lucide-react'
import './AdminTopBar.css'

const routeTitles = {
  '/admin': 'Dashboard',
  '/admin/schools': 'Schools & Centres',
  '/admin/programs': 'Programs',
  '/admin/analytics': 'Analytics',
  '/admin/comparisons': 'Comparisons',
  '/admin/teachers': 'Teachers & Staff',
  '/admin/reports': 'Reports',
}

const mockNotifications = [
  { id: 1, type: 'warning', title: 'Low attendance flagged', body: 'KHEL Centre 2 dropped below 75% this week', time: '10:32 AM', read: false },
  { id: 2, type: 'info', title: 'New teacher added', body: 'Priya Sharma added to KHEL Centre 1 — SEL Program', time: '09:15 AM', read: false },
  { id: 3, type: 'success', title: 'Report generated', body: 'Q2 Donor Impact Report exported successfully', time: 'Yesterday', read: true },
  { id: 4, type: 'warning', title: 'Health checkup overdue', body: '18 students at Govt School B pending checkup', time: 'Yesterday', read: true },
  { id: 5, type: 'info', title: 'Program milestone', body: 'SEL Program completed 80% of annual targets', time: '2 days ago', read: true },
]

const iconMap = {
  warning: <AlertTriangle size={14} />,
  success: <CheckCircle size={14} />,
  info: <Info size={14} />,
}

export default function AdminTopBar({ pageTitle }) {
  const location = useLocation()
  const title = pageTitle || routeTitles[location.pathname] || 'Admin'
  const [notifOpen, setNotifOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [notifications, setNotifications] = useState(mockNotifications)
  const ref = useRef(null)

  const unread = notifications.filter(n => !n.read).length

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setNotifOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function markAllRead() {
    setNotifications(n => n.map(x => ({ ...x, read: true })))
  }

  return (
    <header className="admin-topbar">
      <div className="topbar-left">
        <h1 className="topbar-title">{title}</h1>
      </div>

      <div className="topbar-right">
        {/* Search */}
        <div className="topbar-search">
          <Search size={15} className="search-icon" />
          <input
            type="text"
            placeholder="Search schools, teachers…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="search-input"
          />
        </div>

        {/* Bell */}
        <div className="notif-wrapper" ref={ref}>
          <button
            className="topbar-icon-btn"
            onClick={() => setNotifOpen(o => !o)}
            aria-label="Notifications"
          >
            <Bell size={18} />
            {unread > 0 && <span className="notif-badge">{unread}</span>}
          </button>

          {notifOpen && (
            <div className="notif-panel">
              <div className="notif-header">
                <span className="notif-panel-title">Notifications</span>
                <button className="btn btn-ghost btn-sm" onClick={markAllRead}>
                  Mark all read
                </button>
              </div>

              <div className="notif-group-label">Today</div>
              {notifications.filter(n => n.time.includes('AM') || n.time.includes('PM')).map(n => (
                <NotifItem key={n.id} n={n} />
              ))}

              <div className="notif-group-label">Earlier</div>
              {notifications.filter(n => !n.time.includes('AM') && !n.time.includes('PM')).map(n => (
                <NotifItem key={n.id} n={n} />
              ))}
            </div>
          )}
        </div>

        {/* Admin avatar */}
        <div className="topbar-avatar">
          <div className="avatar avatar-indigo">AD</div>
          <div className="topbar-admin-info">
            <span className="topbar-admin-name">Admin</span>
          </div>
        </div>
      </div>
    </header>
  )
}

function NotifItem({ n }) {
  return (
    <div className={`notif-item ${n.read ? 'read' : ''} notif-${n.type}`}>
      <div className="notif-icon">{iconMap[n.type]}</div>
      <div className="notif-body">
        <div className="notif-title">{n.title}</div>
        <div className="notif-text">{n.body}</div>
        <div className="notif-time label-mono">{n.time}</div>
      </div>
      {!n.read && <span className="notif-dot" />}
    </div>
  )
}
