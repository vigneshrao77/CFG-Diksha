import React, { useEffect, useState } from 'react'
import { Users, TrendingUp, CheckCircle } from 'lucide-react'
import DonutChart from '../../components/Charts/DonutChart.jsx'
import DLineChart from '../../components/Charts/LineChart.jsx'
import Spinner from '../../components/Loading/Spinner.jsx'
import { getPrograms, getSchools } from '../../services/adminService.js'

const COHORT_OPTIONS = [
  { id: 'all', label: 'All Cohorts' },
  { id: 'age-6-10',  label: 'Age 6–10' },
  { id: 'age-11-14', label: 'Age 11–14' },
  { id: 'age-15-18', label: 'Age 15–18' },
  { id: '2024-25',   label: 'Batch 2024-25' },
  { id: '2025-26',   label: 'Batch 2025-26' },
]

export default function Programs() {
  const [programs, setPrograms]     = useState([])
  const [schools, setSchools]       = useState([])
  const [filters, setFilters]       = useState({ centre: 'all', dateRange: 'month', cohort: 'all' })
  const [expanded, setExpanded]     = useState(null)
  const [loading, setLoading]       = useState(true)

  // Load schools for the centre filter
  useEffect(() => {
    getSchools().then(s => setSchools(s)).catch(() => {})
  }, [])

  // Load programs on filter change
  useEffect(() => {
    setLoading(true)
    getPrograms(filters)
      .then(p => setPrograms(p))
      .catch(() => setPrograms([]))
      .finally(() => setLoading(false))
  }, [filters])

  const centreOptions = [
    { _id: 'all', name: 'All Centres' },
    ...schools,
  ]

  return (
    <div className="page-body">
      <div className="page-header">
        <div>
          <h1 className="page-title">Programs</h1>
          <p className="page-subtitle">Track all Diksha program outcomes, enrollment, and cohort participation</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="form-group">
          <label className="form-label">Centre / Site</label>
          <select className="form-control" value={filters.centre} onChange={e => setFilters(f => ({ ...f, centre: e.target.value }))}>
            {centreOptions.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Date Range</label>
          <select className="form-control" value={filters.dateRange} onChange={e => setFilters(f => ({ ...f, dateRange: e.target.value }))}>
            <option value="month">Last 1 Month</option>
            <option value="quarter">Last Quarter</option>
            <option value="year">Last 1 Year</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Cohort / Batch</label>
          <select className="form-control" value={filters.cohort} onChange={e => setFilters(f => ({ ...f, cohort: e.target.value }))}>
            {COHORT_OPTIONS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </div>
      </div>

      {loading ? <Spinner /> : programs.length === 0 ? (
        <div className="empty-state">No programs found.</div>
      ) : (
        <div className="flex flex-col gap-4">
          {programs.map(prog => {
            const isOpen = expanded === prog._id
            return (
              <div key={prog._id} className="card" style={{ borderLeft: `4px solid ${prog.color}` }}>
                <div className="flex items-center justify-between" style={{ cursor: 'pointer' }} onClick={() => setExpanded(isOpen ? null : prog._id)}>
                  <div className="flex items-center gap-3">
                    <span style={{ fontSize: 28 }}>{prog.icon}</span>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--slate-900)' }}>{prog.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--slate-500)', marginTop: 2 }}>{prog.description?.slice(0, 80)}…</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <ProgramStat label="Enrolled"   value={prog.enrollment}            icon={<Users size={12} />} />
                    <ProgramStat label="Completion" value={`${prog.completion}%`}       icon={<CheckCircle size={12} />} color={prog.completion >= 75 ? 'var(--banyan-green)' : 'var(--marigold)'} />
                    <ProgramStat label="Centres"    value={prog.centers?.length || 0}   icon={<TrendingUp size={12} />} />
                    <span style={{ color: 'var(--slate-400)', fontSize: 18 }}>{isOpen ? '▲' : '▼'}</span>
                  </div>
                </div>

                {isOpen && (
                  <div style={{ marginTop: 'var(--space-6)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--slate-200)' }}>
                    <div className="grid-2" style={{ gap: 'var(--space-6)' }}>
                      <div>
                        <h3 className="section-title">Cohort Breakdown</h3>
                        <div className="flex items-center gap-4" style={{ flexWrap: 'wrap' }}>
                          <DonutChart
                            data={prog.cohortBreakdown || []}
                            colors={['#1E3A5F', '#F2A93B', '#3F8F5F']}
                            total={prog.enrollment}
                            totalLabel="students"
                            size={150}
                          />
                          <div className="flex flex-col gap-2">
                            {(prog.cohortBreakdown || []).map((c, i) => (
                              <div key={c.name} className="flex items-center gap-2">
                                <div style={{ width: 10, height: 10, borderRadius: 2, background: ['#1E3A5F','#F2A93B','#3F8F5F'][i] }} />
                                <span style={{ fontSize: 13, color: 'var(--slate-600)' }}>{c.name}</span>
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, marginLeft: 'auto', color: 'var(--slate-700)' }}>{c.value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div>
                        <h3 className="section-title">Monthly Attendance Trend</h3>
                        <DLineChart
                          data={prog.monthlyAttendance || []}
                          xKey="month"
                          lines={[{ key: 'value', name: prog.name, color: prog.color }]}
                          height={160}
                        />
                      </div>
                    </div>
                    <div style={{ marginTop: 'var(--space-4)' }}>
                      <div className="flex items-center justify-between mb-2">
                        <span style={{ fontSize: 13, color: 'var(--slate-600)', fontWeight: 600 }}>Annual Target Completion</span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>{prog.completion}%</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${prog.completion}%`, background: prog.color }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function ProgramStat({ label, value, icon, color }) {
  return (
    <div style={{ textAlign: 'center', minWidth: 70 }}>
      <div style={{ fontSize: 11, color: 'var(--slate-400)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
        {icon} {label}
      </div>
      <div style={{ fontFamily: 'var(--font-serif)', fontSize: 20, fontWeight: 700, color: color || 'var(--ink-indigo)', marginTop: 2 }}>{value}</div>
    </div>
  )
}
