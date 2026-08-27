import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Users, School, BookOpen, Activity,
  TrendingUp, AlertTriangle, CheckCircle, Info,
  ArrowRight, UserPlus, FileText, Bell
} from 'lucide-react'
import StatCard from '../../components/Card/StatCard.jsx'
import DLineChart from '../../components/Charts/LineChart.jsx'
import DonutChart from '../../components/Charts/DonutChart.jsx'
import { getDashboardMetrics, getAttendanceTrend } from '../../services/adminService.js'

const alertColor = { high: 'var(--kumkum-red)', medium: 'var(--marigold)', low: 'var(--banyan-green)' }
const activityIcon = {
  teacher_add: <UserPlus size={14} />,
  report: <FileText size={14} />,
  alert: <AlertTriangle size={14} />,
  program: <BookOpen size={14} />,
  health: <Activity size={14} />,
}

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState(null)
  const [trend, setTrend] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getDashboardMetrics(), getAttendanceTrend('monthly')]).then(([m, t]) => {
      setMetrics(m)
      setTrend(t)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="page-body">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, color: 'var(--slate-400)', fontSize: 14 }}>
          Loading dashboard…
        </div>
      </div>
    )
  }

  const holisticData = [
    { name: 'Academic', value: metrics.avgAcademicScore },
    { name: 'SEL Index', value: metrics.avgSELIndex },
    { name: 'Health', value: metrics.healthCoverage },
    { name: 'Gap', value: Math.max(0, 100 - metrics.avgAcademicScore) },
  ]

  return (
    <div className="page-body">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Executive Overview</h1>
          <p className="page-subtitle">Diksha Foundation — District-wide student well-being snapshot</p>
        </div>
        <div className="flex gap-2">
          <Link to="/admin/teachers" className="btn btn-secondary">
            <UserPlus size={15} /> Add Teacher
          </Link>
          <Link to="/admin/reports" className="btn btn-primary">
            <FileText size={15} /> Generate Report
          </Link>
        </div>
      </div>

      {/* KPI Row */}
      <div className="stat-row">
        <StatCard
          label="Total Students"
          value={metrics.totalStudents.toLocaleString()}
          sub={`${metrics.totalAfterSchool} after-school · ${metrics.totalPartnerSchool} partner schools`}
          trend="+8.2%"
          trendUp={true}
          accent="indigo"
          icon={<Users size={18} />}
        />
        <StatCard
          label="Active Centres"
          value={metrics.activeCentres}
          sub="3 KHEL Centres + 4 Govt School Partnerships"
          accent="green"
          icon={<School size={18} />}
        />
        <StatCard
          label="Staff & Volunteers"
          value={metrics.staffCount + metrics.volunteerCount}
          sub={`${metrics.staffCount} core staff · ${metrics.volunteerCount} volunteers`}
          accent="marigold"
          icon={<Users size={18} />}
        />
        <StatCard
          label="Overall Attendance"
          value={`${metrics.overallAttendance}%`}
          trend="+3.1%"
          trendUp={true}
          accent={metrics.overallAttendance >= 80 ? 'green' : 'red'}
          icon={<Activity size={18} />}
        />
      </div>

      {/* Charts Row */}
      <div className="grid-2" style={{ marginBottom: 'var(--space-6)' }}>
        {/* Attendance Trend */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title" style={{ margin: 0 }}>Attendance Trend</h2>
            <Link to="/admin/analytics" className="btn btn-ghost btn-sm">
              View Analytics <ArrowRight size={12} />
            </Link>
          </div>
          <DLineChart
            data={trend}
            xKey="month"
            lines={[
              { key: 'KHEL 1', name: 'KHEL 1', color: '#1E3A5F' },
              { key: 'KHEL 2', name: 'KHEL 2', color: '#F2A93B' },
              { key: 'KHEL 3', name: 'KHEL 3', color: '#3F8F5F' },
              { key: 'Govt Schools', name: 'Govt Schools', color: '#9095ae' },
            ]}
            height={220}
          />
        </div>

        {/* Holistic Health Index */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title" style={{ margin: 0 }}>Holistic Health Index</h2>
          </div>
          <div className="flex items-center justify-around" style={{ flexWrap: 'wrap', gap: 'var(--space-4)' }}>
            <div style={{ textAlign: 'center' }}>
              <DonutChart
                data={[{ name: 'Score', value: metrics.avgAcademicScore }, { name: 'Gap', value: 100 - metrics.avgAcademicScore }]}
                colors={['#1E3A5F', '#f0f1f5']}
                total={`${metrics.avgAcademicScore}%`}
                totalLabel="Academic"
                size={130}
              />
            </div>
            <div style={{ textAlign: 'center' }}>
              <DonutChart
                data={[{ name: 'Score', value: metrics.avgSELIndex }, { name: 'Gap', value: 100 - metrics.avgSELIndex }]}
                colors={['#3F8F5F', '#f0f1f5']}
                total={`${metrics.avgSELIndex}%`}
                totalLabel="SEL Index"
                size={130}
              />
            </div>
            <div style={{ textAlign: 'center' }}>
              <DonutChart
                data={[{ name: 'Score', value: metrics.healthCoverage }, { name: 'Gap', value: 100 - metrics.healthCoverage }]}
                colors={['#F2A93B', '#f0f1f5']}
                total={`${metrics.healthCoverage}%`}
                totalLabel="Health"
                size={130}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid-2">
        {/* Alerts */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title" style={{ margin: 0 }}>Urgent Attention</h2>
            <span className="chip chip-red">{metrics.alerts.filter(a => a.severity === 'high').length} High</span>
          </div>
          <div className="flex flex-col gap-2">
            {metrics.alerts.map(alert => (
              <div key={alert.id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)',
                padding: 'var(--space-3)',
                background: 'var(--slate-50)',
                borderRadius: 'var(--radius-btn)',
                borderLeft: `3px solid ${alertColor[alert.severity]}`,
              }}>
                <AlertTriangle size={14} style={{ color: alertColor[alert.severity], flexShrink: 0 }} />
                <span style={{ fontSize: 13 }}>{alert.text}</span>
                <span className={`chip chip-${alert.severity === 'high' ? 'red' : alert.severity === 'medium' ? 'marigold' : 'green'}`} style={{ marginLeft: 'auto' }}>
                  {alert.severity}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title" style={{ margin: 0 }}>Recent Activity</h2>
          </div>
          <div className="flex flex-col gap-1">
            {metrics.recentActivity.map(act => (
              <div key={act.id} style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 'var(--space-3)',
                padding: 'var(--space-2) 0',
                borderBottom: '1px solid var(--slate-100)',
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 'var(--radius-full)',
                  background: 'var(--ink-indigo-10)', color: 'var(--ink-indigo)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  {activityIcon[act.type]}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: 'var(--slate-700)' }}>{act.text}</div>
                  <div className="label-mono" style={{ fontSize: 10, marginTop: 2 }}>
                    {new Date(act.time).toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })} · {act.by}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
