import React, { useEffect, useState } from 'react'
import DLineChart from '../../components/Charts/LineChart.jsx'
import DBarChart from '../../components/Charts/BarChart.jsx'
import DRadarChart from '../../components/Charts/RadarChart.jsx'
import DonutChart from '../../components/Charts/DonutChart.jsx'
import Spinner from '../../components/Loading/Spinner.jsx'
import {
  getAttendanceTrend, getSELAnalytics,
  getAcademicAnalytics, getHealthAnalytics,
} from '../../services/adminService.js'

const PROGRAMS = [
  { id: 'all',        label: 'All Programs' },
  { id: 'sel',        label: 'SEL' },
  { id: 'academics',  label: 'Academics' },
  { id: 'arts',       label: 'Arts' },
  { id: 'lifeskills', label: 'Life Skills' },
  { id: 'science',    label: 'Science & Digital' },
]

const COHORTS = [
  { id: 'all',        label: 'All Cohorts' },
  { id: 'age-6-10',  label: 'Age 6–10' },
  { id: 'age-11-14', label: 'Age 11–14' },
  { id: 'age-15-18', label: 'Age 15–18' },
  { id: '2024-25',   label: 'Batch 2024-25' },
  { id: '2025-26',   label: 'Batch 2025-26' },
]

export default function Analytics() {
  const [activeTab, setActiveTab]   = useState('academic')
  const [filters, setFilters]       = useState({ program: 'all', dateRange: 'monthly', cohort: 'all' })
  const [trend, setTrend]           = useState([])
  const [sel, setSel]               = useState(null)
  const [academic, setAcademic]     = useState(null)
  const [health, setHealth]         = useState(null)
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      getAttendanceTrend(filters.dateRange),
      getSELAnalytics(),
      getAcademicAnalytics(),
      getHealthAnalytics(),
    ]).then(([t, s, a, h]) => {
      setTrend(t)
      setSel(s)
      setAcademic(a)
      setHealth(h)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [filters.dateRange])

  return (
    <div className="page-body">
      <div className="page-header">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-subtitle">Holistic analysis — Academic, SEL/EQ, and Health metrics</p>
        </div>
      </div>

      {/* Sticky Filter Bar */}
      <div className="filter-bar" style={{ position: 'sticky', top: 60, zIndex: 40 }}>
        <div className="form-group">
          <label className="form-label">Program</label>
          <select className="form-control" value={filters.program} onChange={e => setFilters(f => ({ ...f, program: e.target.value }))}>
            {PROGRAMS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Date Range</label>
          <select className="form-control" value={filters.dateRange} onChange={e => setFilters(f => ({ ...f, dateRange: e.target.value }))}>
            <option value="monthly">Monthly</option>
            <option value="annual">Annual</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Cohort / Batch</label>
          <select className="form-control" value={filters.cohort} onChange={e => setFilters(f => ({ ...f, cohort: e.target.value }))}>
            {COHORTS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {[
          { id: 'academic',   label: '📚 Academic' },
          { id: 'sel',        label: '🌱 SEL / EQ' },
          { id: 'health',     label: '🏥 Health' },
          { id: 'attendance', label: '📅 Attendance' },
        ].map(t => (
          <button key={t.id} className={`tab-btn ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? <Spinner /> : (
        <>
          {/* ── ACADEMIC TAB ── */}
          {activeTab === 'academic' && academic && (
            <div className="flex flex-col gap-6">
              <div className="card">
                <h2 className="section-title">Baseline vs Endline Assessment</h2>
                <DBarChart data={academic.baselineVsEndline || []} xKey="school"
                  bars={[{ key: 'baseline', name: 'Baseline', color: '#9095ae' }, { key: 'endline', name: 'Endline', color: '#1E3A5F' }]}
                  height={280}
                />
              </div>
              <div className="card">
                <h2 className="section-title">Subject-wise Score Breakdown (KHEL Centres)</h2>
                <DBarChart data={academic.subjectBreakdown || []} xKey="subject"
                  bars={[
                    { key: 'KHEL 1', name: 'KHEL Centre 1', color: '#1E3A5F' },
                    { key: 'KHEL 2', name: 'KHEL Centre 2', color: '#F2A93B' },
                    { key: 'KHEL 3', name: 'KHEL Centre 3', color: '#3F8F5F' },
                  ]}
                  height={260}
                />
              </div>
            </div>
          )}

          {/* ── SEL TAB ── */}
          {activeTab === 'sel' && sel && (
            <div className="flex flex-col gap-6">
              <div className="grid-2">
                <div className="card">
                  <h2 className="section-title">SEL Competency Radar</h2>
                  <DRadarChart
                    data={sel.competencies || []}
                    series={[
                      { key: 'KHEL 1', name: 'KHEL 1', color: '#1E3A5F' },
                      { key: 'KHEL 2', name: 'KHEL 2', color: '#F2A93B' },
                      { key: 'KHEL 3', name: 'KHEL 3', color: '#3F8F5F' },
                      { key: 'Govt Schools', name: 'Govt Schools', color: '#9095ae' },
                    ]}
                    height={320}
                  />
                </div>
                <div className="card">
                  <h2 className="section-title">SEL Growth — Baseline to Endline</h2>
                  <DLineChart
                    data={sel.trend || []}
                    xKey="month"
                    lines={[
                      { key: 'KHEL 1', name: 'KHEL 1', color: '#1E3A5F' },
                      { key: 'KHEL 2', name: 'KHEL 2', color: '#F2A93B' },
                      { key: 'KHEL 3', name: 'KHEL 3', color: '#3F8F5F' },
                    ]}
                    height={280}
                  />
                </div>
              </div>
              <div className="card">
                <h2 className="section-title">SEL Competency Breakdown</h2>
                <DBarChart data={sel.competencies || []} xKey="subject"
                  bars={[
                    { key: 'KHEL 1', name: 'KHEL 1', color: '#1E3A5F' },
                    { key: 'KHEL 2', name: 'KHEL 2', color: '#F2A93B' },
                    { key: 'KHEL 3', name: 'KHEL 3', color: '#3F8F5F' },
                    { key: 'Govt Schools', name: 'Govt Schools', color: '#9095ae' },
                  ]}
                  height={260}
                />
              </div>
            </div>
          )}

          {/* ── HEALTH TAB ── */}
          {activeTab === 'health' && health && (
            <div className="flex flex-col gap-6">
              <div className="grid-2">
                <div className="card">
                  <h2 className="section-title">Health Screening Coverage</h2>
                  <DBarChart data={health.screeningCoverage || []} xKey="school"
                    bars={[{ key: 'coverage', name: 'Coverage %', color: '#3F8F5F' }]}
                    height={260}
                  />
                </div>
                <div className="card">
                  <h2 className="section-title">BMI Distribution</h2>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    <DonutChart
                      data={health.bmiDistribution || []}
                      colors={['#3F8F5F', '#F2A93B', '#C1473A']}
                      total={(health.bmiDistribution || []).reduce((s, x) => s + x.value, 0)}
                      totalLabel="students"
                      size={180}
                    />
                    <div className="flex gap-4 flex-wrap" style={{ justifyContent: 'center' }}>
                      {(health.bmiDistribution || []).map((b, i) => (
                        <div key={b.name} className="flex items-center gap-2">
                          <div style={{ width: 10, height: 10, borderRadius: 2, background: ['#3F8F5F','#F2A93B','#C1473A'][i] }} />
                          <span style={{ fontSize: 13 }}>{b.name}</span>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--slate-600)' }}>{b.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="card">
                <h2 className="section-title">Dietary Support Trend</h2>
                <DLineChart
                  data={health.dietarySupport || []}
                  xKey="month"
                  lines={[{ key: 'students', name: 'Students with Support', color: '#3F8F5F' }]}
                  height={220}
                />
              </div>
            </div>
          )}

          {/* ── ATTENDANCE TAB ── */}
          {activeTab === 'attendance' && (
            <div className="flex flex-col gap-6">
              <div className="card">
                <h2 className="section-title">Attendance Trend — All Sites</h2>
                <DLineChart
                  data={trend}
                  xKey="month"
                  lines={[
                    { key: 'KHEL 1', name: 'KHEL Centre 1', color: '#1E3A5F' },
                    { key: 'KHEL 2', name: 'KHEL Centre 2', color: '#F2A93B' },
                    { key: 'KHEL 3', name: 'KHEL Centre 3', color: '#3F8F5F' },
                    { key: 'Govt Schools', name: 'Govt Schools Avg', color: '#9095ae' },
                  ]}
                  height={300}
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
