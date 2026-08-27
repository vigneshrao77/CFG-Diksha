import React, { useEffect, useState } from 'react'
import { MapPin, Users, BarChart2, X, Check } from 'lucide-react'
import DBarChart from '../../components/Charts/BarChart.jsx'
import Modal from '../../components/Modal/Modal.jsx'
import Spinner from '../../components/Loading/Spinner.jsx'
import { getSchools, getAreas, compareSchools } from '../../services/adminService.js'

const statusChip = {
  'Excellent':       'chip chip-green',
  'Progressing':     'chip chip-marigold',
  'Needs Attention': 'chip chip-red',
}

export default function Schools() {
  const [schools, setSchools]       = useState([])
  const [areas, setAreas]           = useState([{ id: 'all', label: 'All Areas' }])
  const [filters, setFilters]       = useState({ area: 'all', type: 'all', dateRange: 'month' })
  const [selected, setSelected]     = useState([])
  const [detailSchool, setDetail]   = useState(null)
  const [compareData, setCompare]   = useState([])
  const [loading, setLoading]       = useState(true)
  const [comparing, setComparing]   = useState(false)

  // Load areas once
  useEffect(() => {
    getAreas().then(a => setAreas(a)).catch(() => {})
  }, [])

  // Load schools on filter change
  useEffect(() => {
    setLoading(true)
    getSchools(filters)
      .then(s => setSchools(s))
      .catch(() => setSchools([]))
      .finally(() => setLoading(false))
  }, [filters])

  function toggleSelect(id) {
    setSelected(sel => sel.includes(id) ? sel.filter(x => x !== id) : [...sel, id])
    setCompare([]) // clear previous compare when selection changes
  }

  async function handleCompare() {
    if (selected.length < 2) return
    setComparing(true)
    try {
      const data = await compareSchools(selected)
      setCompare(data)
    } finally {
      setComparing(false)
    }
  }

  const comparisonChartData = [
    { metric: 'Attendance %',      ...Object.fromEntries(compareData.map(s => [s.name, s.attendanceRate])) },
    { metric: 'Academic Score',    ...Object.fromEntries(compareData.map(s => [s.name, s.avgAcademicScore])) },
    { metric: 'SEL Index',         ...Object.fromEntries(compareData.map(s => [s.name, s.selIndex])) },
    { metric: 'Health Coverage %', ...Object.fromEntries(compareData.map(s => [s.name, s.healthCoverage])) },
  ]

  const COMP_COLORS = ['#1E3A5F', '#F2A93B', '#3F8F5F', '#9095ae', '#C1473A']

  return (
    <div className="page-body">
      <div className="page-header">
        <div>
          <h1 className="page-title">Schools & Centres</h1>
          <p className="page-subtitle">Select a school to deep-dive, or pick multiple to compare</p>
        </div>
        {selected.length >= 2 && (
          <button className="btn btn-primary" onClick={handleCompare} disabled={comparing}>
            <BarChart2 size={15} /> {comparing ? 'Loading…' : `Compare ${selected.length} Schools`}
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="form-group">
          <label className="form-label">Area / District</label>
          <select className="form-control" value={filters.area} onChange={e => { setFilters(f => ({ ...f, area: e.target.value })); setSelected([]); setCompare([]) }}>
            {areas.map(a => <option key={a.id} value={a.id}>{a.label}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Date Range</label>
          <select className="form-control" value={filters.dateRange} onChange={e => setFilters(f => ({ ...f, dateRange: e.target.value }))}>
            <option value="month">Last 1 Month</option>
            <option value="year">Last 1 Year</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Type</label>
          <select className="form-control" value={filters.type} onChange={e => setFilters(f => ({ ...f, type: e.target.value }))}>
            <option value="all">All Types</option>
            <option value="KHEL Centre">KHEL Centres</option>
            <option value="Government School">Government Schools</option>
          </select>
        </div>
        {selected.length > 0 && (
          <div className="form-group" style={{ justifyContent: 'flex-end' }}>
            <label className="form-label">&nbsp;</label>
            <button className="btn btn-ghost btn-sm" onClick={() => { setSelected([]); setCompare([]) }}>
              <X size={13} /> Clear ({selected.length})
            </button>
          </div>
        )}
      </div>

      {/* Comparison Chart */}
      {compareData.length >= 2 && (
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title" style={{ margin: 0 }}>School Comparison</h2>
            <button className="btn btn-ghost btn-sm" onClick={() => { setSelected([]); setCompare([]) }}><X size={13} /> Close</button>
          </div>
          <DBarChart
            data={comparisonChartData} xKey="metric"
            bars={compareData.map((s, i) => ({ key: s.name, name: s.name, color: COMP_COLORS[i % COMP_COLORS.length] }))}
            height={280}
          />
        </div>
      )}

      {/* Schools Grid */}
      {loading ? <Spinner /> : schools.length === 0 ? (
        <div className="empty-state">No schools found for the selected filters.</div>
      ) : (
        <div className="grid-3">
          {schools.map(school => {
            const isSelected = selected.includes(school._id)
            return (
              <div
                key={school._id}
                className={`card card-sm ${isSelected ? 'card-accent-indigo' : ''}`}
                style={{ cursor: 'pointer', outline: isSelected ? '2px solid var(--ink-indigo)' : '2px solid transparent', transition: 'all 0.2s', position: 'relative' }}
                onClick={() => toggleSelect(school._id)}
              >
                {isSelected && (
                  <div style={{ position: 'absolute', top: 10, right: 10, width: 20, height: 20, borderRadius: '50%', background: 'var(--ink-indigo)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Check size={12} color="white" />
                  </div>
                )}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--slate-900)' }}>{school.name}</div>
                    <div className="flex items-center gap-1 mt-1">
                      <MapPin size={11} style={{ color: 'var(--slate-400)' }} />
                      <span style={{ fontSize: 11, color: 'var(--slate-500)' }}>{school.area}, {school.district}</span>
                    </div>
                  </div>
                  <span className={statusChip[school.status] || 'chip chip-slate'}>{school.status}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                  <Metric label="Attendance" value={`${school.attendanceRate}%`} good={school.attendanceRate >= 80} />
                  <Metric label="Academic"   value={`${school.avgAcademicScore}%`} good={school.avgAcademicScore >= 70} />
                  <Metric label="SEL Index"  value={`${school.selIndex}%`} good={school.selIndex >= 65} />
                  <Metric label="Health Cov." value={`${school.healthCoverage}%`} good={school.healthCoverage >= 80} />
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-1" style={{ fontSize: 12, color: 'var(--slate-500)' }}>
                    <Users size={12} /> {school.students} students
                  </div>
                  <button className="btn btn-secondary btn-sm" onClick={e => { e.stopPropagation(); setDetail(school) }}>
                    View Details
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Detail Modal */}
      {detailSchool && (
        <Modal open={!!detailSchool} onClose={() => setDetail(null)} title={detailSchool.name} size="lg"
          footer={<button className="btn btn-primary" onClick={() => setDetail(null)}>Close</button>}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
            <InfoRow label="Type" value={detailSchool.type} />
            <InfoRow label="Area" value={`${detailSchool.area}, ${detailSchool.district}`} />
            <InfoRow label="Centre Head" value={detailSchool.head} />
            <InfoRow label="Established" value={detailSchool.established} />
            <InfoRow label="Students" value={`${detailSchool.students} / ${detailSchool.capacity}`} />
          </div>
          <div className="divider" />
          <h3 className="section-title">Performance Metrics</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            {[
              { label: 'Attendance Rate', value: detailSchool.attendanceRate, good: detailSchool.attendanceRate >= 80 },
              { label: 'Academic Score', value: detailSchool.avgAcademicScore, good: detailSchool.avgAcademicScore >= 70 },
              { label: 'SEL Index', value: detailSchool.selIndex, good: detailSchool.selIndex >= 65 },
              { label: 'Health Coverage', value: detailSchool.healthCoverage, good: detailSchool.healthCoverage >= 80 },
            ].map(m => (
              <div key={m.label} style={{ background: 'var(--slate-50)', borderRadius: 'var(--radius-btn)', padding: 'var(--space-3)' }}>
                <div className="form-label mb-2">{m.label}</div>
                <div className="display-num" style={{ fontSize: 28, color: m.good ? 'var(--banyan-green)' : 'var(--kumkum-red)' }}>{m.value}%</div>
                <div className="progress-bar mt-2">
                  <div className="progress-fill" style={{ width: `${m.value}%`, background: m.good ? 'var(--banyan-green)' : 'var(--kumkum-red)' }} />
                </div>
              </div>
            ))}
          </div>
          <div className="divider" />
          <h3 className="section-title">Active Programs</h3>
          <div className="flex gap-2 flex-wrap">
            {detailSchool.programs?.map(p => <span key={p} className="chip chip-indigo">{p}</span>)}
          </div>
        </Modal>
      )}
    </div>
  )
}

function Metric({ label, value, good }) {
  return (
    <div>
      <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--slate-400)', marginBottom: 2 }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-serif)', fontSize: 18, fontWeight: 700, color: good ? 'var(--banyan-green)' : 'var(--kumkum-red)' }}>{value}</div>
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div>
      <div className="form-label mb-1">{label}</div>
      <div style={{ fontSize: 14, color: 'var(--slate-700)' }}>{value}</div>
    </div>
  )
}
